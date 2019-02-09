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

    state.saObj.g = appendToParent(state.saObj.svg, 'stackedAreaGWrapper', `translate(${state.saObj.margins.left},${state.saObj.margins.top})`);        
    state.saObj.xAxisElm = appendToParent(state.saObj.g, 'x axis', `translate(0,${hLM})`);
    state.saObj.yAxisElm = appendToParent(state.saObj.g, 'y axis', null);

    vis.area = d3.area()
        .x(d => state.saObj.xScale(parseTime(d.data.date)))
        .y0(d => state.saObj.yScale(d[0]))
        .y1(d => state.saObj.yScale(d[1]));

    vis.addLegend(state.colorScale, state.saObj.g);

    vis.updateVis(state.dropdownVal, state.colorScale, state.saObj.g);
};

StackedAreaChart.prototype.updateVis = function(dropdownVal, colorScale, gObj){
    var vis = this;

    nestFn = d3.nest()
        .key(d => formatTime(d.date))
        .entries(filteredCalls)

    vis.dataFiltered = nestFn
        .map(day => {
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

    vis.maxDateVal = d3.max(vis.dataFiltered, d => {
        var vals = d3.keys(d).map(key => key !== 'date' ? d[key] : 0 );
        return d3.sum(vals);
    });

    // Update scales
    state.saObj.xScale.domain(d3.extent(vis.dataFiltered, (d) => {  return parseTime(d.date); }));
    state.saObj.yScale.domain([0, vis.maxDateVal]);

    // Update axes
    state.saObj.xAxisObj.scale(state.saObj.xScale);
    state.saObj.xAxisElm.transition(state.t()).call(state.saObj.xAxisObj);
    state.saObj.yAxisObj.scale(state.saObj.yScale);
    state.saObj.yAxisElm.transition(state.t()).call(state.saObj.yAxisObj);

    vis.stackG = state.saObj.g.selectAll(".stackG")
        .data(state.saObj.stackFn(vis.dataFiltered));
    
    // Update the path for each stackG
    vis.stackG.select(".area")
        .attr("d", vis.area)

    vis.stackG.enter().append("g")
        .attr("class", d => `stackG ${d.key}`)
        .append("path")
            .attrs({
                "class": "area",
                "d": vis.area
            })
            .style("fill", d => colorScale(d.key))
            .style("fill-opacity", 0.5)
};


StackedAreaChart.prototype.addLegend = function(colorScale, gObj){
    var vis = this;

    var areaLegend = appendToParent(state.saObj.g, 'areaLegend', `translate(${50},${-25})`)

    var legendArray = [
        {label: "Northeast", color: colorScale("northeast")},
        {label: "West", color: colorScale("west")},
        {label: "South", color: colorScale("south")},
        {label: "Midwest", color: colorScale("midwest")}
    ]

    var legendGWrapper = areaLegend.selectAll(".legendGWrapper")
        .data(legendArray)
        .enter().append("g")
            .attrs({
                "class": "legendGWrapper",
                "transform": (d, i) => `translate(${(i * 150)},${(0)})`
            });
        
    let legendRects = legendGWrapper.append("rect")
        .attrs({
            "class": "legendRect",
            "width": 10,
            "height": 10,
            "fill": d => d.color,
            "fill-opacity": 0.5
        });

    let legendTexts = legendGWrapper.append("text")
        .attrs({
            "class": "legendText",
            "x": 20,
            "y": 10,
            "text-anchor": "start"
        })
        .text(d => d.label); 
}