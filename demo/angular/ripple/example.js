//          var recipe = {
//             steps : [
//               {
//                 'action' : 'addClass',
//                 'name'   : 'ripple',
//                 'from' : {
//                    'left'    : '{ ripple.x }',
//                    'top'     : '{ ripple.y }',
//                    'opacity' : '{ ripple.opacity}',
//                 'to'   : {
//                    'border-width' : '{ ripple.d  }',
//                    'margin-top'   : '{ ripple.tl }',
//                    'margin-left'  : '{ ripple.tl }'
//               },
//               {
//                 'action' : 'animate',
//                 'to'   : { 'opacity' : 0, 'duration':'{ animate.duration }' }
//               },
//               'revertElement'
//             ],
//             'duration' : '750'
//          };


angular.module('materialDemoTabs', ['material.animations', 'material.components.tabs'])
  .controller('myController', function($scope, $log){
    $scope.alert = function( value ){
      //$log.debug( value );
    }
  });
//  .directive('paperRipple', ['paperEffects', function (paperEffects) {
//    return {
//      restrict: 'E',
//      compile: function (element, attr) {
//        var paperCursor = angular.element('<div class="material-ripple-cursor"></div>');
//        var parent = element.parent();
//        var parentNode = parent[0];
//
//        element.after(paperCursor);
//        element.remove( );
//
//        // Configure so ripple wave starts a mouseUp location...
//        parent.on('click', function showRipple(e)
//        {
//          var settings = angular.extend({}, attr, {
//            x: e.offsetX,
//            y: e.offsetY,
//            d: Math.max(parentNode.offsetWidth - e.offsetX, e.offsetX),
//            tl: -Math.max(parentNode.offsetWidth - e.offsetX, e.offsetX),
//            opacity: attr.rippleOpacity || 0.6
//          });
//
//          // Perform ripple effect on `paperCursor` element
//          paperEffects.ripple(paperCursor, settings );
//        });
//
//      }
//    }
//  }]);


//angular.module('qtTabs', ['qtPaperAnimations', 'material.animations']);
//angular.module('qtPaperAnimations', [ 'ngAnimateStylers','ngAnimateSequence' ])
//  .controller('myController', function($scope, $log){
//    $scope.alert = function( value ){
//      $log.debug( value );
//    }
//  })
//  .directive('paperRipple', ['paperEffects', function (paperEffects) {
//    return {
//      restrict: 'E',
//      compile: function (element, attr) {
//        var paperCursor = angular.element('<div class="material-ripple-cursor"></div>');
//        var parent = element.parent();
//        var parentNode = parent[0];
//
//        element.after(paperCursor);
//        element.remove();
//
//        // Configure so ripple wave starts a mouseUp location...
//        parent.on('click', function showRipple(e) {
//          var settings = angular.extend({}, attr, {
//            x: e.offsetX,
//            y: e.offsetY,
//            d: Math.max(parentNode.offsetWidth - e.offsetX, e.offsetX),
//            tl: -Math.max(parentNode.offsetWidth - e.offsetX, e.offsetX),
//            opacity: attr.rippleOpacity || 0.6
//          });
//
//          // Perform ripple effect on `paperCursor` element
//          paperEffects.ripple(paperCursor, settings );
//        });
//
//      }
//    }
//  }]);

