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

let dataObject = [
  {
    "religion": "Christian",
    "population": 2173100000
  },
  {
    "religion": "Muslim",
    "population": 1598360000
  },
  {
    "religion": "Unaffiliated",
    "population": 1126280000
  },
  {
    "religion": "Hindu",
    "population": 1032860000
  },
  {
    "religion": "Buddhist",
    "population": 487320000
  },
  {
    "religion": "Folk Religions",
    "population": 404890000
  },
  {
    "religion": "Other Religions",
    "population": 57770000
  },
  {
    "religion": "Jewish",
    "population": 13640000
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
	const colorScale = d3.scaleOrdinal().range(d3.schemeCategory10);

	let arcs;
	let jsonData = obj.jsonData;

	const {chartDiv, svgObj, pieG} = makeD3ElementsFromParentDiv('chartDiv');

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin);

	//pie & arc functions
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(pieWedgeValue, divWidthLessMargins)

	//setup pie G element
	pieG.attrs({
			'transform': `translate(${cssDivWidth/2}, ${cssDivHeight/2 })`,
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
		});
}

//2. Build fn
function resize(){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)

	const svgObj = d3.select('svg'), pieG = d3.select('.pieGWrapper');
	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(pieWedgeValue, divWidthLessMargins)

    arcFunc.outerRadius( (divWidthLessMargins/2) * .7 );

    pieG.attr('transform', `translate(${cssDivWidth/2}, ${cssDivHeight/2 })`);
    pieG.selectAll('path').attr('d', arcFunc)

}

buildChart(AllChartObj);  	

//Resise listener & fn call
d3.select(window).on('resize',resize);