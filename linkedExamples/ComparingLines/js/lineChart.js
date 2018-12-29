let xScale = x = d3.scaleTime()
let yScale = d3.scaleLinear() 
let yAxisObj = d3.axisLeft()
let xAxisObj = d3.axisBottom().ticks(4);
let yVariable, dataFiltered, xAxisG, yAxisG, gObj, svgObj, linePath, margin = { left:50, right:20, top:50, bottom:20 };
const t = function() { return d3.transition().duration(1000); }
const bisectDate = d3.bisector(function(d) { return d.date; }).left;
// Filter data based on selections
const height = 250, 
      width = 300, 
      heightLM = height - margin.top - margin.bottom,
      widthLM = width - margin.left - margin.right;

LineChart = function(_parentElement, coinData){

    this.initVis(_parentElement, coinData);
};

LineChart.prototype.initVis = function(parent, coinData){
    console.log('coinData')
    console.log(coinData)
    let thisCoinName = Object.keys(coinData)[0]
    
    

    svgObj = d3.select(parent)
        .append("svg")
        .attrs({
            "width": width,
            "height": height,
            'class': `${thisCoinName}svgWrapper`
        });

    thisGObj = svgObj.append("g")
        .attrs({
            "transform": `translate(${margin.left},${margin.top})`,
            'class': `gWrapper ${thisCoinName}`
        });

    thisGObj.append("text")
        .attrs({
            "x": widthLM/2,
            "y": 0,
            "text-anchor": "middle"
        })
        .text(Object.keys(coinData))

    xScale.range([0, widthLM]);
    yScale.range([heightLM, 0]);

    xAxisG = thisGObj.append("g")
        .attr("class", `${thisCoinName}xAxisG x axis`)
        .attr("transform", "translate(0," + heightLM +")");
    yAxisG = thisGObj.append("g")
        .attr("class", `${thisCoinName}yAxisG y axis`);
        
    wrangleData(coinData);
};


function wrangleData(coinData, sliderTimeVals){
    let timeVals = (!sliderTimeVals) ? [1368331200000, 1509422400000] : sliderTimeVals;
    let dataKey = Object.keys(coinData)[0]

    yVariable = $("#var-select").val()
    
    let sliderFilteredData = coinData[dataKey].filter(function(d) {
        return ((d.date >= timeVals[0]) && (d.date <= timeVals[1]))
    })

    updateVis(dataKey, sliderFilteredData);
};


const updateVis = function(coinName, coinData){

    console.log('UPDATING!');

    var vis = this;

    // Update scales
    xScale.domain(d3.extent(coinData, d => d.date));
    
    yScale.domain([d3.min(coinData, d => d[yVariable]) / 1.005, 
        d3.max(coinData, d => d[yVariable]) * 1.005]);

    // Fix for y-axis format values
    var formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
      var s = formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }

    // Update axes
    xAxisObj.scale(xScale);
    
    let thisXAxisG = d3.select(`.${coinName}xAxisG`)
    thisXAxisG.transition(t()).call(xAxisObj);
    yAxisObj.scale(yScale);
    yAxisG.transition(t()).call(yAxisObj.tickFormat(formatAbbreviation));

    // Discard old tooltip elements
    d3.select(".focus."+coinName).remove();
    d3.select(".overlay."+coinName).remove();

    let thisGObj = d3.select(`g.${coinName}`)
    thisGObj.selectAll(`path`).remove()

    console.log('thisGObj')
    console.log(thisGObj)
    
    var focus = thisGObj.append("g")
        .attr("class", `${coinName}focus`)
        .style("display", "none");

    focus.append("line")
        .attrs({
            "class": `x-hover-line hover-line`,
            "y1": 0,
            "y2": heightLM
        });

    focus.append("line")
        .attrs({
            "class": "y-hover-line hover-line",
            "x1": 0,
            "x2": widthLM
        });

    focus.append("circle")
        .attr("r", 5);

    focus.append("text")
        .attrs({
            "x": 15,
            "dy": ".31em"
        });

    svgObj.append("rect")
        .attrs({
            "transform": `translate(${margin.left},${margin.top})`,
            "class": `${coinName}ovly overlay`,
            "width": widthLM,
            "height": heightLM
        })
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        console.log('MOVING MOUSE!');
        console.log(this);
        var x0 = xScale.invert(d3.mouse(this)[0]),
            i = bisectDate(coinData, x0, 1),
            d0 = coinData[i - 1],
            d1 = coinData[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d[yVariable]) + ")");
        focus.select("text").text(function() { return d3.format("$,")(d[yVariable].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", heightLM - yScale(d[yVariable]));
        focus.select(".y-hover-line").attr("x2", -xScale(d.date));
    }

    var line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { 
            return yScale(d[yVariable]); });

    linePath = thisGObj.append("path")
    .attrs({
        "class": `line ${coinName}`,
        "fill": "none",
        "stroke": "grey",
        "stroke-width": "3px"
    });

    linePath.transition(t())
        .attr("d", line(coinData));

/*
    works, but SLOW!
    //path enter-update-exit pattern
    //path data-join
    lineDataJoin = thisGObj.selectAll('path')
    .data(coinData);
    
    // console.log('lineDataJoin.enter()')
    // console.log(lineDataJoin.enter())
    
    //path ENTER
    lineDataJoin
        .enter().append('path')
        .attrs({
            "class": "line",
            "fill": "none",
            "stroke": "grey",
            "stroke-width": "3px",
            "d": line(coinData)
        })
        .merge(lineDataJoin).attr("d", line(coinData))
    
    lineDataJoin.exit().remove()

*/

};