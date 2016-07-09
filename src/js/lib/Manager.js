'use strict';

var _instance;

class Manager {

    constructor(){
        this._toggles = [];
        this._groups = [];
    }

    /**
     * Register toggle
     *
     * @method register
     * @param {Object} Toggle - Instance of Toggle.
     */

    add(Toggle) {

        // add to togglers
        this._toggles.push(Toggle);

        // look for groups
        this._manageGroup(Toggle);

    }

    /**
     * Unregister toggle
     *
     * @param {Object} Toggle - Instance of Toggle.
     */

    remove(Toggle) {

        // check if part of group
        let group = Toggle.getGroup();
        if (group) {

            // check if group exists
            if (this._groups[group]) {
                this._groups[group].remove(Toggle);
            }

        }

        // remove from this._toggles
        this._toggles.forEach(t, i => {
            if (t === Toggle) {
                this._toggles.splice(i, 1);
            }
        });

    }

    /**
     * Get triggers for the given Toggle.
     * @param {Object} Toggle - Instance of Toggle.
     */

    getTriggersForToggle(Toggle){

        return this._toggles.filter(t => {
            if(t.isTrigger() && t._targets){
                return t._targets.indexOf(Toggle.getId()) > -1;
            }
        });

    }

    /**
     * Manage group
     *
     * @param {Object} Toggle object.
     * @private
     */

    _manageGroup(Toggle){

        // check if part of group
        let group = Toggle.getGroup();
        if (group) {

            // check if group exists, if not create
            if (!this._groups[group]) {
                this._groups[group] = new Group(group);
            }

            // register in group
            this._groups[group].register(Toggle);

        }

    }

    /**
     * Get toggle by Id
     *
     * @param {String} Id of toggle to get
     * @return {*} Toggle when found, otherwise false.
     */

    getToggleById(id){

        // loop through all toggles to find the one with the given ID
        let result = this._toggles.filter(t => { return t.getId() === id });

        if(result.length > 0) {
            return result[0];
        } else {
            return false;
        }
    }

    /**
     * Get an instance of the Toggle group with the parsed in id.
     * @param id
     * @returns {*} If found, the group - otherwise false.
     */

    getToggleGroupById(id){

        for (let group in this._groups) {
            if (group === id) {
                return this._groups[group];
            }
        }
        return false;

    }

}

module.exports = {
    getInstance:function(){
        if (!_instance){
            _instance = new Manager();
        }
        return _instance;
    }
};
