// Build Variables
const vars = {
  xLabel: 'Number Of Sales',
  yLabel: 'SalesPerson',
  margin: { left: 145, right: 70, top: 20, bottom: 110 },
  rootDivId: 'chart'
};

const xValFromData = (d) => d.salesperson;
const yValFromData = (d) => +d.sales;
function setupElements({elementId}) {
  // D3 select The elements & convert to vars
  let chartDiv = document.getElementById(elementId);
  let svg = d3.select(chartDiv).append('svg');
  let gObj = svg.append('g');
  let bars = gObj.selectAll('rect');

  //Tooltip
  let tooltipDiv = d3.select('body').append('div').attr('class', 'toolTip');

  return {
    chartDiv,
    svg,
    gObj,
    bars,
    tooltipDiv
  };
}

const { chartDiv, svg, gObj, bars, tooltipDiv } = setupElements({ elementId: vars.rootDivId });


// X-Scale, horizontalScale
//setting PADDING and SCALE-TYPE
const yScale = d3.scaleBand().paddingInner(0.3).paddingOuter(0.2);

// Y-Scale, verticalScale
//setting SCALE-TYPE
const xScale = d3.scaleLinear();
const yTicks = 10;

// Extract the width and height that was computed by CSS.
let resizedWidth = chartDiv.clientWidth;
let resizedHeight = chartDiv.clientHeight;

const widthLessMargins = resizedWidth - vars.margin.left - vars.margin.right;
const heightLessMargins = resizedHeight - vars.margin.top - vars.margin.bottom;

//set svg height & width
svg.attrs({
  width: resizedWidth,
  height: heightLessMargins,
});

// Set vars for more d3 selections
//attach a g to the svg
gObj.attr('transform', `translate(${vars.margin.left},${vars.margin.top})`);

//attach another g as xAxisG to the 'parent' g
const xAxisG = gObj.append('g').attrs({
  transform: `translate(0, ${heightLessMargins})`,
  class: 'xAxisClass',
});

//attach another g as yAxisG to the 'parent' g
const yAxisG = gObj.append('g').style('class', 'yAxisClass');

let xAxisLabel = xAxisG.append('text').attr('class', 'x axis-label').text(vars.xLabel);
let yAxisLabel = yAxisG
  .append('text')
  .attrs({
    class: 'y axis-label',
    transform: `rotate(-90)`,
  })
  .style('text-anchor', 'middle')
  .text(vars.yLabel);

// X-AXIS
//via D3
const xAxis = d3.axisBottom().scale(xScale).tickPadding(15).tickSize(-heightLessMargins);

// Y-AXIS
//via D3
const yAxis = d3
  .axisLeft()
  .scale(yScale)
  .ticks(yTicks)
  .tickPadding(15)
  // .tickFormat(d3.format('.0s'))
  .tickSize(-widthLessMargins);

// Parse through data,
d3.json('data.json').then(data => {
  /*
   xScale Assignment 
    DOMAIN = data
    RANGE = pixel-length, missing here, in resize
  */
  xScale.domain([0, d3.max(data, yValFromData)]);

  /*
   yScale Assignment 
    DOMAIN = data
    RANGE = pixel-length, missing here, in resize
  */
  yScale.domain(data.map(xValFromData));
  // .nice(yTicks);

  /*
    BARS
    Put the DATA from D3
    into rectangles
  */
  bars
    .data(data)
    .enter()
    .append('rect')
    .attrs({
      y: (d) => yScale(d.salesperson),
      width: (d) => xScale(+d.sales),
      height: yScale.bandwidth(),
      fill: 'steelblue',
      class: 'barClass',
    })
    .on('mousemove', function (d) {
      tooltipDiv
        .style('left', d3.event.pageX - 75 + 'px')
        .style('top', d3.event.pageY - 120 + 'px')
        .style('display', 'inline-block')
        .html(`<b>${d.salesperson}:</b> <br>${d.sales} sales`);
    })
    .on('mouseout', function (d) {
      tooltipDiv.style('display', 'none');
    });

  xAxisG.call(xAxis).selectAll('.tick line').remove();
  yAxisG.call(yAxis);
});

let resize = () => {
  // Extract the width and height that was computed by CSS.
  let resizedFnWidth = chartDiv.clientWidth;
  let resizedFnHeight = chartDiv.clientHeight;

  svg.attrs({
    width: resizedFnWidth,
    height: resizedFnHeight,
  });

  let resizedWidthLessMargins = resizedFnWidth - vars.margin.left - vars.margin.right;
  let resizedHeightLessMargins = resizedFnHeight - vars.margin.top - vars.margin.bottom;

  //Update scale RANGES
  xScale.range([0, resizedWidthLessMargins]);
  yScale.range([resizedHeightLessMargins, vars.margin.top]);

  //Update the X-AXIS
  xAxisG
    .attrs({
      transform: `translate(0, ${resizedHeightLessMargins})`,
      x: widthLessMargins / 2,
      y: resizedHeight * 0.1,
    })
    .call(xAxis);

  //Update the X-AXIS LABEL
  xAxisLabel.attrs({
    x: resizedWidthLessMargins / 2.5,
    y: 70,
  });

  //Update the Y-AXIS
  yAxisG
    .attrs({
      x: -resizedHeightLessMargins / 2,
      y: -vars.margin.left / 2,
    })
    .call(yAxis);

  //Update yAxis Label
  yAxisLabel.attrs({
    x: -resizedHeightLessMargins / 2,
    y: -vars.margin.left / 1.45,
  });

  //Update Bars
  d3.selectAll('.barClass').attrs({
    y: (d) => yScale(d.salesperson),
    width: (d) => xScale(+d.sales),
    height: yScale.bandwidth(),
    fill: 'steelblue',
    class: 'barClass',
  });

  d3.selectAll('.tick line').attr('x2', resizedWidthLessMargins);

  yAxis.ticks(Math.max(resizedHeightLessMargins / 80, 2));
};

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize);

// call resize to draw the chart initially
resize();
