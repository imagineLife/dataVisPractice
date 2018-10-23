const svgObj = d3.select('.svgWrapper');

//swap these in the .projection-passer in pathGenerator
//checkout d3-map-projection for EVEN MORE projections
const geoNatural = d3.geoNaturalEarth1();
const geoOrth = d3.geoOrthographic();
const geoStereo = d3.geoStereographic();
const geoEquiRect = d3.geoEquirectangular();

function showCountryName(d){ 
	console.log(d)
}

function buildChart(tsvData, jsonData){
	const countries = topojson.feature(jsonData, jsonData.objects.countries);

	//a lookup-table of country names to ids
	//accumulator gets returned by reduce
	//initial val of accumulator is {} at end of reduce fn
	const countryName = tsvData.reduce((accumulator, d) => {
		accumulator[d.iso_n3] = d.name;
		return accumulator;
	}, {})
	
	//data-join for countries
	const countryPaths = gObj.selectAll('path')
		.data(countries.features);

	//append a path for each country
	countryPaths.enter().append('path')
	//set d based on country
	.attr('d', d => pathGenerator(d))
	.attr('class','countryPath')

		//append the title for mouseover 'tooltip'
		.append('title')
		.text(d => countryName[d.id]);
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

d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/110m.tsv').then(dataRes => {
	tsvData = dataRes;
	d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(jsonRes => {
		jsonData = jsonRes;
		buildChart(tsvData, jsonData);
	})
});