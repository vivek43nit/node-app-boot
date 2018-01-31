/* 
 * The MIT License
 *
 * Copyright (c) 2018 Vivek Kumar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var debug = require('debug')('appmanager:state');
var path = require('path');

var Filters = require('./Filters');
var Scanner = require('./Scanner');

var AppListener = require('./boot-listeners/AppListener');
var BootAppListener = require('./boot-listeners/BootAppListener');
var ConfigBean = require('./boot-listeners/ConfigBean');

//just for internal use
var ChainHandler = require('./ChainHandler');
var CommonFunctions = require('./CommonFunctions');

module.exports = AppManager;

module.exports.AppListener = AppListener;
module.exports.BootAppListener = BootAppListener;
module.exports.ConfigBean = ConfigBean;

module.exports.Scanner = Scanner;
module.exports.Filters = Filters;
module.exports.ChainHandler = ChainHandler;

AppManager.EVENT = {
    CLOSE: "close",
    SIGUSR2: "SIGUSR2",
    SIGTERM: "SIGTERM",
    EXIT: "exit",
    SIGINT: "SIGINT",
    SIGUSR1: "SIGUSR1"
};

function AppManager(config) {

    if (CommonFunctions.isNotEmptyString(config.home) && CommonFunctions.isValidDirectoryPath(config.home)) {
        debug("Found valid app home path in config.home : %s", config.home);
    } else if (CommonFunctions.isNotEmptyString(process.env.APP_HOME) && CommonFunctions.isValidDirectoryPath(process.env.APP_HOME)) {
        debug("Found valid app home path in process.env.APP_HOME : %s", process.env.APP_HOME);
        config.home = process.env.APP_HOME;
    } else {
        debug("both config.home and process.env.APP_HOME is invalid.");
        console.error("Unable to find valid directory of the app home.");
        process.exit(1);
    }

    this.config = config;
    this.listeners = [];
    this.bootAppListeners = [];
    if (config.bootAppListeners != null && Array.isArray(config.bootAppListeners)) {
        for (var i = 0; i < config.bootAppListeners.length; i++) {
            if (config.bootAppListeners[i] instanceof BootAppListener) {
                this.bootAppListeners.push(config.bootAppListeners[i]);
            } else {
                debug("invalid boot-app-listener at index[%d] : %s", i, this.bootAppListeners[i].constructor.name);
            }
        }
    }
}

AppManager.prototype.init = function () {
    debug("init");

    process.on('close', this._onClose.bind(this, AppManager.EVENT.CLOSE));
    process.on('SIGUSR1', this._onClose.bind(this, AppManager.EVENT.SIGUSR1));
    process.on('SIGUSR2', this._onClose.bind(this, AppManager.EVENT.SIGUSR2));
    process.on('SIGTERM', this._onClose.bind(this, AppManager.EVENT.SIGTERM));
    process.on('exit', this._onClose.bind(this, AppManager.EVENT.EXIT));
    process.on('SIGINT', this._onClose.bind(this, AppManager.EVENT.SIGINT));
    process.on('error', this._onError.bind(this));

    this._collectListeners();

    debug("calling init of boot-app-listeners");
    this.bootAppListeners.forEach(function (app) {
        try {
            app.init();
        } catch (e) {
            console.error("error in calling %s.init() : ", app.constructor.name, e);
            process.exit(1);
        }
    });

    //sorting based on priority
    debug("sorting app listeners based on priority...");
    this.listeners.sort(this.priorityComparator);
    debug("sorted list of listeners : " + this.listeners);
    this._preStart();
};

AppManager.prototype._collectListeners = function () {
    debug("searching app listeners...");
    var c = {
        root: this.config.home,
        directoryFilter: this.config.directoryFilter || Filters.DirFilters.ExceptNodeModules,
        filesFilter: this.config.filesFilter || Filters.FileFilters.EndsWithAppListenerOrConfigBean
    }
    var files = null;
    try {
        files = new Scanner(c).getFiles();
    } catch (e) {
        console.error("error : not able to get list of files.", e);
        process.exit(1);
    }
    debug("found app listeners :", files);

    this.listeners = [];
    debug("getting all listeners reference...");
    for (var i = 0; i < files.length; i++) {
        try {
            var _class = require(files[i]);

            //adding found class instance in app-state listeners list
            if (_class instanceof AppListener) {
                this.listeners.push(_class);
            }

            //providing different-listeners and config-beans defined by boot-app-listeners classes to them
            this.bootAppListeners.forEach(function (app) {
                app.classTypes().forEach(function (type) {
                    if (_class instanceof type) {
                        app.addClass(_class);
                    }
                });
            });

        } catch (e) {
            debug("error in require for : %s", files[i], e);
        }
    }

    var self = this;

    //adding all boot-app-listeners to app-state listeners, because boot-app-listeners also listen states of the app
    this.bootAppListeners.forEach(function (app) {
        self.listeners.push(app);
    });

    debug("final list of app listeners :", this.listeners);
};

//can be over-ride if required
AppManager.prototype.priorityComparator = function (a, b) {
    return a.priority < b.priority;
};

//internal
AppManager.prototype._preStart = function () {
    debug("preStart");
    new ChainHandler(this.listeners, 'preStart', this._onStart.bind(this)).start();
};

AppManager.prototype._onStart = function (err) {
    if (err != null) {
        console.error("appmanager:state preStart-failed", err);
        this._onError(err);
        process.exit(-1);
    }
    debug("onStart");
    new ChainHandler(this.listeners, 'onStart', this._postStart.bind(this)).start();
};

AppManager.prototype._postStart = function (err) {
    if (err != null) {
        console.error("appmanager:state onStart-failed", err);
        this._onError(err);
        process.exit(-1);
    }
    debug("postStart");
    new ChainHandler(this.listeners, 'postStart', this._postStartCalled.bind(this)).start();
};

AppManager.prototype._postStartCalled = function (err) {
    if (err != null) {
        console.error("appmanager:state postStart-failed", err);
        this._onError(err);
        process.exit(-1);
    }
    debug("postStart ended");
};

AppManager.prototype._onClose = function (type, exitCode) {
    debug("close, event-type:%s, exit-code:%s", type, exitCode);
    this.listeners.forEach(function (obj) {
        try {
            obj.onClose(type, exitCode);
        } catch (e) {
            console.error("Error in Calling onClose for %s.onClose", obj.constructor.name);
        }
    });
    process.exit(0);
};

AppManager.prototype._onError = function (err) {
    debug("error :", err);
    this.listeners.forEach(function (obj) {
        try {
            obj.onError(err);
        } catch (e) {
            console.error("Error in Calling onError for %s.onError", obj.constructor.name);
        }
    });
};

