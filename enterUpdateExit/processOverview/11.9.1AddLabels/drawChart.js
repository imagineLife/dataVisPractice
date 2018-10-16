//32:00
const colorScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range(['darkred','khaki']);

const radScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range([50,30])

const drawChart = (parent, { fruits }) => {
	// const { fruits } = props;

	const fruitDataJoin = parent.selectAll('circle')
		.data(fruits);

	fruitDataJoin
		.enter().append('circle')
		.attrs({
			'cx' : (d, i) => ((i * 120) + 60),
			'cy' : (h/2),
		})
		.merge(fruitDataJoin)
		.attrs({
			'r' : d => radScale(d.type),
			'fill' : d => colorScale(d.type)
		})

	//'fruitDataJoin' returns the same selection selection
	fruitDataJoin.exit().remove();


	//ADDING LABELS
	const textDataJoin = parent.selectAll('text')
		.data(fruits);

	textDataJoin
		.enter().append('text')
		.attrs({
			'x' : (d, i) => ((i * 120) + 60),
			'y' : (h/2 + 100),
		})
		.merge(textDataJoin)
		.text(d => d.type)

	//'dataJoin' returns the same selection selection
	textDataJoin.exit().remove();
		
}