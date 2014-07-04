angular.module('material.components.dialog', ['material.services.popup'])
  /**
   * @ngdoc service
   * @name $materialDialog
   * @module material.components.dialog
   */
  .factory('$materialDialog', [
    '$timeout',
    '$materialPopup',
    '$rootElement',
    NgmDialogService
  ]);

function NgmDialogService($timeout, $materialPopup, $rootElement) {
  var recentDialog;

  return showDialog;

  /**
   * TODO fully document this
   * Supports all options from $materialPopup, in addition to `duration` and `position`
   */
  function showDialog(options) {
    options = angular.extend({
      // How long to keep the dialog up, milliseconds
      duration: 3000,
      appendTo: $rootElement,
      clickOutsideToClose: true,
      // Supports any combination of these class names: 'bottom top left right fit'. 
      // Also supports all options from $materialPopup
      transformTemplate: function(template) {
        return '<material-dialog>' + template + '</material-dialog>';
      }
    }, options || {});

    recentDialog && recentDialog.then(function(destroyDialog) {
      destroyDialog();
    });

    recentDialog = $materialPopup(options).then(function(dialog) {
      // Controller will be passed a `$hideDialog` function
      dialog.locals.$hideDialog = destroyDialog;
      dialog.enter(function() {
        dialog.element.on('click', onElementClick);
        $rootElement.on('keyup', onRootElementKeyup);
      });

      return destroyDialog;

      function destroyDialog() {
        dialog.element.off('click', onElementClick);
        $rootElement.off('keyup', onRootElementKeyup);
        dialog.destroy();
      }
      function onRootElementKeyup(e) {
        if (e.keyCode == 27) {
          $timeout(destroyDialog);
        }
      }
      function onElementClick(e) {
        //Close the dialog if click was outside the container
        if (e.target === dialog.element[0]) {
          $timeout(destroyDialog);
        }
      }
    });

    return recentDialog;
  }
}
