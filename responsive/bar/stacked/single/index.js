var rawData = [
  {
    "pop3": 30
  },
  {
    "pop2": 20
  },
  {
    "pop5": 50
  },
  {
    "pop4": 40
  },
  {
    "pop1": 10
  },
  {
    "pop6": 60
  }
];

//Put div wrapper in var
let chartDiv = document.getElementById("chartDiv");

let svg = d3.select(chartDiv).append("svg");

let gObj = svg.append('g');

//2. decalre margin, width, height
var margin = {
    top: 60,
    right: 0,
    bottom: 60,
    left: 0
  };

// Extract the width and height of chartDiv wrapper that was calculated by css
let resizedWidth = chartDiv.clientWidth;
let resizedHeight = chartDiv.clientHeight;

//make vars that equal width & heigh less margins
const widthLessMargins = resizedWidth - margin.left - margin.right;
const heightLessMargins = resizedHeight - margin.top - margin.bottom;

//1. re-parse data
//  will result in a single obj with keys objects
var dataToUse = rawData.reduce(function(acc, cur) {
  for (var key in cur) {
      acc[0][key] = cur[key];
  }
    return acc
  }, [{}] )[0];

console.log('dataToUse')
console.log(dataToUse)

// let numberOfKeysInData = Object.keys(dataToUse).length;
// // console.log('numberOfKeysInData ->',numberOfKeysInData);


//4. get keys array from data using d3 magic
let keysArr = d3.keys(dataToUse);
//console.log('keys array is ->',keysArr);


//5. build d3 stack object
var stack = d3.stack().keys(keysArr).order(d3.stackOrderNone)
  .offset(d3.stackOffsetNone);
  // console.log('stack(data)', stack(data));


//6. calculate total height of bar
BarTotalVal = d3.max(stack([dataToUse]), layer => {
  return d3.max(layer, function(d) {
//    console.log('layer--->', layer)
    var x = d[0],
      y = d[1];
    return y;
  });
});

//7.build x & y scales
// copied xScale, as I want to flip the bar 90 degrees
let yScale = d3.scaleLinear()
  .domain([0, BarTotalVal])
  .range([0, heightLessMargins]);

var xScale = d3.scaleLinear()
  .domain([0, BarTotalVal])
  .range([resizedWidth, 0]);

//8. set colors for bars
const colorScale = d3.scaleOrdinal()
    .range(d3.schemeCategory10);

//9. set d3 stacked data to var
var d3StackedData = stack([dataToUse]);
 // console.log('d3StackedData ->',d3StackedData); 

  //10. build svg var
  svg
  .attrs({
    "width" : resizedWidth,
    "height" : resizedHeight
  });
  
  //build gObject
  gObj
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr('class','gWrapper');

//build individualBars
var individualBar = gObj.selectAll(".individualBarG")
  .data(d3StackedData)
  .enter().append("g")
    .attr("class", "individualBarG")
    .style("fill", function(d, i) {
      return colorScale(i);
    })
    .on("mousemove", function(d){
    tooltipDiv
      .style("left", d3.event.pageX - 75 + "px")
      .style("top", d3.event.pageY - 120 + "px")
      .style("display", "inline-block")
      .html(`${d.key}: ${d[0][1] - d[0][0]}`);
    })
    .on("mouseout", function(d){ tooltipDiv.style("display", "none");});

//build rect obj
let rectX = resizedWidth / 2 - ((resizedWidth * .35) / 2);
var rect = individualBar.selectAll("rect")
  .data(function(d,i) {
    
    // console.log('rect d ->',d);
    //returns...
    /*
      [Array(2), key: "pop1", index: 0]
      0 : (2) [0, 20, data: {…}]
      index : 0
      key : "pop1"
      length : 1
      __proto__ : Array(0)
    */

    return d;
  })
  .enter()
    .append("rect")
    .attrs({
      "x" : rectX,
      "y" : (d) => yScale( d[0] ),
      "height": d => ( yScale(d[1]) - yScale(d[0]) ),
      "width" : resizedWidth * .25,
      'class': 'myRectClass'
    });

let barLabel = individualBar.selectAll('text')
  .data(d => d)
  .enter()
  .append('text')
  .attrs({
    'class': 'barLabel',
    'transform': d => `translate( ${ rectX + (rectX * .35) }, ${yScale(d[0]) + 20} )`,
    'fill' : 'white',
    // 'font-weight': 'normal'
  })
  .text(d => (d[1] - d[0]))

//Build Tooltip
let tooltipDiv = d3.select("body").append("div").attr("class", "toolTip");

let resize = () => {
  // Extract the width and height that was computed by CSS.
  let resizedFnWidth = chartDiv.clientWidth;
  let resizedFnHeight = chartDiv.clientHeight;

  svg.attrs({
    "width" : resizedFnWidth,
    "height" : resizedFnHeight
  });

  let resizedWidthLessMargins = resizedFnWidth - margin.left - margin.right;
  let resizedHeightLessMargins = resizedFnHeight - margin.top - margin.bottom;
  let rectX = resizedWidthLessMargins / 2 - ((resizedWidthLessMargins * .35) / 2);
  //Update scale RANGES
  xScale.range([resizedWidthLessMargins, 0]);
  yScale.range([0, resizedHeightLessMargins]);

  //Update Bars
  d3.selectAll('.myRectClass').attrs({
    'x' : rectX,
    'y' : d => yScale( d[0] ),
    'height': d => ( yScale(d[1]) - yScale(d[0]) ),
    'width' : resizedWidthLessMargins * .25
  });

  d3.selectAll('.barLabel').attr('transform', d => `translate( ${ rectX + (rectX * .35) }, ${yScale(d[0]) + 20} )`)

}

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize); 