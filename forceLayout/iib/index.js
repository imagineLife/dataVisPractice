prepData('iibData.json').then(data => {
	
	//tally up the medal counts per group-level
	data.forEach(medal => {

		medalCounts["Total"] = medalCounts["Total"] + 1 || 1
		medalCounts[medal.Level] = medalCounts[medal.Level] + 1 || 1

		//individual
		if(medal["onePerson"] == true && medal["IndividualInATeam"] == null){
			medalCounts["Individuals"][medal["Level"]] = ++medalCounts["Individuals"][medal["Level"]] || 1

		//Individual of a group
		}else if(medal["onePerson"] == true && medal["IndividualInATeam"] == true){
			medalCounts["Individuals In Groups"][medal["Level"]] = ++medalCounts["Individuals In Groups"][medal["Level"]] || 1

		//group, no individual
		}else{
			medalCounts["Groups"][medal["Level"]] = ++medalCounts["Groups"][medal["Level"]] || 1

		}
	})

	let d3Sim =  d3.forceSimulation()
	//move to the right
	.force('x', d3.forceX(d => {
		//Individual
		if(d["onePerson"] == true && d["IndividualInATeam"] == null){
			return -(w/2.75)
		//Individual of a group
		}else if(d["onePerson"] == true && d["IndividualInATeam"] == true){
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
	*/

	let svgWrapper = appendToParent(chartDiv, 'svg', 'svgWrapper', null).attrs({
		height: h,
		width: w
	})

	let legendYTrans = (w > 375) ?  h - 125 : h - 75;
	let gWrapper = appendToParent(svgWrapper, 'g', 'gWrapper', `translate(${w/2},${h/2})`)
	let labelGWrapper = svgWrapper.append('g').attr('class', 'labelWrapperG')
	let legendWrapper = appendToParent(svgWrapper, 'g', 'legendWrapper', `translate(20,${legendYTrans})`)

	//prepare legend
	let legendDataJoin = legendWrapper.selectAll('.legendElementGWrapper')
		.data(['gold','silver','bronze', 'honorable mention'])

	legendDataJoin.join(enterLegend)
	
	//make circle dataJoin
	let circleDataJoin = gWrapper.selectAll('.artistCircle')
		.data(data)

	//join the enter method
	circleDataJoin.join(enterCircle)

	//set nodes to sim
	d3Sim.nodes(data)
		.on('tick', simTicked)

	//split-by-award-type button
	d3.select('#award-type').on('click', () => {
		
		d3Sim.force('y', d3.forceY(d => splitMedalForce(d, h, buttonTexts.medal)).strength(.1))
		.alpha(1)
		.alphaDecay(.04)
		.restart()

		buttonTexts.medal = (d3.select("#award-type").text().includes('Split')) ? 'Merge Medal Types' : 'Split Medal Types';
		d3.select("#award-type").text(buttonTexts.medal)
		whichLabels.medals = (buttonTexts.medal.includes('Split')) ? false : true;
		
		toggleLabels(whichLabels)
	})

	//split-by-award-type button
	d3.select('#group-level').on('click', () => {
		
		d3Sim.force('x', d3.forceX(d => splitGroupForce(d, w, buttonTexts.group)).strength(.1))
		.alpha(1)
		//decay can be updated here...
		.alphaDecay(.04)
		.restart()

		buttonTexts.group = (d3.select("#group-level").text().includes('Split')) ? `Merge Group Levels` : 'Split Group Levels';
		d3.select("#group-level").text(buttonTexts.group)

		whichLabels.groups = (buttonTexts.group.includes('Split')) ? false : true;
		
		toggleLabels(whichLabels)
	})

	toggleLabels(whichLabels)

})