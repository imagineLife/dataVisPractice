var width = 960,
    size = 230,
    padding = 20;

var xScale = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var yScale = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(6);

var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(6);

let svg;

var brush = d3.brush()
    .on("start", brushstart)
    .on("brush", brushmove)
    .on("end", brushend)
    .extent([[0,0],[size,size]]);

var domainByTrait = {};

var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.json("./data.json", function(error, data) {
  if (error) throw error;

  let traits = d3.keys(data[0]).filter(d => d !== "species"),
  numberOfTraits = traits.length;
      

  traits.forEach(trait => {
    domainByTrait[trait] = d3.extent(data, d => d[trait]);
  });

  console.log('domainByTrait')
  console.log(domainByTrait)
  

  

  xAxis.tickSize(size * numberOfTraits);
  yAxis.tickSize(-size * numberOfTraits);

  svg = d3.select("body").append("svg")
      .attr("width", size * numberOfTraits + padding)
      .attr("height", size * numberOfTraits + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (numberOfTraits - i - 1) * size + ",0)"; })
      .each(function(d) { xScale.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .each(function(d) { yScale.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (numberOfTraits - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  cell.call(brush);

  function plot(p) {
    var cell = d3.select(this);

    xScale.domain(domainByTrait[p.x]);
    yScale.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { 
          // console.log('d')
          // console.log(d)
          return xScale(d[p.x]); })
        .attr("cy", function(d) { return yScale(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.species); });
  }


  

});
let brushCell;
// Clear the previously-active brush, if any.
function brushstart(p) {
  if (brushCell !== this) {
    d3.select(brushCell).call(brush.move, null);
    brushCell = this;
  xScale.domain(domainByTrait[p.x]);
  yScale.domain(domainByTrait[p.y]);
  }
}


// Highlight the selected circles.
function brushmove(p) {
  var e = d3.brushSelection(this);
  svg.selectAll("circle").classed("hidden", function(d) {
    return !e
      ? false
      : (
        e[0][0] > xScale(+d[p.x]) || xScale(+d[p.x]) > e[1][0]
        || e[0][1] > yScale(+d[p.y]) || yScale(+d[p.y]) > e[1][1]
      );
  });
}

// If the brush is empty, select all circles.
function brushend() {
  var e = d3.brushSelection(this);
  if (e === null) svg.selectAll(".hidden").classed("hidden", false);
}
function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}