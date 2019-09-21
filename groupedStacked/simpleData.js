//dummy data
var dd = {
  data: [
    {
      "monthName": "november",
      "columns": [
        {
          "name": "value",
          "value": 75,
          "columnType": "average",
          "y0": 0,
          "y1": 75
        },
        {
          "name": "variance",
          "value": 6,
          "columnType": "average",
          "y0": 75,
          "y1": 81
        },
        {
          "name": "value",
          "value": 81,
          "columnType": "current",
          "y0": 0,
          "y1": 81
        }
      ],
      "total": 81
    },
    {
      "monthName": "december",
      "columns": [
        {
          "name": "value",
          "value": 72,
          "columnType": "average",
          "y0": 0,
          "y1": 72
        },
        {
          "name": "variance",
          "value": 4,
          "columnType": "average",
          "y0": 72,
          "y1": 76
        },
        {
          "name": "value",
          "value": 76,
          "columnType": "current",
          "y0": 0,
          "y1": 76
        }
      ],
      "total": 76
    },
    {
      "monthName": "january",
      "variance-current": 5,
      "columns": [
        {
          "name": "value",
          "value": 70,
          "columnType": "average",
          "y0": 0,
          "y1": 70
        },
        {
          "name": "value",
          "value": 65,
          "columnType": "current",
          "y0": 0,
          "y1": 65
        },
        {
          "name": "variance",
          "value": 5,
          "columnType": "current",
          "y0": 65,
          "y1": 70
        }
      ],
      "total": 70
    },
    {
      "monthName": "february",
      "columns": [
        {
          "name": "value",
          "value": 75,
          "columnType": "average",
          "y0": 0,
          "y1": 75
        },
        {
          "name": "variance",
          "value": 3,
          "columnType": "average",
          "y0": 75,
          "y1": 78
        },
        {
          "name": "value",
          "value": 78,
          "columnType": "current",
          "y0": 0,
          "y1": 78
        }
      ],
      "total": 78
    }
  ],
  columnTypes: ['average', 'current'],
  stackTypes: ['value', 'variance'],
  columnGroups: ['november', 'december', 'january', 'february'],
  yDomain: [0, 81]
}
    
var
		//prepare initial stuff
    srcData = dd.data,
		margin = {top: 20, right: 20, bottom: 80, left: 20},
    chart = d3.select('#chartDiv'),
    width = +chart.style('width').replace('px', '') - margin.left - margin.right,
    height = +chart.style('height').replace('px', '') - margin.top - margin.bottom,
    svg = chart
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),

    //d3 scale stuff
    x0 = d3.scaleBand().rangeRound([0, width]),
    x1 = d3.scaleBand(),
    y = d3.scaleLinear().range([height, 0]),
    y0;


x0.domain(dd.columnGroups);
x1.domain(dd.columnTypes).rangeRound([0, (x0.bandwidth() * .5)]);
y.domain(dd.yDomain);

const barGroupEnterFn = e => {
  let barGroups = e.append('g')
  .attrs({
    'class': d => `month-col ${d.monthName}`,
    'transform': d => `translate(${x0(d.monthName) },0)`
  });

  let bars = barGroups.selectAll('rect')
    .data(d => d.columns).enter()
    .append("rect")
      .attrs({
        //coords
        'x': d => x1(d.columnType)+1,
        'width': x1.bandwidth(),
        'class': d => {
          return `item ${d.name} ${d.columnType}`
        },
        'y': d => y(d.y1) || 0,
        'height': d => (y(d.y0) - y(d.y1) - 1) || 0
      }).on('mousemove', d => mouseEventMove(d));

  let barLabels = barGroups.append('g')
  .attrs({
    'class': 'legend-item',
    'text-anchor': 'middle',
    'transform': 'translate('+svg.select('.item').attr('width')+','+parseInt(height+margin.top)+')'
  })
  .append('text')
  .text(d => d.monthName);
}
/*
  Bar Groups
*/
var barGroups = svg.selectAll(".month-col")
.data(dd.data).join(barGroupEnterFn)

//events
var tooltip = d3.select('body')
.append('div')
.attr('class','stacked-bar-chart-tooltip stacked-bar-chart-tooltip-hidden');

var
mouseEventMove = function(d){
  // var item = d3.select(this);
  return tooltip
    .styles({
    'top': (d3.event.pageY) - 10 + 'px',
    'right': (window.innerWidth - d3.event.pageX) + 10 + 'px',
    'border-color': 'black'
  })
  .attr('class', 'stacked-bar-chart-tooltip')
  // .classed('stacked-bar-chart-tooltip', false)
  .text(d.name+'('+d.columnType+')'+d.value)
},
  mouseEventOut = function (){
    return tooltip.attr('class', 'stacked-bar-chart-tooltip-hidden');
  };

svg.selectAll('.item')
  // .on('mousemove', mouseEventMove)
  .on('mouseout', mouseEventOut);