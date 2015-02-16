(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .directive('mdAutocompleteListItem', MdAutocompleteListItem);

  function MdAutocompleteListItem ($compile, $mdUtil) {
    return {
      require: '^?mdAutocomplete',
      terminal: true,
      link: link,
      scope: false
    };
    function link (scope, element, attr, ctrl) {
      var newScope = ctrl.parent.$new(false, ctrl.parent),
          itemName = ctrl.scope.$eval(attr.mdAutocompleteListItem),
          itemIndex = ctrl.scope.$eval(attr.mdAutocompleteListItemIndex);
      newScope[itemName] = scope.item;
      $compile(element.contents())(newScope);
      element.attr({ 'role': 'option', 'id': 'item_' + $mdUtil.nextUid() });
      element.on('click', function() {
          newScope.$apply(function() { ctrl.select(itemIndex); });
      });
    }
  }
})();
