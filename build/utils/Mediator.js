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