var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

let state = {
    dropdownVal : 'call_revenue',
    colorScale: d3.scaleOrdinal(d3.schemePastel1),
    dataCalls : null,
    stackedArea: null,
    saObj:{
        g: null,
        svg: null,
        xScale: d3.scaleTime(),
        yScale: d3.scaleLinear(),
        margins: { left:80, right:100, top:50, bottom:40 },
        h: 370,
        w: 800,
        yAxisObj: d3.axisLeft(),
        xAxisObj: d3.axisBottom().ticks(4),
        xAxisElm: null,
        yAxisElm: null,
        stackFn : d3.stack().keys(["west", "south", "northeast", "midwest"]),
        areaFn: d3.area()
            .x(d => state.saObj.xScale(parseTime(d.data.date)))
            .y0(d => state.saObj.yScale(d[0]))
            .y1(d => state.saObj.yScale(d[1]))
    },
    tlObj: {
        m: { top: 0, right: 100, bottom: 20, left: 80 }
    },
    nestedCalls : null,
    dataCalls: null,
    t: () => d3.transition().duration(1000),
}

const prepData = srcData => {

    state.srcData = srcData;

    srcData.map(d => {
        d.call_revenue = +d.call_revenue
        d.units_sold = +d.units_sold
        d.call_duration = +d.call_duration
        d.date = parseTime(d.date)
        return d
    })

    state.filteredCalls = srcData;
    
    let nestedCalls = d3.nest()
        .key(d => d.category)
        .entries(srcData)

    return { nestedCalls }
}

d3.json("data/data.json").then(data => {    
    
    let { nestedCalls } = prepData(data)

    state.nestedCalls = nestedCalls; 
    state.dataCalls = data;

    donut = new DonutChart("#company-size")

    revenueBar = new BarChart("#revenue", "call_revenue", "Average call revenue (USD)")
    durationBar = new BarChart("#call-duration", "call_duration", "Average call duration (seconds)")
    unitBar = new BarChart("#units-sold", "units_sold", "Units sold per call")

    state.stackedArea = new StackedAreaChart("#stacked-area")

    timeline = new Timeline("#timeline")

    $("#var-select").on("change", function(e){
        
        state.dropdownVal = ($(this).children("option:selected").val());
        
        updateStackedArea(state.dropdownVal, state.colorScale);
    })
})



function brushed() {
    var selection = d3.event.selection || timeline.x.range();
    var newValues = selection.map(timeline.x.invert)
    
    changeDates(newValues)
}

function changeDates(values) {
    state.filteredCalls = state.dataCalls.filter(d => ( (d.date > values[0]) && (d.date < values[1]) ))
    
    state.nestedCalls = d3.nest()
        .key(d => d.category)
        .entries(state.filteredCalls)

    $("#dateLabel1").text(formatTime(values[0]))
    $("#dateLabel2").text(formatTime(values[1]))

    donut.updateVis();
    revenueBar.wrangleData();
    unitBar.wrangleData();
    durationBar.wrangleData();
    updateStackedArea(state.dropdownVal, state.colorScale);
}