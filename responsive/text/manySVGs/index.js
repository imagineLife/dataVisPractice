var chartDiv = document.getElementById("chart");
var chartDiv2 = document.getElementById("chart2");
var svg = d3.select(chartDiv).append("svg");
var svg2 = d3.select(chartDiv2).append("svg");

      function setupTextToWork(t,w,h, str){
        return t.enter().append("text")
            .attr("text-anchor", "middle")
            .text(str)
          .merge(t)
            .attrs({
              "x": w / 2,
              "y": h / 2,
              "font-size": (w * 0.007) + "em"
            });
      }

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

        svg2
          .attrs({
            "width": width,
            "height": height
          });

        // Draw an X to show that the size is correct.
        var text = svg.selectAll("text").data([1]);
        var text2 = svg2.selectAll("text").data([1]);
        setupTextToWork(text, width, height, '1Dummy Here')
        setupTextToWork(text2, width, height, 'Dummy2 Here')
        
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