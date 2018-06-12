function selectElements(){
  // D3 select The elements & convert to vars
  const barDiv = document.getElementById("rangeBar");
  const barSVG = d3.select(barDiv).append("svg");
  const barGObj = barSVG.append('g');
  const bars = barGObj.selectAll('rect');
  const legendDiv = document.getElementById("legendContainer");

  return  {barDiv, barSVG, barGObj, bars, legendDiv};
};

function appendSVGTODiv(DivClass, className){
  return d3.select(DivClass)
    .append("svg")
    .attrs({
      "width": "100%",
      "class": className
    });
};

function getResizeDimensions(parent, m){
  let resizeFnWidth = parent.clientWidth,
    resizeFnHeight = parent.clientHeight,
    resizedWidthLessMargins = resizeFnWidth - m.left - m.right,
    resizedHeightLessMargins = resizeFnHeight - m.top - m.bottom;
  return { resizeFnWidth, resizeFnHeight, resizedWidthLessMargins, resizedHeightLessMargins };
};

function createXAxisG(parent, className, h){
  return parent.append('g')
    .attrs({
      'transform': `translate(0, ${h})`,
      'class': className
    });
};

function createYAxisG(parent, className){
  return parent.append('g')
  .style('class', className);
};

function makeLegendCanvas(parent, d, className){
  return d3.select(parent)
  .append("canvas")
  .attrs({
    "width": 1,
    "class": className
  })
  .style("height", (d.h)+ "px")
  .style("width", (d.w) + "px")
  .style("border", "1px solid #000")
  .style("top", (d.marginTop) + "px")
  .style("left", (d.marginLeft) + "px")
  .node();
}

function buildLegendScale(h, dom){
  return d3.scaleLinear()
    // .range([1, resizedHeight - margin.top - margin.bottom]) // THIS puts max values on BOTTOM
    .range([h, 1])
    .domain(dom);
}

function getIncomeExtent(data){
  let arr = d3.extent(data, d => d.income)
  return arr;
}

function makeColorScale(interpolation, extent){
  return d3.scaleSequential(interpolation)
.domain(extent)
}

function addAxisToSVG(parent, x, y, axisObj){
  return parent
  .append('g')
  .attrs({
    'class': 'legendAxis',
    'transform': `translate(${x},${y})`
  })
  .call(axisObj);
}

function makeLegendAxisObj(scale){
  return d3.axisRight()
  .scale(scale)
  .tickSize(5) //size of tick mark, not text
  .tickFormat((d) =>{
    let f = d3.format(".2s");
    return (`${f(d)}$`)
  })
  .ticks(6);
}

// create continuous color legend
function buildStateLegend(selector_id, colorscale, ext) {

  const selection = selector_id ? selector_id : legendDiv;
  const colorScale = colorscale ? colorscale :  greenColorScale;

  const legendheight = 275, legendwidth = 80;

  const canvasDimensions = {
    h:resizedHeight,
    w: legendwidth - margin.left - margin.right,
    marginTop: margin.top,
    marginLeft: margin.left
  }

  const canvasObj = makeLegendCanvas(selection, canvasDimensions, 'canvasClass');

  const canvasContext = canvasObj.getContext("2d");

  const legendscale = buildLegendScale(canvasDimensions.h, colorScale.domain());

  // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
  const canvasImageData = canvasContext.createImageData(1, resizedHeight);

  d3.range(resizedHeight).forEach(function(i) {
    const c = d3.rgb(colorScale(legendscale.invert(i)));
    canvasImageData.data[4*i] = c.r;
    canvasImageData.data[4*i + 1] = c.g;
    canvasImageData.data[4*i + 2] = c.b;
    canvasImageData.data[4*i + 3] = 255;
  });

  canvasContext.putImageData(canvasImageData, 0, 0);

  const legendaxisobj = makeLegendAxisObj(legendscale);

  legendSVG
    .attrs({
      "height": (resizedHeight) + "px",
      "width": (legendwidth) + "px",
      "class":'legendSVG'
    })
    .style("position", "absolute")
    .style("left", "0px")
    .style("bottom", "0px")

  let legendAxisXTranslate = legendwidth - margin.left - margin.right + 3;

  let legendAxis = addAxisToSVG(legendSVG,legendAxisXTranslate, '-10',legendaxisobj);

};

