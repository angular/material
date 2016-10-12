
angular
  .module('material.components.menuBar')
  .directive('mdMenuItem', MenuItemDirective);

 /* @ngInject */
function MenuItemDirective($mdUtil, $mdConstant, $$mdSvgRegistry) {
  return {
    controller: 'MenuItemController',
    require: ['mdMenuItem', '?ngModel'],
    priority: $mdConstant.BEFORE_NG_ARIA,
    compile: function(templateEl, templateAttrs) {
      var type = templateAttrs.type;
      var inMenuBarClass = 'md-in-menu-bar';

      // Note: This allows us to show the `check` icon for the md-menu-bar items.
      // The `md-in-menu-bar` class is set by the mdMenuBar directive.
      if ((type == 'checkbox' || type == 'radio') && templateEl.hasClass(inMenuBarClass)) {
        var text = templateEl[0].textContent;
        var buttonEl = angular.element('<md-button type="button"></md-button>');
        var iconTemplate = '<md-icon md-svg-src="' + $$mdSvgRegistry.mdChecked + '"></md-icon>';

        buttonEl.html(text);
        buttonEl.attr('tabindex', '0');

        templateEl.html('');
        templateEl.append(angular.element(iconTemplate));
        templateEl.append(buttonEl);
        templateEl.addClass('md-indent').removeClass(inMenuBarClass);

        setDefault('role', type == 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio', buttonEl);
        moveAttrToButton('ng-disabled');

      } else {
        setDefault('role', 'menuitem', templateEl[0].querySelector('md-button, button, a'));
      }


      return function(scope, el, attrs, ctrls) {
        var ctrl = ctrls[0];
        var ngModel = ctrls[1];
        ctrl.init(ngModel);
      };

      function setDefault(attr, val, el) {
        el = el || templateEl;
        if (el instanceof angular.element) {
          el = el[0];
        }
        if (!el.hasAttribute(attr)) {
          el.setAttribute(attr, val);
        }
      }

      function moveAttrToButton(attribute) {
        var attributes = $mdUtil.prefixer(attribute);

        angular.forEach(attributes, function(attr) {
          if (templateEl[0].hasAttribute(attr)) {
            var val = templateEl[0].getAttribute(attr);
            buttonEl[0].setAttribute(attr, val);
            templateEl[0].removeAttribute(attr);
          }
        });
      }
    }
  };
}
