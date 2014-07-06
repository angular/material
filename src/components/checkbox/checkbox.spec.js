
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

    var inputs = element.find('input');

    expect(inputs[0].checked).toEqual(false);
    expect(inputs[1].checked).toEqual(true);
  }));

});
