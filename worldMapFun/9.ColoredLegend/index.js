function buildChart(countries){

	let mappedColors = countries.features.map(d => {
		return d.properties.economy
	})

	colorScale
		.domain(mappedColors)
		.domain(colorScale.domain().sort().reverse())
		.range(d3.schemeSpectral[7])

	colorLegendG.call(buildColorLegend, {
		colorScale,
		circleRadius: 10,
		spacing: 25,
		textOffset: 15
	});
	
	//data-join for countries to paths
	const countryPaths = gObj.selectAll('path')
		.data(countries.features);

	//append a path for each country
	countryPaths.enter().append('path')
	.attrs({
		'd': d => pathGenerator(d), //set d based on country
		'class':'countryPath',
		// 'fill': d => colorScale(d.properties.name) //Rainbow
		'fill': d => colorScale(colorVal(d))
	})
	//append the title for mouseover 'tooltip'
	.append('title')
	.text(d => `${d.properties.name}: ${d.properties.economy}`);


}


const svgObj = d3.select('.svgWrapper');

//swap these in the .projection-passer in pathGenerator
//checkout d3-map-projection for EVEN MORE projections
const geoNatural = d3.geoNaturalEarth1();

//this one is the globe!
const geoOrth = d3.geoOrthographic();
const geoStereo = d3.geoStereographic();
const geoEquiRect = d3.geoEquirectangular();
const colorScale = d3.scaleOrdinal();
const pathGenerator = d3.geoPath().projection(geoNatural);

const colorVal = d => colorScale(d.properties.economy);

let gObj = svgObj.append('g').attr('pointer-events', 'all')


let colorLegendBox = svgObj.append('rect')
	.attrs({
		'class': 'legendBox',
		'x': 5,
		'y': 300,
		'width': 264,
		'height': '195',
		'fill' : 'rgba(255,255,255,.8)',
		'rx': 25,
		'ry': 25
	})

//color legend g wrapper
let colorLegendG = svgObj.append('g').attrs({
	'class': 'colorLegendG',
	'transform': 'translate(25,325)'
	});


//new path
gObj.append('path')
	.attr('d', pathGenerator({type: 'Sphere'}))
	.attr('class', 'globeSpherePath');

svgObj.call(d3.zoom().on('zoom', function(){
	gObj.attr("transform", d3.event.transform);
}));



//run the project
loadAndProcessData().then(countries => {
	buildChart(countries)
})