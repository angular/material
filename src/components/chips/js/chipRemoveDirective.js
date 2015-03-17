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
   * `<element md-chip-remove>`
   * Identifies an element within an <md-chip> as the delete button. This
   * directive binds to that element's click event and removes the chip.
   *
   * @usage
   * <hljs lang="html">
   *   <md-chip>{{$chip}}<button md-chip-remove>x</button></md-chip>
   * </hljs>
   */

  function MdChipRemove () {
    return {
      restrict: 'A',
      require: ['^mdChips'],
      link: function postLink(scope, element, attrs, controllers) {
        var mdChipsCtrl = controllers[0];
        element.on('click', removeItemListener(mdChipsCtrl, scope));
      },
      scope: false
    };

    function removeItemListener(chipsCtrl, scope) {
      return function() {
        scope.$apply(function() {
          chipsCtrl.removeChip(scope.$index);
        });
      };
    }
  }
})();
