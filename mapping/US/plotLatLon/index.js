const buildChart = async () => {
        
  // "state" data
  const 
    width = 960, 
    height = 600,
    geoScale = 1000,
    transArr = [-1000, 800];
  

  const projection = d3
    .geoMercator()
    .scale(geoScale)
    .translate(transArr);

  const path = d3.geoPath()
      .projection(projection);

  const svg = d3.select("#map")
    .append("svg")
    .attr("viewBox", "0 0 900 800")
    .attr("preserveAspectRatio", "xMidYMid meet");
  
  const swiss = await d3.json("./geodata.json")
  const places = await d3.json ("./places.json")

  const cantons = topojson.feature(swiss, swiss.objects.india);

  const group =svg.selectAll("g")
    .data(cantons.features)
    .enter()
    .append("g");
    //.on('mouseover', tip.show)
        //.on('mouseout', tip.hide)


  svg.selectAll(".pin")
    .data(places)
    .enter().append("circle", ".pin")
    .attr("r", 5)
    .attr("transform", function(d) {
    return "translate(" + projection([
      d.location.longitude,
      d.location.latitude
    ]) + ")";
    })
    // .on('mouseover', tip.show)
    // .on('click', tip.hide);   

  const areas= group.append("path")
    .attr("d", path)
    .attr("class", "area")
   .attr("fill","steelblue");
                    
}

buildChart()