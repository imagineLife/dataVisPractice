function buildChart(){

	mapG.call(buildMap, {
		stateCountryFeats,
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

let selectedLegendVal;
let stateCountryFeats;
const selectedLegend = (d) => {
	selectedLegendVal = d;
	buildChart()
}

let mapG = svgObj.append('g').attr('pointer-events', 'all')

//run the project
loadAndProcessData().then(countries => {
	stateCountryFeats = countries.features;
	buildChart()
})