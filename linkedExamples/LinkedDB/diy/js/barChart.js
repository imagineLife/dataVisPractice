const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

BarChart = function(_parentElement, _variable, _title){
    this.parentElement = _parentElement;
    this.variable = _variable;
    this.title = _title;

    this.initVis();
};

BarChart.prototype.initVis = function(){
    var vis = this;
    let sb = state.barObj;

    let hLM = sb.h - sb.m.top - sb.m.bottom;
    let wLM = sb.w - sb.m.left - sb.m.right;
    
    sb.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", sb.w)
        .attr("height", sb.h);
    sb.g = sb.svg.append("g")
        .attr("transform", "translate(" + sb.m.left + 
            ", " + sb.m.top + ")");

    sb.xScale = d3.scaleBand()
        .domain(["electronics", "furniture", "appliances", "materials"])
        .range([0, wLM])
        .padding(0.5);

    sb.yScale.range([hLM, 0]);

    sb.xAxisElm = lib.appendToParent(sb.g, 'x axis', `translate(0,${hLM})`)
    sb.yAxisElm = lib.appendToParent(sb.g, 'y axis', null)

    sb.g.append("text")
        .attrs({
            "class": "title",  
            "y": -15,
            "x": -50,
            "font-size": "12px", 
            "text-anchor": "start"
        })
        .text(vis.title)

    vis.updateBar();
};


BarChart.prototype.updateBar = function(){
    var vis = this;

    let sb = state.barObj

    let hLM = sb.h - sb.m.top - sb.m.bottom
    
    vis.dataFiltered = state.nestedCalls.map(function(category){
        return {
            category: category.key,
            size: (category.values.reduce(function(accumulator, current){
                return accumulator + current[vis.variable]
            }, 0) / category.values.length)
        }
    })

    // Update scales
    sb.yScale.domain([0, d3.max(vis.dataFiltered, (d) => { return +d.size; })]);

    // Update axes
    sb.xAxisObj.scale(sb.xScale);
    sb.xAxisElm.transition(state.t()).call(sb.xAxisObj);
    sb.yAxisObj.scale(sb.yScale);
    sb.yAxisElm.transition(state.t()).call(sb.yAxisObj);

    // JOIN new data with old elements.
    vis.rects = sb.g.selectAll("rect").data(vis.dataFiltered, function(d){
        return d.category;
    });

    // EXIT old elements not present in new data.
    vis.rects.exit()
        .attr("class", "exit")
        .transition(state.t())
        .attr("height", 0)
        .attr("y", hLM)
        .style("fill-opacity", "0.1")
        .remove();

    // UPDATE old elements present in new data.
    vis.rects.attr("class", "update")
        .transition(state.t())
            .attr("y", function(d){ return sb.yScale(d.size); })
            .attr("height", function(d){ return (hLM - sb.yScale(d.size)); })
            .attr("x", function(d){ return sb.xScale(d.category) })
            .attr("width", sb.xScale.bandwidth)

    // ENTER new elements present in new data.
    vis.rects.enter()
        .append("rect")
        .attr("class", "enter")
        .attr("y", function(d){ return sb.yScale(d.size); })
        .attr("height", function(d){ return (hLM - sb.yScale(d.size)); })
        .attr("x", function(d){ return sb.xScale(d.category) })
        .attr("width", sb.xScale.bandwidth)
        .attr("fill", d => sb.colorScale(d.size))
};