var app = angular.module('toolbarDemo4', ['ngMaterial']);

app.controller('AppCtrl', function($scope) {

  $scope.toolbarCondensed = false;

  //listen for the toolbar to be condensed, then set the scope variable
  $scope.$on('$mdToolbarCondensed', function(toolbarElement){
    $scope.toolbarCondensed = true;
  });
  //listen for the toolbar to be expanded, then set the scope variable
  $scope.$on('$mdToolbarExpanded', function(toolbarElement){
    $scope.toolbarCondensed = false;
  });

  var imagePath = 'img/list/60.jpeg';

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
