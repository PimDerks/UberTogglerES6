'use strict';

var Mediator = require('../utils/Mediator'),
    Manager = require('./Manager'),
    Toggle = require('./Toggle'),
    Trigger = require('./Trigger'),
    TriggerInput = require('./TriggerInput'),
    TriggerLink = require('./TriggerLink'),
    TriggerInputChoice = require('./TriggerInputChoice'),
    TriggerInputSelect = require('./TriggerInputSelect');

module.exports = class Factory {

    constructor(element, options){

        this._element = element;
        this._options = options;
        this._manager = Manager.getInstance();
        this._initialize();

    }

    _initialize(){

        // create toggle
        this._toggle = this._create(this._element, this._options);

        // find triggers
        if(this._toggle) {
            this._createTriggersForToggle(this._toggle);
        }

    }

    getToggle(){
        return this._toggle;
    }

    _create(node, options = {}){

        let name = node.nodeName.toLowerCase(),
            toggle;

        // check if this node is already a trigger
        if(node.id && this._manager.getToggleById(node.id)){
            return;
        }

        // check if it's a dialog
        if(node.getAttribute('role') === 'dialog'){
            options.focusContain = true;
        }

        switch(name){
            case 'select':
                toggle = new TriggerInputSelect(node, options);
                break;
            case 'input':
                switch(node.type){
                    case 'radio':
                    case 'checkbox':
                        toggle = new TriggerInputChoice(node, options);
                        break;
                    default:
                        toggle = new TriggerInput(node, options);
                        break;
                }
                break;
            case 'a':
                toggle = new TriggerLink(node, options);
                break;
            default:
                if(node.hasAttribute('href') || node.hasAttribute('aria-controls')) {
                    toggle = new Trigger(node, options);
                    break;
                }
                toggle = new Toggle(node, options);
                break;
        }

        return toggle;

    }

    /**
     * Finds triggers for the given Toggle.
     *
     * @param Toggle
     * @private
     */

    _createTriggersForToggle(Toggle){

        var id = Toggle.getId(),
            triggers = document.querySelectorAll('[href="#' + id + '"], [aria-controls~="' + id + '"]:not(option)');

        // create new toggles
        [].slice.apply(triggers).forEach(t => {
            new Factory(t);
        });

    }

};
