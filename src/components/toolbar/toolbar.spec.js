describe('<md-toolbar>', function() {

  beforeEach(module('material.components.toolbar'));

  it('with scrollShrink, it should shrink scrollbar when going to bottom', inject(function($compile, $rootScope, $mdConstant, mdToolbarDirective, $$rAF) {

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

    $rootScope.$apply();
    $rootScope.$broadcast('$mdContentLoaded', contentEl);
    $$rAF.flush();


    //Expect everything to be in its proper initial state.
    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss['margin-top']).toEqual('-100px');
    expect(contentCss['margin-bottom']).toEqual('-100px');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');

    // Fake scroll to the bottom
    contentEl.triggerHandler({
      type: 'scroll',
      target: { scrollTop: 500 }
    });
    $$rAF.flush();

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-100px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');

    // Fake scroll back to the top
    contentEl.triggerHandler({
      type: 'scroll',
      target: { scrollTop: 0 }
    });
    $$rAF.flush();

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');

  }));
  describe('scroll-fade', function(){
    var parent,
        toolbar,
        expandedEl,
        fadeOutEl,
        fadeInEl,
        toolsEl,
        titleEl,
        contentEl,
        toolbarFab,
        toolbarCss,
        contentCss;
    beforeEach(function(){
      parent = angular.element('<div>');
      toolbar = angular.element('<md-toolbar>');
      expandedEl = angular.element('<div md-expanded>');
      fadeOutEl = angular.element('<div md-fade-out>');
      fadeInEl = angular.element('<div md-fade-in>');
      toolsEl = angular.element('<div class="md-toolbar-tools">');
      titleEl = angular.element('<div md-toolbar-title>');
      toolbarFab = angular.element('<div md-toolbar-fab>');
      contentEl = angular.element('<div>');
      parent.append(toolbar).append(contentEl);

      //Prop will be used for offsetHeight, give a fake offsetHeight
      spyOn(toolbar, 'prop').and.callFake(function() {
        return 100;
      });

      // Fake the css function so we can read css values properly,
      // no matter which browser the tests are being run on.
      // (IE, firefox, chrome all give different results when reading element.style)
      toolbarCss = {};
      spyOn(toolbar, 'css').and.callFake(function(k, v) {
        toolbarCss[k] = v;
      });
      contentCss = {};
      spyOn(contentEl, 'css').and.callFake(function(k, v) {
        contentCss[k] = v;
      });
    });
    it('should shrink and fade when going to bottom', inject(function($compile, $rootScope, $mdConstant, mdToolbarDirective, $$rAF) {
      var parent = angular.element('<div>');
      var toolbar = angular.element('<md-toolbar >');
      var expandedEl = angular.element('<div md-expanded>');
      var fadeEl = angular.element('<div md-fade-out>');
      var fadeInEl = angular.element('<div md-fade-in>');
      var toolsEl = angular.element('<div class="md-toolbar-tools">');
      var contentEl = angular.element('<div>');
      toolbar.append(expandedEl).append(fadeEl).append(fadeInEl).append(toolsEl);
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
        mdScrollFade: true,
        mdShrinkSpeedFactor: 1,
        mdKeepCondensed: 50
      });

      $rootScope.$apply();
      $rootScope.$broadcast('$mdContentLoaded', contentEl);
      $$rAF.flush();


      //Expect everything to be in its proper initial state.
      expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
      expect(contentCss['margin-top']).toEqual('-100px');
      expect(contentCss['margin-bottom']).toEqual('-100px');
      expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');
      expect(expandedEl.css('opacity')).toEqual('1');
      expect(expandedEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 0px, 0px)');
      expect(fadeEl.css('opacity')).toEqual('1');
      expect(fadeInEl.css('opacity')).toEqual('0');
      expect(toolsEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 0px, 0px)');

      // Fake scroll half the scroll height of the toolbar
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 25 }
      });
      $$rAF.flush();

      expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-25px,0)');
      expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,75px,0)');
      expect(expandedEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 0px, 0px)');
      //the toolbar tools should compensate for the toolbar transform
      expect(toolsEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 25px, 0px)');


      // Fake scroll half the ANIMATE_AMOUNT (36) of the toolbar
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 18 }
      });
      $$rAF.flush();

      //The fading elements should be halfway faded
      expect(expandedEl.css('opacity')).toEqual('0.5');
      expect(fadeEl.css('opacity')).toEqual('0.5');
      expect(fadeInEl.css('opacity')).toEqual('0.5');


      // Fake scroll more then the height of the toolbar
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 100 }
      });
      $$rAF.flush();

      expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-50px,0)');
      expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,50px,0)');
      expect(expandedEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 0px, 0px)');
      //The fading elements should be halfway faded
      expect(expandedEl.css('opacity')).toEqual('0');
      expect(fadeEl.css('opacity')).toEqual('0');
      expect(fadeInEl.css('opacity')).toEqual('1');
      //the toolbar tools should compensate for the toolbar transform
      //But at 64 px the tools will scroll, so the height 100px - Animate height 64px = 36px
      expect(toolsEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 36px, 0px)');

    }));
    it('should hide the fab and emit events when collapsed and expanded',inject(function($compile, $rootScope, $mdConstant, mdToolbarDirective, $$rAF) {
      toolbar.append(toolbarFab);

      var expandedEmitted = false;
      $rootScope.$on("$mdToolbarExpanded", function() {
        expandedEmitted = true;
      });
      var condensedEmitted = false;
      $rootScope.$on("$mdToolbarCondensed", function() {
        condensedEmitted = true;
      });

      // Manually link so we can give our own elements with spies on them
      mdToolbarDirective[0].link($rootScope, toolbar, {
        mdScrollFade: true,
        mdKeepCondensed: 64
      });

      $rootScope.$apply();
      $rootScope.$broadcast('$mdContentLoaded', contentEl);
      $$rAF.flush();

      expect(expandedEmitted).toBeTruthy();
      expect(condensedEmitted).toBeFalsy();
      expect(toolbarFab.hasClass('hide')).toBeFalsy();
      expect(toolbarFab.hasClass('show')).toBeTruthy();
      expandedEmitted = false;
      condensedEmitted = false;


      // Fake scroll the scroll height of the toolbar
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 100 }
      });
      $$rAF.flush();

      expect(expandedEmitted).toBeFalsy();
      expect(condensedEmitted).toBeTruthy();
      expect(toolbarFab.hasClass('hide')).toBeTruthy();
      expect(toolbarFab.hasClass('show')).toBeFalsy();
      expandedEmitted = false;
      condensedEmitted = false;

      // Fake scroll back up to the top
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 0 }
      });
      $$rAF.flush();

      expect(expandedEmitted).toBeTruthy();
      expect(condensedEmitted).toBeFalsy();
      expect(toolbarFab.hasClass('hide')).toBeFalsy();
      expect(toolbarFab.hasClass('show')).toBeTruthy();
      expandedEmitted = false;
      condensedEmitted = false;

    }));
    it('should align the content, tools, title and expanded correctly', inject(function($compile, $rootScope, $mdConstant, mdToolbarDirective, $$rAF) {
      toolbar.append(expandedEl).append(toolsEl).append(titleEl);
      expandedEl.attr('md-expanded-keep', 10);
      // Manually link so we can give our own elements with spies on them
      mdToolbarDirective[0].link($rootScope, toolbar, {
        mdScrollFade: true,
        mdShrinkSpeedFactor:.5,
        mdExpandedSpeedFactor:.2,
        mdTitleScaleFactor: 2,
        mdContentSpeedFactor:.8,
        mdContentOffset: 10
      });
      /*
        toolbar height: 100
        speed factor .5 so every 10px scrolled toolbar moves up 5 px
          scroll of 200 for toolbar condensed
        expanded factor .2 so every 10 px scrolled expanded goes up 2px
        content factor .8 so for every 10 px scrolled 2 are hidden
       */

      $rootScope.$apply();
      $rootScope.$broadcast('$mdContentLoaded', contentEl);
      $$rAF.flush();

      expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
      //content should start out at toolbarheight (100) - contentOffset (10)
      expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,90px,0)');
      //expect(contentCss['padding-top']).toEqual('0px');
      expect(expandedEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 0px, 0px)');
      expect(toolsEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 0px, 0px)');
      //The title should translate toolbarheight (100)- MIN_ANIMATE_AMMOUNT 64
      expect(titleEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 36px, 0px) scale(2, 2)');

      // Fake scroll 1/10th the scroll height of the toolbar
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 20 }
      });
      $$rAF.flush();

      //toolbar should move up by the amount of the scroll*shrinkSpeedFactor (20*.5)
      expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-10px,0)');
      //content should be translated down by toolbarHeight (100) - contentOffset (10) - (scrollAmount (20) * shrinkSpeed Factor (.5)) = 80
      expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,80px,0)');
      //Padding should be shrinkSpeed (.5) - contentSpeedFactor (.8) + 1 = .7 * scrollAmount (20) = 14px
      //expect(contentCss['padding-top']).toEqual('14px');
      //Expanded Element by default follows the toolbar, so it should be translated by
      // speedFactor (.5) - expandedSpeedFactor (.2) = .3 * scrollAmount (20) = 6px
      expect(expandedEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 6px, 0px)');
      //Tools by default follow the toolbar so they should be translated down (until MIN_ANIMATE_HEIGHT)
      // by the same amount that the toolbar is translated up
      expect(toolsEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 10px, 0px)');



      // Fake scroll 1/2 the animate height of the toolbar
      // So toolbarHeight-MIN_ANIMATE_HEIGHT = 36*.5 = 64 = ANIMATE_HEIGHT
      // ANIMATE_HEIGHT/2 = 36
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 36 }
      });
      $$rAF.flush();
      //The title should translate by the same as the toolbar (18)
      // Scale should be beginningScale (2) - (scaleAmount [2-1=1] * .5 ((scrollAmount [36] * .5 )/36 [100-64])) = 1.5
      expect(titleEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 18px, 0px) scale(1.5, 1.5)');

      // Fake scroll twice the scroll height of the toolbar
      contentEl.triggerHandler({
        type: 'scroll',
        target: { scrollTop: 200 }
      });
      $$rAF.flush();


      //toolbar should move up by the amount of the scroll (200) * shrink speed (.5) = 100
      expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-100px,0)');
      //content should be translated down by toolbarHeight (100) - contentOffset (10) - (scrollAmount (200) * shrinkSpeed Factor (.5)) = -10 min of 0 so 0
      expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
      //Padding should be shrinkSpeed (.5) - contentSpeedFactor (.8) + 1 = .7 * scrollAmount (200) = 140px
      //expect(contentCss['padding-top']).toEqual('140px');
      //Expanded Element by default follows the toolbar, so it should be translated by
      // speedFactor (.5) - expandedSpeedFactor (.2) = .3 * scrollAmount (200) = 60px
      expect(expandedEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 60px, 0px)');
      //Tools by default follow the toolbar so they should be translated down (until MIN_ANIMATE_HEIGHT)
      expect(toolsEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 36px, 0px)');
      //The title should be back at normal scale and position now
      expect(titleEl.css($mdConstant.CSS.TRANSFORM)).toEqual('translate3d(0px, 0px, 0px) scale(1, 1)');
    }));
  });
});
