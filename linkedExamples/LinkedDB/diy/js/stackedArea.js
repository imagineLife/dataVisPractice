StackedAreaChart = function(parent){
    var vis = this;

    let hLM = state.saObj.h - state.saObj.margins.top - state.saObj.margins.bottom;
    let wLM = state.saObj.w - state.saObj.margins.left - state.saObj.margins.right;

    let passedParent = d3.select(parent)
    state.saObj.svg = d3.select(parent)
        .append("svg")
        .attrs({
            "width": wLM + state.saObj.margins.left + state.saObj.margins.right,
            "height": hLM + state.saObj.margins.top + state.saObj.margins.bottom
        });

    state.saObj.xScale.range([0, wLM]);
    state.saObj.yScale.range([hLM, 0]);

    state.saObj.g = lib.appendToParent(state.saObj.svg, 'stackedAreaGWrapper', `translate(${state.saObj.margins.left},${state.saObj.margins.top})`);        
    state.saObj.xAxisElm = lib.appendToParent(state.saObj.g, 'x axis', `translate(0,${hLM})`);
    state.saObj.yAxisElm = lib.appendToParent(state.saObj.g, 'y axis', null);

    const legendArr = lib.makeLegendArr(state.colorScale, ["northeast", "west", "south", "midwest"])
    
    lib.addLegendToParent(state.colorScale, state.saObj.g, 'stackedArea', legendArr);
    
    updateStackedArea(state.dropdownVal, state.colorScale, state.saObj.g);
};

const updateStackedArea = (dropdownVal, colorScale) => {

    nestedByDate = d3.nest()
        .key(d => formatTime(d.date))
        .entries(state.filteredCalls)
    
    let groupedByDateThenRegionTotal = nestedByDate.map(day => {
        return day.values.reduce((accumulator, current) => {
            accumulator.date = day.key
            accumulator[current.team] = accumulator[current.team] + current[dropdownVal]
            return accumulator;
        }, {
            "northeast": 0,
            "midwest": 0,
            "south": 0,
            "west": 0
        })
    })

    let maxYVal = d3.max(groupedByDateThenRegionTotal, d => {
        var justVals = d3.keys(d).map(key => key !== 'date' ? d[key] : 0 );
        return d3.sum(justVals);
    });
    

    // Update scales
    state.saObj.xScale.domain(d3.extent(groupedByDateThenRegionTotal, (d) => {  return parseTime(d.date); }));
    state.saObj.yScale.domain([0, maxYVal]);

    // Update axes
    state.saObj.xAxisObj.scale(state.saObj.xScale);
    state.saObj.xAxisElm.transition(state.t()).call(state.saObj.xAxisObj);
    state.saObj.yAxisObj.scale(state.saObj.yScale);
    state.saObj.yAxisElm.transition(state.t()).call(state.saObj.yAxisObj);

    let stackedData = state.saObj.stackFn(groupedByDateThenRegionTotal)
    let stackG = state.saObj.g.selectAll(".stackG").data(stackedData);
    
    // Update the path for each stackG
    stackG.select(".singleAreaStack")
        .attr("d", state.saObj.areaFn)

    stackG.enter().append("g")
        .attr("class", d => `stackG ${d.key}`)
        .append("path")
            .attrs({
                "class": "singleAreaStack",
                "d": state.saObj.areaFn
            })
            .style("fill", d => colorScale(d.key))
            .style("fill-opacity", 0.5)
};