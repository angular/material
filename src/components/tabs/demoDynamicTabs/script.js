(function () {
  'use strict';
  angular
      .module('tabsDemoDynamicTabs', ['ngMaterial'])
      .controller('AppCtrl', AppCtrl);

  function AppCtrl ($scope, $log) {
    var tabs = [
        { title: 'Zero (AKA 0, Cero, One - One, -Nineteen + 19, and so forth and so on and continuing into what seems like infinity.)', content: 'Woah...that is a really long title!' },
        { title: 'One', content: "Tabs will become paginated if there isn't enough room for them."},
        { title: 'Two', content: "You can swipe left and right on a mobile device to change tabs."},
        { title: 'Three', content: "You can bind the selected tab via the selected attribute on the md-tabs element."},
        { title: 'Four', content: "If you set the selected tab binding to -1, it will leave no tab selected."},
        { title: 'Five', content: "If you remove a tab, it will try to select a new one."},
        { title: 'Six', content: "There's an ink bar that follows the selected tab, you can turn it off if you want."},
        { title: 'Seven', content: "If you set ng-disabled on a tab, it becomes unselectable. If the currently selected tab becomes disabled, it will try to select the next tab."},
        { title: 'Eight', content: "If you look at the source, you're using tabs to look at a demo for tabs. Recursion!"},
        { title: 'Nine', content: "If you set md-theme=\"green\" on the md-tabs element, you'll get green tabs."},
        { title: 'Ten', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Eleven', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Twelve', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Thirteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Fourteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Fifteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Sixteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Seventeen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Eighteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Nineteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
        { title: 'Twenty', content: "If you're still reading this, you should just go check out the API docs for tabs!"}
      ],
      selected = null,
      previous = null;
    $scope.tabs = tabs;
    $scope.selectedIndex = 0;
    $scope.$watch('selectedIndex', function(current, old) {
      previous = selected;
      selected = tabs[current];
      if (old + 1 && (old !== current)) {
        $log.debug('Goodbye ' + previous.title + '!');
      }
      if (current + 1) {
        $log.debug('Hello ' + selected.title + '!');
      }
    });
    $scope.addTab = function(title, view) {
      view = view || title + " Content View";
      tabs.push({title: title, content: view, disabled: false});
    };
    $scope.removeTab = function(tab) {
      var index = tabs.indexOf(tab);
      tabs.splice(index, 1);
    };
  }
})();

