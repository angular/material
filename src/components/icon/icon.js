(function() {
'use strict';

/*
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [
  'material.core'
])
.directive('mdIcon', mdIconDirective);

/*
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<md-icon>` directive is an element useful for SVG icons
 *
 * @param {string} md-type The type of icon to display, either `image` or `svg`.  If the attribute
 * is not present, the default will be `svg`.  When using the `image` type, the icon will not be applicable
 * for customization with CSS styles, but may perform better in some cases.
 *
 * @usage
 * <hljs lang="html">
 *  <md-icon icon="/img/icons/ic_access_time_24px.svg"></md-icon>
 *  <md-icon icon="/img/icons/ic_access_time_24px.svg" type="image"></md-icon>
 * </hljs>
 *
 */
function mdIconDirective() {
  return {
    restrict: 'E',
    template: '<div class="md-icon"/>',
    compile: function(element, attr) {
      if(!angular.isDefined(attr.icon)) {
        return;
      }
      var type = angular.isDefined(attr.type) ? attr.type : 'svg';
      var child = angular.element(element[0].children[0]);
      if(type === 'svg') {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function loadIconState() {
          if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200 && httpRequest.responseXML instanceof Document) {
              var svg = angular.element(httpRequest.responseXML).find('svg');
              child.replaceWith(svg);
            }
          }
        };
        httpRequest.open('GET', attr.icon);
        httpRequest.send();
      }
      else if(type === 'image') {
        var img = angular.element('<img src="' + attr.icon + '"/>');
        child.replaceWith(img);
      }
    }
  };
}
})();
