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

function tickFn(){

    // In full speed we simply set the new positions
    if(d3Sim.isFullSpeed){
        
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

    }else{
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

    if (!d3Sim.fullSpeed) {
        console.log("STOPPED!")
        d3Sim.stop();
    }
}

//animStepInt how fast/sow the animation executes in ms
let width = 640,
    height = 640, 
    animStepInt = 100,
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

var svg = d3.select('body').append('svg')
    .attrs({
        'width': width,
        'height': height
    });

// forceLayout 
d3Sim = d3.forceSimulation(nodeData)
    .force("link", d3.forceLink(linkData).distance(height/2))

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

d3Sim.on('tick', tickFn);


//interesting 'workaround' for initial animation speed-up
// setTimeout(() => {
//     console.log('here')
//     d3Sim.stop(), 10
// })