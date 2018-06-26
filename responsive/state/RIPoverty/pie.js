function makeD3ElementsFromParentDiv(parDivID){
	const pieDiv = document.getElementById(parDivID);	      
	const pieSVGObj = d3.select(pieDiv).append("svg");
	const pieG = pieSVGObj.append('g')
		.attr('class','gWrapper')
		.style('max-height','900px');

	return {pieDiv, pieSVGObj, pieG};
}

function getClientDims(parentDiv, marginObj){

	// Extract the DIV width and height that was computed by pieCSS.
	let pieCSSDivWidth = parentDiv.clientWidth;
	let pieCSSDivHeight = parentDiv.clientHeight;
	
	//get pieCSS-computed dimensions
	const pieDivWidthLessMargins =pieCSSDivWidth - marginObj.left - marginObj.right;
	const pieDivHeightLessMargins = pieCSSDivHeight - marginObj.top - marginObj.bottom;
	
	return { pieCSSDivWidth, pieCSSDivHeight, pieDivWidthLessMargins, pieDivHeightLessMargins };
}

function makeD3PieFuncs(wedgeVal, h){
	const d3PieFunc = d3.pie().value(wedgeVal);
	const arcFunc = d3.arc()
		.innerRadius(0)
		.outerRadius( (h) * .95);

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
		key: 'na',
		percentBelow: 100 - sliceVal
	};
	sourceDataObj.push(remainderObj)
}


function buildPieChart(pieFn, dataObj, pieObj, arcFn, clrScl, clrVal, tweenFn){
	arcs = pieFn(dataObj);
	pieObj.selectAll('path')
		.data(arcs)
		.enter()
		.append('path')
		.attrs({
			'd': arcFn,
			'fill': d => {
				console.log('d ->',d.data);
				if(d.data.town){return clrScl(clrVal(d.data))}else return 'rgba(255,255,255,.1)'
				
			},
			'transform' : 'rotate(90)'
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

function makeThisColorScale(interpolation, extent){
  return d3.scaleSequential(interpolation).domain(extent)
}

let originalDataObj = [
	{town: "Central Falls", 'percentBelow': 32.7},
	{town: "Providence", 'percentBelow': 28.2},
	{town: "Woonsocket", 'percentBelow': 25.1},
	{town: "Pawtucket", 'percentBelow': 19.9},
	{town: "West Warwick", 'percentBelow': 16.4}
];

let AllChartObj = {
	jsonData: originalDataObj,
	parentDivID: 'pieDiv',
	pieWedgeValue: function(d){ return +d.percentBelow},
	colorValue: function(d){return d.percentBelow},
	margin :{ 
		left: 100, 
		right: 145,
		top: 40,
		bottom: 40
	},
	clrsArr : ['steelblue', 'rgba(255,255,255,.05)'] //d3.interpolateBlues
}

function buildChart(obj){

	function tweenPie(b) {
	  b.innerRadius = 0;
	  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
	  return function(t) { return arcFunc(i(t)); };
	}

	let arcs;
	let percentVal = obj.jsonData[0]["percentBelow"];

	let jsonData = [obj.jsonData[0]];
	jsonData = jsonData.sort((a, b) => b.percentBelow - a.percentBelow);

	addRemainderSlice(percentVal, jsonData);

	/*
	NEED TO 
		loop throught the original Data
		build 1 pie from each data value
	*/
	//get page elements into D3
	const {pieDiv, pieSVGObj, pieG} = makeD3ElementsFromParentDiv(obj.parentDivID);

	//parse client dimensions
	let { pieCSSDivWidth, pieCSSDivHeight, pieDivWidthLessMargins, pieDivHeightLessMargins } = getClientDims(pieDiv, obj.margin);

	//pie & arc functions
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(AllChartObj.pieWedgeValue, pieDivHeightLessMargins)

    pieG.attrs({
		'transform':`translate(${pieCSSDivWidth/2}, ${pieCSSDivHeight/2 }) rotate(32.7)`,
		'class':'pieGWrapper'
	})
	.style('max-height', '900px')

	//set svg height & width from div computed dimensions
	setSVGDims(pieSVGObj, pieCSSDivWidth, pieCSSDivHeight);
	pieSVGObj.attr('class','pieSVGWrapper')

	//Setup Scales
	// const colorScale  = makeColorScale(obj.clrsArr, obj.jsonData, obj.colorValue);
	const colorScale  = makeThisColorScale(d3.interpolateBlues, [2.3, 32.7] );

	//build the pie chart!
	buildPieChart(d3PieFunc, jsonData, pieG, arcFunc, colorScale, obj.colorValue, tweenPie);
}

//2. Build fn
function resizePie(){

	let { pieCSSDivWidth, pieCSSDivHeight, pieDivWidthLessMargins, pieDivHeightLessMargins } = getClientDims(pieDiv, AllChartObj.margin)

	let pieSVGObj = d3.select('.pieSVGWrapper');
	let pieG = d3.select('.pieGWrapper');
	
	//set svg dimension based on resizing attrs
	setSVGDims(pieSVGObj, pieCSSDivWidth, pieCSSDivHeight);

	const { d3PieFunc, arcFunc } = makeD3PieFuncs(AllChartObj.pieWedgeValue, pieDivWidthLessMargins)

    arcFunc.outerRadius( (pieDivHeightLessMargins) * .95 );

    pieG.attr('transform', `translate(${pieCSSDivWidth/2}, ${pieCSSDivHeight/2 }) rotate(32.7)`);
    pieG.selectAll('path').attr('d', arcFunc)

}

buildChart(AllChartObj);  	