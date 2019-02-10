//update stated brushFn
let brushFn = d3.brushX()
	.handleSize(10)
	.extent([ [0,0], [state.timeline.w, state.timeline.h] ])
	.on('brush', brushedFn)

function initTimeline(parentDiv){
	let wLM = state.timeline.w - state.timeline.margin.r - state.timeline.margin.l;
	let hLM = state.timeline.h - state.timeline.margin.t - state.timeline.margin.b;

	//set timelineSVG vals
	state.timeline.svgObj = d3.select(parentDiv).append('svg').attrs({
		'height': state.timeline.h,
		'width': state.timeline.w,
		// 'class': 'timelineSVG'
	})

	//set timeline G vals
	state.timeline.gObj = state.timeline.svgObj.append('g')
		// .attr('class', 'timelineG')

	//set timeline scales
	state.timeline.xScale.range([0, state.timeline.w])
	state.timeline.yScale.range([state.timeline.h, 0])

	//build axis elements
	state.xAxisG = state.timeline.gObj.append('g')
		.attrs({
			// 'class' : 'timelineXAxisG',
			'transform' : `translate(0, ${state.timeline.h})`
		})

	state.timeline.areaPath = state.timeline.gObj
		.append('path')
		.attrs({
			'fill': '#ccc',
			// 'class': 'timelinePath'
		})

			//append BrushObj to
	state.timeline.brushGWindow = state.timeline.gObj.append('g')
		.attr('class', 'brushGWindow')
		.call(brushFn)

	updateTimeLine(state.filteredData[state.activeCoin], state.yVariable);
}

function updateTimeLine(selectedCoinData, yVar){

	//update timeline scales
	state.timeline.xScale.domain(d3.extent(selectedCoinData, function(d){ return d.date; }))
	state.timeline.yScale.domain([0, d3.max(selectedCoinData, function(d){ return d[yVar] } )])

	//connect xScale & xAxisObj
	state.timeline.xAxisObj.scale(state.timeline.xScale)
	state.xAxisG.transition(t()).call(state.timeline.xAxisObj)

	//build areaFn
	let areaFn = d3.area()
		.x(function(d){ return state.timeline.xScale(d.date)})
		.y0(state.timeline.h)
		.y1(function(d){ return state.timeline.yScale(d[yVar])})
					
	//build brush area path
	state.timeline.areaPath
		.data([selectedCoinData])
		.attr('d', areaFn)

}


function brushedFn() {
    var selectedPixels = d3.event.selection || timeline.x.range();
    var newValues = selectedPixels.map(state.timeline.xScale.invert)
    

    $("#date-slider")
        .slider('values', 0, newValues[0])
        .slider('values', 1, newValues[1]);

    $("#dateLabel1").text(formatTime(newValues[0]));
    $("#dateLabel2").text(formatTime(newValues[1]));

    updateLine(state.filteredData[state.activeCoin], newValues)
}


