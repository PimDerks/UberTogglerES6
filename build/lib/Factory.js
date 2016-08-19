'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mediator = require('../utils/Mediator'),
    Manager = require('./Manager'),
    Toggle = require('./Toggle'),
    Trigger = require('./Trigger'),
    TriggerInput = require('./TriggerInput'),
    TriggerLink = require('./TriggerLink'),
    TriggerInputChoice = require('./TriggerInputChoice'),
    TriggerInputSelect = require('./TriggerInputSelect');

module.exports = function () {
    function Factory(element, options) {
        _classCallCheck(this, Factory);

        this._element = element;
        this._options = options;
        this._manager = Manager.getInstance();
        this._initialize();
    }

    _createClass(Factory, [{
        key: '_initialize',
        value: function _initialize() {

            // create toggle
            this._toggle = this._create(this._element, this._options);

            // find triggers
            if (this._toggle) {
                this._createTriggersForToggle(this._toggle);
            }
        }
    }, {
        key: 'getToggle',
        value: function getToggle() {
            return this._toggle;
        }
    }, {
        key: '_create',
        value: function _create(node) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


            var name = node.nodeName.toLowerCase(),
                toggle = void 0;

            // check if this node is already a trigger
            if (node.id && this._manager.getToggleById(node.id)) {
                return;
            }

            switch (name) {
                case 'select':
                    toggle = new TriggerInputSelect(node, options);
                    break;
                case 'input':
                    switch (node.type) {
                        case 'radio':
                        case 'checkbox':
                            toggle = new TriggerInputChoice(node, options);
                            break;
                        default:
                            toggle = new TriggerInput(node, options);
                            break;
                    }
                    break;
                case 'a':
                    toggle = new TriggerLink(node, options);
                    break;
                default:
                    if (node.hasAttribute('href') || node.hasAttribute('aria-controls')) {
                        toggle = new Trigger(node, options);
                        break;
                    }
                    toggle = new Toggle(node, options);
                    break;
            }

            return toggle;
        }

        /**
         * Finds triggers for the given Toggle.
         *
         * @param Toggle
         * @private
         */

    }, {
        key: '_createTriggersForToggle',
        value: function _createTriggersForToggle(Toggle) {

            var id = Toggle.getId(),
                triggers = document.querySelectorAll('[href="#' + id + '"], [aria-controls~="' + id + '"]:not(option)');

            // create new toggles
            [].slice.apply(triggers).forEach(function (t) {
                new Factory(t);
            });
        }
    }]);

    return Factory;
}();