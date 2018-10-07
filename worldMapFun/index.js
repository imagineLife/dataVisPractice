const svgObj = d3.select('.svgWrapper');
const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);



d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
	const countries = topojson.feature(data, data.objects.countries);
	
	
	const countryPaths = svgObj.selectAll('path')
		//data-join for countries
		.data(countries.features)
		//append a path for each country
		.enter().append('path')
		//set d based on country, simplified from v1
		.attr('class', 'countryPath')
		.attr('d', d => pathGenerator)

})