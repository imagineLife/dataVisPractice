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

const prepData = (srcData) => {

	const stats = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Species;})
    .rollup(function(d) {
      q1 = d3.quantile(d.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending),.25)
      median = d3.quantile(d.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending),.5)
      q3 = d3.quantile(d.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending),.75)
      interQuantileRange = q3 - q1
      min = q1 - 1.5 * interQuantileRange
      max = q3 + 1.5 * interQuantileRange
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(srcData)

    return stats
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

const enterVLines = e => {
	e.append('line')
		.attrs({
			x1: d => state.xScale(d.key) + (state.xScale.bandwidth() / 2),
			x2: d => state.xScale(d.key) + (state.xScale.bandwidth() / 2),
			y1: d => state.yScale(d.value.min),
			y2: d => state.yScale(d.value.max),
			stroke: `black`
		})
		.style('width', 40)
}

//load the data
d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv').then(prepData).then(resObj => {

	console.log('resObj')
	console.log(resObj)
	
	// //build y-Scale
	state.yScale = d3.scaleLinear()
		.domain([state.minData, 9])
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
	state.boxCenter = 200, state.boxW = 100;
	
	// //append central vertical box-plot line
	let verticalLineDataJoin = gWrapper.selectAll('.vertical-lines')
	.data(resObj)

	verticalLineDataJoin.join(enterVLines);

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
