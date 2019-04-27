//enter circles
function enterCircle(enterSelection){
	let circleGroup = enterSelection.append('g')
		.attr('class', 'circleGroup')

	let circle = circleGroup.append('circle')
		.attrs({
			class: 'artistCircle',
			r: 10,
			fill: 'steelblue',
			cx: 100,
			cy: 100
		})
}

//fn for ticking simulation
//updates x && y position of each circle
function simTicked(){
	d3.selectAll('.artistCircle').attrs({
		cx: d => d.x,
		cy: d => d.y
	})
}

//	D3-Force!
let d3Sim =  d3.forceSimulation();

//svg
let svg = d3.select('#chart')
	.append('svg')
	.attrs({
		class: 'svgWrapper',
		height: 500,
		width: 500
	})

//g
let gWrapper = svg.append('g')
	.attr('transform', `translate(0,0)`)

//load data
d3.json('./data.json').then(data => {

	//make circle dataJoin
	let circleDataJoin = gWrapper.selectAll('.artistCircle')
		.data(data)

	//join the enter method
	circleDataJoin.join(enterCircle)

	//feed the simulation the data
	d3Sim.nodes(data)
		.on('tick', simTicked)
	/*
		simulation is like a clock, TICKING
		THIS assigns more attributes to the data objects...
		ie...
		{
			decade: "pre"
			id: "Steely Dan"
			index: 0
			name: "Steely Dan"
			sales: 40
			vx: 0
			vy: 0
			x: 0
			y: 0
		}
	*/


	

}).catch(e => {
	console.log('e')
	console.log(e)
	
})