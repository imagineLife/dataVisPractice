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
}

let srcData = null, 
	medalCounts = {
		"Individuals": {},
		"Individuals In Groups": {},
		"Groups": {}
	};

const chartDiv = d3.select("#chart");

const { width, widthLessMargins } = getWidthAndHeight("chart", margin)

const w = width, h = 760;

const radiusVal = 9;

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
	
	let labelWrapper = d3.select('.labelWrapperG')
	labelWrapper.selectAll('.label').remove()
	
	/*
		build top-axis-label(s)
	*/
	let threeGroupsArr = ['Individuals', 'Individuals In Groups', 'Groups']
	let groupLabelTextArr = (whichLabels.groups == true) ? threeGroupsArr : ['All Medals'];
	let labelDataJoin = labelWrapper.selectAll('.label')
		.data(groupLabelTextArr)

	let labelData = {
		threeTopRow: [
			{
				text: "Individuals",
				xPosition: w * (1/9)
			},
			{
				text: "Individuals In Groups",
				xPosition: w * .5
			},
			{
				text: "Groups",
				xPosition: w * (5.25/6)
			},
		]
	}

	//get x-positions of 3-group-labels
	let threeGroupsXPositions = (groupLabelTextArr.length > 1) ? [(w * (1/9)), (w * .5), (w * (5.25/6))] : [w/2]

	labelDataJoin.join(e => {
		let textLabelG = e.append('g').attrs({
			class: 'label labelTextG'
		})

		textLabelG.append('text')
		.attrs({
			x: (d,ind) => {
				return labelData.threeTopRow[ind].xPosition
			},
			y: 25,
			'text-anchor': 'middle',
			class: 'label groupType'
		})
		.text(d => d)

		textLabelG.append('text')
		.attrs({
			x: (d,ind) => {
				return labelData.threeTopRow[ind].xPosition
			},
			y: 45,
			'text-anchor': 'middle',
			class: 'label medalCount'
		})
		.text(d => {
			
			let number = (d == 'All Medals') ? medalCounts["Total"] : medalCounts[d]["Gold"] + medalCounts[d]["Silver"] + medalCounts[d]["Bronze"] + medalCounts[d]["Honorable"];
			
			return number
		})
	})
}