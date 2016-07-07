(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* eslint max-len: 0 */
// TODO: eventually deprecate this console.trace("use the `babel-register` package instead of `babel-core/register`");
module.exports = require("babel-register");

},{"babel-register":2}],2:[function(require,module,exports){
/*istanbul ignore next*/"use strict";

exports.__esModule = true;

exports.default = function () {};

/*istanbul ignore next*/module.exports = exports["default"]; // required to safely use babel/register within a browserify codebase
},{}],3:[function(require,module,exports){
'use strict';

require('babel-core/register');

var Mediator = require('./utils/Mediator'),
    Focus = require('./utils/Focus'),
    $$ = require('./utils/QuerySelector');

$$('div', document.body);

var m = new Mediator.getInstance();

// focus contain test
var contain = document.getElementById('contain');
var enableContain = document.getElementById('enable-contain');
var disableContain = document.getElementById('disable-contain');
var focus = new Focus(contain);
enableContain.addEventListener('click', function () {
    focus.contain();
});
disableContain.addEventListener('click', function () {
    focus.disableContain();
});

// focus exclude test
var exclude = document.getElementById('exclude');
var excludeFocus = new Focus(exclude);
var enableExclude = document.getElementById('enable-exclude');
var disableExclude = document.getElementById('disable-exclude');
enableExclude.addEventListener('click', function () {
    excludeFocus.exclude();
});
disableExclude.addEventListener('click', function () {
    excludeFocus.disableExclude();
});

},{"./utils/Focus":4,"./utils/Mediator":5,"./utils/QuerySelector":6,"babel-core/register":1}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $$ = require('./QuerySelector');

var focusableElements = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

module.exports = function () {
    function Focus(element) {
        _classCallCheck(this, Focus);

        this._element = element;
        this._initialize();
    }

    _createClass(Focus, [{
        key: '_initialize',
        value: function _initialize() {
            this._maintainFocusBind = this._maintainFocus.bind(this);
            this._onKeyDownBind = this._onKeyDown.bind(this);
            this._onClickContainBind = this._onClickContain.bind(this);
            this._onClickExcludeBind = this._onClickExclude.bind(this);
            this._onFocusBind = this._onFocus.bind(this);
        }
    }, {
        key: '_onFocus',
        value: function _onFocus() {
            if (this._focusedBefore) {
                this._focusedBefore.focus();
            }
        }
    }, {
        key: '_bindContain',
        value: function _bindContain(unbind) {
            var method = unbind ? 'removeEventListener' : 'addEventListener';
            document.body[method]('focus', this._maintainFocusBind, true);
            document.body[method]('keydown', this._onKeyDownBind, true);
            document.body[method]('click', this._onClickContainBind, true);
        }
    }, {
        key: '_bindExclude',
        value: function _bindExclude(unbind) {
            var method = unbind ? 'removeEventListener' : 'addEventListener';
            document.body[method]('click', this._onClickExcludeBind, true);
        }
    }, {
        key: '_onClickContain',
        value: function _onClickContain(e) {

            // the target of the event
            var target = e.target;

            // check if target is inside of element
            while (target != this._element && target.parentNode) {
                target = target.parentNode;
            }

            // outside of element, cancel click
            if (target !== this._element) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, {
        key: '_onClickExclude',
        value: function _onClickExclude(e) {

            // the target of the event
            var target = e.target;

            // check if target is inside of element
            while (target != this._element && target.parentNode) {
                target = target.parentNode;
            }

            // outside of element, cancel click
            if (target === this._element) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, {
        key: '_onKeyDown',
        value: function _onKeyDown(e) {
            if (this.isActive() && e.which === 9) {
                this._trapTabKey(this._element, e);
            }
        }
    }, {
        key: '_getFocusableElements',
        value: function _getFocusableElements() {
            return $$(focusableElements.join(','), this._element).filter(function (child) {
                return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
            });
        }
    }, {
        key: '_setFocusToFirstElement',
        value: function _setFocusToFirstElement() {
            var focusableChildren = this._getFocusableElements();
            if (focusableChildren.length) {
                focusableChildren[0].focus();
            }
        }
    }, {
        key: '_toggleFocusableChildren',
        value: function _toggleFocusableChildren(enable) {
            var _this = this;

            var focusableChildren = this._getFocusableElements();
            var context = this;
            if (focusableChildren.length) {
                focusableChildren.forEach(function (f) {

                    if (f.disabled == undefined) {
                        f.setAttribute('tabindex', enable ? '' : -1);
                    } else {
                        f.disabled = !enable;
                    }

                    var method = enable ? 'removeEventListener' : 'addEventListener';
                    f[method]('focus', _this._onFocusBind);
                });
            }
        }
    }, {
        key: '_maintainFocus',
        value: function _maintainFocus(e) {
            if (this.isActive() && !this._element.contains(event.target)) {
                this._setFocusToFirstElement();
            }
        }
    }, {
        key: '_trapTabKey',
        value: function _trapTabKey(node, event) {
            var focusableChildren = this._getFocusableElements(node);
            var focusedItemIndex = focusableChildren.indexOf(document.activeElement);

            if (event.shiftKey && focusedItemIndex === 0) {
                focusableChildren[focusableChildren.length - 1].focus();
                event.preventDefault();
            } else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
                focusableChildren[0].focus();
                event.preventDefault();
            }
        }
    }, {
        key: 'isActive',
        value: function isActive() {
            return this._active;
        }
    }, {
        key: 'exclude',
        value: function exclude() {

            // catch clicks
            this._bindExclude();

            this._focusedBefore = document.activeElement;

            // disable children
            this._toggleFocusableChildren(false);
        }
    }, {
        key: 'contain',
        value: function contain() {
            this._active = true;
            this._focusedBefore = document.activeElement;
            this._bindContain();
            this._setFocusToFirstElement();
        }
    }, {
        key: 'disableContain',
        value: function disableContain() {
            this._active = false;
            this._bindContain(true);

            if (this._focusedBefore) {
                this._focusedBefore.focus();
            }
        }
    }, {
        key: 'disableExclude',
        value: function disableExclude() {

            // catch clicks
            this._bindExclude(false);

            // disable children
            this._toggleFocusableChildren(true);
        }
    }]);

    return Focus;
}();

},{"./QuerySelector":6}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _instance;

var Mediator = function () {
    function Mediator() {
        _classCallCheck(this, Mediator);

        this._topics = {};
    }

    _createClass(Mediator, [{
        key: 'subscribe',
        value: function subscribe(topic, callback) {
            if (!this._topics.hasOwnProperty(topic)) {
                this._topics[topic] = [];
            }

            this._topics[topic].push(callback);
            return true;
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe(topic, callback) {
            if (!this._topics.hasOwnProperty(topic)) {
                return false;
            }

            var _this = this;
            this._topics[topic].forEach(function (t, index) {
                if (t === callback) {
                    _this._topics[t].splice(index, 1);
                    return true;
                }
            });

            return false;
        }
    }, {
        key: 'publish',
        value: function publish() {
            var args = Array.prototype.slice.call(arguments);
            var topic = args.shift();

            if (!this._topics.hasOwnProperty(topic)) {
                return false;
            }

            this._topics[topic].forEach(function (t) {
                t.apply(undefined, args);
            });

            return true;
        }
    }]);

    return Mediator;
}();

module.exports = {
    getInstance: function getInstance() {
        if (!_instance) {
            _instance = new Mediator();
        }
        return _instance;
    }
};

},{}],6:[function(require,module,exports){
'use strict';

module.exports = function $$(selector, context) {
    return [].slice.call((context || document).querySelectorAll(selector));
};

},{}]},{},[3]);
