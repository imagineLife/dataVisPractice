const state = {
	width: 600,
	height: 500,
	margin: {top: 20, right: 100, bottom: 30, left: 150},
	yScale: null
};


function makeText(itm, txt, cl, xVal, yVal, ta){
		itm.append('text')
		.text(txt)
		.attr('class', cl)
		.attr('x', xVal)
		.attr('y', yVal)
		.attr('text-anchor', ta);
}

function enterFn(e){

	const { margin, width, height } = state;
	// Calculate area chart takes up out of entire svg
	var chartHeight = height - margin.top - margin.bottom;
	var chartWidth = width - margin.left - margin.right;

	// Create bottom area denoting years
	e.append("line")
		.attr('x1', margin.left)
		.attr('x2', margin.left)
		.attr('y1', height - margin.bottom)
		.attr('y2', height - margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-dasharray', d =>  (d['delta'] === 'neutral') ? '2 5' : null)
		.attr('stroke-width', d =>  (d['delta'] === 'neutral') ? '1px' : '2px');

	e.append("line")
		.attr('x1', chartWidth + margin.right * 0.75)
		.attr('x2', chartWidth + margin.right * 0.75)
		.attr('y1', height - margin.bottom)
		.attr('y2', height - margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	e.append("line")
		.attr('x1', margin.left)
		.attr('x2', chartWidth + margin.right * 0.75)
		.attr('y1', height - margin.bottom * 0.7)
		.attr('y2', height - margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	makeText(e, '2016', 'neutral', margin.left, height - margin.bottom * 0.05, 'start')
	makeText(e, '2017', 'neutral', chartWidth + margin.right * 0.75, height - margin.bottom * 0.05, 'end')

	e.append('text')
		.text(d => d['Comments'])
		.attr('class', 'neutral')
		.attr('text-anchor', 'start')
		.attr('x', chartWidth + margin.right)
		.attr('y', function(d) {
			return margin.top + chartHeight - state.yScale(d.After);
		})
		.attr('dy', '.25em')
		.call(wrap, margin.right);

// Create slopegraph lines
	e.append('line')
		.attr('class', function(d) {
			return 'slope-line ' + d.delta;
		})
		.attr('x1', margin.left)
		.attr('x2', chartWidth + margin.right * 0.75)
		.attr('y1', function(d) { 
			return margin.top + chartHeight - state.yScale(d.Before);
		})
		.attr('y2', function(d) { 
			return margin.top + chartHeight - state.yScale(d.After);
		})
		.attr('stroke-dasharray', d =>  (d['delta'] === 'neutral') ? '2 20' : null)
		.attr('stroke-width', d =>  (d['delta'] === 'neutral') ? '1px' : '2px');
	
	// Create slopegraph left circles
	e.append('circle')
		.attr('class', function(d) {
			return d.delta;
		})
		.attr('cx', margin.left)
		.attr('cy', function(d) { 
			return margin.top + chartHeight - state.yScale(d.Before);
		})
		.attr('r', 6);

	// Create slopegraph right circles
	e.append('circle')
		.attrs({
			'class': d => d.delta,
			'cx': chartWidth + margin.right * 0.75,
			'cy': d => margin.top + chartHeight - state.yScale(d.After),
			'r': 6
		});

		// Create slopegraph labels
		e.append('text')
		.text(d =>d.Tool)
		.attrs({
			'class': d => `label ${d.delta}`,
			'text-anchor': 'end',
			'x': margin.left * .6,
			'y': d => margin.top + chartHeight - state.yScale(d.Before),
			'dy': '.35em'
		})
	
	// Create slopegraph left value labels
		e.append('text')
		.attrs({
			'class': d => d.delta,
			'text-anchor': 'end',
			'x': margin.left * .85,
			'y': d => margin.top + chartHeight - state.yScale(d.Before), 
			'dy': '.35em'
		})
		.text(d => Math.round(d.Before) + '%');

	// Create slopegraph left value labels
		e.append('text')
		.attr('class', d => d.delta)
		.attr('text-anchor', 'start')
		.attr('x', chartWidth + margin.right)
		.attr('y', d => margin.top + chartHeight - state.yScale(d.After))
		.attr('dy', '.35em')
		.text(d => Math.round(d.After) + '%');
}

function buildChart(srcData, opts){

	const { margin, height, width } = opts

	// Calculate area chart takes up out of entire svg
	var chartHeight = height - margin.top - margin.bottom;
	var chartWidth = width - margin.left - margin.right;

	// Create scale for positioning data correctly in chart
	state.yScale = d3.scaleLinear()
		.domain([6, 53])
		.range([margin.bottom, chartHeight]);

	var svg = d3.select('#chart')
		.append('svg')
		.attrs({
			'width': width,
			'height': height
		});

	let dataJoin = svg.selectAll('g')
	.data(srcData)
	dataJoin.join(enterFn)
}

function wrap(text, width) {

	const { margin } = state
	var chartWidth = width - margin.left - margin.right;
	
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text
	        	.text(null)
	        	.append("tspan")
	        	.attr("x", state.width - state.margin.right)
	        	.attr("y", y)
	        	.attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text
	        	.append("tspan")
	        	.attr("x", state.width - state.margin.right)
	        	.attr("y", y)
	        	.attr("dy", ++lineNumber * lineHeight + dy + "em")
	        	.text(word);
	      }
	    }
	  });
	}

function prepData(srcData){
	
	// assign a DELTA key to each element
	//used for class-assignment
	for (var i = 0; i < srcData.length; i++) {
	    
	    change = srcData[i]['After'] - srcData[i]['Before'];

	    if (change < -3) {
	    	srcData[i]['delta'] = 'negative';
	    } else if (change > 5) {
	    	srcData[i]['delta'] = 'positive';
	    } else {
	    	srcData[i]['delta'] = 'neutral';
	    }
	}

	srcData.sort(function(a, b) {
		return b.After-a.After;
	})


	return srcData
}
d3.json('./data.json').then((data) => {
	let preppedData = prepData(data)
	buildChart(preppedData, state)
});


function round10(x) {
    return Math.round(x / 10) * 10;
}



