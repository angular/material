describe('materialTabs directive', function() {
  var tabs;

  function setup( attrs )
  {
    module('material.components.tabs');
    inject(function($compile, $rootScope) {
      tabs = $compile('<material-tabs '+(attrs || '')+'></material-tabs>')($rootScope.$new());
      $rootScope.$apply();
    });
  }

  it('should pass down "nobar" to hide the <div class="selectionBar">', function()
  {
    var tabs         = setup('nobar' ),
        selectionBar = tabs.children(0)[2],
        el           = angular.element(selectionBar )

    expect( el.hasClass('ng-hide') ).toBeTruthy();
  });

});
