function resize(){
    
    let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);
    
    let resizeW = (parentDivWidth > 1530) ? 1530 : parentDivWidth
    svgObj.attr("height", resizeW * .95);
    gObj.attr('transform', `scale(${resizeW/900}) translate(${parentDivWidth * .03 },0)`);
    d3.selectAll('.statePath').attr('d', d => pathGenerator(d))

}

function buildChart(towns){
    
    projection.fitExtent([[20, 20], [700, 580]], towns);
    
    //data-join for countries
    const townPaths = gObj.selectAll('path')
        .data(towns.features);

    //append a path for each country
    townPaths.enter().append('path')
    //set d based on country
    .attr('d', d => pathGenerator(d))
    .attr('class','statePath')
    .on('click', d => console.log(d.properties["NAME10"]))
    .append('title')
        .text(showTownName);
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

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
let resizeW = (parentDivWidth > 1530) ? 1530 : parentDivWidth
svgObj.attrs({
    "width" : '100%',
    "height" : resizeW * .95
});

gObj.attr('transform', `scale(${resizeW/900}) translate(${resizeW * .03},0)`);

let townVals, townShapes;
d3.csv('./data.csv').then(csvData => {
    townVals = csvData;

    d3.json('CTstate.json').then(data => {
        townShapes = data;
        // buildChart(towns);
        loadAndProcessData().then(res => {
            console.log('load&Process res')
            console.log(res.features)
            buildChart(res);
        });
    })
})

//Add Resise listener & fn call
window.addEventListener("resize", resize);