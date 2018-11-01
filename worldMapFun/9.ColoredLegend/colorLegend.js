const buildColorLegend = (parent, props) => {
  const {                      
    colorScale,                
    circleRadius,
    spacing,                   
    textOffset,
    backgroundRectWidth        
  } = props;                   
  
  const backgroundRect = parent.selectAll('rect')
    .data([null]);             
  const n = colorScale.domain().length; 
  backgroundRect.enter().append('rect')
    .merge(backgroundRect)
      .attrs({
        'x': -circleRadius * 2,
        'y': -circleRadius * 2, 
        'rx': circleRadius * 2,   
        'width': backgroundRectWidth,
        'height': spacing * n + circleRadius * 2, 
        'fill': 'white',
        'opacity': 0.8
      });
  

  const groups = parent.selectAll('.tick')
    .data(colorScale.domain().sort());
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
      .attr('r', circleRadius)
      .attr('fill', colorScale);      
  
  groupsEnter.append('text')
    .merge(groups.select('text'))   
      .text(d => d)
      .attr('dy', '0.32em')
      .attr('x', textOffset);
}

