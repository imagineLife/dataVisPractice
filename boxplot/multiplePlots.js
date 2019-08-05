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
	maxData: n => Math.round(n * 1.1),
	boxCenter: 0,
	boxW: 0,
	yScale: null
}

//dimensions, less-margins (Margin Convention)
// https://bl.ocks.org/mbostock/3019563
const wLM = state.w - state.m.l - state.m.r;
const hLM = state.h - state.m.t - state.m.b;


const svg = d3.select('#multiple-plots').append('svg')
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
	console.log('data')
	console.log(data)
	
	// var sorted = data.sort(d3.ascending)
	// var q1 = d3.quantile(sorted, .25)
	// var median = d3.quantile(sorted, .5)
	// var q3 = d3.quantile(sorted, .75)
	// var interQuantileRange = q3 - q1
	// var min = q1 - 1.5 * interQuantileRange
	// var max = q1 + 1.5 * interQuantileRange
	// let obj = {
	// 	data: data,
	// 	q1,
	// 	median,
	// 	q3,
	// 	min,
	// 	max,
	// 	maxData: state.maxData(max)
	// }
	return data
}

const enterLines = enterSelection => {
	enterSelection.append("line")
  .attrs({
  	"x1": state.boxCenter-state.boxW/2,
  	"x2": state.boxCenter+state.boxW/2,
  	"y1": d => state.yScale(d),
  	"y2": d => state.yScale(d),
  	"stroke": "black"
  })
}

//load the data
d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv').then(prepData)//.then(resObj => {

	// const { maxData, min, max, q1, q3, median } = resObj
	// //build y-Scale
	// state.yScale = d3.scaleLinear()
	// 	.domain([state.minData, maxData])
	// 	.range([hLM, state.m.t])

	// //build yaxis obj
	// const yAxisObj = d3.axisLeft(state.yScale)

	// //append yAxis to gWrapper
	// gWrapper.call(yAxisObj)

	// //extra notes for the box?!
	// state.boxCenter = 200, state.boxW = 100;

	// //append central vertical box-plot line
	// gWrapper.append('line')
	// 	.attrs({
	// 		x1: state.boxCenter,
	// 		x2: state.boxCenter,
	// 		y1: state.yScale(min),
	// 		y2: state.yScale(max),
	// 		stroke: `black`
	// 	})

	// //append the box
	// gWrapper.append('rect')
	// 	.attrs({
	// 		x: state.boxCenter - state.boxW/2,
	// 		y: state.yScale(q3),
	// 		height: (state.yScale(q1) - state.yScale(q3)),
	// 		width: state.boxW,
	// 		stroke: 'black',
	// 		fill: `#69b3a2`
	// 	})

	// //build data arr for hz box-plot lines
	// const minMaxMed = [min, median, max]

	// //make data-join
	// let hzLineDataJoin = gWrapper.selectAll('.line-hz')
	// .data(minMaxMed)

	// hzLineDataJoin.join(enterLines)

//})
