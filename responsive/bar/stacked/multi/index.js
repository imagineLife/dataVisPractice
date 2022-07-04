function appendGWithDims(parent, className, transformation){
  return parent.append('g')
    .attrs({
      'class': className,
      'transform': transformation
    })
}

function appendTextToParentG(parent,className, xPos, yPos, textVal, transformation){
  return parent.append('text')
    .attrs({
      'class' :className,
      'x' : xPos,
      'y' : yPos,
      'transform': transformation
    })
    .style('text-anchor', 'middle')
    .text(textVal);
}

// Build Variables
const vars = {
  xLabel : 'City',
  yLabel : 'Population',
  margin : { left: 120, right: 70, top: 40, bottom: 110 },
};

function setupElements({ elementId }) {
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
    tooltipDiv,
  };
}
const { chartDiv, svg: svgObj, bars, tooltipDiv} = setupElements({ elementId: 'chart' });

const gObj = appendGWithDims(svgObj, 'gObj', `translate( ${vars.margin.left}, ${vars.margin.top})`);

//build d3 scales
const xScale = d3.scaleBand()
    .padding(0.3)
    .align(0.3);
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Extract the width and height that was computed by CSS.
// & calcualte dimensions less margins
let resizedWidth = chartDiv.clientWidth;
let resizedHeight = chartDiv.clientHeight;
let heightLessMargins = resizedHeight - vars.margin.top - vars.margin.bottom;
let widthLessMargins = resizedWidth - vars.margin.left - vars.margin.right;

//declare axis g vars
const xAxisG = appendGWithDims(gObj, 'axis axis--', `translate(0,${heightLessMargins})`)
const yAxisG = appendGWithDims(gObj, 'axis axis--y', '')

//axis titles
let xAxisLabel = appendTextToParentG(xAxisG, 'x axis-label', (widthLessMargins / 2), (resizedHeight * .1), vars.xLabel, '')
let yAxisLabel = appendTextToParentG(yAxisG, 'y axis-label', (-heightLessMargins / 2), (-vars.margin.left / 1.75), vars.yLabel, `rotate(-90)`)

//set svg height & width
svgObj.attrs({
  "width" : resizedWidth,
  "height" : resizedHeight
});

const stack = d3.stack();


// X-AXIS & Y-AXIS
//via D3
const xAxisD3 = d3.axisBottom()
  .scale(xScale)
  .tickPadding(15)
  .tickSize(-heightLessMargins);

const yAxisD3 = d3.axisLeft()
  .scale(yScale)
  .ticks(10) //yTicks as 10 later, perhaps
  .tickPadding(15)
  // .tickFormat(10, "s")
  .tickSize(-widthLessMargins);

