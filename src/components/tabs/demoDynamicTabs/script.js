angular.module('tabsDemo2', ['ngMaterial'])
  .controller('AppCtrl', function ($scope) {
    var tabs = [
      { title: 'Polymer', active: true, content: "Polymer practices are great!", style:"tab1"},
      { title: 'Material Design', active: false, content: "Material Design practices are better!", style:"tab2" },
      { title: 'Angular', active: false, content: "AngularJS practices are the best!", style:"tab3" },
      { title: 'NodeJS', active: false, disabled: false, content: "NodeJS practices are amazing!" ,style:"tab4" }
    ];

    $scope.tabs = tabs;
    $scope.selectedIndex = 2;

    $scope.announceSelected = announceSelected;
    $scope.announceDeselected = announceDeselected;

    $scope.addTab = function (title, view) {
      var style = tabs[(tabs.length % 4)].style;
      view = view || title + " Content View";
      tabs.push({ title: title, content: view, active: false, disabled: false, style:style});
    };

    $scope.removeTab = function (tab) {
      for (var j = 0; j < tabs.length; j++) {
        if (tab.title == tabs[j].title) {
          $scope.tabs.splice(j, 1);
          break;
        }
      }
    };

    function announceDeselected(tab) {
      $scope.farewell = 'Goodbye ' + tab.title + '!';
    }

    function announceSelected(tab) {
      $scope.greeting = 'Hello ' + tab.title + '!';
    }

  });

