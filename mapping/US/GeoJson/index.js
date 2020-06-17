const loadData = async () => {

  const pathFillFn = d => {

      // Get data value
      const value = d.properties.visited;

      if (value) {
      //If value exists…
      return legendColorScale(value);
      } else {
      //If value is undefined…
      return "rgb(213,222,217)";
      }
  }

  const enterStates = e => {
    e.append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", pathFillFn);
  }

  const enterLegendBoxes = e => {
    const boxG = e.append("g");
    boxG.attr("transform", (d, i) => `translate(0,${i * 20})`)
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", legendColorScale);

    boxG.append("text")
      .data(legendData.map(d => d.txt))
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(d => d);
  }

  // Load GeoJSON data and merge with states data
  const json = await d3.json("./states-geojson.json")

   /*  This visualization was made possible by modifying code provided by:

  Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
  https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
      
  Malcolm Maclean, tooltips example tutorial
  http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

  Mike Bostock, Pie Chart Legend
  http://bl.ocks.org/mbostock/3888852  */

      
  //Width and height of map
  const width = 960;
  const height = 500;
  const midW = width / 2;
  const midH = height/2;
  const mapScale = 1000;
  const legendData = [
    {
      color: "rgb(213,222,217)",
      txt: "Cities Lived"
    },
    {
      color: "rgb(69,173,168)",
      txt: "States Lived"
    },
    {
      color: "rgb(84,36,55)",
      txt: "States Visited"
    },
    {
      color: "rgb(217,91,67)",
      txt: "Nada"
    }
  ]

  // D3 Projection
  const projection = d3.geoAlbersUsa()
   .translate([midW, midH])    // translate to center of screen
   .scale([mapScale]);          // scale things down so see entire US
          
  // Define path generator
  const path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection

      
  // Define linear scale for output
  const legendColorScale = d3
    .scaleLinear()
    .range(legendData.map(d => d.color))
    .domain([0,1,2,3]); // setting the range of the input data

  //Create SVG element and append map to the SVG
  const svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
          
  // Append Div for tooltip to SVG
  const div = d3.select("body")
          .append("div")   
          .attr("class", "tooltip")               
          .style("opacity", 0);

  // Load in my states data!
  // d3.csv("stateslived.csv", function(data) {

  // Loop through each state data value in the .csv file
  // for (const i = 0; i < data.length; i++) {

  // //   // Grab State Name
  //   const dataState = data[i].state;

  // //   // Grab data value 
  //   const dataValue = data[i].visited;

  //   // Find the corresponding state inside the GeoJSON
  //   for (const j = 0; j < json.features.length; j++)  {
  //     const jsonState = json.features[j].properties.name;

  //     if (dataState == jsonState) {

  //     // Copy the data value into the JSON
  //     json.features[j].properties.visited = dataValue; 

  //     // Stop looking through the JSON
  //     break;
  //     }
  //   }
  // }
  
  // Bind the data to the SVG and create one path per GeoJSON feature
  const statePathsDJ = svg.selectAll("path").data(json.features)
  statePathsDJ.join(enterStates)

     
  // Map the cities I have lived in!
  // d3.csv("cities-lived.csv", function(data) {

  // svg.selectAll("circle")
  //   .data(data)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", function(d) {
  //     return projection([d.lon, d.lat])[0];
  //   })
  //   .attr("cy", function(d) {
  //     return projection([d.lon, d.lat])[1];
  //   })
  //   .attr("r", function(d) {
  //     return Math.sqrt(d.years) * 4;
  //   })
  //     .style("fill", "rgb(217,91,67)")  
  //     .style("opacity", 0.85) 

  //   // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
  //   // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
  //   .on("mouseover", function(d) {      
  //       div.transition()        
  //            .duration(200)      
  //            .style("opacity", .9);      
  //            div.text(d.place)
  //            .style("left", (d3.event.pageX) + "px")     
  //            .style("top", (d3.event.pageY - 28) + "px");    
  //   })   

  //     // fade out tooltip on mouse out               
  //     .on("mouseout", function(d) {       
  //         div.transition()        
  //            .duration(500)      
  //            .style("opacity", 0);   
  //     });
  // });  

  const legendBox = d3.select("body").append("svg")
    .attr("class", "legend")
    .attr("width", 140)
    .attr("height", 200)
  const legendElementsDJ = legendBox.selectAll("g")
    .data(legendColorScale.domain().slice().reverse())
  legendElementsDJ.join(enterLegendBoxes)
  
}

loadData()