describe('mdSubheader', function() {
  var $mdStickyMock,
      basicHtml = '<md-subheader>Hello world!</md-header>',
      pageScope, element, controller;

  var $rootScope, $timeout, $exceptionHandler;

  beforeEach(module('material.components.subheader', function($provide) {
    $mdStickyMock = function() {
      $mdStickyMock.args = Array.prototype.slice.call(arguments);
    };
    $provide.value('$mdSticky', $mdStickyMock);
  }));

  beforeEach(inject(function(_$rootScope_, _$timeout_, _$exceptionHandler_) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $exceptionHandler = _$exceptionHandler_;
  }));

  it('preserves content', function() {
    build('<div><md-subheader>Hello {{ to }}!</md-subheader></div>');
    pageScope.to = 'world';
    pageScope.$digest();

    var subHeader = element.children();

    expect(subHeader.text().trim()).toEqual('Hello world!');
  });

  it('implements $mdSticky', function() {
    build(basicHtml);

    expect($mdStickyMock.args[0]).toBe(pageScope);
  });

  it('applies the theme to the header and clone', function() {
    build('<div md-theme="somethingElse">' + basicHtml + '</div>');

    // Grab the real element
    var element = $mdStickyMock.args[1];

    // The subheader now wraps the clone in a DIV in case of ng-if usage, so we have to search for
    // the proper element.
    var clone = angular.element($mdStickyMock.args[2][0].querySelector('.md-subheader'));

    expect(element.hasClass('md-somethingElse-theme')).toBe(true);
    expect(clone.hasClass('md-somethingElse-theme')).toBe(true);
  });

  it('applies the proper scope to the clone', function() {
    build('<div><md-subheader>Hello {{ to }}!</md-subheader></div>');

    pageScope.to = 'world';
    pageScope.$apply();

    var element = $mdStickyMock.args[1];
    var clone = $mdStickyMock.args[2];

    expect(element.text().trim()).toEqual('Hello world!');
    expect(clone.text().trim()).toEqual('Hello world!');
  });

  it('supports ng-if', function() {
    build('<div><md-subheader ng-if="true">test</md-subheader></div>');

    expect($exceptionHandler.errors).toEqual([]);
    expect(element[0].querySelectorAll('.md-subheader').length).toEqual(1);
  });

  it('supports ng-repeat', function() {
    build('<div><md-subheader ng-repeat="i in [1,2,3]">Test {{i}}</md-subheader></div>');

    expect($exceptionHandler.errors).toEqual([]);
    expect(element[0].querySelectorAll('.md-subheader').length).toEqual(3);
  });

  function build(template) {
    inject(function($compile) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdSubheader');

      pageScope.$apply();
      $timeout.flush();
    });
  }
});
