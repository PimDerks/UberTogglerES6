'use strict';

import Trigger from "./Trigger";

export default class TriggerInput extends Trigger {

    constructor(element, options) {

        // make call to super
        super(element, options);

    }

    /**
     * Check if the inputs value is empty.
     * @returns {boolean}
     * @private
     */
    _getState(){
        return this._element.value != '';
    }

    /**
     * Let the world know.
     * @private
     */

    _onChange(){

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

    _onKeyDown(e){

        // set to end of queue so value is in input
        setTimeout(this._shortcuts.change);

    }

    /**
     * Overwrite click event from default trigger.
     * @param e
     * @private
     */


    _onClick(){

    }

    /**
     * Activate this trigger.
     */

    activate(){
        super.activate();
    }

    /**
     * Deactivate this Trigger
     */

    deactivate(){
        super.deactivate();
        this._element.value == '';
    }


    /**
     * Bind events.
     * @param {Boolean} bind - To bind or unbind.
     */

    _bind(bind = true){

        super._bind(true);

        let method = bind ? 'subscribe' : 'unsubscribe';
        this._mediator[method]('toggle', this._shortcuts.toggle);

    }

}