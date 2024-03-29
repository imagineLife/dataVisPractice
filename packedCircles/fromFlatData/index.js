function makeObjsFromParent(parent){
  let chartObj = d3.select('#chartDiv'),
  svgObj = chartObj.append('svg'),
  svgW = +svgObj.attr("width"),
  svgH = +svgObj.attr("height");
  return {chartObj, svgObj, svgW, svgH}
}

function getDimsFromParent(p){
  
  // Extract the width and height that was computed by CSS.
  let resizedWidth = p.clientWidth;
  let resizedHeight = p.clientHeight;
  const widthLessMargins = resizedWidth - margin.left - margin.right;
  const heightLessMargins = resizedHeight - margin.top - margin.bottom;
  return {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins}
}

let sortFn = (a,b) => b.value - a.value;
let valFn = d => d.value;
let nodeFn = d => d.thisNode;
let allButLastSegment = d => d.parent//d.id.substring(0, d.id.lastIndexOf("."));

const margin = { left: 20, right: 20, top: 40, bottom: 40 };
let rootData, storedNodes;
let {chartObj, svgObj, svgW, svgH} = makeObjsFromParent('chartDiv');  
let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

svgObj.attrs({
  'height': heightLessMargins,
  'width': widthLessMargins,
  'transform': `translate(${margin.left},${margin.top})`
})

var format = d3.format(",d");

var color = d3.scaleSequential(d3.interpolateMagma)
    .domain([-4, 4]);

var stratify = d3.stratify()//.parentId(d => d.parent);

var pack = d3.pack()
    .size([widthLessMargins - 2, heightLessMargins - 2])
    .padding(3);

// let makeRoot = (data) => {
//   return stratify(data)
//     .id(d => d.name)
//     .parentId(d => d.parent)
//     .sum(valFn)
//     .sort(sortFn);
// }

let hovered = (hover) => {
  return d => {
    d3.selectAll(d.ancestors().map(nodeFn)
    ).classed("node--hover", hover);
  }
}

// function prepData(data){
//   var rootData = makeRoot(data);
//   return pack(rootData);
// }

function buildChart(data){

  //stratify data
  // stratify data
  var stratRootData = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent)
    (data)
    .sum(d => d.value)
    .sort((a,b) => a.value - b.value);
    
      //make a ROOT?!
    var root = d3.hierarchy(stratRootData)  // <-- 1
    .sum(function (d) { return d.value});  // <-- 2

  let packedData = pack(root)
   
  var node = svgObj.selectAll("g")
    .data(packedData.descendants())
    .enter().append("g")
      .attrs({
        "transform": d => `translate(${d.x},${d.y})`,
        "class": d => "nodeGWrapper node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root")
      })
      .each(function(d) {
        return d.thisNode = this })
      .on("mouseover", hovered(true))
      .on("mouseout", hovered(false));

  node.append("circle")
    .attrs({
      "id": d => "node-" + d.name,
      "r": d => d.r
    })
    .style("fill", d => color(d.depth))

  var childlessNode = node.filter(d => !d.children);

  childlessNode.append("clipPath")
      .attr("id", d => "clip-" + d.data.id)
    .append("use")
      .attr("xlink:href", d => `#node-${d.data.id}`);

  childlessNode.append("text")
      .attr("clip-path", d => `url(#clip-${d.data.id})`)
      .text(d => d.data.id);

  node.append("title")
      .text(d => d.data.id + "\n" + format(d.value));
}

function resize(){
    svgObj.selectAll('*').remove();

    let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

      //set svg dims
    svgObj.attrs({
        'height': heightLessMargins,
        'width': widthLessMargins,
        'transform': `translate(${margin.left},${margin.top})`
    })

    //reset three dims
    pack.size([widthLessMargins - 20, heightLessMargins - 20])

    buildChart(globalData)
}

let globalData;

d3.json("data.json", (error, data) => {
  if (error) throw error;

  globalData = data;
  buildChart(globalData);
  
});

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize);