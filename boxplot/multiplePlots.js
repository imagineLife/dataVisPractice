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
	yScale: null,
	xScale: null
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

	let resObj = {
		q1: null,
		median: null,
		q3: null,
		interQuantileRange: null,
		min: null,
		max: null,
		maxData: null,
		sumStats: null
	}
	
	const sumStats = d3.nest()
	.key(d => d["Species"])
	.rollup(function(d){
		var q1 = d3.quantile(data.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending), .25)
		var median = d3.quantile(data.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending), .5)
		var q3 = d3.quantile(data.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending), .75)
		var interQuantileRange = q3 - q1
		var min = q1 - 1.5 * interQuantileRange
		var max = q1 + 1.5 * interQuantileRange
		
		resObj.q1 = q1,
		resObj.median = median,
		resObj.q3 = q3,
		resObj.interQuantileRange = interQuantileRange,
		resObj.min = min,
		resObj.max = max,
		resObj.maxData = state.maxData(max)
	})
	.entries(data)

	resObj.sumStats = sumStats;
	
	return resObj
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
d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv').then(prepData).then(resObj => {

	console.log('resObj')
	console.log(resObj)
	
	const { maxData, min, max, q1, q3, median } = resObj
	
	// //build y-Scale
	state.yScale = d3.scaleLinear()
		.domain([state.minData, maxData])
		.range([hLM, state.m.t])

	//build x-scale
	state.xScale = d3.scaleBand()
		.domain(['setosa', 'versicolor', 'virginica'])
		.range([0, state.w])

	//build axis objs
	const yAxisObj = d3.axisLeft(state.yScale)
	const xAxisObj = d3.axisBottom(state.xScale)

	//append yAxis to gWrapper
	gWrapper.call(yAxisObj)
	gWrapper.append('g')
		.attrs({
			class: 'x-axis-g-wrapper',
			transform: `translate(0, ${hLM})`
		})
		.call(xAxisObj)

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

})
