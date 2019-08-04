var state = {
  labelMargin: 5,
  xAxisMargin: 10,
  legendRightMargin: 0,
  margin: {top: 40, right: 50, bottom: 60, left: 50}
}

let width = 960 - state.margin.left - state.margin.right,
    height = 500 - state.margin.top - state.margin.bottom;

const svg = d3.select("#chartDiv").append("svg")
      .attrs({
        "width": width + state.margin.left + state.margin.right,
        "height": height + state.margin.top + state.margin.bottom
      });

const gWrapper = svg.append("g")
      .attr("transform", `translate(${state.margin.left},${state.margin.top})`);

var xScale = d3.scaleLinear()
	.range([0, width]);

var colour = d3.scaleSequential(d3.interpolatePRGn);

var yScale = d3.scaleBand()
	.range([height, 0])
	.padding(0.1);

function parse(d) {
  d.rank = +d.rank;
  d.annual_growth = +d.annual_growth;
  return d;
}

var legend = svg.append("g")
	.attr("class", "legend");

legend.append("text")
	.attr("x", width - state.legendRightMargin)
	.attr("text-anchor", "end")
	.text("European Countries by");

legend.append("text")
  .attr("x", width - state.legendRightMargin)
	.attr("y", 20)
	.attr("text-anchor", "end")
	.style("opacity", 0.5)
	.text("2016 Population Growth Rate (%)");

d3.json("./data.json").then(data => {
  
  yScale.domain(data.map(function(d) { return d.country; }));
  xScale.domain(d3.extent(data, function(d) { return d.annual_growth; }));
  
  var max = d3.max(data, function(d) { return d.annual_growth; });
  colour.domain([-max, max]);
  
  var yAxis = svg.append("g")
  	.attr("class", "y-axis")
  	.attr("transform", "translate(" + xScale(0) + ",0)")
  	.append("line")
      .attr("y1", 0)
      .attr("y2", height);
  
  var xAxis = svg.append("g")
  	.attr("class", "x-axis")
  	.attr("transform", "translate(0," + (height + state.xAxisMargin) + ")")
  	.call(d3.axisBottom(xScale))
  
  var bars = svg.append("g")
  	.attr("class", "bars")
  
  bars.selectAll("rect")
  	.data(data)
  .enter().append("rect")
  	.attr("class", "annual-growth")
  	.attr("x", function(d) {
   		return xScale(Math.min(0, d.annual_growth));
  	})
  	.attr("y", function(d) { return yScale(d.country); })
  	.attr("height", yScale.bandwidth())
  	.attr("width", function(d) { 
    	return Math.abs(xScale(d.annual_growth) - xScale(0))
  	})
  	.style("fill", function(d) {
    	return colour(d.annual_growth)
  	});
  
  var labels = svg.append("g")
  	.attr("class", "labels");
  
  labels.selectAll("text")
  	.data(data)
  .enter().append("text")
  	.attr("class", "bar-label")
  	.attr("x", xScale(0))
  	.attr("y", function(d) { return yScale(d.country )})
  	.attr("dx", function(d) {
    	return d.annual_growth < 0 ? state.labelMargin : -state.labelMargin;
  	})
  	.attr("dy", yScale.bandwidth())
  	.attr("text-anchor", function(d) {
    	return d.annual_growth < 0 ? "start" : "end";
  	})
  	.text(function(d) { return d.country })
  	.style("fill", function(d) {
    	 if (d.country == "European Union") {
         return "blue";
       }
  	});
  	
});