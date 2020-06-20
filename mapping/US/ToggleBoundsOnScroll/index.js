const runProject = async () => {

  const enterStates = e => {
    e.append("path")
    .attr("d", path)
    .on("click", clicked)
  }

  var width = 960,
      height = 500,
      selectedState,
      centerX = width / 2,
      centerY = height / 2;
      
  var projection = d3.geoAlbersUsa()
      .scale(1070)
      .translate([width / 2, height / 2]);

  var path = d3.geoPath()
      .projection(projection);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  // svg.append("rect")
  //     .attr("class", "background")
  //     .attr("width", width)
  //     .attr("height", height)
  //     .on("click", clicked);

  var g = svg.append("g");

  const us = await d3.json("./../us-click-to-zoom.json")
  const stateFeats = topojson.feature(us, us.objects.states).features
  const meshedStateFeats = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  
  const statesDataJoin = g.append("g")
    .attr("id", "states")
    .selectAll("path")
    .data(stateFeats);

  statesDataJoin.join(enterStates);

    g.append("path")
        .datum(meshedStateFeats)
        .attr("id", "state-borders")
        .attr("d", path);

  function clicked(d) {
    var x, y, k;
    const didNotClickCurrentState = selectedState !== d
    if (d && didNotClickCurrentState) {
      var centroid = path.centroid(d);
      
      x = centroid[0];
      y = centroid[1];
      k = 4;
      selectedState = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      selectedState = null;
    }

    //set class, pick-up orange color
    g.selectAll("path")
      .classed("active", selectedState ? d => d === selectedState : false);

    g.transition()
        .duration(650)
        .attr("transform", `translate(${ centerX },${centerY}) scale(${k}) translate(${-x},${-y})`)
        // .style("stroke-width", .5 / k + "px");
  }
}

runProject()