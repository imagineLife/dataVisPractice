function prepData(dataFile){
	return new Promise((res, rej) => {
		d3.json(dataFile).then(data => {
			let groupedByMedalType = {"Gold": 0, "Silver": 0, "Bronze": 0, "Honorable": 0};
			data.forEach(d => {
				groupedByMedalType[d["Level"]] = ++groupedByMedalType[d["Level"]];
			})
			// console.log('groupedByMedalType')
			// console.log(groupedByMedalType)
			res(data)
		})
	})
}