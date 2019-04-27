let 
	w=500, 
	h=500,
	radScale = d3.scaleSqrt()
		.range([10,90]);

//enter circles
function enterCircle(enterSelection){
	let circleGroup = enterSelection.append('g')
		.attr('class', 'circleGroup')

	let circle = circleGroup.append('circle')
		.attrs({
			class: 'artistCircle',
			r: d => radScale(d.sales),
			fill: d => `url(#${d.name.toLowerCase().replace(/ /g, "-")})`,
			cx: 100,
			cy: 100
		}).on('click', d =>{
			console.log('d')
			console.log(d)
			
		})
}

function enterPattern(enterSelection){
	enterSelection.append('pattern')
		.attrs({
			id: d => d.name.toLowerCase().replace(/ /g, "-"),
			height: d => "100%",
			width: d => "100%",
			patternContentUnits: 'objectBoundingBox',
			class: 'artist-pattern'
		})
	.append('image')
		.attrs({
			height: 1,
			width: 1,
			preserveAspectRatio: 'none',
			"xmlns:xlink": 'http://www.w3.org/1999/xlink',
			"xlink:href": d => d.imgSrc,
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

	NOTE: for an animated intro, set forceX && forceY to w/2 && h/2
		AND remove translation of g Wrapper
	
*/

let d3Sim =  d3.forceSimulation()
	//move to the right
	.force('x', d3.forceX()
		.strength(0.05))
	//move down
	.force('y', d3.forceY()
		.strength(0.05))
	//STOP from colliding
	//gets the radius where they should not collide
	.force('collide', d3.forceCollide(d => radScale(d.sales) + (.1 * radScale(d.sales)) ));

//svg
let svg = d3.select('#chart')
	.append('svg')
	.attrs({
		class: 'svgWrapper',
		height: h,
		width: w
	})

//definitions	
let defs = svg.append('defs')

//g
let gWrapper = svg.append('g')
	.attr('transform', `translate(${w/2},${h/2})`)

//load data
d3.json('./data.json').then(data => {

	//update radScale domain
	radScale.domain(d3.extent(data, d => d.sales))

	//make circle dataJoin
	let circleDataJoin = gWrapper.selectAll('.artistCircle')
		.data(data)

	//join the enter method
	circleDataJoin.join(enterCircle)

	//make pattern dataJoin
	let defsDataJoin = defs.selectAll('.artist-pattern')
		.data(data)
	defsDataJoin.join(enterPattern)


	//feed the simulation the data
	/*
		simulation is like a clock, TICKING
		.nodes() assigns more attributes to the data objects...
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

		NOTE: this ONLY works AFTER the data-join
	*/
	d3Sim.nodes(data)
		.on('tick', simTicked)
	

}).catch(e => {
	console.log('e')
	console.log(e)
	
})