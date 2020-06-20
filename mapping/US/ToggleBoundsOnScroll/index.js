const buildChart = async () => {
  var width = 962,
      rotated = 90,
      height = 502;

  //countries which have states, needed to toggle visibility
  //for USA/ etc. either show countries or states, not both
  var usa, canada; 
  //track where mouse was clicked
  var initX;
  //track scale only rotate when s === 1
  var s = 1;
  var mouseClicked = false;


  var projection = d3.geoMercator()
      .scale(153)
      .translate([width/2,height/1.5])
      .rotate([rotated,0,0]); //center on USA because 'murica

  var zoom = d3.zoom()
       .scaleExtent([1, 20])
       .on("zoom", zoomed);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
        //track where user clicked down
        .on("mousedown", function() {
           d3.event.preventDefault(); 
           //only if scale === 1
           if(s !== 1) return;
             initX = d3.mouse(this)[0];
             mouseClicked = true;
        })
        .on("mouseup", function() {
            if(s !== 1) return;
            rotated = rotated + ((d3.mouse(this)[0] - initX) * 360 / (s * width));
            mouseClicked = false;
        })
      .call(zoom);

  //for tooltip 
  var offsetL = document.getElementById('map').offsetLeft+10;
  var offsetT = document.getElementById('map').offsetTop+10;

  var path = d3.geoPath()
      .projection(projection);

  var tooltip = d3.select("#tooltip")

  //need this for correct panning
  var g = svg.append("g");

  //det json data and draw it
  let world = await d3.json("countriesAndStates.json");

  //destructure countries && states from data
  const {objects: {countries, states}} = world

    //countries
    g.append("g")
        .attr("class", "boundary")
      .selectAll("boundary")
        .data(topojson.feature(world, countries).features)
        .enter().append("path")
        .attr("name", function(d) {return d.properties.name;})
        .attr("id", function(d) { return d.id;})
        .style('vector-effect', 'non-scaling-stroke')
        .on('click', selected)
        .on("mousemove", showTooltip)
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true);
         })
        .attr("d", path);

    usa = d3.select('#USA');
    canada = d3.select('#CAN');
      
    //states
    g.append("g")
        .attr("class", "boundary state hidden")
      .selectAll("boundary")
        .data(topojson.feature(world, states).features)
        .enter().append("path")
        .attr("name", function(d) { return d.properties.name;})
        .attr("id", function(d) { return d.id;})
        .style('vector-effect', 'non-scaling-stroke')
        .on('click', selected)
        .on("mousemove", showTooltip)
        .on("mouseout",  function(d,i) {
            tooltip.classed("hidden", true);
         })
        .attr("d", path);

    statesElements = d3.selectAll('.state');
  // });

  function showTooltip(d) {
    label = d.properties.name;
    var mouse = d3.mouse(svg.node())
      .map( function(d) { return parseInt(d); } );
    tooltip.classed("hidden", false)
      .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
      .html(label);
  }

  function selected() {
    d3.select('.selected').classed('selected', false);
    d3.select(this).classed('selected', true);
  }


  function zoomed() {
    g.selectAll('path')
    .attr('transform', d3.event.transform);
    
    //get zoomed 'scale'
    let {event: { transform: { k : s }}} = d3; 
  
    //toggle state/USA visability
    if(s > 3.5) {
      statesElements
        .classed('hidden', false);
      usa
        .classed('hidden', true);
      canada
        .classed('hidden', true);
    } else {
      statesElements
        .classed('hidden', true);
      usa
        .classed('hidden', false);
      canada
        .classed('hidden', false);
    }
  }
}

buildChart()