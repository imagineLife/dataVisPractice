const key = d => d.data.coin;

const DonutChart = function(_parentElement, _variable){
    this.updateDonut(_parentElement, _variable);
};

DonutChart.prototype.updateDonut = function(parent, pieVar){
    var vis = this;

    this.parentElement = parent;

    const width = 250 - state.margin.pie.l - state.margin.pie.r;
    const height = 250 - state.margin.pie.t - state.margin.pie.b;
    const pieRadius = Math.min(width, height) / 2;

    vis.pie = d3.pie()
        .padAngle(0.03)
        .value(d => d.data[pieVar])
        .sort(null);

    vis.arc = d3.arc()
        .innerRadius(pieRadius - 80)
        .outerRadius(pieRadius - 30);

    const svgObj = d3.select(vis.parentElement)
        .append("svg")
        .attrs({
            "width": width + state.margin.pie.l + state.margin.pie.r,
            "height": height + state.margin.pie.t + state.margin.pie.b,
            'class': `${pieVar}SVGWrapper`
        });

    let thisPieG = svgObj.append("g")
        .attrs({
            "transform": `translate(${(state.margin.pie.l + (width / 2))},${(state.margin.pie.t + (height / 2))})`,
            'class': `gWrapper${pieVar}`
        });

    thisPieG.append("text")
        .attrs({
            "y": -height/2,
            "x": -width/2,
            "font-size": "15px",
            "text-anchor": "start"
        })
        .text(pieVar == "market_cap" ? 
            "Market Capitalization" : "24 Hour Trading Volume");

    if(state.activeCoin == null){
        state.activeCoin = $("#coin-select").val();
    }

    let thisPiePath = thisPieG.selectAll("path");
    
    vis.data0 = thisPiePath.data();
    vis.data1 = vis.pie(donutData);

    // JOIN elements with new data.
    thisPiePath = thisPiePath.data(vis.data1, key);

    // EXIT old elements from the screen.
    thisPiePath.exit()
        .datum(function(d, i) { return findNeighborArc(i, vis.data1, vis.data0, key) || d; })
        .transition()
        .duration(750)
        .attrTween("d", arcTween)
        .remove();
    
    // UPDATE elements still on the screen.
    thisPiePath.transition()
        .duration(750)
        .attrTween("d", arcTween)
        .attr("fill-opacity", function(d) {
            return (d.data.coin == state.activeCoin) ? 1 : 0.3;
        })

    // ENTER new elements in the array.
    thisPiePath.enter()
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