function resize(){
    
    let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);

    svgObj.attr("height", parentDivWidth * .95);
    gObj.attr('transform', `scale(${parentDivWidth/900}) translate(${parentDivWidth * .03 },0)`);
    d3.selectAll('.statePath').attr('d', d => pathGenerator(d))

}

let removeWater = (d) => d.properties["NAME10"].indexOf('defined') < 0;
let showTownName = d => d.properties["NAME10"];
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
svgObj.attrs({
    "width" : '100%',
    "height" : parentDivWidth * .95
});

gObj.attr('transform', `scale(${parentDivWidth/900}) translate(${parentDivWidth * .03},0)`);

d3.json('CTstate.json').then(data => {

    let geometriesWithoutWater = data.objects.townLayer.geometries.filter(removeWater)

    //Connecticut topojson
    var connecticut = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: geometriesWithoutWater
    });

    //projection and path
    projection.fitExtent([[20, 20], [700, 580]], connecticut);
    
    //data-join for countries
    const townPaths = gObj.selectAll('path')
        .data(connecticut.features);

    //append a path for each country
    townPaths.enter().append('path')
    //set d based on country
    .attr('d', d => pathGenerator(d))
    .attr('class','statePath')
    .on('click', d => console.log(d.properties["NAME10"]))
    .append('title')
        .text(showTownName);
})

//Add Resise listener & fn call
window.addEventListener("resize", resize);