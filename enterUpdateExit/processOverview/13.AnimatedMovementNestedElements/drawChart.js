//32:00
const colorScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range(['darkred','khaki']);

const radScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range([50,30])

const setXPos = (d,i) => i * 120 + 60; 

const drawChart = (parent, { fruits }) => {
	// const { fruits } = props;

	const groupDataJoin = parent.selectAll('g')
		.data(fruits, d => d.fruitID);

	const groupEnterDataJoin = groupDataJoin.enter().append('g')
		.attr('transform', (d,i) => `translate(${((i * 120) + 60)},${(h/2)})`);
		
		groupEnterDataJoin
		.merge(groupDataJoin)
		.attr('class', `appleTextGWrapper`)
		.transition().duration(1000)
			.attr('transform', (d,i) => `translate(${((i * 120) + 60)},${(h/2)})`)

	//'groupDataJoin' returns the same selection selection
	groupDataJoin.exit().remove();

	//fruitCircles appended to g 
	const fruitDataJoin = groupDataJoin.select('circle');
	groupEnterDataJoin.append('circle')
		.attr('r', 0)
		.merge(fruitDataJoin)
		.attr('fill', d => colorScale(d.type))
			.transition().duration(1000)
			.attr('r', d => radScale(d.type))

	//ADDING LABELS
	//LABELS appended to g 
	const labelDataJoin = groupDataJoin.select('text');
	groupEnterDataJoin.append('text')
		.merge(labelDataJoin)
		.attr('y', 120)
		.text(d => d.type)

		
}