describe('MdButtonInkRipple', function() {

  beforeEach(module('material.components.button', 'material.core'));

  var $element, $rootScope, $mdButtonInkRipple, $mdInkRipple;
  beforeEach(inject(function(_$rootScope_, _$mdButtonInkRipple_, _$mdInkRipple_) {
    $rootScope = _$rootScope_;
    $mdButtonInkRipple = _$mdButtonInkRipple_;
    $mdInkRipple = _$mdInkRipple_;

    $element = angular.element('<button></button>');
    spyOn($mdInkRipple, 'attach');
  }));

  xit('attaches button ripple effects', inject(function($mdButtonInkRipple, $compile, $rootScope) {
    spyOn($mdButtonInkRipple, 'attach');

    var button = $compile("<md-button class='md-fab'><md-icon><md-icon></md-button>")($rootScope);
    $rootScope.$apply();

    expect($mdButtonInkRipple.attach).toHaveBeenCalledWith($rootScope, button);
  }));


  it('applies the correct ripple configuration for a md-icon-button', function() {
    $element.addClass('md-icon-button');

    $mdButtonInkRipple.attach($rootScope, $element);

    var expected = {
      isMenuItem: false,
      fitRipple: true,
      center: true
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });

  it('applies the correct ripple configuration for all other buttons', function() {
    $mdButtonInkRipple.attach($rootScope, $element);

    var expected = {
      isMenuItem: false,
      dimBackground: true
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });

  it('configures the button as a menu item when it is a md-menu-item', function() {
    $element.addClass('md-menu-item');

    $mdButtonInkRipple.attach($rootScope, $element);

    var expected = {
      isMenuItem: true,
      dimBackground: true
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });

  it('allows ripple configuration to be overridden', function() {
    $mdButtonInkRipple.attach($rootScope, $element, { dimBackground: false });

    var expected = {
      isMenuItem: false,
      dimBackground: false
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });
});
