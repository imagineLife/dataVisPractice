function addDivToObj(p,friendly, uniqueID){
	return p.append('div').attrs({
		'class': friendly,
		'id': friendly+uniqueID
	})
}

function makeD3ElementsFromParentDiv(parDivID, pieNumber){
	const piesWrapperDiv = document.getElementById(parDivID);
	let chartTextWrapper = d3.select(piesWrapperDiv).append('div').attrs({
		'class': 'chartAndText',
		'id': 'chartAndText'+pieNumber
	})

	let pieTextWrapper = chartTextWrapper.append('div').attrs({
		'class': 'wordsWrapper halfSize',
		'id': 'wordsWrapper'+pieNumber
	})
	const pieDiv = chartTextWrapper.append("div").attrs({
		'class': 'pieDiv halfSize',
		'id':'pieDiv'+pieNumber
	})

	let pieText = addDivToObj(pieTextWrapper, 'pieP',pieNumber);
	let pieTitle = addDivToObj(pieTextWrapper, 'pieTitle',pieNumber);
	      
	const pieSVG = pieDiv.append("svg");
	const pieG = pieSVG.append('g').style('max-height','900px');
	
	return {pieDiv, pieSVG, pieG, pieTitle, pieText};
}

function getClientDims(parentDivId, marginObj){

	// Extract the DIV width and height that was computed by pieCSS.
	let pieCSSDivWidth = document.getElementById(parentDivId).clientWidth;
	let pieCSSDivHeight = document.getElementById(parentDivId).clientHeight;
	
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
				if(d.data.town){
					return clrScl(clrVal(d.data))
				}else{
					return 'rgb(82,82,82)'
				}
			},
			'transform' : 'rotate(90)'
		})
		 .transition()
	    .ease(d3.easeBounce)
	    .duration(2100)
	    .attrTween("d", tweenFn);
}

function makeThisColorScale(interpolation, extent){
  return d3.scaleSequential(interpolation).domain(extent)
}

function selectAndUpdatePies(){
	d3.selectAll('.pieDiv').each(resizePie);
}

function selectMatchingTextsElements(paraNum){
	const pTitle = '#pieTitle'+paraNum;
	const pNumber = '#piePara'+paraNum;
	let thisPara = d3.select(pNumber);
	let thisTitle = d3.select(pTitle);
	return { thisPara, thisTitle };

}

function setPieTexts(t, p, d){
	p.text(d[0].percentBelow+'%')
	t.text(d[0].town)
}

function buildChart(obj, data, pieNumber){

	function tweenPie(b) {
	  b.innerRadius = 0;
	  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
	  return function(t) { return arcFunc(i(t)); };
	}

	let percentVal = data[0]["percentBelow"];

	let jsonData = [data[0]];

	addRemainderSlice(percentVal, jsonData);

	//get page elements into D3
	let {pieDiv, pieSVG, pieG, pieTitle, pieText} = makeD3ElementsFromParentDiv(obj.parentDivID, pieNumber);
	setPieTexts(pieTitle, pieText, data);

	//parse client dimensions
	let { pieCSSDivWidth, pieCSSDivHeight, pieDivWidthLessMargins, pieDivHeightLessMargins } = getClientDims('pieDiv'+pieNumber, obj.margin);

	//pie & arc functions
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(chartVars.pieWedgeValue, pieDivHeightLessMargins)

    pieG.attrs({
		'transform':`translate(${pieCSSDivWidth/2}, ${pieCSSDivHeight/2 }) rotate(32.7)`,
		'class':'pieGWrapper'
	})
	.style('max-height', '900px')

	//set svg height & width from div computed dimensions
	setSVGDims(pieSVG, pieCSSDivWidth, pieCSSDivHeight);
	pieSVG.attr('class','pieSVGWrapper')

	//Setup Scales
	const colorScale  = makeThisColorScale(d3.interpolateBlues, [2.3, 32.7] );

	//build the pie chart!
	buildPieChart(d3PieFunc, jsonData, pieG, arcFunc, colorScale, obj.colorValue, tweenPie);
}

//2. Build fn
function resizePie(d,i){

	var thisPieID = 'pieDiv'+i;

	let { pieCSSDivWidth, pieCSSDivHeight, pieDivWidthLessMargins, pieDivHeightLessMargins } = getClientDims(thisPieID, chartVars.margin)

	let pieSVG = d3.select('.pieSVGWrapper');
	let pieG = d3.select('.pieGWrapper');
	
	//set svg dimension based on resizing attrs
	setSVGDims(pieSVG, pieCSSDivWidth, pieCSSDivHeight);

	const { d3PieFunc, arcFunc } = makeD3PieFuncs(chartVars.pieWedgeValue, pieDivWidthLessMargins)

    arcFunc.outerRadius( (pieDivHeightLessMargins) * .95 );

    pieG.attr('transform', `translate(${pieCSSDivWidth/2}, ${pieCSSDivHeight/2 }) rotate(32.7)`);
    pieG.selectAll('path').attr('d', arcFunc)

}

let originalDataObj = [
	{town: "Central Falls", 'percentBelow': 32.7},
	{town: "Providence", 'percentBelow': 28.2},
	{town: "Woonsocket", 'percentBelow': 25.1},
	{town: "Pawtucket", 'percentBelow': 19.9},
	{town: "West Warwick", 'percentBelow': 16.4}
];

let chartVars = {
	parentDivID: 'piesWrapper',
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

originalDataObj.forEach((d, i) => {
	if(i <= 5){  
	  let thisObj = [{
	    town: d.town,
	    percentBelow: d.percentBelow,
	    chartNo: i + 1      
	  }];
	  setTimeout(() => buildChart(chartVars, thisObj, i), 60)
	}
})



d3.select(window)
      .on("resize", serializer( resizeCharts, selectAndUpdatePies ));