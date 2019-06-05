prepData('iibData.json').then(data => {

	let 
	w=1000, 
	h=750

	let d3Sim =  d3.forceSimulation()
	//move to the right
	.force('x', d3.forceX(0)
		
	// 	if(d.decade == 'pre'){
	// 		return -(w/3.5)
	// 	}else{
	// 		return (w/3.5)
	// 	}
	// })
		.strength(0.02))
	//move down
	.force('y', d3.forceY()
		.strength(0.02))
	//STOP from colliding
	//includes the radius @ which bubbles should not collide
	.force('collide', d3.forceCollide(d => radiusVal + (.05 * radiusVal) ));


	/*
		Prepare UI elements
		including definitions (defs)
	*/

	let chartDiv = d3.select("#chart");
	let svgWrapper = appendToParent(chartDiv, 'svg', 'svgWrapper', null).attrs({
		height: h,
		width: w
	})
	let gWrapper = appendToParent(svgWrapper, 'g', 'gWrapper', `translate(${w/2},${h/2})`)
	let defs = svgWrapper.append('defs')

	//make circle dataJoin
	let circleDataJoin = gWrapper.selectAll('.artistCircle')
		.data(data)

	//join the enter method
	circleDataJoin.join(enterCircle)

	//make pattern dataJoin
	// let defsDataJoin = defs.selectAll('.artist-pattern')
	// 	.data(data)
	// defsDataJoin.join(enterPattern)


	//feed the simulation the data
	/*
		simulation is like a clock, TICKING
		.nodes() assigns more attributes to the data objects...
		ie...
		{
			id:
			index: 
			vx: 
			vy: 
			x: 
			y: 
		}

		NOTE: this ONLY works AFTER the data-join
	*/
	d3Sim.nodes(data)
		.on('tick', simTicked)
	
	//merge button
	d3.select('#merge').on('click', () => {
		console.log('MERGING!');

		//reset forceX to middle-screen
		d3Sim.force('x', d3.forceX(0).strength(0.1))
		.alphaTarget(0.5)
		.restart()

	})

	//split button
	d3.select('#split').on('click', () => {
		console.log('SPLITTING!');
		d3Sim.force('x', d3.forceX(splitForce).strength(0.1))
		.alphaTarget(0.5)
		.restart()
	})

})