let incomeExtent;

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
// const legendColorScale = d3.scaleThreshold()
//     .domain(income_domain)
//     .range(d3.schemeReds[5]);

const legendColorScale = d3.scaleSequential(d3.interpolateGreens)
    .domain([28901,116935])

const incomeData = d3.map();


let colorRatio = {
    "level1": 0,
    "level2": 0,
    "level3": 0,
    "level4": 0,
    "level5": 0
}

/*

  Bar Chart prep

*/

// Build Variables
const barVars = {
  xLabel : 'Min. & Max. Town Incomes',
  yLabel : 'Average Household Income in $',
  margin : { left: 60, right: 20, top: 20, bottom: 100 }
};

// //Bar Y-Scale, verticalScale
const barYScale = d3.scaleLinear();
const yTicks = 5;  

let {barDiv, barSVG, barGObj, bars, legendDiv} = selectElements();
let resizedBarWidth = barDiv.clientWidth;
let resizedBarHeight = barDiv.clientHeight;

const widthLessMargins = resizedBarWidth - barVars.margin.left - barVars.margin.right;
const heightLessMargins = resizedBarHeight - barVars.margin.top - barVars.margin.bottom;

//set barSVG height & width
barSVG.attrs({
  "width" : resizedBarWidth,
  "height" : resizedBarHeight,
  "class" : 'barWrapper'
});

// //attach a g to the svg
barGObj.attrs({
  'transform':`translate(${barVars.margin.left},${barVars.margin.top})`,
  'class': 'gWrapper'
});

//Make bar axis
const xAxisG = createXAxisG(barGObj, 'xAxisClass', heightLessMargins)
const yAxisG = createYAxisG(barGObj, 'yAxisClass');

//make state SVG wrapper
const stateSVG = appendSVGTODiv("#stateImage",'income');

//make state G wrapper
const stateG = stateSVG.append("g").attr('class','stateG');

//Bar Chart X-Scale, horizontalScale
const barXScale = d3.scaleBand()
  .paddingInner(0.3)
  .paddingOuter(0.2);

// X-AXIS
//via D3
function makeXAxis(scale,h){
  return d3.axisBottom()
    .scale(scale)
    .tickPadding(15)
    .tickSize(-h);
}


const d3xAxis = makeXAxis(barXScale, heightLessMargins);

// Y-AXIS
//via D3
const d3yAxis = d3.axisLeft()
  .scale(barYScale)
  .ticks(yTicks)
  .tickPadding(15)
  .tickFormat((d) =>{
    let f = d3.format(".2s");
    return (`${f(d)}$`)
  })
  .tickSize(-widthLessMargins);

const legendSVG = d3.select(legendDiv).append("svg");

const margin = {top: 20, right: 60, bottom: 0, left: 2};
let resizedWidth = legendDiv.clientWidth;
let resizedHeight = legendDiv.clientHeight;


// asynchronous tasks, load topojson maps and data
d3.queue()
  .defer(d3.json, "riTowns.json")
  .defer(d3.csv, "data.csv", function(d) { 
    if (isNaN(d.income)) {
        incomeData.set(d.id, 0); 
    } else {
        incomeData.set(d.id, +d.income)
    }

    if(d.town == 'Central Falls' 
      || d.town == 'Woonsocket'
       || d.town == 'Providence'
        || d.town == 'Barrington'
        || d.town == 'East Greenwich'
        || d.town == 'Jamestown'){
      
      let thisObj = {
        'town' :d.town,
        'income':+d.income
      }

      fancyData.push(thisObj);
    }
      
      return d;
  })
  .await(ready);


d3.select(window)
      .on("resize", resizeCharts);




