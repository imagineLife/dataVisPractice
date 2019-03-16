const appendCircle = (parent, atrObj, fill,stroke) => {
  return parent.append("circle")
  .attrs(atrObj)
  .style("fill", fill)
  .style("stroke", stroke)
}

const appendStop = (parent, offset, stopColor) => {
  return parent.append('stop')
  .attr("offset", offset)
  .style("stop-color", stopColor)
}

const appendRect = (parent,attrsObj) => {
  return parent.append('rect')
    .attrs(attrsObj)
    .style("shape-rendering", "crispEdges")
    .style("fill", "#FFFFFF")
}

var width = 80,
    height = 180,
    maxTemp = 20.2,
    minTemp = 15.4,
    currentTemp = 19.2;

var bottomY = height - 5,
    topY = 5,
    bulbRadius = 20,
    tubeWidth = 21.5,
    tubeBorderWidth = 1,
    mercuryColor = "rgb(230,0,0)",
    innerBulbColor = "rgb(230, 200, 200)"
    tubeBorderColor = "#999999";

var bulb_cy = bottomY - bulbRadius,
    bulb_cx = width/2,
    top_cy = topY + tubeWidth/2;


var svg = d3.select("#thermo")
  .append("svg")
  .attrs({
    "width": width,
    "height": height
  });


var defs = svg.append("defs");

// Define the radial gradient for the bulb fill colour
var bulbGradient = defs.append("radialGradient")
  .attrs({
    "id": "bulbGradient",
    "cx": "50%",
    "cy": "50%",
    "r": "50%",
    "fx": "50%",
    "fy": "50%"
  });

let bulbGradStopOne = appendStop(bulbGradient, "0%", innerBulbColor)
let bulbGradStopTwo = appendStop(bulbGradient, "90%", mercuryColor)

let whiteTubeTopAttrs = {
  "r": tubeWidth/2,
  "cx": width/2,
  "cy": top_cy
}
// Circle element for rounded tube top
let roundedTubeTop = appendCircle(svg, whiteTubeTopAttrs, "#FFFFFF",tubeBorderColor)
  .style("stroke-width", tubeBorderWidth + "px");


let tubeRectAttrs = {
  "x": width/2 - tubeWidth/2,
  "y": top_cy,
  "height": bulb_cy - top_cy,
  "width": tubeWidth
}
// Rect element for tube
let tubeRect = appendRect(svg, tubeRectAttrs)
  
  .style("stroke", tubeBorderColor)
  .style("stroke-width", tubeBorderWidth + "px");


let whiteFillAttrs = {
  "r": tubeWidth/2 - tubeBorderWidth/2,
  "cx": width/2,
  "cy": top_cy
}

let redBulbAttrs = {
  "r": bulbRadius,
  "cx": bulb_cx,
  "cy": bulb_cy
}


// White fill for rounded tube top circle element
// to hide the border at the top of the tube rect element
let whiteFillCircle = appendCircle(svg, whiteFillAttrs, "#FFFFFF",'none')

// Main bulb of thermometer (empty), white fill
let mainThermoBulb = appendCircle(svg, redBulbAttrs, "#FFFFFF", tubeBorderColor)
  .style("stroke-width", tubeBorderWidth + "px");

let tubeFillColorAttrs = {
  "x": width/2 - (tubeWidth - tubeBorderWidth)/2,
  "y": top_cy,
  "height": bulb_cy - top_cy,
  "width": tubeWidth - tubeBorderWidth
}
// Rect element for tube fill colour
let tubeFillColor = appendRect(svg, tubeFillColorAttrs)
  .style("stroke", "none");


// Scale step size
var step = 5;

// Determine a suitable range of the temperature scale
var domain = [
  step * Math.floor(minTemp / step),
  step * Math.ceil(maxTemp / step)
  ];

if (minTemp - domain[0] < 0.66 * step)
  domain[0] -= step;

if (domain[1] - maxTemp < 0.66 * step)
  domain[1] += step;


// D3 scale object
var scale = d3.scaleLinear()
  .range([bulb_cy - bulbRadius/2 - 8.5, top_cy])
  .domain(domain);


// Max and min temperature lines
[minTemp, maxTemp].forEach(function(t) {

  var isMax = (t == maxTemp),
      label = (isMax ? "max" : "min"),
      textCol = (isMax ? "rgb(230, 0, 0)" : "rgb(0, 0, 230)"),
      textOffset = (isMax ? -4 : 4);

  svg.append("line")
    .attrs({
      "id": label + "Line",
      "x1": width/2 - tubeWidth/2,
      "x2": width/2 + tubeWidth/2 + 22,
      "y1": scale(t),
      "y2": scale(t)
    })
    .style("stroke", tubeBorderColor)
    .style("stroke-width", "1px")
    .style("shape-rendering", "crispEdges");

  svg.append("text")
    .attrs({
      "x": width/2 + tubeWidth/2 + 2,
      "y": scale(t) + textOffset,
      "dy": isMax ? null : "0.75em"
    })
    .text(label)
    .style("fill", textCol)
    .style("font-size", "11px")

});


var tubeFill_bottom = bulb_cy,
    tubeFill_top = scale(currentTemp);

let redMurcRectAttrs = {
  "x": width/2 - (tubeWidth - 10)/2,
  "y": tubeFill_top,
  "width": tubeWidth - 10,
  "height": tubeFill_bottom - tubeFill_top
}
// Rect element for the red mercury column
let redRect = appendRect(svg, redMurcRectAttrs)
  .style("fill", mercuryColor)

let mainBulbFillAttrs = {
  "r": bulbRadius - 6,
  "cx": bulb_cx,
  "cy": bulb_cy
}

// Main thermometer bulb fill
let mainFillBulb = appendCircle(svg, mainBulbFillAttrs, "url(#bulbGradient)", mercuryColor)
  .style("stroke-width", "2px");


// Values to use along the scale ticks up the thermometer
var tickValues = d3.range((domain[1] - domain[0])/step + 1).map(function(v) { return domain[0] + v * step; });


// D3 axis object for the temperature scale
var axis = d3.axisLeft()
  .scale(scale)
  .tickValues(tickValues)

// Add the axis to the image
var svgAxis = svg.append("g")
  .attr("id", "tempScale")
  .attr("transform", "translate(" + (width/2 - tubeWidth/2) + ",0)")
  .call(axis);

// Format text labels
svgAxis.selectAll(".tick text")
    .style("fill", "#777777")
    .style("font-size", "10px");

// Set main axis line to no stroke or fill
svgAxis.select("path")
  .style("stroke", "none")
  .style("fill", "none")

// Set the style of the ticks 
svgAxis.selectAll(".tick line")
  .style("stroke", tubeBorderColor)
  .style("shape-rendering", "crispEdges")
  .style("stroke-width", "1px");


