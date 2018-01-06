# node-app-boot
[Git-Wiki-Page]

node-app-boot is a try to build something like spring in nodejs. But it is in very starting phase. It has some primary features this time, which can be further used to develop other features easily. 

### Where to use :
This module can be used for developing services or web-applications in nodejs

### Current features :
  - **AppManager** : the main app manager that will handle all app states and will notify all of its listeners.
  - **Scanner** : This class can be used to scan all files inside a folder that follow a specific conditions.
  - **ChainHandler** : This class can help you calling your specific functions inside a array of objects sequentially. It will monitor for chain-break-errors and log if any chain break found.

# Steps to include this manager in your project

>Just create your main file in your project folder. Lets we are creating **main.js**

***Code for main.js***
```sh
var AppManager = require('node-app-boot');
(function () {
    if (require.main === module) {
        new AppManager({
            home : __dirname    //just pass your project root folder path in home
        }).init();
    }
}());
```

Now AppManager will handle all states of a application and call all your AppListeners classes different state functions in sequence based on the priority

Your Classes can listen following states :
1. **preStart** : you can do all your stuffs that need to be loaded before starting your services or http-servers instances. like setting configs in express instances etc. 
2. **onStart** : start your services here.
3. **postStart** : you can use this section to validating all started services or some post action required after services up. Like sending emails to developers etc.
4. **onClose** : this should be used as closing all your resources gracefully.
5. **onError** : this function will be called if some error occurs in your app, and that is not handled inside your code.

>Now Lets create two classes where we want to do some state based stuffs:
> 1. for loading initial configs from db : ***ConfigLoaderAppListener.js***
> 2. for starting your application : ***MainAppListener.js***

`Note : You have to keep your file name ends with 'AppListener', that want to listen different states of app. This is a designing decision just to make sure only your app-listeners will be required so that not all your files get initiallized initially. you can change this behaviour with passing some configuration in AppManager, we will discuss it later.`

***Code for ConfigLoaderAppListener.js***
```sh

//getting AppListener class reference
var AppListener = require('node-app-boot').AppListener;

var util = require('util');     //requiring to use inherits function

util.inherits(ConfigLoaderAppListener, AppListener); //you have to inherit your classes from AppListener class

function ConfigLoaderAppListener(){
    /*
     * this priority will be used to decide the position of this class in chain calling
     * Keep this value maximum for keeping it on most top.
     * If you will not declare it then its default value will be 0 
     * and position of the file will be decided from position of the file in directory traversing.
     */
    this.priority = 9999;   
}

ConfigLoaderAppListener.prototype.preStart = function(next){
    console.log("Load configs from db here");
    //call next to continue the chain
    //If you will not call next or if there is some exception occurs prior to calling this function then AppManager will inform you this on console.log
    //Just for experiment try once with commenting next() and once with throwing error previous to calling next()
    //throw new Error("Checking for what will happen");
    next();
};

//Note : You do not require to define other methods in all classes
//just define what you require

//Now create this class as singleton
var singleton = new ConfigLoaderAppListener();
module.exports = singleton;
```

***Code for MainAppListener.js***
```sh
var AppListener = require('node-app-boot').AppListener;
var util = require('util');

//you have to inherit your classes from AppListener class
util.inherits(MainAppListener, AppListener); 

function MainAppListener(){
    this.priority = 100;
}

//overriding default onStart
MainAppListener.prototype.onStart = function(next){
    console.log("Start your services here, or bind the listening port here");
    next();
};

//overriding default onClose
MainAppListener.prototype.onClose = function (type, exitCode) {
    console.log("Stop your services gracefully here");
    //this function does not have next function, because you can't stop your app from shutdown from here
};
var singleton = new MainAppListener();
module.exports = singleton;
```

### Running your app

Without DEBUG logging
```sh
$ node main.js
```

With DEBUG logging
```sh
$ DEBUG=appmanager:* node main.js
```

License
----
MIT

[//]: # (Reference links)
   [Git-Wiki-Page]: <https://github.com/vivek43nit/node-app-boot/wiki>
   [git-repo-url]: <https://github.com/vivek43nit/node-app-boot.git>