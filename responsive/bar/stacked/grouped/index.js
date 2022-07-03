const w = 960, h = 500
//2. decalre margin, width, height
const margin = {top: 40, right: 100, bottom: 50, left: 60}
const wlm = w - margin.left - margin.right,
      hlm = h - margin.top - margin.bottom;

const colorByYear = (d) => {
  switch(d.data.Year){
    case 1990 :
      return .5;
      break;
    default:
      return 1;
      break
  }
}
var svg = d3.select("#chartDiv").append('svg');
    svg.attr("width", w);
    svg.attr("height", h);
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var groupXScale = d3.scaleBand()
    .rangeRound([0, wlm])
    .paddingInner(0.1);

var singleBarXScale = d3.scaleBand()
    .padding(0.05);

var yScale = d3.scaleLinear().rangeRound([hlm, 0]);
  
var colorScale = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var d3StackFn = d3.stack()
    .offset(d3.stackOffsetExpand);
  
d3.json("data.json", function(error, data) {
  if (error) throw error;
  
  data.forEach(d => d.Value = +d.Value)
  
  groupXScale.domain(data.map(d => d.State));
  singleBarXScale.domain(data.map(d => d.Year))
    .rangeRound([0, groupXScale.bandwidth()])
  	.padding(0.2);
  
  colorScale.domain(data.map(d => d.AgeGroup))
  var barSectionNames = colorScale.domain()
  
  var groupData = d3.nest()
    .key(d => d.Year + d.State)
  	.rollup((d, i) => {
      var d2 = {Year: d[0].Year, State: d[0].State}
      d.forEach( d => d2[d.AgeGroup] = d.Value)
      // console.log("rollup d", d, d2);
    	return d2;
    })
    .entries(data)
  	.map(d => d.value);
  
  var stackData = d3StackFn
  	.keys(barSectionNames)(groupData)
  
  
  var setofColoredBarsG = g.selectAll(".setOfBars")
    .data(stackData)
    .enter().append("g")
      .attr("class", "setOfBars")
      .attr("fill", d => colorScale(d.key))
  
  setofColoredBarsG.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
  		.attrs({
        "width": singleBarXScale.bandwidth(),
        "height": d => yScale(d[0]) - yScale(d[1]) ,
        "y": d => yScale(d[1]),
        "class": "serie-rect",
  		  "x": d => singleBarXScale(d.data.Year),
        "transform": d => `translate( ${groupXScale(d.data.State)},0)`,
        "fill-opacity": colorByYear
      })
  		.on("click", (d, i) => console.log("serie-rect click d", i, d));
  
  g.append("g")
      .attrs({
        "class": "axis",
        "transform": "translate(0," + hlm + ")"
      })
      .call(d3.axisBottom(groupXScale));

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