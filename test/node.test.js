const helper = require('node-red-node-test-helper');
const test = require("zora").test;

const node = require('../src/index');

const testFlow = [
    { "id": "test_node", "type": "uPlot", "size": "10", "wires": [["helper_node"]] },
    { "id": "helper_node", "type": "helper"},
];

test("uPlot", async (t) => {
    await t.test('Should properly load', async function (t) {
        await helper.load(node, testFlow, {});

        // Do some tests
        t.deepEqual(!!helper.getNode('test_node'), true);

        await helper.unload();
    });
});