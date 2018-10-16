//32:00
const colorScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range(['darkred','khaki']);

const radScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range([50,30])

const drawChart = (parent, { fruits }) => {
	// const { fruits } = props;

	const dataJoin = parent.selectAll('circle')
		.data(fruits);

/*4. making UPDATES work
	static examples JUST use the ENTER selection, because static doesn't need update
	when the data CHANGES OVER TIME in the visualization,
		the UPDATE selection is needed
		the dataJoin IS THE UPDATE SELECTION

*/

	dataJoin
		.enter().append('circle')
		.attrs({
			'cx' : (d, i) => ((i * 120) + 60),
			'cy' : (h/2),
		})
		.merge(dataJoin)
		.attrs({
			'r' : d => radScale(d.type),
			'fill' : d => colorScale(d.type)
		})

	/*6.WAS #5...
		dataJoin
		.attrs({
			'cx' : (d, i) => ((i * 120) + 60),
			'cy' : (h/2),
			'r' : d => radScale(d.type),
			'fill' : d => colorScale(d.type)
		});
		
		NOW USING MERGE
		merge above contains the code that works during
		the first ENTER and subsequent UPDATES
		
		data that gets changed on updates
			NEEDS to be dealt with in the MERGE
	*/

	//'dataJoin' returns the same selection selection
	dataJoin.exit().remove();
		
}