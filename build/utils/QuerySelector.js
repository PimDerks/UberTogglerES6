'use strict';

module.exports = function $$(selector) {
    var context = arguments.length <= 1 || arguments[1] === undefined ? document : arguments[1];

    return [].slice.call(context.querySelectorAll(selector));
};