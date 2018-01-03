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

var fs = require('fs');
var path = require('path');

function isFunction(f) {
    return (f != null && typeof f === "function");
}

function isNullOrFunction(f) {
    return (f == null || typeof f === "function");
}

function isNullOrString(s) {
    return (s == null || (typeof s === "string" && s.length > 0));
}

//Sample config
/*
 var config = {
 root : 'root_dir_path',
 directoryFilter : function(){
 
 },
 directoryFilterRegex : '',
 filesFilter : function(){
 
 },
 filesFilterRegex : 'regex string'
 
 }*/

function isValidConfig(config) {
    return (config.root != null && config.root.length > 0) &&
            isNullOrFunction(config.directoryFilter) &&
            isNullOrFunction(config.filesFilter) &&
            isNullOrString(config.directoryFilterRegex) &&
            isNullOrString(config.filesFilterRegex);
}

function Scanner(config) {
    if (!isValidConfig(config)) {
        throw new Error("Invalid config for scanner");
    }
    this.config = config;

    this.dir = config.root;
    this.isFunctionFilterForDir = isFunction(config.directoryFilter);
    this.isRegexFilterForDir = (config.directoryFilterRegex != null);

    this.isFunctionFilterForFile = isFunction(config.filesFilter);
    this.isRegexFilterForFile = (config.filesFilterRegex != null);

}

Scanner.prototype.getFiles = function (fileList) {
    return this.__getFiles(this.dir, (Array.isArray(fileList)) ? fileList : []);
};

Scanner.prototype.__getFiles = function (dir, fileList) {
    //getting file list synchronously
    var files = fs.readdirSync(dir);
    files.forEach(this._forEach.bind(this, fileList, dir));
    return fileList;
};

Scanner.prototype._forEach = function (fileList, dir, file) {
    var absolutePath = path.join(dir, file);
    if (fs.statSync(absolutePath).isDirectory()) {
        if (this.isFunctionFilterForDir) {
            if (this.config.directoryFilter(absolutePath)) {
                this.__getFiles(absolutePath, fileList);
            }
        } else if (this.isRegexFilterForDir) {
            if (absolutePath.match(this.config.directoryFilterRegex)) {
                this.__getFiles(absolutePath, fileList);
            }
        } else {
            this.__getFiles(absolutePath, fileList);
        }
    } else {
        if (this.isFunctionFilterForFile) {
            if (this.config.filesFilter(file)) {
                fileList.push(absolutePath);
            }
        } else if (this.isRegexFilterForFile) {
            if (file.match(this.config.filesFilterRegex)) {
                fileList.push(absolutePath);
            }
        } else {
            fileList.push(absolutePath);
        }
    }
};

module.exports = Scanner;