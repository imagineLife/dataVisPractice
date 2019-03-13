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

function makeNumPi(val1,val2,fn){
    return fn(Math.floor(val1 * 180 / val2 - 90));
}

let m = {top:10, right:10, bottom: 10, left:10};

let Gauge = function(configuration) {
  let myObj = {}

  let cfg = {
    size: 750,

    minValue: 0,
    maxValue: 100000,

    minAngle: -90,
    maxAngle: 90,

    ms: 750,

    bigLabel: {
        size: 20,
        inset: 50,
        font: "Helvetica",
        fs: 15
    },
    labelFormat: (numberToFormat) => {
      let prefix = d3.formatPrefix(numberToFormat)
      return prefix.scale(numberToFormat) + '' + prefix.symbol.toUpperCase()
    },

    arcColorFn:(value) => {
        let result = (function(val) {
            console.log('val')
            console.log(val)
            
            switch(val){
                case (val >= 0 && val <= 24999):
                    return 'green';
                    break;
                case (val = 25000 || val <= 49999):
                    return 'yellow';
                    break;
                case (val >= 50000 && val <= 74999):
                    return 'orange';
                    break;
                default:
                    return 'red';
                    break;
            }
        })(value)
        console.log('result')
        console.log(result)
        
        return result
    }
  }

  let coloredArc, arc, bigValueLabel;
  let cur_color;
  let new_color, hold;

  // var oR = cfg.size - cfg.arcInset;
  // var iR = cfg.size - oR - cfg.arcWidth;

  function deg2rad(deg) {
    return deg * Math.PI / 180
  }

  function render(arcLength) {

    let {chartDiv, svgObj, gObj} = lib.makeD3ObjsFromParentID('chartDiv');

    let { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins } = lib.getDimsFromParent(chartDiv, m)
    
    let smallerWorH = Math.min(parentDivWidth, parentDivHeight)
    
    const oR = smallerWorH * .45;
    const iR = oR * .45;
    const gaugeWidth = oR - iR;

    // Arc Defaults
    arcFn = d3.svg.arc()
      .innerRadius(iR)
      .outerRadius(oR)
      .startAngle(deg2rad(-90))

    // Place svg element
    svgObj.attrs({
      "width": parentDivWidth,
      "height": parentDivHeight * .65
    })

      gObj.attr("transform", `translate(${parentDivWidth / 2},${oR + 20})`)

    // Append background arc to svg
    var grayBG = makeGaugePath(gObj,{ endAngle: deg2rad(90)}, "gaugeBackground", arcFn); 

    // Append foreground arc to svg
    coloredArc = makeGaugePath(gObj,{ endAngle: deg2rad(-90)}, "gaugeForegroung", arcFn); 


    // Display Max value
    var max = makeArcLabel(gObj, `translate(${(iR + ((oR - iR) / 2))},15)`, cfg.bigLabel.font, cfg.labelFormat(cfg.maxValue));
    var min = makeArcLabel(gObj, `translate(${ -(iR + ((oR - iR) / 2))},15)`, cfg.bigLabel.font, cfg.minValue)

    // Display Current value  
    bigValueLabel = gObj.append("text")
      .attrs({
        "transform": `translate(0,${ -(-cfg.bigLabel.inset + iR / 4)})`, // Push up from center 1/4 of innerRadius
        "text-anchor": "middle"
      })
      .style("font-size", cfg.bigLabel.size)
      .style("font-family", cfg.labelFont)
      .text(bigValueLabel)

    new_color = cfg.arcColorFn(arcLength)

    var numPi = makeNumPi(arcLength, cfg.maxValue, deg2rad)

    // Display Current value
    bigValueLabel.transition()
      .text(arcLength)

    // Arc Transition
    coloredArc.transition()
      .duration(cfg.ms)
      .styleTween("fill", function() {
        return d3.interpolate(new_color, cur_color);
      })
      .call(arcTween, numPi);

    // Set colors for next transition
    hold = cur_color;
    cur_color = new_color;
    new_color = hold;
  }


  function update(value) {
    // Get new color
    new_color = cfg.arcColorFn(value)
    console.log(new_color)


    var numPi = makeNumPi(value, cfg.maxValue, deg2rad)
    // console.log('update numPi')
    // console.log(numPi)
    
    // Display Current value
    bigValueLabel.transition()
      .text(value)

    // Arc Transition
    coloredArc.transition()
      .duration(cfg.ms)
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

  render(75000);
  myObj.update = update;
  myObj.configuration = cfg;
  return myObj;
}

let g = new Gauge({
  size: 300,
  arcLength: 75000
});

setTimeout(() => {
    g.update(25000);
}, 2000)