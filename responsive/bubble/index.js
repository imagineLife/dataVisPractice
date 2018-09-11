let myVars = {
        svgW : 500,
        svgH : 500
      };

let thisDataObj = [
   {
   "id": "SteelyDan",
   "name": "SteelyDan",
   "sales": 40,
   "decade":"pre"
},
{
   "id": "Beyonce",
   "name": "Beyonce",
   "sales": 34,
   "decade":"post"
},
{
   "id": "Madonna",
   "name": "Madonna",
   "sales": 300,
   "decade":"pre"
},
{
   "id": "AdamLevine",
   "name": "AdamLevine",
   "sales": 20,
   "decade":"post"
},
{
   "id": "Hall&Oats",
   "name": "Hall&Oats",
   "sales": 125,
   "decade":"pre"
},
{
   "id": "NickiMinaj",
   "name": "NickiMinaj",
   "sales": 80,
   "decade":"post"
},
{
   "id": "Drake",
   "name": "Drake",
   "sales": 10,
   "decade":"post"
},
{
   "id": "Bieber",
   "name": "Bieber",
   "sales": 25,
   "decade":"post"
}
]

let svgObj = d3.select('#chart')
  .append('svg')
  .attrs({
    'width':myVars.svgW,
    'height':myVars.svgH,
    'class': 'svgWrapper'
  });

  let gWrapper = svgObj.append('g')
  .attr('transform', "translate(" + myVars.svgW / 2 + "," + myVars.svgH / 2 + ")")
  .attr('class', 'gWrapper');
//RESETS 
//svg translate to middle

const colorScale = d3.scaleOrdinal(d3.schemeCategory20);
let radiusScale = d3.scaleSqrt();
//forceY & forceX to default 0
let simulation = d3.forceSimulation()
  .force("yforce", d3.forceY().strength(.03))
  .force("xforce", d3.forceX().strength(.03));

  radiusScale
    .domain(d3.extent(thisDataObj, (d) => {return +d.sales}))
    .range([15,100])

  simulation.force("myCollide", d3.forceCollide((d) => { return radiusScale(d.sales)}));

let circlesObj = gWrapper.selectAll('.artists')
    .data(thisDataObj)
    .enter()
    .append('circle')
    .attrs({
      'class' : d => `artist-circle ${d.name}`,
      'r'     : d => radiusScale(d.sales),
      'fill'  : (d) => colorScale(d.sales)
    });

let myTickFn = () => {
  circlesObj.attrs({
    "cx" : (d) => {return d.x},
    "cy" : (d) => {return d.y}
  })
}

simulation.nodes(thisDataObj)
  .on('tick', myTickFn)