  d3.select(window)
        .on("resize", sizeChange);

  const svg = d3.select("#container")
    .append("svg")
    .attr("width", "100%")
    .attr("class", 'svgClass')
        .append("g");
  
  d3.json("data.json", function(error, ctData) {

    const ct = topojson.feature(ctData, {
        type: "GeometryCollection",
        geometries: ctData.objects.townLayer.geometries
    });

    const projection = d3.geoAlbersUsa()
      .fitExtent([[20, 20], [700, 580]], ct);

    const path = d3.geoPath()
      .projection(projection);

    svg.selectAll(".towns")
    .data(ct.features)
   .enter().append("path")
    .attr("class", "towns")
    .attr("d", path);
  });

  function sizeChange() {
      // d3
      //   .select("g")
      //   .attr("transform", "scale(" + $("#container")
      //   .width()/00 + ")");
     
      $("svg").height($("#container").width()*0.618);
  }