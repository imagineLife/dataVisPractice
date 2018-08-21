const v = {
    margins : { 
        left:80,
        right:20,
        top:50,
        bottom:175
    },
    flag : true
}


const width = 800 - v.margins.left - v.margins.right,
    height = 600 - v.margins.top - v.margins.bottom;

function makeButtonsFromTownNames(towns){
    d3.select("body")
    .selectAll("input")
    .data(towns)
    .enter()
        .append("input")
        .attrs({
            "type":"button",
            "class": "townButton",
            "value": d => d
        })
        .on('click', (d) => update(dataSourceData, d))

}

function makeAxisGroup(parent, className, transformation){
    return parent.append("g")
    .attrs({
        "class": className,
        "transform": transformation
    });
}

function makeAxisLabel(parent, x, y, transformation, textVal){
    return parent.append("text")
    .attrs({
        "x": x,
        "y": y,
        "font-size": "20px",
        "text-anchor": "middle",
        "transform": transformation
    })
    .text(textVal);
}

let chartDiv = document.getElementById("chart-area")
var svgObj = d3.select(chartDiv)
    .append("svg")
    .attr("class", 'svgWrapper');
var chartG =svgObj.append("g")
        .attr("transform", "translate(" + v.margins.left + ", " + v.margins.top + ")")
        .attr("class", 'chartG');


// Extract the width and height that was computed by CSS.
      let resizedWidth = chartDiv.clientWidth;
      let resizedHeight = chartDiv.clientHeight;
      const widthLessMargins = resizedWidth - v.margins.left - v.margins.right;
      const heightLessMargins = resizedHeight - v.margins.top - v.margins.bottom;
      console.log('resizedWidth')
      console.log(resizedWidth)
      console.log('- - - - -')

      svgObj.attrs({
        "width": resizedWidth + v.margins.left + v.margins.right,
        "height": resizedHeight + v.margins.top + v.margins.bottom,
      })

var xAxisGroup = makeAxisGroup(chartG, 'x axis', `translate(0, ${heightLessMargins})` )
var yAxisGroup = makeAxisGroup(chartG, 'y axis', `translate(0, 0)` )

//make axis labels
let yLabel = makeAxisLabel(chartG, -(heightLessMargins / 2), (-60), "rotate(-90)")
let xLabel = makeAxisLabel(chartG, (widthLessMargins / 2), (heightLessMargins + 100), "")

// X Scale
var xScale = d3.scaleBand().range([0, widthLessMargins]).padding(0.1);

// Y Scale
var yScale = d3.scaleLinear().range([heightLessMargins, 0]);

let dataSourceData;

d3.json("data/top5EUE.json").then(function(data){

    dataSourceData = data;
    // Clean data
    data.forEach(function(d) {
        d.white = +d.White;
        d.whiteAndHispanic = +d.WhiteAndHispanic;
        d.AfricanAmericans = +d.AfricanAmericans;
        d.AmericanIndianAndAlaskaNative = +d.AmericanIndianAndAlaskaNative;
        d.Asian = +d.Asian;
        d.Other = +d.Other;
        d.twoOrMore = +d['2+Races'];
        d.HispanicLatino = +d.HispanicLatino;
        d.percentBelow = +d.PercentBelow;
        d.men = +d.BPMen;
        d.women = +d.BPWomen;
    });

    //get town names into array
    let AllTownNames = data.map((d) => { 
        return d.geo
    })

    makeButtonsFromTownNames(AllTownNames)
    // Run the vis for the first time
    update(data, 'Central Falls');
});

function update(data, townName) {

    let selectedTownObj = data.filter((town) => town.geo === townName)
    let selectedBarData = {
        'African American': +selectedTownObj[0].AfricanAmericans,
        'American Indian & Alaska Native': +selectedTownObj[0].AmericanIndianAndAlaskaNative,
        'Asian': +selectedTownObj[0].Asian,
        'Hispanic of Latino': +selectedTownObj[0].HispanicLatino,
        'Other': +selectedTownObj[0].Other,
        'Two Or More': +selectedTownObj[0].twoOrMore,
        'White': +selectedTownObj[0].White,
        'White And Hispanic' : +selectedTownObj[0].WhiteAndHispanic,
    }

    let raceKeys = Object.keys(selectedBarData)
    let raceVals = Object.values(selectedBarData)
    let mappedRaces = raceVals.map((v, i) => {
        return {
            race: raceKeys[i],
            val : v
        }
    })

    xScale.domain(raceKeys);

    //gathers the percentages and calc max
    //ADJUSTABLE y-Axis
    // yScale.domain([0, d3.max(mappedRaces, d => d.val )])
    yScale.domain([0, 60])

    // Update axis
    var xAxisD3Obj = d3.axisBottom(xScale);
    var yAxisD3Obj = d3.axisLeft(yScale)
        .tickFormat(d => `${d}%`);
    
    //transition the axis groups
    yAxisGroup.transition().duration(500).call(yAxisD3Obj);
    xAxisGroup.call(xAxisD3Obj);

    xAxisGroup.selectAll('.tick text')
        .attrs({
            'transform': 'rotate(-45)',
            'text-anchor': 'end',
            'alignment-baseline':'middle',
            'x': -5,
            'y': 15,
            'dy':0,
            'class' :'xTickLabel'
        })

    // JOIN new data with old elements.
    var rects = chartG.selectAll(".singleRect")
        .data(mappedRaces, (d) => d.race).attr('fill','darkkhaki');
    // EXIT old elements not present in new data.
    // ENTER new elements
    let exitData = rects.exit();
    let enterData = rects.enter();

    // exitData
    rects.exit()
        // .attr("fill", "darkkhaki")
    .transition().duration(700)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

    // ENTER new elements present in new data...
    // enterData
    rects.enter()
        .append("rect")
        .attrs({
            "fill": "darkkhaki",
            "x": (d, i) => xScale(d.race), 
            "width": xScale.bandwidth,
            "y": (d) => yScale(d.val),
            "height": (d) => heightLessMargins - yScale(d.val),
            'class': 'singleRect',
            'id': (d) => d.race
        })
        .transition().duration(700) 


        // MERGE AND UPDATE NEW data with 
        // already-present elements present in new data.
        rects.merge(rects)
        .transition().duration(700)
            .attrs({
                "x": (d, i) => xScale(d.race), 
                "width": xScale.bandwidth,
                "y": (d) => yScale(d.val),
                "height": (d) => height - yScale(d.val),
                'class': 'singleRect',
                'id': (d) => d.race
            })
    yLabel.text('Percent At Or Below Poverty');
    xLabel.text(townName);

}