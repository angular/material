(function() {
  var isDlgOpen;
  var ACTION_RESOLVE = 'undo';
  var UNDO_KEY = 'z';
  var DIALOG_KEY = 'd';

  angular.module('toastCustomDemo', ['ngMaterial'])
  .controller('AppCtrl', AppCtrl)
  .controller('ToastCtrl', ToastCtrl);

  function AppCtrl($mdToast, $log) {
    var ctrl = this;
    var message = 'Custom toast';

    ctrl.showCustomToast = function() {
      $mdToast.show({
        hideDelay: 0,
        position: 'top right',
        controller: 'ToastCtrl',
        controllerAs: 'ctrl',
        bindToController: true,
        locals: {toastMessage: message},
        templateUrl: 'toast-template.html'
      }).then(function(result) {
        if (result === ACTION_RESOLVE) {
          $log.log('Undo action triggered by button.');
        } else if (result === 'key') {
          $log.log('Undo action triggered by hot key: Control-' + UNDO_KEY + '.');
        } else if (result === false) {
          $log.log('Custom toast dismissed by Escape key.');
        } else {
          $log.log('Custom toast hidden automatically.');
        }
      }).catch(function(error) {
        $log.error('Custom toast failure:', error);
      });
    };
  }

  function ToastCtrl($mdToast, $mdDialog, $document, $scope) {
    var ctrl = this;
    ctrl.keyListenerConfigured = false;
    ctrl.undoKey = UNDO_KEY;
    ctrl.dialogKey = DIALOG_KEY;
    setupActionKeyListener();

    ctrl.closeToast = function() {
      if (isDlgOpen) {
        return;
      }

      $mdToast.hide(ACTION_RESOLVE).then(function() {
        isDlgOpen = false;
      });
    };

    ctrl.openMoreInfo = function(e) {
      if (isDlgOpen) {
        return;
      }
      isDlgOpen = true;

      $mdDialog.show(
        $mdDialog.alert()
        .title('More info goes here.')
        .textContent('Something witty.')
        .ariaLabel('More info')
        .ok('Got it')
        .targetEvent(e)
      ).then(function() {
        isDlgOpen = false;
      });
    };

    /**
     * @param {KeyboardEvent} event to handle
     */
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        $mdToast.hide(false);
      }
      if (event.key === UNDO_KEY && event.ctrlKey) {
        $mdToast.hide('key');
      }
      if (event.key === DIALOG_KEY && event.ctrlKey) {
        ctrl.openMoreInfo(event);
      }
    }

    function setupActionKeyListener() {
      if (!ctrl.keyListenerConfigured) {
        $document.on('keydown', handleKeyDown);
        ctrl.keyListenerConfigured = true;
      }
    }

    function removeActionKeyListener() {
      if (ctrl.keyListenerConfigured) {
        $document.off('keydown');
        ctrl.keyListenerConfigured = false;
      }
    }

    $scope.$on('$destroy', function() {
      removeActionKeyListener();
    });
  }
})();
