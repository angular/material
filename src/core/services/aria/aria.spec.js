describe('$mdAria service', function() {

  beforeEach(module('material.core'));

  describe('expecting attributes', function() {

    it('should warn if an invalid element is specified', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var target = $compile('<div></div>')($rootScope);

      $mdAria.expect(null,'aria-label');
      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('should warn if element is missing attribute', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var button = $compile('<button><md-icon></md-icon></button>')($rootScope);

      $mdAria.expect(button, 'aria-label');

      expect($log.warn).toHaveBeenCalled();
    }));

    it('should warn if element is missing attribute value', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var button = $compile('<button aria-label><md-icon></md-icon></button>')($rootScope);

      $mdAria.expect(button, 'aria-label');

      expect($log.warn).toHaveBeenCalled();
    }));

    it('should warn if element is empty attribute', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var button = $compile('<button aria-label=""><md-icon></md-icon></button>')($rootScope);

      $mdAria.expect(button, 'aria-label');

      expect($log.warn).toHaveBeenCalled();
    }));

    it('should not warn if element has text', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var button = $compile('<button>Text</button>')($rootScope);

      $mdAria.expectWithoutText(button, 'aria-label');

      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('should warn if control is missing text', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var radioButton = $compile('<md-radio-button>Text</md-radio-button>')($rootScope);

      $mdAria.expectWithText(radioButton, 'aria-label');

      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('should not warn if child element has attribute', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var button = $compile('<button><md-icon aria-label="text"></md-icon></button>')($rootScope);

      $mdAria.expect(button, 'aria-label');

      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('should warn if child with attribute is hidden', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var container = angular.element(document.body);
      var button = $compile('<button><md-icon aria-label="text" style="display:none;"></md-icon></button>')($rootScope);

      container.append(button);

      $mdAria.expect(button, 'aria-label');

      expect($log.warn).toHaveBeenCalled();

      button.remove();

    }));

    it('should correctly retrieve the aria-label text', inject(function($compile, $rootScope, $mdAria) {
      var container = $compile(
        '<div>' +
          'PLAIN' +
          '<span>SPAN</span>' +
          '<div>DIV</div>' +
        '</div>'
      )($rootScope);

      $mdAria.expectWithText(container, 'aria-label');

      expect(container[0].textContent).toBe('PLAINSPANDIV');
      expect(container.attr('aria-label')).toBe('PLAINSPANDIV');
    }));

    it('should ignore aria-hidden texts when retrieving aria-label', inject(function($compile, $rootScope, $mdAria) {
      var container = $compile(
        '<div>' +
          'PLAIN' +
          '<span aria-hidden="true">SPAN</span>' +
          '<div aria-hidden="true">DIV</div>' +
        '</div>'
      )($rootScope);

      $mdAria.expectWithText(container, 'aria-label');

      expect(container[0].textContent).toBe('PLAINSPANDIV');
      expect(container.attr('aria-label')).toBe('PLAIN');
    }));

  });

  describe('with disabled warnings', function() {

    beforeEach(module('material.core', function($mdAriaProvider) {
      $mdAriaProvider.disableWarnings();
    }));

    it('should not warn if warnings are disabled', inject(function($compile, $rootScope, $log, $mdAria) {
      spyOn($log, 'warn');
      var button = $compile('<button aria-label><md-icon></md-icon></button>')($rootScope);

      $mdAria.expect(button, 'aria-label');

      expect($log.warn).not.toHaveBeenCalled();
    }));

  })

});