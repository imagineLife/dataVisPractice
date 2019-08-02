const state = {
	width: 600,
	height: 500,
	margin: {top: 20, right: 100, bottom: 30, left: 150}
};

function buildChart(srcData, opts){
	// Label each point as increasing/decreasing above thresholds
	// or just little to no change
	var arrayLength = srcData.length;
	for (var i = 0; i < arrayLength; i++) {
	    
	    change = srcData[i]['After'] - srcData[i]['Before'];

	    if (change < -3) {
	    	srcData[i]['delta'] = 'negative';
	    } else if (change > 5) {
	    	srcData[i]['delta'] = 'positive';
	    } else {
	    	srcData[i]['delta'] = 'neutral';
	    }
	}

	// Calculate area chart takes up out of entire svg
	var chartHeight = opts.height - opts.margin.top - opts.margin.bottom;
	var chartWidth = opts.width - opts.margin.left - opts.margin.right;


	var svg = d3.select('#chart')
		.append('svg')
		.attr('width', opts.width)
		.attr('height', opts.height);

	// Create scale for positioning data correctly in chart
	var vertScale = d3.scaleLinear().domain([6, 53]).range([opts.margin.bottom, chartHeight]);

	// Labels overlap, need to precompute chart height placement
	// and adjust to avoid label overlap

	// First, calculate the right and left side chart placements
	for (var i = 0; i < arrayLength; i++) {
		srcData[i]['AfterY'] = vertScale(srcData[i]['After']);
		srcData[i]['BeforeY'] = vertScale(srcData[i]['Before']);
	}

	// Next, use a basic heuristic to pull labels up or down
	// If next item is too close to next one, move label up
	// If next item is too close and item above has been moved up, keep the same value,
	// and move next value down

	srcData.sort(function(a, b) {
		return b.Before-a.Before;
	})

	

	for (var i = 1; i < (arrayLength - 1); i++) {
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

	console.log(srcData);

	for (var i = 1; i < (arrayLength - 1); i++) {

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

	// Create slopegraph labels
	svg.selectAll('text.labels')
		.data(srcData)
		.enter()
		.append('text')
		.text(function(d) {
			return d.Tool
		})
		.attr('class', function(d) {
			return 'label ' + d.delta;
		})
		.attr('text-anchor', 'end')
		.attr('x', opts.margin.left * .6)
		.attr('y', function(d) { 
			return opts.margin.top + chartHeight - d.BeforeY;
		})
		.attr('dy', '.35em');
	
	// Create slopegraph left value labels
	svg.selectAll('text.leftvalues')
		.data(srcData)
		.enter()
		.append('text')
		.attr('class', function(d) {
			return d.delta;
		})
		.text(function(d) {
			return Math.round(d.Before) + '%'
		})
		.attr('text-anchor', 'end')
		.attr('x', opts.margin.left * .85)
		.attr('y', function(d) { 
			return opts.margin.top + chartHeight - d.BeforeY;
		})
		.attr('dy', '.35em');

	// Create slopegraph left value labels
	svg.selectAll('text.rightvalues')
		.data(srcData)
		.enter()
		.append('text')
		.attr('class', function(d) {
			return d.delta;
		})
		.text(function(d) {
			return Math.round(d.After) + '%'
		})
		.attr('text-anchor', 'start')
		.attr('x', chartWidth + opts.margin.right)
		.attr('y', function(d) { 
			return opts.margin.top + chartHeight - d.AfterY;
		})
		.attr('dy', '.35em');

	// Create slopegraph lines
	svg.selectAll('line.slope-line')
		.data(srcData)
		.enter()
		.append('line')
		.attr('class', function(d) {
			return 'slope-line ' + d.delta;
		})
		.attr('x1', opts.margin.left)
		.attr('x2', chartWidth + opts.margin.right * 0.75)
		.attr('y1', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.Before);
		})
		.attr('y2', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.After);
		});
	
	// Create slopegraph left circles
	svg.selectAll('line.left-circle')
		.data(srcData)
		.enter()
		.append('circle')
		.attr('class', function(d) {
			return d.delta;
		})
		.attr('cx', opts.margin.left)
		.attr('cy', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.Before);
		})
		.attr('r', 6);

	// Create slopegraph right circles
	svg.selectAll('line.left-circle')
		.data(srcData)
		.enter()
		.append('circle')
		.attr('class', function(d) {
			return d.delta;
		})
		.attr('cx',chartWidth + opts.margin.right * 0.75)
		.attr('cy', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.After);
		})
		.attr('r', 6);

	// Create bottom area denoting years
	svg.append("line")
		.attr('x1', opts.margin.left)
		.attr('x2', opts.margin.left)
		.attr('y1', opts.height - opts.margin.bottom)
		.attr('y2', opts.height - opts.margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	svg.append("line")
		.attr('x1', chartWidth + opts.margin.right * 0.75)
		.attr('x2', chartWidth + opts.margin.right * 0.75)
		.attr('y1', opts.height - opts.margin.bottom)
		.attr('y2', opts.height - opts.margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	svg.append("line")
		.attr('x1', opts.margin.left)
		.attr('x2', chartWidth + opts.margin.right * 0.75)
		.attr('y1', opts.height - opts.margin.bottom * 0.7)
		.attr('y2', opts.height - opts.margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	svg.append('text')
		.text('2016')
		.attr('class', 'neutral')
		.attr('x', opts.margin.left)
		.attr('y', opts.height - opts.margin.bottom * 0.05)
		.attr('text-anchor', 'start');

	svg.append('text')
		.text('2017')
		.attr('class', 'neutral')
		.attr('x', chartWidth + opts.margin.right * 0.75)
		.attr('y', opts.height - opts.margin.bottom * 0.05)
		.attr('text-anchor', 'end');

	// Get y values of notes and add notes to viz
	var pythonY = srcData.filter(function (ind) {
		return ind.Tool == 'Python';
	});

	var rapidMinerY = srcData.filter(function (ind) {
		return ind.Tool == 'RapidMiner';
	});

	var tensorflowY = srcData.filter(function (ind) {
		return ind.Tool == 'Tensorflow';
	});

	svg.selectAll('text-comments')
		.data(srcData)
		.enter()
		.append('text')
		.text(function(d) {
			return d.Comments;
		})
		.attr('class', 'neutral')
		.attr('text-anchor', 'start')
		.attr('x', chartWidth + opts.margin.right)
		.attr('y', function(d) {
			return opts.margin.top + chartHeight - d.AfterY;
		})
		.attr('dy', '.25em')
		.call(wrap, opts.margin.right);

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
	        tspan = text.text(null).append("tspan").attr("x", chartWidth + opts.margin.left).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", chartWidth + opts.margin.left).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	      }
	    }
	  });
	}
}


d3.json('./data.json').then((data) => {

	buildChart(data, state)
});


function round10(x) {
    return Math.round(x / 10) * 10;
}



