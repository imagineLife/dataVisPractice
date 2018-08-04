function makeAxisG(parent, transformation, className){
	return parent.append('g')
	.attrs({
		'transform': transformation,
		'class':className
	});

}

function resetAxisG(axisG, transform, xPos, yPos, caller){
	return axisG
   .attrs({
       'transform': transform,
       'x' : xPos,
       'y' : yPos,
   })
   .call(caller);
}


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

//Select/Create div, svg, g
const chartDiv = document.getElementById('chartDiv');     
const svgObj = d3.select(chartDiv).append("svg").attr("border", '2px solid green');
const gObj = svgObj.append('g').attr('class','gWrapper');

//Setup Scales
const xScale = d3.scaleTime();
const yScale = d3.scaleLinear();

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
const xAxisG = makeAxisG(gObj, `translate(0, ${divHeightLessMargins})`, 'axis x');
const yAxisG = makeAxisG(gObj, ``, 'axis y');

function makeAxisLabel(parent, className, xPos, yPos, textVal, transformation){
	return parent.append('text')
	.attrs({
		'class': className,
		'x': xPos,
		'y': yPos,
		'transform': transformation
	})
	.style('text-anchor', 'middle')
	.text(textVal);
}

//set Make axis-label text
xAxisLabel = makeAxisLabel(xAxisG, 'axis-label', (divWidthLessMargins / 2), 100, xLabel, '');
yAxisLabel = makeAxisLabel(yAxisG, 'axis-label', (-divHeightLessMargins / 2), (-margin.left / 1.5), yLabel, `rotate(-90)`);

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

   //Update the line

   
   //Update the X & Y axis

    resetAxisG(xAxisG, `translate(0, ${resizedHeightLessMargins})`, (divWidthLessMargins / 2), (resizedHeightLessMargins * .1), xAxis)
    resetAxisG(yAxisG, ``, (-resizedHeightLessMargins / 2), (-margin.left / 2), yAxis)

   //Update the X-AXIS LABEL
   xAxisLabel
       .attrs({
         'x' : resizedWidthLessMargins / 2
       })

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
   linePath.attr("d", lineObj(parsedData));

}       

//Add Resise listener & fn call
window.addEventListener("resize", resize);