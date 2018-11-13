(function() {
  angular.module('toastBasicDemo', ['ngMaterial'])
  .controller('AppCtrl', AppCtrl);

  function AppCtrl($mdToast, $log) {
    var ctrl = this;
    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };

    ctrl.toastPosition = angular.extend({}, last);

    ctrl.getToastPosition = function() {
      sanitizePosition();

      return Object.keys(ctrl.toastPosition)
      .filter(function(pos) {
        return ctrl.toastPosition[pos];
      }).join(' ');
    };

    function sanitizePosition() {
      var current = ctrl.toastPosition;

      if (current.bottom && last.top) {
        current.top = false;
      }
      if (current.top && last.bottom) {
        current.bottom = false;
      }
      if (current.right && last.left) {
        current.left = false;
      }
      if (current.left && last.right) {
        current.right = false;
      }

      last = angular.extend({}, current);
    }

    ctrl.showSimpleToast = function() {
      var pinTo = ctrl.getToastPosition();

      $mdToast.show(
        $mdToast.simple()
        .textContent('Simple Toast!')
        .position(pinTo)
        .hideDelay(3000))
      .then(function() {
        $log.log('Toast dismissed.');
      }).catch(function() {
        $log.log('Toast failed or was forced to close early by another toast.');
      });
    };

    ctrl.showActionToast = function() {
      var pinTo = ctrl.getToastPosition();
      var toast = $mdToast.simple()
        .textContent('Marked as read')
        .actionKey('z')
        .actionHint('Press the Control-"z" key combination to ')
        .action('UNDO')
        .dismissHint('Activate the Escape key to dismiss this toast.')
        .highlightAction(true)
        // Accent is used by default, this just demonstrates the usage.
        .highlightClass('md-accent')
        .position(pinTo)
        .hideDelay(0);

      $mdToast.show(toast)
      .then(function(response) {
        if (response === 'ok') {
          alert('You selected the \'UNDO\' action.');
        } else {
          $log.log('Toast dismissed.');
        }
      }).catch(function() {
        $log.log('Toast failed or was forced to close early by another toast.');
      });
    };
  }
})();
