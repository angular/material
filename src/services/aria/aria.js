angular.module('material.services.aria', [])

.service('$mdAria', [
  '$$rAF',
  '$log',
  AriaService
]);

function AriaService($$rAF, $log) {

  return {
    expect: expectAttribute,
    expectAsync: expectAsync,
    expectWithText: expectWithText
  };

  /**
   * Check if expected attribute has been specified on the target element
   * @param element
   * @param attrName
   * @param {optional} defaultValue What to set the attr to if no value is found
   */
  function expectAttribute(element, attrName, defaultValue) {
    var node = element[0];
    if (!node.hasAttribute(attrName)) {

      if (angular.isDefined(defaultValue) && defaultValue.length) {
        defaultValue = String(defaultValue).trim();
        element.attr(attrName, defaultValue);
      } else {
        $log.warn('ARIA: Attribute "', attrName, '", required for accessibility, is missing on node:', node);
      }

    }
  }

  function expectAsync(element, attrName, defaultValueGetter) {
    // Problem: when retrieving the element's contents synchronously to find the label,
    // the text may not be defined yet in the case of a binding.
    // There is a higher chance that a binding will be defined if we wait one frame.
    $$rAF(function() {
      expectAttribute(element, attrName, defaultValueGetter());
    });
  }

  function expectWithText(element, attrName) {
    expectAsync(element, attrName, function() {
      return element.text().trim();
    });
  }

}
