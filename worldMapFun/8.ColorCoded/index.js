const svgObj = d3.select('.svgWrapper');

//swap these in the .projection-passer in pathGenerator
//checkout d3-map-projection for EVEN MORE projections
const geoNatural = d3.geoNaturalEarth1();

//this one is the globe!
const geoOrth = d3.geoOrthographic();
const geoStereo = d3.geoStereographic();
const geoEquiRect = d3.geoEquirectangular();

function showCountryName(d){ 
	console.log(d)
}

function buildChart(tsvData, jsonData){


	//get row-by-ID function
	//updates this method, makes less specific to name
	const rowById = tsvData.reduce((accumulator, d) => {
		accumulator[d.iso_n3] = d;
		return accumulator;
	}, {})


	//define countries from json Data
	const countries = topojson.feature(jsonData, jsonData.objects.countries);

	countries.features.forEach(d => {
		Object.assign(d.properties, rowById[d.id])
	})
	
	//data-join for countries to paths
	const countryPaths = gObj.selectAll('path')
		.data(countries.features);

	//append a path for each country
	countryPaths.enter().append('path')
	.attrs({
		'd': d => pathGenerator(d), //set d based on country
		'class':'countryPath',
		'fill':'orange'
	})
	//append the title for mouseover 'tooltip'
	.append('title')
	.text(d => d.properties.name);
}

const pathGenerator = d3.geoPath().projection(geoNatural);


let gObj = svgObj.append('g').attr('pointer-events', 'all')

//new path
gObj.append('path')
	.attr('d', pathGenerator({type: 'Sphere'}))
	.attr('class', 'globeSpherePath');

svgObj.call(d3.zoom().on('zoom', function(){
	gObj.attr("transform", d3.event.transform);
}));

let tsvDdata, jsonData;

d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv').then(dataRes => {
	tsvData = dataRes;
	d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json').then(jsonRes => {
		jsonData = jsonRes;
		buildChart(tsvData, jsonData);
	})
});