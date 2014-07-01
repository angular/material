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

    var rbElements = element.find('material-radio-button');

    expect(rbElements.eq(0).hasClass('radio-checked')).toEqual(false);
    expect(rbElements.eq(1).hasClass('radio-checked')).toEqual(true);
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

  it('should add radio buttons w/ ng-repeat, select checked value, remove items', inject(function($compile, $rootScope) {
    var element = $compile('<material-radio-group>' +
                            '<material-radio-button ng-repeat="d in data">' +
                              '<input type="radio" ng-model="color" value="{{ d.value }}">' +
                            '</material-radio-button>' +
                          '</material-radio-group>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.data = [
        { value: 'blue' },
        { value: 'green' }
      ];
      $rootScope.color = 'green';
    });

    var rbElements = element.find('material-radio-button');
    expect(rbElements.eq(0).hasClass('radio-checked')).toEqual(false);
    expect(rbElements.eq(1).hasClass('radio-checked')).toEqual(true);

    $rootScope.$apply(function(){
      $rootScope.data = [
        { value: 'blue' }
      ];
      $rootScope.color = 'green';
    });

    rbElements = element.find('material-radio-button');
    expect(rbElements.length).toEqual(1);
    expect(rbElements.eq(0).hasClass('radio-checked')).toEqual(false);
  }));

});
