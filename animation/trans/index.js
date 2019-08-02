const div = d3.select('.chartDiv')

let transDur = 2000;

// buttons
const colorBtn = d3.select('#re-color')
const widthBtn = d3.select('#re-width')
const borderBtn = d3.select('#re-border')
const radBtn = d3.select('#re-rad')

let state = {
	color: 'steelblue',
	width: 200,
	rad: 30,
	rectHeight: 50,
	border: 'limegreen',
	borderWidth: '5',
	buffer: 10
}

//svg
let svg = div.append('svg').attrs({
	width:800,
	height: 500
})

//rect
let rect = svg.append('rect').attrs({
	height: state.rectHeight,
	width: 200,
	fill: state.color,
	class: 'this-rect'
})

//circle
let circle = svg.append('circle').attrs({
	cx : state.rad + state.rectHeight + state.buffer,
	cy: state.rad + state.rectHeight + state.buffer,
	r: state.rad,
	stroke: state.border,
	'stroke-width': state.borderWidth,
	fill: 'darkgreen',
	class: 'this-circle'
})

colorBtn.on('click', () => {
	d3.selectAll('button').attr('disabled', true)
	state.color = state.color === 'steelblue' ? 'yellow' : 'steelblue';
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
	d3.select(".this-rect")
	.transition()
    .duration(transDur)
    .ease(d3.easeLinear)
    .attr("width", state.width);
    setTimeout(() => {
    	d3.selectAll('button').attr('disabled', null)
    }, transDur)
})

radBtn.on('click', () => {
	d3.selectAll('button').attr('disabled', true)
	state.rad = state.rad === 30 ? 60 : 30;
	d3.select(".this-circle")
	.transition()
    .duration(transDur)
    .ease(d3.easeLinear)
    .attrs({
    	"r": state.rad,
    	cx: state.rad + state.rectHeight + state.buffer,
    	cy: state.rad + state.rectHeight + state.buffer 
    });
    setTimeout(() => {
    	d3.selectAll('button').attr('disabled', null)
    }, transDur)
})

borderBtn.on('click', () => {
	d3.selectAll('button').attr('disabled', true)
	state.borderWidth = state.borderWidth === '5' ? '29' : '5';
	d3.select(".this-circle")
	.transition()
    .duration(transDur)
    .ease(d3.easeLinear)
    .attr('stroke-width', state.borderWidth);
    setTimeout(() => {
    	d3.selectAll('button').attr('disabled', null)
    }, transDur)
})
