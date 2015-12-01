var materialBenchmarks = angular.module('materialBenchmarks', ['ngMaterial']);

materialBenchmarks.controller('AppCtrl', function($scope, $compile) {
  $scope.testName = 'Test 500 material design buttons';
  $scope.domAction = function(actionName) {
    if (actionName === 'create') {
      for (i = 0; i <= 500; i++) {
        var html = '<md-button class="md-raised">BTN</md-button>';
        var compiledDirective = $compile(html)($scope);
        $('#benckmarkInsertZone').append(compiledDirective[0]);
      }
    } else {
      $('#benckmarkInsertZone').empty();
    }
  };
});
