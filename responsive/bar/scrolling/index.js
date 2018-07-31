function makeLinearScale(domMin,domMax,rangeMin,rangeMax){
  return d3.scaleLinear()
        .domain([ domMin, domMax ])
        .range([rangeMin, rangeMax]);
}

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

function makeClipPath(parent, id, w, h, cl){
  return parent.append("clipPath")
  .attr("id", id)
  .append("rect")
  .attrs({
    "width":w,
    "height" : h,
    "class": cl
  });
}

function makeAxisGWrapper(parent, transformation, className, axisObj){
  return parent.append("g")
  .attrs({
    "transform" : transformation,
    "class" : className
  })
  .call(axisObj);
}

function makeAxisLabel(parent, transformation, className, textVal){
  return parent.append("g")
  .attr('transform', transformation)
  .append('text')
  .attrs({
    'text-anchor' : 'middle',
    'class' : className
  })
  .text(textVal);
}

let xScale,yScale,gXObj, gYObj, d3xAxis, d3yAxis; 

var settings = {
    targets:[],
    detail:{
        type:"line"
    }
};



d3.json("npm.json", function(data){
    
    var svg = d3.select("svg");

    var dataLimits = {maxY:14, minY:0, maxX:157, minX:0};
    var margin = {top:20,bottom:150,left:100,right:20};

    var svgWidth = +svg.attr("width");
    var svgHeight = +svg.attr("height");

    var gWrapperHeight = svgHeight-margin.top-margin.bottom;
    var gWrapperWidth  = svgWidth-margin.left-margin.right;

    data.forEach((d,i) => {
      var maxY = d3.max(d,function(d){return +d.howMany;});
      var minY = d3.min(d,function(d){return +d.howMany;});
      var maxX = d3.max(d,function(d){return +d.measureNumber;});
      var minX = d3.min(d,function(d){return +d.measureNumber;});
    });   

    var gWrapper = svg.append("g")
        .attrs({
          "id" : "gWrapper",
          "width" : gWrapperWidth,
          "height" : gWrapperHeight,
          "transform" : `translate( ${margin.left}, ${margin.top})`
        });

    var clipObj = makeClipPath(gWrapper, "clipObj", gWrapperWidth, gWrapperHeight, 'clipClass');

    xScale = makeLinearScale(0, 12, 0,+gWrapper.attr("width"));

    yScale = makeLinearScale( dataLimits.maxY*1.1, dataLimits.minY-(dataLimits.minY*0.1), 0,+gWrapper.attr("height"))

    var d3Zoom = d3.zoom().on("zoom",zoomed);
  
    d3xAxis = d3.axisBottom(xScale).ticks(8);

    d3yAxis = d3.axisLeft(yScale);

    let gXObj = makeAxisGWrapper(gWrapper, `translate(0, ${gWrapper.attr('height')})`, 'axis axis--x', d3xAxis);

    let gXgYObjObj = makeAxisGWrapper(gWrapper, `translate(0, 0)`, 'axis axis--y', d3yAxis);
    
    d3.selectAll(".axis--y > g.tick > line")
      .attr("x2",gWrapperWidth)
      .attr('class', 'xGridLine')
      .style("stroke","lightgrey");

    barWidth = ( xScale(2) - xScale(1) ) * .5;
    
    var bars = gWrapper.selectAll("rect.bar")
      .data(data)    
      .enter()
      .append("rect")
      .attrs({
        "class" : 'barClass',
        "clip-path" :  'url(#clipObj)',
        "x" : (d) => xScale(d.measureNumber)-barWidth*.5,
        "width" : barWidth,
        "height" : (d) => gWrapperHeight-yScale(d.howMany),
        "y" : (d) =>  yScale(d.howMany)
      })
      .style('fill','steelblue')

    let xAxisLabel = makeAxisLabel(gWrapper, `translate( ${ gWrapper.attr('width')/2 } , ${ svg.attr('height') * .9 } )`, 'xAxis label', 'Measure Number')

    let yAxisLabel = makeAxisLabel(gWrapper, `translate( ${(-40)} , ${(+gWrapper.attr('height'))/2 }) rotate(270)`, 'yAxis label', 'Note Count')

    svg.call(d3Zoom);
});
