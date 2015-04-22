angular
    .module('material.components.chips')
    .directive('mdChipTransclude', MdChipTransclude);

function MdChipTransclude ($compile, $mdUtil) {
  return {
    restrict: 'EA',
    terminal: true,
    link: link,
    scope: false
  };
  function link (scope, element, attr) {
    var ctrl = scope.$parent.$mdChipsCtrl,
        newScope = ctrl.parent.$new(false, ctrl.parent);
    newScope.$$replacedScope = scope;
    newScope.$chip = scope.$chip;
    newScope.$mdChipsCtrl = ctrl;
    element.html(ctrl.$scope.$eval(attr.mdChipTransclude));
    $compile(element.contents())(newScope);
  }
}
