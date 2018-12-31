function prepData(data){
    let obj = {};
    for (var coin in data) {
        if (!data.hasOwnProperty(coin)) {
            continue;
        }
        obj[coin] = data[coin].filter(function(d){
            return !(d["price_usd"] == null)
        })
        obj[coin].forEach(function(d){
            d["price_usd"] = +d["price_usd"];
            d["24h_vol"] = +d["24h_vol"];
            d["market_cap"] = +d["market_cap"];
            d["date"] = state.parseTime(d["date"])
        });
    }
    return obj;
}

let state = {
    activeCoin: null,
    filteredData: {},
    charts:{
        pie:{},
        line:{}
    },
    parseTime: d3.timeParse("%d/%m/%Y"),
    formatTime: d3.timeFormat("%d/%m/%Y"),
    yVariable: null,
    yScales: {
        bitcoin: d3.scaleLinear(),
        ethereum: d3.scaleLinear(),
        bitcoin_cash: d3.scaleLinear(),
        litecoin: d3.scaleLinear(),
        ripple: d3.scaleLinear(),
    },
    xScales: {
        bitcoin: d3.scaleTime(),
        ethereum: d3.scaleTime(),
        bitcoin_cash: d3.scaleTime(),
        litecoin: d3.scaleTime(),
        ripple: d3.scaleTime(),
    },
    sliderVals: null,
    bitData: null, 
    ethData: null, 
    bitCashData: null, 
    liteData: null, 
    ripData: null,
    margin:{
        pie:{ t:40, r:0, b:0, l:0 }
    }
}

// Global variables
var lineChart,
    donutChart1,
    donutChart2;
var filteredData = {};
var donutData = [];
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
var color = d3.scaleOrdinal(d3.schemeDark2);

// Event listeners
$("#coin-select").on("change", function() { 
    coinChanged();
})
$("#var-select").on("change", function() { lineChart.wrangleData() })

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        lineChart.wrangleData();
    }
});

function arcClicked(arc){
    state.activeCoin = arc.data.coin;    
    $("#coin-select").val(state.activeCoin);
    coinChanged();
}

function coinChanged(){
    donutChart1.updateDonut("#donut-area1", "24h_vol");
    donutChart2.updateDonut("#donut-area2", "market_cap");
    lineChart.wrangleData();
}

d3.json("data/data.json").then(function(data){
    // Prepare and clean data
    for (var coin in data) {
        if (!data.hasOwnProperty(coin)) {
            continue;
        }
        state.filteredData[coin] = data[coin].filter(function(d){
            return !(d["price_usd"] == null)
        })
        state.filteredData[coin].forEach(function(d){
            d["price_usd"] = +d["price_usd"];
            d["24h_vol"] = +d["24h_vol"];
            d["market_cap"] = +d["market_cap"];
            d["date"] = parseTime(d["date"])
        });
        donutData.push({
            "coin": coin,
            "data": state.filteredData[coin].slice(-1)[0]
        })
    }

    lineChart = new LineChart("#line-area");

    donutChart1 = new DonutChart("#donut-area1", "24h_vol");
    donutChart2 = new DonutChart("#donut-area2", "market_cap");

})