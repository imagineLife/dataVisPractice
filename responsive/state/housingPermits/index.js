function resize(){
    
    let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);
    
    let resizeW = (parentDivWidth > 900) ? 900 : parentDivWidth
    svgObj.attr("height", resizeW * .85);
    gObj.attr('transform', `scale(${resizeW/900}) translate(${parentDivWidth * .03 },0)`);
    d3.selectAll('.statePath').attr('d', d => pathGenerator(d))

}

function getValFromColumn(col, rowData){
    if(col == 'town'){
        return rowData.properties.NAME10
    }else{
        return rowData.properties.permits
    }
}

function buildChart(towns){

    colorScale.domain(d3.extent(towns.features, d => d.properties.permits))
    projection.fitExtent([[20, 20], [700, 580]], towns);
    
    //data-join for countries
    const townPaths = gObj.selectAll('path')
        .data(towns.features);

    //append a path for each country
    townPaths.enter().append('path')
    //set d based on country
    .attrs({
        'd': d => pathGenerator(d),
        'class': 'statePath',
        'fill': d => colorScale(+d.properties.permits)
    })
    .on('click', d => console.log(d.properties["NAME10"]))
    .append('title')
        .text(showTownName);
}

function buildTable(data, colNames){
    let sortedData = data.features.sort((a, b) => b.properties.permits - a.properties.permits).slice(0,9)
    var table = d3.select('.top10Towns')
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(colNames)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(sortedData)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return colNames.map(function(column) {
                return {column: column, value: getValFromColumn(column, row)};
            });
        })
        .enter()
        .append("td")
        .html(d => d.value);
    
    return table;
}


let removeWater = (d) => d.properties["NAME10"].indexOf('defined') < 0;
let showTownName = d => `${d.properties["NAME10"]}: ${d.properties.permits}`;
const margin = { 
    left: 20, 
    right: 20,
    top: 20,
    bottom: 20
};
let {chartDiv, svgObj, gObj} = lib.makeD3ObjsFromParentID('chartDiv');
let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);
var projection = d3.geoAlbersUsa();
const pathGenerator = d3.geoPath().projection(projection);
let colorScale = d3.scaleSequential(d3.interpolateReds);

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
let resizeW = (parentDivWidth > 900) ? 900 : parentDivWidth
svgObj.attrs({
    "width" : resizeW,
    "height" : resizeW * .85
});

gObj.attr('transform', `scale(${resizeW/700}) translate(${resizeW * .03},0)`);

loadAndProcessData().then(res => {
    buildChart(res)
    buildTable(res, ["town", "permits"])
});

//Add Resise listener & fn call
window.addEventListener("resize", resize);