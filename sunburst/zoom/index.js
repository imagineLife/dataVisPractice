var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var xScale = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var yScale = d3.scaleSqrt()
    .range([0, radius]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(d => Math.max(0, Math.min(2 * Math.PI, xScale(d.x0))))
    .endAngle(d => Math.max(0, Math.min(2 * Math.PI, xScale(d.x1))))
    .innerRadius(d => Math.max(0, yScale(d.y0)))
    .outerRadius(d => Math.max(0, yScale(d.y1)));


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

d3.json("https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json", function(error, root) {
  if (error) throw error;
  
  root = d3.hierarchy(root);
  root.sum(d => d.size);
  svg.selectAll("path")
      .data(partition(root).descendants())
    .enter().append("path")
      .attr("d", arc)
      .style("fill", d => color((d.children ? d : d.parent).data.name))
      .on("click", click)
    .append("title")
      .text(d => d.data.name + "\n" + formatNumber(d.value));
});

function click(d) {
  svg.transition()
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
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}

// d3.select(self.frameElement).style("height", height + "px");