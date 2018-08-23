const v = {
    margins : { 
        left:80,
        right:20,
        top:10,
        bottom:200
    },
    flag : true
}

function makeButtonsFromTownNames(towns){
    d3.select("#chart-area")
    .selectAll("input")
    .data(towns)
    .enter()
        .append("input")
        .attrs({
            "type":"button",
            "class": "townButton",
            "value": d => d,
            display: 'block'
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

function makeAxisLabel(parent, x, y, transformation, textVal, cl){
    return parent.append("text")
    .attrs({
        "x": x,
        "y": y,
        "font-size": "20px",
        "text-anchor": "middle",
        "transform": transformation,
        'class': cl
    })
    .text(textVal);
}

let chartDiv = document.getElementById("chart-area");
var svgObj = d3.select(chartDiv)
    .append("svg")
    .attr("class",'svgWrapper');
var chartG =svgObj.append("g")
        .attr("transform", `translate(${v.margins.left},${v.margins.top})`)
        .attr("class", 'chartG');


// Extract the width and height that was computed by CSS.
      let resizedWidth = chartDiv.clientWidth;
      let resizedHeight = chartDiv.clientHeight - 50; //-50 for buttons!!
      let wLessM = resizedWidth - v.margins.left - v.margins.right;
      let hLessM = resizedHeight - v.margins.top - v.margins.bottom;
      console.log('resizedWidth')
      console.log(resizedWidth)
      console.log('- - -')

      svgObj.attrs({
        "width": resizedWidth,
        "height": resizedHeight,
      })

var xAxisGroup = makeAxisGroup(chartG, 'x axis', `translate(0, ${hLessM})` )
var yAxisGroup = makeAxisGroup(chartG, 'y axis', `translate(0, 0)` )

//make axis labels
let yLabel = makeAxisLabel(chartG, -(hLessM / 2), (-60), "rotate(-90)", '', 'YAxisLabel')
let xLabel = makeAxisLabel(chartG, (wLessM / 2), (hLessM + 100), "", '', 'XAxisLabel')

// X Scale
var xScale = d3.scaleBand().range([0, wLessM]).padding(0.1);

// Y Scale
var yScale = d3.scaleLinear().range([hLessM, 0]);

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
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).tickFormat(d => `${d}%`);
    
    //transition the y axis groups
    //ONLY animates with variable y axis domain
    yAxisGroup.transition().duration(500).call(yAxis);
    xAxisGroup.call(xAxis);

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
            "height": (d) => hLessM - yScale(d.val),
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
                "height": (d) => hLessM - yScale(d.val),
                'class': 'singleRect',
                'id': (d) => d.race
            })
    
    yLabel.text('Percent At Or Below Poverty');
    xLabel.text(townName);

}

function setXYTrans(obj, xPos, yPos, trans){
    return obj.attrs({
        'x': xPos,
        'y': yPos,
        'transform': trans
    })
}

function resize(){
    console.log('resizing!')
    // Extract the width and height that was computed by CSS.
      let resizedFnWidth = chartDiv.clientWidth;
      let resizedFnHeight = chartDiv.clientHeight - 50;
      let xAxis = d3.axisBottom(xScale);
      let yAxis = d3.axisLeft(yScale);
      let resizedWidthLessMargins = resizedFnWidth - v.margins.left - v.margins.right;
      let resizedHeightLessMargins = resizedFnHeight - v.margins.top - v.margins.bottom;
      let xAxisLabel = d3.select('.XAxisLabel')
      let yAxisLabel = d3.select('.YAxisLabel')
      svgObj.attrs({
        "width" : resizedFnWidth,
        "height" : resizedFnHeight
      });

    //Update scale RANGES
    xScale.range([0, resizedWidthLessMargins]);
    yScale.range([resizedHeightLessMargins, v.margins.top]);


    setXYTrans(xAxisGroup, (resizedWidthLessMargins / 2), (resizedHeight * .1), `translate(0, ${resizedHeightLessMargins})`);
    xAxisGroup.call(xAxis);
    
    setXYTrans(xAxisLabel, (resizedWidthLessMargins / 2), (resizedHeightLessMargins + 100), '');
    setXYTrans(yAxisGroup, (-resizedHeightLessMargins / 2), (-v.margins.left / 2));
    yAxisGroup.call(yAxis);

    setXYTrans(yAxisLabel, (-resizedHeightLessMargins / 2), (-60),'rotate(-90)');


      //Update Bars
      d3.selectAll('.singleRect').attrs({
        'x' : d => xScale(d.race),
        'y' : d => yScale(d.val),
        'width' : d => xScale.bandwidth(),
        'height' : d => resizedHeightLessMargins - yScale(d.val) 
      });
    

      yAxis.ticks(Math.max(resizedHeightLessMargins/80, 2))
}

    d3.select(window).on('resize', resize);