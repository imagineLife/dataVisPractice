function buildChart(){
	mapG.call(buildMap, {
		stateCountryFeats,
		countryFeatsWPop
	})
}

const svgObj = d3.select('.svgWrapper');
//this one is the globe!
const geoOrth = d3.geoOrthographic();
const geoStereo = d3.geoStereographic();
const geoEquiRect = d3.geoEquirectangular();

let selectedLegendVal;
let stateCountryFeats;
let countryFeatsWPop;
// const selectedLegend = (d) => {
// 	selectedLegendVal = d;
// 	buildChart()
// }

let mapG = svgObj.append('g').attr('pointer-events', 'all')

//run the project
loadAndProcessData().then(countries => {
	stateCountryFeats = countries.features;
	countryFeatsWPop = countries.countryFeatsWPop;
	buildChart()
})