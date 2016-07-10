'use strict';

var Trigger = require('./Trigger');

module.exports = class TriggerLink extends Trigger {

    constructor(element, options) {

        // make call to super
        super(element, options);

    }

    /**
     * Respond to clicks on this Trigger
     * @param {Event} e - Click event.
     * @private
     */

    _onClick(e){

        // Cancel default event
        e.preventDefault();
        e.stopPropagation();

        // Set hash
        let href = this.isActive() ? '#' : this._element.getAttribute('href');

        if(history.pushState && href) {
            history.pushState(null, null, href);
        } else {
            location.hash = href;
        }

        // Let the world know
        this._mediator.publish('trigger', {
            toggle: this,
            id: this.getId(),
            active: this.isActive(),
            targets: this._targets
        });

    }

}