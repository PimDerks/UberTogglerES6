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

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var Factory = function () {
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

exports.default = Factory;
;

},{"../utils/Mediator":14,"./Manager":5,"./Toggle":6,"./Trigger":7,"./TriggerInput":8,"./TriggerInputChoice":9,"./TriggerInputSelect":10,"./TriggerLink":11}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mediator = require('../utils/Mediator');

module.exports = function () {
    function Group(id) {
        _classCallCheck(this, Group);

        // Set ID of group
        this._id = id;

        // Create property to keep track of all toggles inside this group
        this._toggles = [];

        // Initialize the group
        this._initialize();
    }

    /**
     * Initialize this group.
     *
     * @private
     */

    _createClass(Group, [{
        key: '_initialize',
        value: function _initialize() {

            this._mediator = Mediator.getInstance();
            this._onToggleBind = this._onToggle.bind(this);
            this._mediator.subscribe('toggle', this._onToggleBind);
        }

        /**
         * Respond to the toggle-event.
         *
         * @param e
         * @private
         */

    }, {
        key: '_onToggle',
        value: function _onToggle(e) {

            var toggle = e.toggle;

            if (this.containsToggle(toggle)) {

                if (e.active) {
                    this._closeAllExcept(toggle);
                } else if (!this.getActiveToggle() && this._default) {
                    this._default.activate();
                }
            }
        }

        /**
         * Register a toggle
         *
         * @memberof ToggleGroup
         * @param {Object} Toggle
         * @public
         */

    }, {
        key: 'register',
        value: function register(Toggle) {

            // add
            this._toggles.push(Toggle);

            // check if default
            if (Toggle.getElement().dataset.groupDefault) {
                this._default = Toggle;
            }
        }

        /**
         * Get the ID of this group.
         *
         * @returns {String}
         */

    }, {
        key: 'getId',
        value: function getId() {
            return this._id;
        }

        /**
         * Get all Toggles in this group.
         *
         * @returns {Array}
         */

    }, {
        key: 'getToggles',
        value: function getToggles() {
            return this._toggles;
        }

        /**
         * Check if one of the Toggles in this group is active.
         *
         * @returns {boolean}
         */

    }, {
        key: 'hasActiveToggle',
        value: function hasActiveToggle() {
            return this._toggles.filter(function (t) {
                return t.isActive();
            }).length > 0;
        }

        /**
         * Get the currently active Toggle.
         *
         * @returns {*} Toggle object when a toggle is active. Otherwise false.
         */

    }, {
        key: 'getActiveToggle',
        value: function getActiveToggle() {
            var active = this._toggles.filter(function (t) {
                return t.isActive();
            });
            return active[0] || false;
        }

        /**
         * Keep track of the currently active Toggle.
         *
         * @param Toggle
         */

    }, {
        key: 'setActiveToggle',
        value: function setActiveToggle(Toggle) {
            this._activeToggle = Toggle;
        }

        /**
         * Check if the passed in Toggle is contained in this group.
         *
         * @param Toggle
         * @returns {boolean}
         */

    }, {
        key: 'containsToggle',
        value: function containsToggle(Toggle) {
            return this._toggles.indexOf(Toggle) > -1;
        }

        /**
         * Remove a toggle
         *
         * @memberof ToggleGroup
         * @param {Object} Toggle
         */

    }, {
        key: 'remove',
        value: function remove(Toggle) {
            var _this = this;

            this._toggles.forEach(t, function (i) {

                if (t == Toggle) {
                    _this._toggles.splice(i, 1);
                    return;
                }
            });
        }

        /**
         * Close all toggles.
         *
         * @param {Object} Toggle
         * @private
         */

    }, {
        key: '_closeAll',
        value: function _closeAll() {

            this._toggles.forEach(function (t) {
                if (t.isActive()) {
                    t.deactivate();
                }
            });
        }

        /**
         * Close all toggles except the given Toggle.
         * @param {Object} Toggle
         * @private
         */

    }, {
        key: '_closeAllExcept',
        value: function _closeAllExcept(Toggle) {

            this._toggles.forEach(function (t) {

                // deactivate
                if (t !== Toggle && t.isActive()) {
                    t.deactivate();
                }
            });

            this.setActiveToggle(Toggle);
        }

        /**
         * Get the size of this group.
         * @return {Number} The number of items.
         */

    }, {
        key: 'getSize',
        value: function getSize() {
            return this._toggles.length;
        }

        /**
         * Unload.
         *
         * @method unload
         */

    }, {
        key: 'unload',
        value: function unload() {

            // Empty array
            this._toggles = [];
        }
    }]);

    return Group;
}();

},{"../utils/Mediator":14}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _instance = void 0;

var Group = require('./Group');

var Manager = function () {
    function Manager() {
        _classCallCheck(this, Manager);

        this._toggles = [];
        this._groups = [];
    }

    /**
     * Register toggle
     *
     * @method register
     * @param {Object} Toggle - Instance of Toggle.
     */

    _createClass(Manager, [{
        key: 'add',
        value: function add(Toggle) {

            // add to togglers
            this._toggles.push(Toggle);

            // look for groups
            this._manageGroup(Toggle);
        }

        /**
         * Unregister toggle
         *
         * @param {Object} Toggle - Instance of Toggle.
         */

    }, {
        key: 'remove',
        value: function remove(Toggle) {
            var _this = this;

            // check if part of group
            var groupMember = Toggle.getGroup();
            if (groupMember) {

                // check if group exists
                if (this._groups[groupMember]) {
                    this._groups[groupMember].remove(Toggle);
                }
            }

            // remove from this._toggles
            this._toggles.forEach(t, function (i) {
                if (t === Toggle) {
                    _this._toggles.splice(i, 1);
                }
            });
        }

        /**
         * Get triggers for the given Toggle.
         * @param {Object} Toggle - Instance of Toggle.
         */

    }, {
        key: 'getTriggersForToggle',
        value: function getTriggersForToggle(Toggle) {

            return this._toggles.filter(function (t) {
                if (t.isTrigger() && t._targets) {
                    return t._targets.indexOf(Toggle.getId()) > -1;
                }
            });
        }

        /**
         * Manage group
         *
         * @param {Object} Toggle object.
         * @private
         */

    }, {
        key: '_manageGroup',
        value: function _manageGroup(Toggle) {

            // check if part of group
            var group = Toggle.getGroup();
            if (group) {

                // check if group exists, if not create
                if (!this._groups[group]) {
                    this._groups[group] = new Group(group);
                }

                // register in group
                this._groups[group].register(Toggle);
            }
        }

        /**
         * Get toggle by Id
         *
         * @param {String} Id of toggle to get
         * @return {*} Toggle when found, otherwise false.
         */

    }, {
        key: 'getToggleById',
        value: function getToggleById(id) {

            // loop through all toggles to find the one with the given ID
            var result = this._toggles.filter(function (t) {
                return t.getId() === id;
            });

            if (result.length > 0) {
                return result[0];
            } else {
                return false;
            }
        }

        /**
         * Get an instance of the Toggle group with the parsed in id.
         * @param id
         * @returns {*} If found, the group - otherwise false.
         */

    }, {
        key: 'getToggleGroupById',
        value: function getToggleGroupById(id) {

            for (var group in this._groups) {
                if (group === id) {
                    return this._groups[group];
                }
            }
            return false;
        }
    }]);

    return Manager;
}();

module.exports = {
    getInstance: function getInstance() {
        if (!_instance) {
            _instance = new Manager();
        }
        return _instance;
    }
};

},{"./Group":4}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mediator = require('../utils/Mediator'),
    Focus = require('../utils/Focus'),
    Manager = require('./Manager'),
    $$ = require('../utils/QuerySelector');

var defaultOptions = {
    outside: false,
    focus: false,
    focusContain: false,
    focusExclude: false,
    group: false,
    activateOnly: false,
    ariaHidden: false,
    ariaDisabled: false,
    ariaExpanded: false,
    ariaPressed: false,
    ariaChecked: false
};

