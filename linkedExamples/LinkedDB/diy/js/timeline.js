Timeline = function(_parentElement){
    this.initTimeline(_parentElement);
};

Timeline.prototype.initTimeline = function(parent){
    var vis = this;

    let {wLM, hLM} = lib.getLessMargins(state.saObj.w, 100, state.tlObj.m);

    vis.svg = d3.select(parent).append("svg")
        .attr("width", wLM + state.tlObj.m.left + state.tlObj.m.right)
        .attr("height", hLM + state.tlObj.m.top + state.tlObj.m.bottom)

    vis.t = () => { return d3.transition().duration(1000); }

    vis.x = d3.scaleTime()
        .range([0, wLM]);

    vis.y = d3.scaleLinear()
        .range([hLM, 0]);

    vis.xAxisCall = d3.axisBottom()
        .ticks(4);

    vis.g = lib.appendToParent(vis.svg, null, `translate(${state.tlObj.m.left},${state.tlObj.m.top})`);
    vis.xAxis = lib.appendToParent(vis.g, 'x axis', `translate(0,${hLM})`);

    // Initialize brush component
    vis.brush = d3.brushX()
        .handleSize(10)
        .extent([[0, 0], [wLM, hLM]])
        .on("brush end", brushed)

    // Append brush component
    vis.brushComponent = lib.appendToParent(vis.g, 'brush', null).call(vis.brush);

    vis.updateVis();
};

Timeline.prototype.updateVis = function(srcData){
    var vis = this;

    console.log('here')
    

    let dayNest = d3.nest()
        .key(function(d){ return formatTime(d.date); })
        .entries(state.filteredCalls)
    
    srcData = (srcData) ? srcData : dayNest
        .map(function(day){
            return {
                date: day.key,
                sum: day.values.reduce(function(accumulator, current){
                    return accumulator + current[state.dropdownVal]
                }, 0)               
            }

        });

    let {wLM, hLM} = lib.getLessMargins(state.saObj.w, 100, state.tlObj.m);

    vis.x.domain(d3.extent(srcData, (d) => { return parseTime(d.date); }));
    vis.y.domain([0, d3.max(srcData, (d) => d.sum) ])

    vis.xAxisCall.scale(vis.x)

    vis.xAxis.transition(vis.t()).call(vis.xAxisCall)

    vis.area0 = d3.area()
        .x((d) => { return vis.x(parseTime(d.date)); })
        .y0(hLM)
        .y1(hLM);

    vis.area = d3.area()
        .x((d) => { return vis.x(parseTime(d.date)); })
        .y0(hLM)
        .y1((d) => { return vis.y(d.sum); })

    vis.areaPath = vis.g.append("path")
        .data([srcData])
        .attr("fill", "#ccc")
        .attr("d", vis.area);
}