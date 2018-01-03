var AppListener = require('../lib/AppListener');
var util = require('util');

util.inherits(MyAppListener, AppListener);
function MyAppListener(){
    this.priority = 1;
}

MyAppListener.prototype.onStart = function(next){
    console.log("My App Start ");
    next();
};

var singleton = new MyAppListener();

module.exports = singleton;