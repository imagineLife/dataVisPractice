let diameter = 960,
    format = d3.format(",d"),
    color = d3.scaleOrdinal(d3.schemeCategory20c);

let d3Pack = d3.pack()
    .size([diameter, diameter])
    .padding(1.5);

let svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

d3.json("data.json", function(error, data) {
  if (error) throw error;

  let flatData = classes(data);
  console.log('flatData.children')
  console.log(flatData.children)
  let root = d3.hierarchy(flatData)
      .sum(function(d) { return d.value; })
      .sort(function(a, b) { return b.value - a.value; });

  d3Pack(root);
  let node = svg.selectAll(".node")
      .data(root.children)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.data.className + ": " + format(d.value); });

  node.append("circle")
      .attr("r", d => d.r)
      .style("fill", d => color(d.data.packageName));

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.className.substring(0, d.r / 3); });
});

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  let classes = [];

  function recurse(name, node) {
    if (node.children){
      console.log('IF')
      console.log(node)
      node.children.forEach(child => recurse(node.name, child));
    } else {
      console.log('ELSE')
      console.log(node)
      classes.push({packageName: name, className: node.name, value: node.size});
    }
  }

  recurse(null, root);
  console.log('classes')
  console.log(classes)
  return {children: classes};

}

d3.select(self.frameElement).style("height", diameter + "px");