const margin = {
	top: 20,
	right: 50,
	bottom: 20,
	left: 50
};

let buttonTexts = {
	group: `Merge Group Levels`,
	medal: 'Split By Medal Type',
}

let whichLabels = {
	groups: true,
	medals: false
},
srcData = null;


const chartDiv = d3.select("#chart");

const { width, widthLessMargins } = getWidthAndHeight("chart", margin)

const w = width; 
let h = (w < 350) ? 460 : 
		(w > 351 && w < 375) ? 640 : 690;

let positions = {
	center : w * .5,
	leftThird: w * (1/3),
	rightThird: w * (2/3)
}

let radiusVal = (w < 700) ? 4 : 
		(w > 701 && w < 1050) ? 7 : 8;

	medalCounts = {
		"Individuals": {},
		"Individuals In Groups": {},
		"Groups": {}
	},
	labelData = {
		threeTop: [
			{
				text: "Individuals",
				xPosition: w * (1/9),
				textY : 25,
				valY : 45
			},
			{
				text: "Individuals In Groups",
				xPosition: positions.center,
				textY : 25,
				valY : 45
			},
			{
				text: "Groups",
				xPosition: w * (5.25/6),
				textY : 25,
				valY : 45
			},
		],
		singleTop: [
			{
				text: "All Medals",
				xPosition: positions.center,
				textY : 25,
				valY : 45
			}
		],
		fourVertical: [
			{
				text: "Gold Medalists",
				xPosition: w * (6.5/9),
				textY : h * .15,
				valY : h * .15 + 20
			},
			{
				text: "Silver Medalists",
				xPosition: w * (6.5/9),
				textY : h * .4,
				valY :  h * .4 + 20
			},
			{
				text: "Bronze Medalists",
				xPosition: w * (6.5/9),
				textY : h * .63,
				valY : h * .63 + 20
			},
			{
				text: "Honorable Mention",
				xPosition: w * (6.5/9),
				textY : h * .82,
				valY : h * .82 + 20
			},
		],
		fullScreen: [
			{
				text: "Gold",
				group: "Individuals",
				xPosition: w * (2.25/9),
				textY : h * .15,
				valY : h * .15 + 20
			},
			{
				text: "Silver",
				group: "Individuals",
				xPosition: w * (2.25/9),
				textY : h * .4,
				valY :  h * .4 + 20
			},
			{
				text: "Bronze",
				group: "Individuals",
				xPosition: w * (2.25/9),
				textY : h * .63,
				valY : h * .63 + 20
			},
			{
				text: "Honorable",
				group: "Individuals",
				xPosition: w * (2.25/9),
				textY : h * .82,
				valY : h * .82 + 20
			},
			{
				text: "Gold",
				group: "Individuals In Groups",
				xPosition: w * (5.25/9),
				textY : h * .15,
				valY : h * .15 + 20
			},
			{
				text: "Silver",
				group: "Individuals In Groups",
				xPosition: w * (5.25/9),
				textY : h * .4,
				valY :  h * .4 + 20
			},
			{
				text: "Bronze",
				group: "Individuals In Groups",
				xPosition: w * (5.25/9),
				textY : h * .63,
				valY : h * .63 + 20
			},
			{
				text: "Honorable",
				group: "Individuals In Groups",
				xPosition: w * (5.25/9),
				textY : h * .82,
				valY : h * .82 + 20
			},
			{
				text: "Gold",
				group: "Groups",
				xPosition: w * (8.25/9),
				textY : h * .15,
				valY : h * .15 + 20
			},
			{
				text: "Silver",
				group: "Groups",
				xPosition: w * (8.25/9),
				textY : h * .4,
				valY :  h * .4 + 20
			},
			{
				text: "Bronze",
				group: "Groups",
				xPosition: w * (8.25/9),
				textY : h * .63,
				valY : h * .63 + 20
			},
			{
				text: "Honorable",
				group: "Groups",
				xPosition: w * (8.25/9),
				textY : h * .82,
				valY : h * .82 + 20
			},
		]
	};

const colorScale = d3.scaleOrdinal()
		.domain(['gold','silver','bronze', 'honorable mention'])
		.range(['rgb(201,176,55)','rgb(215,215,215)','rgb(106,56,5)', 'lightblue'])

function appendToParent(parent, type, className, transformation){
	return parent.append(type)
        .attrs({
            "class": className,
            "transform": transformation
        });
}

function circleObjFn(rVal, cScale, d, legendTF){
	return {
		class: 'medal',
		r: rVal,
		fill: d => {
			if(legendTF == true){
				return cScale(d)
			}else{
				return cScale(d["Level"])	
			}
			
		},
	}
}

//enter legend
function enterLegend(e){
	let legendItem = e.append('g')
		.attr('class', 'legendItem')

	let itemXSpacing = (i, rVal) => i * (rVal * 10);

	let circle = legendItem.append('circle')
		.attrs((d) => circleObjFn(radiusVal, colorScale, d, true))
		.attr('transform', (d, ind) => {
			return `translate(${itemXSpacing(ind, radiusVal)}, 0)`
		})

	let text = legendItem.append('text').attrs({
		transform: (d, ind) => `translate(${itemXSpacing(ind, radiusVal)}, ${radiusVal * 3})`,
		'text-achor': 'middle'
	}).text(d => d)


}

