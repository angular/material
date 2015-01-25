(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [
  'material.core'
])
.directive('mdIcon', mdIconDirective);

/**
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<md-icon>` directive is an element useful for embedding SVG icons.
 *
 * Icons may be rendered in one of two ways: as a single `<img/>` element which
 * is not able to have CSS styles applied to its original SVG elements, and as the
 * original `<svg/>` object hierarchy that can have styles applied to its source
 * elements.
 *
 * @param {string} icon The url of icon to be embedded.
 * @param {string} type How to render the icon in the page.  Either `image` or `svg`.
 *
 * @usage
 * <hljs lang="html">
 *  <md-icon icon="/img/icons/ic_access_time_24px.svg"></md-icon>
 *
 *  <md-icon icon="/img/icons/ic_access_time_24px.svg" type="image"></md-icon>
 * </hljs>
 *
 */
function mdIconDirective() {
  return {
    restrict: 'E',
    template: getTemplate,
    link: postLink
  };

  function isImage(attr) {
    return angular.isDefined(attr.type) && attr.type === 'image';
  }

  function getTemplate(element, attr) {
    return isImage(attr) ?
           '<img class="md-icon" src="' + attr.icon + '"/>' :
           '<svg class="md-icon" xmlns="http://www.w3.org/2000/svg"></svg>';
  }

  function postLink(scope, element, attr) {
    if(!angular.isDefined(attr.icon)) {
      return;
    }
    if(!isImage(attr)) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function loadIconState() {
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200 && httpRequest.responseXML) {
            var svg = angular.element(httpRequest.responseXML).find('svg');
            svg.addClass('md-icon');
            element.children().replaceWith(svg);
          }
        }
      };
      httpRequest.open('GET', attr.icon);
      httpRequest.send();
    }
  }
}
})();
