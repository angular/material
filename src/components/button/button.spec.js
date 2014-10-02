describe('md-button', function() {

  beforeEach(TestUtil.mockRaf);
  beforeEach(module('material.components.button'));

  it('should have inner-anchor with attrs if href attr is given', inject(function($compile, $rootScope) {

    var button = $compile('<md-button href="/link" rel="foo" target="bar" something="baz">' +
                            '<div>content</div>' +
                          '</md-button>')($rootScope);

    $rootScope.$apply();
    var anchor = button.find('a');
    expect(anchor.length).toBe(1);
    expect(anchor.html()).toContain('<div>content</div>');

    expect(anchor.attr('href')).toBe('/link');
    expect(anchor.attr('rel')).toBe('foo');
    expect(anchor.attr('target')).toBe('bar');
    expect(anchor.attr('something')).toBeFalsy();
  }));

  it('should have inner-anchor with attrs if ng-href attr is given', inject(function($compile, $rootScope) {

    var button = $compile('<md-button ng-href="/link" rel="foo" target="bar" something="baz">' +
                            '<div>content</div>' +
                          '</md-button>')($rootScope);

    $rootScope.$apply();
    var anchor = button.find('a');
    expect(anchor.length).toBe(1);
    expect(anchor.html()).toContain('<div>content</div>');

    expect(anchor.attr('ng-href')).toBe('/link');
    expect(anchor.attr('rel')).toBe('foo');
    expect(anchor.attr('target')).toBe('bar');
    expect(anchor.attr('something')).toBeFalsy();
  }));

  it('should have inner-button with attrs by default', inject(function($compile, $rootScope) {

    var button = $compile('<md-button type="foo" ng-disabled="true" form="bar">' +
                            '<div>content</div>' +
                          '</md-button>')($rootScope);

    $rootScope.$apply();
    var innerButton = button.find('button');
    expect(innerButton.length).toBe(1);
    expect(innerButton.html()).toContain('<div>content</div>');

    expect(innerButton.attr('type')).toBe('foo');
    expect(innerButton.attr('ng-disabled')).toBe('true');
    expect(innerButton.attr('form')).toBe('bar');
  }));

});
