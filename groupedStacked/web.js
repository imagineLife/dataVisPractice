//dummy data
var dummy_data = 
    [{
      "month": "november",
      "year": {
        "2015": {
          "item1": 2500,
          "item2": 3500,
          "item3": 4500
        },
        "2016": {
          "item1": 2300,
          "item2": 3200,
          "item3": 4100
        }
      }
    }, {
      "month": "december",
      "year": {
        "2015": {
          "item1": 2500,
          "item2": 3500,
          "item3": 4500
        },
        "2016": {
          "item1": 2300,
          "item2": 3200,
          "item3": 4100
        }
      }
    }, {
      "month": "january",
      "year": {
        "2015": {
          "item1": 2500,
          "item2": 3500,
          "item3": 4500
        },
        "2016": {
          "item1": 2300,
          "item2": 3200,
          "item3": 4100
        }
      }
    },{
      "month": "february",
      "year": {
        "2015": {
          "item1": 2500,
          "item2": 3500,
          "item3": 4500
        },
        "2016": {
          "item1": 2300,
          "item2": 3200,
          "item3": 4100
        }
      }
    }]
    
var
		//prepare initial stuff
		margin = {top: 20, right: 20, bottom: 80, left: 20},
    chart = d3.select('#chartDiv'),
    width = +chart.style('width').replace('px', '') - margin.left - margin.right,
    height = +chart.style('height').replace('px', '') - margin.top - margin.bottom,
    svg = chart
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),


    stripedPattern = (function(){
      for(let i = 0; i < dummy_data.length; i++){
        //implement checker: check for real month
        if(dummy_data[i].month==='february'){
          return {monthName: 'february'};
        }
      }
    })(),

    //d3 scale stuff
    x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1),
    x1 = d3.scale.ordinal(),
    y = d3.scale.linear().range([height, 0]),
    yBegin,

    //fetch the column headers
    itemLookup= dummy_data[0],
    years = d3.keys(itemLookup.year),
    items = d3.keys(itemLookup.year[years[0]]),
    columnHeaders = [],
    innerColumns = (function(){
      var result = {};
      for(let i = 0; i < years.length; i++){
        var holder = [];
        for(var j = 0, jj = items.length; j<jj; j++){
          columnHeaders.push(items[j]+'-'+years[i]);
          holder.push(items[j]+'-'+years[i]);
          result[years[i]] = holder;
        }
      }
      return result;
    })(),

    //holder for the data obj rebuild
    dataByMonthGroup = [];

    console.log('%c - - - -', 'background-color: yellow; color: black;')
    console.log('dummy_data')
    console.log(dummy_data) 
    console.log('years')
    console.log(years)
    console.log('items')
    console.log(items)
    console.log('columnHeaders')
    console.log(columnHeaders)
    console.log('innerColumns')
    console.log(innerColumns)
    console.log('%c - - DONE - -', 'background-color: yellow; color: black;')
    
    
    

dummy_data.forEach((d, i) => {
  var tempData = {},
      curYear;
  tempData.monthName = d.month;
  if(d.month === stripedPattern.monthName){
    chart
      .select('svg')
      .append('defs');
  }
  for(var key in d.year){
    if(curYear != key){
      curYear = key;
      tempData['totalValue-'+curYear] = 0;
    }
    var holder = d.year[key];
    for(var item in holder){
      tempData[item+'-'+key] = holder[item];
      tempData['totalValue-'+curYear] += parseInt(holder[item]);
    }
  }
  dataByMonthGroup.splice(i, 0, tempData);
});


console.log('dataByMonthGroup')
console.log(dataByMonthGroup)

//refactor needed
dataByMonthGroup.forEach(function(d) {
  var yColumn = new Array();
  d.columnDetails = columnHeaders.map(name => {
    for (var ic in innerColumns) {
      if($.inArray(name, innerColumns[ic]) >= 0){
        if (!yColumn[ic]){
          yColumn[ic] = 0;
        }
        yBegin = yColumn[ic];
        yColumn[ic] += +d[name];
        return {
          name: (function(){
            var n = name.indexOf('-');
            return name.substring(0, n != -1 ? n : name.length);
          })(),
          value: +d[name],
          year: ic,
          yBegin: yBegin,
          yEnd: +d[name] + yBegin
        };
      }
    }
  });

  d.total = d3.max(d.columnDetails, d => d.yEnd);

});

let xDom = dataByMonthGroup.map(d => d.monthName)
let x1Dom = d3.keys(innerColumns)
let yDom = [0, d3.max(dataByMonthGroup, d => d.total)]

console.log('xDom')
console.log(xDom)
console.log('x1Dom')
console.log(x1Dom)
console.log('yDom')
console.log(yDom)


x0.domain(xDom);
x1.domain(x1Dom).rangeRoundBands([0, x0.rangeBand()],.01,0);
y.domain(yDom);

/*
  Bar Groups
*/
var barGroups = svg.selectAll(".month-col")
.data(dataByMonthGroup)
.enter().append('g')
.attr({
  //styling
  'class': d => `month-col ${d.monthName}`,
  'transform': d => `translate(${x0(d.monthName) },0)`
});

var bars = barGroups.selectAll("rect")
  .data(d => d.columnDetails);

bars
  .enter().append("rect")
  .attr({
  //coords
  'x': d => x1(d.year)+1,
  'y': height,

  //style
  'width': x1.rangeBand(),
  'height': 0,
  'fill': (d,i) => d3.scale.category20c().range()[i+1],
  'class': 'item'
});

bars
  // .transition()
  // .duration(1000)
  .attr({
    'y': d => y(d.yEnd),
    'height': d => y(d.yBegin) - y(d.yEnd) - 1
});

//legend items
svg.selectAll(".month-col")
  .data(dataByMonthGroup)
  .append('g')
  .attr({
    'class': 'legend-item',

    'text-anchor': 'middle',
    'transform': 'translate('+svg.select('.item').attr('width')+','+parseInt(height+margin.top)+')'
  })
  .append('text')
  .text(d => d.monthName);

//events
var tooltip = d3.select('body')
.append('div')
.attr('class','stacked-bar-chart-tooltip stacked-bar-chart-tooltip-hidden');

var
mouseEventMove = function () {
  var item = d3.select(this);
  return tooltip
    .style({
    'top': (d3.event.pageY) - 10 + 'px',
    'right': (window.innerWidth - d3.event.pageX) + 10 + 'px',

    'border-color': item.attr('fill')
  })
    .classed('stacked-bar-chart-tooltip-hidden', false)
    .html(item.attr('data-name')+'('+item.attr('data-year')+'): '+item.attr('data-value'));
},
    mouseEventOut = function (){
      return tooltip.classed('stacked-bar-chart-tooltip-hidden', true);
    };

svg.selectAll('.item')
  .on('mousemove', mouseEventMove)
  .on('mouseout', mouseEventOut);






