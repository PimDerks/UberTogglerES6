'use strict';

var Toggle = require('./Toggle');

module.exports = class Trigger extends Toggle {

    constructor(element, options) {

        // make call to super
        super(element, options);

    }

    /**
     * Initialize this trigger.
     * @private
     */

    _initialize(){

        // Get targets
        this._targets = this._getTargetIDs();

        // Bind events
        this._bind(true);

        // register without delay
        this.register();

        // set initial state
        this.getTargetState() ? this.activate() : this.deactivate();

        // update
        this.update();

    }

    /**
     * Get object of methods, for easy binding and unbinding.
     * @return {Object}
     * @private
     */

    _getShortcuts(){
        return {
            'click': this._onClick.bind(this),
            'toggle': this._onToggle.bind(this)
        }
    }

    /**
     * Bind events/handlers.
     * @param {Boolean} bind - To bind or to unbind.
     * @private
     */

    _bind(bind = true){

        let method = bind ? 'subscribe' : 'unsubscribe';
        this._mediator[method]('toggle', this._shortcuts.toggle);

        method = bind ? 'addEventListener' : 'removeEventListener';
        this._element[method]('click', this._shortcuts.click);

    }

    /**
     * Check what the current state of the first Toggle targeted is.
     * @returns {*}
     */

    getTargetState() {

        if (this._targets && this._targets[0]) {
            let id = this._targets[0],
                toggle = this._manager.getToggleById(id);
            if(toggle) {
                return toggle.isActive();
            }
        }

        return false;

    }

    /**
     * Check if this Toggle is a Trigger.
     * @returns {boolean}
     */

    isTrigger(){
        return true;
    }

    /**
     * Get an array of ID's of elements/Toggles to target.
     * @returns {Array}
     * @private
     */

    _getTargetIDs(){

        let result = [];

        // Get ID from href in case the trigger is anchor
        if(this._element.nodeName.toLowerCase() === 'a'){
            let href = this._element.getAttribute('href');
            href ? result.push(href.replace('#','')) : null;
        }

        // Add targets from aria-controls attribute
        if(this._element.getAttribute('aria-controls')){
            let targets = this._element.getAttribute('aria-controls').split(' ');
            targets.forEach(t => {
                if(result.indexOf(t) === -1) {
                    result.push(t);
                }
            });
        }
        return result;
    }

    /**
     * Check if the passed in Toggle event influences this trigger.
     * @param {Event} e - Toggle event.
     * @returns {boolean}
     */

    eventMatch(e){

        let matches = [];

        if(this._element.id === e.id) {
            return false;
        }

        // If the Event has an array of targets, check if those targets match the targets of this trigger.
        if(e.targets){
            matches = this._targets.filter(t => {
                return e.targets.indexOf(t) !== -1;
            });

            return matches.length > 0;

            // No targets property, check if the Toggle which was toggled is the target of this trigger.
        } else {
            return this._targets.indexOf(e.toggle.getId()) > -1;
        }

    }

    /**
     * Let the world know a Trigger has been clicked.
     * @param {Event} e - The click-event.
     * @private
     */

    _onClick(e){

        console.log('click trigger');

        // Let the world know
        this._mediator.publish('trigger', {
            toggle: this,
            id: this.getId(),
            active: this.isActive(),
            targets: this._targets
        });


    }

    /**
     * Check if the trigger should respond to a Toggle event.
     * @param {Event} e - Toggle event.
     * @private
     */

    _onToggle(e){

        if(this.eventMatch(e)){
            super.sync(e.active);
        }

    }

}