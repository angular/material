/*
 * This var has to be outside the angular factory, otherwise when
 * there are multiple material apps on the same page, each app
 * will create its own instance of this array and the app's IDs
 * will not be unique.
 */
var nextUniqueId = 0;

angular.module('material.core')
  .factory('$mdUtil', function ($cacheFactory, $document, $timeout, $q, $window, $mdConstant, $$rAF, $rootScope, $$mdAnimate) {
    var $mdUtil = {
          dom : { },
          now: window.performance ?
            angular.bind(window.performance, window.performance.now) :
            Date.now,

          clientRect: function (element, offsetParent, isOffsetRect) {
            var node = getNode(element);
            offsetParent = getNode(offsetParent || node.offsetParent || document.body);
            var nodeRect = node.getBoundingClientRect();

            // The user can ask for an offsetRect: a rect relative to the offsetParent,
            // or a clientRect: a rect relative to the page
            var offsetRect = isOffsetRect ?
              offsetParent.getBoundingClientRect() :
            {left: 0, top: 0, width: 0, height: 0};
            return {
              left: nodeRect.left - offsetRect.left,
              top: nodeRect.top - offsetRect.top,
              width: nodeRect.width,
              height: nodeRect.height
            };
          },
          offsetRect: function (element, offsetParent) {
            return $mdUtil.clientRect(element, offsetParent, true);
          },

          // Annoying method to copy nodes to an array, thanks to IE
          nodesToArray: function (nodes) {
            nodes = nodes || [ ];

            var results = [];
            for (var i = 0; i < nodes.length; ++i) {
              results.push(nodes.item(i));
            }
            return results;
          },

          // Disables scroll around the passed element.
          disableScrollAround: function (element) {
            $mdUtil.disableScrollAround._count = $mdUtil.disableScrollAround._count || 0;
            ++$mdUtil.disableScrollAround._count;
            if ($mdUtil.disableScrollAround._enableScrolling) return $mdUtil.disableScrollAround._enableScrolling;
            element = angular.element(element);
            var body = $document[0].body,
              restoreBody = disableBodyScroll(),
              restoreElement = disableElementScroll();

            return $mdUtil.disableScrollAround._enableScrolling = function () {
              if (!--$mdUtil.disableScrollAround._count) {
                restoreBody();
                restoreElement();
                delete $mdUtil.disableScrollAround._enableScrolling;
              }
            };

            // Creates a virtual scrolling mask to absorb touchmove, keyboard, scrollbar clicking, and wheel events
            function disableElementScroll() {
              var zIndex = 50;
              var scrollMask = angular.element(
                '<div class="md-scroll-mask" style="z-index: ' + zIndex + '">' +
                '  <div class="md-scroll-mask-bar"></div>' +
                '</div>');
              body.appendChild(scrollMask[0]);

              scrollMask.on('wheel', preventDefault);
              scrollMask.on('touchmove', preventDefault);
              $document.on('keydown', disableKeyNav);

              return function restoreScroll() {
                scrollMask.off('wheel');
                scrollMask.off('touchmove');
                scrollMask[0].parentNode.removeChild(scrollMask[0]);
                $document.off('keydown', disableKeyNav);
                delete $mdUtil.disableScrollAround._enableScrolling;
              };

              // Prevent keypresses from elements inside the body
              // used to stop the keypresses that could cause the page to scroll
              // (arrow keys, spacebar, tab, etc).
              function disableKeyNav(e) {
                //-- temporarily removed this logic, will possibly re-add at a later date
                return;
                if (!element[0].contains(e.target)) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                }
              }

              function preventDefault(e) {
                e.preventDefault();
              }
            }

            // Converts the body to a position fixed block and translate it to the proper scroll
            // position
            function disableBodyScroll() {
              var htmlNode = body.parentNode;
              var restoreHtmlStyle = htmlNode.getAttribute('style') || '';
              var restoreBodyStyle = body.getAttribute('style') || '';
              var scrollOffset = body.scrollTop + body.parentElement.scrollTop;
              var clientWidth = body.clientWidth;

              if (body.scrollHeight > body.clientHeight) {
                applyStyles(body, {
                  position: 'fixed',
                  width: '100%',
                  top: -scrollOffset + 'px'
                });

                applyStyles(htmlNode, {
                  overflowY: 'scroll'
                });
              }


              if (body.clientWidth < clientWidth) applyStyles(body, {overflow: 'hidden'});

              return function restoreScroll() {
                body.setAttribute('style', restoreBodyStyle);
                htmlNode.setAttribute('style', restoreHtmlStyle);
                body.scrollTop = scrollOffset;
              };
            }

            function applyStyles(el, styles) {
              for (var key in styles) {
                el.style[key] = styles[key];
              }
            }
          },
          enableScrolling: function () {
            var method = this.disableScrollAround._enableScrolling;
            method && method();
          },
          floatingScrollbars: function () {
            if (this.floatingScrollbars.cached === undefined) {
              var tempNode = angular.element('<div style="width: 100%; z-index: -1; position: absolute; height: 35px; overflow-y: scroll"><div style="height: 60;"></div></div>');
              $document[0].body.appendChild(tempNode[0]);
              this.floatingScrollbars.cached = (tempNode[0].offsetWidth == tempNode[0].childNodes[0].offsetWidth);
              tempNode.remove();
            }
            return this.floatingScrollbars.cached;
          },

          // Mobile safari only allows you to set focus in click event listeners...
          forceFocus: function (element) {
            var node = element[0] || element;

            document.addEventListener('click', function focusOnClick(ev) {
              if (ev.target === node && ev.$focus) {
                node.focus();
                ev.stopImmediatePropagation();
                ev.preventDefault();
                node.removeEventListener('click', focusOnClick);
              }
            }, true);

            var newEvent = document.createEvent('MouseEvents');
            newEvent.initMouseEvent('click', false, true, window, {}, 0, 0, 0, 0,
              false, false, false, false, 0, null);
            newEvent.$material = true;
            newEvent.$focus = true;
            node.dispatchEvent(newEvent);
          },

          /**
           * supplant() method from Crockford's `Remedial Javascript`
           * Equivalent to use of $interpolate; without dependency on
           * interpolation symbols and scope. Note: the '{<token>}' can
           * be property names, property chains, or array indices.
           */
          supplant : function( template, values, pattern ) {
              pattern = pattern || /\{([^\{\}]*)\}/g;
              return template.replace(pattern, function(a, b) {
                  var p = b.split('.'),
                      r = values;
                  try {
                      for (var s in p) { r = r[p[s]];  }
                  } catch(e){
                      r = a;
                  }
                  return (typeof r === 'string' || typeof r === 'number') ? r : a;
              });
          },

          fakeNgModel: function () {
            return {
              $fake: true,
              $setTouched: angular.noop,
              $setViewValue: function (value) {
                this.$viewValue = value;
                this.$render(value);
                this.$viewChangeListeners.forEach(function (cb) {
                  cb();
                });
              },
              $isEmpty: function (value) {
                return ('' + value).length === 0;
              },
              $parsers: [],
              $formatters: [],
              $viewChangeListeners: [],
              $render: angular.noop
            };
          },

          // Returns a function, that, as long as it continues to be invoked, will not
          // be triggered. The function will be called after it stops being called for
          // N milliseconds.
          // @param wait Integer value of msecs to delay (since last debounce reset); default value 10 msecs
          // @param invokeApply should the $timeout trigger $digest() dirty checking
          debounce: function (func, wait, scope, invokeApply) {
            var timer;

            return function debounced() {
              var context = scope,
                args = Array.prototype.slice.call(arguments);

              $timeout.cancel(timer);
              timer = $timeout(function () {

                timer = undefined;
                func.apply(context, args);

              }, wait || 10, invokeApply);
            };
          },

          // Returns a function that can only be triggered every `delay` milliseconds.
          // In other words, the function will not be called unless it has been more
          // than `delay` milliseconds since the last call.
          throttle: function throttle(func, delay) {
            var recent;
            return function throttled() {
              var context = this;
              var args = arguments;
              var now = $mdUtil.now();

              if (!recent || (now - recent > delay)) {
                func.apply(context, args);
                recent = now;
              }
            };
          },

          /**
           * Measures the number of milliseconds taken to run the provided callback
           * function. Uses a high-precision timer if available.
           */
          time: function time(cb) {
            var start = $mdUtil.now();
            cb();
            return $mdUtil.now() - start;
          },

          /**
           * Get a unique ID.
           *
           * @returns {string} an unique numeric string
           */
          nextUid: function () {
            return '' + nextUniqueId++;
          },

          // Stop watchers and events from firing on a scope without destroying it,
          // by disconnecting it from its parent and its siblings' linked lists.
          disconnectScope: function disconnectScope(scope) {
            if (!scope) return;

            // we can't destroy the root scope or a scope that has been already destroyed
            if (scope.$root === scope) return;
            if (scope.$$destroyed) return;

            var parent = scope.$parent;
            scope.$$disconnected = true;

            // See Scope.$destroy
            if (parent.$$childHead === scope) parent.$$childHead = scope.$$nextSibling;
            if (parent.$$childTail === scope) parent.$$childTail = scope.$$prevSibling;
            if (scope.$$prevSibling) scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
            if (scope.$$nextSibling) scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;

            scope.$$nextSibling = scope.$$prevSibling = null;

          },

          // Undo the effects of disconnectScope above.
          reconnectScope: function reconnectScope(scope) {
            if (!scope) return;

            // we can't disconnect the root node or scope already disconnected
            if (scope.$root === scope) return;
            if (!scope.$$disconnected) return;

            var child = scope;

            var parent = child.$parent;
            child.$$disconnected = false;
            // See Scope.$new for this logic...
            child.$$prevSibling = parent.$$childTail;
            if (parent.$$childHead) {
              parent.$$childTail.$$nextSibling = child;
              parent.$$childTail = child;
            } else {
              parent.$$childHead = parent.$$childTail = child;
            }
          },

          /*
           * getClosest replicates jQuery.closest() to walk up the DOM tree until it finds a matching nodeName
           *
           * @param el Element to start walking the DOM from
           * @param tagName Tag name to find closest to el, such as 'form'
           */
          getClosest: function getClosest(el, tagName, onlyParent) {
            if (el instanceof angular.element) el = el[0];
            tagName = tagName.toUpperCase();
            if (onlyParent) el = el.parentNode;
            if (!el) return null;
            do {
              if (el.nodeName === tagName) {
                return el;
              }
            } while (el = el.parentNode);
            return null;
          },

          /**
           * Functional equivalent for $element.filter(‘md-bottom-sheet’)
           * useful with interimElements where the element and its container are important...
           */
          extractElementByName: function (element, nodeName) {
            for (var i = 0, len = element.length; i < len; i++) {
              if (element[i].nodeName.toLowerCase() === nodeName) {
                return angular.element(element[i]);
              }
            }
            return element;
          },

          /**
           * Give optional properties with no value a boolean true if attr provided or false otherwise
           */
          initOptionalProperties: function (scope, attr, defaults) {
            defaults = defaults || {};
            angular.forEach(scope.$$isolateBindings, function (binding, key) {
              if (binding.optional && angular.isUndefined(scope[key])) {
                var attrIsDefined = angular.isDefined(attr[binding.attrName]);
                scope[key] = angular.isDefined(defaults[key]) ? defaults[key] : attrIsDefined;
              }
            });
          },

          /**
           * Alternative to $timeout calls with 0 delay.
           * nextTick() coalesces all calls within a single frame 
           * to minimize $digest thrashing
           */
          nextTick: function (callback, digest) {
            //-- grab function reference for storing state details
            var nextTick = $mdUtil.nextTick;
            var timeout = nextTick.timeout;
            var queue = nextTick.queue || [];

            //-- set default value for digest to true
            if (digest == null) digest = true;

            //-- store updated digest value
            nextTick.digest = nextTick.digest || digest;

            //-- update queue/digest values
            queue = nextTick.queue || [];
            queue.push(callback);

            //-- set timeout flag to prevent other timeouts from being created until this is finished
            nextTick.timeout = true;

            //-- store the queue
            nextTick.queue = queue;

            //-- return either the existing timeout or the newly created one
            return timeout || (nextTick.timeout = $timeout(processQueue, 0, false));

            /**
             * Grab a copy of the current queue
             * reset the queue just in case any callbacks use nextTick
             * process the existing queue
             * trigger digest if necessary
             */
            function processQueue () {
              var queue = nextTick.queue;
              var digest = nextTick.digest;

              nextTick.queue = [];
              nextTick.callback = false;
              nextTick.timeout = false;
              nextTick.digest = false;

              queue.forEach(function (callback) { callback(); });

              if (digest) $rootScope.$digest();
            }
          }

        };

    // Instantiate other namespace utility methods

    $mdUtil.dom.animator = $$mdAnimate($mdUtil);

    return $mdUtil;

    function getNode(el) {
      return el[0] || el;
    }

  });

/*
 * Since removing jQuery from the demos, some code that uses `element.focus()` is broken.
 *
 * We need to add `element.focus()`, because it's testable unlike `element[0].focus`.
 *
 * TODO(ajoslin): This should be added in a better place later.
 */

angular.element.prototype.focus = angular.element.prototype.focus || function () {
    if (this.length) {
      this[0].focus();
    }
    return this;
  };
angular.element.prototype.blur = angular.element.prototype.blur || function () {
    if (this.length) {
      this[0].blur();
    }
    return this;
  };
