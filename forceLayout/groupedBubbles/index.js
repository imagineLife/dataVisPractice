let w=500, h=500;

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
	let theCircles = d3.selectAll('.artistCircle')
	
	//update x && y of each circle
	theCircles.attrs({
		cx: d => d.x,
		cy: d => d.y
	})
}

/*
		D3-Force
	the d3Sim is collection of FORCES about
	- WHERE the elements go
	- HOW the elements interact
	
*/

let d3Sim =  d3.forceSimulation()
	//move to the right
	.force('x', d3.forceX(w/2)
		.strength(0.05))
	//move down
	.force('y', d3.forceY(h/2)
		.strength(0.05))
	//STOP from colliding
	//gets the radius where they should not collide
	.force('collide', d3.forceCollide(10))

;

//svg
let svg = d3.select('#chart')
	.append('svg')
	.attrs({
		class: 'svgWrapper',
		height: h,
		width: w
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