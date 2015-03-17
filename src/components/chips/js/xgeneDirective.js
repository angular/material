(function () {
  'use strict';
  angular
      .module('material.components.chips')
      .directive('mdXgene', MdXgene);

  /**
   * A directive for lazily binding a single property of aparent scope to a
   * transcluded chunk. ngRepeats typically need this late-bound property.
   */
  function MdXgene ($compile, $mdUtil) {
    return {
      require: '^?mdChips',
      terminal: true,
      link: link,
      scope: false
    };
    function link (scope, element, attr, ctrl) {
      var newScope = scope.$new(false, scope);
      newScope[attr.mdXgene] = scope.$eval(attr.mdXgene);
      $compile(element.contents())(newScope);
      element.attr({ 'role': 'option', 'id': 'item_' + $mdUtil.nextUid() });
    }
  }
})();
