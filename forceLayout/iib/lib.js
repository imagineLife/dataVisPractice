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
			class: 'artistCircle',
			r: radiusVal,
			fill: d => colorScale(d["Level"]),
			cx: 100,
			cy: 100
		}).on('click', d =>{
			console.log('d')
			console.log(d)
			
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

function splitForce(d){
	if(d.decade == 'pre'){
		return -(w/3.5)
	}else{
		return (w/3.5)
	}
}

const colorScale = d3.scaleOrdinal()
		.domain(['gold','silver','bronze'])
		.range(['rgb(201,176,55)','rgb(215,215,215)','rgb(106,56,5)'])

const radiusVal = 11