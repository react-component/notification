/** @jsx React.DOM */
var React = require('react');
var domAlign = require('dom-align');
var clone = require("clone");
var CSSTransitionGroup = require("rc-css-transition-group");
var instanceId = 0;

function concatFns(){
  var fns = Array.prototype.slice.call(arguments);
  return function(){
    fns.forEach(function(fn){
      fn&&fn();
    });
  };
}

function pick( obj, keys ){
  var result = {};
  keys.forEach(function(key){
    result[key] =obj[key];
  });
  return result;
}

function defaults(target, defaultObject) {
  for (var i in defaultObject) {
    if (defaultObject.hasOwnProperty(i) && target[i] === undefined) {
      target[i] = defaultObject[i];
    }
  }
  return target;
}

var Notice = React.createClass({
  getDefaultProps: function () {
    return {
      onEnd: function () {
      },
      duration: 100,
      autoDismiss : true,
      type: 'info'
    };
  },
  componentDidMount: function () {
    if( this.props.autoDismiss ){
      setTimeout(()=>{
        this.close();
      }, this.props.duration);
    }
  },
  close:function(){
    var props = this.props;
    props.onEnd();
  },
  render() {
    var wrapperClass= "rc-notice rc-notice-"+this.props.type;
    return (
      <div className={wrapperClass}>
        <div className="rc-notice-content">{this.props.children}</div>
        <div className="rc-notice-buttons">
          <button className="rc-notice-button-close" onClick={this.close}>close</button>
        </div>
      </div>
    );
  }
});

var Notification = React.createClass({
  seed : 0,
  componentDidMount: function () {
    this.noticeNodes = []
    this.instanceId = instanceId++;

    var props = clone( this.props || {} );
    var positionStyle = defaults(props, {
      points: ["cc", "cc"],
      offset: [0, 0],
      overflow: {
        adjustX: false,
        adjustY: false
      }
    });

    domAlign(this.getDOMNode(), document.body, positionStyle);
  },
  getInitialState: function () {
    return {notices:[]};
  },
  remove: function (key) {
    var index = 0;
    for( var i in this.state.notices ){
      if( this.state.notices[i].key === key ){
        index = i;
        break;
      }
    }

    var notices =  this.state.notices.slice(0, index).concat( this.state.notices.slice(index+1));
    this.setState({notices:notices});

  },
  add(content, options) {
    var notice = {
      content : content,
      options:options || {},
      key:this.seed++
    };

    this.setState({notices : this.state.notices.concat(notice)});
  },
  render() {
    var noticeNodes = this.state.notices ? this.state.notices.map((notice)=>{
      var onEnd = concatFns(this.remove.bind(this, notice.key), notice.options.onEnd);
      return (<Notice {...notice.options} onEnd={onEnd} key={notice.key} >{notice.content}</Notice>);
    }) : null;


    return (
      <div className="rc-notification">
        <CSSTransitionGroup transitionName="rc-notice-anim">{noticeNodes}</CSSTransitionGroup>
      </div>
    );
  }
});

var notificationInstances = {};

function notice( content, options, createNewInstance ) {
  //if id is not defined, we put notice in a global notification

  var id = createNewInstance ? instanceId ++ : -1;
  if( !notificationInstances[id] ){
    var div = document.createElement('div');
    var opts = pick(options||{},['points','offset','overflow']);
    document.body.appendChild(div);
    notificationInstances[id] = React.render(<Notification {...opts}/>, div);
  }

  notificationInstances[id].add(content, options);
  return notificationInstances[id];
}

module.exports = {
  notice: notice,
  Notice: Notice,
  Notification: Notification
}
