'use strict';

var $$ = require('./QuerySelector');

const focusableElements = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

module.exports = class Focus {

    constructor(element){
        this._element = element;
        this._initialize();
    }

    _initialize() {
        this._maintainFocusBind = this._maintainFocus.bind(this);
        this._onKeyDownBind = this._onKeyDown.bind(this);
        this._onClickContainBind = this._onClickContain.bind(this);
        this._onClickExcludeBind = this._onClickExclude.bind(this);
        this._onFocusBind = this._onFocus.bind(this);
    }

    _onFocus() {
        if (this._focusedBefore) {
            this._focusedBefore.focus();
        }
    }

    _bindContain(unbind) {
        let method = unbind ? 'removeEventListener' : 'addEventListener';
        document.body[method]('focus', this._maintainFocusBind, true);
        document.body[method]('keydown', this._onKeyDownBind, true);
        document.body[method]('click', this._onClickContainBind, true);
    }

    _bindExclude(unbind){
        let method = unbind ? 'removeEventListener' : 'addEventListener';
        document.body[method]('click', this._onClickExcludeBind, true);
    }

    _onClickContain(e){

        // the target of the event
        let target = e.target;

        // check if target is inside of element
        while(target != this._element && target.parentNode){
            target = target.parentNode;
        }

        // outside of element, cancel click
        if (target !== this._element){
            e.preventDefault();
            e.stopPropagation();
        }

    }

    _onClickExclude(e){

        // the target of the event
        let target = e.target;

        // check if target is inside of element
        while(target != this._element && target.parentNode){
            target = target.parentNode;
        }

        // outside of element, cancel click
        if (target === this._element){
            e.preventDefault();
            e.stopPropagation();
        }

    }


    _onKeyDown(e) {
        if (this.isActive() && e.which === 9) {
            this._trapTabKey(this._element, e);
        }
    }

    _getFocusableElements() {
        return $$(focusableElements.join(','), this._element).filter(function (child) {
            return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
        });
    }

    _setFocusToFirstElement() {
        let focusableChildren = this._getFocusableElements();
        if (focusableChildren.length) {
            focusableChildren[0].focus();
        }
    }

    _toggleFocusableChildren(enable){

        let focusableChildren = this._getFocusableElements();
        let context = this;
        if (focusableChildren.length) {
            focusableChildren.forEach(f => {

                if(f.disabled == undefined) {
                    f.setAttribute('tabindex', enable ? '' : -1);
                } else {
                    f.disabled = !enable;
                }

                let method = enable ? 'removeEventListener' : 'addEventListener';
                f[method]('focus', this._onFocusBind);

            })
        }
    }

    _maintainFocus(e) {
        if (this.isActive() && !this._element.contains(event.target)) {
            this._setFocusToFirstElement();
        }
    }

    _trapTabKey(node, event) {
        let focusableChildren = this._getFocusableElements(node);
        let focusedItemIndex = focusableChildren.indexOf(document.activeElement);

        if (event.shiftKey && focusedItemIndex === 0) {
            focusableChildren[focusableChildren.length - 1].focus();
            event.preventDefault();
        } else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
            focusableChildren[0].focus();
            event.preventDefault();
        }

    }

    isActive() {
        return this._active;
    }

    exclude() {

        // catch clicks
        this._bindExclude();

        this._focusedBefore = document.activeElement;

        // disable children
        this._toggleFocusableChildren(false);

    }

    contain() {
        this._active = true;
        this._focusedBefore = document.activeElement;
        this._bindContain();
        this._setFocusToFirstElement();
    }

    disableContain() {
        this._active = false;
        this._bindContain(true);

        if (this._focusedBefore) {
            this._focusedBefore.focus();
        }
    }

    disableExclude() {

        // catch clicks
        this._bindExclude(false);

        // disable children
        this._toggleFocusableChildren(true);

    }

}