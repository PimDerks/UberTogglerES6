require('babel-core/register');

var Focus = require('./utils/Focus'),
    Toggle = require('./lib/Factory'),
    $$ = require('./utils/QuerySelector');

// create Toggles
var toggles = $$('.toggle');
toggles.forEach(t => {
    "use strict";
    new Toggle(t);
});

// dynamic toggles
var button = document.getElementById('add-toggle'),
    count = [].slice.apply(document.getElementById('dynamic-buttons').querySelectorAll('button')).length;
if(button) {
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
        new Toggle(toggle);
        new Toggle(trigger);

    });
}