describe('mdSubheader', function() {
  var BASIC_SUBHEADER = '<md-subheader>Hello world!</md-subheader>';
  var pageScope, element, cloneElement, controller, contentElement;
  var $rootScope, $timeout, $exceptionHandler;

  beforeEach(module('material.components.subheader', function($provide) {
    $provide.decorator('$mdUtil', function($delegate) {

      // We always return nothing on the checkStickySupport method to test the functionality of the subheaders
      // with the sticky clones behavior.
      $delegate.checkStickySupport = angular.noop;

      return $delegate;
    });
  }));

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

    expect(getElement()).toHaveClass('md-somethingElse-theme');
    expect(getCloneElement()).toHaveClass('md-somethingElse-theme');
  });

  it('applies the proper scope to the clone', function() {
    build(
      '<div>' +
        '<md-subheader>Hello {{ to }}!</md-subheader>' +
      '</div>');

    pageScope.to = 'world';
    pageScope.$apply();

    expect(getElement()[0].textContent.trim()).toEqual('Hello world!');
    expect(getCloneElement()[0].textContent.trim()).toEqual('Hello world!');
  });

  it('supports ng-if', function() {
    build(
      '<div>' +
        '<md-subheader ng-if="isAdded">test</md-subheader>' +
      '</div>'
    );

    expect(isCloneShowing()).toBeFalsy();

    pageScope.$apply('isAdded = true');
    $timeout.flush();

    expect(isCloneShowing()).toBeTruthy();

    // Check if there were no exceptions caused.
    expect($exceptionHandler.errors).toEqual([]);

    function isCloneShowing() {
      var clone = getCloneElement();
      return clone.length && !!clone[0].parentNode;
    }
  });

  it('should support ng-if inside of the sticky clone', function() {
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

  it('should support ng-show on the sticky clone', function() {
    build(
      '<div>' +
        '<md-subheader ng-show="isShowing">Subheader</md-subheader>' +
      '</div>'
    );

    var clone = getCloneElement();

    expect(clone).toHaveClass('ng-hide');

    pageScope.$apply('isShowing = true');

    expect(clone).not.toHaveClass('ng-hide');
  });

  it('should support ng-hide on the sticky clone', function() {
    build(
      '<div>' +
        '<md-subheader ng-hide="isHidden">Subheader</md-subheader>' +
      '</div>'
    );

    var clone = getCloneElement();

    expect(clone).not.toHaveClass('ng-hide');

    pageScope.$apply('isHidden = true');

    expect(clone).toHaveClass('ng-hide');
  });

  it('should work with a ng-if directive inside of the stickyClone', function() {
    build(
      '<div>' +
        '<md-subheader>' +
          '<span ng-repeat="item in [0, 1, 2, 3]">{{ item }}</span>' +
        '</md-subheader>' +
      '</div>'
    );

    var cloneContent = getCloneElement()[0].querySelector('.md-subheader-content');

    expect(cloneContent.children.length).toBe(4);
  });

  it('supports ng-repeat', function() {
    build(
      '<div>' +
        '<md-subheader ng-repeat="i in [1, 2, 3]">Test {{i}}</md-subheader>' +
      '</div>'
    );

    expect(contentElement[0].querySelectorAll('.md-subheader').length).toEqual(6);

    // Check if there were no exceptions caused.
    expect($exceptionHandler.errors).toEqual([]);
  });

  it('adds the proper aria attributes only to the source element', function() {
    build(
      '<div>' +
        '<md-subheader>Subheader</md-subheader>' +
      '</div>'
    );

    expect(element.attr('role')).toBe('heading');
    expect(element.attr('aria-level')).toBe('2');

    expect(cloneElement.attr('role')).toBeFalsy();
    expect(cloneElement.parent().attr('aria-hidden')).toBe('true');
  });

  it('allows for the aria-level to be overwritten', function() {
    build(
      '<div>' +
        '<md-subheader aria-level="1">Subheader</md-subheader>' +
      '</div>'
    );

    expect(element.attr('aria-level')).toBe('1');
  });

  function build(template) {
    inject(function($compile, $timeout) {
      pageScope = $rootScope.$new();

      contentElement = $compile('<md-content>' + template + '</md-content>')(pageScope);

      // Flush the timeout, which prepends the sticky clone to the md-content.
      $timeout.flush();

      element = getElement();
      cloneElement = getCloneElement();

      controller = element.controller('mdSubheader');

      pageScope.$apply();

      // Flush the timeouts for ngIf and ngRepeat, because those will be added within the
      // next tick of the subheader tranclusion.
      $timeout.flush();
    });
  }

  function getCloneElement() {
    // We search for the clone element by using the md-sticky-clone class, which will be automatically added
    // by the $mdSticky service.
    return angular.element(contentElement[0].querySelector('.md-sticky-clone .md-subheader'));
  }

  function getElement() {
    // The *real* element can be found, by search for a subheader, which doesn't have a parent with a unique class,
    // which indicates a $mdSticky clone element.
    var items = contentElement[0].querySelectorAll('.md-subheader');

    return angular.element(checkSubheader(0));

    function checkSubheader(index) {
      var item = items[index];
      if (!item) return;

      return item.parentNode.classList.contains('md-sticky-clone') ? checkSubheader(index + 1) : item;
    }
  }


});
