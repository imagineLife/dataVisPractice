const xLabel = 'Year';
const yLabel = 'Population';
const xValue = d => d.year;
const yValue = d => d.population;
const margin = { 
	left: 160, 
	right: 50,
	top: 50,
	bottom: 120
};

let {chartDiv, svgObj, gObj} = lib.makeD3ObjsFromParentID('chartDiv');

//Setup Scales
const xScale = d3.scaleTime();
const yScale = d3.scaleLinear();

let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);

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

//set Make axis-label text
xAxisLabel = lib.makeAxisLabel(xAxisG, 'axis-label', (divWidthLessMargins / 2), 100, '', '', xLabel);
yAxisLabel = lib.makeAxisLabel(yAxisG, 'axis-label', (-divHeightLessMargins / 2), (-margin.left / 1.5), `rotate(-90)`, 'middle', yLabel);

//Build Axis elements
const xAxis = d3.axisBottom()
	.scale(xScale)
	.tickPadding(15)
	.tickSize(-divHeightLessMargins);

const yAxis = d3.axisLeft()
	.scale(yScale)
	.ticks(5)
	.tickPadding(15)
	.tickFormat(d3.format('.2s'))
	.tickSize(-divWidthLessMargins);

const lineObj = d3.line()
	.x(d => xScale( xValue(d) ))
	.y(d => yScale( yValue(d) ))
	.curve(d3.curveBasis)


let linePath = gObj.append('path')
	.attrs({
	   'fill': 'none',
	   'stroke': 'steelblue',
	   'stroke-width': 4,
	   'class': 'path'
	});

const parseData = d => {
	d.population = +d.population;
	let parsedDate = d3.timeParse("%Y");
	d.year = parsedDate(d.year);
	return d;
};

let parsedData;

function buildChart(obj){

 d3.csv(obj.dataFile, parseData, data => {
   parsedData = data;

   xScale
     .domain(d3.extent(data, xValue))
     .range([0, divWidthLessMargins]);

   yScale
     .domain(d3.extent(data, yValue))
     .range([divHeightLessMargins, margin.top])
     .nice();

   linePath.attr('d', lineObj(data) );

   lib.appendAxisObjToParent(xAxis, xAxisG, 'xLine');
   lib.appendAxisObjToParent(yAxis, yAxisG, 'yLine');

 xAxisG.selectAll('.tick text')
     .attrs({
       'transform': 'rotate(-45)',
       'text-anchor': 'end',
       'alignment-baseline':'middle',
       'x': -5,
       'y': 15,
       'dy':0
     })

 });

}

let AllChartObj = {
   svgClass: '.svgWrapper',
   dataFile:'data.csv'
}
buildChart(AllChartObj);

//2. Build fn
let resize = () => {
   
   let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);

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


   //update yLines
   d3.selectAll('.yLine').attr('x2', divWidthLessMargins);
   
   d3.selectAll('.xLine').attr('y2', -divHeightLessMargins);
   
   //update Line
   linePath.attr("d", lineObj(parsedData));

}       

//Add Resise listener & fn call
window.addEventListener("resize", resize);