const w = 960, h = 500
//2. decalre margin, width, height
const margin = {top: 40, right: 100, bottom: 50, left: 60}
const wlm = w - margin.left - margin.right,
      hlm = h - margin.top - margin.bottom;

var svg = d3.select("#chartDiv").append('svg');
    svg.attr("width", w);
    svg.attr("height", h);
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var stateGroup = d3.scaleBand()
    .rangeRound([0, wlm])
    .paddingInner(0.1);

var yearScale = d3.scaleBand()
    .padding(0.05);

var yScale = d3.scaleLinear()
    .rangeRound([hlm, 0]);

// var y1 = d3.scaleBand()
  
var colorScale = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var stack = d3.stack()
    .offset(d3.stackOffsetExpand);
  
d3.csv("data.csv", function(error, data) {
  if (error) throw error;
  
  data.forEach(d => d.Value = +d.Value)
  
	// console.log("data", data);
  
  stateGroup.domain(data.map(d => d.State));
  yearScale.domain(data.map(d => d.Year))
    .rangeRound([0, stateGroup.bandwidth()])
  	.padding(0.2);
  
  colorScale.domain(data.map(d => d.AgeGroup))
  var keys = colorScale.domain()
  
  var groupData = d3.nest()
    .key(d => d.Year + d.State)
  	.rollup((d, i) => {
      var d2 = {Year: d[0].Year, State: d[0].State}
      d.forEach( d => d2[d.AgeGroup] = d.Value)
      console.log("rollup d", d, d2);
    	return d2;
    })
    .entries(data)
  	.map(d => d.value);
  
  console.log("groupData", groupData)
  
  var stackData = stack
  	.keys(keys)(groupData)
  
  console.log("stackData", stackData)
  
  //y.domain([0, d3.max(data, function(d) { return d.Value; })]).nice();

  console.log("keys", keys)
  
  var serie = g.selectAll(".serie")
    .data(stackData)
    .enter().append("g")
      .attr("class", "serie")
      .attr("fill", d => colorScale(d.key));
  
  serie.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
  		.attrs({
        "class": "serie-rect",
  		  "transform": d => `translate( ${stateGroup(d.data.State)},0)` ,
        "x": d => yearScale(d.data.Year),
        "y": d => yScale(d[1]),
        "height": d => yScale(d[0]) - yScale(d[1]) ,
        "width": yearScale.bandwidth()
      })
  		.on("click", (d, i) => console.log("serie-rect click d", i, d));
  
  g.append("g")
      .attrs({
        "class": "axis",
        "transform": "translate(0," + hlm + ")"
      })
      .call(d3.axisBottom(stateGroup));

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale).ticks(null, "s"))
    .append("text")
      .attrs({
        "x": 2,
        "y": yScale(yScale.ticks().pop()) + 0.5,
        "dy": "0.32em",
        "fill": "#000",
        "font-weight": "bold",
        "text-anchor": "start"
      })
      .text("Population");
})