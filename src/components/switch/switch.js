angular.module('material.components.switch', [
  'material.components.checkbox',
  'material.components.radioButton',
])

.directive('materialSwitch', [
  'materialCheckboxDirective',
  'materialRadioButtonDirective',
  MaterialSwitch
]);

function MaterialSwitch(checkboxDirectives, radioButtonDirectives) {
  var checkboxDirective = checkboxDirectives[0];
  var radioButtonDirective = radioButtonDirectives[0];

  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div class="material-switch-bar"></div>' +
      '<div class="material-switch-thumb">' +
        radioButtonDirective.template +
      '</div>',
    require: '?ngModel', 
    compile: compile
  };

  function compile(element, attr) {
    
    var thumb = angular.element(element[0].querySelector('.material-switch-thumb'));
    //Copy down disabled attributes for checkboxDirective to use
    thumb.attr('disabled', attr.disabled);
    thumb.attr('ngDisabled', attr.ngDisabled);

    return function postLink(scope, element, attr, ngModelCtrl) {
      checkboxDirective.link(scope, thumb, attr, ngModelCtrl);
    };
  }
}
