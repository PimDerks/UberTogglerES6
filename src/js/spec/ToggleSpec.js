'use strict';

import Factory from "../lib/Factory.js";

var fullToggle,
    fullToggleNode = document.createElement('div');
    fullToggleNode.className = 'full';
    fullToggleNode.setAttribute('data-active', "true");
    fullToggleNode.id = 'full';
    fullToggle = new Factory(fullToggleNode, {
        ariaHidden: true,
        ariaDisabled: true,
        ariaExpanded: true,
        ariaPressed: true,
        ariaChecked: true
    }).getToggle();

var trigger,
    triggerNode = document.createElement('button');
    triggerNode.setAttribute('aria-controls', 'full');
    trigger = new Factory(triggerNode).getToggle();

var bareToggle,
    bareToggleNode = document.createElement('div');
    bareToggleNode.className = 'bare';
    bareToggleNode.setAttribute('data-active', "false");
    bareToggle = new Factory(bareToggleNode, {
        ariaHidden: false,
        ariaDisabled: false,
        ariaExpanded: false,
        ariaPressed: false,
        ariaChecked: false
    }).getToggle();

var beforeEach = function(){
    fullToggle.register();
    fullToggle.update();
    bareToggle.register();
    bareToggle.update();
};

describe('Initial setup', function() {

    var actual,
        expected;

    beforeEach(beforeEach);

    it('should add an ID to the node when it does not exist', function(){
        actual = bareToggle.getElement().id !== '';
        expect(actual).toEqual(true);
    });

    it('should not add an ID to the node when it does already exist', function(){
        actual = fullToggle.getElement().id;
        expected = 'full';
        expect(actual).toEqual(expected);
    });

    it('should add an aria-hidden attribute when that option is set to true', function() {
        actual = fullToggle.getElement().getAttribute('aria-hidden');
        expect(actual).not.toBe(null);
    });

    it('should not add an aria-hidden attribute when that option is set to false', function() {
        actual = bareToggle.getElement().getAttribute('aria-hidden');
        expect(actual).toBe(null);
    });

    it('should add an aria-expanded attribute when that option is set to true', function() {
        actual = fullToggle.getElement().getAttribute('aria-expanded');
        expect(actual).not.toBe(null);
    });

    it('should not add an aria-expanded attribute when that option is set to false', function() {
        actual = bareToggle.getElement().getAttribute('aria-expanded');
        expect(actual).toBe(null);
    });

    it('should add an aria-disabled attribute when that option is set to true', function() {
        actual = fullToggle.getElement().getAttribute('aria-disabled');
        expect(actual).not.toBe(null);
    });

    it('should not add an aria-disabled attribute when that option is set to false', function() {
        actual = bareToggle.getElement().getAttribute('aria-disabled');
        expect(actual).toBe(null);
    });

    it('should add an aria-pressed attribute when that option is set to true', function() {
        actual = fullToggle.getElement().getAttribute('aria-pressed');
        expect(actual).not.toBe(null);
    });

    it('should not add an aria-pressed attribute when that option is set to false', function() {
        actual = bareToggle.getElement().getAttribute('aria-pressed');
        expect(actual).toBe(null);
    });

    it('should add an aria-checked attribute when that option is set to true', function() {
        actual = fullToggle.getElement().getAttribute('aria-checked');
        expect(actual).not.toBe(null);
    });

    it('should not add an aria-checked attribute when that option is set to false', function() {
        actual = bareToggle.getElement().getAttribute('aria-checked');
        expect(actual).toBe(null);
    });

});

describe('Options/configuration', function(){

    var actual,
        expected;

    it('should have a default, configured inside the module', function(){
        actual = bareToggle._options['outside'];
        expected = false;
        expect(actual).toBe(expected);
    });

    it('passed in to the constructor overwrite the default configuration', function(){

        expected = true;

        var options = {
            outside: true
        }
        // Overwrite via constructor
        var newToggle,
            newToggleNode = document.createElement('div');
            newToggle = new Factory(newToggleNode, options).getToggle();

        // Test constructor overwrite
        actual = newToggle._options['outside'];

        expect(actual).toBe(expected);

    });

    it('passed in via the DOM overwrite the default configuration', function(){

        expected = true;

        // Create new node
        var newToggle,
            newToggleNode = document.createElement('div');

        // Try overwrite via DOM
        newToggleNode.setAttribute('data-outside', "true");
        newToggle = new Factory(newToggleNode).getToggle();

        var actual = newToggle._options['outside'];

        expect(actual).toBe(expected);

    });

    it('passed in via the constructor overwrite the DOM/default configuration', function(){

        expected = true;

        // Create new node
        var newToggle,
            newToggleNode = document.createElement('div');

        // Overwrite via constructor
        var options = {
            outside: true
        };

        // Try overwrite via DOM
        newToggleNode.setAttribute('data-outside', "lorem");
        newToggle = new Factory(newToggleNode, options).getToggle();

        var actual = newToggle._options['outside'];

        expect(actual).toBe(expected);

    });

});

describe('State management', function(){

    beforeEach(beforeEach);

    var checkAttribute = function(toggle, attr, reverse){

        // first check
        var initial = (reverse ? !toggle.isActive() : toggle.isActive()) + '',
            at = toggle.getElement().getAttribute(attr);
        expect(at).toBe(initial);

        // update toggle
        toggle.activate();

        // 2nd check
        var final = (reverse ? !toggle.isActive() : toggle.isActive()) + '',
            at = toggle.getElement().getAttribute(attr);
        expect(at).toBe(final);

    };

    it('should update the data-active attribute when toggled', function(){
        checkAttribute(fullToggle, 'data-active');
    });

    it('should update the aria-hidden attribute (when that option is set to true) when toggled', function() {
        checkAttribute(fullToggle, 'aria-hidden', true);
    });

    it('should update the aria-expanded attribute (when that option is set to true) when toggled', function() {
        checkAttribute(fullToggle, 'aria-expanded');
    });

    it('should update the aria-disabled attribute (when that option is set to true) when toggled', function() {
        checkAttribute(fullToggle, 'aria-disabled', true);
    });

    it('should update the aria-pressed attribute (when that option is set to true) when toggled', function() {
        checkAttribute(fullToggle, 'aria-pressed');
    });

    it('should update the aria-checked attribute (when that option is set to true) when toggled', function() {
        checkAttribute(fullToggle, 'aria-checked');
    });

});

describe('JavaScript API', function() {

    beforeEach(beforeEach);

    it('should deactivate with the JavaScript API', function() {

        // set to disabled
        fullToggle.activate();
        expect(fullToggle.isActive()).toBe(true);

        // set to enabled
        fullToggle.deactivate();
        expect(fullToggle.isActive()).toBe(false);

    });

    it('should activate with the JavaScript API', function() {

        // set to disabled
        fullToggle.deactivate();
        expect(fullToggle.isActive()).toBe(false);

        // set to enabled
        fullToggle.activate();
        expect(fullToggle.isActive()).toBe(true);

    });

});

describe('DOM API', function() {

    beforeEach(beforeEach);

    it('should initially be activated with the DOM API\'s data-active attribute set to true', function() {
        expect(fullToggle.isActive()).toBe(true);
    });

    it('should initially be deactivated with the DOM API\'s data-active attribute set to false', function() {
        expect(bareToggle.isActive()).toBe(false);
    });

});