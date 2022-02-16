const colors = [
    "green", "blue", "red", "orange", "purple", "cadetblue"
]
/*
const parsedData = {
    title: 'Myname',
    width: 1024,
    height: 768,
    x: {
        isDate: true,
        data: [101, 102, 103]
    },
    data: {
        "Variable1": [
            3, 2, 1
        ],
        "Variable2": [
            1, 2, 3
        ],
    }
}
*/
let uplot;

function prepData(parsedData) {
    const drawData = [parsedData.x.data];

    if (!uplot) {
        let progress = 0;
        const seriesData = [{}];
        Object.keys(parsedData.data).forEach((key) => {
            seriesData.push({
                label: key,
                stroke: colors[(progress++) % colors.length]
            })
            drawData.push(parsedData.data[key]);
        })
        const opts = {
            title: parsedData.title,
            width: parsedData.width,
            height: parsedData.height,
            series: seriesData,
            scales: {
                "x": {
                    time: parsedData.x?.isDate || true,
                }
            },
        }
        uplot = new uPlot(opts, drawData, document.body);
    } else {
        Object.keys(parsedData.data).forEach((key) => {
            drawData.push(parsedData.data[key]);
        })
        uplot.setData(drawData);
    }
}

function update() {
    fetch(dataSource)
        .then(r => r.json())
        .then(parsedObject => {
            setTimeout(() => prepData(parsedObject), 5);
        });
}

setInterval(update, 50);