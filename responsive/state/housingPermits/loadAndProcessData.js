function loadAndProcessData(){

	return new Promise((res, rej) => {

		//load tsv data, assign to var
		return d3.csv('./data.csv').then(csvData => {
			let townVals = csvData;

			//load json data, assign to var
			return d3.json('./CTstate.json').then(jsonRes => {
				let townShapes = jsonRes;

				let geometriesWithoutWater = townShapes.objects.townLayer.geometries.filter(removeWater)

				let townsAndVals = {}
				townVals.forEach(d => townsAndVals[d.town] = +d.permits );

				//define countries from json Data
				//Connecticut topojson
			    var connecticut = topojson.feature(townShapes, {
			        type: "GeometryCollection",
			        geometries: geometriesWithoutWater
			    });

				connecticut.features.forEach(d => {
					let permitObj = { permits: townsAndVals[d.properties["NAME10"]]}
					Object.assign(d.properties, permitObj)
				})

				res(connecticut);
			})
		});
	})

}