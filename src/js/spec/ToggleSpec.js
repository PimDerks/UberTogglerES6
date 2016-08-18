'use strict';

var toggle = require('../lib/Factory.js');

var b = true;

describe('A Toggle', function() {

    it('should become activated when it is toggled and it is currently deactivated', function() {
        expect(b).toEqual(true);
    });

    it('should become deactivated when it is toggled and it is currently activated', function() {
        expect(b).toEqual(true);
    });

    it('should become deactivated when a click is triggered outside of it and it is currently active', function() {
        expect(b).toEqual(true);
    });

    it('should become activated when a hash-change event occurs with the new hash being its ID', function() {
        expect(b).toEqual(true);
    });

    it('should become activated when it is toggled and it is currently deactivated', function() {
        expect(b).toEqual(true);
    });

    it('should NOT become deactivated when it is toggled and it is currently activated', function() {
        expect(b).toEqual(true);
    });


});