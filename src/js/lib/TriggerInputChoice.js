'use strict';

import TriggerInput from "./TriggerInput";
import $$ from "../utils/QuerySelector";

export default class TriggerInputChoice extends TriggerInput {

    constructor(element, options) {

        // make call to super
        super(element, options);

    }

    /**
     * Get the state of this Trigger.
     * @returns {Boolean}
     * @private
     */

    _getState(){
        return this._element.checked;
    }

    /**
     * Let the world know this Trigger has changed.
     * @private
     */

    _onChange(e){

        if(e.target === this._element || this.isActive()){

            // Let the world know
            this._mediator.publish('trigger', {
                toggle: this,
                id: this.getId(),
                active: e.target === this._element ? this.isActive() : false,
                targets: this._targets
            });

        }

    }

    /**
     * Activate this trigger.
     */

    activate(){
        super.activate();
        if(!this._element.checked) {
            this._element.checked = true;
        }
    }

    /**
     * Deactivate this trigger.
     */

    deactivate(){
        super.deactivate();
        if(this._element.checked) {
            this._element.checked = false;
        }
    }

    /**
     * Get shortcuts to methods to bind, for easy binding and unbinding.
     * @returns {{change: (function(this:TriggerInput)|*), keydown: (function(this:TriggerInput)|*)}}
     * @private
     */

    _getShortcuts(){
        return {
            'toggle': this._onToggle.bind(this),
            'change': this._onChange.bind(this)
        }
    }

    /**
     * Bind events.
     * @param {Boolean} (bind)
     * @private
     */
    _bind(bind = true){

        // custom events
        let method = bind ? 'subscribe' : 'unsubscribe';
        this._mediator[method]('toggle', this._shortcuts.toggle);

        // native events
        method = bind ? 'addEventListener' : 'removeEventListener';
        this._siblings = $$('input[name="' + this._element.name + '"]');
        this._siblings.forEach(sibling => sibling[method]('change', this._shortcuts.change));

    }

}