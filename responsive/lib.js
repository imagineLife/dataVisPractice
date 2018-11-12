let lib = {};

lib.makeD3ObjsFromParentID = (parentID) => {
  //Select/Create div, svg, g
  const chartDiv = document.getElementById(parentID);     
  const svgObj = d3.select(chartDiv).append("svg").attr("border", '2px solid green');
  const gObj = svgObj.append('g').attr('class','gWrapper');

  return {chartDiv, svgObj, gObj}
}

lib.getDimsFromParent = (parent, m) => {
  // Extract the DIV width and height that was computed by CSS.
  let parentDivWidth = parent.clientWidth;
  let parentDivHeight = parent.clientHeight;

  //get css-computed dimensions
  const divWidthLessMargins = parentDivWidth - m.left - m.right;
  const divHeightLessMargins = parentDivHeight - m.top - m.bottom;

  return { parentDivWidth, parentDivHeight, divWidthLessMargins, divHeightLessMargins }
}

lib.appendAxisObjToParent = (axisObj, parent, className) => {
  return parent.call(axisObj)
    .selectAll('.tick line').attrs({
      'class':className,
      'stroke-dasharray': '1, 5'
    });
}

lib.appendGElement = (parent, trans, cl) => {
	return parent.append('g')
 .attrs({
   'transform': trans,
   'class':cl
 });
}

lib.makeAxisLabel = (parent, className, xPos, yPos, transformation, anch, textVal) => {
	return parent.append('text')
	.attrs({
		'class': className,
		'x': xPos,
		'y': yPos,
		'transform': transformation
	})
	.style('text-anchor', anch)
	.text(textVal);
}

lib.setAxisLabelAttrs = (parent, cl, xVal, yVal, trans, txtAnc, txt) => {
	console.log('here')
	return parent
	 .attrs({
	   'class': cl,
	   'x': xVal,
	   'y': yVal,
	   'transform': trans
	 })
	 .style('text-anchor', txtAnc)
	 .text(txt);
}

lib.makeAxisG = (parent, transformation, className) => {
	return parent.append('g')
	.attrs({
		'transform': transformation,
		'class':className
	});
}

lib.resetAxisG = (axisG, transform, xPos, yPos, caller) => {
	return axisG
   .attrs({
       'transform': transform,
       'x' : xPos,
       'y' : yPos,
   })
   .call(caller);
}