//POLAR AREA 
//  http://stackoverflow.com/questions/33695073/javascript-polar-scatter-plot-using-d3-js/33710021#33710021
//re-map fn from...  
//  http://stackoverflow.com/a/929107

const v = {
  m: {
    l: 140, 
    // right: 200, put back if adding legend
    r: 75,
    t: 20,
    b: 120
  }
}

// https://en.wikipedia.org/wiki/Polar_coordinate_system
// first is position clockwise, aka angular coordinate, polar angle, or azimuth. range from 0 - 359
// second is ring (range 0 to 1), aka Radial Coordinate
// third is node size radius (center to edge)
function reMap(oldValue){
  var oldMax = -359,
      newMax = (Math.PI * 2),
      newValue = (((oldValue - 90) * newMax) / oldMax);
  console.log('reMap`d oldVal ',oldValue)
  console.log('reMap`d newVal ',newValue)
  return newValue;
}

// var zoom = d3.behavior.zoom()
//     .scaleExtent([1, 10])
//     .on("zoom", zoomed);

// function zoomed() {
//   svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
// }

// function dragstarted(d) {
//   d3.event.sourceEvent.stopPropagation();
//   d3.select(this).classed("dragging", true);
// }

// function dragged(d) {
//   d3.select(this).attrs({
//     "cx": d.x = d3.event.x,
//     "cy": d.y = d3.event.y
//   })
// }

// function dragended(d) {
//   d3.select(this).classed("dragging", false);
// }

function getTransCoords(d){
  let thisCoord =  d3Line([d]).slice(1).slice(0, -1); // removes 'M' and 'Z' from string
    return 'translate(' + thisCoord + ')'
}

//build elements with D3
const chartDiv = document.getElementById('chartDiv');
const svgObj = d3.select(chartDiv).append("svg").attr("class",'svgObj');
const gObj = svgObj.append('g').attr('class','gWrapper');

// Extract the DIV width and height that was computed by CSS.
let cssDivWidth = chartDiv.clientWidth;
let cssDivHeight = chartDiv.clientHeight;

//get css-computed dimensions less margins
const divWidthLessMargins = cssDivWidth - v.m.l - v.m.r;
const divHeightLessMargins = cssDivHeight - v.m.t - v.m.b;

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
  "width" : cssDivWidth,
  "height" : cssDivHeight
});

//translate the gWrapper
gObj.attr('transform', `translate(${cssDivWidth/2},${cssDivHeight/2})`);

const chartRadius = Math.min(cssDivWidth, cssDivHeight) / 2 - 30; // radius of the whole chart

var radiusScale = d3.scaleLinear()
  .domain([0, 12])
  .range([0, chartRadius]);

var circleRadiusScale = d3.scaleLinear()
  .domain([0,50])
  .range([0,(chartRadius * .3)]);

var colorScale = d3.scaleOrdinal(d3.schemeDark2);

var convertedValueScale = d3.scaleLinear()
  .domain([0,4.99]).range([0,360])

//DATA breakdown
//first is 'x'
  /*
    in the d3Line fn, x has to be...
      1. converted to the 360 degree scale'd value (convertedValueScale)
      2. converted to a coordinate, in prep for the d3LineFn
  */
//second is 'y'
//third is radius
//fourth is label
var data = [
  {
    x : .5, 
    y :3,
    count : 6,
    label : 'label 1'
  },
  {
    x: 1.5,
    y: 6,
    count: 12,
    label: 'label 2'
  },
  {
    x: 2.5,
    y: 8,
    count: 37,
    label: 'label 3'
  },
  {
    x: 4.5,
    y: 11,
    count: 49,
    label: 'label 4'
  }
];

  console.log('huh?!')
  console.log(radiusScale.ticks(5))
var radiusAxis = gObj.append('g')
  .attr('class', 'radius axis')
  .selectAll('g')
  .data(radiusScale.ticks(5))
  .enter().append('g').attr('class','rAxisAppendedG');

var circularAxis = radiusAxis.append('circle')
  .attrs({
    'r': radiusScale,
    'class': 'circularAxis'
  });

var straightLineAxis = gObj.append('g')
  .attr('class', 'straightLine axis')
  .selectAll('g')
  .data(d3.range(0, 360, 30)) // line density (minVal?, maxVal?, percent between)
  .enter().append('g')
  .attrs({
    'transform': d => 'rotate(' + -d + ')',
    'class': 'straightLineG'
  });

straightLineAxis.append('line')
  .attrs({
    'x2': chartRadius,
    'class': 'straightLineAxis'
  });



var d3Line = d3.radialLine()
  .radius(d => {
    let yVal = d.y
    return radiusScale(yVal)
  })
  .angle(d => -reMap(convertedValueScale(d.x)) + Math.PI / 2)

var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.text("a simple tooltip");

gObj.selectAll('singleCircle')
  .data(data)
  .enter()
  .append('circle')
  .attrs({
    'class': 'singleCircle',
    'transform': d => getTransCoords(d),
    'r': d => circleRadiusScale(d.count),
    'stroke': (d,i) => colorScale(i),
    'fill':'none'
  })
  .on("click", (d) => console.log(d))
    // add to click if I want a tooltip
    //return tooltip.style("visibility", "visible");
  // });



// adding labels
gObj.selectAll('singleCircle')
  .data(data)
  .enter().append("text")
  .attr('transform',d => getTransCoords(d))
  // .text(d => d[3]).attr('fill', 'white'); //adds an optional label if there is a 4th element in the data

