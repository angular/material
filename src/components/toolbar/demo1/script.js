
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope) {

})

.directive('svgIcon', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<svg viewBox="0 0 24 24" style="pointer-events: none;"><g><g><rect fill="none" width="24" height="24"></rect><path d="M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z"></path></g></g></svg>'
  }
});