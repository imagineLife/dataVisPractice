Timeline = function(_parentElement){
    this.initTimeline(_parentElement);
};

Timeline.prototype.initTimeline = function(parent){
    var vis = this;

    vis.width = 800 - state.tlObj.m.left - state.tlObj.m.right;
    vis.height = 100 - state.tlObj.m.top - state.tlObj.m.bottom;

    vis.svg = d3.select(parent).append("svg")
        .attr("width", vis.width + state.tlObj.m.left + state.tlObj.m.right)
        .attr("height", vis.height + state.tlObj.m.top + state.tlObj.m.bottom)

    vis.t = () => { return d3.transition().duration(1000); }

    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxisCall = d3.axisBottom()
        .ticks(4);

    vis.g = lib.appendToParent(vis.svg, null, `translate(${state.tlObj.m.left},${state.tlObj.m.top})`);
    vis.xAxis = lib.appendToParent(vis.g, 'x axis', `translate(0,${vis.height})`);

    vis.areaPath = vis.g.append("path")
        .attr("fill", "#ccc");

    // Initialize brush component
    vis.brush = d3.brushX()
        .handleSize(10)
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush end", brushed)

    // Append brush component
    vis.brushComponent = lib.appendToParent(vis.g, 'brush', null).call(vis.brush);

    vis.wrangleData();
};

Timeline.prototype.wrangleData = function(){
    var vis = this;

    let dayNest = d3.nest()
        .key(function(d){ return formatTime(d.date); })
        .entries(state.srcData)

    let dataFiltered = dayNest
        .map(function(day){
            return {
                date: day.key,
                sum: day.values.reduce(function(accumulator, current){
                    return accumulator + current["call_revenue"]
                }, 0)               
            }

        })

    vis.updateVis(dataFiltered);
}

Timeline.prototype.updateVis = function(srcData){
    var vis = this;

    vis.x.domain(d3.extent(srcData, (d) => { return parseTime(d.date); }));
    vis.y.domain([0, d3.max(srcData, (d) => d.sum) ])

    vis.xAxisCall.scale(vis.x)

    vis.xAxis.transition(vis.t()).call(vis.xAxisCall)

    vis.area0 = d3.area()
        .x((d) => { return vis.x(parseTime(d.date)); })
        .y0(vis.height)
        .y1(vis.height);

    vis.area = d3.area()
        .x((d) => { return vis.x(parseTime(d.date)); })
        .y0(vis.height)
        .y1((d) => { return vis.y(d.sum); })

    vis.areaPath
        .data([srcData])
        .attr("d", vis.area);
}