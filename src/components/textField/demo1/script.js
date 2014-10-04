
angular.module('textFieldDemo1', ['ngMaterial'])

  /**
   *  Simple controller to build a `user` data model
   *  that will be used to databinding with `<tf-float>` directives
   */
  .controller('DemoController', function($scope) {
    $scope.user = {
       title:     "Project Manager",
       message:   "ipsum lorem id screib",
       firstName: "Naomi",
       lastName:  "" ,
       company:   "Google" ,
       address:   "" ,
       city:      "Mountain View" ,
       state:     "CA" ,
       country:   "USA" ,
       postalCode : ""
    };
  })

  /**
   *  Simple directive used to quickly construct `Floating Label` text fields
   *  NOTE: the label field is considered a constant specified as an attribute
   */
  .directive('tfFloat', function() {
    return {
      restrict: 'E',
      replace: true,
      scope : {
        fid : '@',
        value : '='
      },
      link : function(scope, element, attrs) {
          scope.isDisabled = angular.isDefined(attrs.disabled);
          scope.label = angular.isUndefined(scope.label) ? attrs.label : "";
      },
      template:
        '<material-input-group ng-disabled="isDisabled">' +
          '<label for="{{fid}}">{{label}}</label>' +
          '<material-input id="{{fid}}" type="text" ng-model="value">' +
        '</material-input-group>'
    };
  });
