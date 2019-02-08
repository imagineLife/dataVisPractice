StackedAreaChart = function(_parentElement){
    this.parentElement = _parentElement;

    this.initVis();
};

StackedAreaChart.prototype.initVis = function(){
    var vis = this;
    vis.areaState = {
        margin : { left:80, right:100, top:50, bottom:40 },
     }
    vis.height = 370 - vis.areaState.margin.top - vis.areaState.margin.bottom;
    vis.width = 800 - vis.areaState.margin.left - vis.areaState.margin.right;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attrs({
            "width": vis.width + vis.areaState.margin.left + vis.areaState.margin.right,
            "height": vis.height + vis.areaState.margin.top + vis.areaState.margin.bottom
        });
    vis.g = vis.svg.append("g")
        .attr("transform", `translate(${vis.areaState.margin.left},${vis.areaState.margin.top})`);

    vis.t = () => { return d3.transition().duration(1000); }

    vis.color = d3.scaleOrdinal(d3.schemePastel1);

    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
        .ticks(4);
    vis.xAxis = vis.g.append("g")
        .attrs({
            "class": "x axis",
            "transform": `translate(0,${vis.height})`
        });
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");

    vis.stack = d3.stack()
        .keys(["west", "south", "northeast", "midwest"]);

    vis.area = d3.area()
        .x(d => vis.x(parseTime(d.data.date)))
        .y0(d => vis.y(d[0]))
        .y1(d => vis.y(d[1]));

    vis.addLegend();

    vis.updateVis();
};

StackedAreaChart.prototype.updateVis = function(){
    var vis = this;

    vis.variable = $("#var-select").val()

    vis.dayNest = d3.nest()
        .key(d => formatTime(d.date))
        .entries(calls)

    vis.dataFiltered = vis.dayNest
        .map(day => {
            return day.values.reduce((accumulator, current) => {
                accumulator.date = day.key
                accumulator[current.team] = accumulator[current.team] + current[vis.variable]
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
    vis.x.domain(d3.extent(vis.dataFiltered, (d) => {  return parseTime(d.date); }));
    vis.y.domain([0, vis.maxDateVal]);

    // Update axes
    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall);

    vis.teams = vis.g.selectAll(".team")
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
            .style("fill", d => vis.color(d.key))
            .style("fill-opacity", 0.5)
};


StackedAreaChart.prototype.addLegend = function(){
    var vis = this;

    var legend = vis.g.append("g")
        .attr("transform", `translate(${50},${-25})`);

    var legendArray = [
        {label: "Northeast", color: vis.color("northeast")},
        {label: "West", color: vis.color("west")},
        {label: "South", color: vis.color("south")},
        {label: "Midwest", color: vis.color("midwest")}
    ]

    var legendCol = legend.selectAll(".legendCol")
        .data(legendArray)
        .enter().append("g")
            .attrs({
                "class": "legendCol",
                "transform": (d, i) => `translate(${(i * 150)},${(0)})`
            });
        
    legendCol.append("rect")
        .attrs({
            "class": "legendRect",
            "width": 10,
            "height": 10,
            "fill": d => d.color,
            "fill-opacity": 0.5
        });

    legendCol.append("text")
        .attrs({
            "class": "legendText",
            "x": 20,
            "y": 10,
            "text-anchor": "start"
        })
        .text(d => { return d.label; }); 
}