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
    }

}

let bitData, ethData, bitCashData, liteData, ripData;

// Event listeners
$("#coin-select").on("change", () => {
    updateVis(bitData)
    updateVis(ethData)
    updateVis(bitCashData)
    updateVis(liteData)
    updateVis(ripData)   
})
$("#var-select").on("change", () => {
    updateVis(bitData)
    updateVis(ethData)
    updateVis(bitCashData)
    updateVis(liteData)
    updateVis(ripData)   
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
        updateVis(bitData, newVals)
        updateVis(ethData, newVals)
        updateVis(bitCashData, newVals)
        updateVis(liteData,newVals)
        updateVis(ripData,newVals)
    }
});

d3.json("data/data.json").then(function(data){

    state.filteredData = prepData(data)
    bitData = {bitcoin: state.filteredData.bitcoin};
    ethData = {ethereum: state.filteredData.ethereum};
    bitCashData = {bitcoin_cash: state.filteredData.bitcoin_cash};
    liteData = {litecoin: state.filteredData.litecoin};
    ripData = {ripple: state.filteredData.ripple};

    state.chart1 = new LineChart("#chart-area1", bitData);
    state.chart2 = new LineChart("#chart-area2", ethData);
    state.chart3 = new LineChart("#chart-area3", bitCashData);
    state.chart4 = new LineChart("#chart-area4", liteData);
    state.chart5 = new LineChart("#chart-area5", ripData);

})