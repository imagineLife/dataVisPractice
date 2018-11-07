function loadAndProcessData(){

	return new Promise((res, rej) => {

		//load tsv data, assign to var
		return d3.csv('./data.csv').then(dataRes => {
			let csvData = dataRes;

			//load json data, assign to var
			return d3.json('https://unpkg.com/visionscarto-world-atlas@0.0.4/world/50m.json').then(jsonRes => {
				let jsonData = jsonRes;

				/*
					take loaded data and convert to a 'countries' var
					get row-by-ID lookup fn
					make countries from json data
					adding the country row data to a 'properties' key
					
				*/
				const getRowById = csvData.reduce((accumulator, d) => {
					accumulator[d["Country code"]] = d;
					return accumulator;
				}, {})


				//define countries from json Data
				const countries = topojson.feature(jsonData, jsonData.objects.countries);

				countries.features.forEach(d => {
					Object.assign(d.properties, getRowById[+d.id]);
				})

				const countryFeatsWPop = countries.features
					.filter(d => d.properties['2018'])
					.map(d => d.properties['2018'] = +d.properties['2018'].replace(/ /g, ''))
				const resObj = {
					features: countries.features,
					countryFeatsWPop
				}
				res(resObj);
			})
		});
	})
}