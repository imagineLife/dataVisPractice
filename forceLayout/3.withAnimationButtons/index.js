// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is

function startAndStopAnimation(){
    console.log('start&stop!')
    d3Sim.restart()
    setTimeout(() => {
        d3Sim.stop()
    }, 150)
}

var width = 640,
    height = 640;


var nodes = [
    { "x": 208.992345, "y": 273.053211 },
    { "x": 595.98896,  "y":  56.377057 },
    { "x": 319.568434, "y": 278.523637 },
    { "x": 214.494264, "y": 214.893585 },
    { "x": 482.664139, "y": 340.386773 },
    { "x":  84.078465, "y": 192.021902 },
    { "x": 196.952261, "y": 370.798667 },
    { "x": 107.358165, "y": 435.15643  },
    { "x": 401.168523, "y": 443.407779 },
    { "x": 508.368779, "y": 386.665811 },
    { "x": 355.93773,  "y": 460.158711 },
    { "x": 283.630624, "y":  87.898162 },
    { "x": 194.771218, "y": 436.366028 },
    { "x": 477.520013, "y": 337.547331 },
    { "x": 572.98129,  "y": 453.668459 },
    { "x": 106.717817, "y": 235.990363 },
    { "x": 265.064649, "y": 396.904945 },
    { "x": 452.719997, "y": 137.886092 }
];

// The `links` array contains objects with a `source` and a `target`
// property. The values of those properties are the indices in
// the `nodes` array of the two endpoints of the link.

var links = [
    { "target": 11, "source":  0 },
    { "target":  3, "source":  0 },
    { "target": 10, "source":  0 },
    { "target": 16, "source":  0 },
    { "target":  1, "source":  0 },
    { "target":  3, "source":  0 },
    { "target":  9, "source":  0 },
    { "target":  5, "source":  0 },
    { "target": 11, "source":  0 },
    { "target": 13, "source":  0 },
    { "target": 16, "source":  0 },
    { "target":  3, "source":  1 },
    { "target":  9, "source":  1 },
    { "target": 12, "source":  1 },
    { "target":  4, "source":  2 },
    { "target":  6, "source":  2 },
    { "target":  8, "source":  2 },
    { "target": 13, "source":  2 },
    { "target": 10, "source":  3 },
    { "target": 16, "source":  3 },
    { "target":  9, "source":  3 },
    { "target":  7, "source":  3 },
    { "target": 11, "source":  5 },
    { "target": 13, "source":  5 },
    { "target": 12, "source":  5 },
    { "target":  8, "source":  6 },
    { "target": 13, "source":  6 },
    { "target": 10, "source":  7 },
    { "target": 11, "source":  7 },
    { "target": 17, "source":  8 },
    { "target": 13, "source":  8 },
    { "target": 11, "source": 10 },
    { "target": 16, "source": 10 },
    { "target": 13, "source": 11 },
    { "target": 14, "source": 12 },
    { "target": 14, "source": 12 },
    { "target": 14, "source": 12 },
    { "target": 15, "source": 12 },
    { "target": 16, "source": 12 },
    { "target": 15, "source": 14 },
    { "target": 16, "source": 14 },
    { "target": 15, "source": 14 },
    { "target": 16, "source": 15 },
    { "target": 16, "source": 15 },
    { "target": 17, "source": 16 }
];

// Here's were the code begins. We start off by creating an SVG
// container to hold the visualization. We only need to specify
// the dimensions for this container.

var svg = d3.select('body').append('svg')
    .attrs({
        'width': width,
        'height': height
    });

// Now we create a force layout object and define its properties.
// Those include the dimensions of the visualization and the arrays
// of nodes and links.

var d3Sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).distance(width/2))
    // .stop();




// Next we'll add the nodes and links to the visualization.
// Note that we're just sticking them into the SVG container
// at this point. We start with the links. The order here is
// important because we want the nodes to appear "on top of"
// the links. SVG doesn't really have a convenient equivalent
// to HTML's `z-index`; instead it relies on the order of the
// elements in the markup. By adding the nodes _after_ the
// links we ensure that nodes appear on top of links.

var link = svg.selectAll('.link')
    .data(links)
    .enter().append('line')
    .attrs({
        'class': 'link',
        'x1': d => nodes[d.source.x],
        'y1': d => nodes[d.source.y],
        'x2': d => nodes[d.target.x],
        'y2': d => nodes[d.target.y]
    });

// Now it's the nodes turn. Each node is drawn as a circle.

var node = svg.selectAll('.node')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'node');

// We're about to tell the force layout to start its
// calculations. We do, however, want to know when those
// calculations are complete, so before we kick things off
// we'll define a function that we want the layout to call
// once the calculations are done.

d3Sim.on('end', () => {

    node.attrs({
        'r': width/25,
        'cx': d => d.x,
        'cy': d => d.y
    });

    link.attrs({
        'x1':d => d.source.x,
        'y1':d => d.source.y,
        'x2':d => d.target.x,
        'y2':d => d.target.y
    });

    console.log('ENDED@')

})
.on('tick', () => {
    node.attrs({
        'r': width/25,
        'cx': d => d.x,
        'cy': d => d.y
    });

    link.attrs({
        'x1':d => d.source.x,
        'y1':d => d.source.y,
        'x2':d => d.target.x,
        'y2':d => d.target.y
    });
});


d3Sim.stop()    

// Now let's take care of the user interaction controls.
// We'll add functions to respond to clicks on the individual
// buttons.

// When the user clicks on the "Advance" button, we
// start the force layout (The tick handler will stop
// the layout after one iteration.)

d3.select('#advance').on('click', () => {
    console.log('advance clicked!')
    d3Sim.restart()
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