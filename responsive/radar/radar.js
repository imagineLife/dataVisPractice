function getXPos(wOrH, j, i, cf, noOfAxis){
  return wOrH/2*(1-(parseFloat(Math.max(j.value, 0))/cf.maxValue)*cf.factor*Math.sin(i*cf.radians/noOfAxis))
}

function getYPos(wOrH, j, i, cf, noOfAxis){
  return wOrH/2*(1-(parseFloat(Math.max(j.value, 0))/cf.maxValue)*cf.factor*Math.cos(i*cf.radians/noOfAxis))
}

function makePointsFromD(d){
  str = "";
  for(var pti=0;pti<d.length;pti++){
    str=str+d[pti][0]+","+d[pti][1]+" ";
  }
  return str;
}

getClientDims = (parentDiv, marginObj) => {
    if(!marginObj){
      marginObj = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      }
    }

    // Extract the DIV width and height that was computed by CSS.
    let cssDivWidth = parentDiv.clientWidth;
    let cssDivHeight = parentDiv.clientHeight;
    
    //get css-computed dimensions
    const divWidthLessMargins =cssDivWidth - marginObj.left - marginObj.right;
    const divHeightLessMargins = cssDivHeight - marginObj.top - marginObj.bottom;
    
    // console.log('in js, cssDivWidth')
    // console.log(cssDivWidth)
    return { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins };
  }

function makeWebLayer(wlv, gObj, data, cfg, numberOfAxis){
  gObj.selectAll(".levels")
       .data(data)
       .enter()
       .append("svg:line")
       .attrs({
        "x1": (d, i) => wlv*(1-cfg.factor*Math.sin(i*cfg.radians/numberOfAxis)),
        "y1": (d, i) => wlv*(1-cfg.factor*Math.cos(i*cfg.radians/numberOfAxis)),
        "x2": (d, i) => wlv*(1-cfg.factor*Math.sin((i+1)*cfg.radians/numberOfAxis)),
        "y2": (d, i) => wlv*(1-cfg.factor*Math.cos((i+1)*cfg.radians/numberOfAxis)),
        "class": "line level"
      })
       .style("stroke", "grey")
       .style("stroke-opacity", "0.75")
       .style("stroke-width", "0.3px")
       .attr("transform", "translate(" + (cfg.w/2-wlv) + ", " + (cfg.h/2-wlv) + ")");
}

