let getParentFromD = (d) => d.id.substring(0, d.id.lastIndexOf("."));

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
    .id(d => d.name)
    .parentId(d => d.parent)
    (data);

  //build nodes using hierarchy
  var nodes = d3.hierarchy(data, d => d.children);
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
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

// Creates a curved (diagonal) path from parent to the child nodes
function diagShape(s, d) {

  path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`

  return path
}

// Toggle children on click.
function nodeClick(d) {
  if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  console.log('d')
  console.log(d)
  
  update(d);
}

function resize(){
  gObj.selectAll('*').remove()

  let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

  //set svg dims
  svgObj.attrs({
    'height': heightLessMargins,
    'width': widthLessMargins,
    'transform': `translate(${margin.left},${margin.top})`
  })

  //transform gObj
  gObj.attr('transform', `translate(${75},${margin.top})`)

  //reset three dims
  treeLayout.size([heightLessMargins, widthLessMargins - 200])

  buildChart(rootData, storedNodes)
}

function buildChart(stratRootData, nodes){

  stratRootData.x0 = resizedHeight / 2;
  stratRootData.y0 = 0

  // Add the links (given by calling tree(root), which also adds positional x/y coordinates) for the nodes
  var linkDataJoin = gObj.selectAll(".link")
    .data(treeLayout(stratRootData).links());

    //set link paths & link path data
    linkDataJoin
      .enter().append("path")
        .attr("class", "link")
      .merge(linkDataJoin)
        .attr(
          "d", d3.linkHorizontal().x(d => d.y).y(d => d.x)
        );

  // Set node DataJoin
  var nodeDataJoin = gObj.selectAll(".node")
    .data(stratRootData.descendants());

  //build nodeEnter for appending cnode circle & text
  let nodeEnter = nodeDataJoin.enter().append("g")
    .merge(nodeDataJoin)
    .attrs({
      "class": d => "node" + (d.children ? " node--mid" : " node--final"),
      "transform": d => `translate(${d.y},${d.x})`
    })

  //build circles
  let nodeCircle = nodeEnter.append("circle").attr("r", 2.5);

  //build node Text
  let nodeTxt = nodeEnter.append("text")
    .attrs({
      "dy": 3,
      "x": d => d.children ? -8 : 8,
      "y": d => (d.children && d.parent !== null) ? -8 : 0,
      'class':'nodeText'
    })
    .style("text-anchor", d => d.children ? "end" : "start")
    .text((d) => d.id);
}

const margin = { left: 20, right: 20, top: 20, bottom: 20 };
let rootData, storedNodes, transDur = 350;
let {chartObj, svgObj, svgW, svgH, gObj} = makeObjsFromParent('chartDiv');  
let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

svgObj.attrs({
  'height': heightLessMargins,
  'width': widthLessMargins,
  'transform': `translate(${margin.left},${margin.top})`
})

gObj.attr('transform', `translate(${75},${margin.top})`)

let treeLayout = d3.tree()
  .size([heightLessMargins, widthLessMargins - 200]);

var stratify = d3.stratify()
  .parentId(getParentFromD);

d3.json("./data.json", function(error, data) {
  if (error) throw error;

  let {stratRootData, nodes} = prepData(data);
  
  rootData = stratRootData;
  storedNodes = nodes;

  // Collapse the node and all it's children
  buildChart(rootData, nodes);
});

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize);