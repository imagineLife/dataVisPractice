let chordTones;

const xValue = d => d.measure;
const yValue = d => d.ncts;

let margin = {
	top: 20,
	right: 140,
	bottom: 100,
	left: 120
};

let {chartDiv, svgObj, gObj} = lib.makeD3ObjsFromParentID('chartDiv')

const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Extract the DIV width and height that was computed by CSS.
let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
	"width" : parentDivWidth,
	"height" : parentDivHeight
});	

//translate the gWrapper
gObj.attr('transform', `translate(${margin.left},${margin.top})`);

const xAxisG = gObj.append("g")
  .attrs({
  	"class": "axis axis--x",
  	"transform": "translate(0," + divHeightLessMargins + ")"
  });
  // .call(d3.axisBottom(xScale));

const yAxisG = gObj.append("g")
  .attr("class", "axis axis--y");
  // .call(d3.axisLeft(yScale))
// .append("text")
//   .attrs({
//   	"transform": "rotate(-90)",
//   	"y": 6,
//   	"dy": "0.71em",
//   	"fill": "#000"
//   })
//   .text("Note Count");

//set placeholder for axis labels      
let xAxisLabel = xAxisG.append('text');
let yAxisLabel = yAxisG.append('text');

//set attrs for axis labels
lib.setAxisLabelAttrs(xAxisLabel, 'axis-label', (divWidthLessMargins / 2), '80', '', 'middle', 'xLabel')
lib.setAxisLabelAttrs(yAxisLabel, 'axis-label', (-divHeightLessMargins / 2), (-margin.left / 1.35), 'rotate(-90)', 'middle', 'yLabel')

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

let parseTime = d3.timeParse("%Y%m%d");

let d3LineObj = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return xScale(d.measure); })
    .y(function(d) { return yScale(d.ncts); });

// let line = gMusicLine.append("path")
// 	.attr("class", "line")

function parseData(d, columns) {
  d.hen = +d.hen;
  d.shaw = +d.shaw;
  d.measure = +d.measure;
  for (let i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}


function buildChart(obj){
	d3.csv(obj.dataFile, parseData, function(error, data) {
	  if (error) throw error;

	  chordTones = data.columns.slice(1).map(function(id) {
	    return {
	      id: id,
	      values: data.map(function(d) {
	        return {
	        	measure: d.measure,
	        	ncts: d[id]
	        }
	      })
	    };
	  });
	  // console.log('chordTones is ->',chordTones);

	  xScale
		.domain(d3.extent(data, function(d) { return d.measure; }))
		.range([0, divWidthLessMargins]);

	  yScale.domain([
		    d3.min(chordTones, c => d3.min(c.values, d => d.ncts)),
		    d3.max(chordTones, c => d3.max(c.values, d => d.ncts))
	  ])
	  .range([divHeightLessMargins, margin.top]);

	  colorScale.domain( chordTones.map( c => c.id ) );

	  //add axis Obj to parent
	  lib.appendAxisObjToParent(xAxis, xAxisG, 'xLine')
	  lib.appendAxisObjToParent(yAxis, yAxisG, 'yLine')

	  let gMusicLine = gObj.selectAll(".musicLine")
	    .data(chordTones)
	    .enter().append("g")
	      .attr("class", "gMusicLine");

	  let line = gMusicLine.append("path")
		.attrs({
			"class": "line",
			"d": function(d) { return d3LineObj(d.values); }
		})
		.style("stroke", function(d) { return colorScale(d.id); });


	  gMusicLine.append("text")
	      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
	      .attrs({
	      	"transform": d => "translate(" + xScale(d.value.measure) + "," + yScale(d.value.ncts) + ")",
	      	"x": 3,
	      	"dy": "0.35em",
	      	"class":'lineLabel'
	      })
	      .style("font", "18px sans-serif")
	      .style("stroke", function(d) { return colorScale(d.id); })
	      .style("fill", function(d) { return colorScale(d.id); })
	      .text(d => { 
	      	return (d.id == 'hen' ? "Joe Henderson" : "Woody Shaw" ) 
	      })

	});
};

let ChartObj = {
	svgClass : '.svgWrapper',
	dataFile : 'data.csv' 
}

buildChart(ChartObj);

let resize = () => {

	// Extract the DIV width and height that was computed by CSS.
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
    lib.updateAxisLabelXY(xAxisLabel, divWidthLessMargins / 2, 75 )
    lib.updateAxisLabelXY(yAxisLabel, (-divHeightLessMargins / 2), (-margin.left / 1.5))


	//update yLines
	d3.selectAll('.yLine')
	   .attr('x2', divWidthLessMargins);

	d3.selectAll('.xLine')
	   .attr('y2', -divHeightLessMargins);

   //update Line
   svgObj
   	.selectAll('.line')
   	.attr("d", function(d) { return d3LineObj(d.values); });

  svgObj
  	.selectAll('.lineLabel')
  	.attr("transform", d => "translate(" + xScale(d.value.measure) + "," + yScale(d.value.ncts) + ")");

}
//Add Resise listener & fn call
window.addEventListener("resize", resize);