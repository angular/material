describe('<md-switch>', function() {
  var CHECKED_CSS = 'md-checked';

  beforeEach(TestUtil.mockRaf);
  beforeEach(module('ngAria'));
  beforeEach(module('material.components.switch'));

  it('should set checked css class and aria-checked attributes', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<md-switch ng-model="blue">' +
                             '</md-switch>' +
                             '<md-switch ng-model="green">' +
                             '</md-switch>' +
                           '</div>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.blue = false;
      $rootScope.green = true;
    });

    var cbElements = element.find('.md-switch-thumb');

    expect(cbElements.eq(0).hasClass(CHECKED_CSS)).toEqual(false);
    expect(cbElements.eq(1).hasClass(CHECKED_CSS)).toEqual(true);
    // expect(cbElements.eq(0).attr('aria-checked')).toEqual('false');
    // expect(cbElements.eq(1).attr('aria-checked')).toEqual('true');
    expect(cbElements.eq(0).attr('role')).toEqual('checkbox');
  }));

  it('should be disabled with disabled attr', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<md-switch disabled ng-model="blue">' +
                             '</md-switch>' +
                           '</div>')($rootScope);

    var switchThumb = element.find('.md-switch-thumb');

    $rootScope.$apply('blue = false');

    switchThumb.triggerHandler('click');
    expect($rootScope.blue).toBe(false);

    switchThumb.removeAttr('disabled');

    switchThumb.triggerHandler('click');
    expect($rootScope.blue).toBe(true);
  }));

});
