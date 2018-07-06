function makeD3ElementsFromParentDiv(parendDivID){
	const chartDiv = document.getElementById(parendDivID); 	      
	const svgObj = d3.select(chartDiv).append("svg");
	const pieG = svgObj.append('g')
		.attr('class','gWrapper')
		.style('max-height','900px');

	return {chartDiv, svgObj, pieG};
}

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

function setSVGDims(obj, w, h){
	obj.attrs({
		"width" : w,
		"height" : h
	});
}

//calcluate largest radiusScale based on parent dimensions & written largest val
function getLargestRadius(w,h, largestVal){
	let smallerHorW = (w < h) ? w : h;
	let largestRadiusCalculation = Math.floor( ( smallerHorW / 2) * .8 );
	return (largestRadiusCalculation < largestVal)? largestRadiusCalculation : largestVal; 
}

var margin = { 
	top: 20,
	 right: 20,
	  bottom: 20,
	   left: 20
	};

var colorColumn = "religion";
var radiusColumn = "population";
var colorValue = d => d.religion;
var radiusScale = d3.scaleSqrt();

function render(data){

	const {chartDiv, svgObj, pieG} = makeD3ElementsFromParentDiv('chartDiv');

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(document.getElementById('body'), margin);

	let largestRadius = getLargestRadius(divWidthLessMargins, divHeightLessMargins, 600);

	svgObj.attrs({
			"width":  divWidthLessMargins,
			"height": divHeightLessMargins
		});

	pieG.attrs({
			"transform": `translate(${Math.floor(divWidthLessMargins / 2.2)},${Math.floor(divHeightLessMargins / 2)})`,
			'class':'pieGWrapper'
		})
		.style('max-height','900px');

	var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

	var d3PieFn = d3.pie();
	var d3ArcFn = d3.arc();

	radiusScale.range([0,largestRadius])

	radiusScale.domain([0, d3.max(data, (d) => { return d[radiusColumn]; })]);
	colorScale.domain(data.map(function (d){ return d[colorColumn]; }));

	d3PieFn.value(1);
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
	let largestRadius = getLargestRadius(divWidthLessMargins, divHeightLessMargins, 300);

	radiusScale.range([0,  largestRadius])
	
	let svgObj = d3.select('svg'), 
		pieG = d3.select('.pieGWrapper');

	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, divWidthLessMargins, divHeightLessMargins);
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(radiusColumn, divWidthLessMargins)

    pieG.attr('transform', `translate(${Math.floor(divWidthLessMargins/2.2)}, ${Math.floor(divHeightLessMargins/2) })`);
    pieG.selectAll('path').attr('d', arcFunc)

}

d3.csv("data.csv", type, render);
// d3.select(window).on('resize',resize);
