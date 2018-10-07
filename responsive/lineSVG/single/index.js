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

const margin = { 
	left: 160, 
	right: 50,
	top: 50,
	bottom: 120
};

//Select/Create div, svg, g
const chartDiv = document.getElementById('chartDiv');     
const svgObj = d3.select(chartDiv).append("svg").attr("border", '2px solid green');

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

let parsedData;

function buildChart(obj){

 d3.csv(obj.dataFile, data => {
  console.log('d3 data')
  console.log(data)
   parsedData = data;

   xScale
     .domain([0,250])
     .range([0, divWidthLessMargins]);

   yScale
     .domain([0,250])
     .range([0, divHeightLessMargins])
     .nice();

   svgObj.selectAll('.svgLine')
    .data(data)
    .enter()
    .append('line')
    .attrs({
      'x1': d => xScale(+d.x1),
      'y1': d => yScale(+d.y1),
      'x2': d => xScale(+d.x2),
      'y2': d => yScale(+d.y2),
      'class': 'svgLine'
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

}       

//Add Resise listener & fn call
window.addEventListener("resize", resize);