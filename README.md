# node-app-boot
[Git-Wiki-Page]

node-app-boot is a try to build something like spring in nodejs. But it is in very starting phase. It has some primary features this time, which can be further used to develop other features easily. 

### Where to use :
This module can be used for developing services or web-applications in nodejs

### New In v2.0.*
* Now it has support for defining your own **BootAppListener**. For understanding its usages better check the code of module [node-app-boot-listener-express] and  test folder of the module for how to use a module implementing **BootAppListener**.

* **Some bug fixes** :
    1. fixed missing error handling if home directory value is missing or invalid
    2. fixed issue of Invalid reference of 'this' inside all stated functions of Child of AppListeners classes.
    3. fixed issue in resolving relative path if passed in home

### Current features :
  - **AppManager** : the main app manager that will handle all app states and will notify all of its listeners.
  - **Scanner** : This class can be used to scan all files inside a folder that follow a specific conditions.
  - **ChainHandler** : This class can help you calling your specific functions inside a array of objects sequentially. It will monitor for chain-break-errors and log if any chain break found.
  - **BootAppListener** : This class will let you develop your own module that can create a skeleton for a service and define your own classes as abstract classes for handling states or getting config at runtime from users for your service.
    **Note** : 
    1. You can define your own state listeners classes but you have to inherit your class from **AppListener** class. All the states functions should be called by you except state functions mentioned in AppListener class. State functions mentioned in AppListener classe will be called by AppManager it self for all implementing objects of Child classe.
    2. You can define your class to get Config from user for your service but you have to inherit from ConfigBean class of node-app-boot module.
`I have created a module by using BootAppListener that provide users, a functionality to define their route in a seperate File and do not worry to link all the routes together. Users just need to define the routes any where he want.
    Check the module node-app-boot-listener-express in dependent projects and check its code on github for usderstanding how to use BootAppListener class. It also contains test folder that will help you to understand how user will call your module.`

# Steps to include this manager in your project

>Just create your main file in your project folder. Lets we are creating **main.js**

***Code for main.js***
```sh
var AppManager = require('node-app-boot');
(function () {
    if (require.main === module) {
        new AppManager({
            /* just pass your project root folder path in home
             * or define APP_HOME in environment variable( from v2.0 onward )
             * You can use environment variable option, if your app start/main file is not in the root directory of your app.
             */
            home : __dirname
        }).init();
    }
}());
```

Now AppManager will handle all states of a application and call all your AppListeners classes different state functions in sequence based on the priority

Your Classes can listen following states available in AppListener class :
1. **preStart(next)** : you can do all your stuffs that need to be loaded before starting your services or http-servers instances. like setting configs in express instances etc. You must call next() after doing your stuffs to continue chaining.
2. **onStart(next)** : start your services here. You must call next() after doing your stuffs to continue chaining.
3. **postStart(next)** : you can use this section to validating all started services or some post action required after services up. Like sending emails to developers etc. You must call next() after doing your stuffs to continue chaining.
4. **onClose(type, exitCode)** : this should be used as closing all your resources gracefully. Does not have next().
5. **onError(err)** : this function will be called if some error occurs in your app, and that is not handled inside your code. Does not have next()

>Now Lets create two classes where we want to do some state based stuffs:
> 1. for loading initial configs from db : ***ConfigLoaderAppListener.js***
    Just for example create this file inside **config** folder.
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
   [node-app-boot-listener-express]: <https://www.npmjs.com/package/node-app-boot-listener-express>