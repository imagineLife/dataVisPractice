const transFn = function() { return d3.transition().duration(1000)};
const xScale = d3.scaleTime();
const yScale = d3.scaleLinear(); 
// let yVariable = null;
const svgObj = d3.select('chartDiv').append("svg")
const gObj = svgObj.append("g").attr('class', 'gWrapper');
const xAxis = gObj.append("g").attr("class", "x axis");
const yAxis = gObj.append("g")
        .attr("class", "y axis");
const xAxisObj = d3.axisBottom().ticks(4);
const yAxisObj = d3.axisLeft();

function buildChart(parentElement, coinToUse, data){
    console.log('INSIDE buildChart!');

    const margin = { left:50, right:20, top:50, bottom:20 };
    const height = 250 - margin.top - margin.bottom;
    const width = 300 - margin.left - margin.right;

    svgObj.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
    gObj.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    const bisectDate = d3.bisector(function(d) { return d.date; }).left;

    const linePath = gObj.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "3px");

    const chartLabel =  gObj.append("text")
        .attr("x", width/2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .text(coinToUse)

    xScale.range([0, width]);
    yScale.range([height, 0]);

    
    xAxis.attr("transform", "translate(0," + height +")");

    wrangleData(data, coinToUse);
};


function wrangleData(data, coinName){
    console.log('wrangleData')

    yVariable = $("#var-select").val()

    // Filter data based on selections
    const sliderValues = $("#date-slider").slider("values")
    if(data[coinName]){
        let dataFiltered = data[coinName].filter(function(d) {
            return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
        })
        updateVis(dataFiltered, coinName);
    }
};


function updateVis(data, coinName){

    // Update scales
    xScale.domain(d3.extent(data, function(d) { return d.date; }));
    yScale.domain([d3.min(data, function(d) { return d[yVariable]; }) / 1.005, 
    d3.max(data, function(d) { return d[yVariable]; }) * 1.005]);

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
    xAxis.transition(transFn).call(xAxisObj);
    yAxisObj.scale(yScale);
    yAxis.transition(transFn).call(yAxisObj.tickFormat(formatAbbreviation));

    // Discard old tooltip elements
    d3.select(".focus."+coinName).remove();
    d3.select(".overlay."+coinName).remove();

    var focus = gObj.append("g")
        .attr("class", "focus " + coinName)
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    svgObj.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay " + coinName)
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d[yVariable]) + ")");
        focus.select("text").text(function() { return d3.format("$,")(d[yVariable].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", height - y(d[yVariable]));
        focus.select(".y-hover-line").attr("x2", -xScale(d.date));
    }

    var line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d[yVariable]); });

    gObj.select(".line")
        .transition(transFn)
        .attr("d", line(data));

};