describe('mdProgressLinear', function() {

  var element, $rootScope, $compile, $mdConstant;

  function makeElement(attrs) {
    element = $compile(
      '<div>' +
        '<md-progress-linear ' + (attrs || '') + '></md-progress-linear>' +
      '</div>'
    )($rootScope);

    $rootScope.$digest();
    return element;
  }

  beforeEach(function() {
    module('material.components.progressLinear');

    inject(function(_$compile_, _$rootScope_, _$mdConstant_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $mdConstant = _$mdConstant_;
    });
  });

  afterEach(function() {
    element && element.remove();
  });

  it('should auto-set the md-mode to "indeterminate" if not specified', function() {
    var element = makeElement();
    var progress = element.find('md-progress-linear');

    expect(progress.attr('md-mode')).toEqual('indeterminate');
  });

  it('should auto-set the md-mode to "indeterminate" if specified a not valid mode', function() {
    var element = makeElement('md-mode="test"');
    var progress = element.find('md-progress-linear');

    expect(progress.attr('md-mode')).toEqual('indeterminate');
  });

  it('should trim the md-mode value', function() {
    var element = makeElement('md-mode=" indeterminate"');
    var progress = element.find('md-progress-linear');

    expect(progress.attr('md-mode')).toEqual('indeterminate');
  });

  it('should auto-set the md-mode to "determinate" if not specified but has value', function() {
    var element = makeElement('value="{{progress}}"');
    var progress = element.find('md-progress-linear');

    $rootScope.$apply('progress = 50');

    expect(progress.attr('md-mode')).toEqual('determinate');
  });

  it('should set not transform if mode is undefined', function() {
    var element = makeElement('value="{{progress}}" md-mode="{{mode}}"');
    var bar2 = element[0].querySelector('.md-bar2');

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = '';
    });

    expect(bar2.style[$mdConstant.CSS.TRANSFORM]).toEqual('');
  });

  it('should set transform based on value', function() {
    var element = makeElement('value="{{progress}}" md-mode="determinate"');
    var bar2 = element[0].querySelector('.md-bar2');

    $rootScope.$apply('progress = 50');
    expect(bar2.style[$mdConstant.CSS.TRANSFORM]).toEqual('translateX(-25%) scale(0.5, 1)');
  });

  it('should update aria-valuenow', function() {
    var element = makeElement('value="{{progress}}"');
    var progress = element.find('md-progress-linear');

    $rootScope.$apply('progress = 50');
    expect(progress.eq(0).attr('aria-valuenow')).toEqual('50');
  });

  it('should set transform based on buffer value', function() {
    var element = makeElement('value="{{progress}}" md-buffer-value="{{progress2}}" md-mode="buffer"');
    var bar1 = element[0].querySelector('.md-bar1');

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.progress2 = 75;
    });

    expect(bar1.style[$mdConstant.CSS.TRANSFORM]).toEqual('translateX(-12.5%) scale(0.75, 1)');
  });

  it('should not set transform in query mode', function() {
    var element = makeElement('md-mode="query" value="{{progress}}"');
    var bar2 = element[0].querySelector('.md-bar2');

    $rootScope.$apply('progress = 80');
    expect(bar2.style[$mdConstant.CSS.TRANSFORM]).toBeFalsy();
  });

  describe('disabled mode', function() {
    it('should hide the element', function() {
      var element = makeElement('disabled');
      var progress = element.find('md-progress-linear').eq(0);
      expect(progress.hasClass('_md-progress-linear-disabled')).toBe(true);
    });

    it('should toggle the mode on the container', function() {
      var element = makeElement('md-mode="query" ng-disabled="isDisabled"');
      var container = angular.element(element[0].querySelector('.md-container'));
      var modeClass = 'md-mode-query';

      expect(container.hasClass(modeClass)).toBe(true);

      $rootScope.$apply('isDisabled = true');
      expect(container.hasClass(modeClass)).toBe(false);

      $rootScope.$apply('isDisabled = false');
      expect(container.hasClass(modeClass)).toBe(true);
    });
  });
});
