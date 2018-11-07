const geoNatural = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(geoNatural);

const buildMap = (parent, props) => {

	const { stateCountryFeats, countryFeatsWPop } = props;

	const thisGSelection = parent.selectAll('g').data([null]);
	const thisGEnter = thisGSelection.enter().append('g');
	const thisGMerged = thisGSelection.merge(thisGEnter)
	const radiusValue = d => d.properties["2018"]
	const radiusScale = d3.scaleSqrt()
		.domain([0, d3.max(stateCountryFeats, radiusValue)])
		.range([0,40]);

	//new path
	//appends on FIRST invocation of map fn, NOT on subsequent updates
	thisGEnter.append('path')
		.attr('d', pathGenerator({type: 'Sphere'}))
		.attr('class', 'globeSpherePath')
		.merge(thisGSelection.select('.globeSpherePath'))
			.attr('opacity', selectedLegendVal ? .75 : 1);

	parent.call(d3.zoom().on('zoom', function(){
		thisGMerged.attr("transform", d3.event.transform);
	}));

	//data-join for countries to paths
	const countryPaths = thisGMerged.selectAll('.countryPath').data(stateCountryFeats);

	//append a path for each country
	let countryPathsEnter = countryPaths.enter().append('path')
		.attr('class','countryPath')
		
		countryPaths.merge(countryPathsEnter)
		.attrs({
			'opacity': d => {
				return (!selectedLegendVal ||  selectedLegendVal === colorVal(d)) ? 1 : 0.25;
	        },
			'd': d => pathGenerator(d), //set d based on country;
			'fill': d => d.properties["2018"] ? 'green' : 'red'
		})
		.classed('highlightedCountryPath', d => (selectedLegendVal && colorVal(d)))
	
	//append the title for mouseover 'tooltip'
	countryPathsEnter.append('title')
		.text(d => `${d.properties.name}: ${d.properties.economy}`);


	//data-join for CIRCLES
	const circlesDataJoin = thisGMerged.selectAll('.dataCircle').data(countryFeatsWPop);

	//add key/value to data
	//for use in cx & cy position of circles
	countryFeatsWPop.forEach(d => {
		d.properties.projected = geoNatural(d3.geoCentroid(d));
	})

	//append a path for each country
	let circleDataEnter = circlesDataJoin.enter().append('circle')
		.attrs({
			'class':'dataCircle',
			'cx': d => d.properties.projected[0],
			'cy': d => d.properties.projected[1],
			'r': d => radiusScale(d.properties["2018"]),
			'fill': 'limegreen',
			'opacity': .5

		})


}