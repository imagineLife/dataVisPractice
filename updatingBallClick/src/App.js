import React from "react";
import ReactDOM from "react-dom";
import Ball from './Ball'

class App extends React.Component{
  constructor(props){
  	super(props)

  	this.state = {
  		isLeft: true
  	}

  	this.ballLeftTF = this.ballLeftTF.bind(this)
  }

  ballLeftTF(){
  	this.setState({
  		isLeft: !this.state.isLeft
  	})
  }

  render(){
  	const { isLeft } = this.state;
  	console.log('isLeft')
  	console.log(this.state.isLeft)
  	  return (
        <svg style={{ width: "300", height: "50px" }} onClick={this.ballLeftTF}>
        	<Ball x={isLeft ? 15 : 250} y={40} />
        </svg>
	  );
  }
};
export default App;
