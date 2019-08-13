var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#chartDiv")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

const gWrapper = svg.append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// read data
d3.json("./data.json").then(data => {

  let dataXtent = d3.extent(data, d => d.x)
  // Add X axis
  var xScale = d3.scaleLinear()
    .domain([dataXtent[0] * .95, dataXtent[1] * 1.05])
    .range([ 0, width ]);
  gWrapper.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  // Add Y axis
  var yScale = d3.scaleLinear()
    .domain([5, 20])
    .range([ height, 0 ]);
  gWrapper.append("g")
    .call(d3.axisLeft(yScale));

  // Reformat the data: d3.hexbin() needs a specific format
  var inputForHexbinFun = []
  data.forEach(function(d) {
    inputForHexbinFun.push( [xScale(d.x), yScale(d.y)] )  // Note that we had the transform value of X and Y !
  })

  // Prepare a color palette
  var color = d3.scaleLinear()
      .domain([0, 600]) // Number of points in the bin?
      .range(["transparent",  "#69b3a2"])

  // Compute the hexbin data
  var hexbin = d3.hexbin()
    .radius(9) // size of the bin in px
    .extent([ [0, 0], [width, height] ])

  // Plot the hexbins
  gWrapper.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attrs({
        "width": width,
        "height": height
      })

  gWrapper.append("g")
    .attr("clip-path", "url(#clip)")
    .selectAll("path")
    .data( hexbin(inputForHexbinFun) )
    .enter().append("path")
      .attrs({
        "d": hexbin.hexagon(),
        "transform": function(d) { return "translate(" + d.x + "," + d.y + ")"; },
        "fill": function(d) { return color(d.length); },
        "stroke": "black",
        "stroke-width": "0.1"
    })
})