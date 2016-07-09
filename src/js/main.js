require('babel-core/register');

var Focus = require('./utils/Focus'),
    Toggle = require('./lib/Toggle'),
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