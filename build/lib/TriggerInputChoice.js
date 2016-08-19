'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TriggerInput = require('./TriggerInput');

module.exports = function (_TriggerInput) {
    _inherits(TriggerInputChoice, _TriggerInput);

    function TriggerInputChoice(element, options) {
        _classCallCheck(this, TriggerInputChoice);

        // make call to super
        return _possibleConstructorReturn(this, Object.getPrototypeOf(TriggerInputChoice).call(this, element, options));
    }

    /**
     * Get the state of this Trigger.
     * @returns {Boolean}
     * @private
     */

    _createClass(TriggerInputChoice, [{
        key: '_getState',
        value: function _getState() {
            return this._element.checked;
        }

        /**
         * Let the world know this Trigger has changed.
         * @private
         */

    }, {
        key: '_onChange',
        value: function _onChange() {

            // Let the world know
            this._mediator.publish('trigger', {
                toggle: this,
                id: this.getId(),
                active: this.isActive(),
                targets: this._targets
            });
        }

        /**
         * Activate this trigger.
         */

    }, {
        key: 'activate',
        value: function activate() {
            _get(Object.getPrototypeOf(TriggerInputChoice.prototype), 'activate', this).call(this);
            this._element.checked = true;
        }

        /**
         * Deactivate this trigger.
         */

    }, {
        key: 'deactivate',
        value: function deactivate() {
            _get(Object.getPrototypeOf(TriggerInputChoice.prototype), 'deactivate', this).call(this);
            this._element.checked = false;
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

    return TriggerInputChoice;
}(TriggerInput);