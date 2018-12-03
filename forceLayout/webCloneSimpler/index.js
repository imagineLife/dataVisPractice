function drawChart(chartData){
  console.log('drawingChart!')
  console.log(chartData)

  let linkObj = svgObj.append('g')
    .attr('class', 'linksGWrapper')
    .selectAll('line')
    .data(chartData.links)
    .enter()
      .append('line')
      .attrs({
        'class': 'linkLine',
        'stroke-width': d => Math.sqrt(d.value)
      })
}

let svgObj = d3.select('svg'),
svgWidth = +svgObj.attr('width'),
svgHeight = +svgObj.attr('height'),
color = d3.scaleOrdinal(d3.schemeCategory20);

let forceSim = d3.forceSimulation()

  //moves to center of screen
  .force('center', d3.forceCenter(svgWidth/2, svgHeight / 2))

  //
  .force('charge', d3.forceManyBody().strength(-50))

  //
  .force('collide', d3.forceCollide(10).strength(.9))

  //
  .force('link', d3.forceLink().id(d => d.id))

d3.json('./data.json', (err, data) => {
  if(err) throw err;

  drawChart(data)
})