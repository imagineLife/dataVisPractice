let myVars = {
        svgW : 500,
        svgH : 500
      };


      let svgObj = d3.select('#chart')
        .append('svg')
        .attrs({
          'width':myVars.svgW,
          'height':myVars.svgH
        })
        .append('g')
        .attr('transform', "translate(" + myVars.svgW / 2 + "," + myVars.svgH / 2 + ")");
//RESETS 
//svg translate to middle
      let readyFn = (error, datapoints) => {
        console.log('error is ',error);
        console.log('datapoints',datapoints);

        let radiusScale = d3.scaleSqrt()
          .domain(d3.extent(datapoints, (d) => {return +d.sales})) //input values min/max
          .range([15,100])                                          //output values max/min
//RESETS
//forceY & forceX to default 0
        let simulation = d3.forceSimulation()
          .force("yforce", d3.forceY().strength(.1))
          .force("xforce", d3.forceX().strength(.1))
          .force("myCollide", d3.forceCollide((d) => { return radiusScale(d.sales)}));

        let circlesObj = svgObj.selectAll('.artists')
            .data(datapoints)
            .enter()
            .append('circle')
            .attrs({
              'class' : 'artist-circle',
              'r'     : (d) => { return radiusScale(d.sales)},
              'fill'  : 'lightblue'
            });

        let myTickFn = () => {
            circlesObj.attrs({
              "cx" : (d) => {return d.x},
              "cy" : (d) => {return d.y}
            })
          }
        
        simulation.nodes(datapoints)
          .on('tick', myTickFn)
      }

      d3.queue()
        .defer(d3.json, "data.json")
        .await(readyFn)