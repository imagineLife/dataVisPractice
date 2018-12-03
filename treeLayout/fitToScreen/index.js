function makeObjsFromParent(parent){
  let chartObj = d3.select('#chartDiv'),
  svgObj = chartObj.append('svg'),
  svgW = +svgObj.attr("width"),
  svgH = +svgObj.attr("height"),
  gObj = svgObj.append("g");
  return {chartObj, svgObj, svgW, svgH, gObj}
}

const vars = {
  margin : { left: 20, right: 20, top: 20, bottom: 20 }
};

let getParentFromD = (d) => d.id.substring(0, d.id.lastIndexOf("."));

let mySort = (a, b) => a.height - b.height;

let setText = (d) => d.id.substring(d.id.lastIndexOf(".") + 1);

function buildChart(data){

  //stratify data
  var stratRootData = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent)
    (data);

  var nodes = d3.hierarchy(data, d => d.children);

  // Add the links (given by calling tree(root), which also adds positional x/y coordinates) for the nodes
  var link = gObj.selectAll(".link")
    .data(tree(stratRootData).links())
    .enter().append("path")
      .attrs({
        "class": "link",
        "d": d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x)
      });

  // Add groups for each node in the hierarchy with circles and text labels
  var node = gObj.selectAll(".node")
    .data(stratRootData.descendants())
    .enter().append("g")
        .attrs({
          "class": d => "node" + (d.children ? " node--mid" : " node--final"),
          "transform": d => `translate(${d.y},${d.x})`
        })

  let nodeCircle = node.append("circle").attr("r", 2.5);

  let nodeTxt = node.append("text")
    .attrs({
      "dy": 3,
      "x": d => d.children ? -8 : 8,
      'class':'nodeText'
    })
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(setText);
}

let {chartObj, svgObj, svgW, svgH, gObj} = makeObjsFromParent('chartDiv');
  
  // Extract the width and height that was computed by CSS.
  let resizedWidth = chartDiv.clientWidth;
  let resizedHeight = chartDiv.clientHeight;

  const widthLessMargins = resizedWidth - vars.margin.left - vars.margin.right;
  const heightLessMargins = resizedHeight - vars.margin.top - vars.margin.bottom;
  
  svgObj.attrs({
    'height': heightLessMargins,
    'width': widthLessMargins,
    'transform': `translate(${vars.margin.left},${vars.margin.top})`
  })

  gObj.attr('transform', `translate(${vars.margin.left},${vars.margin.top})`)

var tree = d3.tree()
    .size([heightLessMargins, widthLessMargins - 160]);

var stratify = d3.stratify()
    .parentId(getParentFromD);

d3.json("./data.json", function(error, data) {
    if (error) throw error;
    
    buildChart(data);
});