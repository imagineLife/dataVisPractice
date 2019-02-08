var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

d3.json("data/data.json").then(function(data){    
    
    data.map(function(d){
        d.call_revenue = +d.call_revenue
        d.units_sold = +d.units_sold
        d.call_duration = +d.call_duration
        d.date = parseTime(d.date)
        return d
    })

    allCalls = data;

    selectedCalls = data;

    nestedCalls = d3.nest()
        .key(function(d){
            return d.category;
        })
        .entries(selectedCalls)

    donut = new DonutChart("#company-size")

    revenueBar = new BarChart("#revenue", "call_revenue", "Average call revenue (USD)")
    durationBar = new BarChart("#call-duration", "call_duration", "Average call duration (seconds)")
    unitBar = new BarChart("#units-sold", "units_sold", "Units sold per call")

    stackedArea = new StackedAreaChart("#stacked-area")

    timeline = new Timeline("#timeline")

    $("#var-select").on("change", function(){
        stackedArea.initVis();
    })
})



function brushed() {
    var selection = d3.event.selection || timeline.x.range();
    var newValues = selection.map(timeline.x.invert)
    changeDates(newValues)
}

function changeDates(values) {
    selectedCalls = allCalls.filter(function(d){
        return ((d.date > values[0]) && (d.date < values[1]))
    })
    
    nestedCalls = d3.nest()
        .key(d => d.category)
        .entries(selectedCalls)

    $("#dateLabel1").text(formatTime(values[0]))
    $("#dateLabel2").text(formatTime(values[1]))

    donut.wrangleData();
    revenueBar.updateVis();
    unitBar.updateVis();
    durationBar.updateVis();
    stackedArea.initVis();
}