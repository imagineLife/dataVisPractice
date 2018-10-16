//32:00
const colorScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range(['darkred','khaki']);

const radScale = d3.scaleOrdinal()
.domain(['apple','lemon']).range([50,30])

const drawChart = (parent, { fruits }) => {
	// const { fruits } = props;

	/*

	GROUPING
	1. make enter/update/exit GROUP logic
	2. set fruitDataJoin to be connected to GROUPS instead of 'parent'
	3. make the groups Enter selection a var
	4. remove attrs cx & cy from circle appendage
	5. remove redundant fruitDataJoin exit

	6. NOTICE the 'nested general-update-pattern'!!
	*/
	const groupDataJoin = parent.selectAll('g')
		.data(fruits);

	const groupEnterDataJoin = groupDataJoin.enter().append('g');
		groupEnterDataJoin.merge(groupDataJoin)
		.attr('transform', (d,i) => `translate(${((i * 120) + 60)},${(h/2)})`)

	//'groupDataJoin' returns the same selection selection
	groupDataJoin.exit().remove();


	//2.
	const fruitDataJoin = groupDataJoin.select('circle');

	groupEnterDataJoin.append('circle')
//4.		
		// .attrs({
		// 	'cx' : (d, i) => ((i * 120) + 60),
		// 	'cy' : (h/2),
		// })
		.merge(fruitDataJoin)
		.attrs({
			'r' : d => radScale(d.type),
			'fill' : d => colorScale(d.type)
		})

/*
	6.	nested general update pattern without comments

	const fruitDataJoin = groupDataJoin.select('circle');
	groupEnterDataJoin.append('circle')
		.merge(fruitDataJoin)
		.attrs({
			'r' : d => radScale(d.type),
			'fill' : d => colorScale(d.type)
		})
*/

	//'fruitDataJoin' returns the same selection selection
//5.
	// fruitDataJoin.exit().remove();


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