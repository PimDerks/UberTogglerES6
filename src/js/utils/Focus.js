'use strict';

var $$ = require('./QuerySelector');

const focusableElements = ['a[href]', 'area[href]', 'input', 'select', 'textarea', 'button', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

module.exports = class Focus {

    constructor(element){
        this._element = element;
        this._initialize();
    }

    /**
     * Set shortcuts for easy (un)binding of methods.
     * @private
     */

    _initialize() {
        this._maintainFocusBind = this._maintainFocus.bind(this);
        this._onKeyDownBind = this._onKeyDown.bind(this);
        this._onClickContainBind = this._onClickContain.bind(this);
        this._onClickExcludeBind = this._onClickExclude.bind(this);
        this._onFocusBind = this._onFocus.bind(this);
    }

    /**
     *
     * @private
     */

    _onFocus() {
        if (this._focusedBefore) {
            this._focusedBefore.focus();
        }
    }

    /**
     * Bind events for containing focus.
     * @param {Boolean} bind - Bind or unbind.
     * @private
     */

    _bindContain(bind = true) {
        let method = bind ? 'addEventListener' : 'removeEventListener';
        document.body[method]('focus', this._maintainFocusBind, true);
        document.body[method]('keydown', this._onKeyDownBind, true);
        document.body[method]('click', this._onClickContainBind, true);
    }

    /**
     * Bind events for excluding focus.
     * @param {Boolean} bind - Bind or unbind.
     * @private
     */

    _bindExclude(bind = true){
        let method = bind ? 'addEventListener' : 'removeEventListener';
        document.body[method]('click', this._onClickExcludeBind, true);
    }

    /**
     * Catch clicks in a focus-contain scenario.
     * @param {Event} e - Click event.
     * @private
     */

    _onClickContain(e){

        // the target of the event
        let target = e.target;

        // check if target is inside of element
        while(target != this._element && target.parentNode){
            target = target.parentNode;
        }

        // inside of element, cancel click
        if (target !== this._element){
            e.preventDefault();
            e.stopPropagation();
        }

    }

    /**
     * Catch clicks in a focus-exclude scenario.
     * @param e
     * @private
     */

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

    /**
     * Trap tab key.
     * @param {Event} e - Keydown event.
     * @private
     */

    _onKeyDown(e) {
        if (this.isActive() && e.which === 9) {
            this._trapTabKey(this._element, e);
        }
    }

    /**
     * Get a list of focusable element in the current node.
     * @returns {*}
     * @private
     */

    _getFocusableElements() {
        return $$(focusableElements.join(','), this._element).filter(function (child) {
            return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
        });
    }

    /**
     * Set focus to the first focusable element.
     * @private
     */

    _setFocusToFirstElement() {
        let focusableChildren = this._getFocusableElements();
        if (focusableChildren.length) {
            focusableChildren[0].focus();
        }
    }

    /**
     * Enable or disable children.
     * @param {Boolean} enable - Enable of disable.
     * @private
     */

    _toggleFocusableChildren(enable){

        let focusableChildren = this._getFocusableElements();

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

    /**
     * Maintain focus when tabbing to outside context.
     * @param e
     * @private
     */

    _maintainFocus(e) {
        if (this.isActive() && !this._element.contains(event.target)) {
            this._setFocusToFirstElement();
        }
    }

    /**
     * Trap tab-key default behaviour by hacking default focus order.
     * @param node
     * @param event
     * @private
     */

    _trapTabKey(node, event) {
        let focusableChildren = this._getFocusableElements(node),
            focusedItemIndex = focusableChildren.indexOf(document.activeElement);

        if (event.shiftKey && focusedItemIndex === 0) {
            focusableChildren[focusableChildren.length - 1].focus();
            event.preventDefault();
        } else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
            focusableChildren[0].focus();
            event.preventDefault();
        }

    }

    /**
     * Check if the module is active.
     * @returns {Boolean}
     */

    isActive() {
        return this._active;
    }

    /**
     *  Exclude element and its children from focus.
     */

    exclude() {

        // disable contain
        this.disableContain();

        // catch clicks
        this._bindExclude(true);

        this._focusedBefore = document.activeElement;

        // disable children
        this._toggleFocusableChildren(false);

    }


    /**
     *  Contain focus to element and its children.
     */

    contain() {
        this.disableExclude();
        this._active = true;
        this._focusedBefore = document.activeElement;
        this._bindContain(true);
        this._setFocusToFirstElement();
    }

    /**
     * Disable containment of focus.
     */

    disableContain() {
        this._active = false;
        this._bindContain(false);

        if (this._focusedBefore) {
            this._focusedBefore.focus();
        }
    }

    /**
     * Disable excludement of focus.
     */

    disableExclude() {

        // catch clicks
        this._bindExclude(false);

        // disable children
        this._toggleFocusableChildren(true);

    }

}