angular.module('material.components.dialog', ['material.services.popup'])
  .directive('materialDialog', [
    MaterialDialogDirective
  ])
  /**
   * @ngdoc service
   * @name $materialDialog
   * @module material.components.dialog
   */
  .factory('$materialDialog', [
    '$timeout',
    '$materialPopup',
    '$rootElement',
    '$materialBackdrop',
    'materialEffects',
    MaterialDialogService
  ]);

function MaterialDialogDirective() {
  return {
    restrict: 'E'
  };
}

function MaterialDialogService($timeout, $materialPopup, $rootElement, $materialBackdrop, materialEffects) {
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
      targetEvent: null
      // Also supports all options from $materialPopup
    }, options || {});

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
        if (options.hasBackdrop || options.clickOutsideToClose) {
          backdropInstance = $materialBackdrop({
            appendTo: options.appendTo,
            opaque: options.hasBackdrop
          }, clickOutsideToClose ? destroyDialog : angular.noop);
          backdropInstance.then(function(drop) {
            drop.enter();
          });
        }
      });

      materialEffects.popIn(
        dialog.element,
        options.appendTo,
        options.targetEvent && options.targetEvent.target && 
          angular.element(options.targetEvent.target)
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
        materialEffects.popOut(dialog.element, $rootElement);

        // TODO once the done method from the popOut function & ngAnimateStyler works,
        // remove this timeout
        $timeout(dialog.destroy, 200);
      }
      function onRootElementKeyup(e) {
        if (e.keyCode == 27) {
          $timeout(destroyDialog);
        }
      }
    });

    return recentDialog;
  }
}
