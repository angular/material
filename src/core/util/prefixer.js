angular
  .module('material.core')
  .config( function($provide) {
    $provide.decorator('$mdUtil', ['$delegate', function ($delegate) {

      // Inject the prefixer into our original $mdUtil service.
      $delegate.prefixer = MdPrefixer;

      return $delegate;
    }]);
  });

function MdPrefixer(initialAttributes, buildSelector) {
  var PREFIXES = ['data', 'x'];

  if (initialAttributes) {
    // The prefixer also accepts attributes as a parameter, and immediately builds a list or selector for
    // the specified attributes.
    return buildSelector ? _buildSelector(initialAttributes) : _buildList(initialAttributes);
  }

  return {
    buildList: _buildList,
    buildSelector: _buildSelector,
    hasAttribute: _hasAttribute,
    removeAttribute: _removeAttribute
  };

  function _buildList(attributes) {
    attributes = angular.isArray(attributes) ? attributes : [attributes];

    attributes.forEach(function(item) {
      PREFIXES.forEach(function(prefix) {
        attributes.push(prefix + '-' + item);
      });
    });

    return attributes;
  }

  function _buildSelector(attributes) {
    attributes = angular.isArray(attributes) ? attributes : [attributes];

    return _buildList(attributes)
      .map(function(item) {
        return '[' + item + ']';
      })
      .join(',');
  }

  function _hasAttribute(element, attribute) {
    element = _getNativeElement(element);

    if (!element) {
      return false;
    }

    var prefixedAttrs = _buildList(attribute);

    for (var i = 0; i < prefixedAttrs.length; i++) {
      if (element.hasAttribute(prefixedAttrs[i])) {
        return true;
      }
    }

    return false;
  }

  function _removeAttribute(element, attribute) {
    element = _getNativeElement(element);

    if (!element) {
      return;
    }

    _buildList(attribute).forEach(function(prefixedAttribute) {
      element.removeAttribute(prefixedAttribute);
    });
  }

  /**
   * Transforms a jqLite or DOM element into a HTML element.
   * This is useful when supporting jqLite elements and DOM elements at
   * same time.
   * @param element {JQLite|Element} Element to be parsed
   * @returns {HTMLElement} Parsed HTMLElement
   */
  function _getNativeElement(element) {
    element =  element[0] || element;

    if (element.nodeType) {
      return element;
    }
  }

}
