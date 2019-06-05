function prepData(dataFile){
	return new Promise((res, rej) => {
		d3.json(dataFile).then(data => {
			res(data)
		})
	})
}