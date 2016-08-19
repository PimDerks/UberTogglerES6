'use strict';

import Trigger from "./Trigger";

export default class TriggerLink extends Trigger {

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

        // Let the world know
        this._mediator.publish('trigger', {
            toggle: this,
            id: this.getId(),
            active: this.isActive(),
            targets: this._targets,
            type: 'link'
        });

    }

}