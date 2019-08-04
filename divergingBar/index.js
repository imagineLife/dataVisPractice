function parse(d) {
  d.rank = +d.rank;
  d.annual_growth = +d.annual_growth;
  return d;
}

//helpers
const country = d => d.country
const anGrowth = d => d.annual_growth
const scaledCountry = d => yScale(d.country)
const coloredGrowth = d => colorScale(d.annual_growth);

//state data
const state = {
  labelMargin: 5,
  xAxisMargin: 10,
  legendRightMargin: 0,
  margin: {top: 40, right: 50, bottom: 60, left: 50}
}

//dimensions
const width = 960,
    height = 500;
const wLM = width - state.margin.left - state.margin.right,
      hLM = height - state.margin.top - state.margin.bottom;

const svg = d3.select("#chartDiv").append("svg")
  .attrs({
    "width": width,
    "height": height
  });

const gWrapper = svg.append("g")
  .attr("transform", `translate(${state.margin.left},${state.margin.top})`);

const xScale = d3.scaleLinear().range([0, wLM]);

const colorScale = d3.scaleSequential(d3.interpolatePRGn);

const yScale = d3.scaleBand()
	.range([hLM, 0])
	.padding(0.1);

const legend = svg.append("g")
	.attr("class", "legend");

legend.append("text")
	.attr("x", wLM - state.legendRightMargin)
	.attr("text-anchor", "end")
	.text("European Countries by");

legend.append("text")
  .attr("x", wLM - state.legendRightMargin)
	.attr("y", 20)
	.attr("text-anchor", "end")
	.style("opacity", 0.5)
	.text("2016 Population Growth Rate (%)");

d3.json("./data.json").then(data => {
  
  yScale.domain(data.map(country));
  xScale.domain(d3.extent(data, anGrowth));
  
  const max = d3.max(data, anGrowth);
  colorScale.domain([-max, max]);
  
  const yAxis = svg.append("g")
  	.attr("class", "y-axis")
  	.attr("transform", "translate(" + xScale(0) + ",0)")
  	.append("line")
      .attr("y1", 0)
      .attr("y2", hLM);
  
  const xAxis = svg.append("g")
  	.attr("class", "x-axis")
  	.attr("transform", "translate(0," + (hLM + state.xAxisMargin) + ")")
  	.call(d3.axisBottom(xScale))
  
  const bars = svg.append("g")
  	.attr("class", "bars")
  
  bars.selectAll("rect")
  	.data(data)
  .enter().append("rect")
  	.attrs({
      "class": "annual-growth",
  	  "x": d => xScale(Math.min(0, d.annual_growth)),
  	  "y": scaledCountry,
  	  "height": yScale.bandwidth(),
  	  "width": d => Math.abs(xScale(d.annual_growth) - xScale(0))
    })
  	.style("fill", coloredGrowth);
  
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
  	.text(country)
  	.style("fill", function(d) {
    	 if (d.country == "European Union") {
         return "blue";
       }
  	});
  	
});