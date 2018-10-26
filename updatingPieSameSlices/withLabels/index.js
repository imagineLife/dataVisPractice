function makeD3ElementsFromParentDiv(parendDivID){
  const chartDiv = document.getElementById(parendDivID);        
  const svgObj = d3.select(chartDiv).append("svg");
  const pieGWrapper = svgObj.append('g')
    .attr('class','pieGWrapper')
    .style('max-height','900px');

  return {chartDiv, svgObj, pieGWrapper};
}

function setSVGDimsAndTrans(obj, w, h, transObj){
  obj.attrs({
    "width" : w,
    "height" : h,
    'transform': `translate(${transObj.l},${transObj.t})`
  });
}

function makeD3PieFuncs(wedgeVal, w){

  //.sort keeps the pie from showin 'blank' space
  // when re-organizing slices
  const d3PieFunc = d3.pie().sort(null).value(wedgeVal);
  const arcFunc = d3.arc()
    .innerRadius(0)
    .outerRadius( (w) * .7);

  return { d3PieFunc, arcFunc };
}

function getPortionOfData(selectorVal) {
  let thisTownData = myData.filter(town => town.geo === selectorVal)
  let menVal = thisTownData[0]['BPMen'];
  let womenVal = thisTownData[0]['BPWomen']

  let justMenAndWomen = [
    {
      keyname: 'Men',
      popval: thisTownData[0]['BPMen']
    },
    {
      keyname: 'Women',
      popval: thisTownData[0]['BPWomen']
    }
  ];

  //SORT the selection by value
  var sortedData = justMenAndWomen.sort(function(a, b) {
      return d3.ascending(a.popval, b.popval);
    });

  return sortedData;
}

function clickBtnFn(){
  let clickedData = getPortionOfData(this.value);
  update(clickedData)
}

function getDims(w, obj){
  let updateW = w.innerWidth - obj.l - obj.r;
  let updateH = (w.innerHeight - obj.t - obj.b) * .85;
  let updateRadius = Math.min(updateW, updateH) * .45;
  return { updateW, updateH, updateRadius };
}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arcFn(i(t));
  };
}

function placeLabels(data,ind){
  if(ind === 1) return -125
  if(ind === 0) return 75
}

function turnPopToPercentText(num, tot){ return `${Math.round((num/tot) * 100)}%`}

function update(data) {
  let totalPop;
  data.forEach(d => {
    totalPop = (totalPop || 0) +d.popval 
  })

  //prep updated dimensions
  let { updateW, updateH, updateRadius } = getDims(window, s.m)

  arcFn.outerRadius(updateRadius * .75)
  .innerRadius(50);

  var duration = 750;

  setSVGDimsAndTrans(svgObj, updateW, updateH, s.m)
  svgObj.attr('class', 'svgWrapper')

  let pieCenter = `${updateW / 2},${updateH / 2 }`;
  pieGWrapper
    .attrs({
      "transform": `translate(${pieCenter})`,
      "class": "pieGWrapper"
    });

  //pie slice & label group wrappers
  const groupDataJoin = pieGWrapper.selectAll('g')
    .data(pieFn(data), (d) => d.data.keyname)
    .attr('class', 'groupDataJoin');

  const groupEnterDataJoin = groupDataJoin.enter().append('g');
    groupEnterDataJoin.merge(groupDataJoin)
    .attr('class', 'groupDataJoin')

  groupDataJoin.exit().remove();


  // pie slice 
  var singleSliceDataJoin = groupEnterDataJoin.select("path")

  // enter
  groupEnterDataJoin.append("path")
    .attrs({
      "class": "singleSlice",
      "fill": (d, i) => colorScale(i)
    })
    .merge(singleSliceDataJoin)
    .transition().duration(1000)
    .attrTween("d", arcTween)

  //LABELS
  let textY = 0;

  const textDataJoin = pieGWrapper.selectAll('text')
    .data(pieFn(data), (d) => d.data.keyname)
  
  textDataJoin
    .enter().append('text')
    .attrs({
      'x' : (d, i) => ((i * 200) - 145),
      'y' : textY,
      'class': 'boldTextLabel'
    })
    .merge(textDataJoin)
    .text(d => d.data.keyname)
    .append('tspan')
    .attrs({
      'class': 'labelVal',
      'x' : (d, i) => ((i * 200) - 145),
      'y' : textY + 20
    })
    .text(d => turnPopToPercentText(d.data.popval, totalPop))

};

//1. Data array
var myData = [
  {
    "geo": "Central Falls",
    "BPMen": 3008,
    "BPWomen": 3188
  },
  {
    "geo": "Pawtucket",
    "BPMen": 6741,
    "BPWomen": 7366
  },
  {
    "geo": "Providence",
    "BPMen": 20682,
    "BPWomen": 25996
  },
  {
    "geo": "Woonsocket",
    "BPMen": 4841,
    "BPWomen": 5349
  },
  {
    "geo": "West Warwick",
    "BPMen": 2154,
    "BPWomen": 2536
  }
]

//1b. Settings
var s = {
  m: {
    t: 15,
    r: 15,
    b: 15,
    l: 15
  }
}

//2. array of keys used in colorScale domain
//CAN/SHOULD be re-done
var keys = ["Men", "Women"];

let { updateW, updateH, origRadius } = getDims(window, s.m)

//3. make arc fn 
var arcFn = d3.arc()
  .outerRadius(origRadius * .75)
  .innerRadius(50);

//4. make pie fn
var pieFn = d3.pie()
  .sort(null)
  .value(function(d) {
    return d.popval;
  });

//5. make pie-slice-name value
var pieSliceKeyName = d => d.data.keyname;

//6. make colorScale
var colorScale = d3.scaleOrdinal(d3.schemePastel2).domain(keys);

//7. build html elements & set widths, heights, transformations
let {chartDiv, svgObj, pieGWrapper} = makeD3ElementsFromParentDiv('chartDiv')

//8. UPDATE the chart with the 'firstHalf' of the data
update(getPortionOfData('Central Falls'));

//9. make onClick for radio buttons
d3.selectAll("input[name='dataset']").on("change", clickBtnFn);