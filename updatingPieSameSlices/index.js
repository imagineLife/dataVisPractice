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
  // let justMenAndWomen = (
  // ({ BPMen, BPWomen }) => ({ BPMen, BPWomen }))(thisTownData[0]);
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
  let updateH = w.innerHeight - obj.t - obj.b;
  let updateRadius = Math.min(updateW, updateH) * .45;
  return { updateW, updateH, updateRadius };
}





function update(data) {
    console.log('updateData')
    console.log(data)
    var duration = 750;

    //prep updated dimensions
    let { updateW, updateH, updateRadius } = getDims(window, s.m)

    let {chartDiv, svgObj, pieGWrapper} = makeD3ElementsFromParentDiv('chartDiv')
    setSVGDimsAndTrans(svgObj, updateW, updateH, s.m)
    svgObj.attr('class', 'svgWrapper')

    pieGWrapper
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .attr("class", "pieGWrapper");

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

//3. set arbirtary h/w/radius vals
var width = 350,
  height = 350,
  radius = Math.min(width, height) / 2;

//6. make pie fn
var pie = d3.pie()
  .sort(null)
  .value(function(d) {
    return d.popval;
  });

//7. make arc fn 
var arc = d3.arc()
  .outerRadius(radius * 1.0)
  .innerRadius(50);

//8. make pie-slice-name value
var pieSliceKeyName = d => d.data.keyname;

//9. make colorScale
var colorScale = d3.scaleOrdinal(d3.schemePastel2).domain(keys);

//10. UPDATE the chart with the 'firstHalf' of the data
update(getPortionOfData('Central Falls'));

//11. make onClick for radio buttons
d3.selectAll("input[name='dataset']").on("change", clickBtnFn);