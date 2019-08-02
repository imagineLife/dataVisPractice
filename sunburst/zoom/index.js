var magicNumber = 2 * Math.PI; // http://tauday.com/tau-manifesto

var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var xScale = d3.scaleLinear()
    .range([0, magicNumber]);

var yScale = d3.scaleSqrt()
    .range([0, radius]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var partition = d3.partition();

const maxYo = d => Math.max(0, yScale(d.y0))
const maxYOne = d => Math.max(0, yScale(d.y1))

var arc = d3.arc()
    .startAngle(d => Math.max(0, Math.min(magicNumber, xScale(d.x0))))
    .endAngle(d => Math.max(0, Math.min(magicNumber, xScale(d.x1))))
    .innerRadius(maxYo)
    .outerRadius(maxYOne);


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
var gWrapper = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

function click(d) {
  gWrapper.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(xScale.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(yScale.domain(), [d.y0, 1]),
            yr = d3.interpolate(yScale.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) { 
          xScale.domain(xd(t)); 
          yScale.domain(yd(t)).range(yr(t)); 
        };
      })
    .selectAll("path")
      .attrTween("d", d => function() { return arc(d); });
}

function enterFn(e){
  e.append("path")
      .attr("d", arc)
      .style("fill", d => color((d.children ? d : d.parent).data.name))
      .on("click", click)
    .append("title")
      .text(d => d.data.name + "\n" + formatNumber(d.value));
}

function drawChart(srData){
  

  let hierarchedData = d3.hierarchy(srData).sum(d => d.size);
  let childrenElements = partition(hierarchedData).descendants()
  
  let dataJoin = gWrapper.selectAll("path").data(childrenElements)
  
  dataJoin.join(enterFn)
}

d3.json("https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json").then(function(res){
  drawChart(res)
});

// d3.select(self.frameElement).style("height", height + "px");