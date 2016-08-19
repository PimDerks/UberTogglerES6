'use strict';

import Mediator from "../utils/Mediator";

export default class Group {

    constructor(id){

        // Set ID of group
        this._id = id;

        // Create property to keep track of all toggles inside this group
        this._toggles = [];

        // Initialize the group
        this._initialize();

    }

    /**
     * Initialize this group.
     *
     * @private
     */

    _initialize(){

        this._mediator = Mediator;
        this._onToggleBind = this._onToggle.bind(this);
        this._mediator.subscribe('toggle', this._onToggleBind);

    }

    /**
     * Respond to the toggle-event.
     *
     * @param e
     * @private
     */

    _onToggle(e){

        let toggle = e.toggle;

        if(this.containsToggle(toggle)){

            if(e.active){
                this._closeAllExcept(toggle);
            } else if(!this.getActiveToggle() && this._default){
                this._default.activate();
            }

        }

    }

    /**
     * Register a toggle
     *
     * @memberof ToggleGroup
     * @param {Object} Toggle
     * @public
     */

    register(Toggle){

        // add
        this._toggles.push(Toggle);

    }

    /**
     * Get the ID of this group.
     *
     * @returns {String}
     */

    getId(){
        return this._id;
    }

    /**
     * Get all Toggles in this group.
     *
     * @returns {Array}
     */

    getToggles(){
        return this._toggles;
    }

    /**
     * Check if one of the Toggles in this group is active.
     *
     * @returns {boolean}
     */

    hasActiveToggle(){
        return this._toggles.filter(t => {
            return t.isActive();
        }).length > 0;
    }

    /**
     * Get the currently active Toggle.
     *
     * @returns {*} Toggle object when a toggle is active. Otherwise false.
     */

    getActiveToggle(){
        var active = this._toggles.filter(function(t){
            return t.isActive();
        });
        return active[0] || false;
    }

    /**
     * Keep track of the currently active Toggle.
     *
     * @param Toggle
     */

    setActiveToggle(Toggle){
        this._activeToggle = Toggle;
    }

    /**
     * Check if the passed in Toggle is contained in this group.
     *
     * @param Toggle
     * @returns {boolean}
     */

    containsToggle(Toggle){
        return this._toggles.indexOf(Toggle) > -1;
    }

    /**
     * Remove a toggle
     *
     * @memberof ToggleGroup
     * @param {Object} Toggle
     */

    remove(Toggle) {

        this._toggles.forEach(t, i => {

            if (t == Toggle) {
                this._toggles.splice(i, 1);
                return;
            }

        });

    }

    /**
     * Close all toggles.
     *
     * @param {Object} Toggle
     * @private
     */

    _closeAll(){

        this._toggles.forEach(t => {
            if(t.isActive()){
                t.deactivate();
            }
        });

    }

    /**
     * Close all toggles except the given Toggle.
     * @param {Object} Toggle
     * @private
     */

    _closeAllExcept(Toggle){

        this._toggles.forEach(t => {

            // deactivate
            if (t !== Toggle && t.isActive()) {
                t.deactivate();
            }

        });

        this.setActiveToggle(Toggle);

    }

    /**
     * Get the size of this group.
     * @return {Number} The number of items.
     */

    getSize() {
        return this._toggles.length;
    }

    /**
     * Unload.
     *
     * @method unload
     */

    unload() {

        // Empty array
        this._toggles = [];

    }
    
}