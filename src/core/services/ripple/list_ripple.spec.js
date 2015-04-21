describe('MdListInkRipple', function() {

  beforeEach(module('material.core'));

  var $element, $rootScope, $mdListInkRipple, $mdInkRipple;
  beforeEach(inject(function(_$rootScope_, _$mdListInkRipple_, _$mdInkRipple_) {
    $rootScope = _$rootScope_;
    $mdListInkRipple = _$mdListInkRipple_;
    $mdInkRipple = _$mdInkRipple_;

    $element = jasmine.createSpy('element');
    spyOn($mdInkRipple, 'attach');
  }));

  it('applies the correct ripple configuration', function() {
    $mdListInkRipple.attach($rootScope, $element);

    var expected = {
      center: false,
      dimBackground: true,
      outline: false,
      rippleSize: 'full'
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });

  it('allows ripple configuration to be overridden', function() {
    $mdListInkRipple.attach($rootScope, $element, { center: true, outline: true });

    var expected = {
      center: true,
      dimBackground: true,
      outline: true,
      rippleSize: 'full'
    };

    expect($mdInkRipple.attach).toHaveBeenCalledWith($rootScope, $element, expected);
  });
});
