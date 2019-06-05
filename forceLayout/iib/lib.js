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
	console.log('tick');
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
			return (h * (40/100))
		}
	}

	if(btnTxt.includes('Merge')){
		return 0
	}
}

function getWidthAndHeight(divID, margin){
	 let thisDiv = document.getElementById(divID)
	let height = thisDiv.clientHeight
	let width = thisDiv.clientWidth;
	let widthLessMargins = width - margin.left - margin.right;
	let heightLessMargins = height - margin.top - margin.bottom;
	return { width, height, widthLessMargins, heightLessMargins }
}

const colorScale = d3.scaleOrdinal()
		.domain(['gold','silver','bronze', 'honorable mention'])
		.range(['rgb(201,176,55)','rgb(215,215,215)','rgb(106,56,5)', 'lightblue'])

const radiusVal = 10