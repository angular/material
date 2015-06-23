describe('MdCheckboxInkRipple', function() {

  beforeEach(module('material.core'));

  var $element, $rootScope, $mdCheckboxInkRipple, $mdInkRipple;
  beforeEach(inject(function(_$rootScope_, _$mdCheckboxInkRipple_, _$mdInkRipple_) {
    $rootScope = _$rootScope_;
    $mdCheckboxInkRipple = _$mdCheckboxInkRipple_;
    $mdInkRipple = _$mdInkRipple_;

    $element = jasmine.createSpy('element');
    spyOn($mdInkRipple, 'attach');
  }));

  it('applies the correct ripple configuration', function() {
    $mdCheckboxInkRipple.attach($rootScope, $element);

    var expected = {
      center: true,
      dimBackground: false,
      fitRipple: true
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });

  it('allows ripple configuration to be overridden', function() {
    $mdCheckboxInkRipple.attach($rootScope, $element, { center: false, fitRipple: false });

    var expected = {
      center: false,
      dimBackground: false,
      fitRipple: false
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });
});
