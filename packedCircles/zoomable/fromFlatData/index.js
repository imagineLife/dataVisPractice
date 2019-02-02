var svg = d3.select("svg"),
    margin = 20,
    diameter = +svg.attr("width"),
    gObj = svg.append("g")
      .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var packFn = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(3);

let allNodes, circles;

const zoomFn = d => {
  var focus = d;

  var transition = d3.transition()
      .duration(550)
      .tween("zoom", ()  => {
        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
        return function(t) { zoomTo(i(t)); };
      });

  transition.selectAll("text")
    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
      .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
      .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
      .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v) {
  // console.log('zoomTo v')
  // console.log(v)
  
  var k = diameter / v[2]; view = v;
  allNodes.attr("transform", (d) => `translate(${ (d.x - v[0]) * k }, ${ (d.y - v[1]) * k })`);
  circles.attr("r", function(d) { return d.r * k; });
}


let globalData = null;

function prepData(srcData){
   //  //stratify data
  var stratRootData = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent)
    (srcData)
    .sum(d => d.value)
    .sort((a,b) => a.value - b.value);

  //make a ROOT?!
  var rootNode = d3.hierarchy(stratRootData)  // <-- 1
  .sum(function (d) { return d.value});  // <-- 2
  
  let packedData = packFn(rootNode)
  let packedChildren = packedData.descendants();
  return{ rootNode, packedData, packedChildren }
}

function buildChart(data){

  let { rootNode, packedData, packedChildren } = prepData(data);

  var focus = rootNode,
      view;

  circles = gObj.selectAll("circle")
    .data(packedChildren)
    .enter().append("circle")
      .attr("class", d => d.parent ? d.children ? "node" : "node node--leaf" : "node node--root")
      .style("fill", d => d.children ? color(d.depth) : null)
      .on("click", d => { 
        if (focus !== d) {
          zoomFn(d);
          d3.event.stopPropagation();
        }
      });

  var text = gObj.selectAll("text")
    .data(packedChildren)
    .enter().append("text")
      .attr("class", d => d.parent ? d.children ? "nodeLabel" : "node-leafLabel" : "node-rootLabel")
      .style("fill-opacity", d => d.parent === rootNode ? 1 : 0)
      .style("display", d => d.parent === rootNode ? "inline" : "none")
      .text(d => d.data.id);

  allNodes = gObj.selectAll("circle,text");
  
  svg.style("background", color(-1))
  .on("click", () => zoomFn(rootNode));

  zoomTo([rootNode.x, rootNode.y, rootNode.r * 2 + margin]);
}


d3.json("data.json", function(error, rootNode) {
  if (error) throw error;

  globalData = rootNode;
  buildChart(globalData);

});