const buildChart = async () => {
        const width = 960, height = 600;
        const color= d3.scaleOrdinal()
              .domain([1,2,3,4,5,6,7,8,9])
              .range(colorbrewer.Oranges[9]);

        const projection = d3.geoMercator().scale(1000).translate([-1000,800]);
        const path = d3.geoPath()
            .projection(projection);

        const svg = d3.select("#map").append("svg")
            .attr("viewBox", "0 0 900 800")
           .attr("preserveAspectRatio", "xMidYMid meet");
        let data;
        const swiss = await d3.json("./geodata.json")
        const places = await d3.json ("./places.json")
        const cantons = topojson.feature(swiss, swiss.objects.india);
          
          //svg.call(tip);
        const group=svg.selectAll("g")
          .data(cantons.features)
          .enter()
          .append("g");
          //.on('mouseover', tip.show)
              //.on('mouseout', tip.hide)
            
            
        // const tip = d3.tip()
        //     .attr('class', 'd3-tip')
        //     .offset([-5, 0])
        //     .style("left", "300px")
        //     .style("top", "400px")
        //     .html(function(d) {
        //       return ("<a href="+d.nam+" target='_blank'>"+d.name +"</a>");
        //     })
            
        //   svg.call(tip);


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