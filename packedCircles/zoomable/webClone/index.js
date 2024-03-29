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
    .padding(2);

let allNodes, circles;

const zoomFn = d => {
  // console.log('d')
  // console.log(d)
  // console.log('view')
  // console.log(view)
  
  
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
  console.log('zoomTo v')
  console.log(v)
  
  var k = diameter / v[2]; view = v;
  allNodes.attr("transform", (d) => `translate(${ (d.x - v[0]) * k }, ${ (d.y - v[1]) * k })`);
  circles.attr("r", function(d) { return d.r * k; });
}

d3.json("flare.json", function(error, root) {
  if (error) throw error;

  root = d3.hierarchy(root)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus = root,
      childNodes = packFn(root).descendants(), 
      view;

  circles = gObj.selectAll("circle")
    .data(childNodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .on("click", function(d) { 
        if (focus !== d) {
          zoomFn(d);
          d3.event.stopPropagation();
        }
      });

  var text = gObj.selectAll("text")
    .data(childNodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .text(function(d) { return d.data.name; });

  allNodes = gObj.selectAll("circle,text");
  
  svg.style("background", color(-1))
  .on("click", () => zoomFn(root));

  zoomTo([root.x, root.y, root.r * 2 + margin]);
});