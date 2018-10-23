const svgObj = d3.select('.svgWrapper');

//swap these in the .projection-passer in pathGenerator
//checkout d3-map-projection for EVEN MORE projections
const geoNatural = d3.geoNaturalEarth1();
const geoOrth = d3.geoOrthographic();
const geoStereo = d3.geoStereographic();
const geoEquiRect = d3.geoEquirectangular();

function showCountryName(d){ console.log(d)}

function buildChart(tsvData, jsonData){
	const countries = topojson.feature(jsonData, jsonData.objects.countries);
	
	//data-join for countries
	const countryPaths = svgObj.selectAll('path')
		.data(countries.features);

	//append a path for each country
	countryPaths.enter().append('path')
	//set d based on country
	.attr('d', d => pathGenerator(d))
	.attr('class','countryPath')

		//append the title for mouseover 'tooltip'
		// .append('title')
		// .text(showCountryName);
}

const pathGenerator = d3.geoPath().projection(geoNatural);

//new path
svgObj.append('path')
	.attr('d', pathGenerator({type: 'Sphere'}))
	.attr('class', 'globeSpherePath');

let tsvDdata, jsonData;
d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/110m.tsv').then(dataRes => {
	tsvData = dataRes;
	d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(jsonRes => {
		jsonData = jsonRes;
		buildChart(tsvData, jsonData);
	})

});