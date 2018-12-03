function tickFn(){
  console.log('ticking!')
}

function drawChart(chartData){
  console.log('drawingChart!')
  console.log(chartData)

  let linkGWrapper = svgObj.append('g')
    .attr('class', 'linksGWrapper');

    linkGWrapper.selectAll('line')
    .data(chartData.links)
    .enter()
      .append('line')
      .attrs({
        'class': 'linkLine',
        'stroke-width': d => Math.sqrt(d.value)
      });

  let nodeGWrapper = svgObj.append('g')
    .attr('class', 'nodeGWrapper');

  nodeGWrapper.selectAll('circle')
    .data(chartData.nodes)
    .enter()
      .append('circle')
      .attrs({
        'class': 'nodeCircle',
        'r': 5,
        'fill': d => colorScale(d.group)
      })

  // Attach nodes to the simulation, add listener on the "tick" event
  forceSim
      .nodes(chartData.nodes)
      .on('tick', tickFn)


}

let svgObj = d3.select('svg'),
svgWidth = +svgObj.attr('width'),
svgHeight = +svgObj.attr('height'),
colorScale = d3.scaleOrdinal(d3.schemeCategory20);

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