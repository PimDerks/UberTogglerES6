'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Trigger = require('./Trigger');

module.exports = function (_Trigger) {
    _inherits(TriggerInput, _Trigger);

    function TriggerInput(element, options) {
        _classCallCheck(this, TriggerInput);

        // make call to super
        return _possibleConstructorReturn(this, Object.getPrototypeOf(TriggerInput).call(this, element, options));
    }

    /**
     * Check if the inputs value is empty.
     * @returns {boolean}
     * @private
     */


    _createClass(TriggerInput, [{
        key: '_getState',
        value: function _getState() {
            return this._element.value != '';
        }

        /**
         * Let the world know.
         * @private
         */

    }, {
        key: '_onChange',
        value: function _onChange() {

            // Let the world know
            this._mediator.publish('trigger', {
                toggle: this,
                id: this.getId(),
                active: this._element.value === '',
                targets: this._targets,
                force: true
            });
        }

        /**
         * On keydown, check if value has changed.
         * @param e
         * @private
         */

    }, {
        key: '_onKeyDown',
        value: function _onKeyDown(e) {

            // set to end of queue so value is in input
            setTimeout(this._shortcuts.change);
        }

        /**
         * Activate this trigger.
         */

    }, {
        key: 'activate',
        value: function activate() {
            _get(Object.getPrototypeOf(TriggerInput.prototype), 'activate', this).call(this);
            this._element.value != '';
        }

        /**
         * Deactivate this Trigger
         */

    }, {
        key: 'deactivate',
        value: function deactivate() {
            _get(Object.getPrototypeOf(TriggerInput.prototype), 'deactivate', this).call(this);
            this._element.value == '';
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
                'change': this._onChange.bind(this),
                'keydown': this._onKeyDown.bind(this)
            };
        }

        /**
         * Bind events.
         * @param {Boolean} bind - To bind or unbind.
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
            this._element[method]('keydown', this._shortcuts.keydown);
        }
    }]);

    return TriggerInput;
}(Trigger);