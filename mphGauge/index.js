function makeArcLabel(parent,trans,ff,txt){
    return parent.append("text")
      .attrs({
        "transform": trans, // Set between inner and outer Radius
        "text-anchor": "middle"
      })
      .style("font-family", ff)
      .text(txt)
}

function makeGaugePath(parent,datum, className, dVal){
    return parent.append("path")
      .datum(datum)
      .attrs({
        "class": className,
        "d": dVal
      })
}

let Gauge = function(configuration) {
  let myObj = {}

  let config = {
    size: 300,
    arcInset: 150,
    arcWidth: 60,

    pointerWidth: 8,
    pointerOffset: 0,
    pointerHeadLengthPercent: 0.9,

    minValue: 0,
    maxValue: 100000,

    minAngle: -90,
    maxAngle: 90,

    transitionMs: 750,

    currentLabelFontSize: 20,
    currentLabelInset: 20,
    labelFont: "Helvetica",
    labelFontSize: 15,
    labelFormat: (numberToFormat) => {
      let prefix = d3.formatPrefix(numberToFormat)
      console.log(prefix)
      return prefix.scale(numberToFormat) + '' + prefix.symbol.toUpperCase()
    },

    arcColorFn: function(value) {
      let ticks = [{
        tick: 0,
        color: 'green'
      }, {
        tick: 25000,
        color: 'yellow'
      }, {
        tick: 50000,
        color: 'orange'
      }, {
        tick: 75000,
        color: 'red'
      }]
      let ret;
      ticks.forEach(function(tick) {

        if (value > tick.tick) {
          ret = tick.color
          return
        }
      });
      return ret;
    }
  }

  function configure(configuration) {
    for (let prop in configuration) {
      config[prop] = configuration[prop]
    }
  }
  configure(configuration);

  let coloredArc, arc, svg, current;
  let cur_color;
  let new_color, hold;

  var oR = config.size - config.arcInset;
  var iR = config.size - oR - config.arcWidth;

  function deg2rad(deg) {
    return deg * Math.PI / 180
  }

  function render() {
    
    // Arc Defaults
    arcFn = d3.svg.arc()
      .innerRadius(iR)
      .outerRadius(oR)
      .startAngle(deg2rad(-90))

    // Place svg element
    svg = d3.select("body").append("svg")
      .attr("width", config.size)
      .attr("height", config.size)
      .append("g")
      .attr("transform", "translate(" + config.size / 2 + "," + config.size / 2 + ")")

    // Append background arc to svg
    var grayBG = makeGaugePath(svg,{ endAngle: deg2rad(90)}, "gaugeBackground", arcFn); 

    // Append foreground arc to svg
    var coloredArc = makeGaugePath(svg,{ endAngle: deg2rad(-90)}, "gaugeForegroung", arcFn); 


    // Display Max value
    var max = makeArcLabel(svg, `translate(${(iR + ((oR - iR) / 2))},15)`, config.labelFont, config.labelFormat(config.maxValue));
    var min = makeArcLabel(svg, `translate(${ -(iR + ((oR - iR) / 2))},15)`, config.labelFont, config.minValue)

    // Display Current value  
    current = svg.append("text")
      .attr("transform", "translate(0," + -(-config.currentLabelInset + iR / 4) + ")") // Push up from center 1/4 of innerRadius
      .attr("text-anchor", "middle")
      .style("font-size", config.currentLabelFontSize)
      .style("font-family", config.labelFont)
      .text(config.labelFormat(current))
  }


  function update(value) {
    // Get new color
    new_color = config.arcColorFn(value)
    console.log(new_color)

    var numPi = deg2rad(Math.floor(value * 180 / config.maxValue - 90));

    // Display Current value
    current.transition()
      .text(value)
      // .text(config.labelFormat(value))

    // Arc Transition
    coloredArc.transition()
      .duration(config.transitionMs)
      .styleTween("fill", function() {
        return d3.interpolate(new_color, cur_color);
      })
      .call(arcTween, numPi);

    // Set colors for next transition
    hold = cur_color;
    cur_color = new_color;
    new_color = hold;
  }

  // Update animation
  function arcTween(transition, newAngle) {
    transition.attrTween("d", function(d) {
      var interpolate = d3.interpolate(d.endAngle, newAngle);
      return function(t) {
        d.endAngle = interpolate(t);
        return arcFn(d);
      };
    });
  }

  render();
  myObj.update = update;
  myObj.configuration = config;
  return myObj;
}

let g = new Gauge({
  size: 300
});
console.log(g)
g.update(70000);