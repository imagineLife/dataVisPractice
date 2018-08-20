const v = {
    margins : { 
        left:80,
        right:20,
        top:50,
        bottom:120
    },
    flag : true
}


const width = 800 - v.margins.left - v.margins.right,
    height = 600 - v.margins.top - v.margins.bottom;

// var t = d3.transition().duration(3000);

function makeAxisGroup(parent, className, transformation){
    return parent.append("g")
    .attr("class", className)
    .attr("transform", transformation);
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

var svgObj = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + v.margins.left + v.margins.right)
        .attr("height", height + v.margins.top + v.margins.bottom)
    .append("g")
        .attr("transform", "translate(" + v.margins.left + ", " + v.margins.top + ")");

var xAxisGroup = makeAxisGroup(svgObj, 'x axis', `translate(0, ${height})` )
var yAxisGroup = makeAxisGroup(svgObj, 'y axis', `translate(0, 0)` )

//make axis labels
let yLabel = makeAxisLabel(svgObj, -(height / 2), (-60), "rotate(-90)")
let xLabel = makeAxisLabel(svgObj, (width / 2), (height + 100), "")

// X Scale
var xScale = d3.scaleBand().range([0, width]).padding(0.1);

// Y Scale
var yScale = d3.scaleLinear().range([height, 0]);

d3.json("data/top5EUE.json").then(function(data){

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

    // Run the vis for the first time
    update(data, 'CentralFalls');
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

    xScale.domain(raceKeys);

    //gathers the percentages and calc max
    yScale.domain([0, d3.max(raceVals, d => d )])

    // Update axis
    var xAxisD3Obj = d3.axisBottom(xScale);
    var yAxisD3Obj = d3.axisLeft(yScale)
        .tickFormat(d => `${d}%`);
    
    //transition the axis groups
    yAxisGroup.transition().duration(1000).call(yAxisD3Obj);
    xAxisGroup.transition().duration(1000).call(xAxisD3Obj);

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
    var rects = svgObj.selectAll("rect")
        .data(raceVals, d => d).attr('fill','grey');

    // EXIT old elements not present in new data.
    // ENTER new elements
    let exitData = rects.exit();
    let enterData = rects.enter();

    exitData
        .attr("fill", "red")
    .transition().duration(1000)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

    // ENTER new elements present in new data...
    enterData
        .append("rect")
        .attrs({
            "fill": "darkkhaki",
            "y": yScale(0),
            "height": 0,
            "x": (d, i) => xScale(raceKeys[i]),
            "width": xScale.bandwidth  
        })

        // MERGE AND UPDATE NEW data with 
        // already-present elements present in new data.
        .merge(rects)
        .transition().duration(1000)
            .attrs({
                "x": (d, i) => xScale(raceKeys[i]), 
                "width": xScale.bandwidth,
                "y": (d) => yScale(d),
                "height": (d) => height - yScale(d)
            })
    var label = 'Percent At Or Below Poverty';
    yLabel.text(label);
    xLabel.text(townName);

}
