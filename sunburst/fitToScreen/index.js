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
let allButLastSegment = d => d.id.substring(0, d.id.lastIndexOf("."));

const margin = { left: 20, right: 20, top: 40, bottom: 40 };
let rootData, storedNodes;
let {chartObj, svgObj, svgW, svgH} = makeObjsFromParent('chartDiv');  
let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

svgObj.attrs({
  'height': heightLessMargins,
  'width': widthLessMargins,
  'transform': `translate(${margin.left},${margin.top})`
})

console.log('resizedWidth')
console.log(resizedWidth)


var format = d3.format(",d");

var color = d3.scaleSequential(d3.interpolateMagma)
    .domain([-4, 4]);

var stratify = d3.stratify().parentId(allButLastSegment);

var pack = d3.pack()
    .size([widthLessMargins - 2, heightLessMargins - 2])
    .padding(3);

let makeRoot = (data) => {
  return stratify(data)
    .sum(valFn)
    .sort(sortFn);
}

let hovered = (hover) => {
  return d => {
    d3.selectAll(d.ancestors().map(nodeFn)
    ).classed("node--hover", hover);
  }
}

function prepData(data){
  var rootData = makeRoot(data);
  return pack(rootData);
}

function buildChart(data){
  let rootData = prepData(data)

  var node = svgObj.selectAll("g")
    .data(rootData.descendants())
    .enter().append("g")
      .attrs({
        "transform": d => `translate(${d.x},${d.y})`,
        "class": d => "nodeGWrapper node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root")
      })
      .each(function(d) {
        // console.log('each node g THIS') 
        // console.log(this)
        return d.thisNode = this })
      .on("mouseover", hovered(true))
      .on("mouseout", hovered(false));

  node.append("circle")
    .attrs({
      "id": d => "node-" + d.id,
      "r": d => d.r
    })
    .style("fill", d => color(d.depth))

  var childlessNodes = node.filter(d => !d.children);

  childlessNodes.append("clipPath")
      .attr("id", d => "clip-" + d.id)
    .append("use")
      .attr("xlink:href", d => `#node-${d.id}`);

  childlessNodes.append("text")
      .attr("clip-path", d => `url(#clip-${d.id})`)
    .selectAll("tspan")
    .data(d => d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g))
    .enter().append("tspan")
      .attrs({
        "x": 0,
        "y": (d, i, nodes) => 13 + (i - nodes.length / 2 - 0.5) * 10
      })
      .text(d => d);

  node.append("title")
      .text(d => d.id + "\n" + format(d.value));
}

function resize(){
    console.log('resizing!')
    svgObj.selectAll('*').remove();

    let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

      //set svg dims
    svgObj.attrs({
        'height': heightLessMargins,
        'width': widthLessMargins,
        'transform': `translate(${margin.left},${margin.top})`
    })

    //reset three dims
    pack.size([widthLessMargins - 2, heightLessMargins - 2])

    buildChart(globalData)

}

let globalData;

d3.csv("data.csv", (error, data) => {
  if (error) throw error;

  globalData = data;
  buildChart(globalData);
  
});

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize);