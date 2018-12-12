let sortFn = (a,b) => b.value - a.value;
let valFn = d => d.value;
let nodeFn = d => d.thisNode;
let allButLastSegment = d => d.id.substring(0, d.id.lastIndexOf("."));

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var format = d3.format(",d");

var color = d3.scaleSequential(d3.interpolateMagma)
    .domain([-4, 4]);

var stratify = d3.stratify().parentId(allButLastSegment);

var pack = d3.pack()
    .size([width - 2, height - 2])
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

d3.csv("data.csv", (error, data) => {
  if (error) throw error;

  var root = makeRoot(data);

  pack(root);

  var node = svg.selectAll("g")
    .data(root.descendants())
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
});