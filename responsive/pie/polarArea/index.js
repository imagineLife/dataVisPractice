var outerWidth = 960;
var outerHeight = 500;
var margin = { left: 11, top: 75, right: 377, bottom: 88 };
var radiusMax = 231;
var xColumn = "name";
var colorColumn = "religion";
var radiusColumn = "population";
var colorValue = d => d.religion;
var innerWidth  = outerWidth  - margin.left - margin.right;
var innerHeight = outerHeight - margin.top  - margin.bottom;

function makeD3ElementsFromParentDiv(parendDivID){
	const chartDiv = document.getElementById(parendDivID); 	      
	const svgObj = d3.select(chartDiv).append("svg");
	const pieG = svgObj.append('g')
		.attr('class','gWrapper')
		.style('max-height','900px');

	return {chartDiv, svgObj, pieG};
}
var svg = d3.select("body").append("svg")
	.attrs({
		"width":  outerWidth,
		"height": outerHeight
	});

var g = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var xAxisG = g.append("g")
	.attrs({
		"class": "x axis",
		"transform": "translate(0," + innerHeight + ")"
	});

var pieG = g.append("g");

var xScale = d3.scaleOrdinal().range([0, innerWidth]);
var radiusScale = d3.scaleSqrt().range([0, radiusMax]);
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);


var xAxis = d3.axisBottom()
	.scale(xScale)
	.tickSize(0);

var pie = d3.pie();
var arc = d3.arc();

function render(data){

	xScale.domain(data.map( (d) => { return d[xColumn]; }));
	radiusScale.domain([0, d3.max(data, (d) => { return d[radiusColumn]; })]);
	colorScale.domain(data.map(function (d){ return d[colorColumn]; }));

	pie.value(() => 1);
	arc.innerRadius(0).outerRadius((d) => { 
		return radiusScale(d.data[radiusColumn]);
	});

	var pieData = pie(data);

	pieG.attr("transform", "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")");

	var slices = pieG.selectAll("path")
		.remove()
		.exit()
		.data(pieData);

	slices.enter()
		.append("path")
		.attrs({
			"d": arc,
			"fill": (d) => colorScale(colorValue(d.data))
		})

	xAxisG.call(xAxis);
}

function type(d){
	d.name = "World";
	d.population = +d.population;
	return d;
}

d3.csv("data.csv", type, render);
