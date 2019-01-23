function makeObjsFromParent(parent){
  let chartObj = d3.select('#chartDiv'),
  svgObj = chartObj.append('svg'),
  svgW = +svgObj.attr("width"),
  svgH = +svgObj.attr("height");
  return {chartObj, svgObj, svgW, svgH}
}

function getDimsFromParent(p){
  
  // Extract the width and height that was computed by CSS.
  let resizedWidth = p.clientWidth;
  let resizedHeight = p.clientHeight;
  const widthLessMargins = resizedWidth - margin.left - margin.right;
  const heightLessMargins = resizedHeight - margin.top - margin.bottom;
  return {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins}
}

// Return the number of descendants that the node has
function sumByCount(d) {
    return d.children ? 0 : 1;
}

// Return the size of the node
function sumBySize(d) {
    return d.size;
}

function resize(){
    console.log('resizing!')
    svgObj.selectAll('*').remove();

    let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

      //set svg dims
    svgObj.attrs({
        'height': heightLessMargins,
        'width': widthLessMargins,
        'transform': `translate(${margin.left},${margin.top})`
    })

    //reset three dims
    treemap.size([widthLessMargins, heightLessMargins])

    buildChart(globalData)


}

function prepData(data, sumFn){

        //stratify data
    var stratRootData = d3.stratify()
        .id(d => d.name)
        .parentId(d => d.parent)
        (data);

    let hierarched = stratRootData.eachBefore((d) => {
    // console.log('eachBefore d')
    // console.log(d)
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name
        return d
    })
    .sum(sumFn)
    .sort((a, b)=> b.height - a.height || b.value - a.value);

    treemap(hierarched);
    return hierarched;
}

function buildChart(data){
        let preppedData = prepData(data, sumBySize)
    
    var cellDataJoin = svgObj.selectAll("g")
        // root.leaves() are the children of the root
        .data(preppedData.leaves());

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
            "fill": d => colorScale(d.parent.data.id),
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
}

const margin = { left: 20, right: 20, top: 20, bottom: 20 };
let rootData, storedNodes;
let {chartObj, svgObj, svgW, svgH} = makeObjsFromParent('chartDiv');  
let {resizedWidth, resizedHeight, widthLessMargins, heightLessMargins} = getDimsFromParent(chartDiv);

svgObj.attrs({
  'height': heightLessMargins,
  'width': widthLessMargins,
  'transform': `translate(${margin.left},${margin.top})`
})

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    colorScale = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([resizedWidth, resizedHeight])
    .round(true)
    .paddingInner(1);

let globalData;

d3.json("./data.json", function(error, data) {
    if (error) throw error;

    globalData = data;
    buildChart(globalData);
});

// Call the resize function whenever a resize event occurs
d3.select(window).on('resize', resize);