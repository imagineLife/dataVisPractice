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
            d["coin"] = coin;
        });
    }

    let coins = Object.keys(data)
    
    coins.forEach(c => {
        
        let thisObj = {
            "coin" : c,
            "data": data[c].slice(-1)[0]
        }
        
        state.donutData.push(thisObj)

    })

    return obj;
}

let state = {
    activeCoin: null,
    filteredData: {},
    charts:{
        pie:{},
        line:{}
    },
    donutData: [],
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
    coinData: {
        bitcoin: null, 
        bitcoin_cash: null, 
        ethereum: null,
        litecoin: null, 
        ripple: null,
    },
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
var colorScale = d3.scaleOrdinal(d3.schemeDark2);

// Event listeners
$("#coin-select").on("change", function(e) { 
    state.activeCoin = ($(this).children("option:selected").val())
    donutChart1.updateVis("donut-area1", "24h_vol");
    updateLine(state.filteredData[state.activeCoin], $("#date-slider").slider("values"))
    
})
$("#measurement-select").on("change", function() { 
    state.yVariable = ($(this).children("option:selected").val());
    // donutChart1.updateVis("donut-area1", "24h_vol");
    updateLine(state.filteredData[state.activeCoin], $("#date-slider").slider("values"))
})

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        //set state slider vals
        // state.sliderVals = $("#date-slider").slider("values");

        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        updateLine(state.filteredData[state.activeCoin], $("#date-slider").slider("values"))
    }
});

function arcClicked(arc){
    
    state.activeCoin = arc.data.coin;    
    $("#coin-select").val(state.activeCoin);
    

    donutChart1.updateVis("donut-area1", "24h_vol");
    // donutChart2.updateDonut("donut-area2", "market_cap");
    updateLine(state.filteredData[arc.data.coin], $("#date-slider").slider("values"))
}

d3.json("data/data.json").then(function(data){
    
    state.filteredData = prepData(data)
    
    //get & set stateful active coin name
    state.activeCoin = (state.activeCoin == null) ? $("#coin-select").val() : state.activeCoin;
    let curSelectedCoinData = state.filteredData[state.activeCoin]

    //get & set stateful active yVariable
    state.yVariable = (state.yVariable == null) ? $("#measurement-select").val() : state.yVariable;    
    
    // lineChart = new LineChart("#line-area");
    state.lineChart = initLine("#line-area", curSelectedCoinData);
    // state.donutChart1 = initDonut("#donut-area1", curSelectedCoinData);

    donutChart1 = new DonutChart("#donut-area1", "24h_vol");
    // donutChart2 = new DonutChart("#donut-area2", "market_cap");

})