d3.csv("data.csv").then(data => {
  let mapped = data.map(type)
  console.log('mapped')
  console.log(mapped)
  

  data.sort((a, b) =>  b.totalOfThisCategory - a.totalOfThisCategory );

  console.log('data.columns.slice(1)')
  console.log(data.columns.slice(1))
  xScale.domain(data.map((d) =>  d.geo));
  yScale.domain([0, d3.max(data, (d) => d.totalOfThisCategory )]).nice();
  colorScale.domain(data.columns.slice(1));

  let stackRangeKeys = data.columns.slice(1);
  console.log('STACKED data')
  console.log(data)
  
  let arrayOfSingleStackSeries = stack.keys(stackRangeKeys)(data);

  gObj.selectAll(".seriesClass")
    .data(arrayOfSingleStackSeries)
    .enter().append("g")
      .attrs({
        "class": "seriesClass",
        "fill": (d) => colorScale(d.key)
      })
    .selectAll("rect")
    .data((d) => d )
    .enter().append("rect")
      .attrs({
        "x": (d) => xScale(d.data.geo),
        "y": (d) => yScale(d[1]),
        "height": (d) => yScale(d[0]) - yScale(d[1]),
        "width": xScale.bandwidth(),
        "class":'singleRect'
      })
      .on("mousemove", function(d){
        const rectData = d.data,
          rectVal = d[1] - d[0];
        let rectKey = filterObj(rectData, rectVal);
        tooltipDiv
          .style("left", d3.event.pageX - 150 +  "px")
          .style("top", d3.event.pageY - 150 + "px")
          .style("display", "inline-block")
          .html(`<b>${d.data.geo}</b><br>`+
            `Age Range: <b>${rectKey}</b><br>`+
            `Population: <b>${rectVal}</b>`);
      })
      .on("mouseout", function(d){ tooltipDiv.style("display", "none");});

  xAxisG
    .call(xAxisD3)
    .selectAll('.tick line').remove();

    yAxisG
      .call(yAxisD3)
    .append("text")
      .attrs({
        "x": 2,
        "y": yScale(yScale.ticks(10).pop()),
        "dy": "0.35em",
        "text-anchor": "start",
        "fill": "#000"
      });

    //tilt x-Axis Labels
    xAxisG.selectAll('.tick text')
      .attrs({
        'transform': 'rotate(-45)',
        'text-anchor': 'end',
        'alignment-baseline':'middle',
        'x': -5,
        'y': 15,
        'dy':0

      })

  // const legend = gObj.selectAll(".legend")
  //   .data(data.columns.slice(1).reverse())
  //   .enter().append("g")
  //     .attrs({
  //       "class": "legend",
  //       "transform": function(d, i) { return "translate(0," + i * 20 + ")"; }
  //     })
  //     .style("font", "10px sans-serif");

  // legend.append("rect")
  //     .attrs({
  //       "x": width + 18,
  //       "width": 18,
  //       "height": 18,
  //       "fill": colorScale
  //     })

  // legend.append("text")
  //     .attrs({
  //       "x": width + 44,
  //       "y": 9,
  //       "dy": ".35em",
  //       "text-anchor": "start"
  //     })
  //     .text(function(d) { return d; });
});

function filterObj(obj, val){
  let result = "";
  for (key in obj){
    if(obj[key] == val) result = key;
  }
  return result
}

function type(d, i, dataArr) {
  // arr of keys from the first input data object
  const dataColumns = Object.keys(dataArr[0]);

  singleBarTotal = 0; 
  let NumberOfStackedPieces = dataColumns.length;
  for (colIdx = 1; colIdx < NumberOfStackedPieces; ++colIdx) {
    const dataCategory = dataColumns[colIdx];
    const dataVal = d[dataCategory];
    singleBarTotal += +dataVal;
  }
    d.totalOfThisCategory = singleBarTotal;
  return d;
}

let resize = () => {

  // Extract the width and height that was computed by CSS.
  let resizedFnWidth = chartDiv.clientWidth;
  let resizedFnHeight = chartDiv.clientHeight;
  let resizedWidthLessMargins = resizedFnWidth - vars.margin.left - vars.margin.right;
  let resizedHeightLessMargins = resizedFnHeight - vars.margin.top - vars.margin.bottom;

  svgObj.attrs({
    "width" : resizedFnWidth,
    "height" : resizedFnHeight
  });

  //set xScale
  xScale.rangeRound([0, resizedWidthLessMargins])

  //set yScale
  yScale.rangeRound([resizedHeightLessMargins, vars.margin.top]);

  d3.selectAll('.singleRect').attrs({
    "x": (d) => xScale(d.data.geo),
    "y": (d) => yScale(d[1]),
    "height": (d) => yScale(d[0]) - yScale(d[1]),
    "width": xScale.bandwidth()
  })

  //Update the X-AXIS
  xAxisG
    .attrs({
        'transform': `translate(0, ${resizedHeightLessMargins})`,
        'x' : resizedWidthLessMargins / 2,
        'y' : resizedHeight * .1,
    })
    .call(xAxisD3);

  //Update the Y-AXIS
  yAxisG
    .attrs({
        'x' : -resizedHeightLessMargins / 2,
        'y' : -vars.margin.left / 2,
    })
    .call(yAxisD3);

  //Update the X-AXIS LABEL
  xAxisLabel
    .attrs({
      'x' : resizedWidthLessMargins / 2,
      'y' : resizedHeight * .1
    })

  //Update yAxis Label
  yAxisLabel.attrs({
    'x' : -resizedHeightLessMargins / 2,
    'y' : -vars.margin.left / 1.75,
  });

  d3.selectAll('.tick line')
    .attr('x2', resizedWidthLessMargins);

}

d3.select(window).on('resize',resize);

resize();