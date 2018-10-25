const vars ={
	xLabel : 'Year',
	yLabel : 'Population',
	xValue : d => d.date,
	yValue : d => d.close,
	margin : { 
		left: 140, 
		right: 50,
		top: 50,
		bottom: 120
	}

}

function appendGElement(parent, trans, cl){
	return parent.append('g')
 .attrs({
   'transform': trans,
   'class':cl
 });
}

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
const divWidthLessMargins =parentDivWidth - vars.margin.left - vars.margin.right;
const divHeightLessMargins = parentDivHeight - vars.margin.top - vars.margin.bottom;

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
	"width" : parentDivWidth,
	"height" : parentDivHeight
});

//translate the gWrapper
gObj.attr('transform', `translate(${vars.margin.left},${vars.margin.top})`);

//Build Axis Groups
const xAxisG = appendGElement(gObj, `translate(0, ${divHeightLessMargins})`, 'axis x')
const yAxisG = appendGElement(gObj, ``, 'axis y')

//set placeholder for axis labels      
let xAxisLabel = xAxisG.append('text');
let yAxisLabel = yAxisG.append('text');

function setAxisLabelAttrs(labelObj, cl, xVal, yVal, trans, txtAnc, txt){
	return labelObj
	 .attrs({
	   'class': cl,
	   'x': xVal,
	   'y': yVal,
	   'transform': trans
	 })
	 .style('text-anchor', txtAnc)
	 .text(txt);
}

//set attrs for axis labels      
setAxisLabelAttrs(xAxisLabel, 'axis-label', (divWidthLessMargins / 2), '100', '', '', vars.xLabel)
setAxisLabelAttrs(yAxisLabel, 'axis-label', (-divHeightLessMargins / 2), (-vars.margin.left / 1.5), `rotate(-90)`, 'middle', vars.yLabel)

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
	   	.domain(d3.extent(data, vars.xValue ))
	   	.range([0, divWidthLessMargins]);
	   yScale
	   	.domain([0, d3.max(data, vars.yValue )])
	   	.range([divHeightLessMargins, vars.margin.top]);
       

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
       let resizedWidthLessMargins = resizedFnWidth - vars.margin.left - vars.margin.right;
       let resizedHeightLessMargins = resizedFnHeight - vars.margin.top - vars.margin.bottom;

       //update scale ranges
       xScale.range([0, resizedWidthLessMargins]);
       yScale.range([resizedHeightLessMargins, vars.margin.top]);
       
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
               'y' : -vars.margin.left / 2,
           })
           .call(yAxis);

       //Update yAxis Label
       yAxisLabel.attrs({
           'x' : -resizedHeightLessMargins / 2,
           'y' : -vars.margin.left / 1.5,
       });

       //update gridLines
       d3.selectAll('.yLine')
           .attr('x2', resizedWidthLessMargins);
       
       d3.selectAll('.xLine')
           .attr('y2', -resizedHeightLessMargins);
	   
	   //update Line
	   line.attr("d", lineObj(parsedData));

	   //update beginning of area 
	   areaObj.y0(resizedHeightLessMargins)

	   //update Area
	   areaPath.attr("d", areaObj(parsedData))

   }       

//Add Resise listener & fn call
   window.addEventListener("resize", resize);