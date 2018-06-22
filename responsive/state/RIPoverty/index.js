var format = d3.format(".2s");
var povertyArr = [], percentArr = [], top5Arr = [];
let povertyExtent, percentExtent;

// BarChart Variables
const barVars = {
  xLabel : 'Min. & Max. Town Poverty',
  yLabel : 'Average Household Poverty in $',
  margin : { left: 60, right: 20, top: 20, bottom: 100 }
};

function selectElements(){
  // D3 select The elements & convert to vars
  const barDiv = document.getElementById("rangeBar");
  const top5BarDiv = document.getElementById("top5Bar");

  const barSVG = d3.select(barDiv).append("svg");
  const top5barSVG = d3.select(top5BarDiv).append("svg");

  const barGObj = barSVG.append('g');
  const top5barGObj = top5barSVG.append('g');

  const bars = barGObj.selectAll('rect');
  const top5bars = top5barGObj.selectAll('rect');

  const legendDiv = document.getElementById("legendContainer");
  const percentLegend = document.getElementById("percentLegendContainer");

  return  {barDiv, barSVG, barGObj, bars, legendDiv, percentLegend, top5BarDiv, top5barSVG, top5barGObj, top5bars};
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

function makeColorScale(interpolation, extent){
  return d3.scaleSequential(interpolation).domain(extent)
}

function addAxisToSVG(parent, x, y, axisObj, className){
  return parent
  .append('g')
  .attrs({
    'class': className,
    'transform': `translate(${x},${y})`
  })
  .call(axisObj);
}

function makeLegendAxisObj(scale){
  return d3.axisRight()
  .scale(scale)
  .tickSize(0) //size of tick mark, not text
  .tickFormat((d) =>(`${format(d)}`))
  .ticks(6);
}

function designTickText(obj,xP,yP,dyP){
  return obj.selectAll('.tick text')
  .attrs({
    'transform': 'rotate(-45)',
    'text-anchor': 'end',
    'alignment-baseline':'middle',
    'x': xP,
    'y': yP,
    'dy':dyP
  }) 
}

function parseValsToInts(d){
    return {
        'town': d.town,
        'belowPoverty': +d.belowPoverty,
        'percentBelow': +d.percentBelow
        }
}

function attachXAxis (parent, axisObj){
  return  parent.call(axisObj)
  .selectAll('.tick line').remove();
}

function getTop5FromArr(arr){
  for(let i = 0; i < 5; i++){
    top5Arr.push(arr[i])
  }
}

// X-AXIS
//via D3
function makeXAxis(scale,h){
  return d3.axisBottom()
    .scale(scale)
    .tickPadding(15)
    .tickSize(-h);
}

function buildAndColorTowns(towns, state, data, dataObj, colorScale){
  return towns.data(state.features)
  .enter().append("path")
  .attrs({
    "class": "towns",        
    "d": data,
    "fill": (d) => { 
      const townGeoID = dataObj.get(d.properties.GEOID);
      return (
          townGeoID != 0 ?
          colorScale(townGeoID) : 
          "none"
          )
    }
  });
}

function updateLegendStyle(legendsvg, heightVal, widthVal, className){
      legendsvg.attrs({
    "height": (heightVal) + "px",
    "width": (widthVal) + "px",
    "class":className
  })
  .style("position", "absolute")
  .style("left", "0px")
  .style("bottom", "0px")
}

function makeStateResponsive(SVGClass, gWrapper, parentDiv){
  d3.select(SVGClass).attr('height',parentDiv.clientWidth*0.9);
  d3.select(gWrapper).attr("transform", "scale(" + parentDiv.clientWidth/900 + ")");
}

// create continuous color legend
function buildStateLegend(selector_id, colorscale, ext, canvasClass) {

  const selection = selector_id ? selector_id : legendDiv;
  const colorScale = colorscale ? colorscale :  belowPovertyColorScale;

  const legendheight = 275, legendwidth = 80;

  const canvasDimensions = {
    h:resizedHeight,
    w: legendwidth - margin.left - margin.right,
    marginTop: margin.top,
    marginLeft: margin.left
  }

  const canvasObj = makeLegendCanvas(selection, canvasDimensions, canvasClass);

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


  updateLegendStyle(totalsLegendSVG, resizedHeight, legendwidth, 'povertySVG')


  let legendAxisXTranslate = legendwidth - margin.left - margin.right + 3;

  let legendAxis = addAxisToSVG(totalsLegendSVG,legendAxisXTranslate, '-10',legendaxisobj, 'totalLegendAxis');

};

const d3PovertyObj = d3.map();

/*

  Bar Chart prep

*/

// //Bar Y-Scale, verticalScale
const barYScale = d3.scaleLinear();
const top5YScale = d3.scaleLinear();
const yTicks = 5;  

let {barDiv, barSVG, barGObj, bars, legendDiv, percentLegend, top5BarDiv, top5barSVG, top5barGObj, top5bars} = selectElements();

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

//set top5 barSVG height & width
top5barSVG.attrs({
  "width" : resizedBarWidth,
  "height" : resizedBarHeight,
  "class" : 'top5barWrapper'
});

//attach a g to the svg
barGObj.attrs({
  'transform':`translate(${barVars.margin.left},${barVars.margin.top})`,
  'class': 'gWrapper'
});

//attach a g to the top5BarSvg
top5barGObj.attrs({
  'transform':`translate(${barVars.margin.left},${barVars.margin.top})`,
  'class': 'top5gWrapper'
});

//Make bar axis
const minMaxXAxisG = createXAxisG(barGObj, 'xAxisClass', heightLessMargins)
const minMaxYAxisG = createYAxisG(barGObj, 'yAxisClass');

//Make bar axis
const top5xAxisG = createXAxisG(top5barGObj, 'xAxisClass', heightLessMargins)
const top5yAxisG = createYAxisG(top5barGObj, 'yAxisClass');

//make state SVG wrapper
const belowPovertyStageSVG = appendSVGTODiv("#totalDivWrapper",'povertyTotalSVG');
const percentBelowStateSVG = appendSVGTODiv("#percentDivWrapper",'percentBelowSVG');

//make state G wrappers
const BelowPovertyG = belowPovertyStageSVG.append("g").attr('class','BelowPovertyG');
const percentBelowG = percentBelowStateSVG.append("g").attr('class','percentBelowG');

//Bar Chart X-Scale, horizontalScale
const minMaxXScale = d3.scaleBand()
  .paddingInner(0.3)
  .paddingOuter(0.2);

//Bar Chart X-Scale, horizontalScale
const top5XScale = d3.scaleBand()
  .paddingInner(0.3)
  .paddingOuter(0.2);

const d3MinMaxXAxis = makeXAxis(minMaxXScale, heightLessMargins);

const d3Top5XAxis = makeXAxis(top5XScale, heightLessMargins);

// Y-AXIS
//via D3
const d3yAxis = d3.axisLeft()
  .scale(barYScale)
  .ticks(yTicks)
  .tickPadding(15)
  .tickFormat((d) =>{
    let f = d3.format(".2s");
    return (`${f(d)}`)
  })
  .tickSize(-widthLessMargins);

const totalsLegendSVG = d3.select(legendDiv).append("svg");

const margin = {top: 20, right: 60, bottom: 0, left: 2};
let resizedWidth = legendDiv.clientWidth;
let resizedHeight = legendDiv.clientHeight;


// asynchronous tasks, load topojson maps and data
d3.queue()
  .defer(d3.json, "riTowns.json")
  .defer(d3.csv, "data.csv", function(d) {
    if (isNaN(d.belowPoverty)) {
        d3PovertyObj.set(d.id, 0); 
    } else {
        d3PovertyObj.set(d.id, +d.belowPoverty, +d.percentBelow)
    }

    if(+d.belowPoverty > 0){
        let thisObjParsed = parseValsToInts(d);
        povertyArr.push(thisObjParsed);
        percentArr.push(thisObjParsed);
    }
      
    return d;
  })
  .await(ready);


d3.select(window)
      .on("resize", resizeCharts);




function ready(error, data) {
    if (error) throw error;
    
    const sortedPoverty = povertyArr.sort((a,b) => b.belowPoverty - a.belowPoverty);
    let povertyMin = sortedPoverty[sortedPoverty.length - 1], povertyMax = sortedPoverty[0];
    let povertyExtentObjs = [povertyMin, povertyMax];
    povertyExtent = d3.extent(povertyExtentObjs, d => d.belowPoverty);

    const percentSorted = percentArr.sort((a,b) => b.percentBelow - a.percentBelow);
    let percentMin = percentSorted[percentSorted.length - 1], percentMax = percentSorted[0];
    let percentExtentObjs = [percentMin, percentMax];
    percentExtent = d3.extent(percentExtentObjs, d => d.percentBelow);
    const percentageColorScale = makeColorScale(d3.interpolateReds, percentExtent);


    getTop5FromArr(povertyArr);
    
    const belowPovertyColorScale = makeColorScale(d3.interpolateReds, povertyExtent);
    const povertyPercentageColorScale = makeColorScale(d3.interpolateReds, percentExtent);

    const legendColorScale = d3.scaleSequential(d3.interpolateReds).domain(povertyExtent)

    /*

    Min & Max BarChart

    */

   // Scales & Axis
    minMaxXScale
      .domain(povertyExtentObjs.map(d => d.town))
      .range([0,widthLessMargins]);

       // Scales & Axis
    top5XScale
      .domain(top5Arr.map(d => d.town))
      .range([0,widthLessMargins]);

    barYScale
      .domain([0, (povertyExtent[1] * 1.1)])
      .range([heightLessMargins, barVars.margin.top]);

    top5YScale
      .domain([0, (top5Arr[0]["belowPoverty"] * 1.1)])
      .range([heightLessMargins, barVars.margin.top]);

      attachXAxis(minMaxXAxisG, d3MinMaxXAxis);
      attachXAxis(top5xAxisG, d3Top5XAxis);

      var xTicksNice = designTickText(minMaxXAxisG,'-5',15,0);
      var top5XTicksNice = designTickText(top5xAxisG,'-5',15,0);

      minMaxYAxisG.call(d3yAxis)
        .selectAll('.tick line')
        .attr('stroke-dasharray','1, 5');

      top5yAxisG.call(d3yAxis)
        .selectAll('.tick line')
        .attr('stroke-dasharray','1, 5');

    //BARS
    bars.data(povertyExtentObjs)
      .enter().append('rect')
        .attrs({
          'x' : d => minMaxXScale(d.town),
          'y' : d => barYScale(d.belowPoverty),
          'width' : d => minMaxXScale.bandwidth(),
          'height' : d => heightLessMargins - barYScale(d.belowPoverty),
          'fill' : d => belowPovertyColorScale(d.belowPoverty),
          'class':'barClass'
        });

        //BARS
    top5bars.data(top5Arr)
      .enter().append('rect')
        .attrs({
          'x' : d => top5XScale(d.town),
          'y' : d => top5YScale(+d.belowPoverty),
          'width' : d => top5XScale.bandwidth(),
          'height' : d => heightLessMargins - top5YScale(d.belowPoverty),
          'fill' : d => belowPovertyColorScale(d.belowPoverty),
          'class' : 'topBarClass'
        });

    //bar label

    // function addLabelsTobars(barsObj, barData, textVal, xs, xVal, ys){
    //   return barsObj.selectAll(".text")
    //   .data(barData)
    //   .enter()
    //   .append("text")
    //   .text((d) => textVal)
    //   .attrs({
    //     "x": d => ( xs(d.xVal) + (xs.bandwidth() / 1.5) ),
    //     "y": function (d) { return ys(`d.${textVal}`)},
    //     "text-anchor": 'middle',
    //     "class":"barText"
    //   })
    //   .style("fill", "white");
    // }

    // addLabelsTobars(barSVG, povertyExtentObjs, 'd.belowPoverty', minMaxXScale, 'town', barYScale);

    barSVG.selectAll(".text")
      .data(povertyExtentObjs)
      .enter()
      .append("text")
      .text((d) => `${d.belowPoverty}`)
      .attrs({
        "x": d => ( minMaxXScale(d.town) + (minMaxXScale.bandwidth() / 1.5) ),
        "y": function (d) { return barYScale(d.belowPoverty)},
        "text-anchor": 'middle',
        "class":"barText"
      })
      .style("fill", "white");

    /*

    BelowPoverty StateChart

    */        

    // rhodeIsland topojson
    const rhodeIsland = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.RhodeIslandTowns.geometries
    });

    // projection and path
    const projection = d3.geoAlbersUsa().fitExtent([[0,0], [750, 625]], rhodeIsland);
    const geoPath = d3.geoPath().projection(projection);

    // D3 select towns
    let stateTowns = BelowPovertyG.selectAll(".towns");
    let povertyTowns = percentBelowG.selectAll(".towns");

    //build the towns & color them
    buildAndColorTowns(stateTowns, rhodeIsland, geoPath, d3PovertyObj, legendColorScale);
    buildAndColorTowns(povertyTowns, rhodeIsland, geoPath, d3PovertyObj, legendColorScale);
    
    // state town titles
    d3.select("svg.poverty").selectAll("path").append("title").text(d => d.properties.NAME);

    //builds state-legend
    buildStateLegend(legendDiv, belowPovertyColorScale, povertyExtent, 'povertyCanvasClass');

}

