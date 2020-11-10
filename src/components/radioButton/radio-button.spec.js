describe('mdRadioButton component', function() {

  var CHECKED_CSS = 'md-checked';

  beforeEach(module('material.components.radioButton', 'ngAria'));

  describe('md-radio-group', function() {

    it('should have `._md` class indicator',inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      expect(element.hasClass('_md')).toBe(true);
    }));

    it('should correctly apply the checked class', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $rootScope.$apply('color = "green"');

      var radioButtons = element.find('md-radio-button');

      expect(radioButtons.eq(0).hasClass(CHECKED_CSS)).toEqual(false);
      expect(radioButtons.eq(1).hasClass(CHECKED_CSS)).toEqual(true);
    }));

    it('should support mixed values', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="value">' +
          '<md-radio-button value="1"></md-radio-button>' +
          '<md-radio-button value="2"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $rootScope.$apply('value = 1');

      var radioButtons = element.find('md-radio-button');
      expect(radioButtons.eq(0).hasClass(CHECKED_CSS)).toEqual(true);
    }));

    it('should set the role attribute', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      var radioButton = element.find('md-radio-button').eq(0);

      expect(element.eq(0).attr('role')).toEqual('radiogroup');
      expect(radioButton.attr('role')).toEqual('radio');
    }));

    it('should apply aria state attributes', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $rootScope.$apply('color = "green"');

      var radioButtons = element.find('md-radio-button');

      expect(radioButtons.eq(0).attr('aria-checked')).toEqual('false');
      expect(radioButtons.eq(1).attr('aria-checked')).toEqual('true');

      expect(element.attr('aria-activedescendant')).toEqual(radioButtons.eq(1).attr('id'));
      expect(element.attr('aria-activedescendant')).not.toEqual(radioButtons.eq(0).attr('id'));
    }));

    it('should warn developers if no label is specified', inject(function($compile, $rootScope, $log) {
      spyOn($log, "warn");

      $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      expect($log.warn).toHaveBeenCalled();
    }));

    it('should create an aria label from provided text', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue">Blue</md-radio-button>' +
          '<md-radio-button value="green">Green</md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      var radioButtons = element.find('md-radio-button');
      expect(radioButtons.eq(0).attr('aria-label')).toEqual('Blue');
    }));

    it('should disable all child radio buttons', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color" ng-disabled="isDisabled">' +
          '<md-radio-button value="white"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      var radioButton = element.find('md-radio-button');

      $rootScope.$apply('isDisabled = true');
      $rootScope.$apply('color = null');
      radioButton.triggerHandler('click');

      expect($rootScope.color).toBe(null);

      $rootScope.$apply('isDisabled = false');
      radioButton.triggerHandler('click');

      expect($rootScope.color).toBe('white');
    }));

    it('should preserve tabindex', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color" tabindex="3">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      expect(element.attr('tabindex')).toEqual('3');
    }));

    it('should be operable via arrow keys', inject(function($compile, $rootScope, $mdConstant) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $rootScope.$apply('color = "blue"');

      element.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW,
        currentTarget: element[0],
        target: element[0]
      });

      expect($rootScope.color).toEqual('green');
    }));

    it('should not set focus state on mousedown', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $rootScope.$apply();
      element.triggerHandler('mousedown');

      expect(element).not.toHaveClass('md-focused');
    }));

    it('should apply focus class on focus and remove on blur', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $rootScope.$apply();
      element.triggerHandler('focus');

      expect(element[0]).toHaveClass('md-focused');

      element.triggerHandler('blur');
      expect(element[0]).not.toHaveClass('md-focused');
    }));

    it('should apply focus class on keyboard interaction', inject(function($compile, $rootScope, $mdConstant) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="blue"></md-radio-button>' +
          '<md-radio-button value="green"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $rootScope.$apply();

      element.triggerHandler('mousedown');
      element.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW,
        currentTarget: element[0],
        target: element[0]
      });

      expect(element[0]).toHaveClass('md-focused');
    }));

    it('should apply aria-checked properly when using ng-value', inject(function($compile, $rootScope, $timeout) {
      $rootScope.color = 'blue';

      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button ng-value="\'red\'"></md-radio-button>' +
          '<md-radio-button ng-value="\'blue\'"></md-radio-button>' +
          '<md-radio-button ng-value="\'green\'"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      $timeout.flush();

      var checkedItems = element[0].querySelectorAll('[aria-checked="true"]');
      var uncheckedItems = element[0].querySelectorAll('[aria-checked="false"]');

      expect(checkedItems.length).toBe(1);
      expect(uncheckedItems.length).toBe(2);
      expect(checkedItems[0].getAttribute('value')).toBe($rootScope.color);
    }));

  });

  describe('md-radio-button', function() {

    it('should be static with no model', inject(function($compile, $rootScope) {
      var element;
      expect(function() {
        element = $compile(
          '<md-radio-group>' +
            '<md-radio-button value="white">' +
          '</md-radio-group>')
        ($rootScope);
      }).not.toThrow();

      var radioButtons = element.find('md-radio-button');

      // Fire off the render function with no ngModel, make sure nothing
      // goes unexpectedly.
      expect(function() {
        radioButtons.eq(0).triggerHandler('click');
      }).not.toThrow();
    }));

    it('should update the model', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="white"></md-radio-button>' +
          '<md-radio-button value="red"></md-radio-button>' +
          '<md-radio-button value="blue"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      var radioButtons = element.find('md-radio-button');

      $rootScope.$apply("color = 'white'");
      expect(radioButtons.eq(0).hasClass(CHECKED_CSS)).toBe(true);
      expect(radioButtons.eq(1).hasClass(CHECKED_CSS)).toBe(false);
      expect(radioButtons.eq(2).hasClass(CHECKED_CSS)).toBe(false);

      $rootScope.$apply("color = 'red'");
      expect(radioButtons.eq(0).hasClass(CHECKED_CSS)).toBe(false);
      expect(radioButtons.eq(1).hasClass(CHECKED_CSS)).toBe(true);
      expect(radioButtons.eq(2).hasClass(CHECKED_CSS)).toBe(false);

      radioButtons.eq(2).triggerHandler('click');

      expect($rootScope.color).toBe('blue');
    }));

    it('should trigger a submit action', inject(function($compile, $rootScope, $mdConstant) {

      $rootScope.testValue = false;

      var element = $compile(
        '<div>' +
          '<form ng-submit="testValue = true">' +
            '<md-radio-group ng-model="color">' +
              '<md-radio-button value="white"></md-radio-button>' +
            '</md-radio-group>' +
          '</form>' +
        '</div>')
      ($rootScope);

      var radioGroupElement = element.find('md-radio-group');

      expect($rootScope.testValue).toBeFalsy();

      radioGroupElement.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ENTER
      });

      expect($rootScope.testValue).toBe(true);
    }));

    it('should correctly disable the button', inject(function($compile, $rootScope) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="white" ng-disabled="isDisabled"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      var radioButton = element.find('md-radio-button');

      $rootScope.$apply('isDisabled = true');
      $rootScope.$apply('color = null');
      radioButton.triggerHandler('click');

      expect($rootScope.color).toBe(null);

      $rootScope.$apply('isDisabled = false');
      radioButton.triggerHandler('click');

      expect($rootScope.color).toBe('white');
    }));

    it('should skip disabled on arrow key', inject(function($compile, $rootScope, $mdConstant) {
      var element = $compile(
        '<md-radio-group ng-model="color">' +
          '<md-radio-button value="red"   ></md-radio-button>' +
          '<md-radio-button value="white" ng-disabled="isDisabled"></md-radio-button>' +
          '<md-radio-button value="blue" ></md-radio-button>' +
        '</md-radio-group>'
      )($rootScope);

      $rootScope.$apply('isDisabled = true');
      $rootScope.$apply('color = "red"');
      expect($rootScope.color).toBe("red");


      rightArrow();
      expect($rootScope.color).toEqual('blue');

      rightArrow();
      expect($rootScope.color).toEqual('red');

      rightArrow();
      expect($rootScope.color).toEqual('blue');

      $rootScope.$apply('isDisabled = false');

      rightArrow();

      rightArrow();
      expect($rootScope.color).toEqual('white');

      rightArrow();
      expect($rootScope.color).toEqual('blue');

      function rightArrow() {
        element.triggerHandler({
          type: 'keydown',
          target: element[0],
          currentTarget: element[0],
          keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
        });
      }
    }));

    it('should allow interpolation as a value', inject(function($compile, $rootScope) {
      $rootScope.some = 11;

      var element = $compile(
        '<md-radio-group ng-model="value">' +
          '<md-radio-button value="{{some}}"></md-radio-button>' +
          '<md-radio-button value="{{other}}"></md-radio-button>' +
        '</md-radio-group>')
      ($rootScope);

      var radioButtons = element.find('md-radio-button');

      $rootScope.$apply(function() {
        $rootScope.value = 'blue';
        $rootScope.some = 'blue';
        $rootScope.other = 'red';
      });

      expect(radioButtons.eq(0).hasClass(CHECKED_CSS)).toBe(true);
      expect(radioButtons.eq(1).hasClass(CHECKED_CSS)).toBe(false);

      radioButtons.eq(1).triggerHandler('click');
      expect($rootScope.value).toBe('red');

      $rootScope.$apply("other = 'non-red'");

      expect(radioButtons.eq(0).hasClass(CHECKED_CSS)).toBe(false);
      expect(radioButtons.eq(1).hasClass(CHECKED_CSS)).toBe(false);
    }));

  });
});
