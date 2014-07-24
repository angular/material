/**
 * @ngdoc overview
 * @name material.components.gesture
 *
 * @description
 * A Gesture Service
 */


var gestureModule = angular.module('material.components.gestures', []);

gestureModule.factory('$materialGesture', [ materialGestureService ]);
 
var capitalize = function(s) {
  return s.substring(0,1).toUpperCase() + s.substring(1);
}

// These are the initial gestures that hammer.js 2 supports
var defaultGestures = {
  'pan': ['start', 'move', 'end', 'cancel', 'left', 'right', 'up', 'down'],
  'pinch': ['start', 'move', 'end', 'cancel', 'in', 'out'],
  'press': [],
  'rotate': ['start', 'move', 'end', 'cancel'],
  'swipe': ['left', 'right', 'up', 'down']
};

// Go and create directives for all main events and their partial subtypes,
// ex: pan as the main event, and panstart, panend, etc. as subtypes.
var i, directiveName, eventName;
for(var k in defaultGestures) {
  // Bind root event
  directiveName = 'on' + capitalize(k);
  gestureModule.directive(directiveName, gestureDirective(directiveName, k));

  var extraEvents = defaultGestures[k];
  for(var i = 0 ; i < extraEvents.length; i++) {
    directiveName = 'on' + capitalize(extraEvents[i]) + capitalize(k);
    eventName = k + extraEvents[i];
    gestureModule.directive(directiveName, gestureDirective(directiveName, eventName));
  }
}

/**
 * @ngdoc service
 * @name material.components.gestures.service:$materialGesture
 *
 * @description
 * A service to bind and unbind gesture listeners.
 */

function materialGestureService() {
  return {
    on: function(type, callback, element) {
      var hammer = new Hammer(element[0]);
      console.log(type);
      hammer.on(type, callback);
      return function() {
        hammer.off(type, callback);
      }
    }
  }
}

/**
 * @ngdoc directive
 * @name material.components.gestures.directive:on-*
 *
 * @description
 * An attribute-based directive that makes it easy to bind to
 * gesture events through attributes.
 *
 * @param typeCb the directive name that will also be the callback function, like onPan or onStartPan
 * @param type the event name, like 'pan', or 'startpan'
 */
function gestureDirective(typeCb, type) {

  return [ '$materialGesture', '$parse', function($materialGesture, $parse) {
    return {
      restrict: 'A',

      link: function($scope, $element, $attr) {
        var fn = $parse($attr[typeCb]);
        var callback = function(locals) {
          return fn($scope, locals);
        };
        
        var unbindFn = $materialGesture.on(type, function(event) {
          callback({$event: event});
          $scope.$apply();
        }, $element);

        $scope.$on('$destroy', function() {
          unbindFn();
        });
      }
    };
  }];
}
