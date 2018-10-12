const v = {
	xLabel : 'Starting Beat',
	yLabel : 'Half Steps Moved',
	colorLabel : 'Chord Tone',
	xValue : d => d.startedBeat,
	yValue : d => d.halfStepsMoved,
	radiusValue : d => d.noteDuration,
	colorValue : d => d.chordTone,
	margin : { 
		left: 140, 
		// right: 200, put back if adding legend
		right: 75,
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

function setPositionOfLabel(obj, cl, xPos, yPos, trans, txtVal){
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

function makeAxis(pos, scaleObj, tickPadding, tickSize, ticks){
	let theseTicks = (pos == 'Bottom') ? 8 : ticks
	const axisType = `axis${pos}`
    return d3[axisType]()
      .scale(scaleObj)
      .tickSize(tickSize)
      .tickPadding(tickPadding)
      .ticks(theseTicks)
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
const colorScale = d3.scaleOrdinal(d3.schemeDark2);
const radiusScale = d3.scaleLinear();

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
// const colorLegendG = appendGElement(gObj,`${divWidthLessMargins + 60}, ${divHeightLessMargins - 50}`,'colorLegendG');

//set placeholder for axis labels      
let xAxisLabel = xAxisG.append('text');
let yAxisLabel = yAxisG.append('text');
// let colorLegendLabel = colorLegendG.append('text');

//set attrs for axis labels
//obj, cl, xPos, yPos, trans, txtVal
setPositionOfLabel(xAxisLabel,'axis-label',(divWidthLessMargins / 2),'100','',v.xLabel);
setPositionOfLabel(yAxisLabel,'axis-label',(-divHeightLessMargins / 2),(-v.margin.left / 1.5),`rotate(-90)`,v.yLabel);
// setPositionOfLabel(colorLegendLabel,'legend-label', 40, -40,'',v.colorLabel);

//Build Axis elements
let xAxisD3Obj = makeAxis('Bottom', xScale, 15, -divHeightLessMargins, Math.max(divWidthLessMargins/80, 2))
let yAxisD3Obj = makeAxis('Left',yScale, 15, -divWidthLessMargins, (Math.max(divHeightLessMargins/80, 2)))

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

	radiusScale
	  .domain(d3.extent(data, v.radiusValue))
	  .range([1, 100])

	gObj.selectAll('circle').data(data)
	   .enter().append('circle')
	    .attrs({
	    	'cx': d => xScale(v.xValue(d)),
	    	'cy': d => yScale(v.yValue(d)),
	    	'fill': d => colorScale(v.colorValue(d)),
	    	'fill-opacity': 0.1,
	    	'stroke': d => colorScale(v.colorValue(d)),
	    	'stroke-opacity': .7,
	    	// 'fill': 'none',
	    	'r': d => radiusScale(v.radiusValue(d)),
	    	'class':'circle'
	    })

	xAxisG.call(xAxisD3Obj)
		.selectAll('.tick line').attrs({
			'class':'xLine',
			'stroke-dasharray': '1, 10'
		});
	yAxisG.call(yAxisD3Obj)
		.selectAll('.tick line').attrs({
			'class':'yLine',
			'stroke-dasharray': '1, 10'
		});

		// colorLegendG.call(colorLegend)
	 //          .selectAll('.cell text')
	 //            .attr('dy', '0.1em');
	 //    d3.selectAll('.swatch').attr('opacity', .3)
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
		.call(xAxisD3Obj)
		.selectAll('.tick line').attrs({
			'class':'xLine',
			'stroke-dasharray': '1, 5'
		});;

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
		.call(yAxisD3Obj)
		.selectAll('.tick line').attrs({
			'class':'yLine',
			'stroke-dasharray': '1, 5'
		});

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

	// colorLegendG
	//   .attr('transform', `translate(${resizedWidthLessMargins + 60}, ${resizedHeightLessMargins - 50})`);	

	yAxisD3Obj.ticks(Math.max(resizedHeightLessMargins/80, 2))
	xAxisD3Obj.ticks(Math.min(Math.max(resizedWidthLessMargins/80, 2), 8))

	d3.selectAll('.yLine').attr('x2', resizedWidthLessMargins);

	d3.selectAll('.xLine').attr('y2', -resizedHeightLessMargins);

}	  	

//1. Add Resise listener & fn call
d3.select(window).on('resize',resize);
// resize();