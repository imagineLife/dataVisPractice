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
    let sliderFilteredData = data.filter(function(d) {
        return ((d.date >= timeVals[0]) && (d.date <= timeVals[1]))
    })

    return { sliderFilteredData }
}

function setFocusDisplay(setting, coinName, arr){
    
    //dim all other lines
    // d3.selectAll('.chartLine').transition(t());
    // d3.select(`.line`).transition(t()));

    let thisFocus = d3.select(`.focus`)
    return thisFocus.style("display", setting);
}

// Fix for y-axis format values
const formatSi = d3.format(".2s");
const formatDollar = d3.format("$,");

let yAxisObj = d3.axisLeft()
let xAxisObj = d3.axisBottom().ticks(4);
let xAxisG, yAxisG, gObj, svgObj, linePath, focus, margin = { left:50, right:20, top:50, bottom:20 };
const t = function() { return d3.transition().duration(450); }
const bisectDate = d3.bisector(function(d) { return d.date; }).left;

// Filter data based on selections
const height = 550, 
      width = 800, 
      heightLM = height - margin.top - margin.bottom,
      widthLM = width - margin.left - margin.right;

const initLine = function(parent, coinData){

    let coinName = state.activeCoin
    svgObj = d3.select(parent)
        .append("svg")
        .attrs({
            "width": width,
            "height": height,
            'class': `${coinName}SvgWrapper svgWrapper`
        });

    thisGObj = appendAndTransG(svgObj, `translate(${margin.left},${margin.top})`, `gWrapper`);

    // thisGObj.append("text")
    //     .attrs({
    //         "x": widthLM/2,
    //         "y": 0,
    //         "text-anchor": "middle"
    //     })
    //     .text(Object.keys(coinData))

    xAxisG = appendAndTransG(thisGObj, `translate(0,${heightLM})`, `xAxisG x axis`);
    yAxisG = appendAndTransG(thisGObj, null, `yAxisG y axis`);
        
    updateLine(coinData, state.sliderVals);
};

const updateLine = function(coinData, sliderTimeVals){
    let coinName = state.activeCoin;
    console.log('updating Line');
    console.log('state.yVariable')
    console.log(state.yVariable)
    

    state.xScales[coinName].range([0, widthLM]);
    state.yScales[coinName].range([heightLM, 0]);
    
    /*
        set chart params if not already selected
    */
    if(coinName == null){
        coinName = $("#measurement-select").val()
    }
    
    let timeVals = (!sliderTimeVals) ? [1368331200000, 1509422400000] : sliderTimeVals;
    
    //get filtered chart data from parameters
    let { sliderFilteredData } = filterCoinStats(coinData, timeVals)

    /*
        Update scales
    */
    
    
    state.xScales[coinName].domain(d3.extent(sliderFilteredData, d => d.date));
    state.yScales[coinName].domain([d3.min(sliderFilteredData, d => d[state.yVariable]) / 1.005, 
        d3.max(sliderFilteredData, d => d[state.yVariable]) * 1.005]);

    // Update axes
    let thisXAxisG = d3.select(`.xAxisG`),
        thisYAxisG = d3.select(`.yAxisG`);
    xAxisObj.scale(state.xScales[coinName]);
    yAxisObj.scale(state.yScales[coinName]);
    thisXAxisG.transition(t()).call(xAxisObj);
    thisYAxisG.transition(t()).call(yAxisObj.tickFormat(formatAbbreviation));
    
    //remove previous path, focuses, & overlays
    let thisGObj = d3.select(`.gWrapper`)
    thisGObj.selectAll(`path`).remove()
    thisGObj.selectAll(`.focus`).remove()
    d3.select(`.overlay`).remove();

    const line = d3.line()
        .x(function(d) { return state.xScales[coinName](d.date); })
        .y(function(d) { return state.yScales[coinName](d[state.yVariable]); 
    });

    linePath = thisGObj.append("path")
        .attr("class", `line ${coinName} line${coinName} chartLine`);

    linePath.transition(t())
        .attr("d", line(sliderFilteredData));

    /*
        build & configthe 'focus' elements, for mouseover interaction
        x-hover line
        y-hover line
        hover circle
        hover text
    */
    focus = appendAndTransG(thisGObj, null, `focus`).style("display", "none");

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

    /*
        build & config the hidden rect for hover interaction
    */

    d3.select(`.svgWrapper`).append("rect")
        .attrs({
            "transform": `translate(${margin.left},${margin.top})`,
            "class": `overlay`,
            "width": widthLM,
            "height": heightLM
        })
        .on("mouseover", () => setFocusDisplay(null, coinName, [.2,1]))
        .on("mouseout", () => setFocusDisplay('none', coinName, [1,1]))
        .on("mousemove", mousemove);

    function mousemove() {
            console.log('mousemoving!')
            
        
        let thisFocus = d3.select(`.focus`)
        
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