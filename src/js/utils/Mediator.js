'use strict';

let _instance;

class Mediator {

    constructor(){

        if (!_instance) {
            this._topics = {};
            _instance = this;
        }

        return _instance;
    }

    /**
     * Subscribe to an event.
     * @param {String} topic - The event to subscribe to.
     * @param {Function} callback - The function to execute when the event is triggered.
     * @returns {boolean}
     */

    subscribe(topic, callback){
        if(!this._topics.hasOwnProperty(topic)){
            this._topics[topic] = [];
        }

        this._topics[topic].push(callback);
        return true;
    }

    /**
     * Unsubscribe from an event.
     * @param {String} topic - The event to unsubscribe from.
     * @param {Function} callback - The function to unsubscribel
     * @returns {boolean}
     */

    unsubscribe(topic, callback){
        if(!this._topics.hasOwnProperty(topic)){
            return false;
        }

        var _this = this;
        this._topics[topic].forEach(function(t, index){
            if(t === callback){
                _this._topics[t].splice(index, 1);
                return true;
            }
        });

        return false;
    }

    /**
     * Publish an event.
     * @returns {boolean}
     */

    publish(){
        var args = Array.prototype.slice.call(arguments);
        var topic = args.shift();

        if(!this._topics.hasOwnProperty(topic)){
            return false;
        }

        this._topics[topic].forEach(function(t){
            t.apply(undefined, args);
        });

        return true;
    }

}

export default new Mediator;