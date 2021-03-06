'use strict';

import Mediator from "../utils/Mediator";
import Focus from "../utils/Focus";
import Helpers from '../utils/Helpers';
import Manager from "./Manager";
import $$ from "../utils/QuerySelector";

const focusableElements = Helpers.focusableElements;

const attributesToRestore = ['aria-hidden', 'aria-disabled', 'aria-expanded', 'aria-pressed', 'aria-checked', 'aria-current', 'data-active', 'class'];
const attributesCached = {};

export default class ToggleBase {

    constructor(element, options) {

        this._element = element;
        this._options = Object.assign(this._getDefaults(), options);

        // Set ID of Toggle
        this._setId();

        // Set local private property
        this._id = this.getId();

        // Get instance of the Mediator
        this._mediator = Mediator;

        // Get instance of the Manager
        this._manager = Manager;

        // Shortcuts for events
        this._shortcuts = this._getShortcuts();

        // Save initial attributes
        this._saveInitialAttributes();

        // initialize toggle
        this._initialize();

    }

    _saveInitialAttributes(){
        attributesToRestore.forEach(a => {
            let getAttr = this._element.getAttribute(a);
            if(getAttr) {
                attributesCached[a] = getAttr;
            }
        });
    }

    _restoreInitialAttributes(){
        attributesToRestore.forEach(a => {
            let getAttr = attributesCached[a];
            if(getAttr){
                this._element.setAttribute(a, getAttr);
            } else {
                this._element.removeAttribute(a);
            }
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
     * Get object of booleans for the default configuration for this module.
     * @return {Object}
     * @private
     */

    _getDefaults(){

        return {
            outside: false,
            focus: false,
            focusContain: false,
            focusExclude: false,
            group: false,
            activateOnly: false,
            ariaCurrent: false,
            ariaHidden: false,
            ariaDisabled: false,
            ariaExpanded: false,
            ariaPressed: false,
            ariaChecked: false,
        }

    }

    /**
     * Get object of methods, for easy binding and unbinding.
     * @return {Object}
     * @private
     */

    _getShortcuts(){

        return {
            'trigger': this._onTrigger.bind(this),
            'toggle': this._onToggle.bind(this),
            'hashchange': this._onHashChange.bind(this),
            'bodyclick': this._onBodyClick.bind(this),
            'mouseenter': this._onMouseEnter.bind(this),
            'mouseleave': this._onMouseLeave.bind(this),
            'change': this._onChange.bind(this),
            'click': this._onClick.bind(this),
            'keydown': this._onKeyDown.bind(this)
        }

    }

    /**
     *
     * @param {Boolean} bind - Bind or unbind.
     * @private
     */

    _bind(bind = true){

        // Listen to native events
        var method = bind ? 'addEventListener' : 'removeEventListener';

        // Listen to hashchange
        window[method]('hashchange', this._shortcuts.hashchange, false);
        this._element[method]('click', this._shortcuts.click);
        this._element[method]('change', this._shortcuts.change);
        this._element[method]('keydown', this._shortcuts.keydown);

        // Listen to click event on body
        if(this._options.outside){

            if(this._options.outside || this._options.outside === 'both' || this._options.outside === 'click') {
                document.body[method]('click', this._shortcuts.bodyclick);
            }

            if(this._options.outside === 'both' || this._options.outside === 'mouse') {
                this._element[method]('mouseenter', this._shortcuts.mouseenter);
                this._element[method]('mouseleave', this._shortcuts.mouseleave);
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
     * Get a list of focusable element in the current node.
     * @returns {*}
     * @private
     */

    _getFocusableElements() {
        return $$(focusableElements.join(','), this._element).filter(function (child) {
            return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
        });
    }

    /**
     * Activate this Toggle.
     */

    activate(){

        if(!this.isActive()){

            this._isActive = true;
            this.update();

            if(this._options.outside === 'mouse' || this._options === 'both'){
                this._startMouseTimer(1000);
            }

            if(this._options.focus){
                let children = this._getFocusableElements();
                if(children[0]){
                    children[0].focus();
                }
            }

        }

    }

    /**
     *  Deactivate this Toggle.
     */

    deactivate(){

        if(this.isActive()){
            this._isActive = false;
            this.update();
        }

    }

    /**
     * Set the state of this toggle.
     * @private
     */

    update(){

        // Publish event
        this._mediator.publish('toggle', {
            toggle: this,
            id: this.getId(),
            active: this.isActive()
        });

        // Set aria-hidden state
        if(this._options.ariaHidden){
            this._element.setAttribute('aria-hidden', !this.isActive());
        }

        // Set aria-current state
        if(this._options.ariaCurrent){
            this._element.setAttribute('aria-current', this.isActive());
        }

        // Set aria-disabled state
        if(this._options.ariaDisabled){
            this._element.setAttribute('aria-disabled', !this.isActive());
        }

        // Set aria-collapsed state
        if(this._options.ariaExpanded){
            this._element.setAttribute('aria-expanded', this.isActive());
        }

        // Set aria-pressed state
        if(this._options.ariaPressed){
            this._element.setAttribute('aria-pressed', this.isActive());
        }

        // Set aria-checked state
        if(this._options.ariaChecked){
            this._element.setAttribute('aria-checked', this.isActive());
        }

        this._element.setAttribute('data-active', this.isActive());

        // Contain focus
        if(this._options.focusContain){
            if(this.isActive()){
                this._focus.contain();
            } else {
                this._focus.disableContain();
            }
        }

        // Exclude focus
        if(this._options.focusExclude){
            if(this.isActive()){
                this._focus.disableExclude();
            } else {
                this._focus.exclude();
            }
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
        } else if(this._element.dataset.active) {
            return this._element.dataset.active === "true";
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
        return window.location.hash.replace('#','') === this.getId();
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
        triggers.forEach((t) => {
            if(!active){
                active = t.isActive();
            }
        });

        return active;

    }

    /**
     * When the mouse leaves the Toggle, start a timer to close the Toggle after $delay.
     * @param {Number} delay - The time to wait to close the Toggle.
     */

    _startMouseTimer(delay = 500){

        // start timer
        this._mouseTimer = setTimeout(() => {
            this.deactivate();
        }, delay);

    }

    /**
     * Respond to a keydown-event.
     *
     * @param {Event} e - The keydown event.
     * @private
     */

    _onKeyDown(e){
    }

    /**
     * Respond to a click-event.
     *
     * @param {Event} e - The click event.
     * @private
     */

    _onClick(e){
    }

    /**
     * Respond to a change-event.
     *
     * @param {Event} e - The change event.
     * @private
     */

    _onChange(e){

    }

    /**
     * Respond to a trigger-event.
     *
     * @param {Event} e - The Trigger event.
     * @private
     */

    _onTrigger(e){
    }

    /**
     * Respond to a toggle-event.
     *
     * @param {Event} e - The Trigger event.
     * @private
     */

    _onToggle(e){
    }

    /**
     * Start the timer when the mouse leaves the element
     */

    _onMouseLeave(){
    }

    /**
     * When an element is entered by a mouse, clear the timer to close the Toggle.
     */

    _onMouseEnter(){
    }

    /**
     * Close the Toggle when clicked outside.
     * @param {Event} e - The click event on the body.
     */

    _onBodyClick(e){
    }

    /**
     * Listen to hash-change events.
     * @param {Event} e - The HashChange-event thrown by the browser.
     */

    _onHashChange(e) {
    }

    /**
     * Destroy Toggle
     */

    destroy(){

        // unregister
        this._manager.remove(this);

        // remove event listeners
        this._bind(true);

        // restore attributes
        this._restoreInitialAttributes();

    }

}
