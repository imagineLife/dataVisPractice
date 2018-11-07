const sizeLegend = (parent, props) => {
  const {
    radiusScale,
    spacing,
    textOffset,
    numTicks,
    tickFormat,
    circleFill
  } = props;
  
  const ticks = radiusScale.ticks(numTicks)
    .filter(d => d !== 0)
    .reverse();

  const groups = parent.selectAll('g').data(ticks);
  const groupsEnter = groups
    .enter().append('g')
      .attr('class', 'tick');
  groupsEnter
    .merge(groups)
      .attr('transform', (d, i) =>
        `translate(0, ${i * spacing})`
      );
  groups.exit().remove();
  
  groupsEnter.append('circle')
    .merge(groups.select('circle'))
      .attr('r', radiusScale)
      .attr('fill', circleFill);
  
  groupsEnter.append('text')
    .merge(groups.select('text'))
      .text(tickFormat)
      .attr('dy', '0.32em')
      .attr('x', d => radiusScale(d) + textOffset);
  
}