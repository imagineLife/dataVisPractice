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
    lineChart1: null,
    lineChart2: null,
    lineChart3: null,
    lineChart4: null,
    lineChart5: null,
    parseTime: d3.timeParse("%d/%m/%Y"),
    formatTime: d3.timeFormat("%d/%m/%Y")
}

let bitData, ethData, bitCashData, liteData, ripData;

// Event listeners
$("#coin-select").on("change", () => {
    updateCharts;   
})
$("#var-select").on("change", () => {
    updateCharts;   
})

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: state.parseTime("31/10/2017").getTime(),
    min: state.parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [state.parseTime("12/5/2013").getTime(), state.parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        let newVals = $("#date-slider").slider("values");
        $("#dateLabel1").text(state.formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(state.formatTime(new Date(ui.values[1])));
        updateCharts(newVals);
    }
});

d3.json("data/data.json").then(function(data){

    state.filteredData = prepData(data)
    bitData = {bitcoin: state.filteredData.bitcoin};
    ethData = {ethereum: state.filteredData.ethereum};
    bitCashData = {bitcoin_cash: state.filteredData.bitcoin_cash};
    liteData = {litecoin: state.filteredData.litecoin};
    ripData = {ripple: state.filteredData.ripple};

    state.lineChart1 = new LineChart("#chart-area1", bitData);
    state.lineChart2 = new LineChart("#chart-area2", ethData);
    state.lineChart3 = new LineChart("#chart-area3", bitCashData);
    state.lineChart4 = new LineChart("#chart-area4", liteData);
    state.lineChart5 = new LineChart("#chart-area5", ripData);

})

function updateCharts(sliderTimeVals){
    updateVis(bitData, sliderTimeVals)
    updateVis(ethData, sliderTimeVals)
    updateVis(bitCashData, sliderTimeVals)
    updateVis(liteData,sliderTimeVals)
    updateVis(ripData,sliderTimeVals)
}