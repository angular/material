var app = angular.module('toolbarDemo2', ['ngMaterial']);

app.controller('AppCtrl', function($scope) {
  var imagePath = 'https://material.angularjs.org/img/list/60.jpeg';

  $scope.todos = [];
  for (var i = 0; i < 15; i++) {
    $scope.todos.push({
      face: imagePath,
      what: "Brunch this weekend?",
      who: "Min Li Chan",
      notes: "I'll be in your neighborhood doing errands."
    });
  }
});
