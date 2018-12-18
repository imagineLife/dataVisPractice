 // Variables
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Create primary <g> element
var g = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

// Data strucure
var partition = d3.partition()
    .size([2 * Math.PI, radius]);

var arcFn = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);

function makeRoot(data){
  // Find data root
  var root = d3.hierarchy(data)
      .sum(d => +d.size);

  // Size arcs
  return partition(root);
}

d3.json('./data.json', data => {
  buildChart(data)
})

function buildChart(data){
  console.log('BUILD CHART!');

    let rootedData = makeRoot(data);

    // Put it all together
    let myPath = g.selectAll('path')
      .data(rootedData.descendants())
      .enter().append('path')
        .attrs({
          "display": d => d.depth ? null : "none",
          "d": arcFn,
          'class':'partition'
        })
        .style('stroke', '#fff')
        .style("fill", d => colorScale((d.children ? d : d.parent).data.name));
    myPath.append('title')
      .text(d => {
        console.log('d')
        console.log(d)
        return `${d.data.name}: ${d.value}`
      });

}