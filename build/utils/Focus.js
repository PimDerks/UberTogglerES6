'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $$ = require('./QuerySelector');

var focusableElements = ['a[href]', 'area[href]', 'input', 'select', 'textarea', 'button', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

module.exports = function () {
    function Focus(element) {
        _classCallCheck(this, Focus);

        this._element = element;
        this._initialize();
    }

    /**
     * Set shortcuts for easy (un)binding of methods.
     * @private
     */

    _createClass(Focus, [{
        key: '_initialize',
        value: function _initialize() {
            this._maintainFocusBind = this._maintainFocus.bind(this);
            this._onKeyDownBind = this._onKeyDown.bind(this);
            this._onClickContainBind = this._onClickContain.bind(this);
            this._onClickExcludeBind = this._onClickExclude.bind(this);
            this._onFocusBind = this._onFocus.bind(this);
        }

        /**
         * Cancel setting focus on element outside of container.
         * @private
         */

    }, {
        key: '_onFocus',
        value: function _onFocus(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        /**
         * Bind events for containing focus.
         * @param {Boolean} bind - Bind or unbind.
         * @private
         */

    }, {
        key: '_bindContain',
        value: function _bindContain() {
            var bind = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            var method = bind ? 'addEventListener' : 'removeEventListener';
            document.body[method]('focus', this._maintainFocusBind, true);
            document.body[method]('keydown', this._onKeyDownBind, true);
            document.body[method]('click', this._onClickContainBind, true);
        }

        /**
         * Bind events for excluding focus.
         * @param {Boolean} bind - Bind or unbind.
         * @private
         */

    }, {
        key: '_bindExclude',
        value: function _bindExclude() {
            var bind = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            var method = bind ? 'addEventListener' : 'removeEventListener';
            document.body[method]('click', this._onClickExcludeBind, true);
        }

        /**
         * Catch clicks in a focus-contain scenario.
         * @param {Event} e - Click event.
         * @private
         */

    }, {
        key: '_onClickContain',
        value: function _onClickContain(e) {

            // the target of the event
            var target = e.target;

            // check if target is inside of element
            while (target != this._element && target.parentNode) {
                target = target.parentNode;
            }

            // inside of element, cancel click
            if (target !== this._element) {
                e.preventDefault();
                e.stopPropagation();
            }
        }

        /**
         * Catch clicks in a focus-exclude scenario.
         * @param e
         * @private
         */

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

        /**
         * Trap tab key.
         * @param {Event} e - Keydown event.
         * @private
         */

    }, {
        key: '_onKeyDown',
        value: function _onKeyDown(e) {
            if (this.isActive() && e.which === 9) {
                this._trapTabKey(this._element, e);
            }
        }

        /**
         * Get a list of focusable element in the current node.
         * @returns {*}
         * @private
         */

    }, {
        key: '_getFocusableElements',
        value: function _getFocusableElements() {
            return $$(focusableElements.join(','), this._element).filter(function (child) {
                return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
            });
        }

        /**
         * Set focus to the first focusable element.
         * @private
         */

    }, {
        key: '_setFocusToFirstElement',
        value: function _setFocusToFirstElement() {
            var focusableChildren = this._getFocusableElements();
            if (focusableChildren.length) {
                focusableChildren[0].focus();
            }
        }

        /**
         * Enable or disable children.
         * @param {Boolean} enable - Enable of disable.
         * @private
         */

    }, {
        key: '_toggleFocusableChildren',
        value: function _toggleFocusableChildren(enable) {
            var _this = this;

            var focusableChildren = this._getFocusableElements();

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

        /**
         * Maintain focus when tabbing to outside context.
         * @param e
         * @private
         */

    }, {
        key: '_maintainFocus',
        value: function _maintainFocus(e) {
            if (this.isActive() && !this._element.contains(event.target)) {
                this._setFocusToFirstElement();
            }
        }

        /**
         * Trap tab-key default behaviour by hacking default focus order.
         * @param node
         * @param event
         * @private
         */

    }, {
        key: '_trapTabKey',
        value: function _trapTabKey(node, event) {
            var focusableChildren = this._getFocusableElements(node),
                focusedItemIndex = focusableChildren.indexOf(document.activeElement);

            if (event.shiftKey && focusedItemIndex === 0) {
                focusableChildren[focusableChildren.length - 1].focus();
                event.preventDefault();
            } else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
                focusableChildren[0].focus();
                event.preventDefault();
            }
        }

        /**
         * Check if the module is active.
         * @returns {Boolean}
         */

    }, {
        key: 'isActive',
        value: function isActive() {
            return this._active;
        }

        /**
         *  Exclude element and its children from focus.
         */

    }, {
        key: 'exclude',
        value: function exclude() {

            // catch clicks
            this._bindExclude(true);

            this._focusedBefore = document.activeElement;

            // disable children
            this._toggleFocusableChildren(false);
        }

        /**
         *  Contain focus to element and its children.
         */

    }, {
        key: 'contain',
        value: function contain() {

            this._active = true;
            this._focusedBefore = document.activeElement;
            this._bindContain(true);
            this._setFocusToFirstElement();
        }

        /**
         * Disable containment of focus.
         */

    }, {
        key: 'disableContain',
        value: function disableContain() {
            this._active = false;
            this._bindContain(false);

            if (this._focusedBefore) {
                this._focusedBefore.focus();
            }
        }

        /**
         * Disable excludement of focus.
         */

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