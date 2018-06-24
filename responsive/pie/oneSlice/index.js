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

function tweenPie(b) {
	b.innerRadius = 0;
	var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
	return function(t) { return arcFunc(i(t)); };
}

let dataObject = [
  {
    "religion": "Christian",
    "population": 25
  }
];

let AllChartObj = {
	svgClass: '.svgWrapper',
	jsonData: dataObject
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

function buildChart(obj){

	//Setup Scales
	const colorScale = d3.scaleOrdinal().range(['rgba(255,255,255,.05)','steelblue']);

	let arcs;
	let jsonDataVal = obj.jsonData[0]["population"];
	
	let remainderObj = {
		key: 'key',
		population: 100 - jsonDataVal
	};

	obj.jsonData.push(remainderObj)

	let jsonData = obj.jsonData.sort((a, b) => b.population - a.population);

	const {chartDiv, svgObj, pieG} = makeD3ElementsFromParentDiv('chartDiv');

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin);

	//pie & arc functions
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(pieWedgeValue, divWidthLessMargins)

	//setup pie G element
	pieG.attrs({
			'transform': `translate(${cssDivWidth/2}, ${cssDivHeight/2 }) rotate(90)`,
			'class':'pieGWrapper'
		})
		.style('max-height', '900px')

	//set svg height & width from div computed dimensions
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);


	colorScale.domain(jsonData.map(colorValue));
	arcs = d3PieFunc(jsonData);
	pieG.selectAll('path')
		.data(arcs)
		.enter()
		.append('path')
		.attrs({
			'd': arcFunc,
			'fill': d => colorScale(colorValue(d.data)),
		})
		 .transition()
	    .ease(d3.easeBounce)
	    .duration(1100)
	    .attrTween("d", tweenPie);
}

//2. Build fn
function resize(){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)

	const svgObj = d3.select('svg'), pieG = d3.select('.pieGWrapper');
	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(pieWedgeValue, divWidthLessMargins)

    arcFunc.outerRadius( (divWidthLessMargins/2) * .7 );

    pieG.attr('transform', `translate(${cssDivWidth/2}, ${cssDivHeight/2 }) rotate(90)`);
    pieG.selectAll('path').attr('d', arcFunc)

}

buildChart(AllChartObj);  	

//Resise listener & fn call
d3.select(window).on('resize',resize);