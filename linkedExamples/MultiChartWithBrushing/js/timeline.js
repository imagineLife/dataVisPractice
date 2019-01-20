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

	state.arePath = state.timeline.gObj
		.append('path')
		.attrs({
			'fill': '#ccc',
			'class': 'timelinePath'
		})

	updateTimeLine();
}

function updateTimeLine(){

}