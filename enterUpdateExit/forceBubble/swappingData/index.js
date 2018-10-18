function makeD3ElementsFromParentDiv(parendDivID){
  const chartDiv = document.getElementById(parendDivID);        
  const svgObj = d3.select(chartDiv).append("svg");
  let bubbleGWrapper = svgObj.append("g")
  return {chartDiv, svgObj, bubbleGWrapper};
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

function swapData(){
  console.log('button pressed, swapping data')
  curData = (curData == dataA) ? dataB : dataA;
  drawChart(curData);
}

function drawChart(nodes, parent) {

  // transition
  var t = d3.transition().duration(500);

  // Apply the general update pattern to the nodes.
  bubbleDataJoin = bubbleGWrapper.selectAll('circle').data(nodes, d => d.name);
  let bubbleDataJoinEnter = bubbleDataJoin.enter().append('circle');

  // bubbleDataJoin.exit()
  //     // .style("fill", d => colorScale(d.name))
  //   .transition(t)
  //     .attr("r", 1e-6)
  //     .remove();

  bubbleDataJoin
      .transition(t)
        .style("fill", d => colorScale(d.name));
        // .attr("r", d => d.sales);

  bubbleDataJoinEnter
      .style("fill", d => colorScale(d.name))
      .merge(bubbleDataJoin)
      .transition().duration(1200)
        .attr("r", d => d.sales);


  let simulation = d3.forceSimulation(nodes)
  // .force("charge", d3.forceManyBody().strength(-150))
  .force("forceX", d3.forceX().strength(.06))
  .force("forceY", d3.forceY().strength(.06))
  .force("collide", d3.forceCollide().strength(.4).radius(d => d.sales + 2).iterations(3))
  // .force("center", d3.forceCenter())
  .alpha(.9)
  .velocityDecay(.5)
  .on("tick", () => {
    bubbleDataJoinEnter
    .attrs({
      "cx": d => d.x,
      "cy": d => d.y
    });

    bubbleDataJoin
    .attrs({
      "cx": d => d.x,
      "cy": d => d.y
    });
  });

  // Update and drawChart the simulation.
  simulation.nodes(nodes)

}


let dataA = [
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
     "sales": 200,
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

let dataB = [
   {
   "id": "SteelyDan",
   "name": "SteelyDan",
   "sales": 80,
   "decade":"pre"
  },
  {
     "id": "Beyonce",
     "name": "Beyonce",
     "sales": 54,
     "decade":"post"
  },
  {
     "id": "Madonna",
     "name": "Madonna",
     "sales": 100,
     "decade":"pre"
  },
  {
     "id": "AdamLevine",
     "name": "AdamLevine",
     "sales": 80,
     "decade":"post"
  },
  {
     "id": "Hall&Oats",
     "name": "Hall&Oats",
     "sales": 65,
     "decade":"pre"
  },
  {
     "id": "NickiMinaj",
     "name": "NickiMinaj",
     "sales": 20,
     "decade":"post"
  },
  {
     "id": "Drake",
     "name": "Drake",
     "sales": 40,
     "decade":"post"
  },
  {
     "id": "Bieber",
     "name": "Bieber",
     "sales": 95,
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

const {chartDiv, svgObj, bubbleGWrapper} = makeD3ElementsFromParentDiv('chart');


var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

var width = window.innerWidth,
    height = window.innerHeight;

let bubbleDataJoin;

let { cssDivWidth, cssDivHeight, divWidthLessMargins, divHeightLessMargins } = getClientDims(chartDiv, margin)

bubbleGWrapper.attrs({
    'class': 'gWrapper',
    'transform': `translate(${cssDivWidth / 2},${cssDivHeight / 2 })`
});

svgObj.attrs({
  'width':cssDivWidth,
  'height':cssDivHeight,
  'class': 'svgWrapper',
  // 'transform': `translate(0,${cssDivHeight})`
});

let curData = dataA;

drawChart(curData)

let swapBtn = d3.select('#swapData').on('click', () => swapData());

//Resise listener & fn call
// d3.select(window).on('resize',updateData);