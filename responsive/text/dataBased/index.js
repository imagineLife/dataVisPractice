var chartDiv = document.getElementById("chart");
      var svg = d3.select(chartDiv).append("svg");

      function redraw(){

        // Extract the width and height that was computed by CSS.
        var width = chartDiv.clientWidth,
            height = chartDiv.clientHeight;

        // Use the extracted size to set the size of an SVG element.
        svg
          .attrs({
          	"width": width,
          	"height": height
      		});

        // Draw an X to show that the size is correct.
        var text = svg.selectAll("text").data([1]);
        text
          .enter().append("text")
            .attr("text-anchor", "middle")
            .text("DummyText here")
          .merge(text)
            .attrs({
            	"x": width / 2,
            	"y": height / 2,
            	"font-size": (width * 0.007) + "em"
            });
        
        // Alternative behaviors:
        //  // Driven by height.
        //  .attr("font-size", (height * 0.007) + "em");
        //  // Driven by average of width and height.
        //  .attr("font-size", ((width + height)/2 * 0.007) + "em");
        
      }

      // Draw for the first time to initialize.
      redraw();

      // Redraw based on the new size whenever the browser window is resized.
      window.addEventListener("resize", redraw);