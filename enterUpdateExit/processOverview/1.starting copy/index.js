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

// console.log('fruits')
// console.log(fruits)

svgObj.selectAll('circle').data(fruits)
	.enter().append('circle')
	.attrs({
		'cx' : (d, i) => (i * 120) + 60,
		'cy' : '50',
		'r' : '50',
		'fill' : 'darkred'
	})

/*
1.selectAll + .data creates data-join
	- connecting data (fruit) to dom element (svgObj)
	- No circles @ time of .data 

ENTER method
	- more burdensome,  but gives 
	great flexibility for transitions later on
*/



