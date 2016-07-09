'use strict';

var Mediator = require('../utils/Mediator'),
    Manager = require('./Manager');

const defaultOptions = {
    outside: false,
    focus: true
}

module.exports = class Toggle {

    constructor(element, options) {

        this._element = element;
        this._options = this._mergeOptions(options);

        // methods for easy (un)binding
        this._onTriggerBind = this._onTrigger.bind(this);
        this._onHashChangeBind = this._onHashChange.bind(this);
        this._onBodyClickBind = this._onBodyClick.bind(this);
        this._onMouseEnterBind = this._onMouseEnter.bind(this);
        this._onMouseLeaveBind = this._onMouseLeave.bind(this);

        // initialize toggle
        this._initialize();

    }

    /**
     * Merge options. First use options-object passed in to constructor, then DOM API, then defaults.
     * @param {Object} options - Options passed to constructor.
     * @return {Object} The final options.
     * @private
     */

    _mergeOptions(options = {}){

        // Close on click outside?
        var outside = options.outside || this._element.dataset.outside || defaultOptions.outside;

        // Contain focus when active AND exclude focus when not active
        var focus = options.focus || this._element.dataset.focus || defaultOptions.focus;

        return {
            outside: outside,
            focus: focus
        }
    }

    /**
     * Initialize the Toggle
     * @private
     */

    _initialize() {

        // Set ID of Toggle
        this._setId();

        // Set local private property
        this._id = this.getId();

        // Get instance of the Mediator
        this._mediator = Mediator.getInstance();

        // Get instance of the Manager
        this._manager = Manager.getInstance();

        // Bind events
        this._bind(true);

        // Register toggle
        setTimeout(() => {
            this.register();
        });

    }

    /**
     * Get the ID of this Toggle.
     *
     * @returns {String} - The ID of the Toggle.
     */

    getId() {
        return this._id;
    }

    /**
     * Set the ID of this Toggle.
     * @private
     */

    _setId() {
        let id = this._element.id;
        if (!id) {
            id = Math.random().toString(36).substring(7);
            this._element.setAttribute('id', id);
        }
        this._id = id;
    }

    /**
     *
     * @param {Boolean} bind - Bind or unbind.
     * @private
     */

    _bind(bind = true){

        let method = bind ? 'addEventListener' : 'removeEventListener';

        // Listen to toggle-event
        if(method){
            this._mediator.subscribe('trigger', this._onTriggerBind);
        } else {
            this._mediator.unsubscribe('trigger', this._onTriggerBind);
        }

        // Listen to hashchange
        window[method]('hashchange', this._onHashChangeBind, false);

        // Listen to click event on body
        if(this._element.dataset.outside){

            if(this._element.dataset.outside === 'both' || this._element.dataset.outside === 'click') {
                document.body[method]('click', this._onBodyClickBind);
            }

            if(this._element.dataset.outside === 'both' || this._element.dataset.outside === 'mouse') {
                this._element[method]('mouseenter', this._onMouseEnterBind);
                this._element[method]('mouseleave', this._onMouseLeaveBind);
            }
        }

    }

    /**
     * Register the toggle
     */

    register(){

        // register
        this._manager.add(this);

        // get initial state
        this._isActive = this._getState();

        // set initial state
        this.isActive() ? this.activate() : this.deactivate();

    }


    /**
     * Get the element of this Toggle.
     *
     * @returns {Element}
     */

    getElement(){
        return this._element;
    }

    /**
     * Get the group of this Toggle, if available.
     *
     * @returns {String} The group this Toggle belongs to.
     */

    getGroup(){
        return this._element.dataset.group;
    }

    /**
     * Let the world know this Toggle's state has changed.
     *
     * @private
     */

    _onStateChange(){

        // Publish event
        this._mediator.publish('toggle', {
            toggle: this,
            id: this.getId(),
            active: this.isActive()
        });

        // Update state
        this._setState();

    }

    /**
     * Activate this Toggle.
     */

    activate(){
        this._element.classList.add('activated');
        this._element.classList.remove('deactivated');
        this._isActive = true;
        this._onStateChange();

        if(this._element.dataset.outside === 'mouse' || this._element.dataset.outside === 'both'){
            this._startMouseTimer(1000);
        }
    }

    /**
     *  Deactivate this Toggle.
     */

    deactivate(){
        this._element.classList.remove('activated');
        this._element.classList.add('deactivated');
        this._isActive = false;
        this._onStateChange();
    }

    /**
     * Set the state of this toggle.
     * @private
     */

    _setState(){

        // check if aria-hidden is available
        if(this._element.getAttribute('aria-hidden')){
            this._element.setAttribute('aria-hidden', !this.isActive());
            // check if aria-disabled is available
        } else if(this._element.getAttribute('aria-disabled')){
            this._element.setAttribute('aria-disabled', !this.isActive());
            // default
        } else {
            this._element.setAttribute('data-active', this.isActive());
        }

    }

    /**
     * Get the current state of this Toggle.
     * @return {Boolean} Active or not active.
     */

    _getState(){

        // first check if one of the triggers is active
        if(this.hasActiveTrigger() || this.hasActiveHash()){
            return true;
            // check if aria-hidden is available
        } else if(this._element.getAttribute('aria-hidden')){
            return this._element.getAttribute('aria-hidden') === "false";
            // check if aria-disabled is available
        } else if(this._element.getAttribute('aria-disabled')){
            return this._element.getAttribute('aria-disabled') === "false";
            // default
        } else {
            return this._element.getAttribute('data-active') === "true";
        }

        // default
        return false;

    }

    /**
     * Check if this Toggle is active.
     *
     * @returns {boolean}
     */

    isActive(){
        return this._isActive;
    }

    /**
     * Reverse the state of this Toggle.
     * @param {Event} e - Event.
     */

    toggle(e){

        let activate = this.isActive();

        if(e && e.force){
            activate = e.active;
        }

        activate ? this.deactivate() : this.activate();

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
     * Sync the state of this Toggle with the given parameter.
     *
     * @param {Boolean} active - Activate or deactivate toggle.
     * @private
     */

    sync(active){

        if(active !== this.isActive()){
            this.toggle();
        }

    }

    /**
     * Check if this Toggle is a trigger as well. Will be overwritten in subclasses.
     * @return false - by default a Toggle cannot be a trigger.
     */

    isTrigger(){
        return false;
    }

    /**
     * Check if the hash in the URL is the ID of this Toggle.
     * @return {Boolean}
     */

    hasActiveHash(){
        var hash = window.location.hash.replace('#','');
        return hash === this.getId();
    }

    /**
     * Check if one of the triggers for this Toggle is active.
     * @return {Boolean}
     */

    hasActiveTrigger(){

        // check if one of the triggers for this toggle is active
        var triggers = this._manager.getTriggersForToggle(this),
            active = false;

        // loop through all triggers
        triggers.forEach(function(t){
            if(!active){
                active = t.isActive();
            }
        });

        return active;

    }

    /**
     * Respond to a toggle-event.
     *
     * @param {Event} e - The Trigger event.
     * @private
     */

    _onTrigger(e){

        if(this.getGroup() && this.isActive() && this.eventMatch(e)){
            return;
        }

        if(this.eventMatch(e)){
            this.toggle(e);
        }

    }

    /**
     * Start the timer when the mouse leaves the element
     */

    _onMouseLeave(){
        this._startMouseTimer();
    }

    /**
     * When the mouse leaves the Toggle, start a timer to close the Toggle after $delay.
     * @param {Number} delay - The time to wait to close the Toggle.
     */

    _startMouseTimer(delay){

        if(!delay){
            delay = 500;
        }

        // start timer
        this._mouseTimer = setTimeout(() => {
            this.deactivate();
        }, delay);

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
        var target = e.target;

        // get triggers related to this toggle
        var triggers = this._manager.getTriggersForToggle(this),
            elements = [this._element],
            inside = false;

        // add elements of triggers to 'elements' array
        triggers.forEach(function(t){
            elements.push(t.getElement());
        });

        var isChildOf = function (element, parentElement) {
            var parent = element;
            do {

                if (parent && parent === parentElement) {
                    return true;
                }

                if (parent == document.documentElement) {
                    break;
                }

                // jshint -W084
            } while (parent = parent.parentNode);
            return false;
        };

        // check if click is on toggle or on triggers
        elements.forEach(function(el){

            if(isChildOf(target, el) && !inside){
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

        if(hash === this.getId()){
            this.isActive() ? null : this.activate();
        }

        if(oldHash === this.getId()){
            this.isActive() ? this.deactivate() : null;
        }

    }

}