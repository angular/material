
angular.module('formDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope) {
  $scope.data = {
     i1 : { label:"FirstName"  , value:"Naomi" },
     i2 : { label:"LastName"   , value:"" },
     i3 : { label:"Company"    , value:"Google" },
     i4 : { label:"Address"    , value:"" },
     i5 : { label:"City"       , value:"Mountain View" },
     i6 : { label:"State"      , value:"CA" },
     i7 : { label:"Country"    , value:"USA" },
     i8 : { label:"Postal Code", value:"" },

     t1 : { label:"Title", value:"" },
     t2 : { label:"Message", value:"ipsum lorem id screib" }
  };

})

.directive('ig', function() {
  return {
    restrict: 'E',
    replace: true,
    scope : {
      fid : '@',
      value : '=',
      label : '='
    },
    link : function(scope, element, attrs) {
        if ( angular.isDefined(attrs.disabled) ) {
          scope.isDisabled = true;
        }
    },
    template:
      '<material-input-group ng-disabled="isDisabled">' +
        '<label for="{{fid}}">{{label}}</label>' +
        '<material-input id="{{fid}}" type="text" ng-model="value">' +
      '</material-input-group>'
  };
});
