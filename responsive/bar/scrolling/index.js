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

d3.json("npm.json", function(data){
    
    var svg = d3.select("svg");

    var dataLimits = {maxY:14, minY:0, maxX:157, minX:0};
    var padding = {top:20,bottom:150,left:100,right:20};

    var svgWidth = +svg.attr("width");
    var svgHeight = +svg.attr("height");

    var canvasHeight = svgHeight-padding.top-padding.bottom;
    var canvasWidth  = svgWidth-padding.left-padding.right;

    data.forEach(function(d,i) {
      var eMaxY = d3.max(d,function(d){return +d.howMany;});
      var eMinY = d3.min(d,function(d){return +d.howMany;});
      var eMaxX = d3.max(d,function(d){return +d.measureNumber;});
      var eMinX = d3.min(d,function(d){return +d.measureNumber;});

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

    xScale = makeLinearScale(0, 12, 0,+gWrapper.attr("width"));

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
        "transform" : `translate(0, ${gWrapper.attr("height")})`,
        "class" : "axis axis--x"
      })
      .call(d3xAxis);

    gYObj = gWrapper.append("g")
      .attr("class","axis axis--y")
      .call(d3yAxis);
    
    d3.selectAll(".axis--y > g.tick > line")
      .attr("x2",canvasWidth)
      .style("stroke","lightgrey");

    barWidth = ( xScale(2) - xScale(1) ) * .5;
    
    var barLines = gWrapper.selectAll("rect.bar")
      .data(data)    
      .enter()
      .append("rect")
      .attrs({
        "class" : "barClass",
        "clip-path" :  "url(#clip)",

        //THIS can be moved, so that the bar is to the 'right' of the value
        //"x" : (d) => xScale(d.measureNumber),
        "x" : (d) => xScale(d.measureNumber)-barWidth*0.5,
        "width" : barWidth,
        "height" : (d) => canvasHeight-yScale(d.howMany),
        "y" : (d) =>  yScale(d.howMany)
      })
      .style("fill","steelblue")
   

    let yAxisLabel = gWrapper.append("g")
      .attr("transform", `translate( ${(-40)} , ${(+gWrapper.attr("height"))/2 }) rotate(270)`)
      .append("text")
      .attrs({
        "text-anchor" : "middle",
        'class' : 'rotated'
      })
      .text('Note Count');

    svg.call(d3Zoom);
});

function zoomed() {
    
    var rescaleXFn = d3.event.transform.rescaleX(xScale);

    gXObj.call(d3xAxis.scale(rescaleXFn));

 
    barWidth = ( rescaleXFn(2) - rescaleXFn(1) ) * .5;

    d3.selectAll("rect.barClass")   
      .attrs({
        "x" : (d) => rescaleXFn(d.measureNumber)-barWidth*.5,
        "width" : barWidth
      });
}