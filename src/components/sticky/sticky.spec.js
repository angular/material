/*
 * TODO: adjust to work properly with refactors of original code
 */
/*
describe('$mdStickySpec', function() {
  var $document, $compile, $rootScope, $mdSticky;

  beforeEach(module('material.components.sticky'));

  beforeEach(inject(function(_$document_, _$compile_, _$rootScope_, _$mdSticky_) {
    $document = _$document_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $mdSticky = _$mdSticky_;
  }));

  var $container, $firstSticky, $secondSticky, $sticky;
  function setup(opts) {
    opts = opts || {};

    var TEST_HTML = '<md-content><h2>First sticky</h2><h2>Second sticky</h2></md-content>';
    var scope = $rootScope.$new();
    $container = $compile(TEST_HTML)(scope);
    $firstSticky = $container.children().eq(0);
    $secondSticky = $container.children().eq(1);

    // Wire up our special $container instance;
    $firstSticky.controller('mdContent').$element = $container;

    $document.find('body').html('');
    $document.find('body').append($container);


    if(!opts.skipFirst) {
      $mdSticky($rootScope.$new(), $firstSticky);
    }
    if(!opts.skipSecond) {
      $mdSticky($rootScope.$new(), $secondSticky);
    }


    // Overwrite the scrollTop property to return the opts.containerScroll
    if(opts.containerScroll) {
      var originalProp = $container.prop;
      $container.prop = function(prop) {
        if(prop == 'scrollTop') {
          return opts.containerScroll;
        } else {
          originalProp.call($container, prop);
        }
      };
    }

    // Overwrite children() to provide mock rect positions
    if(opts.firstActual) {
      $firstSticky[0].getBoundingClientRect = function() { return opts.firstActual; };
    }
    if(opts.secondActual) {
      $secondSticky[0].getBoundingClientRect = function() { return opts.secondActual; };
    }
    if(opts.firstTarget) {
      var $firstOuter = $firstSticky.parent();
      $firstOuter[0].getBoundingClientRect = function() { return opts.firstTarget; };
    }
    if(opts.secondTarget) {
      var $secondOuter = $secondSticky.parent();
      $secondOuter[0].getBoundingClientRect = function() { return opts.secondTarget; };
    }



    $sticky = $container.data('$sticky');

    if(opts.lastScroll) { $sticky.lastScroll = opts.lastScroll; }

    scope.$digest();
  }

  it('throws an error if uses outside of md-content', inject(function($mdSticky, $compile, $rootScope) {
    var html = '<h2>Hello world!</h2>';
    function useWithoutMdContent() {
      $mdSticky($rootScope.$new(), angular.element(html));
    }
    expect(useWithoutMdContent).toThrow('$mdSticky used outside of md-content');
  }));

  it('adds class md-sticky-active when an element would scroll off screen', function() {
    var firstActual = { top: -10, bottom: 9, height: 19 };
    setup({containerScroll: 10, firstActual: firstActual, skipSecond: true});
    $sticky.check();
    expect($firstSticky.hasClass('md-sticky-active')).toBe(true);
  });

  it('removes class md-sticky-active when an element is no longer sticky', function() {
    var firstTarget = { top: 1, bottom: 10, height: 9 };
    setup({
      containerScroll: 10,
      lastScroll: 11
    });
    $firstSticky.addClass('md-sticky-active');
    $sticky.check();
    expect($firstSticky.hasClass('md-sticky-active')).toBe(false);
  });

  it('pushes the active element when the next sticky element touches it', function() {
    var firstTarget = { top: -10, bottom: 9, height: 19 };
    var firstActual = { top: 0, bottom: 19, height: 19 };
    var secondActual = { top: 18, bottom: 37, height: 19 };
    setup({
      containerScroll: 19,
      firstActual: firstActual,
      firstTarget: firstTarget,
      secondActual: secondActual
    });
    $firstSticky.attr('md-sticky-active', true);
    $sticky.check();
    expect($firstSticky.data('translatedHeight')).toBe(-1);
  });

  it('increments the active element when it is pushed off screen', function() {
    var firstActual = { top: -9, bottom: 0, height: 10 };
    setup({
      containerScroll: 10,
      firstActual: firstActual
    });
    $firstSticky.addClass('md-sticky-active');
    $sticky.check();
    expect($firstSticky.hasClass('md-sticky-active')).toBe(false);
    expect($sticky.targetIndex).toBe(1);
  });

  it('pulls the previous element when the sticky element losens', function() {
    var firstActual = { top: -10, bottom: -1, height: 9 };
    var firstTarget = { top: -50, bottom: -41, height: 9 };
    var secondActual = { top: 0, bottom: 9, height: 9 };
    setup({
      containerScroll: 30,
      lastScroll: 31,
      firstActual: firstActual,
      firstTarget: firstTarget,
      secondTarget: secondActual,
      secondActual: secondActual
    });
    $sticky.targetIndex = 0;
    $firstSticky.data('translatedHeight', -10);
    $firstSticky.addClass('md-sticky-active');
    $sticky.check();
    expect($firstSticky.data('translatedHeight')).toBe(-9);
  });
});
*/
