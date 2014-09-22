/**
 * @ngdoc module
 * @name material.components.dialog
 */
angular.module('material.components.dialog', [
  'material.animations',
  'material.services.compiler',
  'material.services.aria'
])
  .directive('materialDialog', [
    '$$rAF',
    MaterialDialogDirective
  ])
  .factory('$materialDialog', [
    '$timeout',
    '$materialCompiler',
    '$rootElement',
    '$rootScope',
    '$materialEffects',
    '$animate',
    '$aria',
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
 * The `$materialDialog` service can be used as a function, which when called will open a
 * dialog. Note: the dialog is always given an isolate scope.
 *
 * It takes one argument, `options`, which is defined below.
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
 *     var hideDialog = $materialDialog({
 *       template: '<material-dialog>Hello!</material-dialog>',
 *       targetEvent: $event
 *     });
 *   };
 * });
 * </hljs>
 *
 * @returns {function} `hideDialog` - A function that hides the dialog.
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
 * @param {element=} appendTo The element to append the dialog to. Defaults to appending
 *   to the root element of the application.
 */
function MaterialDialogService($timeout, $materialCompiler, $rootElement, $rootScope, $materialEffects, $animate, $aria) {
  var recentDialog;
  var dialogParent = $rootElement.find('body');
  if ( !dialogParent.length ) {
    dialogParent = $rootElement;
  }

  return showDialog;

  function showDialog(options) {
    options = angular.extend({
      appendTo: dialogParent,
      hasBackdrop: true, // should have an opaque backdrop
      clickOutsideToClose: true, // should have a clickable backdrop to close
      escapeToClose: true,
      // targetEvent: used to find the location to start the dialog from
      targetEvent: null,
      transformTemplate: function(template) {
        return '<div class="material-dialog-container">' + template + '</div>';
      }
      // Also supports all options from $materialCompiler.compile
    }, options || {});

    // Incase the user provides a raw dom element, always wrap it in jqLite
    options.appendTo = angular.element(options.appendTo); 

    // Close the old dialog
    recentDialog && recentDialog.then(function(destroyDialog) {
      destroyDialog();
    });

    recentDialog = $materialCompiler.compile(options).then(function(compileData) {
      // Controller will be passed a `$hideDialog` function
      compileData.locals.$hideDialog = destroyDialog;

      var scope = $rootScope.$new(true);
      var element = compileData.link(scope); 
      var popInTarget = options.targetEvent && options.targetEvent.target && 
        angular.element(options.targetEvent.target);
      var closeButton = findCloseButton();
      var backdrop;

      configureAria(element.find('material-dialog'));

      if (options.hasBackdrop) {
        backdrop = angular.element('<material-backdrop class="opaque ng-enter">');
        $animate.enter(backdrop, options.appendTo, null);
      }

      $materialEffects.popIn(element, options.appendTo, popInTarget)
        .then(function() {

          if (options.escapeToClose) {
            $rootElement.on('keyup', onRootElementKeyup);
          }
          if (options.clickOutsideToClose) {
            element.on('click', dialogClickOutside);
          }
          closeButton.focus();

        });

      return destroyDialog;

      function findCloseButton() {
        //If no element with class dialog-close, try to find the last 
        //button child in dialog-actions and assume it is a close button
        var closeButton = element[0].querySelector('.dialog-close');
        if (!closeButton) {
          var actionButtons = element[0].querySelectorAll('.dialog-actions button');
          closeButton = actionButtons[ actionButtons.length - 1 ];
        }
        return angular.element(closeButton);
      }
      function destroyDialog() {
        if (destroyDialog.called) return;
        destroyDialog.called = true;

        if (backdrop) {
          $animate.leave(backdrop);
        }
        if (options.escapeToClose) {
          $rootElement.off('keyup', onRootElementKeyup);
        }
        if (options.clickOutsideToClose) {
          element.off('click', dialogClickOutside);
        }
        $animate.leave(element).then(function() {
          element.remove();
          scope.$destroy();
          scope = null;
          element = null;

          if(popInTarget !== null) {
            popInTarget.focus();
          }
        });
      }
      function onRootElementKeyup(e) {
        if (e.keyCode === Constant.KEY_CODE.ESCAPE) {
          $timeout(destroyDialog);
        }
      }
      function dialogClickOutside(e) {
        // Only close if we click the flex container outside the backdrop
        if (e.target === element[0]) {
          $timeout(destroyDialog);
        }
      }
    });

    /**
     * Inject ARIA-specific attributes appropriate for Dialogs
     */
    function configureAria(element) {
      element.attr({
        'role': 'dialog'
      });

      var dialogContent = element.find('.dialog-content');
      if(dialogContent.length === 0){
        dialogContent = element;
      }
      var defaultText = Util.stringFromTextBody(dialogContent.text(), 3);
      $aria.expect(element, 'aria-label', defaultText);
    }

    return recentDialog;
  }
}