function drawChart(id, d, options){
  var cfg = {
   radius: 5,
   w: 600,
   h: 600,
   factor: 1,
   factorLegend: .85,
   webLayers: 2,
   maxValue: 100,
   radians: 2 * Math.PI,
   opacityArea: 0.5,
   ToRight: 5,
   TranslateX: 80,
   TranslateY: 30,
   ExtraWidthX: 100,
   ExtraWidthY: 100,
   color: d3.scaleOrdinal().range(["#6F257F", "#CA0D59"])
  };

  if('undefined' !== typeof options){
    for(var i in options){
    if('undefined' !== typeof options[i]){
      cfg[i] = options[i];
    }
    }
  }
  
  var axisTitles = (d[0].map(function(i, j){return i.area}));
  var numberOfAxis = axisTitles.length;
  var smallerWorH = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
  var Format = d3.format('%');
  // d3.select(id).select("svg").remove();

  var tooltip;

  //Circular segments,
  for(var j=0; j<cfg.webLayers; j++){
    var webLayerVal = cfg.factor*smallerWorH*((j+1)/cfg.webLayers);
    makeWebLayer(webLayerVal, gObj, axisTitles, cfg, numberOfAxis)
  }

  //Text indicating at what % each level is
  for(var j=0; j<cfg.webLayers; j++){
    var webLayerVal = cfg.factor*smallerWorH*((j+1)/cfg.webLayers);
    let webLayers = gObj.selectAll(".levels")
     .data([1]) //dummy data
     .enter()
     .append("svg:text")
     .attrs({
        "x": (d) => webLayerVal*(1-cfg.factor*Math.sin(0)),
        "y": (d) => webLayerVal*(1-cfg.factor*Math.cos(0)),
        "class": "percentLegend",
        "transform": `translate(${(cfg.w/2-webLayerVal + cfg.ToRight)},${(cfg.h/2-webLayerVal)})`,
        "fill": "#737373"
      })
     .text((j+1)*100/cfg.webLayers);
  }

  series = 0;

  const straightAxis = gObj.selectAll(".axis")
      .data(axisTitles)
      .enter()
      .append("g")
      .attr("class", "axisGWraper");

  const straightAxisLine = straightAxis.append("line")
    .attrs({
      "x1": cfg.w/2,
      "y1": cfg.h/2,
      "x2": (d, i) => cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/numberOfAxis)),
      "y2": (d, i) => cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/numberOfAxis)),
      "class": "line straightAxis"
    })
    .style("stroke", "grey")
    .style("stroke-width", "1px");

  const straightAxisLabelText = straightAxis.append("text")
    .attrs({
      "class": "straightAxisLabelText",
      "text-anchor": "middle",
      "dy": "1.5em",
      "transform": "translate(0, -10)",
      "x": (d, i) =>  cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/numberOfAxis))-60*Math.sin(i*cfg.radians/numberOfAxis),
      "y": (d, i) =>  cfg.h/2*(1-Math.cos(i*cfg.radians/numberOfAxis))-20*Math.cos(i*cfg.radians/numberOfAxis)
    })
    .text(function(d){return d})
    .style("font-family", "sans-serif")
    .style("font-size", "11px")

  d.forEach(function(y, x){
    dataValues = [];
    gObj.selectAll(".nodes")
    .data(y, function(j, i){
      dataValues.push([
      getXPos(cfg.w, j, i, cfg, numberOfAxis), 
      getYPos(cfg.h, j, i, cfg, numberOfAxis)
      ]);
    });
    dataValues.push(dataValues[0]);
    let polygonObj = gObj.selectAll(".area")
           .data([dataValues])
           .enter()
           .append("polygon")
           .attr("class", "radarPolygon"+series)
           .style("stroke-width", "2px")
           .style("stroke", cfg.color(series))
           .attr("points",(d) => makePointsFromD(d))
           .style("fill", function(j, i){return cfg.color(series)})
           .style("fill-opacity", cfg.opacityArea)
           .on('mouseover', function (d){
                    let mousedPolygon = "polygon."+d3.select(this).attr("class");
                    gObj.selectAll("polygon")
                     .transition(200)
                     .style("fill-opacity", 0.1); 
                    gObj.selectAll(mousedPolygon)
                     .transition(200)
                     .style("fill-opacity", .7);
                    })
           .on('mouseout', function(){
                    gObj.selectAll("polygon")
                     .transition(200)
                     .style("fill-opacity", cfg.opacityArea);
           });
    series++;
  });
  series=0;


  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  d.forEach((y, x) => {
    gObj.selectAll(".nodes")
    .data(y).enter()
    .append("svg:circle")
    .attrs({
      "class": "radar-chart-series"+series,
      "r": 7,
      "alt": (j) => Math.max(j.value, 0),
      "cx": (j, i) => {
        dataValues.push([
          getXPos(cfg.w, j, i, cfg, numberOfAxis),
          getYPos(cfg.h, j, i, cfg, numberOfAxis)
        ])
        return getXPos(cfg.w, j, i, cfg, numberOfAxis)
      }
    })
    .attr("cy", (j, i) => {
      return getYPos(cfg.h, j, i, cfg, numberOfAxis)
    })
    .attr("data-id", (j) => j.area)
    .style("fill", "#fff")
    .style("stroke-width", "2px")
    .style("stroke", cfg.color(series)).style("fill-opacity", .9)
    .on('mouseover', d => {
          tooltip
            .style("left", d3.event.pageX - 40 + "px")
            .style("top", d3.event.pageY - 80 + "px")
            .style("display", "inline-block")
            .html((d.area) + "<br><span>" + (d.value) + "</span>");
          })
      .on("mouseout", function(d){ tooltip.style("display", "none");});

    series++;
  });
}

var width = 300,
    height = 300;

// Config for the Radar chart
var config = {
    w: width,
    h: height,
    maxValue: 100,
    webLayers: 5,
    ExtraWidthX: 300,
    left:50,
    top:50,
    right:50,
    bottom:50
}

let chartDiv = document.getElementById('chartDiv');
var svgObj = d3.select(chartDiv).append('svg').attr('class', 'svgWrapper')

let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, config)

svgObj.attrs({
  "width" : cssDivWidth,
  "height" : cssDivHeight
});

var gObj = svgObj.append("g").attr('class', 'gWrapper')
    .attr("transform", `translate(${(divWidthLessMargins/2)},${(divHeightLessMargins/2)})`);


//Call function to draw the Radar chart
d3.json("data.json", function(error, data) {
    if (error) throw error;
    drawChart("#chart", data, config);
});

// var svg = d3.select('body')
//   .selectAll('svg')
//   .append('svg')
//   .attr("width", width)
//   .attr("height", height);