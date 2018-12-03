// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is

function startAndStopAnimation(){
    console.log('start&stop!')
    d3Sim.alphaTarget(1).restart()
    setTimeout(() => {
        d3Sim.stop()
    }, 300)
}

//initialize viz
function initForce(){
    
    if(svg){
        console.log('HERE!')
        svg.selectAll('*').remove();
    }

    //IN the initForce so that on reset the nodes get re-placed
    //NODES are 'focal points' of the viz 
    var nodeData = [
        { x:   width/3, y:   height/3}, //fx:   width/3, fy:   height/3 },
        { x:   width/3, y: 2*height/3}, //fx:   width/3, fy: 2*height/3},
        { x: 2*width/3, y:   height/3}, //fx: 2*width/3, fy:   height/3 },
        { x: 2*width/3, y: 2*height/3}, //fx: 2*width/3, fy: 2*height/3 }
    ];

    // The `links` array contains objects with a `source` and a `target`
    // property. The values of those properties are the indices in
    // the `nodes` array of the two endpoints of the link.

    var linkData = [
        { source: 0, target: 1, graph: 0 },
        { source: 2, target: 3, graph: 1 }
    ];

    // forceLayout 
    d3Sim = d3.forceSimulation(nodeData)
    .force("link", d3.forceLink(linkData).distance((link) => {
        return link.graph === 0 ? height/1.5 : height/5;
    }))

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

    nodes = svg.selectAll('.node')
        .data(nodeData)
        .enter().append('circle')
        .attr('class', 'node');

    d3Sim.on('tick', tickFn);

}

function tickFn(){
    console.log('tickFn')

    // In full speed, set the new positions
    if(d3Sim.isFullSpeed){
        console.log('FULL SPEED!')
        
        nodes.attrs({
            'cx': d => d.x,
            'cy': d => d.y
        });
    
        links.attrs({
            'x1':d => d.source.x,
            'y1':d => d.source.y,
            'x2':d => d.target.x,
            'y2':d => d.target.y
        });

    // NOT In full speed, increment nodes & links animation & positions
    }else{
        console.log('NOT FULL SPEED!')
        nodes.transition(d3.easeLinear).duration(animStepInt).attrs({
            'r': width/25,
            'cx': d => d.x,
            'cy': d => d.y
        });

        links.transition(d3.easeLinear).duration(animStepInt).attrs({
            'x1':d => d.source.x,
            'y1':d => d.source.y,
            'x2':d => d.target.x,
            'y2':d => d.target.y
        });
    }

    // Unless the layout is operating at normal speed,
    // only show one step at a time
    if (!d3Sim.fullSpeed) {
        d3Sim.stop();
    }

    // If animating the layout in slow motion, continue
    // after a delay, allowing the animation to take effect.
    if (d3Sim.slowMotion) {
        setTimeout(() => d3Sim.restart(),
            animStepInt
        );
    }
}

//animStepInt how fast/sow the animation executes in ms
let width = 640,
    height = 640, 
    animStepInt = 50,
    d3Sim = null,
    nodes = null,
    links = null;

var svg = d3.select('body').append('svg')
    .attrs({
        'width': width,
        'height': height
    });
/*
    BUTTON FNs
*/

d3.select('#advance').on('click', function() {

    d3Sim.restart();

});

// When the user clicks on the "Slow Motion" button, we're
// going to run the d3Sim layout until it concludes.

d3.select('#slow').on('click', function() {

    // Indicate that the animation is in progress.

    d3Sim.slowMotion = true;
    d3Sim.fullSpeed  = false;

    // Get the animation rolling
    d3Sim.alphaTarget(1).restart();

});

// When the user clicks on the "Slow Motion" button, we're
// going to run the d3Sim layout until it concludes.

d3.select('#play').on('click', function() {
    console.log('PLAY clicked')

    // Indicate that the full speed operation is in progress.

    d3Sim.slowMotion = false;
    d3Sim.fullSpeed  = true;

    // Get the animation rolling
    d3Sim.alphaTarget(1).restart();

});

// When the user clicks on the "Reset" button, we'll
// start the whole process over again.

d3.select('#reset').on('click', function() {
    console.log('reset clicked')

    // If we've already started the layout, stop it.
    if (d3Sim) {
        d3Sim.stop();
    }

    // Re-initialize to start over again.
    initForce();

});

initForce();