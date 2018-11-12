const xLabel = 'Year';
const yLabel = 'Total Days';

const xValue = d => d.Date;
const yValue = d => d.TotalDays;

// const colorValue = d => d.TotalDeaths;
const colorValue = () => 'steelblue';
const colorLabel = 'Total Days';

const margin = { 
	left: 140, 
	right: 200,
	top: 20,
	bottom: 120
};

//Select/Create div, svg, g
const chartDiv = document.getElementById('chartDiv'); 	      
const svgObj = d3.select(chartDiv).append("svg").attrs({
	// "class":obj.svgClass,
	"border": '2px solid green'
});
const gObj = svgObj.append('g').attr('class','gWrapper');

//Setup Scales
const xScale = d3.scaleTime();
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal()
.range(d3.schemeCategory10);
// const radiusScale = d3.scaleLinear();


// Extract the DIV width and height that was computed by CSS.
let cssDivWidth = chartDiv.clientWidth;
let cssDivHeight = chartDiv.clientHeight;

//get css-computed dimensions
const divWidthLessMargins =cssDivWidth - margin.left - margin.right;
const divHeightLessMargins = cssDivHeight - margin.top - margin.bottom;

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
"width" : cssDivWidth,
"height" : cssDivHeight
});

//translate the gWrapper
gObj.attr('transform', `translate(${margin.left},${margin.top})`);

//Build Axis Groups
const xAxisG = gObj.append('g')
  .attrs({
  	'transform': `translate(0, ${divHeightLessMargins})`,
  	'class':'axis x'
  });
const yAxisG = gObj.append('g')
	.attrs({
		'class': 'axis y',
		// 'transform': `rotate(-90)`
	});
const colorLegendG = gObj.append('g')
  .attr('transform', `translate(${divWidthLessMargins + 60}, 150)`);


//set placeholder for axis labels      
let xAxisLabel = xAxisG.append('text');
let yAxisLabel = yAxisG.append('text');

//set attrs for axis labels      
xAxisLabel
  .attrs({
  	'class': 'axis-label',
	'x': (divWidthLessMargins / 2),
  	'y': '100'
  })
  .text(xLabel);

yAxisLabel
  .attrs({
  	'class': 'axis-label',
    'x' : -divHeightLessMargins / 2,
    'y' : -margin.left / 1.5,
    'transform' : `rotate(-90)`
  })
  .style('text-anchor', 'middle')
  .text(yLabel);

colorLegendG.append('text')
  .attrs({
  	'class': 'legend-label',
  	'x': -3,
  	'y': -40
  })
  .text(colorLabel);

//Build Axis elements
const xAxis = d3.axisBottom()
.scale(xScale)
.tickPadding(15)
.tickSize(-divWidthLessMargins);

const yAxis = d3.axisLeft()
.scale(yScale)
.ticks(5)
.tickPadding(15)
.tickSize(-divWidthLessMargins);

// const colorLegend = d3.legendColor()
//   .scale(colorScale)
//   .shape('circle');

const parseData = d => {
	// if (d.WarName.includes("World")){
	// 	return
	// }
	d.WarNum = +d.WarNum;
	d.TotalDeaths = +d.TotalDeaths;
	d.TotalDays = +d.TotalDays;
	let parsedDate = d3.timeParse("%m-%e-%Y");
	d.Date = parsedDate(d.StartDate);
	// console.log(d);
	return d;
};

function buildChart(obj){

d3.csv(obj.dataFile, parseData, data => {
xScale
  .domain(d3.extent(data, xValue))
  .range([0, divWidthLessMargins]);

yScale
  .domain(d3.extent(data, yValue))
  .range([divHeightLessMargins, margin.top])
  .nice();

gObj.selectAll('circle').data(data)
  .enter().append('circle')
    .attrs({
    	'cx': d => xScale(xValue(d)),
    	'cy': d => yScale(yValue(d)),
    	'fill': d => colorScale(colorValue(d)),
    	'fill-opacity': 0.3,
    	'r': 17,
    	'class':'circle'
    });

xAxisG.call(xAxis)
	.selectAll('.tick line').attrs({
		'class':'xLine',
		'stroke-dasharray': '1, 5'
	});

xAxisG.selectAll('.tick text')
  .attrs({
    'transform': 'rotate(-45)',
    'text-anchor': 'end',
    'alignment-baseline':'middle',
    'x': -5,
    'y': 15,
    'dy':0
  })

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
let resizedWidthLessMargins = resizedFnWidth - margin.left - margin.right;
	let resizedHeightLessMargins = resizedFnHeight - margin.top - margin.bottom;

	//update scale ranges
	xScale.range([0, resizedWidthLessMargins]);
	yScale.range([resizedHeightLessMargins, margin.top]);

	//Update the X-AXIS
xAxisG
	.attrs({
	    'transform': `translate(0, ${resizedHeightLessMargins})`,
	    'x' : divWidthLessMargins / 2,
	    'y' : resizedFnHeight * .1,
	})
	.call(xAxis);

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
	    'y' : -margin.left / 2,
	})
	.call(yAxis);

//Update yAxis Label
yAxisLabel.attrs({
	'x' : -resizedHeightLessMargins / 2,
	'y' : -margin.left / 1.5,
});

//update Bubbles
d3.selectAll('.circle').attrs({
	'cx': d => xScale(xValue(d)),
	'cy': d => yScale(yValue(d))
});

d3.selectAll('.yLine')
	.attr('x2', resizedWidthLessMargins);

colorLegendG
  .attr('transform', `translate(${resizedWidthLessMargins + 60}, 150)`);	

	// yAxis.ticks(Math.max(resizedHeightLessMargins/80, 2))
	// 	.attrs({
//   		'class':'yLine',
//   		'stroke-dasharray': '1, 5'
//   	});


}	  	

//1. Add Resise listener & fn call
d3.select(window).on('resize',resize);