/** @jsx React.DOM */
// use jsx to render html, do not modify simple.html
require('rc-notification/assets/index.css');
var Notification = require('rc-notification');
var React = require('react');

var messages =  [{
  message:"a test message",
  type:"info",
},{
  message:"a test message 2",
  type:"error",
  autoMiss: false,
  buttons: [{
    name: 'close',
    listener: function() {
      alert("you clicked close")
    }
  }]
}];

React.render(<Notification messages={messages}/>, document.getElementById('__react-content'));
