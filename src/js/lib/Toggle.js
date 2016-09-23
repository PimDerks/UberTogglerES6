'use strict';

import Mediator from "../utils/Mediator";
import Focus from "../utils/Focus";
import Helpers from '../utils/Helpers';
import Manager from "./Manager";
import $$ from "../utils/QuerySelector";
import ToggleBase from "./ToggleBase.js";

const focusableElements = Helpers.focusableElements;

module.exports = class Toggle extends ToggleBase {

    constructor(element, options) {

        super(element, options);

    }



    /**
     * Initialize the Toggle
     * @private
     */

    _initialize() {

        // Bind events
        this._bind(true);

        // Create instance of Focus containments
        if(this._options.focusContain || this._options.focusExclude){
            this._focus = new Focus(this._element);
        }

        // Register toggle
        setTimeout(() => {
            this.register();
            this.update();
        });

    }

    /**
     *
     * @param {Boolean} bind - Bind or unbind.
     * @private
     */

    _bind(bind = true){

        super._bind(bind);

        // Listen to custom toggle-event
        let method = bind ? 'subscribe' : 'unsubscribe';
        this._mediator[method]('trigger', this._shortcuts.trigger);

    }

    /**
     * Check if this Toggle should respond to a toggle-event thrown.
     * @param {Event} e - Toggle event.
     * @returns {Boolean} - Matches with thrown event.
     */

    eventMatch(e){

        // Check if event matched with this ID
        if(e.id === this.getId()){
            return false;
        }

        // Check if event has targets. Return if a match has been found.
        if(e.targets){
            return e.targets.indexOf(this.getId()) > -1;
        }

        return false;

    }

    /**
     * Respond to a toggle-event.
     *
     * @param {Event} e - The Trigger event.
     * @private
     */

    _onTrigger(e){

        if(this.eventMatch(e)){

            if(this._options.activateOnly && this.getGroup() && this.isActive()){
                return;
            }

            this.toggle(e);

            if(e.type === 'link'){

                // Set hash
                let href = !this.isActive() ? '#' : this.getId();

                if(history.pushState && href) {
                    history.pushState(null, null, '#' + href);
                } else {
                    location.hash = href;
                }

            }

        }

    }

    /**
     * Start the timer when the mouse leaves the element
     */

    _onMouseLeave(){
        this._startMouseTimer();
    }

    /**
     * When an element is entered by a mouse, clear the timer to close the Toggle.
     */

    _onMouseEnter(){
        if(this._mouseTimer){
            clearTimeout(this._mouseTimer);
        }
    }

    /**
     * Close the Toggle when clicked outside.
     * @param {Event} e - The click event on the body.
     */

    _onBodyClick(e){

        // target click
        let target = e.target;

        // get triggers related to this toggle
        let triggers = this._manager.getTriggersForToggle(this),
            elements = [this._element],
            inside = false;

        // add elements of triggers to 'elements' array
        triggers.forEach((t) => elements.push(t.getElement()));

        // check if click is on toggle or on triggers
        elements.forEach((el) => {
            if(Helpers.isChildOf(target, el) && !inside){
                inside = true;
            };
        });

        if(!inside && this.isActive()){
            this.deactivate();
        }

    }

    /**
     * Listen to hash-change events.
     * @param {Event} e - The HashChange-event thrown by the browser.
     */

    _onHashChange(e){

        var hash = window.location.hash.replace('#', ''),
            oldHash = e.oldURL.substr(e.oldURL.indexOf('#')).replace('#', '');

        if(hash === this.getId() && !this.isActive()){
            this.activate();
        }

        if(oldHash === this.getId() && this.isActive()){
            this.deactivate();
        }

    }

}
