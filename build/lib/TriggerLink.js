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