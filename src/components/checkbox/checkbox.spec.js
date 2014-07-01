
describe('materialCheckbox', function() {

  beforeEach(module('material.components.checkbox'));

  it('should set checked css class and aria-checked attributes', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<material-checkbox>' +
                               '<input type="checkbox" ng-model="blue">' +
                             '</material-checkbox>' +
                             '<material-checkbox>' +
                               '<input type="checkbox" ng-model="green">' +
                             '</material-checkbox>' +
                           '</div>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.blue = false;
      $rootScope.green = true;
    });

    var cbElements = element.find('material-checkbox');

    expect(cbElements.eq(0).hasClass('checkbox-checked')).toEqual(false);
    expect(cbElements.eq(0).attr('aria-checked')).toEqual('false');
    expect(cbElements.eq(1).hasClass('checkbox-checked')).toEqual(true);
    expect(cbElements.eq(1).attr('aria-checked')).toEqual('true');
  }));

});
