// Dynamically update the position of the nodes/links as time passes
function tickFn(d){
  // console.log('ticking!')
  links.attrs({
    "x1": d => d.source.x,
    "y1": d => d.source.y,
    "x2": d => d.target.x,
    "y2": d => d.target.y
  });

  nodes
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
}

function drawChart(chartData){
  console.log('drawingChart!')
  console.log(chartData)

  //build links
  links = linkGWrapper //CAN append straight to svgObj
    .selectAll("line")
    .data(chartData.links)
    .enter().append("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value))
    .attr('class', 'linkLine');
  
  // Add circles for every node in the dataset
  nodes = nodeGWrapper //CAN append straight to svgObj
    .selectAll("circle")
    .data(chartData.nodes)
    .enter().append("circle")
    .attrs({
      "r": 5,
      "fill": d => colorScale(d.group),
      'class': 'circleNode'
    })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
  
  // Basic tooltips
  nodes.append("title")
    .text(d => d.id);
  
  // Attach nodes to the simulation, add listener on the "tick" event
  forceSim
    .nodes(chartData.nodes)
    .on("tick", (d) => tickFn(d));
  
  // Associate the lines with the "link" force
  forceSim.force("link")
    .links(chartData.links)
}

//1. select & create d3 vars
let svgObj = d3.select('svg'),
svgWidth = +svgObj.attr('width'),
svgHeight = +svgObj.attr('height'),
colorScale = d3.scaleOrdinal(d3.schemeCategory20), links, nodes;
let linkGWrapper = svgObj.append("g")
  .attr("class", "linkGWrapper");
let nodeGWrapper = svgObj.append('g')
  .attr('class', 'nodeGWrapper');

//2. Create forceSimulation & Add "forces" to the simulation here
var forceSim = d3.forceSimulation()

    //balance in the middle
    .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
    
    //SPREAD out
    //STRENGTH -> farther - from 0, farther the spread
    .force("charge", d3.forceManyBody().strength(-60))
    
    //keep them from colliding
    //forceCollide -> distance from relative nodes
    .force("collide", d3.forceCollide(10).strength(0.3))
    
    //a link simulation
    .force("link", d3.forceLink().id(d => d.id));

d3.json("./data.json", (error, graph) => {
    if (error) throw error;

    //draw the chart with the data!
    drawChart(graph)
    
});
// Change the value of alpha, so things move around when we drag a node
function dragstarted(d) {
  if (!d3.event.active) forceSim.alphaTarget(0.7).restart();
    d.fx = d.x;
    d.fy = d.y;
}

// Fix the position of the node that we are looking at
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
// Let the node do what it wants again once we've looked at it
function dragended(d) {
if (!d3.event.active) forceSim.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}