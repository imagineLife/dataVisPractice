// Dynamically update the position of the nodes/links as time passes
function tickFn(d){
  // console.log('ticking!')
  link.attrs({
    "x1": d => d.source.x,
    "y1": d => d.source.y,
    "x2": d => d.target.x,
    "y2": d => d.target.y
  });

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
}

function drawChart(chartData){
  console.log('drawingChart!')
  console.log(chartData)

  link = svgObj.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(chartData.links)
    .enter().append("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));
  
  // Add circles for every node in the dataset
  node = svgObj.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(chartData.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", d => colorScale(d.group))
    // .call(d3.drag()
    //     .on("start", dragstarted)
    //     .on("drag", dragged)
    //     .on("end", dragended)
    // );
  
  // Basic tooltips
  node.append("title")
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

//2. Create forceSimulation & Add "forces" to the simulation here
var forceSim = d3.forceSimulation()

    //balance in the middle
    .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
    
    //SPREAD out
    .force("charge", d3.forceManyBody().strength(-50))
    
    //keep them from colliding
    .force("collide", d3.forceCollide(10).strength(0.9))
    
    //a link simulation
    .force("link", d3.forceLink().id(d => d.id));

d3.json("./data.json", (error, graph) => {
    if (error) throw error;
    console.log(graph);
    // Add lines for every link in the dataset
    drawChart(graph)
    
});
// Change the value of alpha, so things move around when we drag a node
function dragstarted(d) {
  if (!d3.event.active) forceSim.alphaTarget(0.7).restart();
    d.fx = d.x;
    d.fy = d.y;
}