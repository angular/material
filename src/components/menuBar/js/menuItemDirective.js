
angular
  .module('material.components.menuBar')
  .directive('mdMenuItem', MenuItemDirective);

 /**
  *
  * @ngInjdect
  */
function MenuItemDirective() {
  return {
    require: ['mdMenuItem', '?ngModel'],
    compile: function(templateEl, templateAttrs) {
      if (templateAttrs.type == 'checkbox' || templateAttrs.type == 'radio') {
        var text = templateEl[0].textContent;
        var buttonEl = angular.element('<md-button type="button"></md-button>');
            buttonEl.html(text);
            buttonEl.attr('tabindex', '0');

        templateEl.html('');
        templateEl.append(angular.element('<md-icon md-svg-icon="check"></md-icon>'));
        templateEl.append(buttonEl);
        templateEl[0].classList.add('md-indent');

        setDefault('role', (templateAttrs.type == 'checkbox') ? 'menuitemcheckbox' : 'menuitemradio');
        angular.forEach(['ng-disabled'], moveAttrToButton);

      } else {
        setDefault('role', 'menuitem');
      }


      return function(scope, el, attrs, ctrls) {
        var ctrl = ctrls[0];
        var ngModel = ctrls[1];
        ctrl.init(ngModel);
      };

      function setDefault(attr, val) {
        if (!templateEl[0].hasAttribute(attr)) {
          templateEl[0].setAttribute(attr, val);
        }
      }

      function moveAttrToButton(attr) {
        if (templateEl[0].hasAttribute(attr)) {
          var val = templateEl[0].getAttribute(attr);
          buttonEl[0].setAttribute(attr, val);
          templateEl[0].removeAttribute(attr);
        }
      }
    },
    controller: 'MenuItemController'
  };
}
