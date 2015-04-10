describe('<md-toolbar>', function() {

  beforeEach(module('material.components.toolbar'));

  it('with scrollShrink, it should shrink scrollbar when going to bottom', inject(function($compile, $rootScope, $mdConstant, mdToolbarDirective) {

    var parent = angular.element('<div>');
    var toolbar = angular.element('<md-toolbar>');
    var contentEl = angular.element('<div>');
    // Make content and toolbar siblings
    parent.append(toolbar).append(contentEl);

    //Prop will be used for offsetHeight, give a fake offsetHeight
    spyOn(toolbar, 'prop').and.callFake(function() {
      return 100;
    });

    // Fake the css function so we can read css values properly,
    // no matter which browser the tests are being run on.
    // (IE, firefox, chrome all give different results when reading element.style)
    var toolbarCss = {};
    spyOn(toolbar, 'css').and.callFake(function(k, v) {
      toolbarCss[k] = v;
    });
    var contentCss = {};
    spyOn(contentEl, 'css').and.callFake(function(k, v) {
      contentCss[k] = v;
    });

    // Manually link so we can give our own elements with spies on them
    mdToolbarDirective[0].link($rootScope, toolbar, { 
      mdScrollShrink: true,
      mdShrinkSpeedFactor: 1
    });

    $rootScope.$broadcast('$mdContentLoaded', contentEl);

    //Expect everything to be in its proper initial state.
    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss['margin-top']).toEqual('-100px');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');

    // Fake scroll to the bottom
    contentEl.triggerHandler({
      type: 'scroll',
      target: { scrollTop: 500 }
    });

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-100px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');

    // Fake scroll back to the top
    contentEl.triggerHandler({
      type: 'scroll',
      target: { scrollTop: 0 }
    });

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');

  }));
});
