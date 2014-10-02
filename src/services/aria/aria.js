angular.module('material.services.aria', [])

.service('$mdAria', [
  '$$rAF',
  '$log',
  AriaService
]);

function AriaService($$rAF, $log) {
  var messageTemplate = 'ARIA: Attribute "%s", required for accessibility, is missing on "%s"';
  var defaultValueTemplate = 'Default value was set: %s="%s".';

  return {
    expect : expectAttribute,
  };

  /**
   * Check if expected ARIA has been specified on the target element
   * @param element
   * @param attrName
   * @param copyElementText
   * @param {optional} defaultValue
   */
  function expectAttribute(element, attrName, copyElementText, defaultValue) {

    $$rAF(function(){

      var node = element[0];
      if (!node.hasAttribute(attrName)) {

        var hasDefault;
        if(copyElementText === true){
          if(!defaultValue) defaultValue = element.text().trim();
          hasDefault = angular.isDefined(defaultValue) && defaultValue.length;
        }

        if (hasDefault) {
          defaultValue = String(defaultValue).trim();
          element.attr(attrName, defaultValue);
        } else {
          $log.warn(messageTemplate, attrName, node);
          $log.warn(node);
        }
      }
    });
  }


  /**
   * Gets the tag definition from a node's outerHTML
   * @example getTagString(
   *   '<md-button foo="bar">Hello</md-button>'
   * ) // => '<md-button foo="bar">'
   */
  function getTagString(node) {
    var html = node.outerHTML;
    var closingIndex = html.indexOf('>');
    return html.substring(0, closingIndex + 1);
  }
}
