/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Inspired by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////////////////////////////////////////////////////

const buildConfig = (passedOpts) => {
	let resConfig = {
	 w: 600,				
	 h: 600,				
	 margin: {t: 20, r: 20, b: 20, l: 20},
	 levels: 3,				
	 maxCircleValue: 0, 			
	 labelRadiusPercentage: 1.25, 	
	 maxLabelLengthInPx: 60, 		
	 seriesOpacity: 0.35,
	 dotRadius: 4,
	 webRingOpacity: 0.1,
	 seriesStrokeW: 2,
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scaleOrdinal(d3.schemeCategory10)	//Color function
	};
	
	//Update the default config above if passed
	if('undefined' !== typeof passedOpts){
	  for(var i in passedOpts){
		if('undefined' !== typeof passedOpts[i]){ resConfig[i] = passedOpts[i]; }
	  }
	}

	return resConfig
}

//global place-holders
let radius, rScale, cfg, frmt, maxCircleValue, angleSlice;

const getMaxArrVal = (arr, key) => {
	return d3.max(arr.map(arrItem => arrItem[key]))
}

const prepElements = (id,cfg) => {
	const svg = d3.select(id).append("svg")
			.attrs({
				"width":  cfg.w + cfg.margin.l + cfg.margin.r,
				"height": cfg.h + cfg.margin.t + cfg.margin.b,
				"class": "radar"+id
			})

	var gWrapper = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.l) + "," + (cfg.h/2 + cfg.margin.t) + ")");

	var axisGrid = gWrapper.append("g").attr("class", "axisWrapper");

	return {svg, gWrapper, axisGrid}
}

const addGlow = (parent, name) => {
	let glowItem =  parent.append('defs').append('filter').attr('id', name),
		feGaussianBlur = glowItem.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = glowItem.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
}

const enterAxisG = e => {
	let chartG = e.append('g')
		.attr('class', 'chart-g')

	//web circles
	chartG.append("circle")
		.attrs({
			"class": "gridCircle",
			"r": (d, i) => radius/cfg.levels*d
		})
		.styles({
			"fill": "#CDCDCD",
			"stroke": "#CDCDCD",
			"fill-opacity": cfg.webRingOpacity,
			"filter" : "url(#glow)"
		})

	//web circle labels
	//Text indicating at what % each level is
	chartG.append("text")
	   .attrs({
	   	"class": "axisLabel",
	   	"x": 4,
	   	"y": d => -d*radius/cfg.levels,
	   	"dy": "0.4em",
	   	"fill": "#737373"
	   })
	   .style("font-size", "10px")
	   .text((d) => `${frmt(maxCircleValue * d/cfg.levels * 100)}%`);
}

const enterAxis = e => {
	let axisG = e.append("g")
		.attr("class", "axis-g");

	//Append the lines
	axisG.append("line")
	  .attrs({
	    "x1": 0,
	    "y1": 0,
	    "x2": (d, i) => rScale(maxCircleValue*1.1) * Math.cos(angleSlice*i - Math.PI/2),
	    "y2": (d, i) => rScale(maxCircleValue*1.1) * Math.sin(angleSlice*i - Math.PI/2),
	    "class": "line",
	    "stroke": "white",
	    "stroke-width": "2px"
	  })
}

function buildChart(id, data, options) {
	
	cfg = buildConfig(options)
	//If the supplied maxCircleValue is smaller than the actual one, replace by the max in the data
	maxCircleValue = Math.max(cfg.maxCircleValue, d3.max(data, dataItem =>  getMaxArrVal(dataItem, 'value')));
	var axisNameArr = data[0].map((i, j) => i.axis),	//Names of each axis
		numberOfAxis = axisNameArr.length;			//The number of different axes

	//GLOBAL for now...
	radius = Math.min(cfg.w/2, cfg.h/2); 	//Radius of the outermost circle
	frmt = d3.format(',.2');			 	//Percentage formatting
	angleSlice = Math.PI * 2 / numberOfAxis;//The width in radians of each "slice"
		
	//Scale for the radius
	rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxCircleValue]);

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	let { svg, gWrapper, axisGrid } = prepElements(id, cfg)
	
	let filter = addGlow(gWrapper, 'glow');
	
	let arrofLevelNumbers = d3.range(1,(cfg.levels+1))
	let reversedArrofLevelNumbers = arrofLevelNumbers.reverse()
	
	//background web-portion
	let axisGDataJoin = axisGrid.selectAll(".chart-g")
	  .data(reversedArrofLevelNumbers);
	axisGDataJoin.join(enterAxisG)
	
	//Create the straight lines radiating outward from the center
	var axisDataJoin = axisGrid.selectAll(".axis-g")
		.data(axisNameArr)
		axisDataJoin.join(enterAxis)


	//Append the labels at each axis
	// axis.append("text")
	// 	.attr("class", "legend")
	// 	.style("font-size", "11px")
	// 	.attr("text-anchor", "middle")
	// 	.attr("dy", "0.35em")
	// 	.attr("x", (d, i) => rScale(maxCircleValue * cfg.labelRadiusPercentage) * Math.cos(angleSlice*i - Math.PI/2))
	// 	.attr("y", (d, i) => rScale(maxCircleValue * cfg.labelRadiusPercentage) * Math.sin(angleSlice*i - Math.PI/2))
	// 	.text(d => d)
	// 	.call(wrap, cfg.maxLabelLengthInPx);
	
	//The radial line function
	var radarLine = d3.radialLine()
		// .interpolate("linear-closed")
		.radius(d => rScale(d.value))
		.angle((d,i) => i*angleSlice);
		
	if(cfg.roundStrokes == true) {
		radarLine.curve(d3.curveCardinalClosed);
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = gWrapper.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.seriesOpacity)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.seriesOpacity);
		});
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.seriesStrokeW + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data((d,i) => d)
		.enter().append("circle")
		.attrs({
			"class": "radarCircle",
			"r": cfg.dotRadius,
			"cx": (d,i) => rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2),
			"cy": (d,i) => rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2)
		})
		.styles({
			"fill": (d,i,j) => cfg.color(j),
			"fill-opacity": 0.8
		});

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = gWrapper.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
					
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = gWrapper.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
	
}//buildChart

let state = {
	margin : {t: 100, r: 100, b: 100, l: 100},
	w: 700,
	h: 500
}
const wLM = state.w - state.margin.l - state.margin.r,
	  hLM = state.h - state.margin.t - state.margin.b;

var radarChartOptions = {
  w: state.w,
  h: state.h,
  margin: state.margin,
  maxCircleValue: 0.5,
  levels: 5,
  roundStrokes: true, // this makes the lines ROUNDED!!
  color: color
};

var color = d3.scaleOrdinal()
	.range(["#EDC951","#CC333F","#00A0B0"]);

d3.json('./data.json').then(data => {
	//Call function to draw the Radar chart
	buildChart("#chartDiv", data, radarChartOptions);
})