function resizeCharts() {

    var { resizeFnWidth, resizeFnHeight, lessMargins, resizedWidthLessMargins,resizedHeightLessMargins } = getResizeDimensions(barDiv, barVars.margin);
    

    const stateContainer = document.getElementById('totalDivWrapper');
    const percentContainer = document.getElementById('percentDivWrapper');
    
    let resizebarDiv = barDiv.clientWidth;
    let top5BarResized = top5BarDiv.clientWidth;

    let rlm = resizebarDiv - barVars.margin.left - barVars.margin.right;
    barSVG.attr("width", resizeFnWidth);
    top5barSVG.attr("width", resizeFnWidth);

    minMaxXScale.range([0,rlm]);
    top5XScale.range([0,rlm]);

    //Update the X-AXIS
    minMaxXAxisG
      .attr('x', (widthLessMargins / 2))
      .call(d3MinMaxXAxis);

    //Update the X-AXIS
    top5xAxisG
      .attr('x', (widthLessMargins / 2))
      .call(d3Top5XAxis);


    d3.selectAll('.tick line')
      .attr('x2', resizedWidthLessMargins);

    d3.selectAll('.totalLegendAxis .tick line')
      .attr('x2', 0);

    d3yAxis.ticks(Math.max(resizedHeightLessMargins/80, 2))
  
    //Update Bars
    d3.selectAll('.barClass').attrs({
      'x' : d => minMaxXScale(d.town),
      'y' : d => barYScale(d.belowPoverty),
      'width' : d => minMaxXScale.bandwidth()
    });

    //Update Bars
    d3.selectAll('.topBarClass').attrs({
      'x' : d => top5XScale(d.town),
      'y' : d => top5YScale(+d.belowPoverty),
      'width' : d => top5XScale.bandwidth()
    });

    makeStateResponsive('.povertyTotalSVG', '.BelowPovertyG', stateContainer)
    makeStateResponsive('.percentBelowSVG', '.percentBelowG', percentContainer)


    d3.selectAll(".barText")
      .attrs({
        "x": d => ( minMaxXScale(d.town) + (minMaxXScale.bandwidth() / 1.5) ),
        "y": d => ( barYScale(d.belowPoverty) )
      })
}