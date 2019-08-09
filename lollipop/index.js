let rootData = null;
// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

let thisVar = null;
// append the svg object to the body of the page
var svg = d3.select("#chartDiv")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .padding(1);
var xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")")

// Initialize the Y axis
var y = d3.scaleLinear()
  .range([ height, 0]);
var yAxis = svg.append("g")
  .attr("class", "myYaxis")


const enterLines = (ent) => {
  let thisG = ent.append('g')
    .attr('class', 'itemGroup')

  let groupedLine = thisG.append("line")
    .attrs({
      "class": "myLine",
      "x1": d=> x(d.group),
      "x2": d=> x(d.group),
      "y1": y(0),
      "y2": y(0)
    })
    .transition()
    .duration(500)
      .attrs({
        "y2": d => y(d[thisVar]),
        "stroke": "grey"
      })

  thisG.append("circle")
        .attr("cx", d => x(d.group))
        .attr("cy", d => y(d[thisVar]))
        .attr("r", 0)
        .transition()
        .duration(500)
          .attr("r", 8)
          .attr("fill", "#69b3a2");
}


function updateLines(upd){
  upd.call(upd => upd.transition().duration(500)
    .attr("y2", d => y(d[thisVar]))
  )
}


d3.json("./data.json").then(data => {

  rootData = data

  // X axis
  x.domain(data.map(function(d) { return d.group; }))
  xAxis.transition().duration(1000).call(d3.axisBottom(x))

  // Add Y axis
  y.domain([0, d3.max(data, function(d) { return +d[thisVar || 'var1'] }) ]);
  yAxis.transition().duration(1000).call(d3.axisLeft(y));

  // Initialize plot
  update('var1')

})

// A function that create / update the plot for a given variable:
function update(selectedVar) {
  thisVar = selectedVar
  // Parse the Data

  // variable u: map data to existing circle
  let dataJoin = svg.selectAll(".itemGroup")
    .data(rootData, d => d.group)

  // update lines
  dataJoin.join(enterLines, updateLines)

}