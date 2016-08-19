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