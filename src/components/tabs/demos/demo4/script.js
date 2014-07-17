angular.module('app', ['ngMaterial'])
  .controller('AppCtrl', function ($scope, $interpolate) {
    var tabs = [
      { title: 'Polymer', active: true, disabled: false, content: "Polymer practices are great!" },
      { title: 'Material', active: false, disabled: true, content: "Material Design practices are better!" },
      { title: 'Angular', active: false, disabled: true, content: "AngularJS practices are the best!" },
      { title: 'NodeJS', active: false, disabled: false, content: "NodeJS practices are amazing!" }
    ];

    $scope.tabs = tabs;
    $scope.predicate = "title";
    $scope.reversed = true;
    $scope.selectedIndex = 2;
    $scope.allowDisable = true;

    $scope.onTabSelected = onTabSelected;
    $scope.announceSelected = announceSelected;
    $scope.announceDeselected = announceDeselected;

    $scope.addTab = function (title, view) {
      view = view || title + " Content View";
      tabs.push({ title: title, content: view, active: false, disabled: false});
    };

    $scope.removeTab = function (tab) {
      for (var j = 0; j < tabs.length; j++) {
        if (tab.title == tabs[j].title) {
          $scope.tabs.splice(j, 1);
          break;
        }
      }
    }

    $scope.submit = function ($event) {
      if ($event.which !== 13) return;
      if ($scope.tTitle != "") {
        $scope.addTab($scope.tTitle, $scope.tContent);
      }
    }

    // **********************************************************
    // Private Methods
    // **********************************************************

    function onTabSelected(tab) {
      $scope.selectedIndex = this.$index;

      $scope.announceSelected(tab);
    }

    function announceDeselected(tab) {
      $scope.farewell = $interpolate("Goodbye {{title}}!")(tab);
    }

    function announceSelected(tab) {
      $scope.greeting = $interpolate("Hello {{title}}!")(tab);
    }

  });

