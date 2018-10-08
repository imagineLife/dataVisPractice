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
	left: 20, 
	right: 20,
	top: 20,
	bottom: 20
};

//Select/Create div, svg, g
const chartDiv = document.getElementById('chartDiv');     
const svgObj = d3.select(chartDiv).append("svg").attr("border", '2px solid green');
let defs = svgObj.append('defs')

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
     .domain([0,210])
     .range([margin.left, divWidthLessMargins]);

   yScale
     .domain([0,210])
     .range([margin.top, divHeightLessMargins])
     .nice();

  defs.append('marker')
    .attrs({
      "id":"arrow",
      "viewBox":"0 -5 10 10",
      "refX":5,
      "refY":0,
      "markerWidth":4,
      "markerHeight":4,
      "orient":"auto"
    })
    .append("path")
      .attrs({
        "d": "M0,-5L10,0L0,5",
        "class": "arrowHead"
      })

   svgObj.selectAll('.svgLine')
    .data(data)
    .enter()
    .append('line')
    .attrs({
      'x1': d => xScale(+d.x1),
      'y1': d => yScale(+d.y1),
      'x2': d => xScale(+d.x2),
      'y2': d => yScale(+d.y2),
      'marker-end': `url(#arrow)`,
      'class': 'arrow'
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
   xScale.range([margin.left, resizedWidthLessMargins]);
   yScale.range([margin.top, resizedHeightLessMargins]);

   d3.select('.svgLine')
    .attrs({
      'x1': d => xScale(+d.x1),
      'y1': d => yScale(+d.y1),
      'x2': d => xScale(+d.x2),
      'y2': d => yScale(+d.y2)
    })

}       

//Add Resise listener & fn call
window.addEventListener("resize", resize);