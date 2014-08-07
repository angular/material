
/**
 * @ngdoc module
 * @name material.components.radioButton
 * @description radioButton module!
 */
angular.module('material.components.radioButton', [
  'material.animations'
])
  .directive('materialRadioButton', [
    materialRadioButtonDirective 
  ])
  .directive('materialRadioGroup', [
    materialRadioGroupDirective 
  ]);


/**
 * @ngdoc directive
 * @name materialRadioButton
 * @module material.components.radioButton
 * @restrict E
 *
 * @description
 * radioButton directive!
 *
 * @param {expression=} ngModel An expression to bind this radioButton to.
 */
function materialRadioButtonDirective() {

  var CHECKED_CSS = 'material-checked';

  return {
    restrict: 'E',
    require: '^materialRadioGroup',
    scope: true,
    transclude: true,
    template: '<div class="material-container">' +
                '<material-ripple start="center" class="circle"></material-ripple>' +
                '<div class="material-off"></div>' +
                '<div class="material-on"></div>' +
              '</div>' +
              '<div ng-transclude class="material-label"></div>',
    link: link
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function link(scope, element, attr, rgCtrl) {
    var input = element.find('input');
    var ngModelCtrl = angular.element(input).controller('ngModel');
    scope.checked = false;

    if(!ngModelCtrl || input[0].type !== 'radio') return;

    // the radio group controller decides if this
    // radio button should be checked or not
    scope.check = function(val) {
      // update the directive's DOM/design
      scope.checked = !!val;
      element.attr('aria-checked', scope.checked);
      if(scope.checked) {
        element.addClass(CHECKED_CSS);
      } else {
        element.removeClass(CHECKED_CSS);
      }
    };

    // watch the ng-model $viewValue
    scope.$watch(
      function () { return ngModelCtrl.$viewValue; },
      function (val) {
        // tell the radio group controller that this
        // radio button should be the checked one
        if(input[0].checked) {
          rgCtrl.check(scope);
        }
      }
    );

    // add click listener to directive element to manually
    // check the inner input[radio] and set $viewValue
    var listener = function(ev) {
      scope.$apply(function() {
        ngModelCtrl.$setViewValue(input.val(), ev && ev.type);
        input[0].checked = true;
      });
    };
    element.on('click', listener);

    // register this radio button in its radio group
    rgCtrl.add(scope);

    // on destroy, remove this radio button from its radio group
    scope.$on('$destroy', function(){
      if(input[0].checked) {
        ngModelCtrl.$setViewValue(null);
      }
      rgCtrl.remove(scope);
    });
  }

}


/**
 * @ngdoc directive
 * @name radioGroup
 * @module material.components.radioGroup
 * @restrict E
 *
 * @description
 * radioGroup directive!
 */
function materialRadioGroupDirective() {

  return {
    restrict: 'E',
    controller: controller
  };

  function controller($scope) {
    var radioButtons = [];
    var checkedRadioButton = null;

    this.add = addRadioButton;
    this.remove = removeRadioButton;
    this.check = checkRadioButton;

    function addRadioButton(rbScope) {
      return radioButtons.push(rbScope);
    }

    function removeRadioButton(rbScope) {
      for(var i=0; i<radioButtons.length; i++) {
        if(radioButtons[i] === rbScope) {
          if(rbScope === checkedRadioButton) {
            checkedRadioButton = null;
          }
          return radioButtons.splice(i, 1);
        }
      }
    }

    function checkRadioButton(rbScope) {
      if(checkedRadioButton === rbScope) return;

      checkedRadioButton = rbScope;

      angular.forEach(radioButtons, function(rb) {
        rb.check(rb === checkedRadioButton);
      });
    }

  }

}
