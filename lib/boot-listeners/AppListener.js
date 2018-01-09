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

var debug = require('debug')('appmanager:app-listener');

module.exports = AppListener;

function AppListener() {
    this.priority = 0;
}

//default skeltion for preStart
AppListener.prototype.preStart = function (next) {
    debug("default preStart called for class : %s", this.constructor.name);
    next();
};

//default skeltion for onStart
AppListener.prototype.onStart = function (next) {
    debug("default onStart called for class : %s", this.constructor.name);
    next();
};

//default skeltion for postStart
AppListener.prototype.postStart = function (next) {
    debug("default postStart called for class : %s", this.constructor.name);
    next();
};

//default skeltion for onClose
AppListener.prototype.onClose = function (type, exitCode) {
    debug("default onClose called for class : %s", this.constructor.name);
};

//default skeltion for onError
AppListener.prototype.onError = function (err) {
    debug("default onError called for class : %s", this.constructor.name);
};


