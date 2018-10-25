const xLabel = 'Year';
const yLabel = 'Population';

const xValue = d => d.year;
const yValue = d => d.population;

const margin = { 
	left: 140, 
	right: 50,
	top: 50,
	bottom: 120
};

//Select/Create div, svg, g
const chartDiv = document.getElementById('chartDiv');     
const svgObj = d3.select(chartDiv).append("svg").attrs({
	'border': '2px solid green',
	'class': 'area'
});
const gObj = svgObj.append('g').attr('class','gWrapper');

//Setup Scales
const xScale = d3.scaleTime()
//.range([0, width]);
const yScale = d3.scaleLinear()
//.range([height, 0]);

// Extract the DIV width and height that was computed by CSS.
let parentDivWidth = chartDiv.clientWidth;
let parentDivHeight = chartDiv.clientHeight;

//get css-computed dimensions
const divWidthLessMargins =parentDivWidth - margin.left - margin.right;
const divHeightLessMargins = parentDivHeight - margin.top - margin.bottom;

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
	"width" : parentDivWidth,
	"height" : parentDivHeight
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
   'class': 'axis y'
});

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

// define the area
const areaObj = d3.area()
    .x(function(d) { return xScale(d.date); })
    .y0(divHeightLessMargins)
    .y1(function(d) { return yScale(d.close); });

// define the line
var lineObj = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.close); });


let line = gObj.append('path')
	.attrs({
	   'fill': 'none',
	   'stroke': 'steelblue',
	   'stroke-width': 4,
	   'class': 'line'
	});

	  // add the area
let areaPath = gObj.append("path");


const parseData = d => {
	d.date = parseTime(d.date);
	d.close = +d.close;
	return d;
};

// parse the date / time
const parseTime = d3.timeParse("%d-%b-%y");

let parsedData;

   function buildChart(obj){

     d3.csv(obj.dataFile, parseData, data => {
        parsedData = data;


       // scale the range of the data
	   xScale
	   	.domain(d3.extent(data, function(d) { return d.date; }));
	   yScale
	   	.domain([0, d3.max(data, function(d) { return d.close; })]);
       
       xScale
         .range([0, divWidthLessMargins]);

       yScale
         .range([divHeightLessMargins, margin.top])
         .nice();

       line.attr('d', lineObj(data) );

       	areaPath.data([data])
	       .attr("class", "area")
	       .attr("d", d => areaObj(d));

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

     });

   }

   let AllChartObj = {
       svgClass: '.svgWrapper',
       dataFile:'data.csv'
   }
   buildChart(AllChartObj);

//2. Resize fn
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
               'y' : resizedHeightLessMargins * .1,
           })
           .call(xAxis);

       //Update the X-AXIS LABEL
       xAxisLabel
           .attrs({
             'x' : resizedWidthLessMargins / 2
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

       //update yLines
       d3.selectAll('.yLine')
           .attr('x2', resizedWidthLessMargins);
       
       d3.selectAll('.xLine')
           .attr('y2', -resizedHeightLessMargins);
	   
	   //update Line
	   line.attr("d", lineObj(parsedData));

	   areaObj.y0(resizedHeightLessMargins)

	   //update Area
	   areaPath.attr("d", areaObj(parsedData))

   }       

//Add Resise listener & fn call
   window.addEventListener("resize", resize);