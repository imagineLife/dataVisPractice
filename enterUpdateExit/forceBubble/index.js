function makeD3ElementsFromParentDiv(parendDivID){
  const chartDiv = document.getElementById(parendDivID);        
  const svgObj = d3.select(chartDiv).append("svg");
  const gWrapper = svgObj.append('g')
    .attr('class','gWrapper')
    .style('max-height','900px');

  return {chartDiv, svgObj, gWrapper};
}

function getClientDims(parentDiv, marginObj){

  // Extract the DIV width and height that was computed by CSS.
  let cssDivWidth = parentDiv.clientWidth;
  let cssDivHeight = parentDiv.clientHeight;
  
  //get css-computed dimensions
  const divWidthLessMargins =cssDivWidth - marginObj.left - marginObj.right;
  const divHeightLessMargins = cssDivHeight - marginObj.top - marginObj.bottom;
  
  return { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins };
}

function setSVGDims(obj, w, h){
  obj.attrs({
    "width" : w,
    "height" : h
  });
}

function randomizeData(){
  var d0 = jz.arr.shuffle(alphabet),
    d1 = [],
    d2 = [];
  for (var i = 0; i < jz.num.randBetween(1, alphabet.length); i++){
    d1.push(d0[i]);
  }
  d1.forEach(function(d){
    d2.push({name: d, size: jz.num.randBetween(0, 50)})
  });
  return d2;
}

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
];


const margin = { 
  left: 20, 
  right: 250,
  top: 40,
  bottom: 40
};
const colorScale = d3.scaleOrdinal(d3.schemeCategory20);
let radiusScale = d3.scaleSqrt();
//forceY & forceX to default 0
// let simulation = d3.forceSimulation()
//   .force("yforce", d3.forceY().strength(.03))
//   .force("xforce", d3.forceX().strength(.03));

const {chartDiv, svgObj, gWrapper} = makeD3ElementsFromParentDiv('chart');

function buildChart(dataObj){

  let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin);

  let smallestViewSize = Math.min(cssDivHeight, cssDivWidth)
  svgObj.attrs({
    'width':cssDivWidth,
    'height':cssDivHeight,
    'class': 'svgWrapper'
  });

  //svg translate to middle
  gWrapper.attr('transform', `translate(${cssDivWidth / 2},${cssDivHeight / 2 })`)

  radiusScale
    .domain(d3.extent(dataObj, (d) => {return +d.sales}))
    .range([0,(smallestViewSize/4)])

  simulation.force("myCollide", d3.forceCollide((d) => { return radiusScale(d.sales)}));

  let circlesObj = gWrapper.selectAll('.artists')
      .data(dataObj)
      .enter()
      .append('circle')
      .attrs({
        'class' : d => `artist-circle ${d.name}`,
        'r'     : d => radiusScale(d.sales),
        'fill'  : (d) => colorScale(d.sales)
      });

  let myTickFn = () => {
    circlesObj.attrs({
      "cx" : (d) => {
        // console.log('cx d')
        // console.log(d)
        return d.x},
      "cy" : (d) => {return d.y}
    })
  }

  simulation.nodes(dataObj)
    .on('tick', myTickFn)

  console.log('simulation')
  console.log(simulation.nodes())
}

// function updateData(){
//     gWrapper.attr('transform', `translate(${cssDivWidth / 2},${cssDivHeight / 2 })`)
//     let smallestResizeVal = Math.min(cssDivHeight, cssDivWidth)
//     // console.log(smallestResizeVal)

//     radiusScale.range([0,(smallestResizeVal/4)])

//     simulation
//       .force("myCollide", d3.forceCollide((d) => { return radiusScale(d.sales)}))
//       .alpha(.5)
//       .restart();


//   let resizeCirclesObj = gWrapper.selectAll('.artist-circle')
//     .attr('r', d => radiusScale(d.sales));

//   let resizeTick = () => {
//     resizeCirclesObj.attrs({
//       "cx" : (d) => {return d.x},
//       "cy" : (d) => {return d.y}
//     })
//   }

//   simulation.nodes(thisDataObj)
//     .on('tick', resizeTick)
// }

// buildChart(thisDataObj)



var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

var width = window.innerWidth,
    height = window.innerHeight;

var nodes = randomizeData();

var simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-150))
    .force("forceX", d3.forceX().strength(.1))
    .force("forceY", d3.forceY().strength(.1))
    .force("center", d3.forceCenter())
    .alphaTarget(1)
    .on("tick", ticked);

    let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)
    svgObj.attrs({
      'width':cssDivWidth,
      'height':cssDivHeight,
      'class': 'svgWrapper'
    });

    gWrapper.attr('transform', `translate(${cssDivWidth / 2},${cssDivHeight / 2 })`);

    nodeGWrapper = gWrapper.append("g")
      .attrs({
        "stroke": "#fff",
        "stroke-width": 1.5,
        'class': 'nodeG'
      })
      .selectAll(".node");

d3.interval(function(){
  restart(randomizeData())
}, 2500);

function restart(nodes) {

  // transition
  var t = d3.transition()
      .duration(750);

  // Apply the general update pattern to the nodes.
  nodeGWrapper = nodeGWrapper.data(nodes, function(d) { return d.name;});

  nodeGWrapper.exit()
      .style("fill", "#b26745")
    .transition(t)
      .attr("r", 1e-6)
      .remove();

  nodeGWrapper
      .transition(t)
        .style("fill", "#3a403d")
        .attr("r", function(d){ return d.size; });

  nodeGWrapper = nodeGWrapper.enter().append("circle")
      .style("fill", "#45b29d")
      .attr("r", function(d){ return d.size })
      .merge(nodeGWrapper);

  // Update and restart the simulation.
  simulation.nodes(nodes)
    .force("collide", d3.forceCollide().strength(1).radius(function(d){ return d.size + 10; }).iterations(1));

}

function ticked() {
  nodeGWrapper.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })

}


//Resise listener & fn call
// d3.select(window).on('resize',updateData);