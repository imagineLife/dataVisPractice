// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is

var width = 640,
    height = 640;

// Define the data for the example. In general, a force layout
// requires two data arrays. The first array, here named `nodes`,
// contains the object that are the focal point of the visualization.
// The second array, called `links` below, identifies all the links
// between the nodes. (The more mathematical term is "edges.")

// For the simplest possible example we only define two nodes. As
// far as D3 is concerned, nodes are arbitrary objects. Normally the
// objects wouldn't be initialized with `x` and `y` properties like
// we're doing below. When those properties are present, they tell
// D3 where to place the nodes before the force layout starts its
// magic. More typically, they're left out of the nodes and D3 picks
// random locations for each node. We're defining them here so we can
// get a consistent application of the layout which lets us see the
// effects of different properties.

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

// There's one more property of the layout we need to define,
// its `linkDistance`. That's generally a configurable value and,
// for a first example, we'd normally leave it at its default.
// Unfortunately, the default value results in a visualization
// that's not especially clear. This parameter defines the
// distance (normally in pixels) that we'd like to have between
// nodes that are connected. (It is, thus, the length we'd
// like our links to have.)
var force = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).distance(width/2))




// Next we'll add the nodes and links to the visualization.
// Note that we're just sticking them into the SVG container
// at this point. We start with the links. The order here is
// important because we want the nodes to appear "on top of"
// the links. SVG doesn't really have a convenient equivalent
// to HTML's `z-index`; instead it relies on the order of the
// elements in the markup. By adding the nodes _after_ the
// links we ensure that nodes appear on top of links.

// Links are pretty simple. They're just SVG lines, and
// we're not even going to specify their coordinates. (We'll
// let the force layout take care of that.) Without any
// coordinates, the lines won't even be visible, but the
// markup will be sitting inside the SVG container ready
// and waiting for the force layout.

var link = svg.selectAll('.link')
    .data(links)
    .enter().append('line')
    .attr('class', 'link');

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

force.on('end', function() {

    // When this function executes, the force layout
    // calculations have concluded. The layout will
    // have set various properties in our nodes and
    // links objects that we can use to position them
    // within the SVG container.

    // First let's reposition the nodes. As the force
    // layout runs it updates the `x` and `y` properties
    // that define where the node should be centered.
    // To move the node, we set the appropriate SVG
    // attributes to their new values. We also have to
    // give the node a non-zero radius so that it's visible
    // in the container.

    node.attrs({
        'r': width/25,
        'cx': d => d.x,
        'cy': d => d.y
    });

    // We also need to update positions of the links.
    // For those elements, the force layout sets the
    // `source` and `target` properties, specifying
    // `x` and `y` values in each case.

    link.attrs({
        'x1':d => d.source.x,
        'y1':d => d.source.y,
        'x2':d => d.target.x,
        'y2':d => d.target.y
    });

});

// Okay, everything is set up now so it's time to turn
// things over to the force layout. Here we go.

// force.start();

// By the time you've read this far in the code, the force
// layout has undoubtedly finished its work. Unless something
// went horribly wrong, you should see two light grey circles
// connected by a single dark grey line. If you have a screen
// ruler (such as [xScope](http://xscopeapp.com) handy, measure
// the distance between the centers of the two circles. It
// should be somewhere close to the `linkDistance` parameter we
// set way up in the beginning (480 pixels). That, in the most
// basic of all nutshells, is what a force layout does. We
// tell it how far apart we want connected nodes to be, and
// the layout keeps moving the nodes around until they get
// reasonably close to that value.

// Of course, there's quite a bit more than that going on
// under the hood. We'll take a closer look starting with
// the next example.