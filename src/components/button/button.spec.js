describe('md-button', function() {
  var $compile, $rootScope;

  beforeEach(TestUtil.mockRaf);
  beforeEach(module('material.components.button'));
  beforeEach( inject(function(_$compile_, _$rootScope_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
  }));

  it('should convert attributes on an md-button to attributes on the generated button', function() {
    var button = $compile('<md-button hide hide-sm></md-button>')($rootScope);
    $rootScope.$apply();
    expect(button[0].hasAttribute('hide')).toBe(true);
    expect(button[0].hasAttribute('hide-sm')).toBe(true);
  });

  it('should only have one ripple container when a custom ripple color is set', function() {
    var button = $compile('<md-button md-ink-ripple="#f00">button</md-button>')($rootScope);
    var scope = button.eq(0).scope();
    scope._onInput({ isFirst: true, eventType: Hammer.INPUT_START, center: { x: 0, y: 0 } });
    expect(button[0].getElementsByClassName('md-ripple-container').length).toBe(1);
  });


  it('should expect an aria-label if element has no text', inject(function( $log ) {
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

    it('should be anchor if href attr', function() {
      var button = $compile('<md-button href="/link">')($rootScope.$new());
      $rootScope.$apply();
      expect(button[0].tagName.toLowerCase()).toEqual('a');
    });

    it('should be anchor if ng-href attr', function() {
      var button = $compile('<md-button ng-href="/link">')($rootScope.$new());
      $rootScope.$apply();
      expect(button[0].tagName.toLowerCase()).toEqual('a');
    });

    it('should be button otherwise', function() {
      var button = $compile('<md-button>')($rootScope.$new());
      $rootScope.$apply();
      expect(button[0].tagName.toLowerCase()).toEqual('button');
    });


    describe('and ng-disabled', function() {

      it('should set `tabindex == -1` when used with href', function() {
        var scope = angular.extend( $rootScope.$new(), { isDisabled : true } );
        var button = $compile('<md-button ng-disabled="isDisabled" href="#nowhere">button</md-button>')(scope);

        $rootScope.$apply();
        expect(button.attr('tabindex')).toBe("-1");

        scope.$apply('isDisabled = false');
        expect(button.attr('tabindex')).toBe("0");

      });

      it('should set `tabindex == -1` when used with ng-href', function() {
        var scope = angular.extend( $rootScope.$new(), { isDisabled : true, url : "http://material.angularjs.org" });
        var button = $compile('<md-button ng-disabled="isDisabled" ng-href="url">button</md-button>')(scope);

        $rootScope.$apply();
        expect(button.attr('tabindex')).toBe("-1");
      });

    });

  });


  it('should not set `tabindex` when used as anchor or button', function() {
    var scope = angular.extend( $rootScope.$new(), { isDisabled : true } );
    var button = $compile('<md-button ng-disabled="isDisabled">button</md-button>')(scope);

    $rootScope.$apply();
    expect(button[0].hasAttribute('tabindex')).toBe(false);
  });

  it('should set `tabindex` when used with role="button"', function() {
    var scope = $rootScope.$new();
    var button = $compile('<md-button role="button">button</md-button>')(scope);

    $rootScope.$apply();
    expect(button.attr('tabindex')).toBe("0");

  });

  it('should not modify `tabindex` when used with role="button"', function() {
    var scope = $rootScope.$new();
    var button = $compile('<md-button role="button" tabindex="2">button</md-button>')(scope);

    $rootScope.$apply();
    expect(button.attr('tabindex')).toBe("2");

  });

});
