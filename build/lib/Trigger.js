'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Toggle = require('./Toggle');

module.exports = function (_Toggle) {
    _inherits(Trigger, _Toggle);

    function Trigger(element, options) {
        _classCallCheck(this, Trigger);

        // make call to super
        return _possibleConstructorReturn(this, Object.getPrototypeOf(Trigger).call(this, element, options));
    }

    /**
     * Initialize this trigger.
     * @private
     */

    _createClass(Trigger, [{
        key: '_initialize',
        value: function _initialize() {

            // Get targets
            this._targets = this._getTargetIDs();

            // Bind events
            this._bind(true);

            // register without delay
            this.register();

            // set initial state
            this.getTargetState() ? this.activate() : this.deactivate();

            // update
            this.update();
        }

        /**
         * Get object of methods, for easy binding and unbinding.
         * @return {Object}
         * @private
         */

    }, {
        key: '_getShortcuts',
        value: function _getShortcuts() {
            return {
                'click': this._onClick.bind(this),
                'toggle': this._onToggle.bind(this)
            };
        }

        /**
         * Bind events/handlers.
         * @param {Boolean} bind - To bind or to unbind.
         * @private
         */

    }, {
        key: '_bind',
        value: function _bind() {
            var bind = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];


            var method = bind ? 'subscribe' : 'unsubscribe';
            this._mediator[method]('toggle', this._shortcuts.toggle);

            method = bind ? 'addEventListener' : 'removeEventListener';
            this._element[method]('click', this._shortcuts.click);
        }

        /**
         * Check what the current state of the first Toggle targeted is.
         * @returns {*}
         */

    }, {
        key: 'getTargetState',
        value: function getTargetState() {

            if (this._targets && this._targets[0]) {
                var id = this._targets[0],
                    toggle = this._manager.getToggleById(id);
                if (toggle) {
                    return toggle.isActive();
                }
            }

            return false;
        }

        /**
         * Check if this Toggle is a Trigger.
         * @returns {boolean}
         */

    }, {
        key: 'isTrigger',
        value: function isTrigger() {
            return true;
        }

        /**
         * Get an array of ID's of elements/Toggles to target.
         * @returns {Array}
         * @private
         */

    }, {
        key: '_getTargetIDs',
        value: function _getTargetIDs() {

            var result = [];

            // Get ID from href in case the trigger is anchor
            if (this._element.nodeName.toLowerCase() === 'a') {
                var href = this._element.getAttribute('href');
                href ? result.push(href.replace('#', '')) : null;
            }

            // Add targets from aria-controls attribute
            if (this._element.getAttribute('aria-controls')) {
                var targets = this._element.getAttribute('aria-controls').split(' ');
                targets.forEach(function (t) {
                    if (result.indexOf(t) === -1) {
                        result.push(t);
                    }
                });
            }
            return result;
        }

        /**
         * Check if the passed in Toggle event influences this trigger.
         * @param {Event} e - Toggle event.
         * @returns {boolean}
         */

    }, {
        key: 'eventMatch',
        value: function eventMatch(e) {

            var matches = [];

            if (this._element.id === e.id) {
                return false;
            }

            // If the Event has an array of targets, check if those targets match the targets of this trigger.
            if (e.targets) {
                matches = this._targets.filter(function (t) {
                    return e.targets.indexOf(t) !== -1;
                });

                return matches.length > 0;

                // No targets property, check if the Toggle which was toggled is the target of this trigger.
            } else {
                return this._targets.indexOf(e.toggle.getId()) > -1;
            }
        }

        /**
         * Let the world know a Trigger has been clicked.
         * @param {Event} e - The click-event.
         * @private
         */

    }, {
        key: '_onClick',
        value: function _onClick(e) {

            // Let the world know
            this._mediator.publish('trigger', {
                toggle: this,
                id: this.getId(),
                active: this.isActive(),
                targets: this._targets
            });
        }

        /**
         * Check if the trigger should respond to a Toggle event.
         * @param {Event} e - Toggle event.
         * @private
         */

    }, {
        key: '_onToggle',
        value: function _onToggle(e) {

            if (this.eventMatch(e)) {
                _get(Object.getPrototypeOf(Trigger.prototype), 'sync', this).call(this, e.active);
            }
        }
    }]);

    return Trigger;
}(Toggle);