'use strict';

var TriggerInput = require('./TriggerInput');

module.exports = class TriggerInputChoice extends TriggerInput {

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

    _onChange(){

        // Let the world know
        this._mediator.publish('trigger', {
            toggle: this,
            id: this.getId(),
            active: this.isActive(),
            targets: this._targets
        });

    }

    /**
     * Activate this trigger.
     */

    activate(){
        super.activate();
        this._element.checked = true;
    }

    /**
     * Deactivate this trigger.
     */

    deactivate(){
        super.deactivate();
        this._element.checked = false;
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

        let method = bind ? 'subscribe' : 'unsubscribe';
        this._mediator[method]('toggle', this._shortcuts.toggle);

        method = bind ? 'addEventListener' : 'removeEventListener';

        // custom events
        this._element[method]('change', this._shortcuts.change);

    }

}