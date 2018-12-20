const getParentFromD = (d) => d.id.substring(0, d.id.lastIndexOf("."));
const startOrEnd = d => d.children || d._children ? "end" : "start";
const dName = d => d.name;
const dPar = d => d.parent;
const dChild = d => d.children;
const dDatNm = d => d.data.name;
const transNode = d => `translate(${d.y},${d.x})`;
function makeObjsFromParent(parent){
  let chartObj = d3.select('#chartDiv'),
  svgObj = chartObj.append('svg'),
  svgW = +svgObj.attr("width"),
  svgH = +svgObj.attr("height"),
  gObj = svgObj.append("g");
  return {chartObj, svgObj, svgW, svgH, gObj}
}

function prepData(data){
  
  //stratify data
  var stratRootData = d3.stratify()
    .id(dName)
    .parentId(dPar)
    (data);

  //build nodes using hierarchy
  var nodes = d3.hierarchy(data, dChild);
  return {stratRootData, nodes};
}

function getDimsFromParent(p){
  
  // Extract the width and height that was computed by CSS.
  let resizedWidth = p.clientWidth;
  let resizedHeight = p.clientHeight;
  const widthLessMargins = resizedWidth - margin.left - margin.right;
  const heightLessMargins = resizedHeight - margin.top - margin.bottom;
  return {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins}
}

// Collapse the node and all it's children
function collapse(d) {
  console.log('COLLAPSING d.id')
  console.log(d.id)
  
  if(d.children && !openedChildren.includes(d.id)) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

// Creates a curved (diagonal) path from parent to the child nodes
function diagShape(s, d) {
  // console.log('s')
  // console.log(s)
  // console.log('d')
  // console.log(d)
  // console.log('- - - - -');
  

  path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`

  return path
}

// Toggle children on click.
function nodeClick(d) {
  console.log('nodeClick d.id')
  console.log(d.id)

  openedChildren.push(d.id)
  
  if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  
  buildChart(rootData, storedNodes);
}

function resize(){

  let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

  //set svg dims
  svgObj.attrs({
    'height': resizedHeight,
    'width': resizedWidth,
    'transform': `translate(${margin.left},${margin.top})`
  })

  //transform gObj
  gObj.attr('transform', `translate(${margin.left},${margin.top})`)

  //reset three dims
  treeLayout.size([heightLessMargins, widthLessMargins - 200])

  buildChart(rootData, storedNodes)
}

function buildChart(stratRootData, nodes){

  // Assigns the x and y position for the nodes
  var treeData = treeLayout(stratRootData);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  // nodes.forEach(d => d.y = d.depth * 180);


  // ****************** Nodes section ***************************
  // ************************************************************


  // Update the nodes...
  var nodeDataJoin = gObj.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = nodeDataJoin.enter().append('g')
    .attrs({
      'class': 'node',
      'transform': transNode
    })
    .on('click', nodeClick);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attrs({
        'class': 'node',
        'r': 1e-6
      })
      .style("fill", d => d._children ? "lightsteelblue" : "#fff");

  // Add labels for the nodes
  nodeEnter.append('text')
      .attrs({
        "dy": ".35em",
        "x": d => d.children || d._children ? -13 : 13,
        "text-anchor": startOrEnd
      })
      .text(dDatNm);

  // UPDATE
  var nodeUpdate = nodeEnter.merge(nodeDataJoin);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(transDur)
    .attr("transform", transNode);

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", d => d._children ? "lightsteelblue" : "#fff")
    .attr('cursor', 'pointer');

  // Remove any exiting nodes
  var nodeExit = nodeDataJoin.exit().transition()
      .duration(transDur)
      .attr("transform", transNode)
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle').attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text').style('fill-opacity', 1e-6);


  // ****************** links section ***************************
  // ************************************************************
  

  var link = gObj.selectAll('path.link')
      .data(links, d => d.id);

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', d => {
        var o = {x: d.x, y: d.y}
        return diagShape(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(transDur)
      .attr('d', function(d){ return diagShape(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(transDur)
      .attr('d', function(d) {
        var o = {x: d.x, y: d.y}
        return diagShape(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

const margin = { left: 85, right: 20, top: 0, bottom: 20 };
let rootData, storedNodes, transDur = 150;
let {chartObj, svgObj, svgW, svgH, gObj} = makeObjsFromParent('chartDiv');  
let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);
let openedChildren = [];

svgObj.attrs({
  'height': resizedHeight,
  'width': resizedWidth,
  'transform': `translate(${margin.left},${margin.top})`
})

gObj.attr('transform', `translate(${margin.left},${margin.top})`)

let treeLayout = d3.tree()
  .size([heightLessMargins, widthLessMargins - 200]);

var stratify = d3.stratify()
  .parentId(getParentFromD);

d3.json("./data.json", function(error, data) {
  if (error) throw error;

  let {stratRootData, nodes} = prepData(data);
  
  rootData = stratRootData;
  storedNodes = nodes;

  buildChart(rootData, nodes);
});

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize);