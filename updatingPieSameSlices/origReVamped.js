function makeD3ElementsFromParentDiv(parendDivID){
  const chartDiv = document.getElementById(parendDivID);        
  const svgObj = d3.select(chartDiv).append("svg");
  const pieGWrapper = svgObj.append('g')
    .attr('class','pieGWrapper')
    .style('max-height','900px');

  return {chartDiv, svgObj, pieGWrapper};
}

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

svgObj.attrs({
  "width": width,
  "height": height
})

pieGWrapper.attrs({
  "transform": `translate( ${width / 2} , ${height / 2})`,
  'class': 'slices'
})

var pie = d3.pie()
  .sort(null)
  .value(function(d) {
    return d.value;
  });

var arc = d3.arc()
  .outerRadius(radius * 1.0)
  .innerRadius(radius * 0.0);

// var outerArc = d3.arc()
//   .innerRadius(radius * 0.5)
//   .outerRadius(radius * 1);

var key = function(d) { return d.data.label; };

var color = d3.scaleOrdinal(d3.schemePastel1)
    .domain(keys);

update(makeData());

var inter = setInterval(function() {
    update(makeData());
  }, 2000);

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

  return sortedData;
}

function randomCount(min, max) {

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function update(data) {

    var duration = 500;

    var oldData = svgObj.select(".slices")
      .selectAll("path")
      .data().map(function(d) { return d.data });

    if (oldData.length == 0) oldData = data;

    var was = mergeWithFirstEqualZero(data, oldData);
    var is = mergeWithFirstEqualZero(oldData, data);

    var slice = svgObj.select(".slices")
      .selectAll("path")
      .data(pie(was), key);

    slice.enter()
      .insert("path")
      .attr("class", "slice")
      .style("fill", function(d) { return color(d.data.label); })
      .each(function(d) {
          this._current = d;
        });

    slice = svgObj.select(".slices")
      .selectAll("path")
      .data(pie(is), key);

    slice.transition()
      .duration(duration)
      .attrTween("d", function(d) {
          var interpolate = d3.interpolate(this._current, d);
          var _this = this;
          return function(t) {
              _this._current = interpolate(t);
              return arc(_this._current);
            };
        });

    slice = svgObj.select(".slices")
      .selectAll("path")
      .data(pie(data), key);

    slice.exit()
      .transition()
      .delay(duration)
      .duration(0)
      .remove();
};