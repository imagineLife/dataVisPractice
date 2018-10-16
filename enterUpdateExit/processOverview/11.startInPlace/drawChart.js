//32:00
const colorScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range(['darkred','khaki']);

const radScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range([50,30])

const setXPos = (d,i) => i * 120 + 60	; 
const drawChart = (parent, { fruits }) => {
	// const { fruits } = props;

	const dataJoin = parent.selectAll('circle')
		.data(fruits, d => d.fruitID);

	dataJoin
		.enter().append('circle')
		.attrs({
			'cy' : (h/2),
			'cx' : setXPos,

			//10. animated radius on element entry
			//Setting radius to 
			'r': 0
		})
		.merge(dataJoin)
		.attr('fill', d => colorScale(d.type))
			.transition().duration(1000)
			.attrs({
				'cx' : setXPos,
				'r': d => radScale(d.type)
			})


	//'dataJoin' returns the same selection selection
	dataJoin.exit().remove();
		
}