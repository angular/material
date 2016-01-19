describe('md-button', function() {

  beforeEach(module('material.components.button'));

  it('should convert attributes on an md-button to attributes on the generated button', inject(function($compile, $rootScope) {
    var button = $compile('<md-button hide hide-sm></md-button>')($rootScope);
    $rootScope.$apply();
    expect(button[0]).toHaveClass('hide');
    expect(button[0]).toHaveClass('hide-sm');
  }));

  describe('with ARIA support', function() {

    it('should only have one ripple container when a custom ripple color is set', inject(function ($compile, $rootScope) {
      var button = $compile('<md-button md-ink-ripple="#f00">button</md-button>')($rootScope);

      button.triggerHandler({ type: '$md.pressdown', pointer: { x: 0, y: 0 } });
      expect(button[0].getElementsByClassName('md-ripple-container').length).toBe(0);
    }));


    it('should expect an aria-label if element has no text', inject(function($compile, $rootScope, $log) {
      spyOn($log, 'warn');
      var button = $compile('<md-button><md-icon></md-icon></md-button>')($rootScope);
      $rootScope.$apply();
      expect($log.warn).toHaveBeenCalled();

      $log.warn.calls.reset();
      button = $compile('<md-button aria-label="something"><md-icon></md-icon></md-button>')($rootScope);
      $rootScope.$apply();
      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('should expect an aria-label if element has text content', inject(function($compile, $rootScope, $log) {
      spyOn($log, 'warn');

      var button = $compile('<md-button>Hello</md-button>')($rootScope);
      expect(button.attr('aria-label')).toBe("Hello");
      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('should set an aria-label if the text content using bindings', inject(function($$rAF, $compile, $rootScope, $log, $timeout) {
      spyOn($log, 'warn');

      var scope = angular.extend($rootScope.$new(),{greetings : "Welcome"});
      var button = $compile('<md-button>{{greetings}}</md-button>')(scope);

      $rootScope.$apply();
      $$rAF.flush();    // needed for $mdAria.expectAsync()

      expect(button.attr('aria-label')).toBe("Welcome");
      expect($log.warn).not.toHaveBeenCalled();
    }));

  });

  it('should allow attribute directive syntax', inject(function($compile, $rootScope) {
    var button = $compile('<a md-button href="https://google.com">google</a>')($rootScope.$new());
    expect(button.hasClass('md-button')).toBe(true);
  }));

  it('should not set focus state on mousedown', inject(function ($compile, $rootScope){
    var button = $compile('<md-button>')($rootScope.$new());
    $rootScope.$apply();
    button.triggerHandler('mousedown');
    expect(button[0]).not.toHaveClass('md-focused');
  }));

  it('should set focus state on focus and remove on blur', inject(function ($compile, $rootScope){
    var button = $compile('<md-button>')($rootScope.$new());
    $rootScope.$apply();
    button.triggerHandler('focus');
    expect(button[0]).toHaveClass('md-focused');
    button.triggerHandler('blur');
    expect(button[0]).not.toHaveClass('md-focused');
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

    it('should be anchor if ui-sref attr', inject(function($compile, $rootScope) {
      var button = $compile('<md-button ui-sref="state">')($rootScope.$new());
      $rootScope.$apply();
      expect(button[0].tagName.toLowerCase()).toEqual('a');
    }));

    it('should be anchor if ng-link attr', inject(function($compile, $rootScope) {
      var button = $compile('<md-button ng-link="component">')($rootScope.$new());
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

    it('should not trigger click on button when disabled', inject(function ($compile, $rootScope) {
      var clicked = false;
      var onClick = function(){ clicked = true;};
      var scope   = angular.extend( $rootScope.$new(), { isDisabled : true, onClick : onClick} );

      var element = $compile('<md-button ng-disabled="isDisabled" ng-click="onClick()">button</md-button>')(scope);
      $rootScope.$apply();

      element.find('button').triggerHandler('click');
      expect(clicked).toBe(false);
    }));

    it('should not trigger click on anchor when disabled', inject(function ($compile, $rootScope) {
      var clicked = false;
      var onClick = function(){ clicked = true;};
      var scope   = angular.extend( $rootScope.$new(), { isDisabled : true, onClick : onClick} );

      var element = $compile('<md-button ng-disabled="isDisabled" ng-href="#" ng-click="onClick()">button</md-button>')(scope);
      $rootScope.$apply();

      element.find('a').triggerHandler('click');
      expect(clicked).toBe(false);
    }));

  });

});
