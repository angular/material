(function () {
  'use strict';
  angular
      .module('material.components.chips')
      .directive('mdChipRemove', MdChipRemove);

  /**
   * @ngdoc directive
   * @name mdChipRemove
   * @module material.components.chips
   *
   * @description
   * `<md-chip-remove>`
   * Creates a remove button for the given chip.
   *
   * @usage
   * <hljs lang="html">
   *   <md-chip>{{$chip}}<md-chip-remove></md-chip-remove></md-chip>
   * </hljs>
   */

  var REMOVE_CHIP_TEMPLATE = '\
      <md-button ng-if="!$mdChipsCtrl.readonly" ng-click="$mdChipsCtrl.removeChip($index)">\
        <md-icon md-svg-icon="close"></md-icon>\
         <span class="visually-hidden">Remove</span>\
      </md-button>';

  /**
   *
   * @param $compile
   * @param $timeout
   * @returns {{restrict: string, require: string[], link: Function, scope: boolean}}
   * @constructor
   */
  function MdChipRemove ($compile, $timeout) {
    return {
      restrict: 'E',
      template: REMOVE_CHIP_TEMPLATE,
      require: ['^mdChips'],
      scope: false
    };
  }
})();
