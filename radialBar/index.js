var width = 960,
    height = 500,
    barHeight = height / 2 - 40;

var formatNumber = d3.format("s");

var colorScale = d3.scale.ordinal()
    .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);

var svg = d3.select('body').append("svg")
    .attr("width", width)
    .attr("height", height)
var gWrapper = svg.append("g")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

var d3Arc = d3.svg.arc();

d3.csv("data.csv", (error, data) => {

  // data.sort((a,b) => b.value - a.value);

  var dataExtent = d3.extent(data, d => d.value );
  var barScale = d3.scale.linear()
      .domain(dataExtent)
      .range([0, barHeight]);

  var dataKeys = data.map((d,i) => d.name);
  var numBars = dataKeys.length;
      
  
  d3Arc.startAngle((d,i) => (i * 2 * Math.PI) / numBars )
      .endAngle((d,i) => ((i + 1) * 2 * Math.PI) / numBars)
      .innerRadius(0);
  
  var segments = gWrapper.selectAll("path")
          .data(data)
        .enter().append("path")
          .each(d => d.outerRadius = 0)
          .style("fill", d => colorScale(d.name))
          .attr("d", d3Arc);

  segments.transition()
    .ease("elastic")
    .duration(500)
    .delay((d,i) => (25-i) * 100)
    .attrTween("d", (d,index) => {
      var i = d3.interpolate(d.outerRadius, barScale(+d.value));
      return function(t) { 
        console.log('what is t')
        console.log(t)
        console.log('what is i(t)')
        console.log(i(t))
        d.outerRadius = i(t); 
        return d3Arc(d,index); };
    });


});