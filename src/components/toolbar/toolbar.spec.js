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

    // IE gives us back 'none', everything else gives us back an empty string
    expect(toolbar.css($materialEffects.TRANSFORM)).toMatch(/none|/);
    // IE gives us back '0px', everything else gives us back an empty string
    expect(contentEl.css('margin-top')).toMatch(/0px|/);

    // Fake scroll to the bottom
    TestUtil.triggerEvent(contentEl, 'scroll', {
      target: { scrollTop: 500 }
    });

    // IE gives us back a matrix with -100 in it, everything else gives us -100px
    expect(toolbar.css($materialEffects.TRANSFORM)).toContain('-100');
    expect(contentEl.css('margin-top')).toContain('-100');

    // Fake scroll back to the top
    TestUtil.triggerEvent(contentEl, 'scroll', {
      target: { scrollTop: 0 }
    });

    expect(toolbar.css($materialEffects.TRANSFORM)).toMatch(/none|/);
    expect(contentEl.css('margin-top')).toMatch(/0px|/);

  }));
});
