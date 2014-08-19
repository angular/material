
/**
 * @ngdoc module
 * @name material.components.radioButton
 * @description radioButton module!
 */
angular.module('material.components.radioButton', [
  'material.animations'
])
  .directive('materialRadioGroup', [
    materialRadioGroupDirective
  ])
  .directive('materialRadioButton', [
    materialRadioButtonDirective
  ]);

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name materialRadioGroup
 *
 * @order 0
 * @restrict E
 *
 * @description
 * The `<material-radio-group>` directive identifies a grouping
 * container for the 1..n grouped material radio buttons; specified using nested
 * `<material-radio-button>` tags.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {boolean=} noink Use of attribute indicates use of ripple ink effects on radio buttons gestures
 *
 * @usage
 * <hljs lang="html">
 * <material-radio-group ng-model="selected">
 *
 *   <material-radio-button
 *        ng-repeat="d in colorOptions"
 *        ng-value="d.value">
 *
 *          {{ d.label }}
 *
 *   </material-radio-button>
 *
 * </material-radio-group>
 * </hljs>
 *
 */
function materialRadioGroupDirective() {
  Controller.prototype = createControllerProto();

  return {
    restrict: 'E',
    controller: Controller,
    require: ['materialRadioGroup', '?ngModel'],
    link: link
  };

  function link(scope, element, attr, ctrls) {
    var rgCtrl = ctrls[0],
      ngModelCtrl = ctrls[1] || {
        $setViewValue: angular.noop
      };
    rgCtrl.init(ngModelCtrl);
  }

  function Controller() {
    this._radioButtonRenderFns = [];
  }

  function createControllerProto() {
    return {
      init: function(ngModelCtrl) {
        this._ngModelCtrl = ngModelCtrl;
        this._ngModelCtrl.$render = angular.bind(this, this.render);
      },
      add: function(rbRender) {
        this._radioButtonRenderFns.push(rbRender);
      },
      remove: function(rbRender) {
        var index = this._radioButtonRenderFns.indexOf(rbRender);
        if (index !== -1) {
          this._radioButtonRenderFns.splice(index, 1);
        }
      },
      render: function() {
        this._radioButtonRenderFns.forEach(function(rbRender) {
          rbRender();
        });
      },
      setViewValue: function(value, eventType) {
        this._ngModelCtrl.$setViewValue(value, eventType);
        // update the other checkboxes as well
        this.render();
      },
      getViewValue: function() {
        return this._ngModelCtrl.$viewValue;
      }
    };
  }
}

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name materialRadioButton
 *
 * @order 1
 * @restrict E
 *
 * @description
 * The `<material-radio-button>`directive is the child directive required to be used within `<material-radioo-group>` elements.
 *
 * While similar to the `<input type="radio" ng-model="" value="">` directive,
 * the `<material-radio-button>` directive provides material ink effects, ARIA support, and
 * supports use within named radio groups.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} ngChange Angular expression to be executed when input changes due to user
 *    interaction with the input element.
 * @param {string} ngValue Angular expression which sets the value to which the expression should
 *    be set when selected.*
 * @param {string} value The value to which the expression should be set when selected.
 * @param {string=} name Property name of the form under which the control is published.
 *
 * @usage
 * <hljs lang="html">
 *
 * <material-radio-button value="1">
 *   Label 1
 * </material-radio-button>
 *
 * <material-radio-button ng-model="color" ng-value="specialValue">
 *   Green
 * </material-radio-button>
 *
 * </hljs>
 *
 */
function materialRadioButtonDirective() {

  var CHECKED_CSS = 'material-checked';

  return {
    restrict: 'E',
    require: '^materialRadioGroup',
    transclude: true,
    template: '<div class="material-container">' +
                '<material-ripple start="center" class="circle"></material-ripple>' +
                '<div class="material-off"></div>' +
                '<div class="material-on"></div>' +
              '</div>' +
              '<div ng-transclude class="material-label" tab-index="0"></div>',
    link: link
  };

  function link(scope, element, attr, rgCtrl) {
    var lastChecked;

    rgCtrl.add(render);
    element.on('$destroy', function() {
      rgCtrl.remove(render);
    });

    element.on('click', listener);
    attr.$observe('value', render);

    function listener(ev) {
      if (element[0].hasAttribute('disabled')) return;
      scope.$apply(function() {
        rgCtrl.setViewValue(attr.value, ev && ev.type);
      });
    }

    function render() {
      var checked = (rgCtrl.getViewValue() === attr.value);
      if (checked === lastChecked) {
        return;
      }
      lastChecked = checked;
      element.attr('aria-checked', checked);
      if (checked) {
        element.addClass(CHECKED_CSS);
      } else {
        element.removeClass(CHECKED_CSS);
      }
    }
  }
}


