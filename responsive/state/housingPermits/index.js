// const svgObj = d3.select('.svgWrapper');
// const svgW = +svgObj.attr('width');
// const svgH = +svgObj.attr('height');
const margin = { 
    left: 20, 
    right: 20,
    top: 20,
    bottom: 20
};
let {chartDiv, svgObj, gObj} = lib.makeD3ObjsFromParentID('chartDiv');
let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, margin);

//set svg height & width from div computed dimensions
//NOTE: can be the divLessMargins, for 'padding' effect
svgObj.attrs({
    "width" : '100%',
    "height" : parentDivWidth * .9
});

gObj.attr('transform',`scale(${parentDivWidth/900})`);

d3.json('CTstate.json').then(data => {
    console.log(data)

        // Connecticut topojson
    var connecticut = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.townLayer.geometries
    });

    // projection and path
    var projection = d3.geoAlbersUsa()
        .fitExtent([[20, 20], [700, 580]], connecticut);

    const pathGenerator = d3.geoPath().projection(projection);
    
    //data-join for countries
    const townPaths = gObj.selectAll('path')
        .data(connecticut.features);

    //append a path for each country
    townPaths.enter().append('path')
    //set d based on country
    .attr('d', d => pathGenerator(d))
    .attr('class','statePath');
})