describe('<md-toolbar>', function() {

  var pageScope, element, controller;
  var $rootScope, $timeout;

  beforeEach(function() {
    module('material.components.toolbar', function($controllerProvider) {
      $controllerProvider.register('MockController', function() {});
    });
  });
  beforeEach(inject(function(_$rootScope_, _$timeout_) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
  }));

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
    spyOn(contentEl, 'css').and.callFake(function(properties, value) {
      if (angular.isObject(properties)) {
        for (k in properties) {
          if (properties.hasOwnProperty(k)) {
            contentCss[k] = properties[k];
          }
        }
      } else {
        contentCss[properties] = value;
      }
    });

    // Manually link so we can give our own elements with spies on them
    mdToolbarDirective[0].link($rootScope, toolbar, {
      mdScrollShrink: true,
      mdShrinkSpeedFactor: 1,
      $observe: function() {}
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
      target: {scrollTop: 500}
    });
    $$rAF.flush();

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-100px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');

    // Fake scroll back to the top
    contentEl.triggerHandler({
      type: 'scroll',
      target: {scrollTop: 0}
    });
    $$rAF.flush();

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');

  }));

  it('works without ng-if', inject(function() {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink="true"></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');
  }));

  it('works with ng-if', inject(function() {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink="true" ng-if="shouldShowToolbar"></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    // It starts out undefined
    expect(element.find('md-content').attr('scroll-shrink')).toEqual(undefined);

    // Change the ng-if to add the toolbar which then injects a scrollShrink
    // on the mdContent
    pageScope.$apply('shouldShowToolbar = true');
    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');

    // Change the ng-if to remove the toolbar
    pageScope.$apply('shouldShowToolbar = false');
    expect(element.find('md-toolbar').length).toBe(0);
  }));

  // The toolbar is like a container component, so we want to make sure it works with ng-controller
  it('works with ng-controller', inject(function($exceptionHandler) {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink ng-controller="MockController"></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    // Expect no errors
    expect($exceptionHandler.errors).toEqual([]);
  }));

  it('disables scroll shrink when the attribute is not provided', inject(function() {
    build(
      '<div>' +
      '  <md-toolbar></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    expect(element.find('md-content').attr('scroll-shrink')).toEqual(undefined);
  }));

  it('enables scroll shrink when the attribute has no value', function() {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');
  });

  it('disables scroll shrink if the expression evaluates to false', function() {
    var pageScope = $rootScope.$new();

    // Set the value to false
    pageScope.$apply('someValue = false');

    // Build the element
    build(
      // Pass our template
      '<div>' +
      '  <md-toolbar md-scroll-shrink="someValue"></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>',

      // Pass our custom pageScope
      pageScope
    );

    // Check that scroll shrink is disabled
    expect(element.find('md-content').attr('scroll-shrink')).toEqual('false');
  });


  function build(template, scope) {
    inject(function($compile) {
      if (scope) {
        pageScope = scope
      } else {
        pageScope = $rootScope.$new();
      }

      element = $compile(template)(pageScope);
      controller = element.controller('mdToolbar');

      pageScope.$apply();
      $timeout.flush();
    });
  }
});
