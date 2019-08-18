/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Inspired by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
///////// who was Inspired by the code of alangrafu //////
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

function buildChart(id, data, options) {
	
	let cfg = buildConfig(options)
	//If the supplied maxCircleValue is smaller than the actual one, replace by the max in the data
	var maxCircleValue = Math.max(cfg.maxCircleValue, d3.max(data, function(dataItem){
		return getMaxArrVal(dataItem, 'value')
	}));
		
	var axisNames = data[0].map((i, j) => i.axis),	//Names of each axis
		numberOfAxis = axisNames.length,			//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format('%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / numberOfAxis;//The width in radians of each "slice"
		
	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxCircleValue]);

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	let { svg, gWrapper, axisGrid } = prepElements(id, cfg)
	
	let filter = addGlow(gWrapper, 'glow');
	
	let arrofLevelNumbers = d3.range(1,(cfg.levels+1))
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(arrofLevelNumbers.reverse())
	   .enter()
		.append("circle")
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

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attrs({
	   	"class": "axisLabel",
	   	"x": 4,
	   	"y": d => -d*radius/cfg.levels,
	   	"dy": "0.4em",
	   	"fill": "#737373"
	   })
	   .style("font-size", "10px")
	   .text((d) => Format(maxCircleValue * d/cfg.levels));
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(axisNames)
		.enter()
		.append("g")
		.attr("class", "axis");
	
	//Append the lines
	axis.append("line")
		.attrs({
		  "x1": 0,
		  "y1": 0,
		  "x2": (d, i) => rScale(maxCircleValue*1.1) * Math.cos(angleSlice*i - Math.PI/2),
		  "y2": (d, i) => rScale(maxCircleValue*1.1) * Math.sin(angleSlice*i - Math.PI/2),
		  "class": "line",
		  "stroke": "white",
		  "stroke-width": "2px"
		})

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", (d, i) => rScale(maxCircleValue * cfg.labelRadiusPercentage) * Math.cos(angleSlice*i - Math.PI/2))
		.attr("y", (d, i) => rScale(maxCircleValue * cfg.labelRadiusPercentage) * Math.sin(angleSlice*i - Math.PI/2))
		.text(d => d)
		.call(wrap, cfg.maxLabelLengthInPx);
	
	//The radial line function
	var radarLine = d3.radialLine()
		// .interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
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
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

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

d3.json('./data.json', (err, data) => {
	if(err)
		console.log(`err: ${err}`)
	//Call function to draw the Radar chart
	buildChart("#chartDiv", data, radarChartOptions);
})