describe('mdSubheader', function() {
  var BASIC_SUBHEADER = '<md-subheader>Hello world!</md-subheader>';
  var pageScope, element, controller, contentElement;
  var $rootScope, $timeout, $exceptionHandler;

  beforeEach(module('material.components.subheader'));

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $timeout = $injector.get('$timeout');
    $exceptionHandler = $injector.get('$exceptionHandler');
  }));


  it('should have `._md` class indicator', inject(function() {
    build(BASIC_SUBHEADER);

    expect(element.hasClass('_md')).toBe(true);
  }));


  it('preserves content', function() {
    build(
      '<div>' +
        '<md-subheader>Hello {{ to }}!</md-subheader>' +
      '</div>'
    );

    pageScope.to = 'world';
    pageScope.$digest();

    var subHeader = element.children();

    expect(subHeader.text().trim()).toEqual('Hello world!');
  });

  it('implements $mdSticky', function() {
    build(BASIC_SUBHEADER);

    var cloneScope = element.scope();

    expect(cloneScope).toBe(pageScope);
  });

  it('applies the theme to the header and clone', function() {
    build('<div md-theme="somethingElse">' + BASIC_SUBHEADER + '</div>');

    // The subheader now wraps the clone in a DIV in case of ng-if usage, so we have to search for
    // the proper element.
    var clone = getCloneElement();

    expect(getSubheader().classList).toContain('md-somethingElse-theme');
    expect(getSubheader(clone).classList).toContain('md-somethingElse-theme');
  });

  it('applies the proper scope to the clone', function() {
    build('<div><md-subheader>Hello {{ to }}!</md-subheader></div>');

    pageScope.to = 'world';
    pageScope.$apply();

    var clone = getCloneElement();

    expect(getSubheader().textContent.trim()).toEqual('Hello world!');
    expect(getSubheader(clone).textContent.trim()).toEqual('Hello world!');
  });

  it('supports ng-if', function() {
    build('<div><md-subheader ng-if="true">test</md-subheader></div>');

    expect($exceptionHandler.errors).toEqual([]);
    expect(element[0].querySelectorAll('.md-subheader').length).toEqual(1);
  });

  it('should support ng-if inside of stickyClone', function() {
    build(
      '<div>' +
        '<md-subheader>' +
          'Foo' +
          '<span ng-if="isBar">Bar</span>' +
        '</md-subheader>' +
      '</div>'
    );

    var clone = getCloneElement()[0];

    expect(clone.textContent.trim()).toBe('Foo');

    pageScope.$apply('isBar = true');

    expect(clone.textContent.trim()).toBe('FooBar');
  });

  it('should work with a ng-if directive inside of the stickyClone', function() {
    build(
      '<div>' +
        '<md-subheader>' +
          '<span ng-repeat="item in [0, 1, 2, 3]">{{ item }}</span>' +
        '</md-subheader>' +
      '</div>'
    );

    var cloneContent = getCloneElement()[0].querySelector('._md-subheader-content');

    expect(cloneContent.children.length).toBe(4);
  });

  it('supports ng-repeat', function() {
    build('<div><md-subheader ng-repeat="i in [1,2,3]">Test {{i}}</md-subheader></div>');

    expect($exceptionHandler.errors).toEqual([]);
    expect(element[0].querySelectorAll('.md-subheader').length).toEqual(3);
  });

  function build(template) {
    inject(function($compile, $timeout) {
      pageScope = $rootScope.$new();

      contentElement = $compile('<md-content>' + template + '</md-content>')(pageScope);

      // Flush the timeout, which prepends the sticky clone to the md-content.
      $timeout.flush();

      // When the contentElement only has only one children then the current
      // browser supports sticky elements natively.
      if (contentElement.children().length === 1) {
        element = getCloneElement();
      } else {
        // When the browser doesn't support sticky elements natively we will have a sticky clone.
        // The sticky clone element will be always prepended, which means that we have to use the child
        // at the second position.
        element = contentElement.children().eq(1);
      }

      controller = element.controller('mdSubheader');

      pageScope.$apply();
      $timeout.flush();
    });
  }

  function getSubheader(el) {
    return (el || element)[0].querySelector('.md-subheader');
  }
  
  function getCloneElement() {
    // The clone element will be always prepended, which means that we have to get the child at index zero.
    return contentElement.children().eq(0);
  }
});
