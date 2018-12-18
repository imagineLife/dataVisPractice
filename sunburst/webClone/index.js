 // Variables
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Create primary <g> element
var chartDiv = d3.select('.chartDiv')
var svgObj = chartDiv.append('svg')
    .attr('width', width)
    .attr('height', height)
var gObj = svgObj.append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

// Data strucure
var pt = d3.partition();

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
  return pt(root);
}

d3.json('./data.json', data => {
  buildChart(data)
})

function buildChart(data){

    pt.size([2 * Math.PI, radius]);

    let rootedData = makeRoot(data);

     // Add a <g> element for each node in thd data, then append <path> elements and draw lines based on the arc
    // variable calculations. Last, color the lines and the slices.
    let sliceGs = gObj.selectAll('g')
        .data(rootedData.descendants());
    
    let sliceGs = sliceGs.enter()
          .append('g')
          .attr("class", "sliceGWrapper")
    
    let singlePath = sliceGs.append('path')
      .attrs({
        "display": d => d.depth ? null : "none",
        "d": arcFn,
        'class':'singlePath'
      })
      .style('stroke', '#fff')
      .style("fill", function (d) { return colorScale((d.children ? d : d.parent).data.name); });

}