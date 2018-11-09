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

function inputValChanged(t, d3PF){
	if(t){

		pieWedgeValue = (t.value === 'oranges') ? d => d['oranges'] : d => d['apples']; 
	}

	buildChart(AllChartObj)

    // path = path.data(pie); // compute the new angles
    // path.attr("d", arc); // redraw the arcs
}

let dataObject = [
	{
		"apples": 53245,
		"oranges": 200
	},
	{
		"apples": 28479,
		"oranges": 200
	},
	{
		"apples": 19697,
		"oranges": 200
	},
	{
		"apples": 24037,
		"oranges": 200
	},
	{
		"apples": 40245,
		"oranges": 200
	}
];

let AllChartObj = {
	svgClass: '.svgWrapper',
	jsonData: dataObject
}

let pieWedgeValue = d => d['apples'];
const colorValue = d => d.oranges;
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
			'fill': (d,i) => colorScale(i),
		});


	d3.selectAll('input')
		.on('click', function(){
			inputValChanged(this, d3PieFunc)
		})
}

function resize(){

	let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)

	const svgObj = d3.select('svg'), pieG = d3.select('.pieGWrapper');
	//set svg dimension based on resizing attrs
	setSVGDims(svgObj, cssDivWidth, cssDivHeight);
	const { d3PieFunc, arcFunc } = makeD3PieFuncs(pieWedgeValue, divWidthLessMargins)

	let curResizeVal = (divWidthLessMargins/2) * .7;

	let biggestRadius = (curResizeVal < 221) ? curResizeVal : 220; 
    arcFunc.outerRadius(biggestRadius);

    pieG.attr('transform', `translate(${cssDivWidth/2}, ${cssDivHeight/2 })`);
    pieG.selectAll('path').attr('d', arcFunc)

}

buildChart(AllChartObj);  	

//Resise listener & fn call
d3.select(window).on('resize',resize);