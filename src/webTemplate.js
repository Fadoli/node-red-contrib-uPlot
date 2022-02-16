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
        ${nodeList.map(element => '<li><a href="./' + element.id + '/graph">' + (element.name || element.id) + '</a></li>')}
</ul>
</body>
</html>`
}

module.exports = {
    displayList: displayNodeFrontList,
    baseGraph: (title, dataSource) => {
        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <script>
        var dataSource = "${dataSource}";
    </script>
    <link rel="stylesheet" href="../uPlot.min.css">
    <script src="../uPlot.min.js"></script>
    <h2 id="wait">Loading lib....</h2>
    <script src="../chart.js"></script>
</body>
</html>`
    }
}