let state = {
  w: 460,
  h: 400,
  wLM: null,
  hLM: null,
  m: {t: 10, r: 30, b: 30, l: 40},
  hexbin: null, 
  hexColorScale: null,
  shadingColorScale: null,
  hexSVG: null,
  hexGWrapper: null,
  histoSVG: null,
  histGWrapper: null,
  shadingSVG: null,
  shadingGWrapper: null
}

const prepDoc = (divID, svgStorage, gStorage) => {
  return new Promise((res, rej) => {
    state.wLM = state.w - state.m.l - state.m.r
    state.hLM = state.h - state.m.t - state.m.b

    // append the svg object to the body of the page
    state[svgStorage] = d3.select(divID)
      .append("svg")
        .attr("width", state.w )
        .attr("height", state.h)

    state[gStorage] = state[svgStorage].append("g")
      .attr("transform", `translate(${state.m.l},${state.m.t})`);
      res()
  })
}

const enterHB = (e) => {
  e.append("path")
    .attrs({
      "d": state.hexbin.hexagon(),
      "transform": function(d) { return "translate(" + d.x + "," + d.y + ")"; },
      "fill": function(d) { return state.hexColorScale(d.length); },
      "stroke": "black",
      "stroke-width": "0.1"
  })
}

const appendAxis = (parent, axisObj, trans) => {
  parent.append("g")
    .attr("transform", trans)
    .call(axisObj);
}

prepDoc("#hexDiv", 'hexSVG', 'hexGWrapper')
.then(prepDoc("#shadingDiv", 'shadingSVG', 'shadingGWrapper'))
.then(prepDoc("#histoDiv", 'histoSVG', 'histGWrapper'))
.then(() => {
  // read data
  d3.json("./data.json").then(data => {

    let dataXtent = d3.extent(data, d => d.x)
    let dataYtent = d3.extent(data, d => d.y)

    //set scales
    var xScale = d3.scaleLinear()
      .domain([dataXtent[0] * .95, dataXtent[1] * 1.05])
      .range([ 0, state.wLM ]);

    var yScale = d3.scaleLinear()
      .domain([dataYtent[0] * .95, dataYtent[1] * 1.05])
      .range([ state.hLM, 0 ]);

    //add axis objects    
    const xAxisObj = d3.axisBottom(xScale)
    const yAxisObj = d3.axisLeft(yScale)


    appendAxis(state.hexGWrapper, xAxisObj,`translate(0,${state.hLM})`)
    appendAxis(state.hexGWrapper, yAxisObj, null)

    appendAxis(state.shadingGWrapper, xAxisObj,`translate(0,${state.hLM})`)
    appendAxis(state.shadingGWrapper, yAxisObj, null)

    // appendAxis(state.histGWrapper, xAxisObj,`translate(0,${state.hLM})`)
    // appendAxis(state.histGWrapper, yAxisObj, null)


    /*
      HEXBIN
      Reformat the data: 
      d3.hexbin() needs a specific format
      array of points
      [ scaledX, scaledY ]
    */
     
    var inputForHexbinFun = []
    data.forEach(function(d) {
      inputForHexbinFun.push( [xScale(d.x), yScale(d.y)] )  // Note that we had the transform value of X and Y !
    })

    let numberOfColors = inputForHexbinFun.length / 100
    
    // Prepare a color palette
    state.hexColorScale = d3.scaleLinear()
        .domain([0, numberOfColors])
        .range(["transparent",  "#69b3a2"])

    // Compute the hexbin data, update the hexbin var
    state.hexbin = d3.hexbin()
      /*
         size of the bin in px, takes some guessing...
         12 makes bigger bins AND darker/brighter colors
         6  makes smaller  "" AND lighter/duller  ""
      */
      .radius(9)
      .extent([ [0, 0], [state.wLM, state.hLM] ])

    const hexedData = state.hexbin(inputForHexbinFun)

    // Plot the hexbins
    state.hexGWrapper.append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attrs({
          "width": state.wLM,
          "height": state.hLM
        })

    state.hexGWrapper.append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("path")
      .data(hexedData)
      .join(enterHB)

    

    /*
      CONTOUR 
    */

    state.shadingColorScale = d3.scaleLinear()
      .domain([0, 1]) // Points per square pixel.
      .range(["white", "#69b3a2"])

    // compute the density data
    const densityData = d3.contourDensity()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); })
      .size([state.w, state.h])
      .bandwidth(20)
      (data)

    // show the shape!
    state.shadingSVG.insert("g", "g")
      .selectAll("path")
      .data(densityData)
      .enter().append("path")
        .attrs({
          "d": d3.geoPath(),
          "fill": d => state.shadingColorScale(d.value)
        })



    /*
      HISTOGRAM
    */

    // Get max and min of data
    var xLim = [4,18]
    var yLim = [6,20]

     // Add X axis
    var histXScale = d3.scaleLinear()
      .nice()
      .domain(xLim)
      .range([ 0, state.wLM ]);
    state.histGWrapper.append("g")
      .attr("transform", "translate(0," + state.hLM + ")")
      .call(d3.axisBottom(histXScale));

    // Add Y axis
    var histYScale = d3.scaleLinear()
      .nice()
      .domain(yLim)
      .range([ state.hLM, 0 ]);
    state.histGWrapper.append("g")
      .call(d3.axisLeft(histYScale));

     // Reformat the data: d3.rectbin() needs a specific format
    var inputForRectBinning = []
    data.forEach(d => {
      inputForRectBinning.push( [+d.x, +d.y] )  // Note that we had the transform value of X and Y !
    })

    // Compute the rectbin
    var size = 0.5
    var rectbinData = d3.rectbin()
      .dx(size)
      .dy(size)
      (inputForRectBinning)

    // Prepare a color palette
    var color = d3.scaleLinear()
        .domain([0, 350]) // Number of points in the bin?
        .range(["transparent",  "#69a3b2"])

    // What is the height of a square in px?
    heightInPx = histYScale( yLim[1]-size )

    // What is the width of a square in px?
    var widthInPx = histXScale(xLim[0]+size)

    // Now we can add the squares
    state.histGWrapper.append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", state.wLM)
        .attr("height", state.hLM)
    state.histGWrapper.append("g")
        .attr("clip-path", "url(#clip)")
      .selectAll("myRect")
      .data(rectbinData)
      .enter().append("rect")
        .attrs({
          "x": d => histXScale(d.x),
          "y": d => histYScale(d.y) - heightInPx,
          "width": widthInPx ,
          "height": heightInPx ,
          "fill": d => color(d.length),
          "stroke": "black",
          "stroke-width": "0.4"
        })
  })
})