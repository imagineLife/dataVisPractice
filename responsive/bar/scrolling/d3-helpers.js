function makeLinearScale(domMin, domMax, rangeMin, rangeMax) {
  return d3.scaleLinear().domain([domMin, domMax]).range([rangeMin, rangeMax]);
}

function makeClipPath(parent, id, w, h, cl) {
  return parent.append('clipPath').attr('id', id).append('rect').attrs({
    width: w,
    height: h,
    class: cl,
  });
}

function makeAxisGWrapper({parent, transformation, className, axisObj}) {
  return parent
    .append('g')
    .attrs({
      transform: transformation,
      class: className,
    })
    .call(axisObj);
}

function makeAxisLabel({ parent, transformation, className, textVal }) {
  return parent
    .append('g')
    .attr('transform', transformation)
    .append('text')
    .attrs({
      'text-anchor': 'middle',
      class: className,
    })
    .text(textVal);
}
