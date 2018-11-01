  //Create the SVG
  var chartDiv = document.getElementById("chartDiv");
  var svgObj = d3.select(chartDiv).append("svg");
  var path = svgObj.append('path')
  var txtElement = svgObj.append('text')
  var txtPath = txtElement.append("textPath")


function drawPathAndText(divID, txt){
  // Extract the width and height that was computed by CSS.
          var width = chartDiv.clientWidth,
              height = chartDiv.clientHeight;

          let lineB = width * .1
          let lineE = width * .9

          let midH = height * .5
          let qH = height * .15
          let tqH = height
          
          let qW = width * .25
          let tqW = width * .75
          let midW = width / 2

              console.log('width')
              console.log(width)

      svgObj.attrs({
        "width": width,
        "height": height
      });

  //Create an SVG path (based on bl.ocks.org/mbostock/2565344)
    path.attrs({
      "id": "wavy", //Unique id of the path
      "d": `M${lineB} ${qH} C ${midW} ${tqH}, ${midW} ${tqH}, ${lineE} ${qH}` //SVG path
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