function ready(error, data) {
    if (error) throw error;
    
    const greenColorScale = makeColorScale(d3.interpolateGreens, [28901,116935]);

    incomeExtent = getIncomeExtent(fancyData);
    
    fancyData.sort((a,b) => b.income - a.income);


    /*

    BarChart

    */

   // Scales & Axis
    barXScale
      .domain(fancyData.map(d => d.town))
      .range([0,widthLessMargins]);

    barYScale
      .domain([0, (incomeExtent[1] * 1.1)])
      .range([heightLessMargins, barVars.margin.top]);

      xAxisG.call(d3xAxis)
        .selectAll('.tick line').remove();
      xAxisG.selectAll('.tick text')
        .attrs({
          'transform': 'rotate(-45)',
          'text-anchor': 'end',
          'alignment-baseline':'middle',
          'x': -5,
          'y': 15,
          'dy':0
        }) 

      yAxisG.call(d3yAxis)
        .selectAll('.tick line')
        .attr('stroke-dasharray','1, 5');

    //BARS
    bars.data(fancyData)
      .enter().append('rect')
        .attrs({
          'x' : d => barXScale(d.town),
          'y' : d => barYScale(d.income),
          'width' : d => barXScale.bandwidth(),
          'height' : d => heightLessMargins - barYScale(d.income),
          'fill' : d => greenColorScale(d.income),
          'class':'barClass'
        });

    //bar label
    barSVG.selectAll(".text")
      .data(fancyData)
      .enter()
      .append("text")
      .text(function (d) {
        let f = d3.format(".2s");
        return `≈ $${f(d.income)}`; 
      })
      .attrs({
        "x": d => ( barXScale(d.town) + barXScale.bandwidth() ),
        "y": function (d) { return barYScale(d.income)},
        // "text-anchor": "middle",
        "class":"barText"
      })
      .style("fill", "white");

    /*

    StateChart

    */        

    // rhodeIsland topojson
    const rhodeIsland = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.RhodeIslandTowns.geometries
    });

    // projection and path
    const projection = d3.geoAlbersUsa()
        .fitExtent([[0,0], [750, 625]], rhodeIsland);

    const geoPath = d3.geoPath()
        .projection(projection);

    // draw rhodeIsland map and bind income data
    stateG.selectAll(".towns")
        .data(rhodeIsland.features)
        .enter().append("path")
        .attrs({
          "class": "towns",        
          "d": geoPath,
          "fill": (d) => { 
            const townGeoID = incomeData.get(d.properties.GEOID);
            return (
                townGeoID != 0 ?
                legendColorScale(townGeoID) : 
                "none"
                )
          }
        });
    
    // title
    d3.select("svg.income").selectAll("path")
        .append("title")
        .text(d => d.properties.NAME);

    buildStateLegend(legendDiv, greenColorScale, incomeExtent);
}

function resizeCharts() {

    var { resizeFnWidth, resizeFnHeight, lessMargins, resizedWidthLessMargins,resizedHeightLessMargins } = getResizeDimensions(barDiv, barVars.margin);
    

    const stateContainer = document.getElementById('stateImage');
    
    let resizebarDiv = barDiv.clientWidth;
    let rlm = resizebarDiv - barVars.margin.left - barVars.margin.right;
    barSVG.attr("width", resizeFnWidth);

    barXScale.range([0,rlm]);

    //Update the X-AXIS
    xAxisG
      .attr('x', (widthLessMargins / 2))
      .call(d3xAxis);

    d3.selectAll('.tick line')
      .attr('x2', resizedWidthLessMargins);

    d3yAxis.ticks(Math.max(resizedHeightLessMargins/80, 2))
  
    //Update Bars
    d3.selectAll('.barClass').attrs({
      'x' : d => barXScale(d.town),
      'y' : d => barYScale(d.income),
      'width' : d => barXScale.bandwidth()
    });

    d3.select("g")
      .attr("transform", "scale(" + stateContainer.clientWidth/800 + ")");
   
    d3.select('.income')
      .attr('height',stateContainer.clientWidth*0.8);

    d3.selectAll(".barText")
      .attrs({
        "x": d => ( barXScale(d.town) + barXScale.bandwidth() ),
        "y": d => ( barYScale(d.income) )
      })
}