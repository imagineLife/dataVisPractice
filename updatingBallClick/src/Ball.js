import React from "react";
import ReactDOM from "react-dom";
class App extends React.Component{
  constructor(props){
  	super(props)

  	this.state = {
  		x: props.x
  	}

    this.circleRef = this.circleRef.bind(this)
  }

  circleRef = React.createRef();

  componentDidUpdate() {
    let el = d3.select(this.circleRef.current);

    el.transition()
      .duration(800)
      .ease(d3.easeBounceOut)
      .attr("cx", this.props.x)
      .on("end", () =>
        this.setState({
          x: this.props.x
        })
      );
  }

  render(){
    const {x,y} = this.state;
    return <circle r='10' cx={x} cy={y} ref={this.circleRef}>
  }
};
export default App;
