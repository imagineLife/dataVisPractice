const state = {
	m: {
		t: 10,
		r: 30,
		b: 30,
		l: 40
	},
	w: 550,
	h: 450,
	minData: 0,
	maxData: n => Math.round(n * 1.1),
	boxW: 100,
	yScale: null,
	xScale: null,
}

//dimensions, less-margins (Margin Convention)
// https://bl.ocks.org/mbostock/3019563
const wLM = state.w - state.m.l - state.m.r;
const hLM = state.h - state.m.t - state.m.b;


const svg = d3.select('#multiple-plots').append('svg')
	.attrs({
		class: 'svg-wrapper',
		width: state.w,
		height: state.h
	})

const gWrapper = svg.append('g').attrs({
	class: 'g-wrapper',
	transform: `translate(${state.m.l}, ${state.m.t})`
})

function getSpecies(d) { return d.Species }
function getSepal(d) { return d.Sepal_Length }
function mapAndSortSepals(d) {
	return d.map(getSepal).sort(d3.ascending)
}
const prepData = (srcData) => {	
  // nest function allows to group the calculation per level of a factor
  const stats = d3
    .nest()
    .key(getSpecies)
    .rollup(function (d) {
      q1 = d3.quantile(
        mapAndSortSepals(d),
        0.25
      );
      median = d3.quantile(mapAndSortSepals(d), 0.5);
			q3 = d3.quantile(mapAndSortSepals(d), 0.75);
			
      interQuantileRange = q3 - q1;
      min = q1 - 1.5 * interQuantileRange;
      max = q3 + 1.5 * interQuantileRange;
      return {
        q1,
        median,
        q3,
        interQuantileRange,
        min,
        max,
      };
    })
    .entries(srcData);

  return stats;
}

function rectD(d) {
	return state.xScale(d.key) - state.boxW / 2 + state.xScale.bandwidth() / 2;
}

function lineX(d) {
	return state.xScale(d.key) + (state.xScale.bandwidth() / 2)
}

function lineY1(d) {
	return state.yScale(d.value.min)
}

function lineY2(d) {
	return state.yScale(d.value.max);
}

function rectY(d) {
	return state.yScale(d.value.q3)
}
const enterFn = e => {

	// the line
	e.append('line')
		.attrs({
			x1: lineX,
			x2: lineX,
			y1: lineY1,
			y2: lineY2,
			stroke: `black`,
		});

	//append the boxes
	e.append('rect')
		.attrs({
			x: rectD,
			y: rectY,
			height: d => state.yScale(d.value.q1) - state.yScale(d.value.q3),
			width: state.boxW,
			stroke: 'black'
		})
		.style('fill', '#69b3a2')

	//append the hz lines
	e.append("line")
      .attrs({
      	"x1": d => state.xScale(d.key)-state.boxW/2 + state.xScale.bandwidth() / 2,
      	"x2": d => state.xScale(d.key)+state.boxW/2+ state.xScale.bandwidth() / 2 ,
      	"y1": d => state.yScale(d.value.median),
      	"y2": d => state.yScale(d.value.median),
      	"stroke": "black"
      })
      .style("width", 80)
}

async function runIt() {
  //load the data
	const DATA_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv';
  try {
    const data = await d3.csv(DATA_URL);
    const prepped = prepData(data);

    // //build y-Scale
    state.yScale = d3.scaleLinear().domain([state.minData, 9]).range([hLM, state.m.t]);

    //build x-scale
    state.xScale = d3.scaleBand().domain(['setosa', 'versicolor', 'virginica']).range([0, state.w]);

    //build axis objs
    const yAxisObj = d3.axisLeft(state.yScale);
    const xAxisObj = d3.axisBottom(state.xScale);

    //append yAxis to gWrapper
    gWrapper.call(yAxisObj);
    gWrapper
      .append('g')
      .attrs({
        class: 'x-axis-g-wrapper',
        transform: `translate(0, ${hLM})`,
      })
      .call(xAxisObj);

    //append central vertical box-plot line
    let dataJoin = gWrapper.selectAll('.vertical-lines').data(prepped);

    dataJoin.join(enterFn);
  } catch (e) {
    console.log('e');
    console.log(e);
  }
}

runIt()