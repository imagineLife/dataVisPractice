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

function setFocusDisplay(setting, coinName, arr){
    
    //dim all other lines
    d3.selectAll('.chartLine').transition(t()).style('stroke', `rgba(128,128,128,${arr[0]})`);
    d3.select(`.line${coinName}`).transition(t()).style('stroke', `rgba(128,128,128,${arr[1]})`);

    let thisFocus = d3.select(`.focus${coinName}`)
    return thisFocus.style("display", setting)
}

// Fix for y-axis format values
const formatSi = d3.format(".2s");
const formatDollar = d3.format("$,");

let yAxisObj = d3.axisLeft()
let xAxisObj = d3.axisBottom().ticks(4);
let xAxisG, yAxisG, gObj, svgObj, linePath, focus, margin = { left:50, right:20, top:50, bottom:20 };
const t = function() { return d3.transition().duration(450); }
const bisectDate = d3.bisector(function(d) { return d.date; }).left;

LineChart = function(_parentElement){
    this.parentElement = _parentElement;

    this.initVis();
};

LineChart.prototype.initVis = function(){
    var vis = this;

    vis.height = 550 - margin.top - margin.bottom;
    vis.width = 800 - margin.left - margin.right;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + margin.left + margin.right)
        .attr("height", vis.height + margin.top + margin.bottom);
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

    vis.t = function() { return d3.transition().duration(1000); }

    vis.bisectDate = d3.bisector(function(d) { return d.date; }).left;

    vis.linePath = vis.g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke-width", "3px");

    vis.yLabel = vis.g.append("text")
        .attr("class", "y axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -170)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Price (USD)")

    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height +")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");

    vis.wrangleData();
};


LineChart.prototype.wrangleData = function(){
    var vis = this;

    vis.coin = $("#coin-select").val()
    vis.yVariable = $("#var-select").val()

    // Filter data based on selections
    vis.sliderValues = $("#date-slider").slider("values")
    vis.dataFiltered = state.filteredData[vis.coin].filter(function(d) {
        return ((d.date >= vis.sliderValues[0]) && (d.date <= vis.sliderValues[1]))
    })

    vis.updateVis();
};


LineChart.prototype.updateVis = function(){
    var vis = this;

    // Update scales
    vis.x.domain(d3.extent(vis.dataFiltered, function(d) { return d.date; }));
    vis.y.domain([d3.min(vis.dataFiltered, function(d) { return d[vis.yVariable]; }) / 1.005, 
        d3.max(vis.dataFiltered, function(d) { return d[vis.yVariable]; }) * 1.005]);


    function formatAbbreviation(x) {
      var s = formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }

    // Update axes
    xAxisObj.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(xAxisObj);
    yAxisObj.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(yAxisObj.tickFormat(formatAbbreviation));

    // Discard old tooltip elements
    d3.select(".focus").remove();
    d3.select(".overlay").remove();

    var focus = vis.g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", vis.height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", vis.width);

    focus.append("circle")
        .attr("r", 5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    vis.svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = vis.x.invert(d3.mouse(this)[0]),
            i = vis.bisectDate(vis.dataFiltered, x0, 1),
            d0 = vis.dataFiltered[i - 1],
            d1 = vis.dataFiltered[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + vis.x(d.date) + "," + vis.y(d[vis.yVariable]) + ")");
        focus.select("text").text(function() { return formatDollar(d[vis.yVariable].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", vis.height - vis.y(d[vis.yVariable]));
        focus.select(".y-hover-line").attr("x2", -vis.x(d.date));
    }

    // Update y-axis label
    var newLabel = (vis.yVariable == "price_usd") ? "Price (USD)" :
        ((vis.yVariable == "market_cap") ? "Market Capitalization (USD)" :
            "24 Hour Trading Volume (USD)")
    vis.yLabel.text(newLabel)

    var line = d3.line()
        .x(function(d) { return vis.x(d.date); })
        .y(function(d) { return vis.y(d[vis.yVariable]); });

    vis.g.select(".line")
        .attr("stroke", color(vis.coin))
        .transition(vis.t)
        .attr("d", line(vis.dataFiltered));

};