var AppListener = require('../../lib/AppListener');
var util = require('util');

util.inherits(MyInnerAppListener, AppListener);
function MyInnerAppListener(){
    this.priority = 2;
}

MyInnerAppListener.prototype.onStart = function(next){
    console.log("My Inner App Start ");
//    throw new Exception("test exception");
    next();
};

var singleton = new MyInnerAppListener();

module.exports = singleton;