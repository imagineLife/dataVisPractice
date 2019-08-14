let state = {
  w: 460,
  h: 400,
  wLM: null,
  hLM: null,
  m: {t: 10, r: 30, b: 30, l: 40},
  hexbin: null, 
  colorScale: null,
  hexSVG: null,
  hexGWrapper: null,
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
      "fill": function(d) { return state.colorScale(d.length); },
      "stroke": "black",
      "stroke-width": "0.1"
  })
}

prepDoc("#hexDiv", 'hexSVG', 'hexGWrapper')
.then(prepDoc("#shadingDiv", 'shadingSVG', 'shadingGWrapper'))
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

    state.hexGWrapper.append("g")
      .attr("transform", `translate(0,${state.hLM})`)
      .call(xAxisObj);
    
    state.hexGWrapper.append("g")
      .call(yAxisObj);

    /*
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
    state.colorScale = d3.scaleLinear()
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
  })
})