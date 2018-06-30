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

function addRemainderSlice(sliceVal, sourceDataObj){
	let remainderObj = {
		'key': 'key',
		'percentBelow': 100 - sliceVal
	};

	sourceDataObj.push(remainderObj)
}


function buildPieChart(pieFn, dataObj, pieObj,arcFn,clrScl,clrVal,tweenFn){
	arcs = pieFn(dataObj);
	pieObj.selectAll('path')
		.data(arcs)
		.enter()
		.append('path')
		.attrs({
			'd': arcFn,
			'fill': d => clrScl(clrVal(d.data)),
		})
		 .transition()
	    .ease(d3.easeBounce)
	    .duration(1100)
	    .attrTween("d", tweenFn);
}

function makeColorScale(colorArr, completePieJsonObj, dataColorVal){

	const colorScale = d3.scaleOrdinal().range(colorArr);
	colorScale.domain(completePieJsonObj.map(dataColorVal));
	return colorScale;
}

let originalDataObj = [
  {
	"town": "Central Falls", 
	"percentBelow": 32.7
  }
];

let AllChartObj = {
	jsonData: originalDataObj,
	parentDivID: 'chartDiv',
	pieWedgeValue: d => d.percentBelow,
	colorValue: d => d.town,
	margin :{ 
		left: 20, 
		right: 250,
		top: 40,
		bottom: 40
	},
	clrsArr : ['rgba(255,255,255,.05)','steelblue'] //d3.schemeCategory10
}

function buildChart(obj){

	let arcs;
	let jsonDataVal = obj.jsonData[0]["percentBelow"];
	function tweenPie(b) {
	  b.innerRadius = 0;
	  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
	  return function(t) { return arcFunc(i(t)); };
	}

	addRemainderSlice(jsonDataVal, obj.jsonData)

	let jsonData = obj.jsonData.sort((a, b) => b.percentBelow - a.percentBelow);
	console.log('jsonData')
	console.log(jsonData);
	//get page elements into D3
	const {chartDiv, svgObj, pieG} = makeD3ElementsFromParentDiv(obj.parentDivID);

	//parse client dimensions
	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, obj.margin);

	//pie & arc functions
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(AllChartObj.pieWedgeValue, divWidthLessMargins)

	let rotation = 2 *  jsonData[0]["percentBelow"];
	console.log(rotation);
	//setup pie G element
	pieG.attrs({
			'transform': `translate(${cssDivWidth/2}, ${cssDivHeight/2 }) rotate (${rotation})`,
			'class':'pieGWrapper'
		})
		.style('max-height', '900px')

	//set svg height & width from div computed dimensions
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);

	//Setup Scales
	const colorScale  = makeColorScale(obj.clrsArr, jsonData, obj.colorValue);

	console.log('jsonData BEFORE PIE')
	console.log(jsonData)
	//build the pie chart!
	buildPieChart(d3PieFunc, jsonData, pieG, arcFunc, colorScale, obj.colorValue, tweenPie);
}

//2. Build fn
function resize(){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, AllChartObj.margin)

	const svgObj = d3.select('svg'), pieG = d3.select('.pieGWrapper');
	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(AllChartObj.pieWedgeValue, divWidthLessMargins)

    arcFunc.outerRadius( (divWidthLessMargins/2) * .7 );

    pieG.attr('transform', `translate(${cssDivWidth/2}, ${cssDivHeight/2 }) rotate(90)`);
    pieG.selectAll('path').attr('d', arcFunc)

}

buildChart(AllChartObj);  	

//Resise listener & fn call
d3.select(window).on('resize',resize);