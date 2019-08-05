 // Variables
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Create primary <g> element
var chartDiv = d3.select('.chartDiv')
var svgObj = chartDiv.append('svg')
    .attr('width', width)
    .attr('height', height)
var gObj = svgObj.append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    .attr('class', 'gWrapper');

// Data strucure
var pt = d3.partition();


/*NOTE
  At each small step of the animation, 
   d3 needs to know what our startAngle (x0)
    and endAngle (x1) were originally 
    (so that when d3 re-calculates the arc,
     D3 have a starting point.
*/

var arcFn = d3.arc()
  .startAngle(d => {
    //save the "start" states for our angles
    d.x0s = d.x0; 
    return d.x0
  })
  .endAngle(d => {
    //save the "start" states for our angles 
    d.x1s = d.x1; 
    return d.x1; 
  })
  .innerRadius(d => d.y0)
  .outerRadius(d => d.y1);

var rootedData = null, sliceEnterData = null;

function makeRoot(data){
  
  // Find data root
  var root = d3.hierarchy(data)
      .sum(d => +d.data.size || 0)
  
  // Size arcs
  return pt(root);
}

/*

  Calculate the correct distance to rotate each label based on its location in the sunburst.
  @param {Node} d
  @return {Number}

  TRANSLATE: "translate(" + arc.centroid(d) + ")" moves the reference point for this <text> element to the center of each arc (the variable we defined above). 
  The centroid command from d3 computes the midpoint [x, y] of each arc.
  ROTATE: "rotate(" + computeTextRotation(d) + ")" then we'll rotate our <text> element a specified number of degrees. We'll do that calc in a separate function below.

*/

function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;

    // Avoid upside-down labels
    return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
}

function transformText(d){
  return "translate(" + arcFn.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"
}

function arcTweenPath(a, i) {  

  function tween(t) { 
    var b = interp(t);  
    a.x0s = b.x0;  
    a.x1s = b.x1;  
    return arcFn(b);
  }  
  // interpolate docs
  // https://github.com/d3/d3-interpolate#d3-interpolate
    var interp = d3.interpolate({ 
      x0: a.x0s, 
      x1: a.x1s 
    }, a);
    
    return tween;  // <-- 6
}

function arcTweenText(a, i) {

    var interp = d3.interpolate({ 
      x0: a.x0s, 
      x1: a.x1s 
    }, a);
    function tween(t) {
        var b = interp(t);
        return "translate(" + arcFn.centroid(b) + ")rotate(" + computeTextRotation(b) + ")";
    }
    return tween;
}

function toggleOrder() {

    // Determine how to size the slices
    if (this.value === "size") {
      rootedData.sum(d => d.data.size);
    }
    
    if (this.value === "count"){
      rootedData.count();
    }
    
    rootedData.sort(function(a, b) { return b[this.value] - b[this.value]; });

    pt(rootedData);

    sliceEnterData.selectAll("path")
      .transition()
      .duration(1350)
      .ease(d3.easeElastic)
      //attrTween docs
    //https://github.com/d3/d3-transition#transition_attrTween
      .attrTween("d", arcTweenPath);
    sliceEnterData.selectAll("text")
      .transition()
      .duration(1350)
      .ease(d3.easeElastic)
      //attrTween docs
      //https://github.com/d3/d3-transition#transition_attrTween
      .attrTween("transform", arcTweenText);  // <-- 8

}


function buildChart(data){

    //stratify data
    let stratData = d3.stratify()

        //set the 'id' of each 'node'
        .id(d => d.name)

        //set the parentID accesor of each 'node'
        .parentId(d => d.parent)
        
        //apply the data to the stratify
        (data)

        //calcs sum of 'parent' nodes
        .sum(d => +d.size || 0)

        //optionally sort the data by size here
        .sort((a,b) => a.size - b.size);
      
    pt.size([2 * Math.PI, radius]);
    
    rootedData = makeRoot(stratData);
    
     // Add a <g> element for each node in thd data, then append <path> elements and draw lines based on the arc
    // variable calculations. Last, color the lines and the slices.
    let sliceDataJoin = gObj.selectAll('g')
      .data(rootedData.descendants());
    
    sliceEnterData = sliceDataJoin.enter()
      .append('g')
      .attr("class", "sliceGWrapper")
    
    let singlePath = sliceEnterData.append('path')
      .attrs({
        "display": d => d.depth ? null : "none",
        "d": arcFn,
        'class':'singlePath'
      })
      .style('stroke', '#fff')
      .style("fill", function (d) { 
        let dOrParent = d.children ? d : d.parent;
        
        return colorScale((d.children ? d : d.parent).data.id); 
      });

    d3.selectAll(".sizeSelect").on("click", toggleOrder);
}


d3.json('./data.json', data => {
  buildChart(data)
})