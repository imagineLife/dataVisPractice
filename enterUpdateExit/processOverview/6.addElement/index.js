const chartDiv = d3.select('.chart');
const h = 500, w = 700;

const colorScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range(['darkred','khaki']);

const radScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range([50,30])

//ask about function declaration
//vs function drawChart()
const drawChart = (parent, { fruits }) => {
	// const { fruits } = props;

	const dataJoin = parent.selectAll('circle')
		.data(fruits);

/*4. making UPDATES work
	static examples JUST use the ENTER selection, because static doesn't need update
	when the data CHANGES OVER TIME in the visualization,
		the UPDATE selection is needed
		the dataJoin IS THE UPDATE SELECTION

*/

	dataJoin
		.enter().append('circle')
		.attrs({
			'cx' : (d, i) => ((i * 120) + 60),
			'cy' : (h/2),
			'r' : d => radScale(d.type),
			'fill' : d => colorScale(d.type)
		});

	//5. update
	//repeats the code that ENTERS AND UPDATES
	dataJoin
		.attrs({
			'r' : d => radScale(d.type),
			'fill' : d => colorScale(d.type)
		});

	//'dataJoin' returns the same selection selection
	dataJoin.exit().remove();
		
}

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
	drawChart(svgObj, { fruits });

}, 1500);


//3. replace an apple with a lemon
//make the 3rd element a lemon
//also will update the style of this by updated fillSCale and radiusScale
setTimeout(() => {
	fruits[2].type = 'lemon';
	drawChart(svgObj, { fruits });

}, 3000);

/*





*/



