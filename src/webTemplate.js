/**
 * @param {Array<Object>} nodeList
 * @return {string} html web page
 */
function displayNodeFrontList(nodeList) {
    return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Graph lister</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<ul>
        ${nodeList.map(element => '<li><a href="./' + element.id + '/graph">' + (element.name || element.id) + '</a></li>').join('')}
</ul>
</body>
</html>`
}

module.exports = {
    displayList: displayNodeFrontList,
    baseGraph: (node) => {
        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${node.name || node.id}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        #overlay {
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            padding: 0.5rem;
            margin: 0.75rem;
            color: #fff;
            z-index: 10;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <script>
        var dataSource = "./data";
    </script>
    <link rel="stylesheet" href="../uPlot.min.css">
    <script src="../uPlot.min.js"></script>
    <script src="../chart.js"></script>
</body>
</html>`
    }
}