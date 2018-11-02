function buildChart(){

	let mappedColors = stateCountryFeats.map(d => {
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
		textOffset: 15,
		selectedLegend,
		selectedLegendVal,
	});

	mapG.call(buildMap, {
		stateCountryFeats,
		colorScale,
		colorVal,
		selectedLegendVal	
	})
	

}


const svgObj = d3.select('.svgWrapper');

//swap these in the .projection-passer in pathGenerator
//checkout d3-map-projection for EVEN MORE projections

//MOVED to buildMap
// const geoNatural = d3.geoNaturalEarth1();
// const pathGenerator = d3.geoPath().projection(geoNatural);


//this one is the globe!
const geoOrth = d3.geoOrthographic();
const geoStereo = d3.geoStereographic();
const geoEquiRect = d3.geoEquirectangular();
const colorScale = d3.scaleOrdinal();

const colorVal = d => d.properties.economy;
let selectedLegendVal;
let stateCountryFeats;
const selectedLegend = (d) => {
	selectedLegendVal = d;
	buildChart()
}

let mapG = svgObj.append('g').attr('pointer-events', 'all')
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




//run the project
loadAndProcessData().then(countries => {
	stateCountryFeats = countries.features;
	buildChart()
})