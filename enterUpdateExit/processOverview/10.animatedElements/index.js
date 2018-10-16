const chartDiv = d3.select('.chart');
const h = 500, w = 700;

//ask about function declaration
//vs function drawChart()

const svgObj = chartDiv.append('svg')
	.attrs({
		'class': 'svgWrapper',
		'height':h,
		'width':w
	});

//1. MakeFruit
const makeFruit = type => ({type, fruitID: Math.random()});
let fruits = d3.range(5).map(() => makeFruit('apple'))

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

//4. eat the 2nd apple
setTimeout(() => {
	fruits = fruits.filter((d, i) => i != 1)
	drawChart(svgObj, { fruits });

}, 4500);