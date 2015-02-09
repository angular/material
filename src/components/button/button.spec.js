describe('md-button', function() {

  beforeEach(module('material.components.button'));

  it('should convert attributes on an md-button to attributes on the generated button', inject(function($compile, $rootScope) {
    var button = $compile('<md-button hide hide-sm></md-button>')($rootScope);
    $rootScope.$apply();
    expect(button[0].hasAttribute('hide')).toBe(true);
    expect(button[0].hasAttribute('hide-sm')).toBe(true);
  }));

  it('should only have one ripple container when a custom ripple color is set', inject(function ($compile, $rootScope, $timeout) {
    var button = $compile('<md-button md-ink-ripple="#f00">button</md-button>')($rootScope);

    button.triggerHandler({ type: '$md.pressdown', pointer: { x: 0, y: 0 } });
    expect(button[0].getElementsByClassName('md-ripple-container').length).toBe(1);
  }));


  it('should expect an aria-label if element has no text', inject(function($compile, $rootScope, $log) {
    spyOn($log, 'warn');
    var button = $compile('<md-button><md-icon></md-icon></md-button>')($rootScope);
    $rootScope.$apply();
    expect($log.warn).toHaveBeenCalled();

    $log.warn.reset();
    button = $compile('<md-button aria-label="something"><md-icon></md-icon></md-button>')($rootScope);
    $rootScope.$apply();
    expect($log.warn).not.toHaveBeenCalled();
  }));


  describe('with href or ng-href', function() {

    it('should be anchor if href attr', inject(function($compile, $rootScope) {
      var button = $compile('<md-button href="/link">')($rootScope.$new());
      $rootScope.$apply();
      expect(button[0].tagName.toLowerCase()).toEqual('a');
    }));

    it('should be anchor if ng-href attr', inject(function($compile, $rootScope) {
      var button = $compile('<md-button ng-href="/link">')($rootScope.$new());
      $rootScope.$apply();
      expect(button[0].tagName.toLowerCase()).toEqual('a');
    }));

    it('should be button otherwise', inject(function($compile, $rootScope) {
      var button = $compile('<md-button>')($rootScope.$new());
      $rootScope.$apply();
      expect(button[0].tagName.toLowerCase()).toEqual('button');
    }));

  });


  describe('with ng-disabled', function() {

    it('should not set `tabindex` when used without anchor attributes', inject(function ($compile, $rootScope, $timeout) {
      var scope = angular.extend( $rootScope.$new(), { isDisabled : true } );
      var button = $compile('<md-button ng-disabled="isDisabled">button</md-button>')(scope);
      $rootScope.$apply();

      expect(button[0].hasAttribute('tabindex')).toBe(false);
    }));

    it('should set `tabindex == -1` when used with href', inject(function ($compile, $rootScope, $timeout) {
      var scope = angular.extend( $rootScope.$new(), { isDisabled : true } );
      var button = $compile('<md-button ng-disabled="isDisabled" href="#nowhere">button</md-button>')(scope);

      $rootScope.$apply();
      expect(button.attr('tabindex')).toBe("-1");

      $rootScope.$apply(function(){
        scope.isDisabled = false;
      });
      expect(button.attr('tabindex')).toBe("0");

    }));

    it('should set `tabindex == -1` when used with ng-href', inject(function ($compile, $rootScope, $timeout) {
      var scope = angular.extend( $rootScope.$new(), { isDisabled : true, url : "http://material.angularjs.org" });
      var button = $compile('<md-button ng-disabled="isDisabled" ng-href="url">button</md-button>')(scope);
      $rootScope.$apply();

      expect(button.attr('tabindex')).toBe("-1");
    }));

  });

});
