var app = angular.module('toolbarDemo2', ['ngMaterial']);

app.controller('AppCtrl', function($scope) {
  var item = {
    face: '/img/list/60.jpeg',
    what: 'Brunch this weekend?',
    who: 'Min Li Chan',
    notes: "I'll be in your neighborhood doing errands."
  };
  $scope.todos = [];
  for (var i = 0; i < 15; i++) {
    $scope.todos.push({
      face: '/img/list/60.jpeg',
      what: "Brunch this weekend?",
      who: "Min Li Chan",
      notes: "I'll be in your neighborhood doing errands."
    });
  }
});
