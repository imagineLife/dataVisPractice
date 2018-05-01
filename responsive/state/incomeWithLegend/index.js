// color 
let lvl = {
    "one":5,
    "two":10,
    "three":15,
    "four":20
}

const income_domain = [lvl.one,lvl.two,lvl.three,lvl.four]

let fancyData = [];
//categorical coloring option
// const income_color = d3.scaleThreshold()
//     .domain(income_domain)
//     .range(d3.schemeReds[5]);

const income_color = d3.scaleSequential(d3.interpolateGreens)
    .domain([36100,250001])

const incomeData = d3.map();


let colorRatio = {
    "level1": 0,
    "level2": 0,
    "level3": 0,
    "level4": 0,
    "level5": 0
}

/*

  Bar Chart

*/

// D3 select The elements & convert to vars
let barDiv = document.getElementById("rangeBar");
const barSVG = d3.select(barDiv).append("svg");
const barGObj = barSVG.append('g');
const bars = barGObj.selectAll('rect');

// Build Variables
const barVars = {
  xLabel : 'Min. & Max. Town Incomes',
  yLabel : 'Average Household Income in $',
  margin : { left: 75, right: 20, top: 20, bottom: 50 }
};

//Bar Chart X-Scale, horizontalScale
const barXScale = d3.scaleBand()
  .paddingInner(0.3)
  .paddingOuter(0.2);

// //Bar Y-Scale, verticalScale
const barYScale = d3.scaleLinear();
const yTicks = 5;  

let resizedBarWidth = barDiv.clientWidth;
let resizedBarHeight = barDiv.clientHeight;

const widthLessMargins = resizedBarWidth - barVars.margin.left - barVars.margin.right;
const heightLessMargins = resizedBarHeight - barVars.margin.top - barVars.margin.bottom;
// console.log('widthLessMargins ->',widthLessMargins)
//set barSVG height & width
barSVG.attrs({
  "width" : resizedBarWidth,
  "height" : resizedBarHeight
});

// //attach a g to the svg
barGObj.attrs({
  'transform':`translate(${barVars.margin.left},${barVars.margin.top})`,
  'class': 'gWrapper'
});

// //attach another g as xAxisG to the 'parent' g
const xAxisG = barGObj.append('g')
    .attrs({
      'transform': `translate(0, ${heightLessMargins})`,
      'class': 'xAxisClass'
    });

// //attach another g as yAxisG to the 'parent' g
const yAxisG = barGObj.append('g')
  .style('class', 'yAxisClass');

// let xAxisLabel = xAxisG.append('text');
// let yAxisLabel = yAxisG.append('text');

// /* transform the Axis Text */
// xAxisLabel
//     .attrs({
//       'class' :'x axis-label',
//       'x' : widthLessMargins / 2,
//       'y' : resizedBarWidth * .1
//     })
//     .text(barVars.xLabel);   


// yAxisLabel.attrs({
//     'class' : 'y axis-label',
//     'x' : -heightLessMargins / 2,
//     'y' : -barVars.margin.left / 1.75,
//     'transform' : `rotate(-90)`
//   })
//   .style('text-anchor', 'middle')
//   .text(barVars.yLabel);



// asynchronous tasks, load topojson maps and data
d3.queue()
  .defer(d3.json, "CTstate.json")
  .defer(d3.csv, "data.csv", function(d) { 
    if (isNaN(d.income)) {
        incomeData.set(d.id, 0); 
    } else {
        incomeData.set(d.id, +d.income)
    }
    switch(true){
        case (d.income < (lvl.one - .1)):
            colorRatio["level1"]++;
            break;
        case (d.income >= lvl.one && d.income< (lvl.two - .1)):
            colorRatio["level2"]++;
            break;
        case (d.income >= lvl.two && d.income < (lvl.three - .1)):
            colorRatio["level3"]++;
            break;
        case (d.income >= lvl.three && d.income < (lvl.four - .1)):
            colorRatio["level4"]++;
            break;
        default:
            colorRatio["level5"]++;
            break;
    };
    let thisObj = {
      'town' :d.town,
      'income':+d.income
    }
    fancyData.push(thisObj);
    return d;

  })
  .await(ready);


d3.select(window)
      .on("resize", sizeChange);

const stateSVG = d3.select("#stateImage")
  .append("svg")
  .attr("width", "100%")
  .attr("class", 'income')
      .append("g");

