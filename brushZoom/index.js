const state = {
	xLabel : 'Year',
	yLabel : 'Population',
	xValue : d => d.date,
	yValue : d => d.close,
  margin : { 
		left: 75, 
		right: 25,
		top: 35,
		bottom: 35
	}
}

let xAxisG = null,
    yAxisG = null,
    xAxisG2 = null;

let chartDiv = document.getElementById('chartDiv');
// Extract the DIV width and height that was computed by CSS.
let parentDivWidth = chartDiv.clientWidth;
let parentDivHeight = chartDiv.clientHeight;
let percent = (parentDivHeight > 510) ? .75 : .65;
let widthLessMargins = parentDivWidth - state.margin.left - state.margin.right;
let heightLessMargins = parentDivHeight * percent;

function makeArea(xScaleFn, y0val, yScaleFn){
  return d3.area()
  .curve(d3.curveMonotoneX)
  .x(d => xScaleFn(d.date))
  .y0(y0val)
  .y1(d => yScaleFn(d.price));
}

var svgObj = d3.select(chartDiv)
  .append('svg')
  .attrs({
    'width': parentDivWidth,
    'height': parentDivHeight,
    'class':'svgObj'
  });

var parseDate = d3.timeParse("%b %Y");

var xScale = d3.scaleTime().range([0, widthLessMargins]),
    xScale2 = d3.scaleTime().range([0, widthLessMargins]),
    y = d3.scaleLinear().range([heightLessMargins, 0]),
    y2 = d3.scaleLinear().range([state.margin.top, 0]);

var xAxis = d3.axisBottom(xScale),
    xAxis2 = d3.axisBottom(xScale2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [widthLessMargins, state.margin.top]])
    .on("brush end", brushed);

var zoomFn = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [widthLessMargins, heightLessMargins]])
    .extent([[0, 0], [widthLessMargins, heightLessMargins]])
    .on("zoom", zoomedFn);

var areaFn = makeArea(xScale, heightLessMargins, y)
var area2Fn = makeArea(xScale2, state.margin.top, y2)

svgObj.append("defs").append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attrs({
    "width": widthLessMargins,
    "height": heightLessMargins
  });

var focusAreaG = svgObj.append("g")
    .attrs({
      "class": "focusedAreaG",
      "transform": `translate(${state.margin.left},${state.margin.top})`
    });

var context = svgObj.append("g")
    .attrs({
      "class": "context",
      "transform": `translate(${state.margin.left},${parentDivHeight - state.margin.top - state.margin.bottom})`
    });

d3.csv("./data.csv", type, function(error, data) {
  if (error) throw error;

  xScale.domain(d3.extent(data, d => d.date));
  y.domain([0, d3.max(data, d => d.price)]);
  xScale2.domain(xScale.domain());
  y2.domain(y.domain());

  focusAreaG.append("path")
      .datum(data)
      .attrs({
        "class": "areaPath",
        "d": areaFn
      });

  xAxisG = focusAreaG.append("g")
      .attrs({
        "class": "axis axis--x",
        "transform": `translate(0,${heightLessMargins})`
      })
      .call(xAxis);

  focusAreaG.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

  context.append("path")
      .datum(data)
      .attrs({
        "class": "areaPath",
        "d": area2Fn
    });

  xAxisG2 = context.append("g")
      .attrs({
        "class": "axis axis--x",
        "transform": `translate(0,${state.margin.top})`
      })
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, xScale.range());

  svgObj.append("rect")
      .attrs({
        "class": "zoom",
        "width": widthLessMargins,
        "height": heightLessMargins,
        "transform": `translate(${state.margin.left},${state.margin.top})`
      })
      .call(zoomFn);
});

function brushed() {
  // ignore brush-by-zoom
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;

  //get [min,max] of domain of selected brushed area
  const brushMinAndMax = d3.event.selection || xScale2.range();

  const brushDifference = brushMinAndMax[1] - brushMinAndMax[0];
  
  //convert brushMinMax vals  xScaled vals
  const xScaleMinMax = brushMinAndMax.map(xScale2.invert, xScale2)
  
  //update xScale of large area
  xScale.domain(xScaleMinMax);

  //reset the big area path & axis
  focusAreaG.select(".areaPath").attr("d", areaFn);
  focusAreaG.select(".axis--x").call(xAxis);

  svgObj.select(".zoom").call(zoomFn.transform, 
    d3.zoomIdentity.scale(widthLessMargins / brushDifference)
      .translate(-brushMinAndMax[0], 0));
}

function zoomedFn() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  xScale.domain(t.rescaleX(xScale2).domain());
  focusAreaG.select(".areaPath").attr("d", areaFn);
  focusAreaG.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, xScale.range().map(t.invertX, t));
}

function type(d) {
  d.date = parseDate(d.date);
  d.price = +d.price;
  return d;
}

//2. Resize fn
   let resize = () => {
       
       // Extract the width and height that was computed by CSS.
       let resizedFnWidth = chartDiv.clientWidth;
       let resizedFnHeight = chartDiv.clientHeight;

       //set svg dimension based on resizing attrs
       svgObj.attrs({
           "width" : resizedFnWidth,
           "height" : resizedFnHeight
       });

       //calc resized dimensions less margins
       let resizedWidthLessMargins = resizedFnWidth - state.margin.left - state.margin.right;
       let resizedHeightLessMargins = resizedFnHeight - state.margin.top - state.margin.bottom;

       //update scale ranges
          x.range([0, resizedWidthLessMargins]);
          y.range([resizedHeightLessMargins, state.margin.top]);
       
       //Update the X-AXIS
       xAxisG
         .attrs({
             'transform': `translate(0, ${resizedHeightLessMargins})`,
             // 'x' : resizedWidthLessMargins / 2,
             // 'y' : resizedHeightLessMargins * .1,
         })
         .call(xAxis);

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

   }       

//Add Resise listener & fn call
   window.addEventListener("resize", resize);