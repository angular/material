/**
 * @ngdoc module
 * @name material.components.dialog
 */
angular.module('material.components.dialog', [
  'material.animations',
  'material.services.compiler',
  'material.services.aria',
  'material.services.interimElement',
])
  .directive('materialDialog', [
    '$$rAF',
    MaterialDialogDirective
  ])
  .factory('$materialDialog', [
    '$timeout',
    '$rootElement',
    '$materialEffects',
    '$animate',
    '$aria',
    '$$interimElement',
    MaterialDialogService
  ]);

function MaterialDialogDirective($$rAF) {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      $$rAF(function() {
        var content = element[0].querySelector('.dialog-content');
        if (content && content.scrollHeight > content.clientHeight) {
          element.addClass('dialog-content-overflow');
        }
      });
    }
  };
}

/**
 * @ngdoc service
 * @name $materialDialog
 * @module material.components.dialog
 *
 * @description
 *
 * The $materialDialog service opens a dialog over top of the app. 
 *
 * Note: The dialog is always given an isolate scope.
 *
 * `$materialDialog` is an `$interimElement` service and adheres to the same behaviors.
 *  - `$materialDialog.show()`
 *  - `$materialDialog.hide()`
 *  - `$materialDialog.cancel()`
 *
 * Note: the dialog's template must have an outer `<material-dialog>` element. 
 * Inside, use an element with class `dialog-content` for the dialog's content, and use
 * an element with class `dialog-actions` for the dialog's actions.  
 *
 * When opened, the `dialog-actions` area will attempt to focus the first button found with 
 * class `dialog-close`. If no button with `dialog-close` class is found, it will focus the
 * last button in the `dialog-actions` area.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <material-button ng-click="openDialog($event)">
 *     Open a Dialog from this button!
 *   </material-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $materialDialog) {
 *   $scope.openDialog = function($event) {
 *     $materialDialog.show({
 *       template: '<material-dialog>Hello!</material-dialog>',
 *       targetEvent: $event
 *     });
 *   };
 * });
 * </hljs>
 *
 */

/**
 *
 * @ngdoc method
 * @name $materialDialog#show
 *
 * @description
 * Show a dialog with the specified options
 *
 * @paramType Options
 * @param {string=} templateUrl The url of a template that will be used as the content
 * of the dialog. 
 * @param {string=} template Same as templateUrl, except this is an actual template string.
 * @param {DOMClickEvent=} targetEvent A click's event object. When passed in as an option, 
 * the location of the click will be used as the starting point for the opening animation
 * of the the dialog.
 * @param {boolean=} hasBackdrop Whether there should be an opaque backdrop behind the dialog.
 *   Default true.
 * @param {boolean=} clickOutsideToClose Whether the user can click outside the dialog to
 *   close it. Default true.
 * @param {boolean=} escapeToClose Whether the user can press escape to close the dialog.
 *   Default true.
 * @param {string=} controller The controller to associate with the dialog. The controller
 * will be injected with the local `$hideDialog`, which is a function used to hide the dialog.
 * @param {object=} locals An object containing key/value pairs. The keys will be used as names
 * of values to inject into the controller. For example, `locals: {three: 3}` would inject
 * `three` into the controller, with the value 3.
 * @param {object=} resolve Similar to locals, except it takes promises as values, and the
 * toast will not open until all of the promises resolve.
 * @param {string=} controllerAs An alias to assign the controller to on the scope.
 * @param {element=} parent The element to append the dialog to. Defaults to appending
 *   to the root element of the application.
 *
 * @returns {Promise} Returns a promise that will be resolved or rejected when
 *  `$materialDialog.hide()` or `$materialDialog.cancel()` is called respectively.
 */

/**
 * @ngdoc method
 * @name $materialDialog#hide
 *
 * @description
 * Hide an existing dialog and `resolve` the promise returned from `$materialDialog.show()`.
 *
 * @param {*} arg An argument to resolve the promise with.
 *
 */

/**
 * @ngdoc method
 * @name $materialDialog#cancel
 *
 * @description
 * Hide an existing dialog and `reject` the promise returned from `$materialDialog.show()`.
 *
 * @param {*} arg An argument to reject the promise with.
 *
 */

function MaterialDialogService($timeout, $rootElement, $materialEffects, $animate, $aria, $$interimElement) {
  var factoryDef = {
    hasBackdrop: true,
    isolateScope: true,
    onShow: onShow,
    onRemove: onRemove,
    clickOutsideToClose: true,
    escapeToClose: true,
    targetEvent: null,
    transformTemplate: function(template) {
      return '<div class="material-dialog-container">' + template + '</div>';
    }
  };

  var $dialogService = $$interimElement(factoryDef);
  return $dialogService;


  function onShow(scope, el, options) {
    // Incase the user provides a raw dom element, always wrap it in jqLite
    options.parent = angular.element(options.parent);

    popInTarget = options.targetEvent && options.targetEvent.target &&
      angular.element(options.targetEvent.target);

    var closeButton = findCloseButton();

    configureAria(el.find('material-dialog'));

    if (options.hasBackdrop) {
      var backdrop = angular.element('<material-backdrop class="opaque ng-enter">');
      $animate.enter(backdrop, options.parent, null);
      el.data('backdrop', backdrop);
    }

    // Store listeners on data for easy cleanup later
    el.data('onRootElementKeyup', function onRootElementKeyup(e) {
      if (e.keyCode === Constant.KEY_CODE.ESCAPE) {
        $timeout($dialogService.hide);
      }
    });

    el.data('dialogClickOutside', function(e) {
      // Only close if we click the flex container outside the backdrop
      if (e.target === el[0]) {
        $timeout($dialogService.hide);
      }
    });

    return $materialEffects.popIn(el, options.parent, popInTarget)
    .then(function() {
      if (options.escapeToClose) {
        $rootElement.on('keyup', el.data('onRootElementKeyup'));
      }
      if (options.clickOutsideToClose) {
        el.on('click', el.data('dialogClickOutside'));
      }
      closeButton.focus();
    });


    function findCloseButton() {
      //If no element with class dialog-close, try to find the last
      //button child in dialog-actions and assume it is a close button
      var closeButton = el[0].querySelector('.dialog-close');
      if (!closeButton) {
        var actionButtons = el[0].querySelectorAll('.dialog-actions button');
        closeButton = actionButtons[ actionButtons.length - 1 ];
      }
      return angular.element(closeButton);
    }

  }

  function onRemove(scope, el, options) {
    var backdrop = el.data('backdrop');
    var onRootElementKeyup = el.data('onRootElementKeyup');
    var dialogClickOutside = el.data('dialogClickOutside');
    var popInTarget = el.data('popInTarget');

    if (backdrop) {
      $animate.leave(backdrop);
      el.data('backdrop', undefined);
    }
    if (options.escapeToClose) {
      $rootElement.off('keyup', onRootElementKeyup);
      el.data('onRootElementKeyup', undefined);
    }
    if (options.clickOutsideToClose) {
      el.off('click', dialogClickOutside);
      el.data('dialogClickOutside', undefined);
    }
    return $animate.leave(el).then(function() {
      el.remove();
      if (popInTarget) {
        popInTarget.focus();
      }
    });
  }

  /**
   * Inject ARIA-specific attributes appropriate for Dialogs
   */
  function configureAria(element) {
    element.attr({
      'role': 'dialog'
    });

    var dialogContent = element.find('.dialog-content');
    if (dialogContent.length === 0){
      dialogContent = element;
    }
    var defaultText = Util.stringFromTextBody(dialogContent.text(), 3);
    $aria.expect(element, 'aria-label', defaultText);
  }
}
