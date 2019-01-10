const state = {
	xLabel : 'Year',
	yLabel : 'Population',
	xValue : d => d.date,
	yValue : d => d.close,
	margin : { 
		left: 30, 
		right: 50,
		top: 50,
		bottom: 120
	}

}

//Select/Create div, svg, g
const chartDiv = document.getElementById('chartDiv');     
const svgObj = d3.select(chartDiv).append("svg").attrs({
  'border': '2px solid green',
  'class': 'area'
});
const gObj = svgObj.append('g').attr('class','gWrapper');

// Extract the DIV width and height that was computed by CSS.
let parentDivWidth = chartDiv.clientWidth;
let parentDivHeight = chartDiv.clientHeight;

//get css-computed dimensions
const divWidthLessMargins =parentDivWidth - state.margin.left - state.margin.right;
const divHeightLessMargins = parentDivHeight - state.margin.top - state.margin.bottom;

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
  "width" : parentDivWidth,
  "height" : parentDivHeight
});

//translate the gWrapper
gObj.attr('transform', `translate(${state.margin.left},${state.margin.top})`);


var margin = {top: 20, right: 20, bottom: divHeightLessMargins * .75, left: 40},
    margin2 = {top: divHeightLessMargins * .85, right: 20, bottom: 30, left: 40},
    height = +svgObj.attr("height") - margin.top - margin.bottom,
    height2 = +svgObj.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%b %Y");

var xScale = d3.scaleTime().range([state.margin.left, divWidthLessMargins]),
    xScale2 = d3.scaleTime().range([state.margin.left, divWidthLessMargins]),
    yScale = d3.scaleLinear().range([height, state.margin.top]),
    y2 = d3.scaleLinear().range([height2, state.margin.top]);

var xAxis = d3.axisBottom(xScale),
    xAxis2 = d3.axisBottom(xScale2),
    yAxis = d3.axisLeft(yScale);

var brush = d3.brushX()
    .extent([[0, 0], [divWidthLessMargins, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [divWidthLessMargins, height]])
    .extent([[0, 0], [divWidthLessMargins, height]])
    .on("zoom", zoomed);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return xScale(d.date); })
    .y0(height)
    .y1(function(d) { return yScale(d.price); });

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return xScale2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.price); });

svgObj.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", divWidthLessMargins)
    .attr("height", height);

var focus = svgObj.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svgObj.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("./data.csv", type, function(error, data) {
  if (error) throw error;

  xScale.domain(d3.extent(data, function(d) { return d.date; }));
  yScale.domain([0, d3.max(data, function(d) { return d.price; })]);
  xScale2.domain(xScale.domain());
  y2.domain(yScale.domain());

  focus.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

  context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area2);

  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, xScale.range());

  svgObj.append("rect")
      .attr("class", "zoom")
      .attr("width", divWidthLessMargins)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);
});

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || xScale2.range();
  xScale.domain(s.map(xScale2.invert, xScale2));
  focus.select(".area").attr("d", area);
  focus.select(".axis--x").call(xAxis);
  svgObj.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(divWidthLessMargins / (s[1] - s[0]))
      .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  xScale.domain(t.rescaleX(xScale2).domain());
  focus.select(".area").attr("d", area);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, xScale.range().map(t.invertX, t));
}

function type(d) {
  d.date = parseDate(d.date);
  d.price = +d.price;
  return d;
}

//2. Resize fn
   // let resize = () => {
       
   //     // Extract the width and height that was computed by CSS.
   //     let resizedFnWidth = chartDiv.clientWidth;
   //     let resizedFnHeight = chartDiv.clientHeight;

   //     //set svg dimension based on resizing attrs
   //     svgObj.attrs({
   //         "width" : resizedFnWidth,
   //         "height" : resizedFnHeight
   //     });

   //     //calc resized dimensions less margins
   //     let resizedWidthLessMargins = resizedFnWidth - vars.margin.left - vars.margin.right;
   //     let resizedHeightLessMargins = resizedFnHeight - vars.margin.top - vars.margin.bottom;

   //     //update scale ranges
   //     xScale.range([0, resizedWidthLessMargins]);
   //     yScale.range([resizedHeightLessMargins, vars.margin.top]);
       
   //     //Update the X-AXIS
   //     xAxisG
   //         .attrs({
   //             'transform': `translate(0, ${resizedHeightLessMargins})`,
   //             'x' : divWidthLessMargins / 2,
   //             'y' : resizedHeightLessMargins * .1,
   //         })
   //         .call(xAxis);

   //     //Update the X-AXIS LABEL
   //     xAxisLabel
   //         .attrs({
   //           'x' : resizedWidthLessMargins / 2
   //         })

   //     //Update the Y-AXIS
   //     yAxisG
   //         .attrs({
   //             'x' : -resizedHeightLessMargins / 2,
   //             'y' : -vars.margin.left / 2,
   //         })
   //         .call(yAxis);

   //     //Update yAxis Label
   //     yAxisLabel.attrs({
   //         'x' : -resizedHeightLessMargins / 2,
   //         'y' : -vars.margin.left / 1.5,
   //     });

   //     //update gridLines
   //     d3.selectAll('.yLine')
   //         .attr('x2', resizedWidthLessMargins);
       
   //     d3.selectAll('.xLine')
   //         .attr('y2', -resizedHeightLessMargins);
	   
	  //  //update Line
	  //  line.attr("d", lineObj(parsedData));

	  //  //update beginning of area 
	  //  areaObj.y0(resizedHeightLessMargins)

	  //  //update Area
	  //  areaPath.attr("d", areaObj(parsedData))

   // }       

//Add Resise listener & fn call
   // window.addEventListener("resize", resize);