const div = d3.select('.chartDiv')
let svg = div.append('svg').attrs({
	width:800,
	height: 500
})

let rect = svg.append('rect').attrs({
	height: 50,
	width: 200,
	fill: 'steelblue'
})