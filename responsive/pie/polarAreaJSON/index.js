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
	let d3PieFunc = d3.pie().value(wedgeVal);
	let d3ArcFn = d3.arc()
		.innerRadius(0).outerRadius((d) => {
			return radiusScale(d.data[radiusColumn]);
		})

	return { d3PieFunc, d3ArcFn };
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

let dataObject = [
  {
    "race": "White & Hispanic",
    "howMany": 92245
  },
  {
    "race": "African Americans",
    "howMany": 16474
  },
  {
    "race": "American Indian or Alaskan Native",
    "howMany": 1998
  },
  {
    "race": "Asian",
    "howMany": 4334
  },
  {
    "race": "Hawaiian Islanders",
    "howMany": 19
  },
  {
    "race": "Other Ethnicity",
    "howMany": 18152
  },
  {
    "race": "Two-Plus Races",
    "howMany": 6939
  },
  {
    "race": "Hispanic & Latino",
    "howMany": 44864
  },
  {
    "race": "White",
    "howMany": 70504
  }
];

let AllChartObj = {
	svgClass: '.svgWrapper',
	jsonData: dataObject
}

const pieWedgeValue = d => d.howManu;
const colorValue = d => d.race;
const margin = { 
	left: 20, 
	right: 20,
	top: 40,
	bottom: 40
};
const radiusColumn = 'howMany';
var radiusScale = d3.scaleSqrt();

function buildChart(obj){

	let colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);
	
	let jsonData = obj.jsonData;

	const {chartDiv, svgObj, pieG} = makeD3ElementsFromParentDiv('chartDiv');

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin);

	//pie & arc functions
	const { d3PieFunc, d3ArcFn } = makeD3PieFuncs(radiusColumn, divWidthLessMargins)

	console.log('d3PieFn')
	console.log(d3PieFunc);
	let largestRadius = getLargestRadius(divWidthLessMargins, divHeightLessMargins, 600);

	pieG.attrs({
			"transform": `translate(${Math.floor(divWidthLessMargins / 2.2)},${Math.floor(divHeightLessMargins / 2)})`,
			'class':'pieGWrapper'
		})
		.style('max-height','900px');

	//set svg height & width from div computed dimensions
	setSVGDims(svgObj, divWidthLessMargins, divHeightLessMargins);

	colorScale.domain(jsonData.map(colorValue));
	
	radiusScale
		.domain([0, d3.max(jsonData, (d) => { return d[radiusColumn]; })])
		.range([0,largestRadius]);
	
	d3PieFunc.value(1);
	const arcs = d3PieFunc(jsonData);
	
	// d3ArcFn.innerRadius(0).outerRadius((d) => { 
	// 	return radiusScale(d.data[radiusColumn]);
	// });

	var slices = pieG.selectAll("path")
		.remove()
		.exit()
		.data(arcs);

	slices.enter()
		.append("path")
		.attrs({
			"d": d3ArcFn,
			"fill": (d) => colorScale(colorValue(d.data))
		})
}

//2. Build fn
function resize(){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)

	//calcluate largest radiusScale
	let largestRadius = getLargestRadius(divWidthLessMargins, divHeightLessMargins, 300);

	radiusScale.range([0,  largestRadius])
	
	let svgObj = d3.select('svg'), 
		pieG = d3.select('.pieGWrapper');

	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, divWidthLessMargins, divHeightLessMargins);
	const { d3PieFunc, d3ArcFn } = makeD3PieFuncs(radiusColumn, divWidthLessMargins)

    pieG.attr('transform', `translate(${Math.floor(divWidthLessMargins/2.2)}, ${Math.floor(divHeightLessMargins/2) })`);
    pieG.selectAll('path').attr('d', d3ArcFn)

}

buildChart(AllChartObj);
d3.select(window).on('resize',resize);
