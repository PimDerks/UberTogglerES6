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