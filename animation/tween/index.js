const div = d3.select('.chartDiv')
let transDur = 4000;
const btn = d3.select('#trans-btn')
let curColor = 'steelblue'
//svg
let svg = div.append('svg').attrs({
	width:800,
	height: 500
})

//rect
let rect = svg.append('rect').attrs({
	height: 50,
	width: 200,
	fill: curColor,
	class: 'this-rect'
})

btn.on('click', () => {
	let newCurColor = curColor === 'steelblue' ? 'yellow' : 'steelblue';
	curColor = newCurColor;
	console.log('clicked!');
	return d3.selectAll(".this-rect")
	.transition()
    .duration(transDur)
    .ease(d3.easeLinear)
    .style("fill", newCurColor);
})
