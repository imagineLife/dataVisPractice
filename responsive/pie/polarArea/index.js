var outerWidth = 960;
var outerHeight = 500;
var margin = { left: 11, top: 75, right: 377, bottom: 88 };
var xColumn = "name";
var colorColumn = "religion";
var radiusColumn = "population";
var colorValue = d => d.religion;
var innerWidth  = outerWidth  - margin.left - margin.right;
var innerHeight = outerHeight - margin.top  - margin.bottom;

function getClientDims(parentDiv, marginObj){

	// Extract the DIV width and height that was computed by CSS.
	let cssDivWidth = parentDiv.clientWidth;
	let cssDivHeight = parentDiv.clientHeight;
	
	//get css-computed dimensions
	const divWidthLessMargins =cssDivWidth - marginObj.left - marginObj.right;
	const divHeightLessMargins = cssDivHeight - marginObj.top - marginObj.bottom;
	
	return { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins };
}

function makeD3PieFuncs(wedgeVal, w){
	const d3PieFunc = d3.pie().value(wedgeVal);
	const arcFunc = d3.arc()
		.innerRadius(0).outerRadius((d) => {
			return radiusScale(d.data[radiusColumn]);
		})

	return { d3PieFunc, arcFunc };
}

function makeD3ElementsFromParentDiv(parendDivID){
	const chartDiv = document.getElementById(parendDivID); 	      
	const svgObj = d3.select(chartDiv).append("svg");

	return {chartDiv, svgObj, pieG};
}

function setSVGDims(obj, w, h){
	obj.attrs({
		"width" : w,
		"height" : h
	});
}

var svg = d3.select("body").append("svg")
	.attrs({
		"width":  outerWidth,
		"height": outerHeight
	});

var pieG = svg.append("g")
	.attrs({
		"transform": "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")",
		'class':'pieGWrapper'
	})
	.style('max-height','900px');

var radiusScale = d3.scaleSqrt()//.range([0, radiusMax]);
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var pie = d3.pie();
var arc = d3.arc();

function render(data){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(document.getElementById('body'), margin)
	
	var radiusMax = 231;

	radiusScale.range([0,radiusMax])

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
}

function type(d){
	d.name = "World";
	d.population = +d.population;
	return d;
}

//2. Build fn
function resize(){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(document.getElementById('body'), margin)

	let smallerDimension = (divWidthLessMargins < divHeightLessMargins) ? divWidthLessMargins : divHeightLessMargins;
	let smallestDimension = (smallerDimension < 300) ? smallerDimension : 300;
	radiusScale.range([0,(smallestDimension * .9)])
	let svgObj = d3.select('svg'), pieG = d3.select('.pieGWrapper');

	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(radiusColumn, divWidthLessMargins)

    // arcFunc.outerRadius( (divWidthLessMargins/2) * .7 );

    pieG.attr('transform', `translate(${cssDivWidth/2}, ${cssDivHeight/2 })`);
    pieG.selectAll('path').attr('d', arcFunc)

}

d3.csv("data.csv", type, render);
d3.select(window).on('resize',resize);
