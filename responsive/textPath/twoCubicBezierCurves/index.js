  //Create the SVG
  var chartDiv = document.getElementById("chartDiv");
  var svgObj = d3.select(chartDiv).append("svg");
  var path = svgObj.append('path')
  var txtElement = svgObj.append('text')
  var txtPath = txtElement.append("textPath").attr('class','txtPath')


function drawPathAndText(divID, txt){
  // Extract the width and height that was computed by CSS.
          var width = chartDiv.clientWidth,
              height = chartDiv.clientHeight;

          //x width of beginning & end
          let lineB = width * .05
          let lineE = width * .95

          //heights, close to top, close to bottom
          let qH = height * .1
          let tqH = height * 1.15
          
          //mid-width
          let midW = width / 2
          let midH = height / 2

          let twoW = width * .2
          let fourW = width * .4
          let sixW = width * .6
          let eightW = width * .8

      svgObj.attrs({
        "width": width,
        "height": height
      });

  //Create an SVG path (based on bl.ocks.org/mbostock/2565344)
    path.attrs({
      "id": "wavy", //Unique id of the path
      "d": `M${lineB} ${midH} C ${twoW} ${qH}, ${fourW} ${qH}, ${sixW} ${midH} S ${eightW} ${tqH}, ${lineE} ${midH}` //SVG path
    }) 
    .style("fill", "none")
    .style("stroke", "#AAAAAA");

  //Create an SVG text element and append a textPath element
   //append a textPath to the text element
      txtPath.attr("xlink:href", "#wavy") //place the ID of the path here
        .style("text-anchor","middle") //place the text halfway on the arc
        .attr("startOffset", "50%")
        .text(txt);
}


drawPathAndText("chartDiv", "Yay, my text is on a wavy path")
window.addEventListener("resize", () => drawPathAndText(chartDiv, "Yay, my text is on a wavy path"));