let xScale = x = d3.scaleTime()
let yScale = d3.scaleLinear() 
let yAxisObj = d3.axisLeft()
let xAxisObj = d3.axisBottom().ticks(4);
let yVariable, dataFiltered, xAxisG, yAxisG, gObj, svgObj, margin = { left:50, right:20, top:50, bottom:20 };
const t = function() { return d3.transition().duration(1000); }

LineChart = function(_parentElement, _coin){
    this.parentElement = _parentElement;
    this.coin = _coin

    this.initVis();
};

LineChart.prototype.initVis = function(){
    var vis = this;

    vis.height = 250;
    vis.width = 300;
    vis.heightLM = 250 - margin.top - margin.bottom;
    vis.widthLM = 300 - margin.left - margin.right;
    

    svgObj = d3.select(vis.parentElement)
        .append("svg")
        .attrs({
            "width": vis.width,
            "height": vis.height
        });
    gObj = svgObj.append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

    

    vis.bisectDate = d3.bisector(function(d) { return d.date; }).left;

    vis.linePath = gObj.append("path")
        .attrs({
            "class": "line",
            "fill": "none",
            "stroke": "grey",
            "stroke-width": "3px"
        });

    gObj.append("text")
        .attrs({
            "x": vis.widthLM/2,
            "y": 0,
            "text-anchor": "middle"
        })
        .text(vis.coin)

    xScale.range([0, vis.widthLM]);
    yScale.range([vis.heightLM, 0]);

    xAxisG = gObj.append("g")
        .attr("class", "xAxisG x axis")
        .attr("transform", "translate(0," + vis.heightLM +")");
    yAxisG = gObj.append("g")
        .attr("class", "yAxisG y axis");
        
    wrangleData(vis.coin);
};


function wrangleData(coinName){

    yVariable = $("#var-select").val()

    // Filter data based on selections
    let sliderValues = $("#date-slider").slider("values")
    
    dataFiltered = filteredData[coinName].filter(function(d) {
        return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
    })

    updateVis(coinName);
};


const updateVis = function(coinName){
    //works
    // console.log('coinName')
    // console.log(coinName)
    
    var vis = this;

    // Update scales
    xScale.domain(d3.extent(dataFiltered, d => d.date));

    //works
    // console.log('xScale.domain()')
    // console.log(xScale.domain())
    
    yScale.domain([d3.min(dataFiltered, d => d[yVariable]) / 1.005, 
        d3.max(dataFiltered, d => d[yVariable]) * 1.005]);

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
    xAxisG.transition(t()).call(xAxisObj);
    yAxisObj.scale(yScale);
    yAxisG.transition(t()).call(yAxisObj.tickFormat(formatAbbreviation));

    // Discard old tooltip elements
    d3.select(".focus."+coinName).remove();
    d3.select(".overlay."+coinName).remove();

    var focus = gObj.append("g")
        .attr("class", "focus " + coinName)
        .style("display", "none");

    focus.append("line")
        .attrs({
            "class": "x-hover-line hover-line",
            "y1": 0,
            "y2": vis.heightLM
        });

    focus.append("line")
        .attrs({
            "class": "y-hover-line hover-line",
            "x1": 0,
            "x2": vis.widthLM
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
            "class": "overlay " + coinName,
            "width": vis.widthLM,
            "height": vis.heightLM
        })
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]),
            i = vis.bisectDate(dataFiltered, x0, 1),
            d0 = dataFiltered[i - 1],
            d1 = dataFiltered[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d[yVariable]) + ")");
        focus.select("text").text(function() { return d3.format("$,")(d[yVariable].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", vis.heightLM - yScale(d[yVariable]));
        focus.select(".y-hover-line").attr("x2", -xScale(d.date));
    }

    var line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { 
            return yScale(d[yVariable]); });

    gObj.select(".line")
        .transition(vis.t)
        .attr("d", line(dataFiltered));

};