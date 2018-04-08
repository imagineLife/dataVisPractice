  d3.select(window)
        .on("resize", sizeChange);

  const projection = d3.geo.albersUsa()
    .scale(1100);

  const path = d3.geo.path()
    .projection(projection);

  const svg = d3.select("#container")
    .append("svg")
    .attr("width", "100%")
    .attr("class", 'svgClass')
        .append("g");
  
  d3.json("data.json", function(error, us) {

    const america = topojson.feature(us, {
        type: "FeautreCollection",
        geometries: us.objects
    });


    svg.selectAll(".states")
    .data(topojson.feature(us, us.objects.states).features)
   .enter().append("path")
    .attr("class", "states")
    .attr("d", path);
  });

  function sizeChange() {
      d3
        .select("g")
        .attr("transform", "scale(" + $("#container")
        .width()/900 + ")");
     
      $("svg").height($("#container").width()*0.618);
  }