//enter circles
function enterCircle(enterSelection){
	let circleGroup = enterSelection.append('g')
		.attr('class', 'circleGroup')

	let circle = circleGroup.append('circle')
		.attrs((d) => circleObjFn(radiusVal, colorScale, d)).on('click', d =>{
			console.log('d')
			console.log(d)
		})
}

//fn for ticking simulation
//updates x && y position of each circle
function simTicked(){
	let theCircles = d3.selectAll('.medal')
	
	//update x && y of each circle
	theCircles.attrs({
		cx: d => d.x,
		cy: d => d.y
	})
}

function splitGroupForce(d, w, btnTxt){
	
	if(btnTxt.includes('Split')){
		//Individual
		if(d["onePerson"] == true && d["IndividualInATeam"] == null){
			return -(positions.leftThird)
		//Individual of a group
		}if(d["onePerson"] == true && d["Organization"] !== null){
			return 0
		//Group
		}else{
			return (positions.leftThird)
		}
	}else{
		return 0
	}
}

function splitMedalForce(d, h, btnTxt){
	
	if(btnTxt.includes('Split')){
		//Individual
		if(d["Level"] == "Gold"){
			return -(h * (35/100))
		}
		//Individual of a group
		if(d["Level"] == "Silver"){
			return -(h * (10/100))
		//bronze
		}if(d["Level"] == "Bronze"){
			return (h * (15/100))
		}else{
			return (h * (35/100))
		}
	}

	if(btnTxt.includes('Merge')){
		return 0
	}
}

function getWidthAndHeight(divID, margin){
	 let thisDiv = document.getElementById(divID)
	let width = thisDiv.clientWidth;
	let widthLessMargins = width - margin.left - margin.right;
	return { width, widthLessMargins }
}

function toggleLabels(strObj){
	
	let labelWrapper = d3.select('.labelWrapperG')
	labelWrapper.selectAll('.label').remove()
	
	/*
		build label Groups
	*/

	if(!(whichLabels.groups == true && whichLabels.medals == true)){
		let groupLabelTextArr = (whichLabels.groups == true && whichLabels.medals == false) ? labelData.threeTop : 
	
		//single merged blob
		(whichLabels.groups == false && whichLabels.medals == false) ? labelData.singleTop : 
		//4 vertical blobs
		(whichLabels.groups == false && whichLabels.medals == true) ? labelData.fourVertical : 
		//all blobls
		(whichLabels.groups == true && whichLabels.medals == true) ? labelData.fullScreen : null;

		let labelDataJoin = labelWrapper.selectAll('.label')
			.data(groupLabelTextArr)

		labelDataJoin.join(e => {

			/*
				when NOT all-12-blobs
					show Text && Counts @ each label
				when all-12-blobs
					show Text @ top && labels next to each blob
				
			*/
			
			//Quality Label
			e.append('text')
			.attrs({
				x: (d,ind) => {				
					return d.xPosition
				},
				y: d => d.textY,
				'text-anchor': 'middle',
				class: 'label groupType'
			})
			.text(d => d.text)

			//quantity label
			e.append('text')
			.attrs({
				x: (d,ind) => {
					return d.xPosition
				},
				y: d => d.valY,
				'text-anchor': 'middle',
				class: 'label medalCount'
			})
			.text(d => {
				
				let medalType = d.text.split(' ')[0]
				
				//Centered blob
				return (d.text == 'All Medals') ? medalCounts.Total : 

				//3 hz blobs
				(whichLabels.groups == true && whichLabels.medals == false) ? medalCounts[d.text]["Gold"] + medalCounts[d.text]["Silver"] + medalCounts[d.text]["Bronze"] + medalCounts[d.text]["Honorable"]
				
				//four vertical blobs
				: (whichLabels.groups == false && whichLabels.medals == true) ? medalCounts[medalType]

				//all blobls
				: (whichLabels.groups == true && whichLabels.medals == true) ? medalCounts[d.group][d.text]
				: null;
			})
		})
	}

	if((whichLabels.groups == true && whichLabels.medals == true)){
		
		//top row labels
		let topRowLabels = labelWrapper.selectAll('.topRow')
			.data(labelData.threeTop)

		topRowLabels.join(e => {
			e.append('text')
			.attrs({
				x: (d,ind) => d.xPosition,
				y: d => d.textY,
				'text-anchor': 'middle',
				class: 'label groupType topRow'
			})
			.text(d => d.text)
		})

		//bubble labels
		let bubbleLabels = labelWrapper.selectAll('.bubbleLabels')
			.data(labelData.fullScreen)

		bubbleLabels.join(e => {
			e.append('text')
			.attrs({
				x: (d,ind) => {
					return d.xPosition
				},
				y: d => d.valY,
				'text-anchor': 'middle',
				class: 'label medalCount'
			})
			.text(d => {
				
				let medalType = d.text.split(' ')[0]
				
				//Centered blob
				return (d.text == 'All Medals') ? medalCounts.Total : 

				//3 hz blobs
				(whichLabels.groups == true && whichLabels.medals == false) ? medalCounts[d.text]["Gold"] + medalCounts[d.text]["Silver"] + medalCounts[d.text]["Bronze"] + medalCounts[d.text]["Honorable"]
				
				//four vertical blobs
				: (whichLabels.groups == false && whichLabels.medals == true) ? medalCounts[medalType]

				//all blobls
				: (whichLabels.groups == true && whichLabels.medals == true) ? medalCounts[d.group][d.text]
				: null;
			})
		})
	}
}