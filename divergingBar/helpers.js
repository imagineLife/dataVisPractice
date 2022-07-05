//helpers
const getCountry = (d) => d.country;
const getAnnualGrowth = (d) => d.annual_growth;
const getScaledCountry = (d) => yScale(d.country);
const getColoredGrowth = (d) => colorScale(d.annual_growth);

function parse(d) {
  d.rank = +d.rank;
  d.annual_growth = +d.annual_growth;
  return d;
}

//state data
const state = {
  labelMargin: 5,
  xAxisMargin: 10,
  legendRightMargin: 0,
  margin: {
    top: 40,
    right: 50,
    bottom: 60,
    left: 50
  }
}

//dimensions
const width = 960,
    height = 500;
const wLM = width - state.margin.left - state.margin.right,
  hLM = height - state.margin.top - state.margin.bottom;
      
function appendG({ parent, className, trans }) {
  return parent.append('g').attrs({
    class: className,
    transform: trans,
  });
}