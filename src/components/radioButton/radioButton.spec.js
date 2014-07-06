describe('radioButton', function() {
  beforeEach(module('material.components.radioButton'));

  it('should set checked css class', inject(function($compile, $rootScope) {
    var element = $compile('<material-radio-group>' +
                            '<material-radio-button>' +
                              '<input type="radio" ng-model="color" value="blue">' +
                            '</material-radio-button>' +
                            '<material-radio-button>' +
                              '<input type="radio" ng-model="color" value="green">' +
                            '</material-radio-button>' +
                          '</material-radio-group>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.color = 'green';
    });

    var inputs = element.find('input');

    expect(inputs[0].checked).toEqual(false);
    expect(inputs[1].checked).toEqual(true);
  }));

  it('should set aria-check attributes', inject(function($compile, $rootScope) {
    var element = $compile('<material-radio-group>' +
                            '<material-radio-button>' +
                              '<input type="radio" ng-model="color" value="blue">' +
                            '</material-radio-button>' +
                            '<material-radio-button>' +
                              '<input type="radio" ng-model="color" value="green">' +
                            '</material-radio-button>' +
                          '</material-radio-group>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.color = 'green';
    });

    var rbElements = element.find('material-radio-button');

    expect(rbElements.eq(0).attr('aria-checked')).toEqual('false');
    expect(rbElements.eq(1).attr('aria-checked')).toEqual('true');
  }));
});
