var margin = { 
	top: 20,
	 right: 20,
	  bottom: 20,
	   left: 20
	};
var xColumn = "name";
var colorColumn = "religion";
var radiusColumn = "population";
var colorValue = d => d.religion;

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

var radiusScale = d3.scaleSqrt();

function render(data){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(document.getElementById('body'), margin);

	//calcluate largest radiusScale
	let smallerDimension = (divWidthLessMargins < divHeightLessMargins) ? divWidthLessMargins : divHeightLessMargins;

	let largestRadiusCalculation = Math.floor( ( smallerDimension / 2) * .75 );
	let largestRadius = (largestRadiusCalculation < 300)? largestRadiusCalculation : 300; 

	let smallestDimension = (smallerDimension < 175) ? smallerDimension : 175;

	console.log('smallestDimension ->',smallestDimension)

	var svg = d3.select("body").append("svg")
		.attrs({
			"width":  divWidthLessMargins,
			"height": divHeightLessMargins
		});

	var pieG = svg.append("g")
		.attrs({
			"transform": `translate(${divWidthLessMargins / 2.2},${divHeightLessMargins / 2})`,
			'class':'pieGWrapper'
		})
		.style('max-height','900px');

	var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

	var d3PieFn = d3.pie();
	var d3ArcFn = d3.arc();

	radiusScale.range([0,300])

	radiusScale.domain([0, d3.max(data, (d) => { return d[radiusColumn]; })]);
	colorScale.domain(data.map(function (d){ return d[colorColumn]; }));

	d3PieFn.value(() => 1);
	d3ArcFn.innerRadius(0).outerRadius((d) => { 
		return radiusScale(d.data[radiusColumn]);
	});

	var pieData = d3PieFn(data);

	var slices = pieG.selectAll("path")
		.remove()
		.exit()
		.data(pieData);

	slices.enter()
		.append("path")
		.attrs({
			"d": d3ArcFn,
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

	//calcluate largest radiusScale
	let smallerDimension = (divWidthLessMargins < divHeightLessMargins) ? divWidthLessMargins : divHeightLessMargins;

	let largestRadiusCalculation = Math.floor( ( smallerDimension / 2) * .75 );
	let largestRadius = (largestRadiusCalculation < 300)? largestRadiusCalculation : 300; 

	let smallestDimension = (smallerDimension < 175) ? smallerDimension : 175;
	radiusScale.range([0,  largestRadius])
	
	let svgObj = d3.select('svg'), 
		pieG = d3.select('.pieGWrapper');

	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, divWidthLessMargins, divHeightLessMargins);
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(radiusColumn, divWidthLessMargins)

    pieG.attr('transform', `translate(${cssDivWidth/2.2}, ${cssDivHeight/2 })`);
    pieG.selectAll('path').attr('d', arcFunc)

}

d3.csv("data.csv", type, render);
// d3.select(window).on('resize',resize);
