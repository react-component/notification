/** @jsx React.DOM */
var React = require('react');
var Crouton = require('react-crouton');
var instanceId = 0;

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.instanceId = instanceId++;
  }

  render(){
    var croutons = [];

    if( this.props.messages ){
      croutons = this.props.messages.map((message,index)=>{
        if( typeof message === 'string'){
          return {
            id : this.instanceId + "-" + index,
            message : message
          }
        }else if( Object.prototype.toString.call( message) === '[object Object]' ){
          return message
        }else{
          throw new Error("unknown message type: " + message)
        }
      })
    }

    var className = this.props.className || "notification";

    return (
      <div className={className}>
      {croutons.map((crouton)=>{
        return (<Crouton {...crouton} />);
      })}
      </div>
    )
  }
}

module.exports = Notification;
