/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var AppManager = require('../lib/AppManager');
(function () {
    if (require.main === module) {
        new AppManager({
            home : __dirname    //From v2.0.* onwards you can use APP_HOME environment variable to define home
            //optional
//            ,directoryFilter : function(dir){
//                return !(dir === __dirname+"/lib") && !(dir === __dirname+"/node_modules");
//            }
        }).init();
    }
}());