const state = {
	m: {
		t: 10,
		r: 30,
		b: 30,
		l: 40
	},
	w: 450,
	h: 450
}

//dimensions-les--margins
// https://bl.ocks.org/mbostock/3019563
const wLM = state.w - state.m.l - state.m.r;
const hLM = state.w - state.m.t - state.m.b;

const svg = d3.select('#chartDiv').append('svg')
	.attrs({
		class: 'svg-wrapper',
		width: wLM,
		height: hLM
	})

const gWrapper = svg.append('g').attrs({
	class: 'g-wrapper',
	transform: `translate(${state.m.l}, ${state.m.t})`
})