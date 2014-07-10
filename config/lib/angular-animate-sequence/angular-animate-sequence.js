angular.module('ngAnimateSequence', ['ngAnimate'])

  .factory('$$animateAll', function() {
    return function all(arr, fn) {
      var count = 0;
      for(var i = 0; i < arr.length; i++) {
        arr[i](onChainDone);
      }

      function onChainDone() {
        if(++count == arr.length) fn();
      }
    };
  })

  .provider('$$animateStyler', ['$provide', function($provide) {
    var register = this.register = function(name, factory) {
      $provide.factory(name + 'Styler', factory);
    };

    this.$get = ['$injector', function($injector) {
      register('default', function() {
        return function(element, pre) {
          element.css(pre);
          return function(post, done) {
            element.css(post);
            done();
          }
        };
      });

      return function(name) {
        return $injector.get(name + 'Styler');
      }
    }];
  }])

  .factory('$animateRunner', ['$$animateReflow', '$animate', '$$animateStyler', '$$animateAll', '$timeout',
    function($$animateReflow,   $animate,   $$animateStyler,   $$animateAll,   $timeout) {
      return function(element, options, queue, duration, completeFn) {
        options = options || {};

        var node = element[0];
        var self;
        var index = 0;
        var paused = false;
        var cancelAnimation = angular.noop;

        var styler = angular.isFunction(options.styler)
          ? options.styler
          : angular.isString(options.styler)
          ? $$animateStyler(options.styler)
          : $$animateStyler('default');

        var style = function(element, duration, cssStyles) {
          cssStyles = cssStyles || {};
          var delay = cssStyles.delay;
          delete cssStyles.delay;
          return styler(element, cssStyles, duration, delay);
        };


        completeFn = completeFn || angular.noop;

        function tick(initialTimeout) {
          if (paused) return;

          var step = queue[index++];
          if(!step || !$animate.enabled()) {
            completeFn();
            queue = null;
            return;
          }

          if(angular.isString(step)) {
            self[step].apply(self);
            tick();
            return;
          }

          var time  = step[0];
          var pre   = step[1];
          var post  = step[2];
          var fn    = step[3];

          if(!initialTimeout && index == 1 && time > 0 && time <= 1 && duration > 0) {
            index--;
            $timeout(function() {
              tick(true);
            }, time * duration, false);
            return;
          }

          var animationDuration = time;
          if(duration > 0 && time <= 1) { //Keyframes
            var nextEntry = queue[index];
            var next = angular.isArray(nextEntry) ? nextEntry[0] : 1;
            if(next <= 1) {
              animationDuration = (next - time) * duration;
            }
          }

          var postStyle = style(element, animationDuration, pre);

          accumulatedStyles = angular.extend(accumulatedStyles, pre);
          accumulatedStyles = angular.extend(accumulatedStyles, post);

          $$animateReflow(function() {
            $$animateAll([
              function(done) { postStyle(post || {}, done); },
              function(done) {
                cancelAnimation = fn(element, animationDuration, done) || angular.noop;
              }
            ], tick);
          });

          return self;
        }

        var startingClassName = node.className;
        var accumulatedStyles = {};

        return self = {
          revertStyles : function() {
            angular.forEach(accumulatedStyles, function(_, prop) {
              node.style.removeProperty(prop);
            });
            accumulatedStyles = {};
            return this;
          },

          revertClasses : function() {
            node.className = startingClassName;
            return this;
          },

          next : function() {
            cancelAnimation();
            return tick();
          },

          redo : function() {
            cancelAnimation();
            index--;
            return tick();
          },

          run : function() {
            if (paused) {
              paused = false;
              cancelAnimation();
            }
            return tick();
          },

          pause : function() {
            paused = true;
            cancelAnimation();
            return self;
          },

          restart : function() {
            cancelAnimation();
            index = 0;

            return tick();
          }

        };
      }
    }])

  .factory('$animateSequence', ['$animate', '$animateRunner', '$sniffer',
    function($animate,   $animateRunner,   $sniffer) {
      return function(options) {
        var self, queue = [];

        return self = {
          run : function(element, duration, completeFn) {
            return $animateRunner(element, options, queue, duration, completeFn).next();
          },

          then : function(fn) {
            return addToChain(0, null, null, function(element, duration, done) {
              fn(element, done); 
            });
          },

          animate : function(preOptions, postOptions, time ) {
            if (arguments.length == 2 && !angular.isObject(postOptions)) {
              time = postOptions;
              postOptions = preOptions;
              preOptions  = {};
            } else if(arguments.length == 1) {
              postOptions = preOptions;
              preOptions = {};
            } else {
              postOptions = postOptions || {};
            }

            return addToChain(time || postOptions.duration, preOptions, postOptions, function(_, duration, done) {
              done();
            });
          },

          revertStyles : function() {
            queue.push('revertStyles');
            return self;
          },

          revertClasses : function() {
            queue.push('revertClasses');
            return self;
          },

          revertElement : function() {
            return this.revertStyles().revertClasses();
          },

          enter : function(parent, after, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.enter(element, parent, after, done);
            });
          },

          move : function(parent, after, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.move(element, parent, after, done);
            });
          },

          leave : function(preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.leave(element, done);
            });
          },

          addClass : function(className, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.addClass(element, className, done);
            });
          },

          removeClass : function(className, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.removeClass(element, className, done);
            });
          },

          setClass : function(add, remove, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.setClass(element, add, remove, done)
            });
          }

        };

        /**
         * Append chain step into queue
         * @returns {*} this
         */
        function addToChain(time, pre, post, fn) {
          queue.push([time || 0, addSuffix(pre), addSuffix(post), fn]);
          queue = queue.sort(function(a,b) {
            return a[0] > b[0];
          });
          return self;
        };

        /**
         * For any positional fields, ensure that a `px` suffix
         * is provided.
         * @param target
         * @returns {*}
         */
        function addSuffix(target) {
          var styles = 'top left right bottom ' +
            'x y width height ' +
            'border-width border-radius borderWidth borderRadius' +
            'margin margin-top margin-bottom margin-left margin-right ' +
            'padding padding-left padding-right padding-top padding-bottom'.split(' ');

          angular.forEach(target, function(val, key) {
            var isPositional = styles.indexOf(key) > -1;
            var hasPx        = String(val).indexOf('px') > -1;

            if (isPositional && !hasPx) {
              target[key] = val + 'px';
            }
          });

          return target;
        }
      };
    }]);
