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

function update(data) {

    var duration = 1000;

    var oldData = svgObj.select(".pieGWrapper")
      .selectAll("path")
      .data().map(function(d) { 
        console.log('mapping oldData d')
        console.log(d)
        return d.data 
      });

    if (oldData.length == 0) oldData = data;

    var prevData = mergeWithFirstEqualZero(data, oldData);
    var newDataWithZeros = mergeWithFirstEqualZero(oldData, data);

    let oldSlice = getSlicePaths(svgObj, ".pieGWrapper", pie, prevData, pieSliceKeyName)

    oldSlice.enter()
      .insert("path")
      .attr("class", "singleSlice")
      .style("fill", d => {
       console.log('fill d')
        console.log(d)
        return colorScale(d.data.keyname)
      })
      .each(function(d) {
          this._current = d;
        });

    let newSlicesWithZeros = getSlicePaths(svgObj, ".pieGWrapper", pie, newDataWithZeros, pieSliceKeyName)

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
    "geo": "Central Falls",
    "White": 33.6,
    "WhiteAndHispanic": 33.6,
    "AfricanAmericans": 25.3,
    "AmericanIndianAndAlaskaNative": 17,
    "Asian": 10.2,
    "Other": 39.1,
    "2+Races": 32.3,
    "HispanicLatino": 36.3,
    "PercentBelow": 32.7,
    "BPMen": 3008,
    "BPWomen": 3188
  },
  {
    "geo": "Pawtucket",
    "White": 18.2,
    "WhiteAndHispanic": 18.2,
    "AfricanAmericans": 21.7,
    "AmericanIndianAndAlaskaNative": 5.8,
    "Asian": 15.4,
    "Other": 28.4,
    "2+Races": 20,
    "HispanicLatino": 32.4,
    "PercentBelow": 19.9,
    "BPMen": 6741,
    "BPWomen": 7366
  },
  {
    "geo": "Providence",
    "White": 25.4,
    "WhiteAndHispanic": 25.4,
    "AfricanAmericans": 28.9,
    "AmericanIndianAndAlaskaNative": 50.6,
    "Asian": 24.1,
    "Other": 32.6,
    "2+Races": 34.6,
    "HispanicLatino": 35.2,
    "PercentBelow": 28.2,
    "BPMen": 20682,
    "BPWomen": 25996
  },
  {
    "geo": "Woonsocket",
    "White": 24.1,
    "WhiteAndHispanic": 24.1,
    "AfricanAmericans": 40.3,
    "AmericanIndianAndAlaskaNative": 11.7,
    "Asian": 6.6,
    "Other": 57.7,
    "2+Races": 36.4,
    "HispanicLatino": 48.2,
    "PercentBelow": 25.1,
    "BPMen": 4841,
    "BPWomen": 5349
  },
  {
    "geo": "West Warwick",
    "White": 16.6,
    "WhiteAndHispanic": 16.6,
    "AfricanAmericans": 11.1,
    "AmericanIndianAndAlaskaNative": 0,
    "Asian": 11.5,
    "Other": 13.3,
    "2+Races": 20.1,
    "HispanicLatino": 30.6,
    "PercentBelow": 16.4,
    "BPMen": 2154,
    "BPWomen": 2536
  }
]


//2. array of keys used in colorScale domain
//CAN/SHOULD be re-done
var keys = ["Men", "Women"];

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

//was used for fancy 'auto-updating' pie
// var inter = setInterval(function() {
//     update(getPortionOfData());
//   }, 3000);

//11. make onClick for radio buttons
d3.selectAll("input[name='dataset']").on("change", clickBtnFn);