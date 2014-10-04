var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;

/* for nextUid() function below */
var uid = ['0','0','0'];

var Util = {
  now: window.performance ? angular.bind(performance, performance.now) : Date.now,

  /**
   * Checks if the specified element has an ancestor (ancestor being parent, grandparent, etc)
   * with the given attribute defined. 
   *
   * Also pass in an optional `limit` (levels of ancestry to scan), default 4.
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
   * Checks to see if the element or its parents are disabled.
   * @param element DOM element to start scanning for `disabled` attribute
   * @param limit Number of parent levels that should be scanned; defaults to 4
   * @returns {*} Boolean
   */
  isParentDisabled: function isParentDisabled(element, limit) {
    return Util.ancestorHasAttribute(element, 'disabled', limit);
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
    return name
      .replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
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
   * Publish the iterator facade to easily support iteration and accessors
   * @see iterator.js
   */
  iterator: iterator,

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  debounce: function debounce(func, wait, immediate) {
    var timeout;
    return function debounced() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      }, wait);
      if (immediate && !timeout) func.apply(context, args);
    };
  },

  // Returns a function that can only be triggered every `delay` milliseconds.
  // In other words, the function will not be called unless it has been more
  // than `delay` milliseconds since the last call.
  throttle: function throttle(func, delay) {
    var recent;
    return function throttled() {
      var context = this;
      var args = arguments;
      var now = Util.now();

      if (!recent || recent - now > delay) {
        func.apply(context, args);
        recent = now;
      }
    };
  },

  /**
   * Wraps an element with a tag
   *
   * @param el element to wrap
   * @param tag tag to wrap it with
   * @param [className] optional class to apply to the wrapper
   * @returns new element
   *
   */
  wrap: function(el, tag, className) {
    if(el.hasOwnProperty(0)) { el = el[0]; }
    var wrapper = document.createElement(tag);
    wrapper.className += className;
    wrapper.appendChild(el.parentNode.replaceChild(wrapper, el));
    return angular.element(wrapper);
  },

  /**
   * nextUid, from angular.js.
   * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
   * characters such as '012ABC'. The reason why we are not using simply a number counter is that
   * the number string gets longer over time, and it can also overflow, where as the nextId
   * will grow much slower, it is a string, and it will never overflow.
   *
   * @returns an unique alpha-numeric string
   */
  nextUid: function() {
    var index = uid.length;
    var digit;

    while(index) {
      index--;
      digit = uid[index].charCodeAt(0);
      if (digit == 57 /*'9'*/) {
        uid[index] = 'A';
        return uid.join('');
      }
      if (digit == 90  /*'Z'*/) {
        uid[index] = '0';
      } else {
        uid[index] = String.fromCharCode(digit + 1);
        return uid.join('');
      }
    }
    uid.unshift('0');
    return uid.join('');
  },

  // Stop watchers and events from firing on a scope without destroying it,
  // by disconnecting it from its parent and its siblings' linked lists.
  disconnectScope: function disconnectScope(scope) {
    if (!scope) return;

    // we can't destroy the root scope or a scope that has been already destroyed
    if (scope.$root === scope) return;
    if (scope.$$destroyed ) return;

    var parent = scope.$parent;
    scope.$$disconnected = true;

    // See Scope.$destroy
    if (parent.$$childHead === scope) parent.$$childHead = scope.$$nextSibling;
    if (parent.$$childTail === scope) parent.$$childTail = scope.$$prevSibling;
    if (scope.$$prevSibling) scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
    if (scope.$$nextSibling) scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;

    scope.$$nextSibling = scope.$$prevSibling = null;

  },

  // Undo the effects of disconnectScope above.
  reconnectScope: function reconnectScope(scope) {
    if (!scope) return;

    // we can't disconnect the root node or scope already disconnected
    if (scope.$root === scope) return;
    if (!scope.$$disconnected) return;

    var child = scope;

    var parent = child.$parent;
    child.$$disconnected = false;
    // See Scope.$new for this logic...
    child.$$prevSibling = parent.$$childTail;
    if (parent.$$childHead) {
      parent.$$childTail.$$nextSibling = child;
      parent.$$childTail = child;
    } else {
      parent.$$childHead = parent.$$childTail = child;
    }
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
angular.element.prototype.blur = angular.element.prototype.blur || function() {
  if (this.length) {
    this[0].blur();
  }
  return this;
};
