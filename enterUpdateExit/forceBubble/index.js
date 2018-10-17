function makeD3ElementsFromParentDiv(parendDivID){
  const chartDiv = document.getElementById(parendDivID);        
  const svgObj = d3.select(chartDiv).append("svg");

  return {chartDiv, svgObj};
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
  d1.forEach(d => {
    d2.push({name: d, size: jz.num.randBetween(0, 50)})
  });
  return d2;
}

function drawChart(nodes, parent) {
  console.log('drawing chart with nodes...')
  console.log(nodes)

  // transition
  var t = d3.transition().duration(500);

  // Apply the general update pattern to the nodes.
  bubbleDataJoin = bubbleGWrapper.selectAll('circle').data(nodes, d => d.name);
  let bubbleDataJoinEnter = bubbleDataJoin.enter().append('circle');

  bubbleDataJoin.exit()
      .style("fill", "#b26745")
    .transition(t)
      .attr("r", 1e-6)
      .remove();

  bubbleDataJoin
      .transition(t)
        .style("fill", "#3a403d")
        .attr("r", d => d.size);

  bubbleDataJoinEnter
      .style("fill", "#45b29d")
      .attr("r", d => d.size)
      .merge(bubbleDataJoin);

  let simulation = d3.forceSimulation(nodes)
  .force("charge", d3.forceManyBody().strength(-150))
  .force("forceX", d3.forceX().strength(.1))
  .force("forceY", d3.forceY().strength(.1))
  .force("center", d3.forceCenter())
  .alphaTarget(1)
  .on("tick", () => {
    bubbleDataJoinEnter
      .attrs({
        "cx": d => d.x,
        "cy": d => d.y
      })
  });

  // Update and drawChart the simulation.
  simulation.nodes(nodes)
    .force("collide", d3.forceCollide().strength(1).radius(d => d.size + 10).iterations(1));

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

const {chartDiv, svgObj} = makeD3ElementsFromParentDiv('chart');


var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

var width = window.innerWidth,
    height = window.innerHeight;

// var nodes = randomizeData();
// console.log('nodes...')
// console.log(nodes)

let bubbleDataJoin;

let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)
svgObj.attrs({
  'width':cssDivWidth,
  'height':cssDivHeight,
  'class': 'svgWrapper'
});

let bubbleGWrapper = svgObj.append("g")
  .attrs({
    'class': 'gWrapper',
    'transform': `translate(${cssDivWidth / 2},${cssDivHeight / 2 })`
});

drawChart(randomizeData())

d3.interval(() => {
  drawChart(randomizeData())
}, 2750);

//Resise listener & fn call
// d3.select(window).on('resize',updateData);