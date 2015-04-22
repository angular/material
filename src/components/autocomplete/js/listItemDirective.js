angular
    .module('material.components.autocomplete')
    .directive('mdAutocompleteListItem', MdAutocompleteListItem);

function MdAutocompleteListItem ($compile, $mdUtil) {
  return {
    terminal: true,
    link: postLink,
    scope: false
  };
  function postLink (scope, element, attr) {
    var ctrl     = scope.$parent.$mdAutocompleteCtrl,
        newScope = ctrl.parent.$new(false, ctrl.parent),
        itemName = ctrl.scope.$eval(attr.mdAutocompleteListItem);
    newScope[itemName] = scope.item;
    element.html(ctrl.scope.$eval(attr.mdAutocompleteListItemTemplate));
    $compile(element.contents())(newScope);
    element.attr({
      role: 'option',
      id: 'item_' + $mdUtil.nextUid()
    });
  }
}
