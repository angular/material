describe('radioButton', function() {
  var CHECKED_CSS = 'material-checked';

  beforeEach(module('material.components.radioButton'));

  it('should set checked css class', inject(function($compile, $rootScope) {
    var element = $compile('<material-radio-group ng-model="color">' +
                            '<material-radio-button value="blue"></material-radio-button>' +
                            '<material-radio-button value="green"></material-radio-button>' +
                          '</material-radio-group>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.color = 'green';
    });

    var rbElements = element.find('material-radio-button');

    expect(rbElements.eq(0).hasClass(CHECKED_CSS)).toEqual(false);
    expect(rbElements.eq(1).hasClass(CHECKED_CSS)).toEqual(true);
  }));

  it('should set roles', inject(function($compile, $rootScope) {

    var element = $compile('<material-radio-group ng-model="color">' +
                            '<material-radio-button value="blue"></material-radio-button>' +
                            '<material-radio-button value="green"></material-radio-button>' +
                          '</material-radio-group>')($rootScope);

    var rbGroupElement = element;
    expect(rbGroupElement.eq(0).attr('role')).toEqual('radiogroup');
    expect(rbGroupElement.find('material-radio-button').eq(0).attr('role')).toEqual('radio');
  }));

  it('should set aria attributes', inject(function($compile, $rootScope) {
    var element = $compile('<material-radio-group ng-model="color">' +
                            '<material-radio-button value="blue"></material-radio-button>' +
                            '<material-radio-button value="green"></material-radio-button>' +
                          '</material-radio-group>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.color = 'green';
    });

    var rbElements = element.find('material-radio-button');

    expect(rbElements.eq(0).attr('aria-checked')).toEqual('false');
    expect(rbElements.eq(1).attr('aria-checked')).toEqual('true');

    expect(element.attr('aria-activedescendant')).toEqual(rbElements.eq(1).attr('id'));
    expect(element.attr('aria-activedescendant')).not.toEqual(rbElements.eq(0).attr('id'));
  }));

  it('should be operable via arrow keys', inject(function($compile, $rootScope) {
    var element = $compile('<material-radio-group ng-model="color">' +
                            '<material-radio-button value="blue"></material-radio-button>' +
                            '<material-radio-button value="green"></material-radio-button>' +
                          '</material-radio-group>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.color = 'blue';
    });

    var rbGroupElement = element.eq(0);
    TestUtil.triggerEvent(rbGroupElement, "keydown", {keyCode: Constant.KEY_CODE.RIGHT_ARROW});

    expect($rootScope.color).toEqual('green');
  }));

  describe('ng core radio button tests', function() {

    it('should noop with no model', inject(function($compile, $rootScope) {
      var el;
      expect(function() {
        el = $compile('<material-radio-group>' +
                              '<material-radio-button value="white">' +
                              '</material-radio-group>')($rootScope);
      }).not.toThrow();
      var rbElements = el.find('material-radio-button');

      // Fire off the render function with no ngModel, make sure nothing
      // goes unexpectedly.
      expect(function() {
        rbElements.eq(0).triggerHandler('click');
      }).not.toThrow();
    }));

    it('should update the model', inject(function($compile, $rootScope) {
      var element = $compile('<material-radio-group ng-model="color">' +
                              '<material-radio-button value="white"></material-radio-button>' +
                              '<material-radio-button value="red"></material-radio-button>' +
                              '<material-radio-button value="blue"></material-radio-button>' +
                            '</material-radio-group>')($rootScope);
      var rbElements = element.find('material-radio-button');

      $rootScope.$apply("color = 'white'");
      expect(rbElements.eq(0).hasClass(CHECKED_CSS)).toBe(true);
      expect(rbElements.eq(1).hasClass(CHECKED_CSS)).toBe(false);
      expect(rbElements.eq(2).hasClass(CHECKED_CSS)).toBe(false);

      $rootScope.$apply("color = 'red'");
      expect(rbElements.eq(0).hasClass(CHECKED_CSS)).toBe(false);
      expect(rbElements.eq(1).hasClass(CHECKED_CSS)).toBe(true);
      expect(rbElements.eq(2).hasClass(CHECKED_CSS)).toBe(false);

      rbElements.eq(2).triggerHandler('click');

      expect($rootScope.color).toBe('blue');
    }));

    it('should be disabled', inject(function($compile, $rootScope) {
      var element = $compile('<material-radio-group ng-model="color">' +
                              '<material-radio-button value="white" disabled></material-radio-button>' +
                              '</material-radio-group>')($rootScope);
      var radio = element.find('material-radio-button');

      $rootScope.$apply('color = null');
      radio.triggerHandler('click');
      expect($rootScope.color).toBe(null);

      radio.removeAttr('disabled');
      radio.triggerHandler('click');
      expect($rootScope.color).toBe('white');
    }));


    it('should allow {{expr}} as value', inject(function($compile, $rootScope) {
      $rootScope.some = 11;
      var element = $compile('<material-radio-group ng-model="value">' +
          '<material-radio-button value="{{some}}"></material-radio-button>' +
          '<material-radio-button value="{{other}}"></<material-radio-button>' +
          '</material-radio-group>')($rootScope);
      var rbElements = element.find('material-radio-button');

      $rootScope.$apply(function() {
        $rootScope.value = 'blue';
        $rootScope.some = 'blue';
        $rootScope.other = 'red';
      });

      expect(rbElements.eq(0).hasClass(CHECKED_CSS)).toBe(true);
      expect(rbElements.eq(1).hasClass(CHECKED_CSS)).toBe(false);

      rbElements.eq(1).triggerHandler('click');
      expect($rootScope.value).toBe('red');

      $rootScope.$apply("other = 'non-red'");

      expect(rbElements.eq(0).hasClass(CHECKED_CSS)).toBe(false);
      expect(rbElements.eq(1).hasClass(CHECKED_CSS)).toBe(false);
    }));

  });
});
