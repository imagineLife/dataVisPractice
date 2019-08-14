const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 ,
    height = 400 - margin.top - margin.bottom;
    const wLM = width - margin.left - margin.right
    const hLM = height - margin.top - margin.bottom
// append the svg object to the body of the page
var svg = d3.select("#chartDiv")
  .append("svg")
    .attr("width", width )
    .attr("height", height)

const gWrapper = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

//placeholders, updated with data;
let hexbin, colorScale;

const enterHB = (e) => {
  e.append("path")
    .attrs({
      "d": hexbin.hexagon(),
      "transform": function(d) { return "translate(" + d.x + "," + d.y + ")"; },
      "fill": function(d) { return colorScale(d.length); },
      "stroke": "black",
      "stroke-width": "0.1"
  })
}

// read data
d3.json("./data.json").then(data => {

  let dataXtent = d3.extent(data, d => d.x)
  let dataYtent = d3.extent(data, d => d.y)

  //set scales
  var xScale = d3.scaleLinear()
    .domain([dataXtent[0] * .95, dataXtent[1] * 1.05])
    .range([ 0, wLM ]);

  var yScale = d3.scaleLinear()
    .domain([dataYtent[0] * .95, dataYtent[1] * 1.05])
    .range([ hLM, 0 ]);

  //add axis objects    
  const xAxisObj = d3.axisBottom(xScale)
  const yAxisObj = d3.axisLeft(yScale)
  gWrapper.append("g")
    .attr("transform", `translate(0,${hLM})`)
    .call(xAxisObj);
  gWrapper.append("g")
    .call(yAxisObj);

  /*
    Reformat the data: 
    d3.hexbin() needs a specific format
    array of points
    [ scaledX, scaledY ]
  */
   
  var inputForHexbinFun = []
  data.forEach(function(d) {
    inputForHexbinFun.push( [xScale(d.x), yScale(d.y)] )  // Note that we had the transform value of X and Y !
  })

  let numberOfColors = inputForHexbinFun.length / 100
  
  // Prepare a color palette
  colorScale = d3.scaleLinear()
      .domain([0, numberOfColors])
      .range(["transparent",  "#69b3a2"])

  // Compute the hexbin data, update the hexbin var
  hexbin = d3.hexbin()
    /*
       size of the bin in px, takes some guessing...
       12 makes bigger bins AND darker/brighter colors
       6  makes smaller  "" AND lighter/duller  ""
    */
    .radius(9)
    .extent([ [0, 0], [wLM, hLM] ])

  const hexedData = hexbin(inputForHexbinFun)

  // Plot the hexbins
  gWrapper.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attrs({
        "width": wLM,
        "height": hLM
      })

  gWrapper.append("g")
    .attr("clip-path", "url(#clip)")
    .selectAll("path")
    .data(hexedData)
    .join(enterHB)
})