
angular.module('app', ['ngMaterial'] )
  .controller('AppCtrl', function( $scope ) {
    var tabs = [
      { title: 'Polymer', active: true,  disabled: false, content:"Polymer practices are great!" },
      { title: 'Material', active: false, disabled: true , content:"Material Design practices are better!" },
      { title: 'Angular', active: false, disabled: true , content:"AngularJS practices are the best!" },
      { title: 'NodeJS' , active: false, disabled: false, content:"NodeJS practices are amazing!" },
      { title: 'Tab 5', active: true,  disabled: false, content:"Tab 5 content..." },
      { title: 'Tab 6', active: false, disabled: true , content:"Tab 6 content..." },
      { title: 'Tab 7', active: false, disabled: true , content:"Tab 7 content..." },
      { title: 'Tab 8' , active: false, disabled: false, content:"Tab 8 content..." },
      { title: 'Tab 9', active: false, disabled: true , content:"Tab 9 content..." },
      { title: 'Tab 10' , active: false, disabled: false, content:"Tab 10 content..." },
      { title: 'Tab 11', active: false, disabled: true , content:"Tab 11 content..." },
      { title: 'Tab 12' , active: false, disabled: false, content:"Tab 12 content..." }
    ];

    $scope.selectedIndex = 0;
    $scope.twoDisabled = true;

  });
