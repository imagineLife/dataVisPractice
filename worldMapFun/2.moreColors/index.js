const svgObj = d3.select('.svgWrapper');
const svgW = +svgObj.attr('width');
const svgH = +svgObj.attr('height');
const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);



d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
	const countries = topojson.feature(data, data.objects.countries);
	
	//data-join for countries
	const countryPaths = svgObj.selectAll('path')
		.data(countries.features);

	//append a path for each country
	countryPaths.enter().append('path')
	//set d based on country
	.attr('d', d => pathGenerator(d))
	.attr('class','countryPath');
})