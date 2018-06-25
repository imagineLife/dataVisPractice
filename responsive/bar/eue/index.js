const bothData = [
	{
		"viewer_gender": 'FEMALE',
		"viewer_age": 'AGE_13_17',
		"watchtime_minutes": 2.8
	},
	{
		"viewer_gender": 'MALE',
		"viewer_age": 'AGE_13_17',
		"watchtime_minutes": 13.5
	},
	{
		"viewer_gender": 'FEMALE',
		"viewer_age": 'AGE_18_24',
		"watchtime_minutes": 6.6
	},
	{
		"viewer_gender": 'MALE',
		"viewer_age": 'AGE_18_24',
		"watchtime_minutes": 35.8
	},	
	{
		"viewer_gender": 'FEMALE',
		"viewer_age": 'AGE_25_34',
		"watchtime_minutes": 3.9
	},
	{
		"viewer_gender": 'MALE',
		"viewer_age": 'AGE_25_34',
		"watchtime_minutes": 24.7
	},
	{
		"viewer_gender": 'FEMALE',
		"viewer_age": 'AGE_35_44',
		"watchtime_minutes": .8
	},
	{
		"viewer_gender": 'MALE',
		"viewer_age": 'AGE_35_44',
		"watchtime_minutes": 5
	},
	{
		"viewer_gender": 'FEMALE',
		"viewer_age": 'AGE_45_54',
		"watchtime_minutes": 1.3
	},
	{
		"viewer_gender": 'MALE',
		"viewer_age": 'AGE_45_54',
		"watchtime_minutes": 3.4
	}
];

let maleData = [];
let femaleData = [];

for(let i=0; i<bothData.length; i++){
	if(bothData[i]["viewer_gender"] === "MALE"){
		maleData.push(bothData[i])
	}else{
		femaleData.push(bothData[i])
	}
}

//toggle between data
function toggleData(dataVal){
	switch(dataVal){
		case('male'):
			updateData(maleData);
			break;
		case('female'):
			updateData(femaleData);
			break;
		default:
			updateData(bothData);
			break;
	}
}

function updateData(data){
	xScale.domain(data.map((d) => d.viewer_age));
	yScale.domain([ 0, d3.max(data, (d) => d.watchtime_minutes) ])

	let barWidth = width / data.length;

	//removes all bars
	let bars = chartSVG.selectAll(".barClass")
		.remove()
		.exit()
		.data(data);

	//add and configure bars
	bars.enter()
		.append('rect')
		.attrs({
			'class': 'barClass',
			'x': (d,i) => i * barWidth + 1,
			'y': (d) => yScale(d.watchtime_minutes),
			'height':(d) => height - yScale(d.watchtime_minutes),
			'width': barWidth - 1,
			'fill': (d) => {
				if(d.viewer_gender ==="FEMALE"){
					return 'rgb(251,180,174)'
				}else{
					return 'rgb(179,205,227)'
				}
			}
		})

	//Update yAxis
	chartSVG.select('.yAxisClass')
		.call(yAxisObj)

	//update xAxis
	chartSVG.select('.xAxisClass')
		.attr('transform', `translate(${margin.left}, ${margin.top}`)
		.call(xAxisObj)
		.selectAll('text')
			.style('text-anchor', 'end')
			.attrs({
				'dx': '-.8em',
				'dy':'.15em',
				'transform': 'rotate(-65)'
			})
}

//setup chart
const margin = {
	top: 20,
	right: 20,
	bottom: 95,
	left:50
},
width = 800,
height = 500;

const chartSVG = d3.select('.chartSVG')
const chartGWrapper = chartSVG.append('g').attr('class', 'gWrapper');

chartSVG.attrs({
	'width': width + margin.left + margin.right,
	'height': height + margin.top + margin.bottom
})

chartGWrapper.attr('transform', `translate(${margin.left}, ${margin.top})`);

let xScale = d3.scaleBand().range([0, width]);
let yScale = d3.scaleLinear().range([height, 0]);

let xAxisObj = d3.axisBottom(xScale);
let yAxisObj = d3.axisLeft(yScale);

//add axis to svg
let yAxisG = chartSVG.append('g')
	.attr('class', 'yAxisG')
	.call(yAxisObj)

let xAxisG = chartSVG.append('g')
	.attrs({
		'class': 'xAxisG',
		'transform': `translate(0, ${height})`
	})
	.call(xAxisObj)
	.selectAll('text')
		.style('text-anchor', 'end')
		.attrs({
			'dx': '-.8em',
			'dy':'.15em',
			'transform': 'rotate(-65)'		
		})

//add Chart labels
let yAxisLabel = chartSVG.append('text')
	.attr('transform', `translate(-35, ${height+margin.bottom/2}) rotate(-90)`)
	.text('% of totalWatchTime')

let xAxisLabel = chartSVG.append('text')
	.attr('transform', `translate(${width/2}, ${height + margin.bottom -5}) rotate(-90)`)
	.text('Age Group')

updateData(bothData);




