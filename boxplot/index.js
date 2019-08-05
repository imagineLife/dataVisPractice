const state = {
	m: {
		t: 10,
		r: 30,
		b: 30,
		l: 40
	},
	w: 450,
	h: 450,
	minData: 0,
	maxData: n => Math.round(n * 1.1)
}

//dimensions, less-margins (Margin Convention)
// https://bl.ocks.org/mbostock/3019563
const wLM = state.w - state.m.l - state.m.r;
const hLM = state.h - state.m.t - state.m.b;


const svg = d3.select('#chartDiv').append('svg')
	.attrs({
		class: 'svg-wrapper',
		width: state.w,
		height: state.h
	})

const gWrapper = svg.append('g').attrs({
	class: 'g-wrapper',
	transform: `translate(${state.m.l}, ${state.m.t})`
})

const prepData = (data) => {
	var sorted = data.sort(d3.ascending)
	var q1 = d3.quantile(sorted, .25)
	var median = d3.quantile(sorted, .5)
	var q3 = d3.quantile(sorted, .75)
	var interQuantileRange = q3 - q1
	var min = q1 - 1.5 * interQuantileRange
	var max = q1 + 1.5 * interQuantileRange
	let obj = {
		data: data,
		q1,
		median,
		q3,
		min,
		max,
		maxData: state.maxData(max)
	}
	return obj
}

//load the data
d3.json('./data.json').then(prepData).then(resObj => {
	console.log('resObj')
	console.log(resObj)

	//build y-Scale
	const yScale = d3.scaleLinear()
		.domain([state.minData, resObj.maxData])
		.range([hLM, state.m.t])

	const yAxisObj = d3.axisLeft(yScale)

	gWrapper.call(yAxisObj)
})
