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
            d["date"] = parseTime(d["date"])
        });
    }
    return obj;
}

var filteredData;
var lineChart1,
    lineChart2,
    lineChart3,
    lineChart4,
    lineChart5;
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
let bitData, ethData, bitCashData, liteData, ripData;

// Event listeners
$("#coin-select").on("change", updateCharts)
$("#var-select").on("change", updateCharts)

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        let newVals = $("#date-slider").slider("values");
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        updateCharts(newVals);
    }
});

d3.json("data/data.json").then(function(data){

    filteredData = prepData(data)
    bitData = {bitcoin: filteredData.bitcoin};
    ethData = {ethereum: filteredData.ethereum};
    bitCashData = {bitcoin_cash: filteredData.bitcoin_cash};
    liteData = {litecoin: filteredData.litecoin};
    ripData = {ripple: filteredData.ripple};

    lineChart1 = new LineChart("#chart-area1", bitData);
    lineChart2 = new LineChart("#chart-area2", ethData);
    lineChart3 = new LineChart("#chart-area3", bitCashData);
    lineChart4 = new LineChart("#chart-area4", liteData);
    lineChart5 = new LineChart("#chart-area5", ripData);

})

function updateCharts(sliderTimeVals){
    wrangleData(bitData, sliderTimeVals)
    wrangleData(ethData, sliderTimeVals)
    wrangleData(bitCashData, sliderTimeVals)
    wrangleData(liteData,sliderTimeVals)
    wrangleData(ripData,sliderTimeVals)
}