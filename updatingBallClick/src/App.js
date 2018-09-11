import React from "react";
import ReactDOM from "react-dom";
import Ball from './Ball'

class App extends React.Component{
  constructor(props){
  	super(props)

  	this.state = {
  		ballLeft: true
  	}

  	this.ballJump = this.ballJump.bind(this)
  }

  ballJump(){
  	this.setState({
  		ballLeft: !this.state.ballLeft
  	})
  }

  render(){
  	const { ballLeft } = this.state;
  	console.log('ballLEft')
  	console.log(this.state.ballLeft)
  	  return (
	    <div>
        <svg style={{ width: "300", height: "300px" }} onClick={this.ballJump}>
        	<Ball x={ballLeft ? 15 : 250} />
        </svg>
      </div>
	  );
  }
};
export default App;
