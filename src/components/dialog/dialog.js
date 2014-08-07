/**
 * @ngdoc module
 * @name material.components.dialog
 */
angular.module('material.components.dialog', [
  'material.animations',
  'material.components.backdrop',
  'material.services.popup'
])
  .directive('materialDialog', [
    MaterialDialogDirective
  ])
  .factory('$materialDialog', [
    '$timeout',
    '$materialPopup',
    '$rootElement',
    '$materialBackdrop',
    '$materialEffects',
    MaterialDialogService
  ]);

function MaterialDialogDirective() {
  return {
    restrict: 'E'
  };
}

/**
 * @ngdoc service
 * @name $materialDialog
 * @module material.components.dialog
 * @kind optionFunction
 *
 * @description
 *
 * The $materialDialog service opens a dialog over top of the app. 
 *
 * See the overview page for an example.
 *
 * The `$materialDialog` service can be used as a function, which when called will open a
 * dialog. Note: the dialog is always given an isolate scope.
 *
 * It takes one parameter, `options`, which is an object with the following parameters:
 *
 * @returns {function} `hideDialog` - A function which, when called, will hide the dialog.
 *
 * @param {string=} templateUrl The url of a template that will be used as the content
 * of the dialog. Restrictions: the template must have an outer `material-dialog` element. 
 * Inside, use an element with class `dialog-content` for the dialog's content, and use
 * an element with class `dialog-actions` for the dialog's actions.
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
 * will be injected with the local `$hideDialog`, which is a method used to hide the dialog.
 * @param {object=} locals An object containing key/value pairs. The keys will be used as names
 * of values to inject into the controller. For example, `locals: {three: 3}` would inject
 * `three` into the controller, with the value 3.
 * @param {element=} appendTo The element to append the dialog to. Defaults to appending
 *   to the root element of the application.
 * @param {object=} resolve Similar to locals, except it takes promises as values, and the
 * dialog will not open until all of the promises resolve.
 * @param {string=} controllerAs An alias to assign the controller to on the scope.
 */
function MaterialDialogService($timeout, $materialPopup, $rootElement, $materialBackdrop, $materialEffects) {
  var recentDialog;

  return showDialog;

  /**
   * TODO fully document this
   * Supports all options from $materialPopup, in addition to `duration` and `position`
   */
  function showDialog(options) {
    options = angular.extend({
      appendTo: $rootElement,
      hasBackdrop: true, // should have an opaque backdrop
      clickOutsideToClose: true, // should have a clickable backdrop to close
      escapeToClose: true,
      // targetEvent: used to find the location to start the dialog from
      targetEvent: null,
      transformTemplate: function(template) {
        return '<div class="material-dialog-container">' + template + '</div>';
      },
      // Also supports all options from $materialPopup
    }, options || {});

    // Incase the user provides a raw dom element, always wrap it in jqLite
    options.appendTo = angular.element(options.appendTo); 

    var backdropInstance;

    // Close the old dialog
    recentDialog && recentDialog.then(function(destroyDialog) {
      destroyDialog();
    });

    recentDialog = $materialPopup(options).then(function(dialog) {

      // Controller will be passed a `$hideDialog` function
      dialog.locals.$hideDialog = destroyDialog;
      dialog.enter(function() {
        if (options.escapeToClose) {
          $rootElement.on('keyup', onRootElementKeyup);
        }

        if (options.hasBackdrop) {
          backdropInstance = $materialBackdrop({
            appendTo: options.appendTo,
            opaque: options.hasBackdrop
          });
          backdropInstance.then(function(drop) {
            drop.enter();
          });
        }

        if (options.clickOutsideToClose) {
          dialog.element.on('click', dialogClickOutside);
        }
      });

      var popInTarget = options.targetEvent && options.targetEvent.target && 
        angular.element(options.targetEvent.target);

      $materialEffects.popIn(
        dialog.element,
        options.appendTo,
        popInTarget
      );

      return destroyDialog;

      function destroyDialog() {
        if (backdropInstance) {
          backdropInstance.then(function(drop) {
            drop.destroy();
          });
        }
        if (options.escapeToClose) {
          $rootElement.off('keyup', onRootElementKeyup);
        }
        if (options.clickOutsideToClose) {
          dialog.element.off('click', dialogClickOutside);
        }
        $materialEffects.popOut(dialog.element, $rootElement);

        // TODO(ajoslin): use element.animate() and ngAnimateStyler instead of
        // this $timeout.
        $timeout(dialog.destroy, 200);
      }
      function onRootElementKeyup(e) {
        if (e.keyCode == 27) {
          $timeout(destroyDialog);
        }
      }
      function dialogClickOutside(e) {
        // If we click the flex container outside the backdrop
        if (e.target === dialog.element[0]) {
          $timeout(destroyDialog);
        }
      }
    });

    return recentDialog;
  }
}
