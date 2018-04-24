// color 
let lvl = {
    "one":5,
    "two":10,
    "three":15,
    "four":20
}

var income_domain = [lvl.one,lvl.two,lvl.three,lvl.four]

//categorical coloring option
// var income_color = d3.scaleThreshold()
//     .domain(income_domain)
//     .range(d3.schemeReds[5]);

var income_color = d3.scaleSequential(d3.interpolateGreens)
    .domain([31375,251000])

var incomeData = d3.map();


let colorRatio = {
    "level1": 0,
    "level2": 0,
    "level3": 0,
    "level4": 0,
    "level5": 0
}


// asynchronous tasks, load topojson maps and data
d3.queue()
    .defer(d3.json, "CTstate.json")
    .defer(d3.csv, "data.csv", function(d) { 
        if (isNaN(d.income)) {
            incomeData.set(d.id, 0); 
        } else {
            incomeData.set(d.id, +d.income); 
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

    })
    .await(ready);


d3.select(window)
      .on("resize", sizeChange);

const svg = d3.select("#stateImage")
  .append("svg")
  .attr("width", "100%")
  .attr("class", 'income')
      .append("g");


function ready(error, data) {
    if (error) throw error;

    // connecticut topojson
    var connecticut = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.townLayer.geometries
    });

    // projection and path
    var projection = d3.geoAlbersUsa()
        .fitExtent([[0,0], [750, 625]], connecticut);

    var geoPath = d3.geoPath()
        .projection(projection);

    // draw connecticut map and bind income data
    svg.selectAll(".towns")
        .data(connecticut.features)
        .enter().append("path")
        .attr("class", "towns")        
        .attr("d", geoPath)
        // .attr("fill", "white")
        // .transition().duration(100)
        // .delay(function(d, i) {
        //     return i * 2; 
        // })
        // .ease(d3.easeLinear)
        .attr("fill", function(d) { 
            var townGeoID = incomeData.get(d.properties.GEOID10);
            return (
                townGeoID != 0 ?
                income_color(townGeoID) : 
                "none");  

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

// D3 select The elements & convert to vars
let legendDiv = document.getElementById("legendContainer");
const svgObj = d3.select(legendDiv).append("svg");

const margin = {top: 20, right: 60, bottom: 0, left: 2};
// Extract the width and height that was computed by CSS.
let resizedWidth = legendDiv.clientWidth;
let resizedHeight = legendDiv.clientHeight;

var greenColorScale = d3.scaleSequential(d3.interpolateGreens)
.domain([31375,251000]);

continuous(legendDiv, greenColorScale);

// create continuous color legend
function continuous(selector_id, colorscale) {
const selection = selector_id ? selector_id : legendDiv;
const colorScale = colorscale ? colorscale :  greenColorScale;

const legendheight = 275,
    legendwidth = 80;

var canvasObj = d3.select(selection)
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

var canvasContext = canvasObj.getContext("2d");

var legendscale = d3.scaleLinear()
  // .range([1, resizedHeight - margin.top - margin.bottom]) // THIS puts max values on BOTTOM
  .range([resizedHeight - margin.top - margin.bottom, 1])
  .domain(colorScale.domain());

// image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
var image = canvasContext.createImageData(1, resizedHeight);

d3.range(resizedHeight).forEach(function(i) {
  var c = d3.rgb(colorScale(legendscale.invert(i)));
  image.data[4*i] = c.r;
  image.data[4*i + 1] = c.g;
  image.data[4*i + 2] = c.b;
  image.data[4*i + 3] = 255;
});

canvasContext.putImageData(image, 0, 0);


var legendaxis = d3.axisRight()
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
  .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + ",2"+")")// + (margin.top) + ")")
  .call(legendaxis);
};