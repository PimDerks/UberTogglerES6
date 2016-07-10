require('babel-core/register');

var Focus = require('./utils/Focus'),
    Toggle = require('./lib/Factory'),
    $$ = require('./utils/QuerySelector');

// focus contain test
var contain = document.getElementById('contain');
var enableContain = document.getElementById('enable-contain');
var disableContain = document.getElementById('disable-contain');
var focus = new Focus(contain);
enableContain.addEventListener('click', function(){ focus.contain(); });
disableContain.addEventListener('click', function(){ focus.disableContain(); });

// focus exclude test
var exclude = document.getElementById('exclude')
var excludeFocus = new Focus(exclude);
var enableExclude = document.getElementById('enable-exclude');
var disableExclude = document.getElementById('disable-exclude');
enableExclude.addEventListener('click', function(){ excludeFocus.exclude() });
disableExclude.addEventListener('click', function(){ excludeFocus.disableExclude(); });

// create Toggles
var toggles = $$('.toggle');
toggles.forEach(t => {
    "use strict";
    new Toggle(t);
});

// dynamic toggles
var button = document.getElementById('add-toggle');
button.addEventListener('click', function(){

    // id
    var id = 'toggle-dynamic-group-' + Math.random().toString(36).substring(7);

    // create toggle
    var toggle = document.createElement('div');
    toggle.href = '#toggle-dynamic';
    toggle.innerHTML = 'Toggle ' + new Date() + ')';
    toggle.id = id;
    toggle.setAttribute('data-group', 'dynamic');

    // create trigger
    var trigger = document.createElement('button');
    trigger.setAttribute('aria-controls', id);
    trigger.innerHTML = 'Trigger (Dynamically generated at ' + new Date() + ')';

    // append
    document.getElementById('dynamic-toggles').appendChild(toggle);
    document.getElementById('dynamic-buttons').appendChild(trigger);

    // create trigger and toggle
    new Toggle(toggle);
    new Toggle(trigger);

});


var button = document.getElementById('add-trigger');
button.addEventListener('click', function(){

    // create trigger
    var trigger = document.createElement('a');
    trigger.href = '#toggle-dynamic';
    trigger.innerHTML = 'Trigger (Dynamically generated at ' + new Date() + ')';

    // append
    button.parentNode.insertBefore(trigger, button);

    // create trigger
    new Toggle(trigger);

});
