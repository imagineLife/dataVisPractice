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
  stackedElementKeys: '',
  numberOfStackedPieces: 0
};

//Add nodes to D3 selections
const chartDiv = document.getElementById("chart");
const svgObj = d3.select(chartDiv).append("svg");
const gObj = appendGWithDims(svgObj, 'gObj', `translate( ${vars.margin.left}, ${vars.margin.top})`)
// const width = 600 - vars.margin.left - vars.margin.right;
// const height = 500 - vars.margin.top - vars.margin.bottom;



//Tooltip
const tooltipDiv = d3.select("body").append("div").attr("class", "toolTip");

//build d3 scales
const xScale = d3.scaleBand()
    .padding(0.3)
    .align(0.3);
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Extract the width and height that was computed by CSS.
let resizedWidth = chartDiv.clientWidth;
let resizedHeight = chartDiv.clientHeight;

//calcualte dimensions less margins
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

d3.json("data.json", (error, data) => {
  if (error) throw error;

    //columns are the column header row
  data.forEach((d, i) => {

    //1. Get KEYS of json objects
    // These are the category names for the stacked pieces
    vars.stackedElementKeys = Object.keys(d);
    vars.numberOfStackedPieces = vars.stackedElementKeys.slice(1).length;
    //2. placeholder for TOTAL stacked pieces value
    let singleBarTotal = 0;
    for (var val in d) {
        if (d.hasOwnProperty(val)) {
           let thisVal = d[val]
           if (thisVal > 0) {
            singleBarTotal += +thisVal;
           }
        }
    }

    d.totalOfThisCategory =  singleBarTotal;

  })

  data.sort((a, b) =>  b.totalOfThisCategory - a.totalOfThisCategory );

  xScale.domain(data.map((d) =>  d.cityName));
  yScale.domain([0, d3.max(data, (d) => d.totalOfThisCategory )]).nice();
  colorScale.domain(vars.stackedElementKeys.slice(1));

  let stackRangeKeys = vars.stackedElementKeys.slice(1);
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
        "x": (d) => xScale(d.data.cityName),
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
          .html(`<b>${d.data.cityName}</b><br>`+
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
    "x": (d) => xScale(d.data.cityName),
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