const colors = [
    "green", "blue", "red", "orange", "purple", "cadetblue"
]

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

let uplot;

function prepData(parsedData) {
    console.time("chart");
    const drawData = [parsedData.x.data];
    const seriesData = [{}];
    let progress = 0;

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

    if (!uplot) {
        uplot = new uPlot(opts, drawData, document.body);
    } else {
        uplot.setData(drawData);
    }

    wait.textContent = "Done!";
    console.timeEnd("chart");
}

let wait = document.getElementById("wait");

wait.textContent = "Fetching data ...";
function update() {
    fetch(dataSource)
        .then(r => r.json())
        .then(parsedObject => {
            wait.textContent = "Rendering ...";
            setTimeout(() => prepData(parsedObject), 5);
        });
}

setInterval(update, 100);