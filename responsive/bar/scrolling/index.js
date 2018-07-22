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

var x,y,gX, gY, d3xAxis, d3yAxis; 
var color = d3.scaleOrdinal(d3.schemeCategory10);
var mainData;
var settings = {
    targets:[],
    detail:{
        type:"line"
    }
};
d3.json("data.json",function(data){

    if(data[0].metric.WIDGET_SETTINGS != ""){
      console.log('here!')
        var wid = JSON.parse(data[0].metric.WIDGET_SETTINGS);   
        if(wid != null){
          $.extend(settings,wid);
        }
    }
    
    mainData = data;
    var svg = d3.select("svg");

    var limits = {maxY:null, minY:null, maxX:null, minX:null};
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

        if(limits.maxX == null){ limits.maxX = eMaxX;} 
        else { if(eMaxX > limits.maxX){ limits.maxX = eMaxX;}}

        if(limits.minX == null){ limits.minX = eMinX;} 
        else { if(eMinX < limits.minX){ limits.minX = eMinX;}}

        if(limits.maxY == null){limits.maxY = eMaxY;} 
        else { if(eMaxY > limits.maxY){limits.maxY = eMaxY;}}

        if(limits.minY == null){limits.minY = eMinY;}
        else { if(eMinY < limits.minY){limits.minY = eMinY;}}
    });   

    settings.targets.forEach(function(d){
        if(limits.maxY < d.value){
            limits.maxY = d.value;
        } 
        if(limits.minY > d.value){
            limits.minY = d.value;
        }
    });


    var gWrapper = svg.append("g")
                    .attrs({
                      "id" : "gWrapper",
                      "width" : canvasWidth,
                      "height" : canvasHeight,
                      "transform" : "translate("+padding.left+","+padding.top+")"
                    });


    x = makeTimeScale(limits.minX, limits.maxX, 0,+gWrapper.attr("width"));

    y = makeLinearScale( limits.maxY*1.1, limits.minY-(limits.minY*0.1), 0,+gWrapper.attr("height"))

    var zoom = d3.zoom().on("zoom",zoomed);
  
    d3xAxis = d3.axisBottom(x);
    d3yAxis = d3.axisLeft(y);

    gWrapper.selectAll(".targets")
          .data(settings.targets)
          .enter()
            .append("line")
            .classed("targets",true)
            .style("stroke",function(d){return d.color;})
            .style("stroke-width",1)
            .attrs({
              "x1" : x(limits.minX),
              "x2" : x(limits.maxX),
              "y1" : (d) => y(+d.value),
              "y2" : (d) => y(+d.value)
            })

    var clip = gWrapper.append("clipPath")
                    .attr("id","clip")
                    .append("rect")
                    .attrs({
                      "width":canvasWidth,
                      "height" : canvasHeight
                    });
    
    gX = gWrapper.append("g")
                .attrs({
                  "transform" : "translate(0,"+(+gWrapper.attr("height"))+")",
                  "class" : "axis axis--x"
                })
                .call(d3xAxis);

    gY = gWrapper.append("g").attr("class","axis axis--y").call(d3yAxis);
    
    d3.selectAll(".axis--y > g.tick > line").attr("x2",canvasWidth).style("stroke","lightgrey");

    if(settings.detail.type == "bar"){
        barWidth = (x(new Date("2016-01-02")) - x(new Date("2016-01-01")));
        var barLines = gWrapper.selectAll("rect.bar")
            .data(data[0].data)    
            .enter()
            .append("rect")
            .attrs({
              "class" : "bar",
              "clip-path" :  "url(#clip)",
              "x" : (d) => x(new Date(d.DATA_DATE))-barWidth*0.5,
              "width" : barWidth,
              "height" : (d) => canvasHeight-y(d.VALUE_NUMERIC),
              "y" : (d) =>  y(d.VALUE_NUMERIC)
            })
            .style("fill","steelblue")
            .style("stroke","blue")
            .style("stroke-width","1px");
    }
   

    gWrapper.append("g")
          .attr("transform","translate("+(-40)+","+
          (+gWrapper.attr("height"))/2
          +") rotate(270)")
          .append("text")
          .attr("text-anchor","middle")
          .text(data[0].metric.Y_AXIS_NAME);

    svg.call(zoom);
});

function zoomed() {
    gX.call(d3xAxis.scale(d3.event.transform.rescaleX(x)));
    var rescaleXFn = d3.event.transform.rescaleX(x);
 
    barWidth = rescaleXFn(new Date("2016-01-02")) - rescaleXFn(new Date("2016-01-01"));
    d3.select("#gWrapper").selectAll("rect.bar")
        .data(mainData[0].data)    
        .attrs({
          "x" : (d) => rescaleXFn(new Date(d.DATA_DATE))-barWidth*0.5,
          "width" : barWidth
        });
}