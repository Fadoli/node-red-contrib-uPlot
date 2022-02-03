const fs = require("fs");
const path = require("path");

module.exports = function(RED) {
    
    function getMyExternalPath(fname) {
        return path.join(__dirname, 'external', fname)
    }
    const uplot = {
        js: fs.readFileSync(getMyExternalPath('uPlot.min.js')),
        css: fs.readFileSync(getMyExternalPath('uPlot.min.css'))
    };

    function getMyGraphPath(fname) {
        return path.join(__dirname, 'graph', fname)
    }
    const graphTypes = {
        simpleChart: fs.readFileSync(getMyGraphPath('chart.js')),
    }

    function fillRequest (req,res) {
        if (req.param.subPath === 'uPlot.min.js') {
            return res.send(uplot.js);
        } else if (req.param.subPath === 'uPlot.min.css') {
            return res.send(uplot.css);
        } else if (req.param.subPath === 'chart.js') {
            return res.send(graphTypes.simpleChart);
        } else {
            return res.status(404).send("Not found");
        }
    }
    function getDataFromNode (req,res) {
        try {
            const mynode = RED.nodes.getNode(req.param.nodeid);
            res.send(JSON.stringify(mynode.getData()));
        } catch (e) {
            return res.status(500).send(e.message);
        }
    }

    RED.httpNode.get('/fadoli/:subPath',fillRequest,this.errorHandler);
    RED.httpNode.get('/fadoli/data/:nodeid',getDataFromNode,this.errorHandler);

    function defineNode(config) {
        RED.nodes.createNode(this, config);
        const nbElem = 1 * (config.size || '100');
        const node = this;

        /**
         * This is a map for each numerical value in the payload, we will have a statsArray object
         * @type {Object.<string,Array<number>>}
         */
        const elements = {};

        node.getData = function () {
            return elements;
        }

        function handleValue(key, value) {
            if (!elements[key]) {
                elements[key] = [];
            }
            if (elements[key].length > 2 * nbElem) {
                const dif = elements[key].length - nbElem;
                elements[key] = elements[key].slice(dif)
            }
            return elements[key].push(value);
        }
        function handleObject(obj, prefix = '') {
            const keys = Object.keys(obj);
            keys.forEach((key) => {
                const completeKey = `${prefix}${key}`
                const value = obj[key];
                if (typeof value === 'number') {
                    obj[key] = handleValue(completeKey, value);
                } else if (typeof value === 'object') {
                    handleObject(obj[key], `${completeKey}.`);
                }
            })
            return;
        }

        node.on('input', (msg, send, done) => {
            try {
                if (typeof msg.payload === "object") {
                    handleObject(msg.payload);
                } else if (typeof msg.payload === "number") {
                    msg.payload = handleValue("payload", msg.payload);
                }
                send(msg);
                done();
            } catch (e) {
                done(e);
            }
        })
    }
    RED.nodes.registerType("uPlot",defineNode);
}
