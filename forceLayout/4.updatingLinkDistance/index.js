// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is

function startAndStopAnimation(){
    console.log('start&stop!')
    d3Sim.restart()
    setTimeout(() => {
        d3Sim.stop()
    }, 300)
}

//initialize viz
function initForce(){
     
     //1. clear svg
     svg.selectAll('*').remove();



}


//animStepInt how fast/sow the animation executes in ms
let width = 640,
    height = 640, 
    animStepInt = 400,
    d3Sim = null,
    nodes = null,
    links = null;


//NODES are 'focal points' of the viz 
var nodeData = [
    { x:   width/3, y:   height/3 },
    { x:   width/3, y: 2*height/3 },
    { x: 2*width/3, y:   height/3 },
    { x: 2*width/3, y: 2*height/3 }
];

// The `links` array contains objects with a `source` and a `target`
// property. The values of those properties are the indices in
// the `nodes` array of the two endpoints of the link.

var linkData = [
    { source: 0, target: 1, graph: 0 },
    { source: 2, target: 3, graph: 1 }
];

// Here's were the code begins. We start off by creating an SVG
// container to hold the visualization. We only need to specify
// the dimensions for this container.

var svg = d3.select('body').append('svg')
    .attrs({
        'width': width,
        'height': height
    });

// forceLayout 
d3Sim = d3.forceSimulation(nodeData)
    .force("link", d3.forceLink(linkData).distance(height/2))
    // .force('x', 0)
    // .force('y', 0)

    // .force("link", d3.forceLink(linkData).id(function(d, ind) { 
    //         console.log('fn d')
    //         console.log(d)
    //         return ind; 
    //     }).distance(100).strength(1))
    // .force("charge", d3.forceManyBody())
    // .force("center", d3.forceCenter(width / 2, height / 2));



// Next we'll add the nodes and links to the visualization.
// Note that we're just sticking them into the SVG container
// at this point. We start with the links. The order here is
// important because we want the nodes to appear "on top of"
// the links. SVG doesn't really have a convenient equivalent
// to HTML's `z-index`; instead it relies on the order of the
// elements in the markup. By adding the nodes _after_ the
// links we ensure that nodes appear on top of links.

links = svg.selectAll('.link')
    .data(linkData)
    .enter().append('line')
    .attrs({
        'class': 'link',
        'x1': d => nodeData[d.source.x],
        'y1': d => nodeData[d.source.y],
        'x2': d => nodeData[d.target.x],
        'y2': d => nodeData[d.target.y]
    });

// Now it's the nodes turn. Each node is drawn as a circle.

nodes = svg.selectAll('.node')
    .data(nodeData)
    .enter().append('circle')
    .attr('class', 'node');

d3Sim.on('tick', () => {
    nodes.transition(d3.easeLinear).duration(animStepInt).attrs({
        'r': width/25,
        'cx': d => d.x,
        'cy': d => d.y
    });

    links.attrs({
        'x1':d => d.source.x,
        'y1':d => d.source.y,
        'x2':d => d.target.x,
        'y2':d => d.target.y
    });
});


setTimeout(() => d3Sim.stop(), 10)    

// Now let's take care of the user interaction controls.
// We'll add functions to respond to clicks on the individual
// buttons.

// When the user clicks on the "Advance" button, we
// start the force layout (The tick handler will stop
// the layout after one iteration.)

d3.select('advance').on('click', () => {
    console.log('advance clicked!')
});

// When the user clicks on the "Play" button, we're
// going to run the force layout until it concludes.

d3.select('#slow').on('click', function() {

    console.log('clicked')
    startAndStopAnimation();
    // Indicate that the animation is in progress.

    animating = true;

    // Get the animation rolling

    // d3Sim.start();

});