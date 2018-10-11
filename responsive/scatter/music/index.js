const v = {
	xLabel : 'Starting Beat',
	yLabel : 'Duration (in beats)',
	colorLabel : 'Chord Tone',
	xValue : d => d.startedBeat,
	yValue : d => d.noteDuration,
	colorValue : d => d.chordTone,
	margin : { 
		left: 140, 
		right: 200,
		top: 20,
		bottom: 120
	},

}

function appendGElement(parent, trans, clName){
	return parent.append('g')
	  .attrs({
	  	'transform' : `translate(${trans})`,
	  	'class' : clName
	  });
}

//Select/Create div, svg, g
const chartDiv = document.getElementById('chartDiv'); 	      
const svgObj = d3.select(chartDiv).append("svg").attrs({
	// "class":obj.svgClass,
	"border": '2px solid green'
});
const gObj = svgObj.append('g').attr('class','gWrapper');

//Setup Scales
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal()
.range(d3.schemeCategory10);

// Extract the DIV width and height that was computed by CSS.
let cssDivWidth = chartDiv.clientWidth;
let cssDivHeight = chartDiv.clientHeight;

//get css-computed dimensions
const divWidthLessMargins = cssDivWidth - v.margin.left - v.margin.right;
const divHeightLessMargins = cssDivHeight - v.margin.top - v.margin.bottom;
// console.log('chart dimensions ->',divWidthLessMargins,'x',divHeightLessMargins);

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
"width" : cssDivWidth,
"height" : cssDivHeight
});

//translate the gWrapper
gObj.attr('transform', `translate(${v.margin.left},${v.margin.top})`);

//Build Axis Groups
const xAxisG = appendGElement(gObj,`0, ${divHeightLessMargins}`,'axis x')
const yAxisG = appendGElement(gObj,`0,0`,'axis y')
const colorLegendG = appendGElement(gObj,`${divWidthLessMargins + 60}, 150`,'colorLegendG');

//set placeholder for axis labels      
let xAxisLabel = xAxisG.append('text');
let yAxisLabel = yAxisG.append('text');

function setPositionOfAxisLabel(obj, cl, xPos, yPos, trans, style, txtVal){
	return obj
	  .attrs({
	  	'class': cl,
		'x': xPos,
	  	'y': yPos,
	  	'transform': trans,
	  })
	  .style('text-anchor', 'middle')
	  .text(txtVal)
}

setPositionOfAxisLabel(xAxisLabel,'axis-label',(divWidthLessMargins / 2),'100','',v.xLabel)
setPositionOfAxisLabel(yAxisLabel,'axis-label',(-divHeightLessMargins / 2),(-v.margin.left / 1.5),`rotate(-90)`,v.xLabel)


//set attrs for axis labels      
xAxisLabel
  .attrs({
  	'class': 'axis-label',
	'x': (divWidthLessMargins / 2),
  	'y': '100'
  })
  .text(v.xLabel);

yAxisLabel
  .attrs({
  	'class': 'axis-label',
    'x' : -divHeightLessMargins / 2,
    'y' : -v.margin.left / 1.5,
    'transform' : `rotate(-90)`
  })
  .style('text-anchor', 'middle')
  .text(v.yLabel);

colorLegendG.append('text')
  .attrs({
  	'class': 'legend-label',
  	'x': -3,
  	'y': -40
  })
  .text(v.colorLabel);

//Build Axis elements
const xAxisD3Obj = d3.axisBottom()
.scale(xScale)
.tickPadding(15)
.tickSize(-divWidthLessMargins);

const yAxis = d3.axisLeft()
.scale(yScale)
.ticks(Math.max(divHeightLessMargins/80, 2))
.tickPadding(15)
.tickSize(-divWidthLessMargins);

// const colorLegend = d3.legendColor()
//   .scale(colorScale)
//   .shape('circle');

