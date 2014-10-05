
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
       address:   "1600 Amphitheatre Pkwy" ,
       city:      "Mountain View" ,
       state:     "CA" ,
       country:   "USA" ,
       postalCode : "94043"
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
        fid : '@?',
        value : '='
      },
      compile : function() {
        return {
          pre : function(scope, element, attrs) {
            if ( angular.isDefined(attrs.disabled) ) {
              element.attr('disabled', true);
              scope.isDisabled = true;
            }
            scope.label = angular.isUndefined(scope.label) ? attrs.label : "";

            if ( angular.isUndefined(scope.fid) ) {
              scope.fid = scope.label;
            }

            // transpose class settings...
            element.attr('class', attrs.class );
          }
        }
      },
      template:
        '<material-input-group ng-disabled="isDisabled">' +
          '<label for="{{fid}}">{{label}}</label>' +
          '<material-input id="{{fid}}" type="text" ng-model="value">' +
        '</material-input-group>'
    };
  });
