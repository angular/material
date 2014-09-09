
/**
 * Determine if the DOM element is of a certain tag type
 * or has the specified attribute type
 *
 * @param node
 * @returns {*|boolean}
 */
var isNodeType = function (node, type) {
  return node.tagName && (
    node.hasAttribute(type) ||
    node.hasAttribute('data-' + type) ||
    node.tagName.toLowerCase() === type ||
    node.tagName.toLowerCase() === 'data-' + type
  );
};

var isNgRepeat = function (node) {
  var COMMENT_NODE = 8;
  return node.nodeType == COMMENT_NODE && node.nodeValue.indexOf('ngRepeat') > -1;
};

/**
 * Is the an empty text string
 * @param node
 * @returns {boolean}
 */
var isNodeEmpty = function (node) {
  var TEXT_NODE = 3,
      COMMENT_NODE = 8;
  return (node.nodeType == COMMENT_NODE) ||
    (node.nodeType == TEXT_NODE && !(node.nodeValue || '').trim());
};

function findNode(selector, element) {
  var parentNode = element[0];
  return angular.element(parentNode.querySelector(selector));
}

/*
 *  This function() provides scope-relative features to disconnect and reconnect to the $digest() processes
 *  NOTE: this is essentially a reversible $destroy() for scopes.
 *
 *  Detaching the scope would mean:
 *
 *    Detaching the scope from the scope's current parent so that watchers no
 *    longer fire when the scope's current parent's $digest is called
 *
 *  On re-attaching to a DOM element (as a child):
 *
 *    It would be attached as he child scope of the DOM element. This is useful
 *    for optimizations such as not running watchers on hidden DOM (that could be detached).
 *
 *  @see https://github.com/angular/angular.js/issues/5301
 *
 */
function addDigestConnector (scope) {
  var disconnect = function () {

    // we can't destroy the root scope or a scope that has been already destroyed
    if (this.$root === this) return;
    if (this.$$destroyed ) return;

    var parent = this.$parent;
    this.$$disconnected = true;

    // See Scope.$destroy
    if (parent.$$childHead === this) parent.$$childHead = this.$$nextSibling;
    if (parent.$$childTail === this) parent.$$childTail = this.$$prevSibling;
    if (this.$$prevSibling) this.$$prevSibling.$$nextSibling = this.$$nextSibling;
    if (this.$$nextSibling) this.$$nextSibling.$$prevSibling = this.$$prevSibling;

    this.$$nextSibling = this.$$prevSibling = null;
  };
  var reconnect = function () {

    // we can't disconnect the root node or scope already disconnected
    if (this.$root === this) return;
    if (!this.$$disconnected) return;

    var child = this;

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
  };

  scope.$disconnect = angular.bind( scope, disconnect );
  scope.$reconnect  = angular.bind( scope, reconnect );

  return scope;
}
