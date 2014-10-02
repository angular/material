describe('mdTabs directive', function() {

  beforeEach(TestUtil.mockRaf);
  beforeEach(module('material.components.tabs', 'material.decorators', 'material.services.aria'));

  describe('controller', function(){

    function setup( attrs )
    {
      var el;
      inject(function($compile, $rootScope) {
        el = $compile('<md-tabs '+(attrs || '')+'></md-tabs>')($rootScope);
        $rootScope.$apply();
      });
      return el;
    }

    it('should assign ARIA roles', function(){
      // TODO: this needs more coverage for md-tab
      var el = setup();

      // expect(el.eq(0).attr('role')).toBe('tablist');
    });

    xit('should pass down "nobar" to hide the <div class="selectionBar">', function()
    {
      var tabs         = setup(''),
          selectionBar = tabs.children(0)[2],
          el           = angular.element(selectionBar )

      expect( el.hasClass('ng-hide') ).toBeTruthy();
    });

  })

});
