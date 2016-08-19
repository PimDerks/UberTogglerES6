'use strict';

import Factory from "../lib/Factory.js";

var fullToggle,
    fullToggleNode = document.createElement('div');
    fullToggleNode.className = 'full';
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
        checkAttribute(bareToggle, 'data-active');
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

    it('should should deactivate with the JavaScript API', function() {

        // set to disabled
        fullToggle.activate();
        expect(fullToggle.isActive()).toBe(true);

        // set to enabled
        fullToggle.deactivate();
        expect(fullToggle.isActive()).toBe(false);

    });

    it('should should activate with the JavaScript API', function() {

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

    it('should should deactivate with the DOM API', function() {

        // set to enabled
        fullToggle.activate();
        expect(fullToggle.isActive()).toBe(true);

        // click trigger
        trigger.getElement().click();
        expect(fullToggle.isActive()).toBe(false);

    });

    it('should should activate with the DOM API', function() {

        // set to disabled
        fullToggle.deactivate();
        expect(fullToggle.isActive()).toBe(false);

        // click trigger
        trigger.getElement().click();
        expect(fullToggle.isActive()).toBe(true);

    });

});

xdescribe('Focus handling', function(){

    it('should remove elements from the focus order when the focus-exclude option is active', function(){

    });

    it('should trap the focus when the focus-contain option is active', function(){

    });

    it('should receive focus when activated when the focus-option is active', function(){

    });

})