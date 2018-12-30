function appendAndTransG(parent, trans,cl){
    return parent.append('g')
        .attrs({
            "transform": trans,
            'class': cl
        });
}

function formatAbbreviation(x) {
  const s = formatSi(x);
  switch (s[s.length - 1]) {
    case "G": return s.slice(0, -1) + "B";
    case "k": return s.slice(0, -1) + "K";
  }
  return s;
}

function filterCoinStats(data, timeVals){
    let coinName = Object.keys(data)[0]
    let sliderFilteredData = data[coinName].filter(function(d) {
        return ((d.date >= timeVals[0]) && (d.date <= timeVals[1]))
    })

    return { coinName, sliderFilteredData }
}

// Fix for y-axis format values
const formatSi = d3.format(".2s");
const formatDollar = d3.format("$,");

let yAxisObj = d3.axisLeft()
let xAxisObj = d3.axisBottom().ticks(4);
let dataFiltered, xAxisG, yAxisG, gObj, svgObj, linePath, focus, margin = { left:50, right:20, top:50, bottom:20 };
const t = function() { return d3.transition().duration(400); }
const bisectDate = d3.bisector(function(d) { return d.date; }).left;
// Filter data based on selections
const height = 250, 
      width = 300, 
      heightLM = height - margin.top - margin.bottom,
      widthLM = width - margin.left - margin.right;

// LineChart = function(_parentElement, coinData){

//     this.initVis(_parentElement, coinData);
// };

const initVis = function(parent, coinData){
    let thisCoinName = Object.keys(coinData)[0]

    svgObj = d3.select(parent)
        .append("svg")
        .attrs({
            "width": width,
            "height": height,
            'class': `${thisCoinName}SvgWrapper svgWrapper`
        });

    thisGObj = appendAndTransG(svgObj, `translate(${margin.left},${margin.top})`, `gWrapper ${thisCoinName}`);

    thisGObj.append("text")
        .attrs({
            "x": widthLM/2,
            "y": 0,
            "text-anchor": "middle"
        })
        .text(Object.keys(coinData))

    state.xScales[thisCoinName].range([0, widthLM]);
    state.yScales[thisCoinName].range([heightLM, 0]);

    xAxisG = appendAndTransG(thisGObj, `translate(0,${heightLM})`, `${thisCoinName}xAxisG x axis`);
    yAxisG = appendAndTransG(thisGObj, null, `${thisCoinName}yAxisG y axis`);
        
    updateVis(coinData);
};

const updateVis = function(coinData, sliderTimeVals){

    if(state.yVariable == null){
        state.yVariable = $("#measurement-select").val()
    }

    let timeVals = (!sliderTimeVals) ? [1368331200000, 1509422400000] : sliderTimeVals;

    let { coinName, sliderFilteredData } = filterCoinStats(coinData, timeVals)

    var vis = this;

    // Update scales
    state.xScales[coinName].domain(d3.extent(sliderFilteredData, d => d.date));
    
    state.yScales[coinName].domain([d3.min(sliderFilteredData, d => d[state.yVariable]) / 1.005, 
        d3.max(sliderFilteredData, d => d[state.yVariable]) * 1.005]);

    // Update axes
    let thisXAxisG = d3.select(`.${coinName}xAxisG`),
        thisYAxisG = d3.select(`.${coinName}yAxisG`);
    xAxisObj.scale(state.xScales[coinName]);
    yAxisObj.scale(state.yScales[coinName]);
    thisXAxisG.transition(t()).call(xAxisObj);
    thisYAxisG.transition(t()).call(yAxisObj.tickFormat(formatAbbreviation));

    // Discard old tooltip elements
    

    let thisGObj = d3.select(`g.${coinName}`)
    thisGObj.selectAll(`path`).remove()
    thisGObj.selectAll(`.focus${coinName}`).remove()
    d3.select(`.${coinName}ovly`).remove();

    const line = d3.line()
        .x(function(d) { return state.xScales[coinName](d.date); })
        .y(function(d) { 
        return state.yScales[coinName](d[state.yVariable]); 
    });

    linePath = thisGObj.append("path")
    .attrs({
        "class": `line ${coinName}`,
        "fill": "none",
        "stroke": "grey",
        "stroke-width": "3px"
    });

    linePath.transition(t())
        .attr("d", line(sliderFilteredData));

    focus = appendAndTransG(thisGObj, null, `focus${coinName}`).style("display", "none");

    focus.append("line")
        .attrs({
            "class": `${coinName}xHovLine x-hover-line hover-line`,
            "y1": 0,
            "y2": heightLM
        });

    focus.append("line")
        .attrs({
            "class": `${coinName}yHovLine y-hover-line hover-line`,
            "x1": 0,
            "x2": widthLM
        });

    focus.append("circle")
        .attr("r", 8);

    focus.append("text")
        .attrs({
            "x": 15,
            "dy": ".31em",

        });

    d3.select(`.${coinName}SvgWrapper`).append("rect")
        .attrs({
            "transform": `translate(${margin.left},${margin.top})`,
            "class": `${coinName}ovly overlay`,
            "width": widthLM,
            "height": heightLM
        })
        .on("mouseover", () => {
            let thisFocus = d3.select(`.focus${coinName}`)
            return thisFocus.style("display", null)
        })
        .on("mouseout", () => {
            let thisFocus = d3.select(`.focus${coinName}`)
            return thisFocus.style("display", 'none')
        })
        .on("mousemove", mousemove);

    function mousemove() {
        let thisFocus = d3.select(`.focus${coinName}`)
        
        var x0 = state.xScales[coinName].invert(d3.mouse(this)[0]),
            i = bisectDate(sliderFilteredData, x0, 1),
            d0 = sliderFilteredData[i - 1],
            d1 = sliderFilteredData[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
            
        thisFocus.attr("transform", `translate(${state.xScales[coinName](d.date)},${state.yScales[coinName](d[state.yVariable])})`);
        thisFocus.select("text").text(() => {
            return formatDollar(d[state.yVariable].toFixed(2))
        });
        thisFocus.select(`.${coinName}xHovLine`).attr("y2", heightLM - state.yScales[coinName](d[state.yVariable]));
        thisFocus.select(`.${coinName}yHovLine`).attr("x2", -state.xScales[coinName](d.date));
    }
};