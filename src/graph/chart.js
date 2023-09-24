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

// https://tobyzerner.github.io/placement.js/dist/index.js
var placement=function(){"use strict";var e={size:["height","width"],clientSize:["clientHeight","clientWidth"],offsetSize:["offsetHeight","offsetWidth"],maxSize:["maxHeight","maxWidth"],before:["top","left"],marginBefore:["marginTop","marginLeft"],after:["bottom","right"],marginAfter:["marginBottom","marginRight"],scrollOffset:["pageYOffset","pageXOffset"]};function t(e){return{top:e.top,bottom:e.bottom,left:e.left,right:e.right}}return function(o,r,f,a,i){void 0===f&&(f="bottom"),void 0===a&&(a="center"),void 0===i&&(i={}),(r instanceof Element||r instanceof Range)&&(r=t(r.getBoundingClientRect()));var n=Object.assign({top:r.bottom,bottom:r.top,left:r.right,right:r.left},r),s={top:0,left:0,bottom:window.innerHeight,right:window.innerWidth};i.bound&&((i.bound instanceof Element||i.bound instanceof Range)&&(i.bound=t(i.bound.getBoundingClientRect())),Object.assign(s,i.bound));var l=getComputedStyle(o),m={},b={};for(var g in e)m[g]=e[g]["top"===f||"bottom"===f?0:1],b[g]=e[g]["top"===f||"bottom"===f?1:0];o.style.position="absolute",o.style.maxWidth="",o.style.maxHeight="";var d=parseInt(l[b.marginBefore]),c=parseInt(l[b.marginAfter]),u=d+c,p=s[b.after]-s[b.before]-u,h=parseInt(l[b.maxSize]);(!h||p<h)&&(o.style[b.maxSize]=p+"px");var x=parseInt(l[m.marginBefore])+parseInt(l[m.marginAfter]),y=n[m.before]-s[m.before]-x,z=s[m.after]-n[m.after]-x;(f===m.before&&o[m.offsetSize]>y||f===m.after&&o[m.offsetSize]>z)&&(f=y>z?m.before:m.after);var S=f===m.before?y:z,v=parseInt(l[m.maxSize]);(!v||S<v)&&(o.style[m.maxSize]=S+"px");var w=window[m.scrollOffset],O=function(e){return Math.max(s[m.before],Math.min(e,s[m.after]-o[m.offsetSize]-x))};f===m.before?(o.style[m.before]=w+O(n[m.before]-o[m.offsetSize]-x)+"px",o.style[m.after]="auto"):(o.style[m.before]=w+O(n[m.after])+"px",o.style[m.after]="auto");var B=window[b.scrollOffset],I=function(e){return Math.max(s[b.before],Math.min(e,s[b.after]-o[b.offsetSize]-u))};switch(a){case"start":o.style[b.before]=B+I(n[b.before]-d)+"px",o.style[b.after]="auto";break;case"end":o.style[b.before]="auto",o.style[b.after]=B+I(document.documentElement[b.clientSize]-n[b.after]-c)+"px";break;default:var H=n[b.after]-n[b.before];o.style[b.before]=B+I(n[b.before]+H/2-o[b.offsetSize]/2-d)+"px",o.style[b.after]="auto"}o.dataset.side=f,o.dataset.align=a}}();

let uplot;

function tooltipPlugin(opts) {
    let over, bound, bLeft, bTop;

    function syncBounds() {
        let bbox = over.getBoundingClientRect();
        bLeft = bbox.left;
        bTop = bbox.top;
    }

    const overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.style.display = "none";
    overlay.style.position = "absolute";
    document.body.appendChild(overlay);

    return {
        hooks: {
            init: u => {
                over = u.over;

                bound = over;
            //	bound = document.body;

                over.onmouseenter = () => {
                    overlay.style.display = "block";
                };

                over.onmouseleave = () => {
                    overlay.style.display = "none";
                };
            },
            setSize: u => {
                syncBounds();
            },
            setCursor: u => {
                const { left, top, idx } = u.cursor;
                const anchor = { left: left + bLeft, top: top + bTop };
                let str = []
                u.data.forEach((entry,seriesIndex) => {
                    const value = entry[idx];
                    const name = u.series[seriesIndex].label
                    str.push(`${name} : ${Math.round(value * 100)/100}`);
                })
                overlay.innerHTML = str.join("<br/>");
                placement(overlay, anchor, "right", "start", { bound });
            }
        }
    };
}
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
            plugins: [
                tooltipPlugin(),
            ],
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