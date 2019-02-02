function getDimsFromParent(p){
  
  // Extract the width and height that was computed by CSS.
  let resizedWidth = p.clientWidth;
  let resizedHeight = p.clientHeight;
  const widthLessMargins = resizedWidth - margin.left - margin.right;
  const heightLessMargins = resizedHeight - margin.top - margin.bottom;
  return {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins}
}

var svgObj = d3.select("#chartDiv").append('svg');

const margin = { left: 10, right: 10, top: 10, bottom: 10 };

let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

svgObj.attrs({
  'height': heightLessMargins,
  'width': widthLessMargins,
  'transform': `translate(${margin.left},${margin.top})`
})

diameter = (resizedWidth < resizedHeight) ? resizedWidth * .93 : resizedHeight * .93,
gObj = svgObj.append("g")
  .attr('class', 'gWrapper')
  .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var packFn = d3.pack()
    .size([diameter - margin.left, diameter - margin.left])
    .padding(3);

let allNodes, circles;

const zoomFn = d => {
  var focus = d;

  var transition = d3.transition()
      .duration(550)
      .tween("zoom", ()  => {
        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin.left]);
        return t => zoomTo(i(t));
      });

  transition.selectAll("text")
    .filter(function(d) { 
      return d.parent === focus || this.style.display === "inline"; 
    })
    .style("fill-opacity", d => d.parent === focus ? 1 : 0)
    .on("start", function(d) { 
      if (d.parent === focus) this.style.display = "inline"; 
    })
    .on("end", function(d) { 
      if (d.parent !== focus) this.style.display = "none"; 
    });
}

function zoomTo(v) {
  var k = diameter / v[2]; view = v;
  allNodes.attr("transform", (d) => `translate(${ (d.x - v[0]) * k }, ${ (d.y - v[1]) * k })`);
  circles.attr("r", d => d.r * k);
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
    .enter().append("g").attr('class', 'circleG').append("circle")
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
  
  svgObj.style("background", color(-1))
  .on("click", () => zoomFn(rootNode));

  zoomTo([rootNode.x, rootNode.y, rootNode.r * 2 + margin.left]);
}


d3.json("data.json", function(error, rootNode) {
  if (error) throw error;

  globalData = rootNode;
  buildChart(globalData);

});