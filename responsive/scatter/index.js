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

let {chartDiv, svgObj, gObj} = lib.makeD3ObjsFromParentID('chartDiv')

//Select/Create div, svg, g
let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } =  lib.getDimsFromParent(chartDiv, margin);

//Setup Scales
const xScale = d3.scaleTime();
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal()
.range(d3.schemeCategory10);
// const radiusScale = d3.scaleLinear();

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
	"width" : parentDivWidth,
	"height" : parentDivHeight
});

//translate the gWrapper
gObj.attr('transform', `translate(${margin.left},${margin.top})`);

//Build Axis Groups
const xAxisG = lib.makeAxisG(gObj, `translate(0, ${divHeightLessMargins})`, 'axis x');
const yAxisG = lib.makeAxisG(gObj, ``, 'axis y');

const colorLegendG = gObj.append('g')
  .attr('transform', `translate(${divWidthLessMargins + 60}, 150)`);


//set placeholder for axis labels      
let xAxisLabel = xAxisG.append('text');
let yAxisLabel = yAxisG.append('text');

//set attrs for axis labels      
xAxisLabel = lib.makeAxisLabel(xAxisG, 'axis-label', (divWidthLessMargins / 2), 100, '', '', xLabel);
yAxisLabel = lib.makeAxisLabel(yAxisG, 'axis-label', (-divHeightLessMargins / 2), (-margin.left / 1.5), `rotate(-90)`, 'middle', yLabel);

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
.tickSize(-divWidthLessMargins)
.tickFormat(d3.format(".2s"));

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

	//Select/Create div, svg, g
	let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } =  lib.getDimsFromParent(chartDiv, margin);

	//set svg dimension based on resizing attrs
	svgObj.attrs({
	    "width" : parentDivWidth,
	    "height" : parentDivHeight
	});

	//update scale ranges
	xScale.range([0, divWidthLessMargins]);
	yScale.range([divHeightLessMargins, margin.top]);

	//Update the X & Y axis
    lib.resetAxisG(xAxisG, `translate(0, ${divHeightLessMargins})`, (divWidthLessMargins / 2), (divHeightLessMargins * .1), xAxis)
    lib.resetAxisG(yAxisG, ``, (-divHeightLessMargins / 2), (-margin.left / 2), yAxis)

 //update axis label positions
    lib.updateAxisLabelXY(xAxisLabel, divWidthLessMargins / 2, 100 )
    lib.updateAxisLabelXY(yAxisLabel, (-divHeightLessMargins / 2), (-margin.left / 1.5))

	//update Bubbles
	d3.selectAll('.circle').attrs({
		'cx': d => xScale(xValue(d)),
		'cy': d => yScale(yValue(d))
	});

	d3.selectAll('.yLine').attr('x2', divWidthLessMargins);
	d3.selectAll('.xLine').attr('y2', -divHeightLessMargins);

	// colorLegendG
	//   .attr('transform', `translate(${divWidthLessMargins + 60}, 150)`);	

}	  	

//1. Add Resise listener & fn call
d3.select(window).on('resize',resize);