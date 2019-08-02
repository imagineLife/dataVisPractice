const state = {
	width: 600,
	height: 500,
	margin: {top: 20, right: 100, bottom: 30, left: 150},
	yScale: null
};

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
		.attr('stroke-width', '2px');

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

	e.append('text')
		.text('2016')
		.attr('class', 'neutral')
		.attr('x', margin.left)
		.attr('y', height - margin.bottom * 0.05)
		.attr('text-anchor', 'start');

	e.append('text')
		.text('2017')
		.attr('class', 'neutral')
		.attr('x', chartWidth + margin.right * 0.75)
		.attr('y', height - margin.bottom * 0.05)
		.attr('text-anchor', 'end');

	e.selectAll('text-comments')
		.append('text')
		.text(function(d) {
			return d.Comments;
		})
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
		});
	
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
		.attr('class', function(d) {
			return d.delta;
		})
		.attr('cx',chartWidth + margin.right * 0.75)
		.attr('cy', function(d) { 
			return margin.top + chartHeight - state.yScale(d.After);
		})
		.attr('r', 6);

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
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", chartWidth + margin.left).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", chartWidth + margin.left).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	      }
	    }
	  });
	}

function prepData(srcData){
		// assign a DELTA key to each element
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

	for (var i = 1; i < (srcData.length - 1); i++) {
		if ((srcData[i]['BeforeY']-srcData[i+1]['BeforeY']) < 15) {
			if ((srcData[i-1]['BeforeY']-srcData[i]['BeforeY']) < 15) {
				srcData[i+1]['BeforeY'] = srcData[i+1]['BeforeY'] - 10;
			} else {
				srcData[i]['BeforeY'] = srcData[i]['BeforeY'] + 10;
			}
		}
	}

	srcData.sort(function(a, b) {
		return b.After-a.After;
	})

	for (var i = 1; i < (srcData.length - 1); i++) {

		if ((srcData[i]['AfterY']-srcData[i+1]['AfterY']) < 15) {
			if ((srcData[i-1]['AfterY']-srcData[i]['AfterY']) < 15) {
				srcData[i+1]['AfterY'] = srcData[i+1]['AfterY'] - 10;
			} else {
				srcData[i]['AfterY'] = srcData[i]['AfterY'] + 10;
			}
		} else if ((srcData[i-1]['AfterY']-srcData[i]['AfterY']) < 15) {
			srcData[i]['AfterY'] = srcData[i]['AfterY'] - 10;
		} 
	}

	srcData.sort(function(a, b) {
		return b.Before-a.Before;
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



