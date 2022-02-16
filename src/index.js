const fs = require("fs");
const path = require("path");
const webtemplate = require("./webTemplate");

module.exports = function (RED) {
    const nodeList = {};

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

    function nodeSelection(req, res) {
        if (Object.keys(nodeList).length === 0) {
            return res.status(404).send("No node found");
        } else {
            res.setHeader('content-type', 'text/html');
            return res.send(webtemplate.displayList(Object.values(nodeList)));
        }
    }
    function fillGraphRequest(req, res) {
        res.setHeader('content-type', 'text/html');
        if (req.params.type === 'data') {
            try {
                const mynode = RED.nodes.getNode(req.params.id);
                return res.send(JSON.stringify(mynode.getData()));
            } catch (e) {
                return res.status(500).send(e.message);
            }
        }
        // graph type should be `req.params.type`
        return res.send(webtemplate.baseGraph('my graph', `./data`));
    }

    function fillRequest(req, res) {
        if (req.params.subPath === 'uPlot.min.js') {
            res.setHeader('content-type', 'text/javascript');
            return res.send(uplot.js);
        } else if (req.params.subPath === 'uPlot.min.css') {
            res.setHeader('content-type', 'text/css');
            return res.send(uplot.css);
        } else if (req.params.subPath === 'chart.js') {
            res.setHeader('content-type', 'text/javascript');
            return res.send(graphTypes.simpleChart);
        } else {
            return res.status(404).send("Not found");
        }
    }

    RED.httpNode.get('/fadoli/', nodeSelection);
    RED.httpNode.get('/fadoli/:subPath', fillRequest);
    RED.httpNode.get('/fadoli/:id/:type', fillGraphRequest);

    function defineNode(config) {
        const node = this;
        RED.nodes.createNode(node, config);
        nodeList[node.id] = node;
        const nbElem = 1 * (config.size || '100');

        /**
         * This is a map for each numerical value in the payload, we will have a statsArray object
         * @type {Object.<string,Array<number>>}
         */
        const elements = {};

        node.getData = function () {
            const keys = Object.keys(elements);
            const len = elements.x.length;
            const sliceStart = Math.max(0, len - nbElem);

            const base = {
                title: node.name || node.id,
                width: 1024,
                height: 768,
                x: {
                    isDate: true,
                    data: elements.x.slice(sliceStart)
                },
                data: {

                }
            }
            keys.forEach((key) => {
                if (key === 'x') {
                    return;
                }
                base.data[key] = elements[key].slice(sliceStart);
            })
            return base;
        }

        /**
         * @description Handle a value
         * @param {string} key
         * @param {number} value
         * @returns {Array<number>}
         */
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
        /**
         * @description Handle an object
         * @param {Object} obj
         * @param {string} [prefix='']
         */
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
                handleValue("x", Date.now()/1000);
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
        node.on('close', (done) => {
            delete nodeList[node.id];
            done();
        })
    }
    RED.nodes.registerType("uPlot", defineNode);
}
