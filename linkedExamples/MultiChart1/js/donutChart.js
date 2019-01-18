let donutVars = {
    w: 250,
    h: 250,
    margin : { left:0, right:0, top:40, bottom:0 }
}

let wLm = donutVars.w - donutVars.margin.left - donutVars.margin.right;
let hLm = donutVars.h - donutVars.margin.top - donutVars.margin.bottom;
let donutRadius = Math.min(wLm, hLm) / 2;

const arcFn = d3.arc()
    .innerRadius(donutRadius - 60)
    .outerRadius(donutRadius - 30);

const pieFn = d3.pie()
    .padAngle(0.03)
    .sort(null);

let donutSvg, donutG, donutPath,

initDonut = function(parent, sliceVar){


    donutSvg = d3.select(parent)
        .append("svg")
        .attr("width", wLm + donutVars.margin.left + donutVars.margin.right)
        .attr("height", hLm + donutVars.margin.top + donutVars.margin.bottom);
    donutG = donutSvg.append("g")
        .attr("transform", "translate(" + (donutVars.margin.left + (wLm / 2)) + 
            ", " + (donutVars.margin.top + (hLm / 2)) + ")");

    donutG.append("text")
        .attrs({
            "y": -hLm/2,
            "x": -wLm/2,
            "font-size": "15px",
            "text-anchor": "start",
            "transform": `translate(45,0)`
        })
        .text(sliceVar == "market_cap" ? 
            "Market Capitalization" : "24 Hour Trading Volume");

    state.activeCoin = state.activeCoin
    
    updateDonut(parent, sliceVar);
}

updateDonut = function(parent, sliceVar){

    pieFn.value(function(d) { return d.data[sliceVar]; });
    
    donutPath = donutG.selectAll("path");

    let data0 = donutPath.data();
    let data1 = pieFn(state.donutData);
    
    // JOIN elements with new data.
    donutPath = donutPath.data(data1, key);
    
    // UPDATE elements still on the screen.
    donutPath.transition()
        .duration(750)
        .attrTween("d", arcTween)
        .attr("fill-opacity", function(d) {
            return (d.data.coin == state.activeCoin) ? 1 : 0.3;
        })

    // ENTER new elements in the array.
    donutPath.enter()
        .append("path")
        .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; }) 
        .attr("fill", function(d) {  return colorScale(d.data.coin) })
        .attr("fill-opacity", d =>  (d.data.coin == state.activeCoin) ? 1 : 0.3 )
        .on("click", arcClicked)
        .transition()
        .duration(750)
            .attrTween("d", arcTween);

    function key(d){ return d.data.coin }

    function findNeighborArc(i, data0, data1, key) {
        var d;
        return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
            : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
            : null;
    }

    // Find the element in data0 that joins the highest preceding element in data1.
    function findPreceding(i, data0, data1, key) {
        var m = data0.length;
        while (--i >= 0) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }

    // Find the element in data0 that joins the lowest following element in data1.
    function findFollowing(i, data0, data1, key) {
        var n = data1.length, m = data0.length;
        while (++i < n) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }

    function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(1)
        return function(t) { return arcFn(i(t)); };
    }

}