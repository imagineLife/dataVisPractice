
d3.json('./simpleData.json').then(d => {
  let dd = d;
  const makeClassName = d => `item ${d.valOrVar} ${d.xSeries}`;
  const scaledYEnd = d => y(d.y1);
  const scaledHeight = d => (y(d.y0) - y(d.y1));
  var
  //prepare initial stuff
  margin = {top: 20, right: 20, bottom: 80, left: 20},
  chart = d3.select('#chartDiv'),
  width = +chart.style('width').replace('px', '') - margin.left - margin.right,
  height = +chart.style('height').replace('px', '') - margin.top - margin.bottom,
  svg = chart
  .append('svg')
  .attrs({
    'width': width + margin.left + margin.right,
    'height': height + margin.top + margin.bottom
  })
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),

  //d3 scale stuff
  x0 = d3.scaleBand().rangeRound([0, width]),
  x1 = d3.scaleBand(),
  y = d3.scaleLinear().range([height, 0]),
  y0;


  x0.domain(dd.columnGroups);
  x1.domain(dd.xSeries).rangeRound([0, (x0.bandwidth() * .5)]);
  y.domain(dd.yDomain);

  const barGroupEnterFn = e => {

    let bars = e.append("rect")
      .attrs({
        'x': d => d['xSeries'] == 'average' ? x0(d.xGroup) : x0(d.xGroup) + x1.bandwidth(),
        'width': x1.bandwidth(),
        'class': makeClassName,
        'y': scaledYEnd,
        'height': scaledHeight,
      }).on('mousemove', d => mouseEventMove(d))
      .on('mouseout', d => mouseEventOut(d));
  }

  const barLabelEnter = e => {
    let labels = e.append('text')
    .attrs({
      'x': d => x0(d) + x1.bandwidth(),
      y : height + 25,
      'text-anchor': 'middle',
      'fill': 'white'
    }).text(d => d)
  }

  /*
    Bars
  */
  var bars = svg.selectAll(".item")
  .data(dd.data).join(barGroupEnterFn)

  var barLabels = svg.selectAll('.barLabel')
  .data(dd.columnGroups).join(barLabelEnter)

  //events
  var tooltip = d3.select('body')
  .append('div')
  .attr('class','stacked-bar-chart-tooltip stacked-bar-chart-tooltip-hidden');

  var
  mouseEventMove = function(d){
    return tooltip
      .styles({
      'top': (d3.event.pageY) - 10 + 'px',
      'right': (window.innerWidth - d3.event.pageX) + 10 + 'px',
      'border-color': 'black'
    })
    .attr('class', 'stacked-bar-chart-tooltip')
    .text(() => {
      let varVal = d.xSeries == 'average' && d.valOrVar == 'variance' ? -d.value : `+${d.value}`
      return d.valOrVar == 'variance' ? 'variance : '+varVal : d.xSeries+':'+varVal
    })
  },

  mouseEventOut = function (){
    return tooltip.attr('class', 'stacked-bar-chart-tooltip-hidden');
  };
})
