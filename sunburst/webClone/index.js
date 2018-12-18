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
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    .attr('class', 'gWrapper');

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

/*

  Calculate the correct distance to rotate each label based on its location in the sunburst.
  @param {Node} d
  @return {Number}

  TRANSLATE: "translate(" + arc.centroid(d) + ")" moves the reference point for this <text> element to the center of each arc (the variable we defined above). 
  The centroid command from d3 computes the midpoint [x, y] of each arc.
  ROTATE: "rotate(" + computeTextRotation(d) + ")" then we'll rotate our <text> element a specified number of degrees. We'll do that calc in a separate function below.

*/

function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;

    // Avoid upside-down labels
    return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
}

function transformText(d){
  return "translate(" + arcFn.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"
}

d3.json('./data.json', data => {
  buildChart(data)
})

function buildChart(data){

    pt.size([2 * Math.PI, radius]);

    let rootedData = makeRoot(data);

     // Add a <g> element for each node in thd data, then append <path> elements and draw lines based on the arc
    // variable calculations. Last, color the lines and the slices.
    let sliceDataJoin = gObj.selectAll('g')
        .data(rootedData.descendants());
    
    let sliceGs = sliceDataJoin.enter()
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

    // Populate the <text> elements with our data-driven titles.
    gObj.selectAll(".sliceGWrapper")
      .append("text")
      .attrs({
        "transform": transformText,
      // .attr("dx", "-10") // radius margin OPTIONAL?!
        "dy": ".5em", // rotation align
        'text-ancor': 'middle',
        'class': 'sliceText'
      })
      .text(d => d.parent ? d.data.name : "");
}