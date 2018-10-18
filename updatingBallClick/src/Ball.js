import React from "react";
import ReactDOM from "react-dom";
import * as d3 from 'd3'
class App extends React.Component{
  constructor(props){
  	super(props)

  	this.state = {
  		x: props.x,
      y: props.y
  	}

    this.circleRef = React.createRef();
  }


  componentDidUpdate() {
    let el = d3.select(this.circleRef.current);

    //1. D3 transition
    el.transition()
      .duration(800)
      .ease(d3.easeBounceOut)
      .attr("cx", this.props.x)
      
      //setThis component state after transition
      .on("end", () =>
        this.setState({
          x: this.props.x
        })
      );
  }

  render(){
    const {x,y} = this.state;
    return <circle r='10' cx={x} cy={y} ref={this.circleRef} />
  }
};
export default App;
