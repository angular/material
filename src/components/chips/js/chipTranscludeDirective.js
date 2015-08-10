angular
    .module('material.components.chips')
    .directive('mdChipTransclude', MdChipTransclude);

function MdChipTransclude ($compile) {
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
    newScope.$index = scope.$index;
    newScope.$mdChipsCtrl = ctrl;

    var newHtml = ctrl.$scope.$eval(attr.mdChipTransclude);

    element.html(newHtml);
    $compile(element.contents())(newScope);
  }
}
