angular.module('tabsDemo2', ['ngMaterial'])
  .controller('AppCtrl', function ($scope) {
    var tabs = [
      { title: 'First Tab', content: "Tabs will become paginated if there isn't enough room for them."},
      { title: 'Second Tab', content: "You can swipe left and right on a mobile device to change tabs."},
      { title: 'Third Tab', content: "You can bind the selected tab via the selected attribute on the md-tabs element."},
      { title: 'Fourth Tab', content: "If you set the selected tab binding to -1, it will leave no tab selected."},
      { title: 'Fifth Tab', content: "If you remove a tab, it will try to select a new one."},
      { title: 'Sixth Tab', content: "There's an ink bar that follows the selected tab, you can turn it off if you want."},
      { title: 'Seventh Tab', content: "If you set ng-disabled on a tab, it becomes unselectable. If the currently selected tab becomes disabled, it will try to select the next tab."},
      { title: 'Eighth Tab', content: "If you're still reading this, you should just go check out the API docs for tabs!"}
    ];

    $scope.tabs = tabs;
    $scope.selectedIndex = 2;

    $scope.announceSelected = announceSelected;
    $scope.announceDeselected = announceDeselected;

    $scope.addTab = function (title, view) {
      view = view || title + " Content View";
      tabs.push({ title: title, content: view, disabled: false, style:style});
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

