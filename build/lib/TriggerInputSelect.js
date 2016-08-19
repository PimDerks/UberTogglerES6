'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TriggerInput = require('./TriggerInput');

module.exports = function (_TriggerInput) {
    _inherits(TriggerInputSelect, _TriggerInput);

    function TriggerInputSelect(element, options) {
        _classCallCheck(this, TriggerInputSelect);

        // make call to super
        return _possibleConstructorReturn(this, Object.getPrototypeOf(TriggerInputSelect).call(this, element, options));
    }

    /**
     * Custom implementation of the _initialize-method.
     * @private
     */

    _createClass(TriggerInputSelect, [{
        key: '_initialize',
        value: function _initialize() {
            var _this2 = this;

            _get(Object.getPrototypeOf(TriggerInputSelect.prototype), '_initialize', this).call(this);

            // Slight delay, as this will only be triggered once - but multiple toggles will be controlled via this trigger.
            setTimeout(function () {
                _this2._onChange();
            });
        }

        /**
         * Returns an array of the ID's of the Toggles this Trigger targets.
         *
         * @returns {Array}
         * @private
         */

    }, {
        key: '_getTargetIDs',
        value: function _getTargetIDs() {

            var result = [];

            var option = this._element.children[this._element.selectedIndex];

            // Add targets from aria-controls attribute of selected option
            if (option.hasAttribute('aria-controls')) {
                var targets = option.getAttribute('aria-controls').split(' ');
                targets.forEach(function (t) {
                    if (result.indexOf(t) === -1) {
                        result.push(t);
                    }
                });
            }

            return result;
        }

        /**
         * Let the world know this Trigger has changed.
         * @private
         */

    }, {
        key: '_onChange',
        value: function _onChange() {

            var ids = this._getTargetIDs();

            // Let the world know
            this._mediator.publish('trigger', {
                toggle: this,
                id: this.getId(),
                active: ids.length > 0,
                targets: ids
            });
        }

        /**
         * Get shortcuts to methods to bind, for easy binding and unbinding.
         * @returns {{change: (function(this:TriggerInput)|*), keydown: (function(this:TriggerInput)|*)}}
         * @private
         */

    }, {
        key: '_getShortcuts',
        value: function _getShortcuts() {
            return {
                'toggle': this._onToggle.bind(this),
                'change': this._onChange.bind(this)
            };
        }

        /**
         * Bind events.
         * @param {Boolean} (bind)
         * @private
         */

    }, {
        key: '_bind',
        value: function _bind() {
            var bind = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];


            var method = bind ? 'subscribe' : 'unsubscribe';
            this._mediator[method]('toggle', this._shortcuts.toggle);

            method = bind ? 'addEventListener' : 'removeEventListener';

            // custom events
            this._element[method]('change', this._shortcuts.change);
        }
    }]);

    return TriggerInputSelect;
}(TriggerInput);