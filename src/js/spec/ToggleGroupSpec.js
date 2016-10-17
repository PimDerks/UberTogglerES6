'use strict';

import Factory from "../lib/Factory.js";
import Group from "../lib/Group.js";
import Manager from "../lib/Manager";

var createToggle = function(group){
    var toggleNode = document.createElement('div');
    toggleNode.className = 'bare';
    toggleNode.setAttribute('data-group', group)
    return new Factory(toggleNode).getToggle();
};

var newToggle1 = createToggle('group'),
    newToggle2 = createToggle('group'),
    newToggle3,
    newGroup;

describe('A Toggle Group', function() {

    var actual,
        expected;

    beforeEach(
        function(done){
            setTimeout(() => {
                newGroup = Manager.getToggleGroupById('group');
                done();
            });
        }
    );

    it('should allow a Toggle to be added', function(done){
        newToggle3 = createToggle('group');
        expected = 3;
        setTimeout(function(){
            actual = newGroup.getSize();
            expect(actual).toBe(expected);
            done();
        });
    });

    it('should allow a Toggle to be removed', function(done){
        newGroup.remove(newToggle3);
        expected = 2;
        setTimeout(function(){
            actual = newGroup.getSize();
            expect(actual).toBe(expected);
            done();
        });
    });

    it('should be able to return an array of the Toggles it contains', function(){
        expected = true;
        actual = Array.isArray(newGroup.getToggles());
        expect(actual).toBe(expected);
    });

    it('should be able to say how many Toggles it contains', function(){
        expected = 2;
        actual = newGroup.getSize();
        expect(actual).toBe(expected);
    });

    it('should only allow one Toggle to be active at any given time', function(){

        // initial
        var initial = newGroup.getActiveToggles().length;

        // activate two toggles
        newToggle1.activate();
        newToggle2.activate();

        // final
        var final = newGroup.getActiveToggles().length;

        expect(initial).toBe(0);
        expect(final).toBe(1);

    });

    it('should be able to say if a Toggle is part of it: Toggle is not part of it)', function(done){
        expected = false;
        var toggle = createToggle('lorem-ipsum');
        setTimeout(function(){
            actual = newGroup.containsToggle(toggle);
            expect(actual).toBe(expected);
            done();
        });
    });

    it('should be able to say if a Toggle is part of it: Toggle is part of it', function(done){
        expected = true;
        var toggle = createToggle('group');
        setTimeout(function(){
            actual = newGroup.containsToggle(toggle);
            expect(actual).toBe(expected);
            done();
        });
    });

    it('should be able to close/deactivate all its Toggles', function(){

        // initially close all
        newGroup._closeAll();

        // initial
        var initial = newGroup.getActiveToggles().length;

        // activate two toggles
        newToggle1.activate();
        newToggle2.activate();

        // temp
        var temp = newGroup.getActiveToggles().length;

        newGroup._closeAll();

        // final
        var final = newGroup.getActiveToggles().length;

        expect(initial).toBe(0);
        expect(temp).toBe(1);
        expect(final).toBe(0);

    });


});