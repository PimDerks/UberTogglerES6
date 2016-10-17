'use strict';

import Mediator from "../utils/Mediator";
import Manager from "./Manager";
import Toggle from "./Toggle";
import Trigger from "./Trigger";
import TriggerInput from "./TriggerInput";
import TriggerLink from "./TriggerLink";
import TriggerInputChoice from "./TriggerInputChoice";
import TriggerInputSelect from "./TriggerInputSelect";


export default class Factory {

    constructor(element, options){

        this._element = element;
        this._options = options;
        this._manager = Manager;
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

    _getOption(key, options){

        if(options && options.hasOwnProperty(key)){
            return options[key];
        }

        if(this._element.dataset[key]){
            let attr = this._element.dataset[key];
            switch(attr) {
                case 'true':
                    return true;
                    break;
                case 'false':
                    return false;
                    break;
                default:
                    return attr;
            }
        }

        return null;

    }

    _getOptions(options){

        let optionKeys = ['outside', 'focus', 'focusContain', 'focusExclude', 'group', 'activateOnly', 'ariaHidden', 'ariaDisabled', 'ariaExpanded', 'ariaPressed', 'ariaChecked'],
            results = {}

        optionKeys.forEach(option => {
            // try to get option
            var result = this._getOption(option, options);
            if(result){
                results[option] = result;
            }
        });

        return results;

    }

    _create(node, options = {}){

        let name = node.nodeName.toLowerCase(),
            toggle;

        // merge options
        options = this._getOptions(options);

        // check if this node is already a trigger
        if(node.id && this._manager.getToggleById(node.id)){
            return;
        }

        // console.log('create toggle for element #', node.id);


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
                if(node.hasAttribute('href') || node.hasAttribute('aria-controls') || node.nodeName.toLowerCase() === 'button') {
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
