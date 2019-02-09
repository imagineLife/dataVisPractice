StackedAreaChart = function(_parentElement){
    var vis = this;
    this.parentElement = _parentElement;

    vis.areaState = {
        margin : { left:80, right:100, top:50, bottom:40 },
     }
    let hLM = 370 - vis.areaState.margin.top - vis.areaState.margin.bottom;
    let wLM = 800 - vis.areaState.margin.left - vis.areaState.margin.right;

    let passedParent = d3.select(vis.parentElement)
    state.stackedArea.svg = d3.select(vis.parentElement)
        .append("svg")
        .attrs({
            "width": wLM + vis.areaState.margin.left + vis.areaState.margin.right,
            "height": hLM + vis.areaState.margin.top + vis.areaState.margin.bottom
        });

    state.stackedArea.xScale.range([0, wLM]);
    state.stackedArea.yScale.range([hLM, 0]);

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
        .ticks(4);

    state.stackedArea.g = appendToParent(state.stackedArea.svg, 'stackedAreaGWrapper', `translate(${vis.areaState.margin.left},${vis.areaState.margin.top})`);        
    vis.xAxis = appendToParent(state.stackedArea.g, 'x axis', `translate(0,${hLM})`);
    vis.yAxis = appendToParent(state.stackedArea.g, 'y axis', null);

    vis.stack = d3.stack()
        .keys(["west", "south", "northeast", "midwest"]);

    vis.area = d3.area()
        .x(d => state.stackedArea.xScale(parseTime(d.data.date)))
        .y0(d => state.stackedArea.yScale(d[0]))
        .y1(d => state.stackedArea.yScale(d[1]));

    vis.addLegend(state.colorScale, state.stackedArea.g);

    vis.updateVis(state.dropdownVal, state.colorScale, state.stackedArea.g);
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
    state.stackedArea.xScale.domain(d3.extent(vis.dataFiltered, (d) => {  return parseTime(d.date); }));
    state.stackedArea.yScale.domain([0, vis.maxDateVal]);

    // Update axes
    vis.xAxisCall.scale(state.stackedArea.xScale);
    vis.xAxis.transition(state.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(state.stackedArea.yScale);
    vis.yAxis.transition(state.t()).call(vis.yAxisCall);

    vis.teams = state.stackedArea.g.selectAll(".team")
        .data(vis.stack(vis.dataFiltered));
    
    // Update the path for each team
    vis.teams.select(".area")
        .attr("d", vis.area)

    vis.teams.enter().append("g")
        .attr("class", d => `team ${d.key}`)
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

    var areaLegend = appendToParent(state.stackedArea.g, 'areaLegend', `translate(${50},${-25})`)

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