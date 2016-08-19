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

describe('Initial setup', function() {

    var actual,
        expected;

    beforeEach(function(){
        fullToggle.update();
        bareToggle.update();
    });

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