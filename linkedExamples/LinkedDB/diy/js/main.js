var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

let state = {
    dropdownVal : 'call_revenue',
    colorScale: d3.scaleOrdinal(d3.schemePastel1),
    dataCalls : null,
    stackedAreaG: null
}

d3.json("data/data.json").then(function(data){    
    
    data.map(function(d){
        d.call_revenue = +d.call_revenue
        d.units_sold = +d.units_sold
        d.call_duration = +d.call_duration
        d.date = parseTime(d.date)
        return d
    })

    dataCalls = data;

    filteredCalls = data;

    nestedCalls = d3.nest()
        .key(function(d){
            return d.category;
        })
        .entries(filteredCalls)

    donut = new DonutChart("#company-size")

    revenueBar = new BarChart("#revenue", "call_revenue", "Average call revenue (USD)")
    durationBar = new BarChart("#call-duration", "call_duration", "Average call duration (seconds)")
    unitBar = new BarChart("#units-sold", "units_sold", "Units sold per call")

    stackedArea = new StackedAreaChart("#stacked-area")

    timeline = new Timeline("#timeline")

    $("#var-select").on("change", function(e){
        
        state.dropdownVal = ($(this).children("option:selected").val());
        
        stackedArea.updateVis(state.dropdownVal, state.colorScale);
    })
})



function brushed() {
    var selection = d3.event.selection || timeline.x.range();
    var newValues = selection.map(timeline.x.invert)
    changeDates(newValues)
}

function changeDates(values) {
    filteredCalls = dataCalls.filter(function(d){
        return ((d.date > values[0]) && (d.date < values[1]))
    })
    
    nestedCalls = d3.nest()
        .key(d => d.category)
        .entries(filteredCalls)

    $("#dateLabel1").text(formatTime(values[0]))
    $("#dateLabel2").text(formatTime(values[1]))

    donut.wrangleData();
    revenueBar.wrangleData();
    unitBar.wrangleData();
    durationBar.wrangleData();
    stackedArea.updateVis(state.dropdownVal, state.colorScale);
}