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
    .padding(0.1);

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

    // Update axis
    var xAxisD3Obj = d3.axisBottom(xScale);
    var yAxisD3Obj = d3.axisLeft(yScale)
        .tickFormat(function(d){ return "$" + d; });
    
    //transition the axis groups
    yAxisGroup.transition().duration(1000).call(yAxisD3Obj);
    xAxisGroup.transition().duration(1000).call(xAxisD3Obj);;

    // JOIN new data with old elements.
    var rects = g.selectAll("rect")
        .data(data, function(d){
            return d.month;
        });

    // EXIT old elements not present in new data.
    let exitData = rects.exit();

    exitData
        .attr("fill", "red")
    .transition().duration(1000)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

    let enterData = rects.enter();

    // ENTER new elements present in new data...
    enterData
        .append("rect")
            .attrs({
                "fill": "grey",
                "y": yScale(0),
                "height": 0,
                "x": (d) => xScale(d.month),
                "width": xScale.bandwidth  
            })
    
            // MERGE AND UPDATE NEW data with 
            // already-present elements present in new data.
            .merge(rects)
            .transition().duration(1000)
                .attrs({
                    "x": (d) => xScale(d.month),
                    "width": xScale.bandwidth,
                    "y": (d) => yScale(d[value]),
                    "height": (d) => height - yScale(d[value])
                })
    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);

}
