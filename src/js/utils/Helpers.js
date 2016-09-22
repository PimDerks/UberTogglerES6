export default {

    focusableElements: ['a[href]', 'area[href]', 'input', 'select', 'textarea', 'button', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'],

    isChildOf: function (element, parentElement) {
        var parent = element;
        do {

            if (parent && parent === parentElement) {
                return true;
            }

            if (parent == document.documentElement) {
                break;
            }

            // jshint -W084
        } while (parent = parent.parentNode);
        return false;
    }

}