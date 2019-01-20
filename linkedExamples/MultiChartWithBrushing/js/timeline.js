function initTimeline(parentDiv){
	let wLM = state.timeline.w - state.timeline.margin.r - state.timeline.margin.l;
	let hLM = state.timeline.h - state.timeline.margin.t - state.timeline.margin.b;

	//set timelineSVG vals
	state.timeline.svg = d3.select(parentDiv).append('svg').attrs({
		'height': state.timeline.h,
		'width': state.timeline.w,
		'class': 'timelineSVG'
	})

	//set timeline G vals
	state.timeline.gObj = state.timeline.svg.append('g')
		.attr('class', 'timelineG')

	//set timeline scales
	state.timeline.xScale.range([0, state.timeline.w])
	state.timeline.yScale.range([state.timeline.h, 0])

	//build axis elements
	state.xAxisG = state.timeline.gObj.append('g')
		.attrs({
			'class' : 'timelineXAxisG',
			'transform' : `translate(0, ${state.timeline.h})`
		})

	state.timeline.areaPath = state.timeline.gObj
		.append('path')
		.attrs({
			'fill': '#ccc',
			'class': 'timelinePath'
		})

	updateTimeLine(state.filteredData[state.activeCoin], state.yVariable);
	//updateLine(state.filteredData[state.activeCoin], $("#date-slider").slider("values"))
}

function updateTimeLine(selectedCoinData, yVar){

	//update timeline scales
	state.timeline.xScale.domain(d3.extent(selectedCoinData, d => d.date))
	state.timeline.yScale.domain([0, d3.max(selectedCoinData, d => d[yVar])])

	//connect xScale & xAxisObj
	state.timeline.xAxisObj.scale(state.timeline.xScale)
	state.xAxisG.transition(t()).call(state.timeline.xAxisObj)

	let areaFn = d3.area()
		.x(d => state.timeline.xScale(d.date))
		.y0(state.timeline.h)
		.y1(d => state.timeline.yScale(d[yVar]))

	state.timeline.areaPath
		.data([selectedCoinData])
		.attr('d', areaFn)

}