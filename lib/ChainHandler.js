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

module.exports = ChainHandler;

function ChainHandler(objectArray, functionName, onEndCallback) {
    this.timer = null;
    this.objectArray = objectArray;
    this.functionName = functionName;
    this.onEndCallback = onEndCallback;

    if (objectArray == null || objectArray.length <= 0) {
        this.onEnd();
        return;
    }
}

ChainHandler.prototype._getInfo = function (index) {
    return this.objectArray[index].constructor.name + "." + this.functionName;
}

ChainHandler.prototype._getMethod = function (index) {
    return this.objectArray[index][this.functionName].bind(this.objectArray[index]);
}

ChainHandler.prototype.start = function () {
    this._callFunction(0);
};

ChainHandler.prototype._callFunction = function (index) {
    var self = this;

    this.timer = setInterval(function () {
        //checking for current function called next function or not
        console.error("appmanager:chain-handler Chain-Break-Error: next function is not called from : %s. Fix Your Code.", self._getInfo(index));
    }, 5000);

    //calling users method, so handle safely
    try {
        self._getMethod(index)(function () {

            //clearing current chain break error handling timer
            clearInterval(self.timer);

            if (index < self.objectArray.length - 1) {
                //releasing current call stack before calling next chaining function
                process.nextTick(self._callFunction.bind(self), index + 1);
            } else {
                self.onEnd();
            }
        });
    } catch (e) {
        clearInterval(self.timer);
        self.onEnd(new Error("Exception in Calling Chain Method for " + self._getInfo(index), e));
    }
};

ChainHandler.prototype.onEnd = function (err) {
    process.nextTick(this.onEndCallback, err);
};