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
		.innerRadius(0)
		.outerRadius( (w/2) * .7);

	return { d3PieFunc, arcFunc };
}

function setSVGDims(obj, w, h){
	obj.attrs({
		"width" : w,
		"height" : h
	});
}

let AllChartObj = {
	svgClass: '.svgWrapper',
	dataFile:'data.csv'
}

const pieWedgeValue = d => d.population;
const colorValue = d => d.religion;
const colorLabel = 'Religion';
const margin = { 
	left: 20, 
	right: 250,
	top: 40,
	bottom: 40
};


const {chartDiv, svgObj, pieG} = makeD3ElementsFromParentDiv('chartDiv');

let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin);

//pie & arc functions
const { d3PieFunc, arcFunc } = makeD3PieFuncs(pieWedgeValue, divWidthLessMargins)

//setup pie G element
pieG.attrs({
		'transform': `translate(${divWidthLessMargins/2}, ${divHeightLessMargins/2 })`,
		'class':'pieGWrapper'
	})
	.style('max-height', '900px')

//set svg height & width from div computed dimensions
setSVGDims(svgObj, cssDivWidth, cssDivHeight);


//Setup Scales
const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);

const parseData = d => {
	d.population = +d.population;
	return d;
};

let arcs;

function buildChart(obj){

	d3.csv(obj.dataFile, parseData, data => {
		
		colorScale.domain(data.map(colorValue));
		
		arcs = d3PieFunc(data);

		pieG.selectAll('path')
			.data(arcs)
			.enter()
			.append('path')
			.attrs({
				'd': arcFunc,
				'fill': d => colorScale(colorValue(d.data))
			});

	})
}

buildChart(AllChartObj);

//2. Build fn
let resize = () => {

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)

	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);
	let resizedRadiusVal = (divWidthLessMargins/2) * .7;
	let biggestRadius = (resizedRadiusVal < 221) ? resizedRadiusVal : 220;
    arcFunc.outerRadius(biggestRadius);

    pieG.attr('transform', `translate(${divWidthLessMargins/2}, ${divHeightLessMargins/2 })`);
    pieG.selectAll('path').attr('d', arcFunc)

}	  	

//Resise listener & fn call
d3.select(window).on('resize',resize);