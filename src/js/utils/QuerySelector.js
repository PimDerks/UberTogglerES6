'use strict';

module.exports = function $$(selector, context) {
    return [].slice.call((context || document).querySelectorAll(selector));
}