const parseData = d => {
	d.noteID = +d.noteID;
d.chorusNumber = +d.chorusNumber;
d.sectionNumber = +d.sectionNumber;
d.measureNumber = +d.measureNumber;
d.chordType = +d.chordType;
d.downBeat = +d.downBeat;
d.chordTone = +d.chordTone;
d.startedBeat = +d.startedBeat;
d.noteDuration = +d.noteDuration;
d.triad = +d.triad;
d.halfStepsMoved = +d.halfStepsMoved;
d.directionMoved = +d.directionMoved;
d.diatonic = +d.diatonic;
d.intervalFromChordRoot = +d.intervalFromChordRoot;
if(d.chordTone == 0){
	d.chordTone = "No"
}else{
	d.chordTone = 'Yes'
}
return d;
};

function buildChart(obj){

d3.csv(obj.dataFile, parseData, data => {
xScale
  .domain(d3.extent(data, v.xValue))
  .range([0, divWidthLessMargins]);

yScale
  .domain(d3.extent(data, v.yValue))
  .range([divHeightLessMargins, v.margin.top])
  .nice();

gObj.selectAll('circle').data(data)
  .enter().append('circle')
    .attrs({
    	'cx': d => xScale(v.xValue(d)),
    	'cy': d => yScale(v.yValue(d)),
    	'fill': d => colorScale(v.colorValue(d)),
    	'fill-opacity': 0.3,
    	'r': 17,
    	'class':'circle'
    });

xAxisG.call(xAxisD3Obj)
	.selectAll('.tick line').attrs({
		'class':'xLine',
		'stroke-dasharray': '1, 5'
	});
yAxisG.call(yAxis)
	.selectAll('.tick line').attrs({
		'class':'yLine',
		'stroke-dasharray': '1, 5'
	});
// colorLegendG.call(colorLegend)
//   .selectAll('.cell text')
//     .attr('dy', '0.1em');
});

}

let AllChartObj = {
	svgClass: '.svgWrapper',
	dataFile:'data.csv'
}
buildChart(AllChartObj);

//2. Build fn
let resize = () => {

// Extract the width and height that was computed by CSS.
	let resizedFnWidth = chartDiv.clientWidth;
	let resizedFnHeight = chartDiv.clientHeight;

	//set svg dimension based on resizing attrs
	svgObj.attrs({
	    "width" : resizedFnWidth,
	    "height" : resizedFnHeight
	});

	//calc resized dimensions less margins
	let resizedWidthLessMargins = resizedFnWidth - v.margin.left - v.margin.right;
	let resizedHeightLessMargins = resizedFnHeight - v.margin.top - v.margin.bottom;

	//update scale ranges
	xScale.range([0, resizedWidthLessMargins]);
	yScale.range([resizedHeightLessMargins, v.margin.top]);

	//Update the X-AXIS
	xAxisG
		.attrs({
		    'transform': `translate(0, ${resizedHeightLessMargins})`,
		    'x' : divWidthLessMargins / 2,
		    'y' : resizedFnHeight * .1,
		})
		.call(xAxisD3Obj);

	//Update the X-AXIS LABEL
	xAxisLabel
		.attrs({
		  'x' : resizedWidthLessMargins / 2,
		  // 'y' : resizedFnHeight * .17
		})

	//Update the Y-AXIS
	yAxisG
		.attrs({
		    'x' : -resizedHeightLessMargins / 2,
		    'y' : -v.margin.left / 2,
		})
		.call(yAxis);

	//Update yAxis Label
	yAxisLabel.attrs({
		'x' : -resizedHeightLessMargins / 2,
		'y' : -v.margin.left / 1.5,
	});

	//update Bubbles
	d3.selectAll('.circle').attrs({
		'cx': d => xScale(v.xValue(d)),
		'cy': d => yScale(v.yValue(d))
	});

d3.selectAll('.yLine')
	.attr('x2', resizedWidthLessMargins);

colorLegendG
  .attr('transform', `translate(${resizedWidthLessMargins + 60}, 150)`);	

	yAxis.ticks(Math.max(resizedHeightLessMargins/80, 2))
yAxisG.selectAll('.tick line').attrs({
		'class':'yLine',
		'stroke-dasharray': '1, 5'
	});

}	  	

//1. Add Resise listener & fn call
d3.select(window).on('resize',resize);
// resize();