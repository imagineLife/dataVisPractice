function makeD3ElementsFromParentDiv(parendDivID){
  const chartDiv = document.getElementById(parendDivID);        
  const svgObj = d3.select(chartDiv).append("svg");
  const pieGWrapper = svgObj.append('g')
    .attr('class','pieGWrapper')
    .style('max-height','900px');

  return {chartDiv, svgObj, pieGWrapper};
}

function setSVGDims(obj, w, h){
  obj.attrs({
    "width" : w,
    "height" : h
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

  second.forEach(function(d) { secondSet.add(d.religion); });

  var onlyFirst = first
    .filter(function(d){ return !secondSet.has(d.religion) })
    .map(function(d) { return {religion: d.religion, population: 0}; });

  var sortedMerge = d3.merge([ second, onlyFirst ])
    .sort(function(a, b) {
        return d3.ascending(a.religion, b.religion);
      });

  console.log('sortedMerge')
  console.log(sortedMerge)

  return sortedMerge;
}

function getPortionOfData(selectorVal) {

  let pieData;
  if(selectorVal === 'firstHalf'){
    pieData = myData.slice(0,5)
  }else{
    pieData = myData.slice(2,7)
  }

  //SORT the selection by religion population
  var sortedData = pieData.sort(function(a, b) {
      return d3.ascending(a.religion, b.religion);
    });

  return sortedData;
}

function getSlicePaths(parent, className, pieFn, data, k){
  return parent.select(className)
  .selectAll("path")
  .data(pieFn(data), k);
}

function clickBtnFn(){
    let thisData = getPortionOfData(this.value);
    console.log('thisData')
    console.log(thisData)
  update(thisData)
}

function update(data) {

    var duration = 1000;

    var oldData = svgObj.select(".pieGWrapper")
      .selectAll("path")
      .data().map(function(d) { 
        console.log('mapping oldData d')
        console.log(d)
        return d.data });

    if (oldData.length == 0) oldData = data;

    var prevData = mergeWithFirstEqualZero(data, oldData);
    var newDataWithZeros = mergeWithFirstEqualZero(oldData, data);

    let oldSlice = getSlicePaths(svgObj, ".pieGWrapper", pie,prevData, pieSliceKeyName)

    oldSlice.enter()
      .insert("path")
      .attr("class", "singleSlice")
      .style("fill", function(d) { 
        console.log('fill d')
        console.log(d)
        return colorScale(d.data.religion); })
      .each(function(d) {
          this._current = d;
        });

    let newSlicesWithZeros = getSlicePaths(svgObj, ".pieGWrapper", pie,newDataWithZeros, pieSliceKeyName)

    newSlicesWithZeros.transition()
      .duration(duration)
      .attrTween("d", function(d) {
          var interpolate = d3.interpolate(this._current, d);
          var curSlice = this;
          return function(t) {
              curSlice._current = interpolate(t);
              return arc(curSlice._current);
            };
        });

    let newSlicesNoZeros = getSlicePaths(svgObj, ".pieGWrapper", pie,data, pieSliceKeyName)

    newSlicesNoZeros.exit()
      .transition()
      .delay(duration)
      .duration(0)
      .remove();
};

//1. Data array
var myData = [
  {
    "religion": "Christian",
    "population": 0
  },
  {
    "religion": "Muslim",
    "population": 15
  },
  {
    "religion": "Unaffiliated",
    "population": 11
  },
  {
    "religion": "Hindu",
    "population": 10
  },
  {
    "religion": "Buddhist",
    "population": 48
  },
  {
    "religion": "Folk Religions",
    "population": 40
  },
  {
    "religion": "Other Religions",
    "population": 57
  },
  {
    "religion": "Jewish",
    "population": 13
  }
];


//2. array of keys used in colorScale domain
//CAN/SHOULD be re-done
var keys = [
  "Christian"
  , "Muslim"
  , "Unaffiliated"
  , "Hindu"
  , "Buddhist"
  , "Fold Religions"
  , "Other Religions"
  , "Jewish"
  ];

//3. set arbirtary h/w/radius vals
var width = 350,
  height = 350,
  radius = Math.min(width, height) / 2;

//4. make d3 elements
let {chartDiv, svgObj, pieGWrapper} = makeD3ElementsFromParentDiv('chartDiv');
   
//5. Update svg & pieWrapper dimensions & transf 
svgObj
  .attr("width", width)
  .attr("height", height)
  .attr('class', 'svgWrapper')

pieGWrapper
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  .attr("class", "pieGWrapper");

//6. make pie fn
var pie = d3.pie()
  .sort(null)
  .value(function(d) {
    return d.population;
  });

//7. make arc fn 
var arc = d3.arc()
  .outerRadius(radius * 1.0)
  .innerRadius(50);

//8. make pie-slice-name value
var pieSliceKeyName = function(d) { return d.data.religion; };

//9. make colorScale
var colorScale = d3.scaleOrdinal(d3.schemePastel2).domain(keys);

//10. UPDATE the chart with the 'firstHalf' of the data
update(getPortionOfData('firstHalf'));

//was used for fancy 'auto-updating' pie
// var inter = setInterval(function() {
//     update(getPortionOfData());
//   }, 3000);

//11. make onClick for radio buttons
d3.selectAll("input[name='dataset']").on("change", clickBtnFn);