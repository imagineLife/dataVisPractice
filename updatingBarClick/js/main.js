const v = {
    margins : { 
        left:80,
        right:20,
        top:50,
        bottom:100
    },
    flag : true
}


const width = 600 - v.margins.left - v.margins.right,
    height = 400 - v.margins.top - v.margins.bottom;

// var t = d3.transition().duration(3000);

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

var svgObj = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + v.margins.left + v.margins.right)
        .attr("height", height + v.margins.top + v.margins.bottom)
    .append("g")
        .attr("transform", "translate(" + v.margins.left + ", " + v.margins.top + ")");

var xAxisGroup = makeAxisGroup(svgObj, 'x axis', `translate(0, ${height})` )
var yAxisGroup = makeAxisGroup(svgObj, 'y axis', `translate(0, 0)` )

//make axis labels
let yLabel = makeAxisLabel(svgObj, -(height / 2), (-60), "rotate(-90)", "Revenue")
let xLabel = makeAxisLabel(svgObj, (width / 2), (height + 50), "", "Race")

// X Scale
var xScale = d3.scaleBand().range([0, width]).padding(0.1);

// Y Scale
var yScale = d3.scaleLinear().range([height, 0]);

d3.json("data/top5EUE.json").then(function(data){

    // Clean data
    data.forEach(function(d) {
        d.white = +d.White;
        d.whiteAndHispanic = +d.WhiteAndHispanic;
        d.AfricanAmerican = +d.AfricanAmericans;
        d.AmericanIndian = +d.AmericanIndianAndAlaskaNative;
        d.Asian = +d.Asian;
        d.Other = +d.Other;
        d.twoOrMore = +d['2+Races'];
        d.HispanicOrLatino = +d.HispanicLatino;
        d.percentBelow = +d.PercentBelow;
        d.men = +d.BPMen;
        d.women = +d.BPWomen;
    });

    // Run the vis for the first time
    update(data);
});

function update(data) {
    var value = 'white';

    xScale.domain(data.map(function(d){ return d.geo }));
    //gathers the percentages and calc max
    yScale.domain([0, d3.max(data, function(d) { return d[value] })])
    
    // Update axis
    var xAxisD3Obj = d3.axisBottom(xScale);
    var yAxisD3Obj = d3.axisLeft(yScale)
        .tickFormat(d => `${d}%`);
    
    //transition the axis groups
    yAxisGroup.transition().duration(1000).call(yAxisD3Obj);
    xAxisGroup.transition().duration(1000).call(xAxisD3Obj);


    // JOIN new data with old elements.
    var rects = svgObj.selectAll("rect")
        .data(data, function(d){
            return d.geo;
        }).attr('fill','grey');

    // EXIT old elements not present in new data.
    // ENTER new elements
    let exitData = rects.exit();
    let enterData = rects.enter();

    exitData
        .attr("fill", "red")
    .transition().duration(1000)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

    // ENTER new elements present in new data...
    enterData
        .append("rect")
        .attrs({
            "fill": "blue",
            "y": yScale(0),
            "height": 0,
            "x": (d) => xScale(d.geo),
            "width": xScale.bandwidth  
        })

        // MERGE AND UPDATE NEW data with 
        // already-present elements present in new data.
        .merge(rects)
        .transition().duration(1000)
            .attrs({
                "x": (d) => xScale(d.geo),
                "width": xScale.bandwidth,
                "y": (d) => yScale(d[value]),
                "height": (d) => height - yScale(d[value])
            })
    var label = 'White';
    yLabel.text(label);

}
