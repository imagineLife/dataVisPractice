// Return the number of descendants that the node has
function sumByCount(d) {
    return d.children ? 0 : 1;
}

// Return the size of the node
function sumBySize(d) {
    return d.size;
}

function makeHierarchy(data,sumFn){
    //convert the data to the hierarchical format
    return d3.hierarchy(data)
    .eachBefore((d) => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    .sum(sumFn)
    .sort((a, b)=> b.height - a.height || b.value - a.value);
}

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(true)
    .paddingInner(1);

d3.json("./data.json", function(error, data) {
    if (error) throw error;

    let root = makeHierarchy(data, sumBySize)
    console.log('root')
    console.log(root)

    // Computes x0, x1, y0, and y1 for each node (where the rectangles should be)
    treemap(root);
    
    var cellDataJoin = svg.selectAll("g")
        .data(root.leaves());

        cellDataJoinEnter = cellDataJoin.enter().append("g")
            .attrs({
                'transform': d => `translate(${d.x0},${d.y0})`,
                'class': 'dataJoinGWrapper'
            });
    
    // Add rectanges for each of the boxes that were generated
    cellDataJoinEnter.append("rect")
        .attrs({
            "id": d => d.data.id,
            "width": d => d.x1 - d.x0,
            "height": d => d.y1 - d.y0,
            "fill": d => color(d.parent.data.id),
            "class": 'enterRect'
        });
    
    //Clip-Path: Make sure that text labels don't overflow into adjacent boxes
    cellDataJoinEnter.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.data.id; })
        .append("use")
            .attr("xlink:href", function(d) { return "#" + d.data.id; });
    
    //Text-Label: Add text labels - each word goes on its own line
    cellDataJoinEnter.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
        .selectAll("tspan")
        .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
        .enter().append("tspan")
            .attrs({
                "x": 4,
                "y": (d, i) => 13 + i * 10
            })
            .text(d => d);
    
    // Simple way to make tooltips
    cellDataJoinEnter.append("title")
        .text(d => d.data.id + "\n" + format(d.value));
    
    // Add an input to select between different summing methods
    d3.selectAll("input")
        .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
        .on("change", changed);
    
    function changed(sum) {
        // Give the treemap a new root, which uses a different summing function
        treemap(root.sum(sum));
        // Update the size and position of each of the rectangles
        cellDataJoinEnter.transition().duration(750)
            .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
            .select("rect")
                .attrs({
                    "width": d => d.x1 - d.x0,
                    "height": d => d.y1 - d.y0
                });
    }
});