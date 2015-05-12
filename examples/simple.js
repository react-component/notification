/** @jsx React.DOM */
// use jsx to render html, do not modify simple.html
require('rc-notification/assets/index.css');
var notification = require('rc-notification');
var notice = notification.notice;
var Notice = notification.Notice;
var React = require('react');



notice("this is a simple string notice");
notice("this is a simple string notice",{type:"success"});
notice("this is a simple string notice",{type:"error"});
notice("this is a simple string notice",{type:"warning"});
var noticeDom = (<div>this is a virtual dom content with link<a href="http://github.com">github.com</a></div>);
notice(noticeDom,{autoDismiss:false,onEnd:function(){alert("you clicked close")}});

notice("this is a simple string notice",{points:["lt","rt"]}, true);
