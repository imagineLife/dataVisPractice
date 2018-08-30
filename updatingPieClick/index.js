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

function randomCount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  return sortedMerge;
}

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


let curDataSection = 0;
function makeData(selectorVal) {

  let pieData;
  if(selectorVal === 'firstHalf'){
    pieData = myData.slice(0,5)
  }else{
    pieData = myData.slice(2,7)
  }

  var sortedData = pieData.sort(function(a, b) {
      return d3.ascending(a.religion, b.religion);
    });

  return sortedData;
}

function randomCount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSlicePaths(parent, className, pieFn, data, k){
  return parent.select(className)
  .selectAll("path")
  .data(pieFn(data), k);
}

function clickBtnFn(){
  update(makeData(this.value))
}

var width = 250,
  height = 250,
  radius = Math.min(width, height) / 2;


let {chartDiv, svgObj, pieGWrapper} = makeD3ElementsFromParentDiv('chartDiv');
    
    svgObj
      .attr("width", width)
      .attr("height", height)
      .attr('class', 'svgWrapper')
  
    pieGWrapper
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .attr("class", "pieGWrapper");

var pie = d3.pie()
  .sort(null)
  .value(function(d) {
    return d.population;
  });

var arc = d3.arc()
  .outerRadius(radius * 1.0)
  .innerRadius(50);

var key = function(d) { return d.data.religion; };

var color = d3.scaleOrdinal(d3.schemeDark2).domain(keys);

update(makeData('firstHalf'));

// var inter = setInterval(function() {
//     update(makeData());
//   }, 3000);

d3.selectAll("input[name='dataset']").on("change", clickBtnFn);

function update(data) {

    var duration = 1000;

    var oldData = svgObj.select(".pieGWrapper")
      .selectAll("path")
      .data().map(function(d) { return d.data });

    if (oldData.length == 0) oldData = data;

    var prevData = mergeWithFirstEqualZero(data, oldData);
    var newDataWithZeros = mergeWithFirstEqualZero(oldData, data);

    let oldSlice = getSlicePaths(svgObj, ".pieGWrapper", pie,prevData, key)

    oldSlice.enter()
      .insert("path")
      .attr("class", "singleSlice")
      .style("fill", function(d) { return color(d.data.religion); })
      .each(function(d) {
          this._current = d;
        });

    let newSlicesWithZeros = getSlicePaths(svgObj, ".pieGWrapper", pie,newDataWithZeros, key)

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

    let newSlicesNoZeros = getSlicePaths(svgObj, ".pieGWrapper", pie,data, key)

    newSlicesNoZeros.exit()
      .transition()
      .delay(duration)
      .duration(0)
      .remove();
};