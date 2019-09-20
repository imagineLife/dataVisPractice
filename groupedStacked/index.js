//dummy data
var dummy_data = {
  data: [
    {
      "month": "november",
      "columnType": {
        "average": {
          "value": 75,
          "variance": 6
        },
        "current": {
          "value": 81,
        }
      }
    }, {
      "month": "december",
      "columnType": {
        "average": {
          "value": 72,
          "variance": 4
        },
        "current": {
          "value": 76
        }
      }
    }, {
      "month": "january",
      "columnType": {
        "average": {
          "value": 70
        },
        "current": {
          "value": 65,
          "variance": 5
        }
      }
    },{
      "month": "february",
      "columnType": {
        "average": {
          "value": 75,
          "variance": 3
        },
        "current": {
          "value": 78
        }
      }
    }
  ]
}
    
var
		//prepare initial stuff
    srcData = dummy_data.data,
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

    //d3 scale stuff
    x0 = d3.scaleBand().rangeRound([0, width]),
    x1 = d3.scaleBand(),
    y = d3.scaleLinear().range([height, 0]),
    yBegin,

    //fetch the column headers
    itemLookup= srcData[0],
    years = d3.keys(itemLookup.columnType),
    items = d3.keys(itemLookup.columnType[years[0]]),
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
    

srcData.forEach((d, i) => {
  var tempData = {},
      curYear;
  tempData.monthName = d.month;
  for(var key in d.columnType){
    if(curYear != key){
      curYear = key;
      tempData['totalValue-'+curYear] = 0;
    }
    var holder = d.columnType[key];
    for(var item in holder){
      tempData[item+'-'+key] = holder[item];
      tempData['totalValue-'+curYear] += parseInt(holder[item]);
    }
  }
  dataByMonthGroup.splice(i, 0, tempData);
});


// console.log('dataByMonthGroup')
// console.log(dataByMonthGroup)

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
          columnType: ic,
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

x0.domain(xDom);
x1.domain(x1Dom).rangeRound([0, (x0.bandwidth() * .5)]);
y.domain(yDom);

const bgdj = e => {
  let barGroups = e.append('g')
  .attrs({
    'class': d => `month-col ${d.monthName}`,
    'transform': d => `translate(${x0(d.monthName) },0)`
  });

  let bars = barGroups.selectAll('rect')
    .data(d => d.columnDetails).enter()
    .append("rect")
      .attrs({
        //coords
        'x': d => x1(d.columnType)+1,
        'width': x1.bandwidth(),
        'class': d => {
          return `item ${d.name} ${d.columnType}`
        },
        'y': d => y(d.yEnd) || 0,
        'height': d => (y(d.yBegin) - y(d.yEnd) - 1) || 0
      }).on('mousemove', d => mouseEventMove(d));

  let barLabels = barGroups.append('g')
  .attrs({
    'class': 'legend-item',
    'text-anchor': 'middle',
    'transform': 'translate('+svg.select('.item').attr('width')+','+parseInt(height+margin.top)+')'
  })
  .append('text')
  .text(d => d.monthName);
}
/*
  Bar Groups
*/
var barGroups = svg.selectAll(".month-col")
.data(dataByMonthGroup).join(bgdj)

//events
var tooltip = d3.select('body')
.append('div')
.attr('class','stacked-bar-chart-tooltip stacked-bar-chart-tooltip-hidden');

var
mouseEventMove = function(d){
  // var item = d3.select(this);
  return tooltip
    .styles({
    'top': (d3.event.pageY) - 10 + 'px',
    'right': (window.innerWidth - d3.event.pageX) + 10 + 'px',
    'border-color': 'black'
  })
  .attr('class', 'stacked-bar-chart-tooltip')
  // .classed('stacked-bar-chart-tooltip', false)
  .text(d.name+'('+d.columnType+')'+d.value)
},
  mouseEventOut = function (){
    return tooltip.attr('class', 'stacked-bar-chart-tooltip-hidden');
  };

svg.selectAll('.item')
  // .on('mousemove', mouseEventMove)
  .on('mouseout', mouseEventOut);