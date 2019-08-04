function parse(d) {
  d.rank = +d.rank;
  d.annual_growth = +d.annual_growth;
  return d;
}

const country = d => d.country
const anGrowth = d => d.annual_growth
const scaledCountry = d => yScale(d.country)

const state = {
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

const xScale = d3.scaleLinear().range([0, width]);

const colorScale = d3.scaleSequential(d3.interpolatePRGn);

const yScale = d3.scaleBand()
	.range([height, 0])
	.padding(0.1);

const legend = svg.append("g")
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
  
  yScale.domain(data.map(country));
  xScale.domain(d3.extent(data, anGrowth));
  
  const max = d3.max(data, d => d.annual_growth);
  colorScale.domain([-max, max]);
  
  const yAxis = svg.append("g")
  	.attr("class", "y-axis")
  	.attr("transform", "translate(" + xScale(0) + ",0)")
  	.append("line")
      .attr("y1", 0)
      .attr("y2", height);
  
  const xAxis = svg.append("g")
  	.attr("class", "x-axis")
  	.attr("transform", "translate(0," + (height + state.xAxisMargin) + ")")
  	.call(d3.axisBottom(xScale))
  
  const bars = svg.append("g")
  	.attr("class", "bars")
  
  bars.selectAll("rect")
  	.data(data)
  .enter().append("rect")
  	.attrs({
      "class": "annual-growth",
  	  "x": d => xScale(Math.min(0, d.annual_growth)),
  	  "y": d => yScale(d.country),
  	  "height": yScale.bandwidth(),
  	  "width": d => Math.abs(xScale(d.annual_growth) - xScale(0))
    })
  	.style("fill", d => colorScale(d.annual_growth));
  
  const labels = svg.append("g")
  	.attr("class", "labels");
  
  labels.selectAll("text")
  	.data(data)
  .enter().append("text")
  	.attrs({
      "class": "bar-label",
  	  "x": xScale(0),
  	  "y": scaledCountry,
  	  "dx": d => d.annual_growth < 0 ? state.labelMargin : -state.labelMargin,
  	  "dy": yScale.bandwidth(),
  	  "text-anchor": d => d.annual_growth < 0 ? "start" : "end"
  	})
  	.text(function(d) { return d.country })
  	.style("fill", function(d) {
    	 if (d.country == "European Union") {
         return "blue";
       }
  	});
  	
});