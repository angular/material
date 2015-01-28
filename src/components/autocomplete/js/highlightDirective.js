(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .directive('mdHighlightText', MdHighlight);

  /**
   * @ngdoc directive
   * @name mdHighlightText
   * @module material.components.autocomplete
   *
   * @description
   * The `md-highlight-text` directive allows you to specify text that should be highlighted within
   * an element.  Highlighted text will be wrapped in `<span class="highlight"></span>` which can
   * be styled through CSS.  Please note that child elements may not be used with this directive.
   *
   * @param {string=} md-highlight-text A model to be searched for
   *
   * @usage
   * <hljs lang="html">
   * <input placeholder="Enter a search term..." ng-model="searchTerm" type="text" />
   * <ul>
   *   <li ng-repeat="result in results" md-highlight-text="searchTerm">
   *     {{result.text}}
   *   </li>
   * </ul>
   * </hljs>
   */

  function MdHighlight () {
    return {
      terminal: true,
      scope: false,
      controller: 'MdHighlightCtrl'
    };
  }
})();
