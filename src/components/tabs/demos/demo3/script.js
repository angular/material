angular.module('app', ['ngMaterial'])
  .controller('AppCtrl', function ($scope) {
    var tabs = [
      { title: 'Polymer', active: true, disabled: false, content: "Polymer practices are great!" },
      { title: 'Material', active: false, disabled: true, content: "Material Design practices are better!" },
      { title: 'Angular', active: false, disabled: true, content: "AngularJS practices are the best!" },
      { title: 'NodeJS', active: false, disabled: false, content: "NodeJS practices are amazing!" }
    ];

    $scope.which = 0;

  });
