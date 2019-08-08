var margin = {top: 60, right: 30, bottom: 20, left:110},
    width = 460;
    height = 400;
    const wLM = width - margin.left - margin.right;
    const hLM = height - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#chartDiv")
  .append("svg")
    .attrs({
      "width": width,
      "height": height
    });
const gWrapper = svg.append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//read data
d3.json("./data.json").then(data => {
  
  let thisData = data.data

  // Get the different categories and count them
  var categories = Object.keys(thisData[0])

  // Add X axis
  var xScale = d3.scaleLinear()
    .domain([-10, 140])
    .range([ 0, wLM ]);

    // Create a Y scale for densities
  var yScale = d3.scaleLinear()
    .domain([0, 0.4])
    .range([ hLM, 0]);

  // Create the Y axis for names
  var yNameScale = d3.scaleBand()
    .domain(categories)
    .range([0, hLM])
    .paddingInner(1)

  const xAxisObj = d3.axisBottom(xScale)
  const yAxisObj = d3.axisLeft(yNameScale)

    // Compute kernel density estimation for each column:
  var kde = kernelDensityEstimator(kernelEpanechnikov(7), xScale.ticks(40)) // increase this 40 for more accurate density.
  
  var allDensity = []
  for (i = 0; i < categories.length; i++) {
      key = categories[i]
      density = kde( thisData.map(function(d){  
        return d[key]; 
      }) )
      allDensity.push({key: key, density: density})
  }

  console.log('allDensity')
  console.log(allDensity)
  
  const lineFn = d3.line()
    .curve(d3.curveBasis)
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]))

  //make axis group elements
  gWrapper.append("g")
    .attr("transform", "translate(0," + hLM + ")")
    .call(xAxisObj);

  gWrapper.append("g")
    .call(yAxisObj);

  // Add areas
  gWrapper.selectAll(".areas")
    .data(allDensity)
    .enter()
    .append("path")
      .attr("transform", d => `translate(0,${yNameScale(d.key)-hLM})`)
        .datum(d => d.density)
        .attrs({
          "fill": "#69b3a2",
          'fill-opacity': .85,
          "stroke": "rgb(50,50,50)",
          "stroke-width": 1,
          "stroke-dasharray": "2 2",
          'class': 'areas',
          "d":  lineFn,
        })

})

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}