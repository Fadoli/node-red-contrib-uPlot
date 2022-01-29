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
        RED.nodes.createNode(this,config);
        const nbElem = 1 * (config.size || '10');
        const node = this;

        /**
         * This is a map for each numerical value in the payload, we will have a statsArray object
         * @type {Object.<string,statsArray>}
         */
        const elements = {};
        node.on('input', (msg,send,done) => {
            const keys = Object.keys(msg.payload);
            const result = {};
            keys.forEach((key) => {
                const value = msg.payload[key];
                if (typeof value === 'number') {
                    if (!elements[key]) {
                        elements[key] = new statsArray(nbElem);
                    }
                    elements[key].append(value);
                    result[key] = elements[key].getStats();
                } else {
                    result[key] = value;
                }
            })
            msg.payload = result;
            send(msg);
            done();
        })

        node.getData = function () {

        }
    }
    RED.nodes.registerType("fast_stats",defineNode);
}
