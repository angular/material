var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;

var Util = {
  /**
   * Checks to see if the element or its parents are disabled.
   * @param element DOM element to start scanning for `disabled` attribute
   * @param limit Number of parent levels that should be scanned; defaults to 4
   * @returns {*} Boolean
   */
  isDisabled : function isDisabled(element, limit) {
    return Util.ancestorHasAttribute( element, 'disabled', limit );
  },
  /**
   * Checks if the specified element has an ancestor (ancestor being parent, grandparent, etc)
   * with the given attribute defined. 
   *
   * Also pass in an optional `limit` (levels of ancestry to scan), default 8.
   */
  ancestorHasAttribute: function ancestorHasAttribute(element, attrName, limit) {
    limit = limit || 4;
    var current = element;
    while (limit-- && current.length) {
      if (current[0].hasAttribute && current[0].hasAttribute(attrName)) {
        return true;
      }
      current = current.parent();
    }
    return false;
  },

  /**
   * Checks if two elements have the same parent
   */
  elementIsSibling: function elementIsSibling(element, otherElement) {
    return element.parent().length && 
      (element.parent()[0] === otherElement.parent()[0]);
  },

  /**
   * Converts snake_case to camelCase.
   * @param name Name to normalize
   */
  camelCase: function camelCase(name) {
    return name.
      replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
      });
  },
  /**
   * Selects 'n' words from a string
   * for use in an HTML attribute
   */
  stringFromTextBody: function stringFromTextBody(textBody, numWords) {
    var string = textBody.trim();

    if(string.split(/\s+/).length > numWords){
      string = textBody.split(/\s+/).slice(1, (numWords + 1)).join(" ") + '...';
    }
    return string;
  },

  /**
   * Spread the arguments as individual parameters to the target function.
   * @param targetFn
   * @param scope
   * @returns {Function}
   */
  spread : function ( targetFn, scope ) {
    return function()
    {
      var params = Array.prototype.slice.call(arguments, 0);
      targetFn.apply(scope, params);
    };
  },

  /**
   * Publish the iterator facade to easily support iteration and accessors
   * @see iterator.js
   */
  iterator : iterator,

  css : {
    /**
     * For any positional fields, ensure that a `px` suffix
     * is provided.
     * @param target
     * @returns {*}
     */
    appendSuffix : function (target) {
      var styles = 'top left right bottom ' +
        'x y width height ' +
        'border-width border-radius borderWidth borderRadius' +
        'margin margin-top margin-bottom margin-left margin-right ' +
        'padding padding-left padding-right padding-top padding-bottom'.split(' ');

      angular.forEach(target, function(val, key) {
        var isPositional = styles.indexOf(key) > -1;
        var hasPx        = String(val).indexOf('px') > -1;

        if (isPositional && !hasPx) {
          target[key] = val + 'px';
        }
      });

      return target;
    }

  },
  
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  debounce: function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      }, wait);
      if (immediate && !timeout) func.apply(context, args);
    };
  }
    

};

/* 
 * Since removing jQuery from the demos, some code that uses `element.focus()` is broken.
 *
 * We need to add `element.focus()`, because it's testable unlike `element[0].focus`.
 *
 * TODO(ajoslin): This should be added in a better place later.
 */
angular.element.prototype.focus = angular.element.prototype.focus || function() {
  if (this.length) {
    this[0].focus();
  }
  return this;
};
