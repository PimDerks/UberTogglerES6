'use strict';

var Trigger = require('./Trigger');

module.exports = class TriggerInput extends Trigger {

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
     * Activate this trigger.
     */

    activate(){
        super.activate();
        this._element.value != '';
    }

    /**
     * Deactivate this Trigger
     */

    deactivate(){
        super.deactivate();
        this._element.value == '';
    }

    /**
     * Get shortcuts to methods to bind, for easy binding and unbinding.
     * @returns {{change: (function(this:TriggerInput)|*), keydown: (function(this:TriggerInput)|*)}}
     * @private
     */

    _getShortcuts(){
        return {
            'toggle': this._onToggle.bind(this),
            'change': this._onChange.bind(this),
            'keydown': this._onKeyDown.bind(this)
        }
    }

    /**
     * Bind events.
     * @param {Boolean} bind - To bind or unbind.
     */

    _bind(bind = true){

        let method = bind ? 'subscribe' : 'unsubscribe';
        this._mediator[method]('toggle', this._shortcuts.toggle);

        method = bind ? 'addEventListener' : 'removeEventListener';

        // custom events
        this._element[method]('change', this._shortcuts.change);
        this._element[method]('keydown', this._shortcuts.keydown);

    }

}