function ready(error, data) {
    if (error) throw error;
    console.log('fancyData ->',fancyData);

    //puts income vals into arr
    const incomeDataArr = [];
    for(const val in incomeData){
      let curVal = incomeData[val];
      if(Number.isInteger(curVal) && curVal > 0){
        incomeDataArr.push(curVal);
      }
    }
      let incomeExtent = (d3.extent(incomeDataArr))

    /*

    BarChart

    
    */
    
    // X-AXIS
    //via D3
    const d3xAxis = d3.axisBottom()
      .scale(barXScale)
      .tickPadding(15)
      .tickSize(-heightLessMargins);

        // Y-AXIS
    //via D3
    const d3yAxis = d3.axisLeft()
      .scale(barYScale)
      .ticks(yTicks)
      .tickPadding(15)
      // .tickFormat(d3.format('.0s'))
      .tickSize(-widthLessMargins);

    barXScale
      .domain(['Min', 'Max'])
      .range([0,widthLessMargins]);

    barYScale
      .domain([0, incomeExtent[1]])
      .range([heightLessMargins, barVars.margin.top]);

      xAxisG.call(d3xAxis)
        .selectAll('.tick line').remove(); 

      yAxisG.call(d3yAxis) 


    // connecticut topojson
    const connecticut = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.townLayer.geometries
    });

    // projection and path
    const projection = d3.geoAlbersUsa()
        .fitExtent([[0,0], [750, 625]], connecticut);

    const geoPath = d3.geoPath()
        .projection(projection);

    // draw connecticut map and bind income data
    stateSVG.selectAll(".towns")
        .data(connecticut.features)
        .enter().append("path")
        .attrs({
          "class": "towns",        
          "d": geoPath,
          "fill": (d) => { 
            const townGeoID = incomeData.get(d.properties.GEOID10);
            return (
                townGeoID != 0 ?
                income_color(townGeoID) : 
                "none"
                )
          }
        });
    
    // title
    d3.select("svg.income").selectAll("path")
        .append("title")
        .text(function(d) {
            return d.properties.NAME10;
        });
}

function sizeChange() {
    const stateContainer = document.getElementById('stateImage');
    
    d3
      .select("g")
      .attr("transform", "scale(" + stateContainer.clientWidth/800 + ")");
   
    d3.select('svg').attr('height',stateContainer.clientWidth*0.8);
}

// D3 select The elements & convert to consts
let legendDiv = document.getElementById("legendContainer");
const svgObj = d3.select(legendDiv).append("svg");

const margin = {top: 20, right: 60, bottom: 0, left: 2};
let resizedWidth = legendDiv.clientWidth;
let resizedHeight = legendDiv.clientHeight;

const greenColorScale = d3.scaleSequential(d3.interpolateGreens)
.domain([31375,251000]);

continuous(legendDiv, greenColorScale);

// create continuous color legend
function continuous(selector_id, colorscale) {
  const selection = selector_id ? selector_id : legendDiv;
  const colorScale = colorscale ? colorscale :  greenColorScale;

  const legendheight = 275,
      legendwidth = 80;

  const canvasObj = d3.select(selection)
    .append("canvas")
    .attrs({
      "height": resizedHeight,// - margin.top - margin.bottom,
      "width": 1,
      "class": 'canvasClass'
    })
    .style("height", (resizedHeight - margin.top - margin.bottom)+ "px")
    .style("width", (legendwidth - margin.left - margin.right) + "px")
    .style("border", "1px solid #000")
    .style("top", (margin.top) + "px")
    .style("left", (margin.left) + "px")
    .node();

  const canvasContext = canvasObj.getContext("2d");

  const legendscale = d3.scaleLinear()
    // .range([1, resizedHeight - margin.top - margin.bottom]) // THIS puts max values on BOTTOM
    .range([resizedHeight - margin.top - margin.bottom, 1])
    .domain(colorScale.domain());

  // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
  const image = canvasContext.createImageData(1, resizedHeight);

  d3.range(resizedHeight).forEach(function(i) {
    const c = d3.rgb(colorScale(legendscale.invert(i)));
    image.data[4*i] = c.r;
    image.data[4*i + 1] = c.g;
    image.data[4*i + 2] = c.b;
    image.data[4*i + 3] = 255;
  });

  canvasContext.putImageData(image, 0, 0);


  const legendaxis = d3.axisRight()
    .scale(legendscale)
    .tickSize(2) //size of tick mark, not text
    .tickFormat((d) =>{
      let f = d3.format(".2s");
      return (`${f(d)}$`)
    })
    .ticks(3);

  //SVG for the labeling
  svgObj
    .attrs({
      "height": (resizedHeight) + "px",
      "width": (legendwidth) + "px",
      "class":'svgClass'
    })
    .style("position", "absolute")
    .style("left", "0px")
    .style("bottom", "0px")

  svgObj
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + ",0"+")")// + (margin.top) + ")")
    .call(legendaxis);
};