var focusableElements = ['a[href]', 'area[href]', 'input', 'select', 'textarea', 'button', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

module.exports = function () {
    function Toggle(element, options) {
        _classCallCheck(this, Toggle);

        this._element = element;
        this._options = this._mergeOptions(options);

        // Set ID of Toggle
        this._setId();

        // Set local private property
        this._id = this.getId();

        // Get instance of the Mediator
        this._mediator = Mediator.getInstance();

        // Get instance of the Manager
        this._manager = Manager.getInstance();

        // Shortcuts for events
        this._shortcuts = this._getShortcuts();

        // initialize toggle
        this._initialize();
    }

    /**
     * Get the value of an option.
     * @param {String} key - The key to check for in the options.
     * @param {Object} options - The options passed in from the constructor
     * @return {Boolean}
     * @private
     */

    _createClass(Toggle, [{
        key: '_getOption',
        value: function _getOption(key, options) {

            // 1st: If passed in to constructor, it has precedence

            if (options && options[key]) {
                return options[key];
            }

            // 2nd: DOM API

            if (this._element.dataset[key]) {
                var attr = this._element.dataset[key];
                switch (attr) {
                    case 'true':
                        return true;
                        break;
                    case 'false':
                        return false;
                        break;
                    default:
                        return attr;
                }
            }

            // 3rd: Defaults

            if (defaultOptions && defaultOptions[key]) {
                return defaultOptions[key];
            }

            // 4th: False

            return false;
        }

        /**
         * Merge options. First use options-object passed in to constructor, then DOM API, then defaults.
         * @return {Object} The final options.
         * @private
         */

    }, {
        key: '_mergeOptions',
        value: function _mergeOptions(options) {

            return {
                outside: this._getOption('outside', options),
                focus: this._getOption('focus', options),
                focusContain: this._getOption('focusContain', options),
                focusExclude: this._getOption('focusExclude', options),
                group: this._getOption('group', options),
                activateOnly: this._getOption('activateOnly', options),
                ariaHidden: this._getOption('ariaHidden', options),
                ariaDisabled: this._getOption('ariaDisabled', options),
                ariaExpanded: this._getOption('ariaExpanded', options),
                ariaPressed: this._getOption('ariaPressed', options),
                ariaChecked: this._getOption('ariaChecked', options)
            };
        }

        /**
         * Initialize the Toggle
         * @private
         */

    }, {
        key: '_initialize',
        value: function _initialize() {
            var _this = this;

            // Bind events
            this._bind(true);

            // Create instance of Focus containments
            if (this._options.focusContain || this._options.focusExclude) {
                this._focus = new Focus(this._element);
            }

            // Register toggle
            setTimeout(function () {
                _this.register();
                _this.update();
            });
        }

        /**
         * Get the ID of this Toggle.
         *
         * @returns {String} - The ID of the Toggle.
         */

    }, {
        key: 'getId',
        value: function getId() {
            return this._id;
        }

        /**
         * Set the ID of this Toggle.
         * @private
         */

    }, {
        key: '_setId',
        value: function _setId() {
            var id = this._element.id;
            if (!id) {
                id = Math.random().toString(36).substring(7);
                this._element.setAttribute('id', id);
            }
            this._id = id;
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
                'trigger': this._onTrigger.bind(this),
                'hashchange': this._onHashChange.bind(this),
                'bodyclick': this._onBodyClick.bind(this),
                'mouseenter': this._onMouseEnter.bind(this),
                'mouseleave': this._onMouseLeave.bind(this)
            };
        }

        /**
         *
         * @param {Boolean} bind - Bind or unbind.
         * @private
         */

    }, {
        key: '_bind',
        value: function _bind() {
            var bind = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];


            var method = bind ? 'addEventListener' : 'removeEventListener';

            // Listen to toggle-event
            if (method) {
                this._mediator.subscribe('trigger', this._shortcuts.trigger);
            } else {
                this._mediator.unsubscribe('trigger', this._shortcuts.trigger);
            }

            // Listen to hashchange
            window[method]('hashchange', this._shortcuts.hashchange, false);

            // Listen to click event on body
            if (this._options.outside) {

                if (this._options.outside || this._options.outside === 'both' || this._options.outside === 'click') {
                    document.body[method]('click', this._shortcuts.bodyclick);
                }

                if (this._options.outside === 'both' || this._options.outside === 'mouse') {
                    this._element[method]('mouseenter', this._shortcuts.mouseenter);
                    this._element[method]('mouseleave', this._shortcuts.mouseleave);
                }
            }
        }

        /**
         * Register the toggle
         */

    }, {
        key: 'register',
        value: function register() {

            // register
            this._manager.add(this);

            // get initial state
            this._isActive = this._getState();

            // set initial state
            this.isActive() ? this.activate() : this.deactivate();
        }

        /**
         * Get the element of this Toggle.
         *
         * @returns {Element}
         */

    }, {
        key: 'getElement',
        value: function getElement() {
            return this._element;
        }

        /**
         * Get the group of this Toggle, if available.
         *
         * @returns {String} The group this Toggle belongs to.
         */

    }, {
        key: 'getGroup',
        value: function getGroup() {
            return this._element.dataset.group;
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
         * Activate this Toggle.
         */

    }, {
        key: 'activate',
        value: function activate() {

            if (!this.isActive()) {

                this._isActive = true;
                this.update();

                if (this._options.outside === 'mouse' || this._options === 'both') {
                    this._startMouseTimer(1000);
                }

                if (this._options.focus) {
                    var children = this._getFocusableElements();
                    if (children[0]) {
                        children[0].focus();
                    }
                    this._element.focus();
                }
            }
        }

        /**
         *  Deactivate this Toggle.
         */

    }, {
        key: 'deactivate',
        value: function deactivate() {

            if (this.isActive()) {

                this._isActive = false;
                this.update();
            }
        }

        /**
         * Set the state of this toggle.
         * @private
         */

    }, {
        key: 'update',
        value: function update() {

            // Publish event
            this._mediator.publish('toggle', {
                toggle: this,
                id: this.getId(),
                active: this.isActive()
            });

            // Set aria-hidden state
            if (this._options.ariaHidden) {
                this._element.setAttribute('aria-hidden', !this.isActive());
            }

            // Set aria-disabled state
            if (this._options.ariaDisabled) {
                this._element.setAttribute('aria-disabled', !this.isActive());
            }

            // Set aria-collapsed state
            if (this._options.ariaExpanded) {
                this._element.setAttribute('aria-expanded', this.isActive());
            }

            // Set aria-pressed state
            if (this._options.ariaPressed) {
                this._element.setAttribute('aria-pressed', this.isActive());
            }

            // Set aria-checked state
            if (this._options.ariaChecked) {
                this._element.setAttribute('aria-checked', this.isActive());
            }

            this._element.setAttribute('data-active', this.isActive());

            // Contain focus
            if (this._options.focusContain) {
                if (this.isActive()) {
                    this._focus.contain();
                } else {
                    this._focus.disableContain();
                }
            }

            // Exclude focus
            if (this._options.focusExclude) {
                if (this.isActive()) {
                    this._focus.disableExclude();
                } else {
                    this._focus.exclude();
                }
            }
        }

        /**
         * Get the current state of this Toggle.
         * @return {Boolean} Active or not active.
         */

    }, {
        key: '_getState',
        value: function _getState() {

            // first check if one of the triggers is active
            if (this.hasActiveTrigger() || this.hasActiveHash()) {
                return true;
                // check if aria-hidden is available
            } else if (this._element.hasAttribute('aria-hidden')) {
                return this._element.getAttribute('aria-hidden') === "false";
                // check if aria-disabled is available
            } else if (this._element.hasAttribute('aria-disabled')) {
                return this._element.getAttribute('aria-disabled') === "false";
                // default
            } else {
                return this._element.getAttribute('data-active') === "true";
            }

            // default
            return false;
        }

        /**
         * Check if this Toggle is active.
         *
         * @returns {boolean}
         */

    }, {
        key: 'isActive',
        value: function isActive() {
            return this._isActive;
        }

        /**
         * Reverse the state of this Toggle.
         * @param {Event} e - Event.
         */

    }, {
        key: 'toggle',
        value: function toggle(e) {

            var activate = this.isActive();

            if (e && e.force) {
                activate = e.active;
            }

            activate ? this.deactivate() : this.activate();
        }

        /**
         * Check if this Toggle should respond to a toggle-event thrown.
         * @param {Event} e - Toggle event.
         * @returns {Boolean} - Matches with thrown event.
         */

    }, {
        key: 'eventMatch',
        value: function eventMatch(e) {

            // Check if event matched with this ID
            if (e.id === this.getId()) {
                return false;
            }

            // Check if event has targets. Return if a match has been found.
            if (e.targets) {
                return e.targets.indexOf(this.getId()) > -1;
            }

            return false;
        }

        /**
         * Sync the state of this Toggle with the given parameter.
         *
         * @param {Boolean} active - Activate or deactivate toggle.
         * @private
         */

    }, {
        key: 'sync',
        value: function sync(active) {

            if (active !== this.isActive()) {
                this.toggle();
            }
        }

        /**
         * Check if this Toggle is a trigger as well. Will be overwritten in subclasses.
         * @return false - by default a Toggle cannot be a trigger.
         */

    }, {
        key: 'isTrigger',
        value: function isTrigger() {
            return false;
        }

        /**
         * Check if the hash in the URL is the ID of this Toggle.
         * @return {Boolean}
         */

    }, {
        key: 'hasActiveHash',
        value: function hasActiveHash() {
            var hash = window.location.hash.replace('#', '');
            return hash === this.getId();
        }

        /**
         * Check if one of the triggers for this Toggle is active.
         * @return {Boolean}
         */

    }, {
        key: 'hasActiveTrigger',
        value: function hasActiveTrigger() {

            // check if one of the triggers for this toggle is active
            var triggers = this._manager.getTriggersForToggle(this),
                active = false;

            // loop through all triggers
            triggers.forEach(function (t) {
                if (!active) {
                    active = t.isActive();
                }
            });

            return active;
        }

        /**
         * Respond to a toggle-event.
         *
         * @param {Event} e - The Trigger event.
         * @private
         */

    }, {
        key: '_onTrigger',
        value: function _onTrigger(e) {

            if (this.eventMatch(e)) {

                if (this._options.activateOnly && this.getGroup() && this.isActive()) {
                    return;
                }

                this.toggle(e);

                if (e.type === 'link') {

                    // Set hash
                    var href = !this.isActive() ? '#' : this.getId();

                    if (history.pushState && href) {
                        history.pushState(null, null, '#' + href);
                    } else {
                        location.hash = href;
                    }
                }
            }
        }

        /**
         * Start the timer when the mouse leaves the element
         */

    }, {
        key: '_onMouseLeave',
        value: function _onMouseLeave() {
            this._startMouseTimer();
        }

        /**
         * When the mouse leaves the Toggle, start a timer to close the Toggle after $delay.
         * @param {Number} delay - The time to wait to close the Toggle.
         */

    }, {
        key: '_startMouseTimer',
        value: function _startMouseTimer(delay) {
            var _this2 = this;

            if (!delay) {
                delay = 500;
            }

            // start timer
            this._mouseTimer = setTimeout(function () {
                _this2.deactivate();
            }, delay);
        }

        /**
         * When an element is entered by a mouse, clear the timer to close the Toggle.
         */

    }, {
        key: '_onMouseEnter',
        value: function _onMouseEnter() {
            if (this._mouseTimer) {
                clearTimeout(this._mouseTimer);
            }
        }

        /**
         * Close the Toggle when clicked outside.
         * @param {Event} e - The click event on the body.
         */

    }, {
        key: '_onBodyClick',
        value: function _onBodyClick(e) {

            // target click
            var target = e.target;

            // get triggers related to this toggle
            var triggers = this._manager.getTriggersForToggle(this),
                elements = [this._element],
                inside = false;

            // add elements of triggers to 'elements' array
            triggers.forEach(function (t) {
                elements.push(t.getElement());
            });

            var isChildOf = function isChildOf(element, parentElement) {
                var parent = element;
                do {

                    if (parent && parent === parentElement) {
                        return true;
                    }

                    if (parent == document.documentElement) {
                        break;
                    }

                    // jshint -W084
                } while (parent = parent.parentNode);
                return false;
            };

            // check if click is on toggle or on triggers
            elements.forEach(function (el) {

                if (isChildOf(target, el) && !inside) {
                    inside = true;
                };
            });

            if (!inside && this.isActive()) {
                this.deactivate();
            }
        }

        /**
         * Listen to hash-change events.
         * @param {Event} e - The HashChange-event thrown by the browser.
         */

    }, {
        key: '_onHashChange',
        value: function _onHashChange(e) {

            var hash = window.location.hash.replace('#', ''),
                oldHash = e.oldURL.substr(e.oldURL.indexOf('#')).replace('#', '');

            if (hash === this.getId()) {
                this.isActive() ? null : this.activate();
            }

            if (oldHash === this.getId()) {
                this.isActive() ? this.deactivate() : null;
            }
        }
    }]);

    return Toggle;
}();

},{"../utils/Focus":13,"../utils/Mediator":14,"../utils/QuerySelector":15,"./Manager":5}],7:[function(require,module,exports){
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

},{"./Toggle":6}],8:[function(require,module,exports){
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

},{"./Trigger":7}],9:[function(require,module,exports){
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

},{"./TriggerInput":8}],10:[function(require,module,exports){
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

},{"./TriggerInput":8}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Trigger = require('./Trigger');

module.exports = function (_Trigger) {
    _inherits(TriggerLink, _Trigger);

    function TriggerLink(element, options) {
        _classCallCheck(this, TriggerLink);

        // make call to super
        return _possibleConstructorReturn(this, Object.getPrototypeOf(TriggerLink).call(this, element, options));
    }

    /**
     * Respond to clicks on this Trigger
     * @param {Event} e - Click event.
     * @private
     */

    _createClass(TriggerLink, [{
        key: '_onClick',
        value: function _onClick(e) {

            // Cancel default event
            e.preventDefault();
            e.stopPropagation();

            // Let the world know
            this._mediator.publish('trigger', {
                toggle: this,
                id: this.getId(),
                active: this.isActive(),
                targets: this._targets,
                type: 'link'
            });
        }
    }]);

    return TriggerLink;
}(Trigger);

},{"./Trigger":7}],12:[function(require,module,exports){
'use strict';

require('babel-core/register');

var Focus = require('./utils/Focus'),
    Toggle = require('./lib/Factory'),
    $$ = require('./utils/QuerySelector');

// create Toggles
var toggles = $$('.toggle');
toggles.forEach(function (t) {
    "use strict";

    new Toggle(t);
});

// dynamic toggles
var button = document.getElementById('add-toggle'),
    count = [].slice.apply(document.getElementById('dynamic-buttons').querySelectorAll('button')).length;
if (button) {
    button.addEventListener('click', function () {

        count++;

        // id
        var id = 'toggle-dynamic-group-' + Math.random().toString(36).substring(7);

        // create toggle
        var toggle = document.createElement('div');
        toggle.href = '#toggle-dynamic';
        toggle.innerHTML = 'Toggle ' + count;
        toggle.id = id;
        toggle.className = 'toggle';
        toggle.setAttribute('data-group', 'dynamic');

        // create trigger
        var trigger = document.createElement('button');
        trigger.setAttribute('aria-controls', id);
        trigger.innerHTML = 'Trigger ' + count;

        // append
        document.getElementById('dynamic-toggles').appendChild(toggle);
        document.getElementById('dynamic-buttons').appendChild(trigger);

        // create trigger and toggle
        new Toggle(toggle);
        new Toggle(trigger);
    });
}

},{"./lib/Factory":3,"./utils/Focus":13,"./utils/QuerySelector":15,"babel-core/register":1}],13:[function(require,module,exports){
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

},{"./QuerySelector":15}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _instance;

var Mediator = function () {
    function Mediator() {
        _classCallCheck(this, Mediator);

        this._topics = {};
    }

    /**
     * Subscribe to an event.
     * @param {String} topic - The event to subscribe to.
     * @param {Function} callback - The function to execute when the event is triggered.
     * @returns {boolean}
     */

    _createClass(Mediator, [{
        key: 'subscribe',
        value: function subscribe(topic, callback) {
            if (!this._topics.hasOwnProperty(topic)) {
                this._topics[topic] = [];
            }

            this._topics[topic].push(callback);
            return true;
        }

        /**
         * Unsubscribe from an event.
         * @param {String} topic - The event to unsubscribe from.
         * @param {Function} callback - The function to unsubscribel
         * @returns {boolean}
         */

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

        /**
         * Publish an event.
         * @returns {boolean}
         */

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

},{}],15:[function(require,module,exports){
'use strict';

module.exports = function $$(selector) {
    var context = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    return [].slice.call(context.querySelectorAll(selector));
};

},{}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtY29yZS9yZWdpc3Rlci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1yZWdpc3Rlci9saWIvYnJvd3Nlci5qcyIsInNyYy9qcy9saWIvRmFjdG9yeS5qcyIsInNyYy9qcy9saWIvR3JvdXAuanMiLCJzcmMvanMvbGliL01hbmFnZXIuanMiLCJzcmMvanMvbGliL1RvZ2dsZS5qcyIsInNyYy9qcy9saWIvVHJpZ2dlci5qcyIsInNyYy9qcy9saWIvVHJpZ2dlcklucHV0LmpzIiwic3JjL2pzL2xpYi9UcmlnZ2VySW5wdXRDaG9pY2UuanMiLCJzcmMvanMvbGliL1RyaWdnZXJJbnB1dFNlbGVjdC5qcyIsInNyYy9qcy9saWIvVHJpZ2dlckxpbmsuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlscy9Gb2N1cy5qcyIsInNyYy9qcy91dGlscy9NZWRpYXRvci5qcyIsInNyYy9qcy91dGlscy9RdWVyeVNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7Ozs7Ozs7Ozs7QUFFQSxJQUFJLFdBQVcsUUFBUSxtQkFBUixDQUFmO0FBQUEsSUFDSSxVQUFVLFFBQVEsV0FBUixDQURkO0FBQUEsSUFFSSxTQUFTLFFBQVEsVUFBUixDQUZiO0FBQUEsSUFHSSxVQUFVLFFBQVEsV0FBUixDQUhkO0FBQUEsSUFJSSxlQUFlLFFBQVEsZ0JBQVIsQ0FKbkI7QUFBQSxJQUtJLGNBQWMsUUFBUSxlQUFSLENBTGxCO0FBQUEsSUFNSSxxQkFBcUIsUUFBUSxzQkFBUixDQU56QjtBQUFBLElBT0kscUJBQXFCLFFBQVEsc0JBQVIsQ0FQekI7O0lBVXFCLE87QUFFakIscUJBQVksT0FBWixFQUFxQixPQUFyQixFQUE2QjtBQUFBOztBQUV6Qixh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LEdBQWlCO0FBQ2IsaUJBQVksdUJBQVU7QUFDbEIsWUFBSSxDQUFDLFNBQUwsRUFBZTtBQUNYLHdCQUFZLElBQUksUUFBSixFQUFaO0FBQ0g7QUFDRCxlQUFPLFNBQVA7QUFDSDtBQU5ZLENBQWpCOzs7QUN2RUE7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsRUFBVCxDQUFZLFFBQVosRUFBMEM7QUFBQSxRQUFwQixPQUFvQix5REFBVixRQUFVOztBQUN2RCxXQUFPLEdBQUcsS0FBSCxDQUFTLElBQVQsQ0FBYyxRQUFRLGdCQUFSLENBQXlCLFFBQXpCLENBQWQsQ0FBUDtBQUNILENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZXNsaW50IG1heC1sZW46IDAgKi9cbi8vIFRPRE86IGV2ZW50dWFsbHkgZGVwcmVjYXRlIHRoaXMgY29uc29sZS50cmFjZShcInVzZSB0aGUgYGJhYmVsLXJlZ2lzdGVyYCBwYWNrYWdlIGluc3RlYWQgb2YgYGJhYmVsLWNvcmUvcmVnaXN0ZXJgXCIpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtcmVnaXN0ZXJcIik7XG4iLCIvKmlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKCkge307XG5cbi8qaXN0YW5idWwgaWdub3JlIG5leHQqL21vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IC8vIHJlcXVpcmVkIHRvIHNhZmVseSB1c2UgYmFiZWwvcmVnaXN0ZXIgd2l0aGluIGEgYnJvd3NlcmlmeSBjb2RlYmFzZSIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lZGlhdG9yID0gcmVxdWlyZSgnLi4vdXRpbHMvTWVkaWF0b3InKSxcbiAgICBNYW5hZ2VyID0gcmVxdWlyZSgnLi9NYW5hZ2VyJyksXG4gICAgVG9nZ2xlID0gcmVxdWlyZSgnLi9Ub2dnbGUnKSxcbiAgICBUcmlnZ2VyID0gcmVxdWlyZSgnLi9UcmlnZ2VyJyksXG4gICAgVHJpZ2dlcklucHV0ID0gcmVxdWlyZSgnLi9UcmlnZ2VySW5wdXQnKSxcbiAgICBUcmlnZ2VyTGluayA9IHJlcXVpcmUoJy4vVHJpZ2dlckxpbmsnKSxcbiAgICBUcmlnZ2VySW5wdXRDaG9pY2UgPSByZXF1aXJlKCcuL1RyaWdnZXJJbnB1dENob2ljZScpLFxuICAgIFRyaWdnZXJJbnB1dFNlbGVjdCA9IHJlcXVpcmUoJy4vVHJpZ2dlcklucHV0U2VsZWN0Jyk7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmFjdG9yeSB7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKXtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuX21hbmFnZXIgPSBNYW5hZ2VyLmdldEluc3RhbmNlKCk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemUoKTtcblxuICAgIH1cblxuICAgIF9pbml0aWFsaXplKCl7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRvZ2dsZVxuICAgICAgICB0aGlzLl90b2dnbGUgPSB0aGlzLl9jcmVhdGUodGhpcy5fZWxlbWVudCwgdGhpcy5fb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gZmluZCB0cmlnZ2Vyc1xuICAgICAgICBpZih0aGlzLl90b2dnbGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVRyaWdnZXJzRm9yVG9nZ2xlKHRoaXMuX3RvZ2dsZSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGdldFRvZ2dsZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG9nZ2xlO1xuICAgIH1cblxuICAgIF9jcmVhdGUobm9kZSwgb3B0aW9ucyA9IHt9KXtcblxuICAgICAgICBsZXQgbmFtZSA9IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgIHRvZ2dsZTtcblxuICAgICAgICAvLyBjaGVjayBpZiB0aGlzIG5vZGUgaXMgYWxyZWFkeSBhIHRyaWdnZXJcbiAgICAgICAgaWYobm9kZS5pZCAmJiB0aGlzLl9tYW5hZ2VyLmdldFRvZ2dsZUJ5SWQobm9kZS5pZCkpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoKG5hbWUpe1xuICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICAgICAgICB0b2dnbGUgPSBuZXcgVHJpZ2dlcklucHV0U2VsZWN0KG5vZGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5wdXQnOlxuICAgICAgICAgICAgICAgIHN3aXRjaChub2RlLnR5cGUpe1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdyYWRpbyc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZSA9IG5ldyBUcmlnZ2VySW5wdXRDaG9pY2Uobm9kZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZSA9IG5ldyBUcmlnZ2VySW5wdXQobm9kZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICAgICAgICB0b2dnbGUgPSBuZXcgVHJpZ2dlckxpbmsobm9kZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmKG5vZGUuaGFzQXR0cmlidXRlKCdocmVmJykgfHwgbm9kZS5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKSkge1xuICAgICAgICAgICAgICAgICAgICB0b2dnbGUgPSBuZXcgVHJpZ2dlcihub2RlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRvZ2dsZSA9IG5ldyBUb2dnbGUobm9kZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG9nZ2xlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdHJpZ2dlcnMgZm9yIHRoZSBnaXZlbiBUb2dnbGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gVG9nZ2xlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9jcmVhdGVUcmlnZ2Vyc0ZvclRvZ2dsZShUb2dnbGUpe1xuXG4gICAgICAgIHZhciBpZCA9IFRvZ2dsZS5nZXRJZCgpLFxuICAgICAgICAgICAgdHJpZ2dlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbaHJlZj1cIiMnICsgaWQgKyAnXCJdLCBbYXJpYS1jb250cm9sc349XCInICsgaWQgKyAnXCJdOm5vdChvcHRpb24pJyk7XG5cbiAgICAgICAgLy8gY3JlYXRlIG5ldyB0b2dnbGVzXG4gICAgICAgIFtdLnNsaWNlLmFwcGx5KHRyaWdnZXJzKS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgICAgbmV3IEZhY3RvcnkodCk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lZGlhdG9yID0gcmVxdWlyZSgnLi4vdXRpbHMvTWVkaWF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBHcm91cCB7XG5cbiAgICBjb25zdHJ1Y3RvcihpZCl7XG5cbiAgICAgICAgLy8gU2V0IElEIG9mIGdyb3VwXG4gICAgICAgIHRoaXMuX2lkID0gaWQ7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHByb3BlcnR5IHRvIGtlZXAgdHJhY2sgb2YgYWxsIHRvZ2dsZXMgaW5zaWRlIHRoaXMgZ3JvdXBcbiAgICAgICAgdGhpcy5fdG9nZ2xlcyA9IFtdO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGdyb3VwXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemUoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhpcyBncm91cC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfaW5pdGlhbGl6ZSgpe1xuXG4gICAgICAgIHRoaXMuX21lZGlhdG9yID0gTWVkaWF0b3IuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgdGhpcy5fb25Ub2dnbGVCaW5kID0gdGhpcy5fb25Ub2dnbGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fbWVkaWF0b3Iuc3Vic2NyaWJlKCd0b2dnbGUnLCB0aGlzLl9vblRvZ2dsZUJpbmQpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzcG9uZCB0byB0aGUgdG9nZ2xlLWV2ZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX29uVG9nZ2xlKGUpe1xuXG4gICAgICAgIGxldCB0b2dnbGUgPSBlLnRvZ2dsZTtcblxuICAgICAgICBpZih0aGlzLmNvbnRhaW5zVG9nZ2xlKHRvZ2dsZSkpe1xuXG4gICAgICAgICAgICBpZihlLmFjdGl2ZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvc2VBbGxFeGNlcHQodG9nZ2xlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZighdGhpcy5nZXRBY3RpdmVUb2dnbGUoKSAmJiB0aGlzLl9kZWZhdWx0KXtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0LmFjdGl2YXRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSB0b2dnbGVcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBUb2dnbGVHcm91cFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBUb2dnbGVcbiAgICAgKiBAcHVibGljXG4gICAgICovXG5cbiAgICByZWdpc3RlcihUb2dnbGUpe1xuXG4gICAgICAgIC8vIGFkZFxuICAgICAgICB0aGlzLl90b2dnbGVzLnB1c2goVG9nZ2xlKTtcblxuICAgICAgICAvLyBjaGVjayBpZiBkZWZhdWx0XG4gICAgICAgIGlmKFRvZ2dsZS5nZXRFbGVtZW50KCkuZGF0YXNldC5ncm91cERlZmF1bHQpe1xuICAgICAgICAgICAgdGhpcy5fZGVmYXVsdCA9IFRvZ2dsZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBJRCBvZiB0aGlzIGdyb3VwLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cblxuICAgIGdldElkKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIFRvZ2dsZXMgaW4gdGhpcyBncm91cC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cblxuICAgIGdldFRvZ2dsZXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RvZ2dsZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgb25lIG9mIHRoZSBUb2dnbGVzIGluIHRoaXMgZ3JvdXAgaXMgYWN0aXZlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG5cbiAgICBoYXNBY3RpdmVUb2dnbGUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RvZ2dsZXMuZmlsdGVyKHQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHQuaXNBY3RpdmUoKTtcbiAgICAgICAgfSkubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnRseSBhY3RpdmUgVG9nZ2xlLlxuICAgICAqXG4gICAgICogQHJldHVybnMgeyp9IFRvZ2dsZSBvYmplY3Qgd2hlbiBhIHRvZ2dsZSBpcyBhY3RpdmUuIE90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cblxuICAgIGdldEFjdGl2ZVRvZ2dsZSgpe1xuICAgICAgICB2YXIgYWN0aXZlID0gdGhpcy5fdG9nZ2xlcy5maWx0ZXIoZnVuY3Rpb24odCl7XG4gICAgICAgICAgICByZXR1cm4gdC5pc0FjdGl2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZVswXSB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBLZWVwIHRyYWNrIG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIFRvZ2dsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBUb2dnbGVcbiAgICAgKi9cblxuICAgIHNldEFjdGl2ZVRvZ2dsZShUb2dnbGUpe1xuICAgICAgICB0aGlzLl9hY3RpdmVUb2dnbGUgPSBUb2dnbGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIHBhc3NlZCBpbiBUb2dnbGUgaXMgY29udGFpbmVkIGluIHRoaXMgZ3JvdXAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gVG9nZ2xlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG5cbiAgICBjb250YWluc1RvZ2dsZShUb2dnbGUpe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG9nZ2xlcy5pbmRleE9mKFRvZ2dsZSkgPiAtMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSB0b2dnbGVcbiAgICAgKlxuICAgICAqIEBtZW1iZXJvZiBUb2dnbGVHcm91cFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBUb2dnbGVcbiAgICAgKi9cblxuICAgIHJlbW92ZShUb2dnbGUpIHtcblxuICAgICAgICB0aGlzLl90b2dnbGVzLmZvckVhY2godCwgaSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0ID09IFRvZ2dsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RvZ2dsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlIGFsbCB0b2dnbGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFRvZ2dsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfY2xvc2VBbGwoKXtcblxuICAgICAgICB0aGlzLl90b2dnbGVzLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgICBpZih0LmlzQWN0aXZlKCkpe1xuICAgICAgICAgICAgICAgIHQuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlIGFsbCB0b2dnbGVzIGV4Y2VwdCB0aGUgZ2l2ZW4gVG9nZ2xlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBUb2dnbGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2Nsb3NlQWxsRXhjZXB0KFRvZ2dsZSl7XG5cbiAgICAgICAgdGhpcy5fdG9nZ2xlcy5mb3JFYWNoKHQgPT4ge1xuXG4gICAgICAgICAgICAvLyBkZWFjdGl2YXRlXG4gICAgICAgICAgICBpZiAodCAhPT0gVG9nZ2xlICYmIHQuaXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgICAgIHQuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0QWN0aXZlVG9nZ2xlKFRvZ2dsZSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHNpemUgb2YgdGhpcyBncm91cC5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBudW1iZXIgb2YgaXRlbXMuXG4gICAgICovXG5cbiAgICBnZXRTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdG9nZ2xlcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5sb2FkLlxuICAgICAqXG4gICAgICogQG1ldGhvZCB1bmxvYWRcbiAgICAgKi9cblxuICAgIHVubG9hZCgpIHtcblxuICAgICAgICAvLyBFbXB0eSBhcnJheVxuICAgICAgICB0aGlzLl90b2dnbGVzID0gW107XG5cbiAgICB9XG4gICAgXG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQgX2luc3RhbmNlO1xuXG5sZXQgR3JvdXAgPSByZXF1aXJlKCcuL0dyb3VwJyk7XG5cbmNsYXNzIE1hbmFnZXIge1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5fdG9nZ2xlcyA9IFtdO1xuICAgICAgICB0aGlzLl9ncm91cHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciB0b2dnbGVcbiAgICAgKlxuICAgICAqIEBtZXRob2QgcmVnaXN0ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gVG9nZ2xlIC0gSW5zdGFuY2Ugb2YgVG9nZ2xlLlxuICAgICAqL1xuXG4gICAgYWRkKFRvZ2dsZSkge1xuXG4gICAgICAgIC8vIGFkZCB0byB0b2dnbGVyc1xuICAgICAgICB0aGlzLl90b2dnbGVzLnB1c2goVG9nZ2xlKTtcblxuICAgICAgICAvLyBsb29rIGZvciBncm91cHNcbiAgICAgICAgdGhpcy5fbWFuYWdlR3JvdXAoVG9nZ2xlKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVucmVnaXN0ZXIgdG9nZ2xlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gVG9nZ2xlIC0gSW5zdGFuY2Ugb2YgVG9nZ2xlLlxuICAgICAqL1xuXG4gICAgcmVtb3ZlKFRvZ2dsZSkge1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHBhcnQgb2YgZ3JvdXBcbiAgICAgICAgbGV0IGdyb3VwTWVtYmVyID0gVG9nZ2xlLmdldEdyb3VwKCk7XG4gICAgICAgIGlmIChncm91cE1lbWJlcikge1xuXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBncm91cCBleGlzdHNcbiAgICAgICAgICAgIGlmICh0aGlzLl9ncm91cHNbZ3JvdXBNZW1iZXJdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ3JvdXBzW2dyb3VwTWVtYmVyXS5yZW1vdmUoVG9nZ2xlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gdGhpcy5fdG9nZ2xlc1xuICAgICAgICB0aGlzLl90b2dnbGVzLmZvckVhY2godCwgaSA9PiB7XG4gICAgICAgICAgICBpZiAodCA9PT0gVG9nZ2xlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdG9nZ2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRyaWdnZXJzIGZvciB0aGUgZ2l2ZW4gVG9nZ2xlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBUb2dnbGUgLSBJbnN0YW5jZSBvZiBUb2dnbGUuXG4gICAgICovXG5cbiAgICBnZXRUcmlnZ2Vyc0ZvclRvZ2dsZShUb2dnbGUpe1xuXG4gICAgICAgIHJldHVybiB0aGlzLl90b2dnbGVzLmZpbHRlcih0ID0+IHtcbiAgICAgICAgICAgIGlmKHQuaXNUcmlnZ2VyKCkgJiYgdC5fdGFyZ2V0cyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHQuX3RhcmdldHMuaW5kZXhPZihUb2dnbGUuZ2V0SWQoKSkgPiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYW5hZ2UgZ3JvdXBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBUb2dnbGUgb2JqZWN0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfbWFuYWdlR3JvdXAoVG9nZ2xlKXtcblxuICAgICAgICAvLyBjaGVjayBpZiBwYXJ0IG9mIGdyb3VwXG4gICAgICAgIGxldCBncm91cCA9IFRvZ2dsZS5nZXRHcm91cCgpO1xuICAgICAgICBpZiAoZ3JvdXApIHtcblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZ3JvdXAgZXhpc3RzLCBpZiBub3QgY3JlYXRlXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2dyb3Vwc1tncm91cF0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm91cHNbZ3JvdXBdID0gbmV3IEdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcmVnaXN0ZXIgaW4gZ3JvdXBcbiAgICAgICAgICAgIHRoaXMuX2dyb3Vwc1tncm91cF0ucmVnaXN0ZXIoVG9nZ2xlKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9nZ2xlIGJ5IElkXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gSWQgb2YgdG9nZ2xlIHRvIGdldFxuICAgICAqIEByZXR1cm4geyp9IFRvZ2dsZSB3aGVuIGZvdW5kLCBvdGhlcndpc2UgZmFsc2UuXG4gICAgICovXG5cbiAgICBnZXRUb2dnbGVCeUlkKGlkKXtcblxuICAgICAgICAvLyBsb29wIHRocm91Z2ggYWxsIHRvZ2dsZXMgdG8gZmluZCB0aGUgb25lIHdpdGggdGhlIGdpdmVuIElEXG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLl90b2dnbGVzLmZpbHRlcih0ID0+IHsgcmV0dXJuIHQuZ2V0SWQoKSA9PT0gaWQgfSk7XG5cbiAgICAgICAgaWYocmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gaW5zdGFuY2Ugb2YgdGhlIFRvZ2dsZSBncm91cCB3aXRoIHRoZSBwYXJzZWQgaW4gaWQuXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnMgeyp9IElmIGZvdW5kLCB0aGUgZ3JvdXAgLSBvdGhlcndpc2UgZmFsc2UuXG4gICAgICovXG5cbiAgICBnZXRUb2dnbGVHcm91cEJ5SWQoaWQpe1xuXG4gICAgICAgIGZvciAobGV0IGdyb3VwIGluIHRoaXMuX2dyb3Vwcykge1xuICAgICAgICAgICAgaWYgKGdyb3VwID09PSBpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9ncm91cHNbZ3JvdXBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRJbnN0YW5jZTpmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIV9pbnN0YW5jZSl7XG4gICAgICAgICAgICBfaW5zdGFuY2UgPSBuZXcgTWFuYWdlcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfaW5zdGFuY2U7XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lZGlhdG9yID0gcmVxdWlyZSgnLi4vdXRpbHMvTWVkaWF0b3InKSxcbiAgICBGb2N1cyA9IHJlcXVpcmUoJy4uL3V0aWxzL0ZvY3VzJyksXG4gICAgTWFuYWdlciA9IHJlcXVpcmUoJy4vTWFuYWdlcicpLFxuICAgICQkID0gcmVxdWlyZSgnLi4vdXRpbHMvUXVlcnlTZWxlY3RvcicpO1xuXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBvdXRzaWRlOiBmYWxzZSxcbiAgICBmb2N1czogZmFsc2UsXG4gICAgZm9jdXNDb250YWluOiBmYWxzZSxcbiAgICBmb2N1c0V4Y2x1ZGU6IGZhbHNlLFxuICAgIGdyb3VwOiBmYWxzZSxcbiAgICBhY3RpdmF0ZU9ubHk6IGZhbHNlLFxuICAgIGFyaWFIaWRkZW46IGZhbHNlLFxuICAgIGFyaWFEaXNhYmxlZDogZmFsc2UsXG4gICAgYXJpYUV4cGFuZGVkOiBmYWxzZSxcbiAgICBhcmlhUHJlc3NlZDogZmFsc2UsXG4gICAgYXJpYUNoZWNrZWQ6IGZhbHNlXG59O1xuXG5jb25zdCBmb2N1c2FibGVFbGVtZW50cyA9IFsnYVtocmVmXScsICdhcmVhW2hyZWZdJywgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYScsICdidXR0b24nLCAnaWZyYW1lJywgJ29iamVjdCcsICdlbWJlZCcsICdbY29udGVudGVkaXRhYmxlXScsICdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXhePVwiLVwiXSknXTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUb2dnbGUge1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gdGhpcy5fbWVyZ2VPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIFNldCBJRCBvZiBUb2dnbGVcbiAgICAgICAgdGhpcy5fc2V0SWQoKTtcblxuICAgICAgICAvLyBTZXQgbG9jYWwgcHJpdmF0ZSBwcm9wZXJ0eVxuICAgICAgICB0aGlzLl9pZCA9IHRoaXMuZ2V0SWQoKTtcblxuICAgICAgICAvLyBHZXQgaW5zdGFuY2Ugb2YgdGhlIE1lZGlhdG9yXG4gICAgICAgIHRoaXMuX21lZGlhdG9yID0gTWVkaWF0b3IuZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAvLyBHZXQgaW5zdGFuY2Ugb2YgdGhlIE1hbmFnZXJcbiAgICAgICAgdGhpcy5fbWFuYWdlciA9IE1hbmFnZXIuZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAvLyBTaG9ydGN1dHMgZm9yIGV2ZW50c1xuICAgICAgICB0aGlzLl9zaG9ydGN1dHMgPSB0aGlzLl9nZXRTaG9ydGN1dHMoKTtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRvZ2dsZVxuICAgICAgICB0aGlzLl9pbml0aWFsaXplKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZhbHVlIG9mIGFuIG9wdGlvbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IC0gVGhlIGtleSB0byBjaGVjayBmb3IgaW4gdGhlIG9wdGlvbnMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBUaGUgb3B0aW9ucyBwYXNzZWQgaW4gZnJvbSB0aGUgY29uc3RydWN0b3JcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfZ2V0T3B0aW9uKGtleSwgb3B0aW9ucyl7XG5cbiAgICAgICAgLy8gMXN0OiBJZiBwYXNzZWQgaW4gdG8gY29uc3RydWN0b3IsIGl0IGhhcyBwcmVjZWRlbmNlXG5cbiAgICAgICAgaWYob3B0aW9ucyAmJiBvcHRpb25zW2tleV0pe1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnNba2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDJuZDogRE9NIEFQSVxuXG4gICAgICAgIGlmKHRoaXMuX2VsZW1lbnQuZGF0YXNldFtrZXldKXtcbiAgICAgICAgICAgIGxldCBhdHRyID0gdGhpcy5fZWxlbWVudC5kYXRhc2V0W2tleV07XG4gICAgICAgICAgICBzd2l0Y2goYXR0cikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RydWUnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZmFsc2UnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhdHRyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gM3JkOiBEZWZhdWx0c1xuXG4gICAgICAgIGlmKGRlZmF1bHRPcHRpb25zICYmIGRlZmF1bHRPcHRpb25zW2tleV0pe1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRPcHRpb25zW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICAvLyA0dGg6IEZhbHNlXG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWVyZ2Ugb3B0aW9ucy4gRmlyc3QgdXNlIG9wdGlvbnMtb2JqZWN0IHBhc3NlZCBpbiB0byBjb25zdHJ1Y3RvciwgdGhlbiBET00gQVBJLCB0aGVuIGRlZmF1bHRzLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGZpbmFsIG9wdGlvbnMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9tZXJnZU9wdGlvbnMob3B0aW9ucyl7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG91dHNpZGU6IHRoaXMuX2dldE9wdGlvbignb3V0c2lkZScsIG9wdGlvbnMpLFxuICAgICAgICAgICAgZm9jdXM6IHRoaXMuX2dldE9wdGlvbignZm9jdXMnLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGZvY3VzQ29udGFpbjogdGhpcy5fZ2V0T3B0aW9uKCdmb2N1c0NvbnRhaW4nLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGZvY3VzRXhjbHVkZTogdGhpcy5fZ2V0T3B0aW9uKCdmb2N1c0V4Y2x1ZGUnLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGdyb3VwOiB0aGlzLl9nZXRPcHRpb24oJ2dyb3VwJywgb3B0aW9ucyksXG4gICAgICAgICAgICBhY3RpdmF0ZU9ubHk6IHRoaXMuX2dldE9wdGlvbignYWN0aXZhdGVPbmx5Jywgb3B0aW9ucyksXG4gICAgICAgICAgICBhcmlhSGlkZGVuOiB0aGlzLl9nZXRPcHRpb24oJ2FyaWFIaWRkZW4nLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGFyaWFEaXNhYmxlZDogdGhpcy5fZ2V0T3B0aW9uKCdhcmlhRGlzYWJsZWQnLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGFyaWFFeHBhbmRlZDogdGhpcy5fZ2V0T3B0aW9uKCdhcmlhRXhwYW5kZWQnLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGFyaWFQcmVzc2VkOiB0aGlzLl9nZXRPcHRpb24oJ2FyaWFQcmVzc2VkJywgb3B0aW9ucyksXG4gICAgICAgICAgICBhcmlhQ2hlY2tlZDogdGhpcy5fZ2V0T3B0aW9uKCdhcmlhQ2hlY2tlZCcsIG9wdGlvbnMpXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIFRvZ2dsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfaW5pdGlhbGl6ZSgpIHtcblxuICAgICAgICAvLyBCaW5kIGV2ZW50c1xuICAgICAgICB0aGlzLl9iaW5kKHRydWUpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBpbnN0YW5jZSBvZiBGb2N1cyBjb250YWlubWVudHNcbiAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5mb2N1c0NvbnRhaW4gfHwgdGhpcy5fb3B0aW9ucy5mb2N1c0V4Y2x1ZGUpe1xuICAgICAgICAgICAgdGhpcy5fZm9jdXMgPSBuZXcgRm9jdXModGhpcy5fZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWdpc3RlciB0b2dnbGVcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgSUQgb2YgdGhpcyBUb2dnbGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIFRoZSBJRCBvZiB0aGUgVG9nZ2xlLlxuICAgICAqL1xuXG4gICAgZ2V0SWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIElEIG9mIHRoaXMgVG9nZ2xlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfc2V0SWQoKSB7XG4gICAgICAgIGxldCBpZCA9IHRoaXMuX2VsZW1lbnQuaWQ7XG4gICAgICAgIGlmICghaWQpIHtcbiAgICAgICAgICAgIGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lkID0gaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9iamVjdCBvZiBtZXRob2RzLCBmb3IgZWFzeSBiaW5kaW5nIGFuZCB1bmJpbmRpbmcuXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfZ2V0U2hvcnRjdXRzKCl7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0cmlnZ2VyJzogdGhpcy5fb25UcmlnZ2VyLmJpbmQodGhpcyksXG4gICAgICAgICAgICAnaGFzaGNoYW5nZSc6IHRoaXMuX29uSGFzaENoYW5nZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJ2JvZHljbGljayc6IHRoaXMuX29uQm9keUNsaWNrLmJpbmQodGhpcyksXG4gICAgICAgICAgICAnbW91c2VlbnRlcic6IHRoaXMuX29uTW91c2VFbnRlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJ21vdXNlbGVhdmUnOiB0aGlzLl9vbk1vdXNlTGVhdmUuYmluZCh0aGlzKVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYmluZCAtIEJpbmQgb3IgdW5iaW5kLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfYmluZChiaW5kID0gdHJ1ZSl7XG5cbiAgICAgICAgbGV0IG1ldGhvZCA9IGJpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG5cbiAgICAgICAgLy8gTGlzdGVuIHRvIHRvZ2dsZS1ldmVudFxuICAgICAgICBpZihtZXRob2Qpe1xuICAgICAgICAgICAgdGhpcy5fbWVkaWF0b3Iuc3Vic2NyaWJlKCd0cmlnZ2VyJywgdGhpcy5fc2hvcnRjdXRzLnRyaWdnZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbWVkaWF0b3IudW5zdWJzY3JpYmUoJ3RyaWdnZXInLCB0aGlzLl9zaG9ydGN1dHMudHJpZ2dlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMaXN0ZW4gdG8gaGFzaGNoYW5nZVxuICAgICAgICB3aW5kb3dbbWV0aG9kXSgnaGFzaGNoYW5nZScsIHRoaXMuX3Nob3J0Y3V0cy5oYXNoY2hhbmdlLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gTGlzdGVuIHRvIGNsaWNrIGV2ZW50IG9uIGJvZHlcbiAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5vdXRzaWRlKXtcblxuICAgICAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5vdXRzaWRlIHx8IHRoaXMuX29wdGlvbnMub3V0c2lkZSA9PT0gJ2JvdGgnIHx8IHRoaXMuX29wdGlvbnMub3V0c2lkZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHlbbWV0aG9kXSgnY2xpY2snLCB0aGlzLl9zaG9ydGN1dHMuYm9keWNsaWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5vdXRzaWRlID09PSAnYm90aCcgfHwgdGhpcy5fb3B0aW9ucy5vdXRzaWRlID09PSAnbW91c2UnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudFttZXRob2RdKCdtb3VzZWVudGVyJywgdGhpcy5fc2hvcnRjdXRzLm1vdXNlZW50ZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRbbWV0aG9kXSgnbW91c2VsZWF2ZScsIHRoaXMuX3Nob3J0Y3V0cy5tb3VzZWxlYXZlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciB0aGUgdG9nZ2xlXG4gICAgICovXG5cbiAgICByZWdpc3Rlcigpe1xuXG4gICAgICAgIC8vIHJlZ2lzdGVyXG4gICAgICAgIHRoaXMuX21hbmFnZXIuYWRkKHRoaXMpO1xuXG4gICAgICAgIC8vIGdldCBpbml0aWFsIHN0YXRlXG4gICAgICAgIHRoaXMuX2lzQWN0aXZlID0gdGhpcy5fZ2V0U3RhdGUoKTtcblxuICAgICAgICAvLyBzZXQgaW5pdGlhbCBzdGF0ZVxuICAgICAgICB0aGlzLmlzQWN0aXZlKCkgPyB0aGlzLmFjdGl2YXRlKCkgOiB0aGlzLmRlYWN0aXZhdGUoKTtcblxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBlbGVtZW50IG9mIHRoaXMgVG9nZ2xlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG5cbiAgICBnZXRFbGVtZW50KCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZ3JvdXAgb2YgdGhpcyBUb2dnbGUsIGlmIGF2YWlsYWJsZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBncm91cCB0aGlzIFRvZ2dsZSBiZWxvbmdzIHRvLlxuICAgICAqL1xuXG4gICAgZ2V0R3JvdXAoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQuZGF0YXNldC5ncm91cDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBsaXN0IG9mIGZvY3VzYWJsZSBlbGVtZW50IGluIHRoZSBjdXJyZW50IG5vZGUuXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9nZXRGb2N1c2FibGVFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuICQkKGZvY3VzYWJsZUVsZW1lbnRzLmpvaW4oJywnKSwgdGhpcy5fZWxlbWVudCkuZmlsdGVyKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuICEhKGNoaWxkLm9mZnNldFdpZHRoIHx8IGNoaWxkLm9mZnNldEhlaWdodCB8fCBjaGlsZC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlIHRoaXMgVG9nZ2xlLlxuICAgICAqL1xuXG4gICAgYWN0aXZhdGUoKXtcblxuICAgICAgICBpZighdGhpcy5pc0FjdGl2ZSgpKXtcblxuICAgICAgICAgICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5vdXRzaWRlID09PSAnbW91c2UnIHx8IHRoaXMuX29wdGlvbnMgPT09ICdib3RoJyl7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhcnRNb3VzZVRpbWVyKDEwMDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLl9vcHRpb25zLmZvY3VzKXtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLl9nZXRGb2N1c2FibGVFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIGlmKGNoaWxkcmVuWzBdKXtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5bMF0uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5mb2N1cygpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIERlYWN0aXZhdGUgdGhpcyBUb2dnbGUuXG4gICAgICovXG5cbiAgICBkZWFjdGl2YXRlKCl7XG5cbiAgICAgICAgaWYodGhpcy5pc0FjdGl2ZSgpKXtcblxuICAgICAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBzdGF0ZSBvZiB0aGlzIHRvZ2dsZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgdXBkYXRlKCl7XG5cbiAgICAgICAgLy8gUHVibGlzaCBldmVudFxuICAgICAgICB0aGlzLl9tZWRpYXRvci5wdWJsaXNoKCd0b2dnbGUnLCB7XG4gICAgICAgICAgICB0b2dnbGU6IHRoaXMsXG4gICAgICAgICAgICBpZDogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmlzQWN0aXZlKClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2V0IGFyaWEtaGlkZGVuIHN0YXRlXG4gICAgICAgIGlmKHRoaXMuX29wdGlvbnMuYXJpYUhpZGRlbil7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAhdGhpcy5pc0FjdGl2ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBhcmlhLWRpc2FibGVkIHN0YXRlXG4gICAgICAgIGlmKHRoaXMuX29wdGlvbnMuYXJpYURpc2FibGVkKXtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJywgIXRoaXMuaXNBY3RpdmUoKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgYXJpYS1jb2xsYXBzZWQgc3RhdGVcbiAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5hcmlhRXhwYW5kZWQpe1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLmlzQWN0aXZlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IGFyaWEtcHJlc3NlZCBzdGF0ZVxuICAgICAgICBpZih0aGlzLl9vcHRpb25zLmFyaWFQcmVzc2VkKXtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLmlzQWN0aXZlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IGFyaWEtY2hlY2tlZCBzdGF0ZVxuICAgICAgICBpZih0aGlzLl9vcHRpb25zLmFyaWFDaGVja2VkKXtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWNoZWNrZWQnLCB0aGlzLmlzQWN0aXZlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0aXZlJywgdGhpcy5pc0FjdGl2ZSgpKTtcblxuICAgICAgICAvLyBDb250YWluIGZvY3VzXG4gICAgICAgIGlmKHRoaXMuX29wdGlvbnMuZm9jdXNDb250YWluKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNBY3RpdmUoKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZm9jdXMuY29udGFpbigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9mb2N1cy5kaXNhYmxlQ29udGFpbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXhjbHVkZSBmb2N1c1xuICAgICAgICBpZih0aGlzLl9vcHRpb25zLmZvY3VzRXhjbHVkZSl7XG4gICAgICAgICAgICBpZih0aGlzLmlzQWN0aXZlKCkpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZvY3VzLmRpc2FibGVFeGNsdWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZvY3VzLmV4Y2x1ZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoaXMgVG9nZ2xlLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IEFjdGl2ZSBvciBub3QgYWN0aXZlLlxuICAgICAqL1xuXG4gICAgX2dldFN0YXRlKCl7XG5cbiAgICAgICAgLy8gZmlyc3QgY2hlY2sgaWYgb25lIG9mIHRoZSB0cmlnZ2VycyBpcyBhY3RpdmVcbiAgICAgICAgaWYodGhpcy5oYXNBY3RpdmVUcmlnZ2VyKCkgfHwgdGhpcy5oYXNBY3RpdmVIYXNoKCkpe1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiBhcmlhLWhpZGRlbiBpcyBhdmFpbGFibGVcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMuX2VsZW1lbnQuaGFzQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSA9PT0gXCJmYWxzZVwiO1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgYXJpYS1kaXNhYmxlZCBpcyBhdmFpbGFibGVcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMuX2VsZW1lbnQuaGFzQXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJykpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJykgPT09IFwiZmFsc2VcIjtcbiAgICAgICAgICAgIC8vIGRlZmF1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1hY3RpdmUnKSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkZWZhdWx0XG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoaXMgVG9nZ2xlIGlzIGFjdGl2ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuXG4gICAgaXNBY3RpdmUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldmVyc2UgdGhlIHN0YXRlIG9mIHRoaXMgVG9nZ2xlLlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgLSBFdmVudC5cbiAgICAgKi9cblxuICAgIHRvZ2dsZShlKXtcblxuICAgICAgICBsZXQgYWN0aXZhdGUgPSB0aGlzLmlzQWN0aXZlKCk7XG5cbiAgICAgICAgaWYoZSAmJiBlLmZvcmNlKXtcbiAgICAgICAgICAgIGFjdGl2YXRlID0gZS5hY3RpdmU7XG4gICAgICAgIH1cblxuICAgICAgICBhY3RpdmF0ZSA/IHRoaXMuZGVhY3RpdmF0ZSgpIDogdGhpcy5hY3RpdmF0ZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhpcyBUb2dnbGUgc2hvdWxkIHJlc3BvbmQgdG8gYSB0b2dnbGUtZXZlbnQgdGhyb3duLlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgLSBUb2dnbGUgZXZlbnQuXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IC0gTWF0Y2hlcyB3aXRoIHRocm93biBldmVudC5cbiAgICAgKi9cblxuICAgIGV2ZW50TWF0Y2goZSl7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZXZlbnQgbWF0Y2hlZCB3aXRoIHRoaXMgSURcbiAgICAgICAgaWYoZS5pZCA9PT0gdGhpcy5nZXRJZCgpKXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIGV2ZW50IGhhcyB0YXJnZXRzLiBSZXR1cm4gaWYgYSBtYXRjaCBoYXMgYmVlbiBmb3VuZC5cbiAgICAgICAgaWYoZS50YXJnZXRzKXtcbiAgICAgICAgICAgIHJldHVybiBlLnRhcmdldHMuaW5kZXhPZih0aGlzLmdldElkKCkpID4gLTE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTeW5jIHRoZSBzdGF0ZSBvZiB0aGlzIFRvZ2dsZSB3aXRoIHRoZSBnaXZlbiBwYXJhbWV0ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGFjdGl2ZSAtIEFjdGl2YXRlIG9yIGRlYWN0aXZhdGUgdG9nZ2xlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBzeW5jKGFjdGl2ZSl7XG5cbiAgICAgICAgaWYoYWN0aXZlICE9PSB0aGlzLmlzQWN0aXZlKCkpe1xuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhpcyBUb2dnbGUgaXMgYSB0cmlnZ2VyIGFzIHdlbGwuIFdpbGwgYmUgb3ZlcndyaXR0ZW4gaW4gc3ViY2xhc3Nlcy5cbiAgICAgKiBAcmV0dXJuIGZhbHNlIC0gYnkgZGVmYXVsdCBhIFRvZ2dsZSBjYW5ub3QgYmUgYSB0cmlnZ2VyLlxuICAgICAqL1xuXG4gICAgaXNUcmlnZ2VyKCl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgaGFzaCBpbiB0aGUgVVJMIGlzIHRoZSBJRCBvZiB0aGlzIFRvZ2dsZS5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuXG4gICAgaGFzQWN0aXZlSGFzaCgpe1xuICAgICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCcnKTtcbiAgICAgICAgcmV0dXJuIGhhc2ggPT09IHRoaXMuZ2V0SWQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBvbmUgb2YgdGhlIHRyaWdnZXJzIGZvciB0aGlzIFRvZ2dsZSBpcyBhY3RpdmUuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cblxuICAgIGhhc0FjdGl2ZVRyaWdnZXIoKXtcblxuICAgICAgICAvLyBjaGVjayBpZiBvbmUgb2YgdGhlIHRyaWdnZXJzIGZvciB0aGlzIHRvZ2dsZSBpcyBhY3RpdmVcbiAgICAgICAgdmFyIHRyaWdnZXJzID0gdGhpcy5fbWFuYWdlci5nZXRUcmlnZ2Vyc0ZvclRvZ2dsZSh0aGlzKSxcbiAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGxvb3AgdGhyb3VnaCBhbGwgdHJpZ2dlcnNcbiAgICAgICAgdHJpZ2dlcnMuZm9yRWFjaChmdW5jdGlvbih0KXtcbiAgICAgICAgICAgIGlmKCFhY3RpdmUpe1xuICAgICAgICAgICAgICAgIGFjdGl2ZSA9IHQuaXNBY3RpdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGFjdGl2ZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc3BvbmQgdG8gYSB0b2dnbGUtZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIC0gVGhlIFRyaWdnZXIgZXZlbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9vblRyaWdnZXIoZSl7XG5cbiAgICAgICAgaWYodGhpcy5ldmVudE1hdGNoKGUpKXtcblxuICAgICAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5hY3RpdmF0ZU9ubHkgJiYgdGhpcy5nZXRHcm91cCgpICYmIHRoaXMuaXNBY3RpdmUoKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZShlKTtcblxuICAgICAgICAgICAgaWYoZS50eXBlID09PSAnbGluaycpe1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IGhhc2hcbiAgICAgICAgICAgICAgICBsZXQgaHJlZiA9ICF0aGlzLmlzQWN0aXZlKCkgPyAnIycgOiB0aGlzLmdldElkKCk7XG5cbiAgICAgICAgICAgICAgICBpZihoaXN0b3J5LnB1c2hTdGF0ZSAmJiBocmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsICcjJyArIGhyZWYpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhhc2ggPSBocmVmO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHRoZSB0aW1lciB3aGVuIHRoZSBtb3VzZSBsZWF2ZXMgdGhlIGVsZW1lbnRcbiAgICAgKi9cblxuICAgIF9vbk1vdXNlTGVhdmUoKXtcbiAgICAgICAgdGhpcy5fc3RhcnRNb3VzZVRpbWVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hlbiB0aGUgbW91c2UgbGVhdmVzIHRoZSBUb2dnbGUsIHN0YXJ0IGEgdGltZXIgdG8gY2xvc2UgdGhlIFRvZ2dsZSBhZnRlciAkZGVsYXkuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGhlIHRpbWUgdG8gd2FpdCB0byBjbG9zZSB0aGUgVG9nZ2xlLlxuICAgICAqL1xuXG4gICAgX3N0YXJ0TW91c2VUaW1lcihkZWxheSl7XG5cbiAgICAgICAgaWYoIWRlbGF5KXtcbiAgICAgICAgICAgIGRlbGF5ID0gNTAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RhcnQgdGltZXJcbiAgICAgICAgdGhpcy5fbW91c2VUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgICAgIH0sIGRlbGF5KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZW4gYW4gZWxlbWVudCBpcyBlbnRlcmVkIGJ5IGEgbW91c2UsIGNsZWFyIHRoZSB0aW1lciB0byBjbG9zZSB0aGUgVG9nZ2xlLlxuICAgICAqL1xuXG4gICAgX29uTW91c2VFbnRlcigpe1xuICAgICAgICBpZih0aGlzLl9tb3VzZVRpbWVyKXtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9tb3VzZVRpbWVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlIHRoZSBUb2dnbGUgd2hlbiBjbGlja2VkIG91dHNpZGUuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZSAtIFRoZSBjbGljayBldmVudCBvbiB0aGUgYm9keS5cbiAgICAgKi9cblxuICAgIF9vbkJvZHlDbGljayhlKXtcblxuICAgICAgICAvLyB0YXJnZXQgY2xpY2tcbiAgICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuXG4gICAgICAgIC8vIGdldCB0cmlnZ2VycyByZWxhdGVkIHRvIHRoaXMgdG9nZ2xlXG4gICAgICAgIHZhciB0cmlnZ2VycyA9IHRoaXMuX21hbmFnZXIuZ2V0VHJpZ2dlcnNGb3JUb2dnbGUodGhpcyksXG4gICAgICAgICAgICBlbGVtZW50cyA9IFt0aGlzLl9lbGVtZW50XSxcbiAgICAgICAgICAgIGluc2lkZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGFkZCBlbGVtZW50cyBvZiB0cmlnZ2VycyB0byAnZWxlbWVudHMnIGFycmF5XG4gICAgICAgIHRyaWdnZXJzLmZvckVhY2goZnVuY3Rpb24odCl7XG4gICAgICAgICAgICBlbGVtZW50cy5wdXNoKHQuZ2V0RWxlbWVudCgpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGlzQ2hpbGRPZiA9IGZ1bmN0aW9uIChlbGVtZW50LCBwYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gZWxlbWVudDtcbiAgICAgICAgICAgIGRvIHtcblxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ID09PSBwYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGpzaGludCAtVzA4NFxuICAgICAgICAgICAgfSB3aGlsZSAocGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIGNsaWNrIGlzIG9uIHRvZ2dsZSBvciBvbiB0cmlnZ2Vyc1xuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcblxuICAgICAgICAgICAgaWYoaXNDaGlsZE9mKHRhcmdldCwgZWwpICYmICFpbnNpZGUpe1xuICAgICAgICAgICAgICAgIGluc2lkZSA9IHRydWU7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmKCFpbnNpZGUgJiYgdGhpcy5pc0FjdGl2ZSgpKXtcbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaXN0ZW4gdG8gaGFzaC1jaGFuZ2UgZXZlbnRzLlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgLSBUaGUgSGFzaENoYW5nZS1ldmVudCB0aHJvd24gYnkgdGhlIGJyb3dzZXIuXG4gICAgICovXG5cbiAgICBfb25IYXNoQ2hhbmdlKGUpe1xuXG4gICAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKSxcbiAgICAgICAgICAgIG9sZEhhc2ggPSBlLm9sZFVSTC5zdWJzdHIoZS5vbGRVUkwuaW5kZXhPZignIycpKS5yZXBsYWNlKCcjJywgJycpO1xuXG4gICAgICAgIGlmKGhhc2ggPT09IHRoaXMuZ2V0SWQoKSl7XG4gICAgICAgICAgICB0aGlzLmlzQWN0aXZlKCkgPyBudWxsIDogdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYob2xkSGFzaCA9PT0gdGhpcy5nZXRJZCgpKXtcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUoKSA/IHRoaXMuZGVhY3RpdmF0ZSgpIDogbnVsbDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVG9nZ2xlID0gcmVxdWlyZSgnLi9Ub2dnbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUcmlnZ2VyIGV4dGVuZHMgVG9nZ2xlIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgICAvLyBtYWtlIGNhbGwgdG8gc3VwZXJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgb3B0aW9ucyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoaXMgdHJpZ2dlci5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2luaXRpYWxpemUoKXtcblxuICAgICAgICAvLyBHZXQgdGFyZ2V0c1xuICAgICAgICB0aGlzLl90YXJnZXRzID0gdGhpcy5fZ2V0VGFyZ2V0SURzKCk7XG5cbiAgICAgICAgLy8gQmluZCBldmVudHNcbiAgICAgICAgdGhpcy5fYmluZCh0cnVlKTtcblxuICAgICAgICAvLyByZWdpc3RlciB3aXRob3V0IGRlbGF5XG4gICAgICAgIHRoaXMucmVnaXN0ZXIoKTtcblxuICAgICAgICAvLyBzZXQgaW5pdGlhbCBzdGF0ZVxuICAgICAgICB0aGlzLmdldFRhcmdldFN0YXRlKCkgPyB0aGlzLmFjdGl2YXRlKCkgOiB0aGlzLmRlYWN0aXZhdGUoKTtcblxuICAgICAgICAvLyB1cGRhdGVcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvYmplY3Qgb2YgbWV0aG9kcywgZm9yIGVhc3kgYmluZGluZyBhbmQgdW5iaW5kaW5nLlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2dldFNob3J0Y3V0cygpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ2NsaWNrJzogdGhpcy5fb25DbGljay5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJ3RvZ2dsZSc6IHRoaXMuX29uVG9nZ2xlLmJpbmQodGhpcylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnRzL2hhbmRsZXJzLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYmluZCAtIFRvIGJpbmQgb3IgdG8gdW5iaW5kLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfYmluZChiaW5kID0gdHJ1ZSl7XG5cbiAgICAgICAgbGV0IG1ldGhvZCA9IGJpbmQgPyAnc3Vic2NyaWJlJyA6ICd1bnN1YnNjcmliZSc7XG4gICAgICAgIHRoaXMuX21lZGlhdG9yW21ldGhvZF0oJ3RvZ2dsZScsIHRoaXMuX3Nob3J0Y3V0cy50b2dnbGUpO1xuXG4gICAgICAgIG1ldGhvZCA9IGJpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRbbWV0aG9kXSgnY2xpY2snLCB0aGlzLl9zaG9ydGN1dHMuY2xpY2spO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgd2hhdCB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZmlyc3QgVG9nZ2xlIHRhcmdldGVkIGlzLlxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuXG4gICAgZ2V0VGFyZ2V0U3RhdGUoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX3RhcmdldHMgJiYgdGhpcy5fdGFyZ2V0c1swXSkge1xuICAgICAgICAgICAgbGV0IGlkID0gdGhpcy5fdGFyZ2V0c1swXSxcbiAgICAgICAgICAgICAgICB0b2dnbGUgPSB0aGlzLl9tYW5hZ2VyLmdldFRvZ2dsZUJ5SWQoaWQpO1xuICAgICAgICAgICAgaWYodG9nZ2xlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvZ2dsZS5pc0FjdGl2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhpcyBUb2dnbGUgaXMgYSBUcmlnZ2VyLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuXG4gICAgaXNUcmlnZ2VyKCl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhcnJheSBvZiBJRCdzIG9mIGVsZW1lbnRzL1RvZ2dsZXMgdG8gdGFyZ2V0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2dldFRhcmdldElEcygpe1xuXG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcblxuICAgICAgICAvLyBHZXQgSUQgZnJvbSBocmVmIGluIGNhc2UgdGhlIHRyaWdnZXIgaXMgYW5jaG9yXG4gICAgICAgIGlmKHRoaXMuX2VsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2EnKXtcbiAgICAgICAgICAgIGxldCBocmVmID0gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgIGhyZWYgPyByZXN1bHQucHVzaChocmVmLnJlcGxhY2UoJyMnLCcnKSkgOiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRhcmdldHMgZnJvbSBhcmlhLWNvbnRyb2xzIGF0dHJpYnV0ZVxuICAgICAgICBpZih0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKXtcbiAgICAgICAgICAgIGxldCB0YXJnZXRzID0gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKS5zcGxpdCgnICcpO1xuICAgICAgICAgICAgdGFyZ2V0cy5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHJlc3VsdC5pbmRleE9mKHQpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBwYXNzZWQgaW4gVG9nZ2xlIGV2ZW50IGluZmx1ZW5jZXMgdGhpcyB0cmlnZ2VyLlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgLSBUb2dnbGUgZXZlbnQuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG5cbiAgICBldmVudE1hdGNoKGUpe1xuXG4gICAgICAgIGxldCBtYXRjaGVzID0gW107XG5cbiAgICAgICAgaWYodGhpcy5fZWxlbWVudC5pZCA9PT0gZS5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIEV2ZW50IGhhcyBhbiBhcnJheSBvZiB0YXJnZXRzLCBjaGVjayBpZiB0aG9zZSB0YXJnZXRzIG1hdGNoIHRoZSB0YXJnZXRzIG9mIHRoaXMgdHJpZ2dlci5cbiAgICAgICAgaWYoZS50YXJnZXRzKXtcbiAgICAgICAgICAgIG1hdGNoZXMgPSB0aGlzLl90YXJnZXRzLmZpbHRlcih0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZS50YXJnZXRzLmluZGV4T2YodCkgIT09IC0xO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgICAgIC8vIE5vIHRhcmdldHMgcHJvcGVydHksIGNoZWNrIGlmIHRoZSBUb2dnbGUgd2hpY2ggd2FzIHRvZ2dsZWQgaXMgdGhlIHRhcmdldCBvZiB0aGlzIHRyaWdnZXIuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0cy5pbmRleE9mKGUudG9nZ2xlLmdldElkKCkpID4gLTE7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExldCB0aGUgd29ybGQga25vdyBhIFRyaWdnZXIgaGFzIGJlZW4gY2xpY2tlZC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIC0gVGhlIGNsaWNrLWV2ZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfb25DbGljayhlKXtcblxuICAgICAgICAvLyBMZXQgdGhlIHdvcmxkIGtub3dcbiAgICAgICAgdGhpcy5fbWVkaWF0b3IucHVibGlzaCgndHJpZ2dlcicsIHtcbiAgICAgICAgICAgIHRvZ2dsZTogdGhpcyxcbiAgICAgICAgICAgIGlkOiB0aGlzLmdldElkKCksXG4gICAgICAgICAgICBhY3RpdmU6IHRoaXMuaXNBY3RpdmUoKSxcbiAgICAgICAgICAgIHRhcmdldHM6IHRoaXMuX3RhcmdldHNcbiAgICAgICAgfSk7XG5cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSB0cmlnZ2VyIHNob3VsZCByZXNwb25kIHRvIGEgVG9nZ2xlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgLSBUb2dnbGUgZXZlbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9vblRvZ2dsZShlKXtcblxuICAgICAgICBpZih0aGlzLmV2ZW50TWF0Y2goZSkpe1xuICAgICAgICAgICAgc3VwZXIuc3luYyhlLmFjdGl2ZSk7XG4gICAgICAgIH1cblxuICAgIH1cblxufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIFRyaWdnZXIgPSByZXF1aXJlKCcuL1RyaWdnZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUcmlnZ2VySW5wdXQgZXh0ZW5kcyBUcmlnZ2VyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgICAvLyBtYWtlIGNhbGwgdG8gc3VwZXJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgb3B0aW9ucyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgaW5wdXRzIHZhbHVlIGlzIGVtcHR5LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFN0YXRlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50LnZhbHVlICE9ICcnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExldCB0aGUgd29ybGQga25vdy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX29uQ2hhbmdlKCl7XG5cbiAgICAgICAgLy8gTGV0IHRoZSB3b3JsZCBrbm93XG4gICAgICAgIHRoaXMuX21lZGlhdG9yLnB1Ymxpc2goJ3RyaWdnZXInLCB7XG4gICAgICAgICAgICB0b2dnbGU6IHRoaXMsXG4gICAgICAgICAgICBpZDogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLl9lbGVtZW50LnZhbHVlID09PSAnJyxcbiAgICAgICAgICAgIHRhcmdldHM6IHRoaXMuX3RhcmdldHMsXG4gICAgICAgICAgICBmb3JjZTogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uIGtleWRvd24sIGNoZWNrIGlmIHZhbHVlIGhhcyBjaGFuZ2VkLlxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9vbktleURvd24oZSl7XG5cbiAgICAgICAgLy8gc2V0IHRvIGVuZCBvZiBxdWV1ZSBzbyB2YWx1ZSBpcyBpbiBpbnB1dFxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMuX3Nob3J0Y3V0cy5jaGFuZ2UpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGUgdGhpcyB0cmlnZ2VyLlxuICAgICAqL1xuXG4gICAgYWN0aXZhdGUoKXtcbiAgICAgICAgc3VwZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC52YWx1ZSAhPSAnJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWFjdGl2YXRlIHRoaXMgVHJpZ2dlclxuICAgICAqL1xuXG4gICAgZGVhY3RpdmF0ZSgpe1xuICAgICAgICBzdXBlci5kZWFjdGl2YXRlKCk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQudmFsdWUgPT0gJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHNob3J0Y3V0cyB0byBtZXRob2RzIHRvIGJpbmQsIGZvciBlYXN5IGJpbmRpbmcgYW5kIHVuYmluZGluZy5cbiAgICAgKiBAcmV0dXJucyB7e2NoYW5nZTogKGZ1bmN0aW9uKHRoaXM6VHJpZ2dlcklucHV0KXwqKSwga2V5ZG93bjogKGZ1bmN0aW9uKHRoaXM6VHJpZ2dlcklucHV0KXwqKX19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9nZXRTaG9ydGN1dHMoKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0b2dnbGUnOiB0aGlzLl9vblRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAna2V5ZG93bic6IHRoaXMuX29uS2V5RG93bi5iaW5kKHRoaXMpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50cy5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGJpbmQgLSBUbyBiaW5kIG9yIHVuYmluZC5cbiAgICAgKi9cblxuICAgIF9iaW5kKGJpbmQgPSB0cnVlKXtcblxuICAgICAgICBsZXQgbWV0aG9kID0gYmluZCA/ICdzdWJzY3JpYmUnIDogJ3Vuc3Vic2NyaWJlJztcbiAgICAgICAgdGhpcy5fbWVkaWF0b3JbbWV0aG9kXSgndG9nZ2xlJywgdGhpcy5fc2hvcnRjdXRzLnRvZ2dsZSk7XG5cbiAgICAgICAgbWV0aG9kID0gYmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcblxuICAgICAgICAvLyBjdXN0b20gZXZlbnRzXG4gICAgICAgIHRoaXMuX2VsZW1lbnRbbWV0aG9kXSgnY2hhbmdlJywgdGhpcy5fc2hvcnRjdXRzLmNoYW5nZSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRbbWV0aG9kXSgna2V5ZG93bicsIHRoaXMuX3Nob3J0Y3V0cy5rZXlkb3duKTtcblxuICAgIH1cblxufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIFRyaWdnZXJJbnB1dCA9IHJlcXVpcmUoJy4vVHJpZ2dlcklucHV0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVHJpZ2dlcklucHV0Q2hvaWNlIGV4dGVuZHMgVHJpZ2dlcklucHV0IHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgICAvLyBtYWtlIGNhbGwgdG8gc3VwZXJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgb3B0aW9ucyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHN0YXRlIG9mIHRoaXMgVHJpZ2dlci5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2dldFN0YXRlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGV0IHRoZSB3b3JsZCBrbm93IHRoaXMgVHJpZ2dlciBoYXMgY2hhbmdlZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX29uQ2hhbmdlKCl7XG5cbiAgICAgICAgLy8gTGV0IHRoZSB3b3JsZCBrbm93XG4gICAgICAgIHRoaXMuX21lZGlhdG9yLnB1Ymxpc2goJ3RyaWdnZXInLCB7XG4gICAgICAgICAgICB0b2dnbGU6IHRoaXMsXG4gICAgICAgICAgICBpZDogdGhpcy5nZXRJZCgpLFxuICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmlzQWN0aXZlKCksXG4gICAgICAgICAgICB0YXJnZXRzOiB0aGlzLl90YXJnZXRzXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWN0aXZhdGUgdGhpcyB0cmlnZ2VyLlxuICAgICAqL1xuXG4gICAgYWN0aXZhdGUoKXtcbiAgICAgICAgc3VwZXIuYWN0aXZhdGUoKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWFjdGl2YXRlIHRoaXMgdHJpZ2dlci5cbiAgICAgKi9cblxuICAgIGRlYWN0aXZhdGUoKXtcbiAgICAgICAgc3VwZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2hvcnRjdXRzIHRvIG1ldGhvZHMgdG8gYmluZCwgZm9yIGVhc3kgYmluZGluZyBhbmQgdW5iaW5kaW5nLlxuICAgICAqIEByZXR1cm5zIHt7Y2hhbmdlOiAoZnVuY3Rpb24odGhpczpUcmlnZ2VySW5wdXQpfCopLCBrZXlkb3duOiAoZnVuY3Rpb24odGhpczpUcmlnZ2VySW5wdXQpfCopfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2dldFNob3J0Y3V0cygpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3RvZ2dsZSc6IHRoaXMuX29uVG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAnY2hhbmdlJzogdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudHMuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSAoYmluZClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kKGJpbmQgPSB0cnVlKXtcblxuICAgICAgICBsZXQgbWV0aG9kID0gYmluZCA/ICdzdWJzY3JpYmUnIDogJ3Vuc3Vic2NyaWJlJztcbiAgICAgICAgdGhpcy5fbWVkaWF0b3JbbWV0aG9kXSgndG9nZ2xlJywgdGhpcy5fc2hvcnRjdXRzLnRvZ2dsZSk7XG5cbiAgICAgICAgbWV0aG9kID0gYmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcblxuICAgICAgICAvLyBjdXN0b20gZXZlbnRzXG4gICAgICAgIHRoaXMuX2VsZW1lbnRbbWV0aG9kXSgnY2hhbmdlJywgdGhpcy5fc2hvcnRjdXRzLmNoYW5nZSk7XG5cbiAgICB9XG5cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBUcmlnZ2VySW5wdXQgPSByZXF1aXJlKCcuL1RyaWdnZXJJbnB1dCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFRyaWdnZXJJbnB1dFNlbGVjdCBleHRlbmRzIFRyaWdnZXJJbnB1dCB7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG5cbiAgICAgICAgLy8gbWFrZSBjYWxsIHRvIHN1cGVyXG4gICAgICAgIHN1cGVyKGVsZW1lbnQsIG9wdGlvbnMpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3VzdG9tIGltcGxlbWVudGF0aW9uIG9mIHRoZSBfaW5pdGlhbGl6ZS1tZXRob2QuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9pbml0aWFsaXplKCl7XG5cbiAgICAgICAgc3VwZXIuX2luaXRpYWxpemUoKTtcblxuICAgICAgICAvLyBTbGlnaHQgZGVsYXksIGFzIHRoaXMgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBvbmNlIC0gYnV0IG11bHRpcGxlIHRvZ2dsZXMgd2lsbCBiZSBjb250cm9sbGVkIHZpYSB0aGlzIHRyaWdnZXIuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2UoKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBJRCdzIG9mIHRoZSBUb2dnbGVzIHRoaXMgVHJpZ2dlciB0YXJnZXRzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfZ2V0VGFyZ2V0SURzKCl7XG5cbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIGxldCBvcHRpb24gPSB0aGlzLl9lbGVtZW50LmNoaWxkcmVuW3RoaXMuX2VsZW1lbnQuc2VsZWN0ZWRJbmRleF07XG5cbiAgICAgICAgLy8gQWRkIHRhcmdldHMgZnJvbSBhcmlhLWNvbnRyb2xzIGF0dHJpYnV0ZSBvZiBzZWxlY3RlZCBvcHRpb25cbiAgICAgICAgaWYob3B0aW9uLmhhc0F0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpKXtcbiAgICAgICAgICAgIGxldCB0YXJnZXRzID0gb3B0aW9uLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB0YXJnZXRzLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgICAgICAgaWYocmVzdWx0LmluZGV4T2YodCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExldCB0aGUgd29ybGQga25vdyB0aGlzIFRyaWdnZXIgaGFzIGNoYW5nZWQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9vbkNoYW5nZSgpe1xuXG4gICAgICAgIGxldCBpZHMgPSB0aGlzLl9nZXRUYXJnZXRJRHMoKTtcblxuICAgICAgICAvLyBMZXQgdGhlIHdvcmxkIGtub3dcbiAgICAgICAgdGhpcy5fbWVkaWF0b3IucHVibGlzaCgndHJpZ2dlcicsIHtcbiAgICAgICAgICAgIHRvZ2dsZTogdGhpcyxcbiAgICAgICAgICAgIGlkOiB0aGlzLmdldElkKCksXG4gICAgICAgICAgICBhY3RpdmU6IGlkcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgdGFyZ2V0czogaWRzXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHNob3J0Y3V0cyB0byBtZXRob2RzIHRvIGJpbmQsIGZvciBlYXN5IGJpbmRpbmcgYW5kIHVuYmluZGluZy5cbiAgICAgKiBAcmV0dXJucyB7e2NoYW5nZTogKGZ1bmN0aW9uKHRoaXM6VHJpZ2dlcklucHV0KXwqKSwga2V5ZG93bjogKGZ1bmN0aW9uKHRoaXM6VHJpZ2dlcklucHV0KXwqKX19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9nZXRTaG9ydGN1dHMoKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd0b2dnbGUnOiB0aGlzLl9vblRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJ2NoYW5nZSc6IHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnRzLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gKGJpbmQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9iaW5kKGJpbmQgPSB0cnVlKXtcblxuICAgICAgICBsZXQgbWV0aG9kID0gYmluZCA/ICdzdWJzY3JpYmUnIDogJ3Vuc3Vic2NyaWJlJztcbiAgICAgICAgdGhpcy5fbWVkaWF0b3JbbWV0aG9kXSgndG9nZ2xlJywgdGhpcy5fc2hvcnRjdXRzLnRvZ2dsZSk7XG5cbiAgICAgICAgbWV0aG9kID0gYmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcblxuICAgICAgICAvLyBjdXN0b20gZXZlbnRzXG4gICAgICAgIHRoaXMuX2VsZW1lbnRbbWV0aG9kXSgnY2hhbmdlJywgdGhpcy5fc2hvcnRjdXRzLmNoYW5nZSk7XG5cbiAgICB9XG5cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBUcmlnZ2VyID0gcmVxdWlyZSgnLi9UcmlnZ2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVHJpZ2dlckxpbmsgZXh0ZW5kcyBUcmlnZ2VyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgICAvLyBtYWtlIGNhbGwgdG8gc3VwZXJcbiAgICAgICAgc3VwZXIoZWxlbWVudCwgb3B0aW9ucyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNwb25kIHRvIGNsaWNrcyBvbiB0aGlzIFRyaWdnZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIC0gQ2xpY2sgZXZlbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9vbkNsaWNrKGUpe1xuXG4gICAgICAgIC8vIENhbmNlbCBkZWZhdWx0IGV2ZW50XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAvLyBMZXQgdGhlIHdvcmxkIGtub3dcbiAgICAgICAgdGhpcy5fbWVkaWF0b3IucHVibGlzaCgndHJpZ2dlcicsIHtcbiAgICAgICAgICAgIHRvZ2dsZTogdGhpcyxcbiAgICAgICAgICAgIGlkOiB0aGlzLmdldElkKCksXG4gICAgICAgICAgICBhY3RpdmU6IHRoaXMuaXNBY3RpdmUoKSxcbiAgICAgICAgICAgIHRhcmdldHM6IHRoaXMuX3RhcmdldHMsXG4gICAgICAgICAgICB0eXBlOiAnbGluaydcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbn0iLCJyZXF1aXJlKCdiYWJlbC1jb3JlL3JlZ2lzdGVyJyk7XG5cbnZhciBGb2N1cyA9IHJlcXVpcmUoJy4vdXRpbHMvRm9jdXMnKSxcbiAgICBUb2dnbGUgPSByZXF1aXJlKCcuL2xpYi9GYWN0b3J5JyksXG4gICAgJCQgPSByZXF1aXJlKCcuL3V0aWxzL1F1ZXJ5U2VsZWN0b3InKTtcblxuLy8gY3JlYXRlIFRvZ2dsZXNcbnZhciB0b2dnbGVzID0gJCQoJy50b2dnbGUnKTtcbnRvZ2dsZXMuZm9yRWFjaCh0ID0+IHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBuZXcgVG9nZ2xlKHQpO1xufSk7XG5cbi8vIGR5bmFtaWMgdG9nZ2xlc1xudmFyIGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG9nZ2xlJyksXG4gICAgY291bnQgPSBbXS5zbGljZS5hcHBseShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHluYW1pYy1idXR0b25zJykucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uJykpLmxlbmd0aDtcbmlmKGJ1dHRvbikge1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgIC8vIGlkXG4gICAgICAgIHZhciBpZCA9ICd0b2dnbGUtZHluYW1pYy1ncm91cC0nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0b2dnbGVcbiAgICAgICAgdmFyIHRvZ2dsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0b2dnbGUuaHJlZiA9ICcjdG9nZ2xlLWR5bmFtaWMnO1xuICAgICAgICB0b2dnbGUuaW5uZXJIVE1MID0gJ1RvZ2dsZSAnICsgY291bnQ7XG4gICAgICAgIHRvZ2dsZS5pZCA9IGlkO1xuICAgICAgICB0b2dnbGUuY2xhc3NOYW1lID0gJ3RvZ2dsZSc7XG4gICAgICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtZ3JvdXAnLCAnZHluYW1pYycpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0cmlnZ2VyXG4gICAgICAgIHZhciB0cmlnZ2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHRyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuICAgICAgICB0cmlnZ2VyLmlubmVySFRNTCA9ICdUcmlnZ2VyICcgKyBjb3VudDtcblxuICAgICAgICAvLyBhcHBlbmRcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R5bmFtaWMtdG9nZ2xlcycpLmFwcGVuZENoaWxkKHRvZ2dsZSk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkeW5hbWljLWJ1dHRvbnMnKS5hcHBlbmRDaGlsZCh0cmlnZ2VyKTtcblxuICAgICAgICAvLyBjcmVhdGUgdHJpZ2dlciBhbmQgdG9nZ2xlXG4gICAgICAgIG5ldyBUb2dnbGUodG9nZ2xlKTtcbiAgICAgICAgbmV3IFRvZ2dsZSh0cmlnZ2VyKTtcblxuICAgIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyICQkID0gcmVxdWlyZSgnLi9RdWVyeVNlbGVjdG9yJyk7XG5cbmNvbnN0IGZvY3VzYWJsZUVsZW1lbnRzID0gWydhW2hyZWZdJywgJ2FyZWFbaHJlZl0nLCAnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJywgJ2J1dHRvbicsICdpZnJhbWUnLCAnb2JqZWN0JywgJ2VtYmVkJywgJ1tjb250ZW50ZWRpdGFibGVdJywgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleF49XCItXCJdKSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZvY3VzIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpe1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBzaG9ydGN1dHMgZm9yIGVhc3kgKHVuKWJpbmRpbmcgb2YgbWV0aG9kcy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2luaXRpYWxpemUoKSB7XG4gICAgICAgIHRoaXMuX21haW50YWluRm9jdXNCaW5kID0gdGhpcy5fbWFpbnRhaW5Gb2N1cy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbktleURvd25CaW5kID0gdGhpcy5fb25LZXlEb3duLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uQ2xpY2tDb250YWluQmluZCA9IHRoaXMuX29uQ2xpY2tDb250YWluLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uQ2xpY2tFeGNsdWRlQmluZCA9IHRoaXMuX29uQ2xpY2tFeGNsdWRlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uRm9jdXNCaW5kID0gdGhpcy5fb25Gb2N1cy5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbmNlbCBzZXR0aW5nIGZvY3VzIG9uIGVsZW1lbnQgb3V0c2lkZSBvZiBjb250YWluZXIuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9vbkZvY3VzKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnRzIGZvciBjb250YWluaW5nIGZvY3VzLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYmluZCAtIEJpbmQgb3IgdW5iaW5kLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfYmluZENvbnRhaW4oYmluZCA9IHRydWUpIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9IGJpbmQgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG4gICAgICAgIGRvY3VtZW50LmJvZHlbbWV0aG9kXSgnZm9jdXMnLCB0aGlzLl9tYWludGFpbkZvY3VzQmluZCwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHlbbWV0aG9kXSgna2V5ZG93bicsIHRoaXMuX29uS2V5RG93bkJpbmQsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5ib2R5W21ldGhvZF0oJ2NsaWNrJywgdGhpcy5fb25DbGlja0NvbnRhaW5CaW5kLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50cyBmb3IgZXhjbHVkaW5nIGZvY3VzLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYmluZCAtIEJpbmQgb3IgdW5iaW5kLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfYmluZEV4Y2x1ZGUoYmluZCA9IHRydWUpe1xuICAgICAgICBsZXQgbWV0aG9kID0gYmluZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICAgICAgZG9jdW1lbnQuYm9keVttZXRob2RdKCdjbGljaycsIHRoaXMuX29uQ2xpY2tFeGNsdWRlQmluZCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2F0Y2ggY2xpY2tzIGluIGEgZm9jdXMtY29udGFpbiBzY2VuYXJpby5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIC0gQ2xpY2sgZXZlbnQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9vbkNsaWNrQ29udGFpbihlKXtcblxuICAgICAgICAvLyB0aGUgdGFyZ2V0IG9mIHRoZSBldmVudFxuICAgICAgICBsZXQgdGFyZ2V0ID0gZS50YXJnZXQ7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgdGFyZ2V0IGlzIGluc2lkZSBvZiBlbGVtZW50XG4gICAgICAgIHdoaWxlKHRhcmdldCAhPSB0aGlzLl9lbGVtZW50ICYmIHRhcmdldC5wYXJlbnROb2RlKXtcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5zaWRlIG9mIGVsZW1lbnQsIGNhbmNlbCBjbGlja1xuICAgICAgICBpZiAodGFyZ2V0ICE9PSB0aGlzLl9lbGVtZW50KXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhdGNoIGNsaWNrcyBpbiBhIGZvY3VzLWV4Y2x1ZGUgc2NlbmFyaW8uXG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX29uQ2xpY2tFeGNsdWRlKGUpe1xuXG4gICAgICAgIC8vIHRoZSB0YXJnZXQgb2YgdGhlIGV2ZW50XG4gICAgICAgIGxldCB0YXJnZXQgPSBlLnRhcmdldDtcblxuICAgICAgICAvLyBjaGVjayBpZiB0YXJnZXQgaXMgaW5zaWRlIG9mIGVsZW1lbnRcbiAgICAgICAgd2hpbGUodGFyZ2V0ICE9IHRoaXMuX2VsZW1lbnQgJiYgdGFyZ2V0LnBhcmVudE5vZGUpe1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvdXRzaWRlIG9mIGVsZW1lbnQsIGNhbmNlbCBjbGlja1xuICAgICAgICBpZiAodGFyZ2V0ID09PSB0aGlzLl9lbGVtZW50KXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYXAgdGFiIGtleS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIC0gS2V5ZG93biBldmVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX29uS2V5RG93bihlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQWN0aXZlKCkgJiYgZS53aGljaCA9PT0gOSkge1xuICAgICAgICAgICAgdGhpcy5fdHJhcFRhYktleSh0aGlzLl9lbGVtZW50LCBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIGxpc3Qgb2YgZm9jdXNhYmxlIGVsZW1lbnQgaW4gdGhlIGN1cnJlbnQgbm9kZS5cbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX2dldEZvY3VzYWJsZUVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4gJCQoZm9jdXNhYmxlRWxlbWVudHMuam9pbignLCcpLCB0aGlzLl9lbGVtZW50KS5maWx0ZXIoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gISEoY2hpbGQub2Zmc2V0V2lkdGggfHwgY2hpbGQub2Zmc2V0SGVpZ2h0IHx8IGNoaWxkLmdldENsaWVudFJlY3RzKCkubGVuZ3RoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGZvY3VzIHRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgX3NldEZvY3VzVG9GaXJzdEVsZW1lbnQoKSB7XG4gICAgICAgIGxldCBmb2N1c2FibGVDaGlsZHJlbiA9IHRoaXMuX2dldEZvY3VzYWJsZUVsZW1lbnRzKCk7XG4gICAgICAgIGlmIChmb2N1c2FibGVDaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvY3VzYWJsZUNoaWxkcmVuWzBdLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgb3IgZGlzYWJsZSBjaGlsZHJlbi5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGVuYWJsZSAtIEVuYWJsZSBvZiBkaXNhYmxlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgICBfdG9nZ2xlRm9jdXNhYmxlQ2hpbGRyZW4oZW5hYmxlKXtcblxuICAgICAgICBsZXQgZm9jdXNhYmxlQ2hpbGRyZW4gPSB0aGlzLl9nZXRGb2N1c2FibGVFbGVtZW50cygpO1xuXG4gICAgICAgIGlmIChmb2N1c2FibGVDaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvY3VzYWJsZUNoaWxkcmVuLmZvckVhY2goZiA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZihmLmRpc2FibGVkID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCBlbmFibGUgPyAnJyA6IC0xKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmLmRpc2FibGVkID0gIWVuYWJsZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbWV0aG9kID0gZW5hYmxlID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2FkZEV2ZW50TGlzdGVuZXInO1xuICAgICAgICAgICAgICAgIGZbbWV0aG9kXSgnZm9jdXMnLCB0aGlzLl9vbkZvY3VzQmluZCk7XG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWludGFpbiBmb2N1cyB3aGVuIHRhYmJpbmcgdG8gb3V0c2lkZSBjb250ZXh0LlxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF9tYWludGFpbkZvY3VzKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUoKSAmJiAhdGhpcy5fZWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRGb2N1c1RvRmlyc3RFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFwIHRhYi1rZXkgZGVmYXVsdCBiZWhhdmlvdXIgYnkgaGFja2luZyBkZWZhdWx0IGZvY3VzIG9yZGVyLlxuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICAgIF90cmFwVGFiS2V5KG5vZGUsIGV2ZW50KSB7XG4gICAgICAgIGxldCBmb2N1c2FibGVDaGlsZHJlbiA9IHRoaXMuX2dldEZvY3VzYWJsZUVsZW1lbnRzKG5vZGUpLFxuICAgICAgICAgICAgZm9jdXNlZEl0ZW1JbmRleCA9IGZvY3VzYWJsZUNoaWxkcmVuLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIGZvY3VzZWRJdGVtSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGZvY3VzYWJsZUNoaWxkcmVuW2ZvY3VzYWJsZUNoaWxkcmVuLmxlbmd0aCAtIDFdLmZvY3VzKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCFldmVudC5zaGlmdEtleSAmJiBmb2N1c2VkSXRlbUluZGV4ID09PSBmb2N1c2FibGVDaGlsZHJlbi5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBmb2N1c2FibGVDaGlsZHJlblswXS5mb2N1cygpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIG1vZHVsZSBpcyBhY3RpdmUuXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG5cbiAgICBpc0FjdGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgRXhjbHVkZSBlbGVtZW50IGFuZCBpdHMgY2hpbGRyZW4gZnJvbSBmb2N1cy5cbiAgICAgKi9cblxuICAgIGV4Y2x1ZGUoKSB7XG5cbiAgICAgICAgLy8gY2F0Y2ggY2xpY2tzXG4gICAgICAgIHRoaXMuX2JpbmRFeGNsdWRlKHRydWUpO1xuXG4gICAgICAgIHRoaXMuX2ZvY3VzZWRCZWZvcmUgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIC8vIGRpc2FibGUgY2hpbGRyZW5cbiAgICAgICAgdGhpcy5fdG9nZ2xlRm9jdXNhYmxlQ2hpbGRyZW4oZmFsc2UpO1xuXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiAgQ29udGFpbiBmb2N1cyB0byBlbGVtZW50IGFuZCBpdHMgY2hpbGRyZW4uXG4gICAgICovXG5cbiAgICBjb250YWluKCkge1xuXG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2ZvY3VzZWRCZWZvcmUgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9iaW5kQ29udGFpbih0cnVlKTtcbiAgICAgICAgdGhpcy5fc2V0Rm9jdXNUb0ZpcnN0RWxlbWVudCgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZSBjb250YWlubWVudCBvZiBmb2N1cy5cbiAgICAgKi9cblxuICAgIGRpc2FibGVDb250YWluKCkge1xuICAgICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmluZENvbnRhaW4oZmFsc2UpO1xuXG4gICAgICAgIGlmICh0aGlzLl9mb2N1c2VkQmVmb3JlKSB7XG4gICAgICAgICAgICB0aGlzLl9mb2N1c2VkQmVmb3JlLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlIGV4Y2x1ZGVtZW50IG9mIGZvY3VzLlxuICAgICAqL1xuXG4gICAgZGlzYWJsZUV4Y2x1ZGUoKSB7XG5cbiAgICAgICAgLy8gY2F0Y2ggY2xpY2tzXG4gICAgICAgIHRoaXMuX2JpbmRFeGNsdWRlKGZhbHNlKTtcblxuICAgICAgICAvLyBkaXNhYmxlIGNoaWxkcmVuXG4gICAgICAgIHRoaXMuX3RvZ2dsZUZvY3VzYWJsZUNoaWxkcmVuKHRydWUpO1xuXG4gICAgfVxuXG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2luc3RhbmNlO1xuXG5jbGFzcyBNZWRpYXRvciB7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLl90b3BpY3MgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgdG8gYW4gZXZlbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRvcGljIC0gVGhlIGV2ZW50IHRvIHN1YnNjcmliZSB0by5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cblxuICAgIHN1YnNjcmliZSh0b3BpYywgY2FsbGJhY2spe1xuICAgICAgICBpZighdGhpcy5fdG9waWNzLmhhc093blByb3BlcnR5KHRvcGljKSl7XG4gICAgICAgICAgICB0aGlzLl90b3BpY3NbdG9waWNdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90b3BpY3NbdG9waWNdLnB1c2goY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbnN1YnNjcmliZSBmcm9tIGFuIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0b3BpYyAtIFRoZSBldmVudCB0byB1bnN1YnNjcmliZSBmcm9tLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGZ1bmN0aW9uIHRvIHVuc3Vic2NyaWJlbFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuXG4gICAgdW5zdWJzY3JpYmUodG9waWMsIGNhbGxiYWNrKXtcbiAgICAgICAgaWYoIXRoaXMuX3RvcGljcy5oYXNPd25Qcm9wZXJ0eSh0b3BpYykpe1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5fdG9waWNzW3RvcGljXS5mb3JFYWNoKGZ1bmN0aW9uKHQsIGluZGV4KXtcbiAgICAgICAgICAgIGlmKHQgPT09IGNhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICBfdGhpcy5fdG9waWNzW3RdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoIGFuIGV2ZW50LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuXG4gICAgcHVibGlzaCgpe1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciB0b3BpYyA9IGFyZ3Muc2hpZnQoKTtcblxuICAgICAgICBpZighdGhpcy5fdG9waWNzLmhhc093blByb3BlcnR5KHRvcGljKSl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90b3BpY3NbdG9waWNdLmZvckVhY2goZnVuY3Rpb24odCl7XG4gICAgICAgICAgICB0LmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRJbnN0YW5jZTpmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIV9pbnN0YW5jZSl7XG4gICAgICAgICAgICBfaW5zdGFuY2UgPSBuZXcgTWVkaWF0b3IoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2luc3RhbmNlO1xuICAgIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICQkKHNlbGVjdG9yLCBjb250ZXh0ID0gZG9jdW1lbnQpIHtcbiAgICByZXR1cm4gW10uc2xpY2UuY2FsbChjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbn0iXX0=
