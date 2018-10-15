//ask about function declaration
//vs function drawChart()
const drawChart = (parent, props) => {
	const { fruits } = props;
	let dataJoin = parent.selectAll('circle').data(fruits)
	dataJoin.enter().append('circle')
	.attrs({
		'cx' : (d, i) => (i * 120) + 60,
		'cy' : '50',
		'r' : '50',
		'fill' : 'darkred'
	})

	//returns a selection
	parent.selectAll('circle')
		.data(fruits)
		// .exit().attr('fill','black') //v1, to 'see'the exit
		.exit().remove()
}


const h = 500, w = 700;

const chartDiv = d3.select('.chart');
const svgObj = chartDiv.append('svg')
	.attrs({
		'class': 'svgWrapper',
		'height':h,
		'width':w
	});

//1. MakeFruit
const makeFruit = type => ({type});
const fruits = d3.range(5).map(() => makeFruit('apple'))

drawChart(svgObj, { fruits })

//2. eat an apple
setTimeout(() => {
	fruits.pop();
	drawChart(svgObj, { fruits })

}, 1500)

/*





*/



