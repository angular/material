describe('<material-toolbar>', function() {

  beforeEach(module('material.components.toolbar', function($provide) {
    //Create fake raf to instant-trigger the callback
    function raf(cb) { cb(); }
    raf.debounce = function(cb) { 
      var args = arguments;
      return function() {
        return cb.apply(null, arguments);
      };
    };

    $provide.value('$$rAF', raf);
  }));

  it('with scrollShrink, it should shrink scrollbar when going to bottom', inject(function($compile, $rootScope, $materialEffects, materialToolbarDirective) {

    var parent = angular.element('<div>');
    var toolbar = angular.element('<material-toolbar>');
    var contentEl = angular.element('<div>');
    // Make content and toolbar siblings
    parent.append(toolbar).append(contentEl);

    //Prop will be used for offsetHeight, give a fake offsetHeight
    spyOn(toolbar, 'prop').andCallFake(function() {
      return 100;
    });

    // Fake the css function so we can read css values properly,
    // no matter which browser the tests are being run on.
    // (IE, firefox, chrome all give different results when reading element.style)
    var toolbarCss = {};
    spyOn(toolbar, 'css').andCallFake(function(k, v) {
      toolbarCss[k] = v;
    });
    var contentCss = {};
    spyOn(contentEl, 'css').andCallFake(function(k, v) {
      contentCss[k] = v;
    });

    // Manually link so we can give our own elements with spies on them
    materialToolbarDirective[0].link($rootScope, toolbar, { 
      scrollShrink: true,
      shrinkSpeedFactor: 1
    });

    $rootScope.$broadcast('$materialContentLoaded', contentEl);

    //Expect everything to be in its proper initial state.
    expect(toolbarCss[$materialEffects.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss['margin-top']).toEqual('-100px');
    expect(contentCss[$materialEffects.TRANSFORM]).toEqual('translate3d(0,100px,0)');

    // Fake scroll to the bottom
    TestUtil.triggerEvent(contentEl, 'scroll', {
      target: { scrollTop: 500 }
    });

    expect(toolbarCss[$materialEffects.TRANSFORM]).toEqual('translate3d(0,-100px,0)');
    expect(contentCss[$materialEffects.TRANSFORM]).toEqual('translate3d(0,0px,0)');

    // Fake scroll back to the top
    TestUtil.triggerEvent(contentEl, 'scroll', {
      target: { scrollTop: 0 }
    });

    expect(toolbarCss[$materialEffects.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss[$materialEffects.TRANSFORM]).toEqual('translate3d(0,100px,0)');

  }));
});
