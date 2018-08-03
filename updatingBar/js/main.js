var margin = { left:80, right:20, top:50, bottom:100 };

var width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var flag = true;

var t = d3.transition().duration(3000);

function makeAxisGroup(parent, className, transformation){
    return parent.append("g")
    .attr("class", className)
    .attr("transform", transformation);
}

function makeAxisLabel(parent, x, y, transformation, textVal){
    return parent.append("text")
    .attrs({
        "x": x,
        "y": y,
        "font-size": "20px",
        "text-anchor": "middle",
        "transform": transformation
    })
    .text(textVal);
}

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var xAxisGroup = makeAxisGroup(g, 'x axis', `translate(0, ${height})` )
var yAxisGroup = makeAxisGroup(g, 'y axis', `translate(0, 0)` )

//make axis labels
let yLabel = makeAxisLabel(g, -(height / 2), (-60), "rotate(-90)", "Revenue")
let xLabel = makeAxisLabel(g, (width / 2), (height + 50), "", "Month")

// X Scale
var xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

// Y Scale
var yScale = d3.scaleLinear()
    .range([height, 0]);



d3.json("data/data.json").then(function(data){

    // Clean data
    data.forEach(function(d) {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(function(){
        var newData = flag ? data : data.slice(1);

        update(newData)
        flag = !flag
    }, 2000);

    // Run the vis for the first time
    update(data);
});

function update(data) {
    var value = flag ? "revenue" : "profit";

    xScale.domain(data.map(function(d){ return d.month }));
    yScale.domain([0, d3.max(data, function(d) { return d[value] })])

    // X Axis
    var xAxisCall = d3.axisBottom(xScale);
    xAxisGroup.transition().duration(1000).call(xAxisCall);;

    // Y Axis
    var yAxisCall = d3.axisLeft(yScale)
        .tickFormat(function(d){ return "$" + d; });
    yAxisGroup.transition().duration(1000).call(yAxisCall);

    // JOIN new data with old elements.
    var rects = g.selectAll("rect")
        .data(data, function(d){
            return d.month;
        });

    // EXIT old elements not present in new data.
    rects.exit()
        .attr("fill", "red")
    .transition().duration(1000)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

    // ENTER new elements present in new data...
    rects.enter()
        .append("rect")
            .attr("fill", "grey")
            .attr("y", yScale(0))
            .attr("height", 0)
            .attr("x", function(d){ return xScale(d.month) })
            .attr("width", xScale.bandwidth)
            // AND UPDATE old elements present in new data.
            .merge(rects)
            .transition().duration(1000)
                .attr("x", function(d){ return xScale(d.month) })
                .attr("width", xScale.bandwidth)
                .attr("y", function(d){ return yScale(d[value]); })
                .attr("height", function(d){ return height - yScale(d[value]); });

    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);

}
