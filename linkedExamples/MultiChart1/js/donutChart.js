const DonutChart = function(_parentElement, _variable){
    this.initVis(_parentElement, _variable);
};


const pieFn = d3.pie()
    .padAngle(0.03)
    .sort(null);

DonutChart.prototype.initVis = function(_parentElement,_variable){
    
    var vis = this;

    const width = 250 - state.margin.pie.l - state.margin.pie.r;
    const height = 250 - state.margin.pie.t - state.margin.pie.b;
    const pieRadius = Math.min(width, height) / 2;

    vis.arc = d3.arc()
        .innerRadius(pieRadius - 80)
        .outerRadius(pieRadius - 30);

    const svgObj = d3.select(_parentElement)
        .append("svg")
        .attrs({
            "width": width + state.margin.pie.l + state.margin.pie.r,
            "height": height + state.margin.pie.t + state.margin.pie.b,
            'class': `${_variable}SVGWrapper`
        });

    vis.g = svgObj.append("g")
        .attr("transform", `translate(${(state.margin.pie.l + (width / 2))},${(state.margin.pie.t + (height / 2))})`);

    vis.g.append("text")
        .attrs({
            "y": -height/2,
            "x": -width/2,
            "font-size": "15px",
            "text-anchor": "start"
        })
        .text(_variable == "market_cap" ? 
            "Market Capitalization" : "24 Hour Trading Volume");

    vis.updateDonut(_parentElement, _variable);
}

DonutChart.prototype.updateDonut = function(parent, pieVarTxt){
    var vis = this;
    
    if(state.activeCoin == null){
        state.activeCoin = $("#coin-select").val();
    }

    let thisSVG = d3.select(parent);
    let thisG = thisSVG.select('g')


    const piePaths = vis.g.selectAll("path");

    vis.data0 = piePaths.data();
    vis.data1 = pieFn.value(d => d.data[pieVarTxt])(donutData);

    // JOIN elements with new data.
    piePathsDataJoin = piePaths.data(vis.data1, key);
    
    // UPDATE elements still on the screen.
    piePathsDataJoin.transition()
        .duration(750)
        .attrTween("d", arcTween)
        .attr("fill-opacity", function(d) {
            return (d.data.coin == state.activeCoin) ? 1 : 0.3;
        })

    // ENTER new elements in the array.
    piePathsDataJoin.enter()
        .append("path")
        .each(function(d, i) { this._current = findNeighborArc(i, vis.data0, vis.data1, key) || d; }) 
        .attr("fill", function(d) {  return color(d.data.coin) })
        .attr("fill-opacity", function(d) {
            return (d.data.coin == state.activeCoin) ? 1 : 0.3;
        })
        .on("click", arcClicked)
        .transition()
        .duration(750)
            .attrTween("d", arcTween);

    function key(d){
        return d.data.coin;
    }

    function findNeighborArc(i, data0, data1, key) {
        var d;
        return (d = findPreceding(i, vis.data0, vis.data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
            : (d = findFollowing(i, vis.data0, vis.data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
            : null;
    }

    // Find the element in data0 that joins the highest preceding element in data1.
    function findPreceding(i, data0, data1, key) {
        var m = vis.data0.length;
        while (--i >= 0) {
            var k = key(vis.data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(vis.data0[j]) === k) return vis.data0[j];
            }
        }
    }

    // Find the element in data0 that joins the lowest following element in data1.
    function findFollowing(i, data0, data1, key) {
        var n = vis.data1.length, m = vis.data0.length;
        while (++i < n) {
            var k = key(vis.data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(vis.data0[j]) === k) return vis.data0[j];
            }
        }
    }

    function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(1)
        return function(t) { return vis.arc(i(t)); };
    }

}