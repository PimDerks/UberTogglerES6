'use strict';

module.exports = function $$(selector, context = document) {
    return [].slice.call(context.querySelectorAll(selector));
}