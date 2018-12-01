const v = {
	margin: { t: 50, r: 20, b: 75, l: 80 },
	setHeight: 500,
	setWidth: 800,
	xLabelText: 'GDP Per Capita ($)',
	yLabelText: 'Life Expectancy (Yrs)',
	timeLabelText: '1800'
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

function makeLabel(parent, xVal, yVal, textVal){
	return parent.append('text')
		.attrs({
			'y': yVal,
			'x': xVal,
			'font-size': '20px',
			'text-anchor': 'middle',
		})
		.text(textVal)
}

function makeD3xAxis(scaleObj, tickVals, tickFormatFn){
	return d3.axisBottom(scaleObj)
		.tickValues(tickVals)
		.tickFormat(tickFormatFn)
}

function makeD3yAxis(scaleObj){
	return d3.axisLeft(scaleObj)
		.tickFormat(function(d){ return +d})
}

function connectAxisToParent(parent, transformation, className){
	return parent.append('g')
		.attrs({
			'class': className,
			'transform': transformation
		})
}

function makeTxtStr(myTxt){

	return `<strong>${myTxt}</strong> <span style="color:red;">${d[myTxt]}</span><br>`
}

function stepForward(){
	timeVar = (timeVar < 214) ? timeVar+1 : 0
	drawAndUpdateCircles(formattedData[timeVar]);   
}

function drawAndUpdateCircles(data) {
    // Standard transition timeVar for the visualization
    var t = d3.transition().duration(150).ease(d3.easeLinear);

    // JOIN new data with old elements
    //ALSO note the data method
    /*
		telling d3 to note d.country makes the circles
		track items based on their country value, rather than their indexs in the arrays
    */
    var circles = gWrapper.selectAll("circle")
	    .data(data, (d) => d.country);

    // EXIT old elements not present in new data.
    circles.exit()
        .attr("class", "exit")
        .remove();

    // ENTER new elements present in new data.
    circles.enter()
        .append("circle")
        .attrs({
        	"class": "enter",
        	"fill": (d) => colorScale(d.continent)
        })
        .merge(circles)
        .transition(t)
            .attrs({
            	"cy": (d) => yScale(d.life_exp),
            	"cx": (d) => xScale(d.income),
            	"r" : (d) => Math.sqrt(radiusScale(d.population) / Math.PI)
            })

    // drawAndUpdateCircles the time label
    timeAxisLabel.text(+(timeVar + 1800))
}

let timeVar = 0,
 	formattedData, 
 	loopInt,
 	playPauseBtn = d3.select('#play-button');

//calculate svg dimensions less margins
const heightLessMargins = v.setHeight - v.margin.t - v.margin.b;
const widthLessMargins = v.setWidth - v.margin.l - v.margin.r;	

//domain & range vars
const logDomain = [142, 150000],
	logRange = [0, v.setWidth],
	linearRange = [heightLessMargins, 0],
	linearDomain = [0,90],
	radiusDom = [2000,1400000000],
	radiusRange = [25*Math.PI, 1500*Math.PI];

//make svg & g objects
let svgObj = appendElement('#chart','svg', v.setWidth, v.setHeight, 'svgObj');
let gWrapper = appendD3Element(svgObj, 'g', 'gWrapper');
gWrapper.attr('transform', `translate( ${v.margin.l}, ${v.margin.t})`);

//make x & y & circle-radius scales
let xScale = makeLogScale(10, logDomain, logRange);
let yScale = makeLinearScale(linearDomain, linearRange);
let radiusScale = makeLinearScale(radiusDom, radiusRange);
const colorScale = d3.scaleOrdinal(d3.schemePastel1)

//make axis labels
let xAxisLabel = makeLabel(gWrapper, ( widthLessMargins / 2 ), ( v.setHeight - 80 ), v.xLabelText);
let yAxisLabel = makeLabel(gWrapper, ( -170 ), ( -40 ), v.yLabelText);
	yAxisLabel.attr('transform','rotate(-90)')
let timeAxisLabel = makeLabel(gWrapper, ( -40 ), ( -10 ), v.timeLabelText);


//make axis objects
let xAxisObj = makeD3xAxis(xScale, [400, 4000, 40000], d3.format('$'))
let yAxisObj = makeD3yAxis(yScale)

//append axis to gWrapper
let transformString = "translate(0," + (heightLessMargins) +")";
let xAxisG = connectAxisToParent(gWrapper, transformString, 'xAxisG');
	xAxisG.call(xAxisObj)
let yAxisG = connectAxisToParent(gWrapper, `translate(0, 0)`, 'yAxisG');
	yAxisG.call(yAxisObj)

let myToolTip = d3.tip().attr('class', 'd3ToolTip')
	.html(d => {
		return makeTxtStr('country')
		console.log('txt is ')
		console.log(txt)
	})

gWrapper.call(myToolTip)
/*
LEGEND HERE!
*/
let legendGWrapper = gWrapper.append('g')
	.attr('transform', `translate(${(widthLessMargins - 10)}, ${(heightLessMargins - 125)})`)

const continents = ['europe','asia','americas','africa']

//make legend-row groups 1-per-continent
continents.forEach((c,ind) => {
	
	let legendRow = legendGWrapper.append('g')
		.attrs({
			'class': `legendG ${c}`,
			//add 20px for non-overlapping
			'transform': `translate(0, ${(ind * 20)})`
		})


	legendRow.append('rect').attrs({
		'width': 10,
		'height': 10,
		'fill': colorScale(c)
	})

	legendRow.append('text').attrs({
		'x': -10,
		'y': 10,
		'text-anchor': 'end'
	}).style('text-transformation', 'capitalization')
	.text(c)

})



d3.json("data/data.json").then((data) => {

	// Clean data
	formattedData = data.map((yearObj) => {

	    return yearObj["countries"].filter((country) => {

	    	//if this country HAS data, return this country by returning true
	        var dataExists = (country.income && country.life_exp);
	        return dataExists
	    })
	    .map((country) => {
	        country.income = +country.income;
	        country.life_exp = +country.life_exp;
	        return country;            
	    })
	});

    // First run of the visualization
    drawAndUpdateCircles(formattedData[0]);

    return true

})

//play-button click method
playPauseBtn.on('click', () => {
	let btnTxt = playPauseBtn.text();

	if(btnTxt == 'Play'){
		playPauseBtn.text('Pause')
		loopInt = setInterval(stepForward, 100)
	}
	if(btnTxt == 'Pause'){
		playPauseBtn.text('Play')
		clearInterval(loopInt)
	}
})

//http://localhost:8080/gapMinderClone/