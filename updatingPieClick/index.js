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


const pieWedgeValue = d => d.value;

var keys = [
  "White"
  , "Unknown"
  , "Black or African American"
  , "American Indian or Alaska Native"
  , "Asian"
  , "Native Hawaiian or Other Pacific Islander"];

var width = 250,
  height = 250,
  radius = Math.min(width, height) / 2;

var {chartDiv, svgObj, pieGWrapper} = makeD3ElementsFromParentDiv('chartDiv');

setSVGDims(svgObj, width, height);
pieGWrapper.attr("transform", `translate(${width / 2} , ${height / 2})`)
    
//pie & arc functions
const { d3PieFunc, arcFunc } = makeD3PieFuncs(pieWedgeValue, radius)

var key = function(d) { return d.data.label; };

const colorScale = d3.scaleOrdinal().range(d3.schemePastel1);
colorScale.domain(keys);

update(makeData());

var inter = setInterval(function() {
    update(makeData());
  }, 3000);


function mergeWithFirstEqualZero(first, second){

  var secondSet = d3.set();

  second.forEach(function(d) { secondSet.add(d.label); });

  var onlyFirst = first
    .filter(function(d){ return !secondSet.has(d.label) })
    .map(function(d) { return {label: d.label, value: 0}; });

  var sortedMerge = d3.merge([ second, onlyFirst ])
    .sort(function(a, b) {
      return d3.ascending(a.label, b.label);
    });

  return sortedMerge;
}

function makeData() {

  var data = Array();

  for (i = 0; i < keys.length; i++) {
    if (Math.random() < 0.7) {
      var ob = {};
      ob["label"] = keys[i];
      ob["value"] = randomCount(1, 100);
      data.push(ob);
    }
  }

  var sortedData = data.sort(function(a, b) {
      return d3.ascending(a.label, b.label);
    });

  // console.log('MAKE DATA returning...')
  // console.log(sortedData)
  // console.log('- - - -')
  return sortedData;
}

function update(data) {
	// console.log('updating with data -->')
	// console.log(data)
	// console.log('- - - - -')

    var duration = 700;

    var oldData = svgObj.select(".pieGWrapper")
      .selectAll("path")
      .data().map(d => d.data );

    if (oldData.length == 0) oldData = data;

    var prevData = mergeWithFirstEqualZero(data, oldData);

    var fnDataWithZeros = mergeWithFirstEqualZero(oldData, data);

    let prevArcs = d3PieFunc(prevData);
    let curArcs = d3PieFunc(fnDataWithZeros);

    var prevSlices = svgObj.select(".pieGWrapper")
      .selectAll("path")
      .data(prevArcs, (d) => d[key]);

    prevSlices.enter()
      .insert("path")
      .attr("class", "singleSlice")
      .style("fill", (d) => colorScale(d.data.label) )
      .each(function(d) {
          this._current = d;
        });

    newSlices = svgObj.select(".pieGWrapper")
      .selectAll("path")
      .data(d3PieFunc(fnDataWithZeros), key);

    newSlices.transition()
      .duration(duration)
      .attrTween("d", function(d) {
          var interpolate = d3.interpolate(this._current, d);
          var _this = this;
          return function(t) {
              _this._current = interpolate(t);
              return arcFunc(_this._current);
            };
        });

    removingExtraSlices = svgObj.select(".pieGWrapper")
      .selectAll("path")
      .data(d3PieFunc(data), key);

    removingExtraSlices.exit()
      .transition()
      .delay(duration)
      .duration(0)
      .remove();
};