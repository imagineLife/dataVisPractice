let lib = {};

lib.appendGElement = (parent, trans, cl) => {
	return parent.append('g')
 .attrs({
   'transform': trans,
   'class':cl
 });
}

lib.setAxisLabelAttrs = (labelObj, cl, xVal, yVal, trans, txtAnc, txt) => {
	return labelObj
	 .attrs({
	   'class': cl,
	   'x': xVal,
	   'y': yVal,
	   'transform': trans
	 })
	 .style('text-anchor', txtAnc)
	 .text(txt);
}