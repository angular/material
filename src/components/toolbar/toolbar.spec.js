describe('<material-toolbar>', function() {

  beforeEach(module('material.components.toolbar', function($provide) {
    //Create fake raf to instant-trigger the callback
    $provide.value('$$rAF', function(cb) {
      cb();
    });
  }));

  it('with scrollShrink, it should shrink scrollbar when going to bottom', inject(function($compile, $rootScope, $materialEffects, materialToolbarDirective) {

    var parent = angular.element('<div>');
    var toolbar = angular.element('<material-toolbar scroll-shrink>');
    var contentEl = angular.element('<div>');
    // Make content and toolbar siblings
    parent.append(toolbar).append(contentEl);

    //Prop will be used for offsetHeight, give a fake offsetHeight
    spyOn(toolbar, 'prop').andCallFake(function() {
      return 100;
    });

    // Manually link so we can give our own elements with spies on them
    materialToolbarDirective[0].link($rootScope, toolbar, { scrollShrink: true });

    $rootScope.$broadcast('$materialContentLoaded', contentEl);

    expect(toolbar.css($materialEffects.TRANSFORM_PROPERTY)).toEqual('');
    expect(contentEl.css('margin-top')).toEqual('');

    // Fake scroll to the bottom
    TestUtil.triggerEvent(contentEl, 'scroll', {
      target: { scrollTop: 500 }
    });

    expect(toolbar.css($materialEffects.TRANSFORM_PROPERTY)).toContain('-100px');
    expect(contentEl.css('margin-top')).toEqual('-100px');

    // Fake scroll back to the top
    TestUtil.triggerEvent(contentEl, 'scroll', {
      target: { scrollTop: 0 }
    });

    expect(toolbar.css($materialEffects.TRANSFORM_PROPERTY)).toEqual('');
    expect(contentEl.css('margin-top')).toEqual('');

  }));
});
