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

function mergeWithFirstEqualZero(first, second){

  var secondSet = d3.set();

  second.forEach(function(d) { 
    return secondSet.add(d.keyname)
  });

  var onlyFirst = first
    .filter(function(d){ return !secondSet.has(d.keyname) })
    .map(function(d) { return {keyname: d.keyname, popval: 0}; });

  var sortedMerge = d3.merge([ second, onlyFirst ])
    .sort(function(a, b) {
        return d3.ascending(a.keyname, b.keyname);
      });

  console.log('sortedMerge')
  console.log(sortedMerge)

  return sortedMerge;
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

function getSlicePaths(parent, className, pieFn, data, k){
  return parent.select(className)
  .selectAll("path")
  .data(pieFn(data), k);
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
  console.log('arcTween a')
  console.log(a)
  console.log('micCheck this')
  console.log(this);
  console.log('this._current')
  console.log(this._current);
  console.log('- - - - -')
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arcFn(i(t));
  };
}




function update(data) {
  
  //prep updated dimensions
  let { updateW, updateH, updateRadius } = getDims(window, s.m)

  arcFn.outerRadius(updateRadius * .75)
  .innerRadius(50);

  var duration = 750;

  setSVGDimsAndTrans(svgObj, updateW, updateH, s.m)
  svgObj.attr('class', 'svgWrapper')

  pieGWrapper
    .attrs({
      "transform": `translate(${updateW / 2},${updateH / 2 })`,
      "class": "pieGWrapper"
    });


  // join
  var singleSlice = pieGWrapper.selectAll(".singleSlice")
      .data(pieFn(data), (d) => { 
        // console.log('singleSlice d')
        // console.log(d)
        return d.data.keyname});

  // update
  singleSlice 
    .transition()
      .duration(750)
      .attrTween("d", arcTween);

  // enter
  singleSlice.enter()
    .append("path")
    .attrs({
      "class": "singleSlice",
      "fill": (d, i) => colorScale(i),
      "d": arcFn
    })
    .each(d => this._current = d)
    .transition().duration(700);

};





function placeLabels(data,ind){
  if(ind === 1) return -125
  if(ind === 0) return 75
}

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

//7. make arc fn 
var arcFn = d3.arc()
  .outerRadius(origRadius * .75)
  .innerRadius(50);


//6. make pie fn
var pieFn = d3.pie()
  .sort(null)
  .value(function(d) {
    return d.popval;
  });

//8. make pie-slice-name value
var pieSliceKeyName = d => d.data.keyname;

//9. make colorScale
var colorScale = d3.scaleOrdinal(d3.schemePastel2).domain(keys);

//build html elements & set widths, heights, transformations
let {chartDiv, svgObj, pieGWrapper} = makeD3ElementsFromParentDiv('chartDiv')

//10. UPDATE the chart with the 'firstHalf' of the data
update(getPortionOfData('Central Falls'));

//11. make onClick for radio buttons
d3.selectAll("input[name='dataset']").on("change", clickBtnFn);