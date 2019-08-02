const div = d3.select('.chartDiv')
let transDur = 4000;
const colorBtn = d3.select('#re-color')
const widthBtn = d3.select('#re-width')
let state = {
	color: 'steelblue',
	width: 200
}

//svg
let svg = div.append('svg').attrs({
	width:800,
	height: 500
})

//rect
let rect = svg.append('rect').attrs({
	height: 50,
	width: 200,
	fill: state.color,
	class: 'this-rect'
})

colorBtn.on('click', () => {
	d3.selectAll('button').attr('disabled', true)
	state.color = state.color === 'steelblue' ? 'yellow' : 'steelblue';
	console.log('clicked!');
	d3.select(".this-rect")
	.transition()
    .duration(transDur)
    .ease(d3.easeLinear)
    .style("fill", state.color);
    setTimeout(() => {
    	d3.selectAll('button').attr('disabled', null)
    }, transDur)
})

widthBtn.on('click', () => {
	d3.selectAll('button').attr('disabled', true)
	state.width = state.width === 200 ? 450 : 200;
	console.log('clicked!');
	d3.select(".this-rect")
	.transition()
    .duration(transDur)
    .ease(d3.easeLinear)
    .attr("width", state.width);
    setTimeout(() => {
    	d3.selectAll('button').attr('disabled', null)
    }, transDur)
})
