const buildChart = async () => {

  const enterPlaces = e => {
    e.append("circle", ".pin")
    .attr("r", radius)
    .attr("transform" d => {
      const { location: { latitude, longitude}} = d
      return `translate(${ projection([ longitude,latitude ]) })`
    }) 
  }        
  // "state" data

  const enterGroups = e => {
    e.append("g")
    .append("path")
    .attr("d", path)
    .attr("class", "area")
    .attr("fill","steelblue")
  }
  
  const 
    width = 960, 
    height = 600,
    geoScale = 1000,
    transArr = [-1000, 800],
    radius = 5;
  

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
  
  //fetch data
  const swiss = await d3.json("./geodata.json")
  const places = await d3.json ("./places.json")

  //destructure vals
  const {objects : { india } } = swiss
  const cantons = topojson.feature(swiss, india);
  const {features: cantosFeats } = cantos

  //canto datajoin 
  const group =svg.selectAll("g")
    .data(cantosFeats)
    .join(enterGroups)

  svg.selectAll(".pin")
    .data(places)
    .join(enterPlaces)
                    
}

buildChart()