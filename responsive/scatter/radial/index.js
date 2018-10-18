function getClientDims(parentDiv, marginObj){

  // Extract the DIV width and height that was computed by CSS.
  let cssDivWidth = parentDiv.clientWidth;
  let cssDivHeight = parentDiv.clientHeight;
  
  //get css-computed dimensions
  const divWidthLessMargins =cssDivWidth - marginObj.l - marginObj.r;
  const divHeightLessMargins = cssDivHeight - marginObj.t - marginObj.b;
  
  return { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins };
}

function setSVGDims(obj, w, h){
  obj.attrs({
    "width" : w,
    "height" : h
  });
}

function updateData(){
  let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, v.m)
  setSVGDims(svgObj, cssDivWidth, cssDivHeight);
  gObj.attr('transform', `translate(${cssDivWidth / 2},${cssDivHeight / 2 })`)
  chartRadius = Math.min(cssDivHeight, cssDivWidth)/ 2 * .9;
  yScale.range([chartRadius, 0])
  singleCircleRadiusScale.range([0,(chartRadius * .3)]);

  circularAxis.attr('r', yScale);
  d3.selectAll('.singleCircle').attrs({
    'transform': d => getTransCoords(d),
    'r': d => singleCircleRadiusScale(d.noteDuration)
  })

}

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
  // console.log('reMap`d oldVal ',oldValue)
  // console.log('reMap`d newVal ',newValue)
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

//DATA breakdown
//first is 'x'
  /*
    in the d3Line fn, x has to be...
      1. converted to the 360 degree scale'd value (xScale)
      2. converted to a coordinate, in prep for the d3LineFn
  */
//second is 'y'
//third is radius
//fourth is label
var dummyData = [
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

var d3Line = d3.radialLine();
var yScale = d3.scaleLinear();
var singleCircleRadiusScale = d3.scaleLinear();
var xScale = d3.scaleLinear();
var colorScale = d3.scaleOrdinal(d3.schemeDark2);
var circularAxis;

function buildChart(data){
  // Extract the DIV width and height that was computed by CSS.
  let cssDivWidth = chartDiv.clientWidth;
  let cssDivHeight = chartDiv.clientHeight;

  //get css-computed dimensions less margins
  const divWidthLessMargins = cssDivWidth - v.m.l - v.m.r;
  const divHeightLessMargins = cssDivHeight - v.m.t - v.m.b;

  //set svg height & width from div computed dimensions
  //NOTE: can be the divLessMargins, for 'padding' effect
  setSVGDims(svgObj, cssDivWidth, cssDivHeight)

  //translate the gWrapper
  gObj.attr('transform', `translate(${cssDivWidth/2},${cssDivHeight/2})`);

  let chartRadius = Math.min(cssDivWidth, cssDivHeight) / 2  * .9; // radius of the whole chart

  
  yScale.domain([0,12])
    .range([chartRadius, 0]);

  
  singleCircleRadiusScale.domain(d3.extent(data, d => d.noteDuration))
    .range([0,120]);


  // console.log('xScaleDomain')
  // console.log(d3.extent(data, d => d.startedBeat))
  xScale.domain([1,4.999]).range([0,360])

  var radiusAxis = gObj.append('g')
    .attr('class', 'radius axis')
    .selectAll('g')
    .data(yScale.ticks(5))
    .enter().append('g').attr('class','rAxisAppendedG');

  circularAxis = radiusAxis.append('circle')
    .attrs({
      'r': yScale,
      'class': 'circularAxis'
    });

  var straightLineAxis = gObj.append('g')
    .attr('class', 'straightLine axis')
    .selectAll('g')
    .data(d3.range(0, 360, 45)) // line density (minVal?, maxVal?, percent between)
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



  d3Line.radius(d => {
      let yVal = +d.halfStepsMoved
      return yScale(yVal)
    })
    .angle(d => -reMap(xScale(d.startedBeat)) + Math.PI / 2)

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
      'r': d => singleCircleRadiusScale(d.noteDuration),
      'stroke': (d,i) => colorScale(d.chordTone),
      'stroke-opacity': .7,
      'fill': (d) => colorScale(d.chordTone),
      'fill-opacity': 0.1,
      // 'fill':'none'
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

}

fetch('data.json').then(res =>
  res.json().then(res => {
    buildChart(res);
  }))

//Resise listener & fn call
d3.select(window).on('resize',updateData);