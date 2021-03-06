'use strict';

import TriggerInput from "./TriggerInput";

export default class TriggerInputSelect extends TriggerInput {

    constructor(element, options) {

        // make call to super
        super(element, options);

    }

    /**
     * Custom implementation of the _initialize-method.
     * @private
     */

    _initialize(){

        super._initialize();

        // Slight delay, as this will only be triggered once - but multiple toggles will be controlled via this trigger.
        setTimeout(() => {
            this._onChange();
        });

    }

    /**
     * Returns an array of the ID's of the Toggles this Trigger targets.
     *
     * @returns {Array}
     * @private
     */

    _getTargetIDs(){

        let result = [];

        let option = this._element.children[this._element.selectedIndex];

        // Add targets from aria-controls attribute of selected option and filter out duplicates
        if(option.hasAttribute('aria-controls')){
            let targets = option.getAttribute('aria-controls').split(' ');
            targets.forEach(t => {
                if(result.indexOf(t) === -1) {
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

    _onChange(){

        let ids = this._getTargetIDs();

        // Let the world know
        this._mediator.publish('trigger', {
            toggle: this,
            id: this.getId(),
            active: ids.length > 0,
            targets: ids
        });

    }

    /**
     * Bind events.
     * @param {Boolean} (bind)
     * @private
     */

    _bind(bind = true){

        super._bind(bind);

        // custom events
        let method = bind ? 'subscribe' : 'unsubscribe';
        this._mediator[method]('toggle', this._shortcuts.toggle);

    }

}