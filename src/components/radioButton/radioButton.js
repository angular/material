
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
