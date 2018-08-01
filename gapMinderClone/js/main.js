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

function makeLogScale(baseVal, domainArr, rangeArr ){
	return d3.scaleLog()
		.base(baseVal)
		.domain(domainArr)
		.range(rangeArr);
}

function makeLinearScale(domainArr, rangeArr){
	return d3.scaleLinear()
		.domain(domainArr)
		.range(rangeArr);
}

d3.json("data/data.json").then(function(data){

	let timeVar = 0;

	//domain & range vars
	const logDomain = [142, 150000],
		logRange = [0, v.setWidth],
		linearRange = [v.setHeight],
		linearDomain = [0,90],
		radiusDom = [2000,1400000000],
		radiusRange = [25*Math.PI, 1500*Math.PI];
	
	//calculate svg dimensions less margins
	const heightLessMargins = v.setHeight - v.margin.t - v.margin.b;
	const widthLessMargins = v.setWidth - v.margin.l - v.margin.r;

	//make svg & g objects
	let svgObj = appendElement('#chart','svg',heightLessMargins, widthLessMargins, 'svgObj');
	let gObj = appendD3Element(svgObj, 'g', 'gWrapper');
	gObj.attr('transform', `translate( ${v.margin.l}, ${v.margin.t})`);

	//make x & y & circle-radius scales
	let xScale = makeLogScale(10, logDomain, logRange);
	let yScale = makeLinearScale(linearDomain, linearRange);
	let radiusScale = makeLinearScale(radiusDom, radiusRange);




	

})