prepData('iibData.json').then(data => {

	let d3Sim =  d3.forceSimulation()
	//move to the right
	.force('x', d3.forceX(d => {
		//Individual
		if(d["onePerson"] == true && d["IndividualInATeam"] == null){
			return -(w/2.75)
		//Individual of a group
		}if(d["onePerson"] == true && d["IndividualInATeam"] == true){
			return 0
		//Group
		}else{
			return w/2.75
		}
	})
	.strength(0.1))
	//move down
	.force('y', d3.forceY().strength(0.1))
	//STOP from colliding
	//includes the radius @ which bubbles should not collide
	.force('collide', d3.forceCollide(d => radiusVal + (.05 * radiusVal) ))
	
	/*
		The alpha decay rate determines how quickly the current alpha
		 interpolates towards the desired target alpha;
		since the default target alpha is zero, by default
		 this controls how quickly the simulation cools. 
		Higher decay rates cause the simulation to stabilize more quickly, 
		 but risk getting stuck in a local minimum; 
		lower values cause the simulation to take longer to run, 
		 but typically converge on a better layout
	*/
	.alphaDecay(.04);

	/*
		Prepare UI elements
		including definitions (defs)
	*/

	let chartDiv = d3.select("#chart");

	let { width, height, widthLessMargins, heightLessMargins } = getWidthAndHeight("chart", margin)
	
	const w = width, h = 800;


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

		NOTE: this ONLY works AFTER the data-join is instantiated
	*/
	d3Sim.nodes(data)
		.on('tick', simTicked)

	//split-by-award-type button
	d3.select('#award-type').on('click', () => {
		
		d3Sim.force('y', d3.forceY(d => splitMedalForce(d, h, buttonTexts.medal)).strength(.1))
		.alpha(1)
		//decay can be updated here...
		.alphaDecay(.05)
		.restart()

		buttonTexts.medal = (d3.select("#award-type").text().includes('Split')) ? 'Merge Medal Types' : 'Split Medal Types';
		d3.select("#award-type").text(buttonTexts.medal)
	})

	//split-by-award-type button
	d3.select('#group-level').on('click', () => {
		
		d3Sim.force('x', d3.forceX(d => splitGroupForce(d, w, buttonTexts.group)).strength(.1))
		.alpha(1)
		//decay can be updated here...
		.alphaDecay(.05)
		.restart()

		buttonTexts.group = (d3.select("#group-level").text().includes('Split')) ? `Merge Group Levels` : 'Split Group Levels';
		d3.select("#group-level").text(buttonTexts.group)
	})

})