const v = {
	margin: {
		t: 50,
		r: 20,
		b: 100,
		l: 80
	},
	setHeight: 500,
	setWidth: 800
}

function appendElement(parent, type, w, h, className){
	return d3.select(parent)
		.append(type)
		.attrs({
			'width': w,
			'height': h,
			'class': className
		})
}

function appendD3Element(parent, type, className){
	return parent.append(type).attr('class', className)
}

d3.json("data/data.json").then(function(data){
	console.log(data);
	
	//calculate svg dimensions less margins
	const heightLessMargins = v.setHeight - v.margin.t - v.margin.b;
	const widthLessMargins = v.setWidth - v.margin.l - v.margin.r;

	let svgObj = appendElement('#chart','svg',heightLessMargins, widthLessMargins, 'svgObj');
	let gObj = appendD3Element(svgObj, 'g', 'gWrapper');
	gObj.attr('transform', `translate( ${v.margin.l}, ${v.margin.t}`);

})