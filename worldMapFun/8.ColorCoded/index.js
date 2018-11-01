const svgObj = d3.select('.svgWrapper');

//swap these in the .projection-passer in pathGenerator
//checkout d3-map-projection for EVEN MORE projections
const geoNatural = d3.geoNaturalEarth1();

//this one is the globe!
const geoOrth = d3.geoOrthographic();
const geoStereo = d3.geoStereographic();
const geoEquiRect = d3.geoEquirectangular();
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const pathGenerator = d3.geoPath().projection(geoNatural);

function showCountryName(d){ 
	console.log(d)
}

function buildChart(countries){

	//set colorScale domain
	colorScale.domain(countries.features.map(d => d.properties.economy))
	
	//data-join for countries to paths
	const countryPaths = gObj.selectAll('path')
		.data(countries.features);

	//append a path for each country
	countryPaths.enter().append('path')
	.attrs({
		'd': d => pathGenerator(d), //set d based on country
		'class':'countryPath',
		// 'fill': d => colorScale(d.properties.name) //Rainbow man
		'fill': d => colorScale(d.properties.economy)
	})
	//append the title for mouseover 'tooltip'
	.append('title')
	.text(d => d.properties.name);
}

let gObj = svgObj.append('g').attr('pointer-events', 'all')

//new path
gObj.append('path')
	.attr('d', pathGenerator({type: 'Sphere'}))
	.attr('class', 'globeSpherePath');

svgObj.call(d3.zoom().on('zoom', function(){
	gObj.attr("transform", d3.event.transform);
}));



loadAndProcessData().then(countries => {
	buildChart(countries)
})