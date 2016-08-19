'use strict';

export default function $$(selector, context = document) {
    return [].slice.call(context.querySelectorAll(selector));
}