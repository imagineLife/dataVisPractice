function makeObjsFromParent(parent){
  let svgObj = d3.select(parent),
  svgW = +svgObj.attr("width"),
  svgH = +svgObj.attr("height"),
  gObj = svgObj.append("g").attr("transform", "translate(40,0)");
  return {svgObj, svgW, svgH, gObj}
}

function getParentFromD(d){
  return d.id.substring(0, d.id.lastIndexOf("."))
}

function mySort(a, b){
  return a.height - b.height
}

function setText(d){
  return d.id.substring(d.id.lastIndexOf(".") + 1)
}

function buildChart(data){
  var stratData = stratify(data).sort(mySort);
  console.log('stratData')
  console.log(stratData)

    // Add the links (given by calling tree(root), which also adds positional x/y coordinates) for the nodes
    var link = gObj.selectAll(".link")
            .data(tree(stratData).links())
        .enter().append("path")
            .attrs({
              "class": "link",
              "d": d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)
            });

    // Add groups for each node in the hierarchy with circles and text labels
    var node = gObj.selectAll(".node")
        .data(stratData.descendants())
        .enter().append("g")
            .attrs({
              "class": d => "node" + (d.children ? " node--internal" : " node--leaf"),
              "transform": d => `translate(${d.y},${d.x})`
            })
    node.append("circle")
        .attr("r", 2.5);
    node.append("text")
        .attrs({
          "dy": 3,
          "x": d => d.children ? -8 : 8,
          'class':'nodeText'
        })
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(setText);
}

let {svgObj, svgW, svgH, gObj} = makeObjsFromParent('svg');
  
var tree = d3.tree()
    .size([svgH, svgW - 160]);

var stratify = d3.stratify()
    .parentId(getParentFromD);

d3.csv("./data.csv", function(error, data) {
    if (error) throw error;
    
    buildChart(data);
});