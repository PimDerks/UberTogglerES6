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