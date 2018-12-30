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
    filteredData: null,
    chart1: null,
    chart2: null,
    chart3: null,
    chart4: null,
    chart5: null,
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
    ripData: null
}

// Coin-Name Selector
$("#measurement-select").on("change", () => {

    state.yVariable = $("#measurement-select").val()

    updateVis(state.bitData, state.sliderVals)
    updateVis(state.ethData, state.sliderVals)
    updateVis(state.bitCashData, state.sliderVals)
    updateVis(state.liteData, state.sliderVals)
    updateVis(state.ripData, state.sliderVals)   
})

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: state.parseTime("31/10/2017").getTime(),
    min: state.parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [state.parseTime("12/5/2013").getTime(), state.parseTime("31/10/2017").getTime()],
    slide: function(event, ui){

        //set state slider vals
        state.sliderVals = $("#date-slider").slider("values");

        //set text of date-label above slider
        $("#dateLabel1").text(state.formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(state.formatTime(new Date(ui.values[1])));

        //trigger chart updating
        updateVis(state.bitData, state.sliderVals)
        updateVis(state.ethData, state.sliderVals)
        updateVis(state.bitCashData, state.sliderVals)
        updateVis(state.liteData,state.sliderVals)
        updateVis(state.ripData,state.sliderVals)
    }
});

d3.json("data/data.json").then(function(data){

    state.filteredData = prepData(data)
    state.bitData = {bitcoin: state.filteredData.bitcoin};
    state.ethData = {ethereum: state.filteredData.ethereum};
    state.bitCashData = {bitcoin_cash: state.filteredData.bitcoin_cash};
    state.liteData = {litecoin: state.filteredData.litecoin};
    state.ripData = {ripple: state.filteredData.ripple};

    state.chart1 = initVis("#chart-area1", state.bitData);
    state.chart2 = initVis("#chart-area2", state.ethData);
    state.chart3 = initVis("#chart-area3", state.bitCashData);
    state.chart4 = initVis("#chart-area4", state.liteData);
    state.chart5 = initVis("#chart-area5", state.ripData);

})