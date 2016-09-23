'use strict';

import Focus from './utils/Focus';
import $$ from './utils/QuerySelector';
import Factory from './lib/Factory';
import Mediator from './utils/Mediator';

// create Toggles
var toggles = $$('.toggle');
toggles.forEach(t => {
    new Factory(t);
});

// create Toggles
var standalone = $$('.standalone');
standalone.forEach(t => {
    new Factory(t);
});

// dynamic toggles
var button = document.getElementById('add-toggle');
if(button) {
    var count = [].slice.apply(document.getElementById('dynamic-buttons').querySelectorAll('button')).length;
    button.addEventListener('click', function () {

        count++;

        // id
        var id = 'toggle-dynamic-group-' + Math.random().toString(36).substring(7);

        // create toggle
        var toggle = document.createElement('div');
        toggle.href = '#toggle-dynamic';
        toggle.innerHTML = 'Toggle ' + count;
        toggle.id = id;
        toggle.className = 'toggle';
        toggle.setAttribute('data-group', 'dynamic');

        // create trigger
        var trigger = document.createElement('button');
        trigger.setAttribute('aria-controls', id);
        trigger.innerHTML = 'Trigger ' + count;

        // append
        document.getElementById('dynamic-toggles').appendChild(toggle);
        document.getElementById('dynamic-buttons').appendChild(trigger);

        // create trigger and toggle
        new Factory(toggle);
        new Factory(trigger);

    });
}