function makeTimeScale(dataMin, dataMax, pixMin, pixMax){
  return d3.scaleTime()
        .domain([dataMin,dataMax])
        .range([pixMin,pixMax]);
}

function makeLinearScale(domMin,domMax,rangeMin,rangeMax){
  return d3.scaleLinear()
        .domain([ domMin, domMax ])
        .range([rangeMin, rangeMax]);
}

var xScale,yScale,gXObj, gYObj, d3xAxis, d3yAxis; 

var settings = {
    targets:[],
    detail:{
        type:"line"
    }
};
d3.json("data.json",function(data){

    if(data[0].metric.WIDGET_SETTINGS != ""){
        var wid = JSON.parse(data[0].metric.WIDGET_SETTINGS);   
        if(wid != null){
          $.extend(settings,wid);
        }
    }
    
    var svg = d3.select("svg");

    var dataLimits = {maxY:null, minY:null, maxX:null, minX:null};
    var padding = {top:20,bottom:150,left:100,right:20};

    var svgWidth = +svg.attr("width");
    var svgHeight = +svg.attr("height");

    var canvasHeight = svgHeight-padding.top-padding.bottom;
    var canvasWidth  = svgWidth-padding.left-padding.right;

    data.forEach(function(e,i) {        
      var eMaxY = d3.max(e.data,function(d){return +d.VALUE_NUMERIC;});
      var eMinY = d3.min(e.data,function(d){return +d.VALUE_NUMERIC;});
      var eMaxX = d3.max(e.data,function(d){return new Date(d.DATA_DATE);});
      var eMinX = d3.min(e.data,function(d){return new Date(d.DATA_DATE);});

      if(dataLimits.maxX == null){ dataLimits.maxX = eMaxX;} 
      else { if(eMaxX > dataLimits.maxX){ dataLimits.maxX = eMaxX;}}

      if(dataLimits.minX == null){ dataLimits.minX = eMinX;} 
      else { if(eMinX < dataLimits.minX){ dataLimits.minX = eMinX;}}

      if(dataLimits.maxY == null){dataLimits.maxY = eMaxY;} 
      else { if(eMaxY > dataLimits.maxY){dataLimits.maxY = eMaxY;}}

      if(dataLimits.minY == null){dataLimits.minY = eMinY;}
      else { if(eMinY < dataLimits.minY){dataLimits.minY = eMinY;}}
    });   

    var gWrapper = svg.append("g")
        .attrs({
          "id" : "gWrapper",
          "width" : canvasWidth,
          "height" : canvasHeight,
          "transform" : "translate("+padding.left+","+padding.top+")"
        });

    xScale = makeTimeScale(dataLimits.minX, dataLimits.maxX, 0,+gWrapper.attr("width"));

    yScale = makeLinearScale( dataLimits.maxY*1.1, dataLimits.minY-(dataLimits.minY*0.1), 0,+gWrapper.attr("height"))

    var d3Zoom = d3.zoom().on("zoom",zoomed);
  
    d3xAxis = d3.axisBottom(xScale);
    d3yAxis = d3.axisLeft(yScale);

    var clip = gWrapper.append("clipPath")
      .attr("id","clip")
      .append("rect")
      .attrs({
        "width":canvasWidth,
        "height" : canvasHeight,
        "class": 'clipClass'
      });

    gXObj = gWrapper.append("g")
      .attrs({
        "transform" : "translate(0,"+(+gWrapper.attr("height"))+")",
        "class" : "axis axis--x"
      })
      .call(d3xAxis);

    gYObj = gWrapper.append("g").attr("class","axis axis--y").call(d3yAxis);
    
    d3.selectAll(".axis--y > g.tick > line").attr("x2",canvasWidth).style("stroke","lightgrey");

    barWidth = (xScale(new Date("2016-01-02")) - xScale(new Date("2016-01-01")));
    
    var barLines = gWrapper.selectAll("rect.bar")
      .data(data[0].data)    
      .enter()
      .append("rect")
      .attrs({
        "class" : "barClass",
        "clip-path" :  "url(#clip)",
        "x" : (d) => xScale(new Date(d.DATA_DATE))-barWidth*0.5,
        "width" : barWidth,
        "height" : (d) => canvasHeight-yScale(d.VALUE_NUMERIC),
        "y" : (d) =>  yScale(d.VALUE_NUMERIC)
      })
      .style("fill","steelblue")
      .style("stroke","blue")
      .style("stroke-width","1px");
   

    gWrapper.append("g")
      .attr("transform", `translate( ${(-40)} , ${(+gWrapper.attr("height"))/2 }) rotate(270)`)
      .append("text")
      .attrs({
        "text-anchor" : "middle",
        'class' : 'rotated'
      })
      .text(data[0].metric.Y_AXIS_NAME);

    svg.call(d3Zoom);
});

function zoomed() {
    gXObj.call(d3xAxis.scale(d3.event.transform.rescaleX(xScale)));
    var rescaleXFn = d3.event.transform.rescaleX(xScale);
 
    barWidth = rescaleXFn(new Date("2016-01-02")) - rescaleXFn(new Date("2016-01-01"));
    d3.selectAll("rect.barClass")   
      .attrs({
        "x" : (d) => rescaleXFn(new Date(d.DATA_DATE))-barWidth*0.5,
        "width" : barWidth
      });
}