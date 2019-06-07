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

const w = width, h = 690;

const radiusVal = 8;

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
				xPosition: w * .5,
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
				xPosition: w * .5,
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

//enter circles
function enterCircle(enterSelection){
	let circleGroup = enterSelection.append('g')
		.attr('class', 'circleGroup')

	let circle = circleGroup.append('circle')
		.attrs({
			class: 'medal',
			r: radiusVal,
			fill: d => colorScale(d["Level"]),
		}).on('click', d =>{
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
			return -(w * (1/3))
		//Individual of a group
		}if(d["onePerson"] == true && d["Organization"] !== null){
			return 0
		//Group
		}else{
			return (w * (1/3))
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
	console.log('toggleLabels')
	console.log(strObj)
	
	
	let labelWrapper = d3.select('.labelWrapperG')
	labelWrapper.selectAll('.label').remove()
	
	/*
		build label Groups
	*/

	let groupLabelTextArr = (whichLabels.groups == true && whichLabels.medals == false) ? labelData.threeTop : 
	
		//single merged blob
		(whichLabels.groups == false && whichLabels.medals == false) ? labelData.singleTop : 
		//4 vertical blobs
		(whichLabels.groups == false && whichLabels.medals == true) ? labelData.fourVertical : null;

	let labelDataJoin = labelWrapper.selectAll('.label')
		.data(groupLabelTextArr)

	labelDataJoin.join(e => {
		let textLabelG = e.append('g').attrs({
			class: 'label labelTextG'
		})

		textLabelG.append('text')
		.attrs({
			x: (d,ind) => {				
				return d.xPosition
			},
			y: d => d.textY,
			'text-anchor': 'middle',
			class: 'label groupType'
		})
		.text(d => d.text)

		textLabelG.append('text')
		.attrs({
			x: (d,ind) => {
				return d.xPosition
			},
			y: d => d.valY,
			'text-anchor': 'middle',
			class: 'label medalCount'
		})
		.text(d => {
			console.log('d')
			console.log(d)
			console.log('whichLabels')
			console.log(whichLabels)
			
			let medalType = d.text.split(' ')[0]
			console.log('medalType')
			console.log(medalType)
			
			//Centered blob
			return (d.text == 'All Medals') ? medalCounts.Total : 

			//3 hz blobs
			(whichLabels.groups == true && whichLabels.medals == false) ? medalCounts[d.text]["Gold"] + medalCounts[d.text]["Silver"] + medalCounts[d.text]["Bronze"] + medalCounts[d.text]["Honorable"]
			
			//four vertical blobs
			: (whichLabels.groups == false && whichLabels.medals == true) ? medalCounts[medalType]
			: null;
		})
	})
}