describe('swipe', function() {
  var $compile, pageScope;

  beforeEach(module('material.components.swipe'));

  beforeEach(inject(function($injector) {
    $compile = $injector.get('$compile');
    pageScope = $injector.get('$rootScope').$new();
  }));

  it('should apply the specified touch-action to the swipe element', function() {
    var template = '<div md-swipe-left="dummy = 1" md-swipe-touch-action="pan-y"></div>';
    var element = $compile(template)(pageScope);
    pageScope.$apply();

    expect(element[0].style.touchAction).toBe('pan-y');
  });

  it('should apply touch-action: none when no touch-action is specified', function() {
    var template = '<div md-swipe-left="dummy = 1"></div>';
    var element = $compile(template)(pageScope);
    pageScope.$apply();

    expect(element[0].style.touchAction).toBe('none');
  });
});
