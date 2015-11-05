/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.0.0-rc1
 */
(function( window, angular, undefined ){
"use strict";

(function(){
"use strict";

angular.module('ngMaterial', ["ng","ngAnimate","ngAria","material.core","material.core.gestures","material.core.layout","material.core.theming.palette","material.core.theming","material.core.animate","material.components.autocomplete","material.components.backdrop","material.components.bottomSheet","material.components.button","material.components.card","material.components.checkbox","material.components.chips","material.components.content","material.components.datepicker","material.components.dialog","material.components.divider","material.components.fabActions","material.components.fabShared","material.components.fabSpeedDial","material.components.fabToolbar","material.components.fabTrigger","material.components.gridList","material.components.icon","material.components.input","material.components.list","material.components.menu","material.components.menuBar","material.components.progressCircular","material.components.progressLinear","material.components.radioButton","material.components.select","material.components.sidenav","material.components.slider","material.components.sticky","material.components.subheader","material.components.swipe","material.components.switch","material.components.tabs","material.components.toast","material.components.toolbar","material.components.tooltip","material.components.virtualRepeat","material.components.whiteframe"]);
})();
(function(){
"use strict";

/**
 * Initialization function that validates environment
 * requirements.
 */
angular
  .module('material.core', [
    'ngAnimate',
    'material.core.animate',
    'material.core.layout',
    'material.core.gestures',
    'material.core.theming'
  ])
  .directive('mdTemplate', MdTemplateDirective)
  .config(MdCoreConfigure);

function MdCoreConfigure($provide, $mdThemingProvider) {

  $provide.decorator('$$rAF', ["$delegate", rAFDecorator]);

  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('pink')
    .warnPalette('red')
    .backgroundPalette('grey');
}
MdCoreConfigure.$inject = ["$provide", "$mdThemingProvider"];

function MdTemplateDirective($compile) {
  return {
    restrict: 'A',
    scope: {
      template: '=mdTemplate'
    },
    link: function postLink(scope, element) {
      scope.$watch('template', assignSafeHTML);

      /**
       * To add safe HTML: assign and compile in
       * isolated scope.
       */
      function assignSafeHTML(value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);

        // Compile the new DOM and link it to the current scope.
        // NOTE: we only compile .childNodes so that we don't get
        //       into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      }
    }
  };

}
MdTemplateDirective.$inject = ["$compile"];

function rAFDecorator($delegate) {
  /**
   * Use this to throttle events that come in often.
   * The throttled function will always use the *last* invocation before the
   * coming frame.
   *
   * For example, window resize events that fire many times a second:
   * If we set to use an raf-throttled callback on window resize, then
   * our callback will only be fired once per frame, with the last resize
   * event that happened before that frame.
   *
   * @param {function} callback function to debounce
   */
  $delegate.throttle = function(cb) {
    var queuedArgs, alreadyQueued, queueCb, context;
    return function debounced() {
      queuedArgs = arguments;
      context = this;
      queueCb = cb;
      if (!alreadyQueued) {
        alreadyQueued = true;
        $delegate(function() {
          queueCb.apply(context, Array.prototype.slice.call(queuedArgs));
          alreadyQueued = false;
        });
      }
    };
  };
  return $delegate;
}

})();
(function(){
"use strict";

angular.module('material.core')
.factory('$mdConstant', MdConstantFactory);

/**
 * Factory function that creates the grab-bag $mdConstant service.
 * @ngInject
 */
function MdConstantFactory($sniffer) {

  var webkit = /webkit/i.test($sniffer.vendorPrefix);
  function vendorProperty(name) {
    return webkit ?  ('webkit' + name.charAt(0).toUpperCase() + name.substring(1)) : name;
  }

  return {
    KEY_CODE: {
      ENTER: 13,
      ESCAPE: 27,
      SPACE: 32,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      END: 35,
      HOME: 36,
      LEFT_ARROW : 37,
      UP_ARROW : 38,
      RIGHT_ARROW : 39,
      DOWN_ARROW : 40,
      TAB : 9,
      BACKSPACE: 8,
      DELETE: 46
    },
    CSS: {
      /* Constants */
      TRANSITIONEND: 'transitionend' + (webkit ? ' webkitTransitionEnd' : ''),
      ANIMATIONEND: 'animationend' + (webkit ? ' webkitAnimationEnd' : ''),

      TRANSFORM: vendorProperty('transform'),
      TRANSFORM_ORIGIN: vendorProperty('transformOrigin'),
      TRANSITION: vendorProperty('transition'),
      TRANSITION_DURATION: vendorProperty('transitionDuration'),
      ANIMATION_PLAY_STATE: vendorProperty('animationPlayState'),
      ANIMATION_DURATION: vendorProperty('animationDuration'),
      ANIMATION_NAME: vendorProperty('animationName'),
      ANIMATION_TIMING: vendorProperty('animationTimingFunction'),
      ANIMATION_DIRECTION: vendorProperty('animationDirection')
    },
    MEDIA: {
      'sm': '(max-width: 599px)',
      'gt-sm': '(min-width: 600px)',
      'md': '(min-width: 600px) and (max-width: 959px)',
      'gt-md': '(min-width: 960px)',
      'lg': '(min-width: 960px) and (max-width: 1199px)',
      'gt-lg': '(min-width: 1200px)'
    },
    MEDIA_PRIORITY: [
      'gt-lg',
      'lg',
      'gt-md',
      'md',
      'gt-sm',
      'sm'
    ]
  };
}
MdConstantFactory.$inject = ["$sniffer"];

})();
(function(){
"use strict";

  angular
    .module('material.core')
    .config( ["$provide", function($provide){
       $provide.decorator('$mdUtil', ['$delegate', function ($delegate){
           /**
            * Inject the iterator facade to easily support iteration and accessors
            * @see iterator below
            */
           $delegate.iterator = MdIterator;

           return $delegate;
         }
       ]);
     }]);

  /**
   * iterator is a list facade to easily support iteration and accessors
   *
   * @param items Array list which this iterator will enumerate
   * @param reloop Boolean enables iterator to consider the list as an endless reloop
   */
  function MdIterator(items, reloop) {
    var trueFn = function() { return true; };

    if (items && !angular.isArray(items)) {
      items = Array.prototype.slice.call(items);
    }

    reloop = !!reloop;
    var _items = items || [ ];

    // Published API
    return {
      items: getItems,
      count: count,

      inRange: inRange,
      contains: contains,
      indexOf: indexOf,
      itemAt: itemAt,

      findBy: findBy,

      add: add,
      remove: remove,

      first: first,
      last: last,
      next: angular.bind(null, findSubsequentItem, false),
      previous: angular.bind(null, findSubsequentItem, true),

      hasPrevious: hasPrevious,
      hasNext: hasNext

    };

    /**
     * Publish copy of the enumerable set
     * @returns {Array|*}
     */
    function getItems() {
      return [].concat(_items);
    }

    /**
     * Determine length of the list
     * @returns {Array.length|*|number}
     */
    function count() {
      return _items.length;
    }

    /**
     * Is the index specified valid
     * @param index
     * @returns {Array.length|*|number|boolean}
     */
    function inRange(index) {
      return _items.length && ( index > -1 ) && (index < _items.length );
    }

    /**
     * Can the iterator proceed to the next item in the list; relative to
     * the specified item.
     *
     * @param item
     * @returns {Array.length|*|number|boolean}
     */
    function hasNext(item) {
      return item ? inRange(indexOf(item) + 1) : false;
    }

    /**
     * Can the iterator proceed to the previous item in the list; relative to
     * the specified item.
     *
     * @param item
     * @returns {Array.length|*|number|boolean}
     */
    function hasPrevious(item) {
      return item ? inRange(indexOf(item) - 1) : false;
    }

    /**
     * Get item at specified index/position
     * @param index
     * @returns {*}
     */
    function itemAt(index) {
      return inRange(index) ? _items[index] : null;
    }

    /**
     * Find all elements matching the key/value pair
     * otherwise return null
     *
     * @param val
     * @param key
     *
     * @return array
     */
    function findBy(key, val) {
      return _items.filter(function(item) {
        return item[key] === val;
      });
    }

    /**
     * Add item to list
     * @param item
     * @param index
     * @returns {*}
     */
    function add(item, index) {
      if ( !item ) return -1;

      if (!angular.isNumber(index)) {
        index = _items.length;
      }

      _items.splice(index, 0, item);

      return indexOf(item);
    }

    /**
     * Remove item from list...
     * @param item
     */
    function remove(item) {
      if ( contains(item) ){
        _items.splice(indexOf(item), 1);
      }
    }

    /**
     * Get the zero-based index of the target item
     * @param item
     * @returns {*}
     */
    function indexOf(item) {
      return _items.indexOf(item);
    }

    /**
     * Boolean existence check
     * @param item
     * @returns {boolean}
     */
    function contains(item) {
      return item && (indexOf(item) > -1);
    }

    /**
     * Return first item in the list
     * @returns {*}
     */
    function first() {
      return _items.length ? _items[0] : null;
    }

    /**
     * Return last item in the list...
     * @returns {*}
     */
    function last() {
      return _items.length ? _items[_items.length - 1] : null;
    }

    /**
     * Find the next item. If reloop is true and at the end of the list, it will go back to the
     * first item. If given, the `validate` callback will be used to determine whether the next item
     * is valid. If not valid, it will try to find the next item again.
     *
     * @param {boolean} backwards Specifies the direction of searching (forwards/backwards)
     * @param {*} item The item whose subsequent item we are looking for
     * @param {Function=} validate The `validate` function
     * @param {integer=} limit The recursion limit
     *
     * @returns {*} The subsequent item or null
     */
    function findSubsequentItem(backwards, item, validate, limit) {
      validate = validate || trueFn;

      var curIndex = indexOf(item);
      while (true) {
        if (!inRange(curIndex)) return null;

        var nextIndex = curIndex + (backwards ? -1 : 1);
        var foundItem = null;
        if (inRange(nextIndex)) {
          foundItem = _items[nextIndex];
        } else if (reloop) {
          foundItem = backwards ? last() : first();
          nextIndex = indexOf(foundItem);
        }

        if ((foundItem === null) || (nextIndex === limit)) return null;
        if (validate(foundItem)) return foundItem;

        if (angular.isUndefined(limit)) limit = nextIndex;

        curIndex = nextIndex;
      }
    }
  }


})();
(function(){
"use strict";

angular.module('material.core')
.factory('$mdMedia', mdMediaFactory);

/**
 * @ngdoc service
 * @name $mdMedia
 * @module material.core
 *
 * @description
 * `$mdMedia` is used to evaluate whether a given media query is true or false given the
 * current device's screen / window size. The media query will be re-evaluated on resize, allowing
 * you to register a watch.
 *
 * `$mdMedia` also has pre-programmed support for media queries that match the layout breakpoints.
 *  (`sm`, `gt-sm`, `md`, `gt-md`, `lg`, `gt-lg`).
 *
 * @returns {boolean} a boolean representing whether or not the given media query is true or false.
 *
 * @usage
 * <hljs lang="js">
 * app.controller('MyController', function($mdMedia, $scope) {
 *   $scope.$watch(function() { return $mdMedia('lg'); }, function(big) {
 *     $scope.bigScreen = big;
 *   });
 *
 *   $scope.screenIsSmall = $mdMedia('sm');
 *   $scope.customQuery = $mdMedia('(min-width: 1234px)');
 *   $scope.anotherCustom = $mdMedia('max-width: 300px');
 * });
 * </hljs>
 */

function mdMediaFactory($mdConstant, $rootScope, $window) {
  var queries = {};
  var mqls = {};
  var results = {};
  var normalizeCache = {};

  $mdMedia.getResponsiveAttribute = getResponsiveAttribute;
  $mdMedia.getQuery = getQuery;
  $mdMedia.watchResponsiveAttributes = watchResponsiveAttributes;

  return $mdMedia;

  function $mdMedia(query) {
    var validated = queries[query];
    if (angular.isUndefined(validated)) {
      validated = queries[query] = validate(query);
    }

    var result = results[validated];
    if (angular.isUndefined(result)) {
      result = add(validated);
    }

    return result;
  }

  function validate(query) {
    return $mdConstant.MEDIA[query] ||
           ((query.charAt(0) !== '(') ? ('(' + query + ')') : query);
  }

  function add(query) {
    var result = mqls[query] = $window.matchMedia(query);
    result.addListener(onQueryChange);
    return (results[result.media] = !!result.matches);
  }

  function onQueryChange(query) {
    $rootScope.$evalAsync(function() {
      results[query.media] = !!query.matches;
    });
  }

  function getQuery(name) {
    return mqls[name];
  }

  function getResponsiveAttribute(attrs, attrName) {
    for (var i = 0; i < $mdConstant.MEDIA_PRIORITY.length; i++) {
      var mediaName = $mdConstant.MEDIA_PRIORITY[i];
      if (!mqls[queries[mediaName]].matches) {
        continue;
      }

      var normalizedName = getNormalizedName(attrs, attrName + '-' + mediaName);
      if (attrs[normalizedName]) {
        return attrs[normalizedName];
      }
    }

    // fallback on unprefixed
    return attrs[getNormalizedName(attrs, attrName)];
  }

  function watchResponsiveAttributes(attrNames, attrs, watchFn) {
    var unwatchFns = [];
    attrNames.forEach(function(attrName) {
      var normalizedName = getNormalizedName(attrs, attrName);
      if (angular.isDefined(attrs[normalizedName])) {
        unwatchFns.push(
            attrs.$observe(normalizedName, angular.bind(void 0, watchFn, null)));
      }

      for (var mediaName in $mdConstant.MEDIA) {
        normalizedName = getNormalizedName(attrs, attrName + '-' + mediaName);
        if (angular.isDefined(attrs[normalizedName])) {
          unwatchFns.push(
              attrs.$observe(normalizedName, angular.bind(void 0, watchFn, mediaName)));
        }
      }
    });

    return function unwatch() {
      unwatchFns.forEach(function(fn) { fn(); })
    };
  }

  // Improves performance dramatically
  function getNormalizedName(attrs, attrName) {
    return normalizeCache[attrName] ||
        (normalizeCache[attrName] = attrs.$normalize(attrName));
  }
}
mdMediaFactory.$inject = ["$mdConstant", "$rootScope", "$window"];

})();
(function(){
"use strict";

/*
 * This var has to be outside the angular factory, otherwise when
 * there are multiple material apps on the same page, each app
 * will create its own instance of this array and the app's IDs
 * will not be unique.
 */
var nextUniqueId = 0;

angular
  .module('material.core')
  .factory('$mdUtil', UtilFactory);

function UtilFactory($document, $timeout, $compile, $rootScope, $$mdAnimate, $interpolate, $log) {
  // Setup some core variables for the processTemplate method
  var startSymbol = $interpolate.startSymbol(),
    endSymbol = $interpolate.endSymbol(),
    usesStandardSymbols = ((startSymbol === '{{') && (endSymbol === '}}'));

  var $mdUtil = {
    dom: {},
    now: window.performance ?
      angular.bind(window.performance, window.performance.now) : Date.now || function() {
      return new Date().getTime();
    },

    clientRect: function(element, offsetParent, isOffsetRect) {
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
    offsetRect: function(element, offsetParent) {
      return $mdUtil.clientRect(element, offsetParent, true);
    },

    // Annoying method to copy nodes to an array, thanks to IE
    nodesToArray: function(nodes) {
      nodes = nodes || [];

      var results = [];
      for (var i = 0; i < nodes.length; ++i) {
        results.push(nodes.item(i));
      }
      return results;
    },

    /**
     * Calculate the positive scroll offset
     * TODO: Check with pinch-zoom in IE/Chrome;
     *       https://code.google.com/p/chromium/issues/detail?id=496285
     */
    scrollTop: function(element) {
      element = angular.element(element || $document[0].body);

      var body = (element[0] == $document[0].body) ? $document[0].body : undefined;
      var scrollTop = body ? body.scrollTop + body.parentElement.scrollTop : 0;

      // Calculate the positive scroll offset
      return scrollTop || Math.abs(element[0].getBoundingClientRect().top);
    },

    /**
     * `findFocusTarget()` provides an optional way to identify the focused element when a dialog, bottomsheet, sideNav
     * or other element opens. This is optional attribute finds a nested element with the mdAutoFocus attribute and optional
     * expression. An expression may be specified as the directive value; to enable conditional activation of the autoFocus.
     *
     * NOTE: It is up to the component logic to use the '$mdUtil.findFocusTarget()'
     *
     * @usage
     * <hljs lang="html">
     * <md-dialog>
     *   <form>
     *     <md-input-container>
     *       <label for="testInput">Label</label>
     *       <input id="testInput" type="text" md-autofocus>
     *     </md-input-container>
     *   </form>
     * </md-dialog>
     * </hljs>
     *
     *<hljs lang="html">
     * <md-bottom-sheet class="md-list md-has-header">
     *  <md-subheader>Comment Actions</md-subheader>
     *  <md-list>
     *    <md-list-item ng-repeat="item in items">
     *
     *      <md-button md-autofocus="$index == 2">
     *        <md-icon md-svg-src="{{item.icon}}"></md-icon>
     *        <span class="md-inline-list-icon-label">{{ item.name }}</span>
     *      </md-button>
     *
     *    </md-list-item>
     *  </md-list>
     * </md-bottom-sheet>
     *</hljs>
     **/
    findFocusTarget: function(containerEl, attributeVal) {
      var AUTO_FOCUS = '[md-autofocus]';
      var elToFocus;

      elToFocus = scanForFocusable(containerEl, attributeVal || AUTO_FOCUS);

      if ( !elToFocus && attributeVal != AUTO_FOCUS) {
        // Scan for deprecated attribute
        elToFocus = scanForFocusable(containerEl, '[md-auto-focus]');

        if ( !elToFocus ) {
          // Scan for fallback to 'universal' API
          elToFocus = scanForFocusable(containerEl, AUTO_FOCUS);
        }
      }

      return elToFocus;

      /**
       * Can target and nested children for specified Selector (attribute)
       * whose value may be an expression that evaluates to True/False.
       */
      function scanForFocusable(target, selector) {
        var elFound, items = target[0].querySelectorAll(selector);

        // Find the last child element with the focus attribute
        if ( items && items.length ){
          var EXP_ATTR = /\s*\[?([\-a-z]*)\]?\s*/i;
          var matches = EXP_ATTR.exec(selector);
          var attribute = matches ? matches[1] : null;

          items.length && angular.forEach(items, function(it) {
            it = angular.element(it);

            // If the expression evaluates to FALSE, then it is not focusable target
            var focusExpression = it[0].getAttribute(attribute);
            var isFocusable = !focusExpression || !$mdUtil.validateScope(it) ? true :
                              (it.scope().$eval(focusExpression) !== false );

            if (isFocusable) elFound = it;
          });
        }
        return elFound;
      }
    },

    // Disables scroll around the passed element.
    disableScrollAround: function(element, parent) {
      $mdUtil.disableScrollAround._count = $mdUtil.disableScrollAround._count || 0;
      ++$mdUtil.disableScrollAround._count;
      if ($mdUtil.disableScrollAround._enableScrolling) return $mdUtil.disableScrollAround._enableScrolling;
      element = angular.element(element);
      var body = $document[0].body,
        restoreBody = disableBodyScroll(),
        restoreElement = disableElementScroll(parent);

      return $mdUtil.disableScrollAround._enableScrolling = function() {
        if (!--$mdUtil.disableScrollAround._count) {
          restoreBody();
          restoreElement();
          delete $mdUtil.disableScrollAround._enableScrolling;
        }
      };

      // Creates a virtual scrolling mask to absorb touchmove, keyboard, scrollbar clicking, and wheel events
      function disableElementScroll(element) {
        element = angular.element(element || body)[0];
        var zIndex = 50;
        var scrollMask = angular.element(
          '<div class="md-scroll-mask" style="z-index: ' + zIndex + '">' +
          '  <div class="md-scroll-mask-bar"></div>' +
          '</div>');
        element.appendChild(scrollMask[0]);

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
          //if (!element[0].contains(e.target)) {
          //  e.preventDefault();
          //  e.stopImmediatePropagation();
          //}
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
        var scrollOffset = $mdUtil.scrollTop(body);
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
    enableScrolling: function() {
      var method = this.disableScrollAround._enableScrolling;
      method && method();
    },
    floatingScrollbars: function() {
      if (this.floatingScrollbars.cached === undefined) {
        var tempNode = angular.element('<div style="width: 100%; z-index: -1; position: absolute; height: 35px; overflow-y: scroll"><div style="height: 60;"></div></div>');
        $document[0].body.appendChild(tempNode[0]);
        this.floatingScrollbars.cached = (tempNode[0].offsetWidth == tempNode[0].childNodes[0].offsetWidth);
        tempNode.remove();
      }
      return this.floatingScrollbars.cached;
    },

    // Mobile safari only allows you to set focus in click event listeners...
    forceFocus: function(element) {
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
     * facade to build md-backdrop element with desired styles
     * NOTE: Use $compile to trigger backdrop postLink function
     */
    createBackdrop: function(scope, addClass) {
      return $compile($mdUtil.supplant('<md-backdrop class="{0}">', [addClass]))(scope);
    },

    /**
     * supplant() method from Crockford's `Remedial Javascript`
     * Equivalent to use of $interpolate; without dependency on
     * interpolation symbols and scope. Note: the '{<token>}' can
     * be property names, property chains, or array indices.
     */
    supplant: function(template, values, pattern) {
      pattern = pattern || /\{([^\{\}]*)\}/g;
      return template.replace(pattern, function(a, b) {
        var p = b.split('.'),
          r = values;
        try {
          for (var s in p) {
            if (p.hasOwnProperty(s) ) {
              r = r[p[s]];
            }
          }
        } catch (e) {
          r = a;
        }
        return (typeof r === 'string' || typeof r === 'number') ? r : a;
      });
    },

    fakeNgModel: function() {
      return {
        $fake: true,
        $setTouched: angular.noop,
        $setViewValue: function(value) {
          this.$viewValue = value;
          this.$render(value);
          this.$viewChangeListeners.forEach(function(cb) {
            cb();
          });
        },
        $isEmpty: function(value) {
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
    debounce: function(func, wait, scope, invokeApply) {
      var timer;

      return function debounced() {
        var context = scope,
          args = Array.prototype.slice.call(arguments);

        $timeout.cancel(timer);
        timer = $timeout(function() {

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
     * Create an implicit getter that caches its `getter()`
     * lookup value
     */
    valueOnUse : function (scope, key, getter) {
      var value = null, args = Array.prototype.slice.call(arguments);
      var params = (args.length > 3) ? args.slice(3) : [ ];

      Object.defineProperty(scope, key, {
        get: function () {
          if (value === null) value = getter.apply(scope, params);
          return value;
        }
      });
    },

    /**
     * Get a unique ID.
     *
     * @returns {string} an unique numeric string
     */
    nextUid: function() {
      return '' + nextUniqueId++;
    },

    /**
     * By default AngularJS attaches information about binding and scopes to DOM nodes,
     * and adds CSS classes to data-bound elements. But this information is NOT available
     * when `$compileProvider.debugInfoEnabled(false);`
     *
     * @see https://docs.angularjs.org/guide/production
     */
    validateScope : function(element) {
      var hasScope = element && angular.isDefined(element.scope());
      if ( !hasScope ) {
        $log.warn("element.scope() is not available when 'debug mode' == false. @see https://docs.angularjs.org/guide/production!");
      }

      return hasScope;
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
     * Build polyfill for the Node.contains feature (if needed)
     */
    elementContains: function(node, child) {
      var hasContains = (window.Node && window.Node.prototype && Node.prototype.contains);
      var findFn = hasContains ? angular.bind(node, node.contains) : angular.bind(node, function(arg) {
        // compares the positions of two nodes and returns a bitmask
        return (node === child) || !!(this.compareDocumentPosition(arg) & 16)
      });

      return findFn(child);
    },

    /**
     * Functional equivalent for $element.filter(‘md-bottom-sheet’)
     * useful with interimElements where the element and its container are important...
     *
     * @param {[]} elements to scan
     * @param {string} name of node to find (e.g. 'md-dialog')
     * @param {boolean=} optional flag to allow deep scans; defaults to 'false'.
     * @param {boolean=} optional flag to enable log warnings; defaults to false
     */
    extractElementByName: function(element, nodeName, scanDeep, warnNotFound) {
      var found = scanTree(element);
      if (!found && !!warnNotFound) {
        $log.warn( $mdUtil.supplant("Unable to find node '{0}' in element '{1}'.",[nodeName, element[0].outerHTML]) );
      }

      return angular.element(found || element);

      /**
       * Breadth-First tree scan for element with matching `nodeName`
       */
      function scanTree(element) {
        return scanLevel(element) || (!!scanDeep ? scanChildren(element) : null);
      }

      /**
       * Case-insensitive scan of current elements only (do not descend).
       */
      function scanLevel(element) {
        if ( element ) {
          for (var i = 0, len = element.length; i < len; i++) {
            if (element[i].nodeName.toLowerCase() === nodeName) {
              return element[i];
            }
          }
        }
        return null;
      }

      /**
       * Scan children of specified node
       */
      function scanChildren(element) {
        var found;
        if ( element ) {
          for (var i = 0, len = element.length; i < len; i++) {
            var target = element[i];
            if ( !found ) {
              for (var j = 0, numChild = target.childNodes.length; j < numChild; j++) {
                found = found || scanTree([target.childNodes[j]]);
              }
            }
          }
        }
        return found;
      }

    },

    /**
     * Give optional properties with no value a boolean true if attr provided or false otherwise
     */
    initOptionalProperties: function(scope, attr, defaults) {
      defaults = defaults || {};
      angular.forEach(scope.$$isolateBindings, function(binding, key) {
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
     *
     * @param callback
     * @param digest
     * @returns {*}
     */
    nextTick: function(callback, digest, scope) {
      //-- grab function reference for storing state details
      var nextTick = $mdUtil.nextTick;
      var timeout = nextTick.timeout;
      var queue = nextTick.queue || [];

      //-- add callback to the queue
      queue.push(callback);

      //-- set default value for digest
      if (digest == null) digest = true;

      //-- store updated digest/queue values
      nextTick.digest = nextTick.digest || digest;
      nextTick.queue = queue;

      //-- either return existing timeout or create a new one
      return timeout || (nextTick.timeout = $timeout(processQueue, 0, false));

      /**
       * Grab a copy of the current queue
       * Clear the queue for future use
       * Process the existing queue
       * Trigger digest if necessary
       */
      function processQueue() {
        var skip = scope && scope.$$destroyed;
        var queue = !skip ? nextTick.queue : [];
        var digest = !skip ? nextTick.digest : null;

        nextTick.queue = [];
        nextTick.timeout = null;
        nextTick.digest = false;

        queue.forEach(function(callback) {
          callback();
        });

        if (digest) $rootScope.$digest();
      }
    },

    /**
     * Processes a template and replaces the start/end symbols if the application has
     * overriden them.
     *
     * @param template The template to process whose start/end tags may be replaced.
     * @returns {*}
     */
    processTemplate: function(template) {
      if (usesStandardSymbols) {
        return template;
      } else {
        if (!template || !angular.isString(template)) return template;
        return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
      }
    }
  };

// Instantiate other namespace utility methods

  $mdUtil.dom.animator = $$mdAnimate($mdUtil);

  return $mdUtil;

  function getNode(el) {
    return el[0] || el;
  }

}
UtilFactory.$inject = ["$document", "$timeout", "$compile", "$rootScope", "$$mdAnimate", "$interpolate", "$log"];

/*
 * Since removing jQuery from the demos, some code that uses `element.focus()` is broken.
 * We need to add `element.focus()`, because it's testable unlike `element[0].focus`.
 */

angular.element.prototype.focus = angular.element.prototype.focus || function() {
    if (this.length) {
      this[0].focus();
    }
    return this;
  };
angular.element.prototype.blur = angular.element.prototype.blur || function() {
    if (this.length) {
      this[0].blur();
    }
    return this;
  };


})();
(function(){
"use strict";


angular.module('material.core')
  .service('$mdAria', AriaService);

/*
 * @ngInject
 */
function AriaService($$rAF, $log, $window) {

  return {
    expect: expect,
    expectAsync: expectAsync,
    expectWithText: expectWithText
  };

  /**
   * Check if expected attribute has been specified on the target element or child
   * @param element
   * @param attrName
   * @param {optional} defaultValue What to set the attr to if no value is found
   */
  function expect(element, attrName, defaultValue) {

    var node = angular.element(element)[0] || element;

    // if node exists and neither it nor its children have the attribute
    if (node &&
       ((!node.hasAttribute(attrName) ||
        node.getAttribute(attrName).length === 0) &&
        !childHasAttribute(node, attrName))) {

      defaultValue = angular.isString(defaultValue) ? defaultValue.trim() : '';
      if (defaultValue.length) {
        element.attr(attrName, defaultValue);
      } else {
        $log.warn('ARIA: Attribute "', attrName, '", required for accessibility, is missing on node:', node);
      }

    }
  }

  function expectAsync(element, attrName, defaultValueGetter) {
    // Problem: when retrieving the element's contents synchronously to find the label,
    // the text may not be defined yet in the case of a binding.
    // There is a higher chance that a binding will be defined if we wait one frame.
    $$rAF(function() {
      expect(element, attrName, defaultValueGetter());
    });
  }

  function expectWithText(element, attrName) {
    expectAsync(element, attrName, function() {
      return getText(element);
    });
  }

  function getText(element) {
    return element.text().trim();
  }

  function childHasAttribute(node, attrName) {
    var hasChildren = node.hasChildNodes(),
        hasAttr = false;

    function isHidden(el) {
      var style = el.currentStyle ? el.currentStyle : $window.getComputedStyle(el);
      return (style.display === 'none');
    }

    if(hasChildren) {
      var children = node.childNodes;
      for(var i=0; i<children.length; i++){
        var child = children[i];
        if(child.nodeType === 1 && child.hasAttribute(attrName)) {
          if(!isHidden(child)){
            hasAttr = true;
          }
        }
      }
    }
    return hasAttr;
  }
}
AriaService.$inject = ["$$rAF", "$log", "$window"];

})();
(function(){
"use strict";

angular
  .module('material.core')
  .service('$mdCompiler', mdCompilerService);

function mdCompilerService($q, $http, $injector, $compile, $controller, $templateCache) {
  /* jshint validthis: true */

  /*
   * @ngdoc service
   * @name $mdCompiler
   * @module material.core
   * @description
   * The $mdCompiler service is an abstraction of angular's compiler, that allows the developer
   * to easily compile an element with a templateUrl, controller, and locals.
   *
   * @usage
   * <hljs lang="js">
   * $mdCompiler.compile({
   *   templateUrl: 'modal.html',
   *   controller: 'ModalCtrl',
   *   locals: {
   *     modal: myModalInstance;
   *   }
   * }).then(function(compileData) {
   *   compileData.element; // modal.html's template in an element
   *   compileData.link(myScope); //attach controller & scope to element
   * });
   * </hljs>
   */

   /*
    * @ngdoc method
    * @name $mdCompiler#compile
    * @description A helper to compile an HTML template/templateUrl with a given controller,
    * locals, and scope.
    * @param {object} options An options object, with the following properties:
    *
    *    - `controller` - `{(string=|function()=}` Controller fn that should be associated with
    *      newly created scope or the name of a registered controller if passed as a string.
    *    - `controllerAs` - `{string=}` A controller alias name. If present the controller will be
    *      published to scope under the `controllerAs` name.
    *    - `template` - `{string=}` An html template as a string.
    *    - `templateUrl` - `{string=}` A path to an html template.
    *    - `transformTemplate` - `{function(template)=}` A function which transforms the template after
    *      it is loaded. It will be given the template string as a parameter, and should
    *      return a a new string representing the transformed template.
    *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
    *      be injected into the controller. If any of these dependencies are promises, the compiler
    *      will wait for them all to be resolved, or if one is rejected before the controller is
    *      instantiated `compile()` will fail..
    *      * `key` - `{string}`: a name of a dependency to be injected into the controller.
    *      * `factory` - `{string|function}`: If `string` then it is an alias for a service.
    *        Otherwise if function, then it is injected and the return value is treated as the
    *        dependency. If the result is a promise, it is resolved before its value is 
    *        injected into the controller.
    *
    * @returns {object=} promise A promise, which will be resolved with a `compileData` object.
    * `compileData` has the following properties: 
    *
    *   - `element` - `{element}`: an uncompiled element matching the provided template.
    *   - `link` - `{function(scope)}`: A link function, which, when called, will compile
    *     the element and instantiate the provided controller (if given).
    *   - `locals` - `{object}`: The locals which will be passed into the controller once `link` is
    *     called. If `bindToController` is true, they will be coppied to the ctrl instead
    *   - `bindToController` - `bool`: bind the locals to the controller, instead of passing them in.
    */
  this.compile = function(options) {
    var templateUrl = options.templateUrl;
    var template = options.template || '';
    var controller = options.controller;
    var controllerAs = options.controllerAs;
    var resolve = angular.extend({}, options.resolve || {});
    var locals = angular.extend({}, options.locals || {});
    var transformTemplate = options.transformTemplate || angular.identity;
    var bindToController = options.bindToController;

    // Take resolve values and invoke them.  
    // Resolves can either be a string (value: 'MyRegisteredAngularConst'),
    // or an invokable 'factory' of sorts: (value: function ValueGetter($dependency) {})
    angular.forEach(resolve, function(value, key) {
      if (angular.isString(value)) {
        resolve[key] = $injector.get(value);
      } else {
        resolve[key] = $injector.invoke(value);
      }
    });
    //Add the locals, which are just straight values to inject
    //eg locals: { three: 3 }, will inject three into the controller
    angular.extend(resolve, locals);

    if (templateUrl) {
      resolve.$template = $http.get(templateUrl, {cache: $templateCache})
        .then(function(response) {
          return response.data;
        });
    } else {
      resolve.$template = $q.when(template);
    }

    // Wait for all the resolves to finish if they are promises
    return $q.all(resolve).then(function(locals) {

      var compiledData;
      var template = transformTemplate(locals.$template, options);
      var element = options.element || angular.element('<div>').html(template.trim()).contents();
      var linkFn = $compile(element);

      // Return a linking function that can be used later when the element is ready
      return compiledData = {
        locals: locals,
        element: element,
        link: function link(scope) {
          locals.$scope = scope;

          //Instantiate controller if it exists, because we have scope
          if (controller) {
            var invokeCtrl = $controller(controller, locals, true);
            if (bindToController) {
              angular.extend(invokeCtrl.instance, locals);
            }
            var ctrl = invokeCtrl();
            //See angular-route source for this logic
            element.data('$ngControllerController', ctrl);
            element.children().data('$ngControllerController', ctrl);

            if (controllerAs) {
              scope[controllerAs] = ctrl;
            }

            // Publish reference to this controller
            compiledData.controller = ctrl;
          }
          return linkFn(scope);
        }
      };
    });

  };
}
mdCompilerService.$inject = ["$q", "$http", "$injector", "$compile", "$controller", "$templateCache"];

})();
(function(){
"use strict";

var HANDLERS = {};

/* The state of the current 'pointer'
 * The pointer represents the state of the current touch.
 * It contains normalized x and y coordinates from DOM events,
 * as well as other information abstracted from the DOM.
 */
 
var pointer, lastPointer, forceSkipClickHijack = false;

/**
 * The position of the most recent click if that click was on a label element.
 * @type {{x: number, y: number}?}
 */
var lastLabelClickPos = null;

// Used to attach event listeners once when multiple ng-apps are running.
var isInitialized = false;

angular
  .module('material.core.gestures', [ ])
  .provider('$mdGesture', MdGestureProvider)
  .factory('$$MdGestureHandler', MdGestureHandler)
  .run( attachToDocument );

/**
   * @ngdoc service
   * @name $mdGestureProvider
   * @module material.core.gestures
   *
   * @description
   * In some scenarios on Mobile devices (without jQuery), the click events should NOT be hijacked.
   * `$mdGestureProvider` is used to configure the Gesture module to ignore or skip click hijacking on mobile
   * devices.
   *
   * <hljs lang="js">
   *   app.config(function($mdGestureProvider) {
   *
   *     // For mobile devices without jQuery loaded, do not
   *     // intercept click events during the capture phase.
   *     $mdGestureProvider.skipClickHijack();
   *
   *   });
   * </hljs>
   *
   */
function MdGestureProvider() { }

MdGestureProvider.prototype = {

  // Publish access to setter to configure a variable  BEFORE the
  // $mdGesture service is instantiated...
  skipClickHijack: function() {
    return forceSkipClickHijack = true;
  },

  /**
   * $get is used to build an instance of $mdGesture
   * @ngInject
   */
  $get : ["$$MdGestureHandler", "$$rAF", "$timeout", function($$MdGestureHandler, $$rAF, $timeout) {
       return new MdGesture($$MdGestureHandler, $$rAF, $timeout);
  }]
};



/**
 * MdGesture factory construction function
 * @ngInject
 */
function MdGesture($$MdGestureHandler, $$rAF, $timeout) {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isIos = userAgent.match(/ipad|iphone|ipod/i);
  var isAndroid = userAgent.match(/android/i);
  var hasJQuery =  (typeof window.jQuery !== 'undefined') && (angular.element === window.jQuery);

  var self = {
    handler: addHandler,
    register: register,
    // On mobile w/out jQuery, we normally intercept clicks. Should we skip that?
    isHijackingClicks: (isIos || isAndroid) && !hasJQuery && !forceSkipClickHijack
  };

  if (self.isHijackingClicks) {
    var maxClickDistance = 6;
    self.handler('click', {
      options: {
        maxDistance: maxClickDistance
      },
      onEnd: checkDistanceAndEmit('click')
    });

    self.handler('focus', {
      options: {
        maxDistance: maxClickDistance
      },
      onEnd: function(ev, pointer) {
        if (pointer.distance < this.state.options.maxDistance) {
          if (canFocus(ev.target)) {
            this.dispatchEvent(ev, 'focus', pointer);
            ev.target.focus();
          }
        }

        function canFocus(element) {
          var focusableElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'VIDEO', 'AUDIO'];

          return (element.getAttribute('tabindex') != '-1') &&
              !element.hasAttribute('DISABLED') &&
              (element.hasAttribute('tabindex') || element.hasAttribute('href') ||
              (focusableElements.indexOf(element.nodeName) != -1));
        }
      }
    });

    self.handler('mouseup', {
      options: {
        maxDistance: maxClickDistance
      },
      onEnd: checkDistanceAndEmit('mouseup')
    });

    self.handler('mousedown', {
      onStart: function(ev) {
        this.dispatchEvent(ev, 'mousedown');
      }
    });
  }

  function checkDistanceAndEmit(eventName) {
    return function(ev, pointer) {
      if (pointer.distance < this.state.options.maxDistance) {
        this.dispatchEvent(ev, eventName, pointer);
      }
    };
  }

  /*
   * Register an element to listen for a handler.
   * This allows an element to override the default options for a handler.
   * Additionally, some handlers like drag and hold only dispatch events if
   * the domEvent happens inside an element that's registered to listen for these events.
   *
   * @see GestureHandler for how overriding of default options works.
   * @example $mdGesture.register(myElement, 'drag', { minDistance: 20, horziontal: false })
   */
  function register(element, handlerName, options) {
    var handler = HANDLERS[handlerName.replace(/^\$md./, '')];
    if (!handler) {
      throw new Error('Failed to register element with handler ' + handlerName + '. ' +
      'Available handlers: ' + Object.keys(HANDLERS).join(', '));
    }
    return handler.registerElement(element, options);
  }

  /*
   * add a handler to $mdGesture. see below.
   */
  function addHandler(name, definition) {
    var handler = new $$MdGestureHandler(name);
    angular.extend(handler, definition);
    HANDLERS[name] = handler;

    return self;
  }

  /*
   * Register handlers. These listen to touch/start/move events, interpret them,
   * and dispatch gesture events depending on options & conditions. These are all
   * instances of GestureHandler.
   * @see GestureHandler 
   */
  return self
    /*
     * The press handler dispatches an event on touchdown/touchend.
     * It's a simple abstraction of touch/mouse/pointer start and end.
     */
    .handler('press', {
      onStart: function (ev, pointer) {
        this.dispatchEvent(ev, '$md.pressdown');
      },
      onEnd: function (ev, pointer) {
        this.dispatchEvent(ev, '$md.pressup');
      }
    })

    /*
     * The hold handler dispatches an event if the user keeps their finger within
     * the same <maxDistance> area for <delay> ms.
     * The hold handler will only run if a parent of the touch target is registered
     * to listen for hold events through $mdGesture.register()
     */
    .handler('hold', {
      options: {
        maxDistance: 6,
        delay: 500
      },
      onCancel: function () {
        $timeout.cancel(this.state.timeout);
      },
      onStart: function (ev, pointer) {
        // For hold, require a parent to be registered with $mdGesture.register()
        // Because we prevent scroll events, this is necessary.
        if (!this.state.registeredParent) return this.cancel();

        this.state.pos = {x: pointer.x, y: pointer.y};
        this.state.timeout = $timeout(angular.bind(this, function holdDelayFn() {
          this.dispatchEvent(ev, '$md.hold');
          this.cancel(); //we're done!
        }), this.state.options.delay, false);
      },
      onMove: function (ev, pointer) {
        // Don't scroll while waiting for hold.
        // If we don't preventDefault touchmove events here, Android will assume we don't
        // want to listen to anymore touch events. It will start scrolling and stop sending
        // touchmove events.
        ev.preventDefault();

        // If the user moves greater than <maxDistance> pixels, stop the hold timer
        // set in onStart
        var dx = this.state.pos.x - pointer.x;
        var dy = this.state.pos.y - pointer.y;
        if (Math.sqrt(dx * dx + dy * dy) > this.options.maxDistance) {
          this.cancel();
        }
      },
      onEnd: function () {
        this.onCancel();
      }
    })

    /*
     * The drag handler dispatches a drag event if the user holds and moves his finger greater than
     * <minDistance> px in the x or y direction, depending on options.horizontal.
     * The drag will be cancelled if the user moves his finger greater than <minDistance>*<cancelMultiplier> in
     * the perpindicular direction. Eg if the drag is horizontal and the user moves his finger <minDistance>*<cancelMultiplier>
     * pixels vertically, this handler won't consider the move part of a drag.
     */
    .handler('drag', {
      options: {
        minDistance: 6,
        horizontal: true,
        cancelMultiplier: 1.5
      },
      onStart: function (ev) {
        // For drag, require a parent to be registered with $mdGesture.register()
        if (!this.state.registeredParent) this.cancel();
      },
      onMove: function (ev, pointer) {
        var shouldStartDrag, shouldCancel;
        // Don't scroll while deciding if this touchmove qualifies as a drag event.
        // If we don't preventDefault touchmove events here, Android will assume we don't
        // want to listen to anymore touch events. It will start scrolling and stop sending
        // touchmove events.
        ev.preventDefault();

        if (!this.state.dragPointer) {
          if (this.state.options.horizontal) {
            shouldStartDrag = Math.abs(pointer.distanceX) > this.state.options.minDistance;
            shouldCancel = Math.abs(pointer.distanceY) > this.state.options.minDistance * this.state.options.cancelMultiplier;
          } else {
            shouldStartDrag = Math.abs(pointer.distanceY) > this.state.options.minDistance;
            shouldCancel = Math.abs(pointer.distanceX) > this.state.options.minDistance * this.state.options.cancelMultiplier;
          }

          if (shouldStartDrag) {
            // Create a new pointer representing this drag, starting at this point where the drag started.
            this.state.dragPointer = makeStartPointer(ev);
            updatePointerState(ev, this.state.dragPointer);
            this.dispatchEvent(ev, '$md.dragstart', this.state.dragPointer);

          } else if (shouldCancel) {
            this.cancel();
          }
        } else {
          this.dispatchDragMove(ev);
        }
      },
      // Only dispatch dragmove events every frame; any more is unnecessray
      dispatchDragMove: $$rAF.throttle(function (ev) {
        // Make sure the drag didn't stop while waiting for the next frame
        if (this.state.isRunning) {
          updatePointerState(ev, this.state.dragPointer);
          this.dispatchEvent(ev, '$md.drag', this.state.dragPointer);
        }
      }),
      onEnd: function (ev, pointer) {
        if (this.state.dragPointer) {
          updatePointerState(ev, this.state.dragPointer);
          this.dispatchEvent(ev, '$md.dragend', this.state.dragPointer);
        }
      }
    })

    /*
     * The swipe handler will dispatch a swipe event if, on the end of a touch,
     * the velocity and distance were high enough.
     * TODO: add vertical swiping with a `horizontal` option similar to the drag handler.
     */
    .handler('swipe', {
      options: {
        minVelocity: 0.65,
        minDistance: 10
      },
      onEnd: function (ev, pointer) {
        if (Math.abs(pointer.velocityX) > this.state.options.minVelocity &&
          Math.abs(pointer.distanceX) > this.state.options.minDistance) {
          var eventType = pointer.directionX == 'left' ? '$md.swipeleft' : '$md.swiperight';
          this.dispatchEvent(ev, eventType);
        }
      }
    });

}
MdGesture.$inject = ["$$MdGestureHandler", "$$rAF", "$timeout"];

/**
 * MdGestureHandler
 * A GestureHandler is an object which is able to dispatch custom dom events
 * based on native dom {touch,pointer,mouse}{start,move,end} events.
 *
 * A gesture will manage its lifecycle through the start,move,end, and cancel
 * functions, which are called by native dom events.
 *
 * A gesture has the concept of 'options' (eg a swipe's required velocity), which can be
 * overridden by elements registering through $mdGesture.register()
 */
function GestureHandler (name) {
  this.name = name;
  this.state = {};
}

function MdGestureHandler() {
  var hasJQuery =  (typeof window.jQuery !== 'undefined') && (angular.element === window.jQuery);

  GestureHandler.prototype = {
    options: {},
    // jQuery listeners don't work with custom DOMEvents, so we have to dispatch events
    // differently when jQuery is loaded
    dispatchEvent: hasJQuery ?  jQueryDispatchEvent : nativeDispatchEvent,

    // These are overridden by the registered handler
    onStart: angular.noop,
    onMove: angular.noop,
    onEnd: angular.noop,
    onCancel: angular.noop,

    // onStart sets up a new state for the handler, which includes options from the
    // nearest registered parent element of ev.target.
    start: function (ev, pointer) {
      if (this.state.isRunning) return;
      var parentTarget = this.getNearestParent(ev.target);
      // Get the options from the nearest registered parent
      var parentTargetOptions = parentTarget && parentTarget.$mdGesture[this.name] || {};

      this.state = {
        isRunning: true,
        // Override the default options with the nearest registered parent's options
        options: angular.extend({}, this.options, parentTargetOptions),
        // Pass in the registered parent node to the state so the onStart listener can use
        registeredParent: parentTarget
      };
      this.onStart(ev, pointer);
    },
    move: function (ev, pointer) {
      if (!this.state.isRunning) return;
      this.onMove(ev, pointer);
    },
    end: function (ev, pointer) {
      if (!this.state.isRunning) return;
      this.onEnd(ev, pointer);
      this.state.isRunning = false;
    },
    cancel: function (ev, pointer) {
      this.onCancel(ev, pointer);
      this.state = {};
    },

    // Find and return the nearest parent element that has been registered to
    // listen for this handler via $mdGesture.register(element, 'handlerName').
    getNearestParent: function (node) {
      var current = node;
      while (current) {
        if ((current.$mdGesture || {})[this.name]) {
          return current;
        }
        current = current.parentNode;
      }
      return null;
    },

    // Called from $mdGesture.register when an element reigsters itself with a handler.
    // Store the options the user gave on the DOMElement itself. These options will
    // be retrieved with getNearestParent when the handler starts.
    registerElement: function (element, options) {
      var self = this;
      element[0].$mdGesture = element[0].$mdGesture || {};
      element[0].$mdGesture[this.name] = options || {};
      element.on('$destroy', onDestroy);

      return onDestroy;

      function onDestroy() {
        delete element[0].$mdGesture[self.name];
        element.off('$destroy', onDestroy);
      }
    }
  };

  return GestureHandler;

  /*
   * Dispatch an event with jQuery
   * TODO: Make sure this sends bubbling events
   *
   * @param srcEvent the original DOM touch event that started this.
   * @param eventType the name of the custom event to send (eg 'click' or '$md.drag')
   * @param eventPointer the pointer object that matches this event.
   */
  function jQueryDispatchEvent(srcEvent, eventType, eventPointer) {
    eventPointer = eventPointer || pointer;
    var eventObj = new angular.element.Event(eventType);

    eventObj.$material = true;
    eventObj.pointer = eventPointer;
    eventObj.srcEvent = srcEvent;

    angular.extend(eventObj, {
      clientX: eventPointer.x,
      clientY: eventPointer.y,
      screenX: eventPointer.x,
      screenY: eventPointer.y,
      pageX: eventPointer.x,
      pageY: eventPointer.y,
      ctrlKey: srcEvent.ctrlKey,
      altKey: srcEvent.altKey,
      shiftKey: srcEvent.shiftKey,
      metaKey: srcEvent.metaKey
    });
    angular.element(eventPointer.target).trigger(eventObj);
  }

  /*
   * NOTE: nativeDispatchEvent is very performance sensitive.
   * @param srcEvent the original DOM touch event that started this.
   * @param eventType the name of the custom event to send (eg 'click' or '$md.drag')
   * @param eventPointer the pointer object that matches this event.
   */
  function nativeDispatchEvent(srcEvent, eventType, eventPointer) {
    eventPointer = eventPointer || pointer;
    var eventObj;

    if (eventType === 'click' || eventType == 'mouseup' || eventType == 'mousedown' ) {
      eventObj = document.createEvent('MouseEvents');
      eventObj.initMouseEvent(
        eventType, true, true, window, srcEvent.detail,
        eventPointer.x, eventPointer.y, eventPointer.x, eventPointer.y,
        srcEvent.ctrlKey, srcEvent.altKey, srcEvent.shiftKey, srcEvent.metaKey,
        srcEvent.button, srcEvent.relatedTarget || null
      );

    } else {
      eventObj = document.createEvent('CustomEvent');
      eventObj.initCustomEvent(eventType, true, true, {});
    }
    eventObj.$material = true;
    eventObj.pointer = eventPointer;
    eventObj.srcEvent = srcEvent;
    eventPointer.target.dispatchEvent(eventObj);
  }

}

/**
 * Attach Gestures: hook document and check shouldHijack clicks
 * @ngInject
 */
function attachToDocument( $mdGesture, $$MdGestureHandler ) {

  // Polyfill document.contains for IE11.
  // TODO: move to util
  document.contains || (document.contains = function (node) {
    return document.body.contains(node);
  });

  if (!isInitialized && $mdGesture.isHijackingClicks ) {
    /*
     * If hijack clicks is true, we preventDefault any click that wasn't
     * sent by ngMaterial. This is because on older Android & iOS, a false, or 'ghost',
     * click event will be sent ~400ms after a touchend event happens.
     * The only way to know if this click is real is to prevent any normal
     * click events, and add a flag to events sent by material so we know not to prevent those.
     * 
     * Two exceptions to click events that should be prevented are:
     *  - click events sent by the keyboard (eg form submit)
     *  - events that originate from an Ionic app
     */
    document.addEventListener('click'    , clickHijacker     , true);
    document.addEventListener('mouseup'  , mouseInputHijacker, true);
    document.addEventListener('mousedown', mouseInputHijacker, true);
    document.addEventListener('focus'    , mouseInputHijacker, true);

    isInitialized = true;
  }

  function mouseInputHijacker(ev) {
    var isKeyClick = !ev.clientX && !ev.clientY;
    if (!isKeyClick && !ev.$material && !ev.isIonicTap
      && !isInputEventFromLabelClick(ev)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  function clickHijacker(ev) {
    var isKeyClick = ev.clientX === 0 && ev.clientY === 0;
    if (!isKeyClick && !ev.$material && !ev.isIonicTap
      && !isInputEventFromLabelClick(ev)) {
      ev.preventDefault();
      ev.stopPropagation();
      lastLabelClickPos = null;
    } else {
      lastLabelClickPos = null;
      if (ev.target.tagName.toLowerCase() == 'label') {
        lastLabelClickPos = {x: ev.x, y: ev.y};
      }
    }
  }


  // Listen to all events to cover all platforms.
  var START_EVENTS = 'mousedown touchstart pointerdown';
  var MOVE_EVENTS = 'mousemove touchmove pointermove';
  var END_EVENTS = 'mouseup mouseleave touchend touchcancel pointerup pointercancel';

  angular.element(document)
    .on(START_EVENTS, gestureStart)
    .on(MOVE_EVENTS, gestureMove)
    .on(END_EVENTS, gestureEnd)
    // For testing
    .on('$$mdGestureReset', function gestureClearCache () {
      lastPointer = pointer = null;
    });

  /*
   * When a DOM event happens, run all registered gesture handlers' lifecycle
   * methods which match the DOM event.
   * Eg when a 'touchstart' event happens, runHandlers('start') will call and
   * run `handler.cancel()` and `handler.start()` on all registered handlers.
   */
  function runHandlers(handlerEvent, event) {
    var handler;
    for (var name in HANDLERS) {
      handler = HANDLERS[name];
      if( handler instanceof $$MdGestureHandler ) {

        if (handlerEvent === 'start') {
          // Run cancel to reset any handlers' state
          handler.cancel();
        }
        handler[handlerEvent](event, pointer);

      }
    }
  }

  /*
   * gestureStart vets if a start event is legitimate (and not part of a 'ghost click' from iOS/Android)
   * If it is legitimate, we initiate the pointer state and mark the current pointer's type
   * For example, for a touchstart event, mark the current pointer as a 'touch' pointer, so mouse events
   * won't effect it.
   */
  function gestureStart(ev) {
    // If we're already touched down, abort
    if (pointer) return;

    var now = +Date.now();

    // iOS & old android bug: after a touch event, a click event is sent 350 ms later.
    // If <400ms have passed, don't allow an event of a different type than the previous event
    if (lastPointer && !typesMatch(ev, lastPointer) && (now - lastPointer.endTime < 1500)) {
      return;
    }

    pointer = makeStartPointer(ev);

    runHandlers('start', ev);
  }
  /*
   * If a move event happens of the right type, update the pointer and run all the move handlers.
   * "of the right type": if a mousemove happens but our pointer started with a touch event, do nothing.
   */
  function gestureMove(ev) {
    if (!pointer || !typesMatch(ev, pointer)) return;

    updatePointerState(ev, pointer);
    runHandlers('move', ev);
  }
  /*
   * If an end event happens of the right type, update the pointer, run endHandlers, and save the pointer as 'lastPointer'
   */
  function gestureEnd(ev) {
    if (!pointer || !typesMatch(ev, pointer)) return;

    updatePointerState(ev, pointer);
    pointer.endTime = +Date.now();

    runHandlers('end', ev);

    lastPointer = pointer;
    pointer = null;
  }

}
attachToDocument.$inject = ["$mdGesture", "$$MdGestureHandler"];

// ********************
// Module Functions
// ********************

/*
 * Initiate the pointer. x, y, and the pointer's type.
 */
function makeStartPointer(ev) {
  var point = getEventPoint(ev);
  var startPointer = {
    startTime: +Date.now(),
    target: ev.target,
    // 'p' for pointer events, 'm' for mouse, 't' for touch
    type: ev.type.charAt(0)
  };
  startPointer.startX = startPointer.x = point.pageX;
  startPointer.startY = startPointer.y = point.pageY;
  return startPointer;
}

/*
 * return whether the pointer's type matches the event's type.
 * Eg if a touch event happens but the pointer has a mouse type, return false.
 */
function typesMatch(ev, pointer) {
  return ev && pointer && ev.type.charAt(0) === pointer.type;
}

/**
 * Gets whether the given event is an input event that was caused by clicking on an
 * associated label element.
 *
 * This is necessary because the browser will, upon clicking on a label element, fire an
 * *extra* click event on its associated input (if any). mdGesture is able to flag the label
 * click as with `$material` correctly, but not the second input click.
 *
 * In order to determine whether an input event is from a label click, we compare the (x, y) for
 * the event to the (x, y) for the most recent label click (which is cleared whenever a non-label
 * click occurs). Unfortunately, there are no event properties that tie the input and the label
 * together (such as relatedTarget).
 *
 * @param {MouseEvent} event
 * @returns {boolean}
 */
function isInputEventFromLabelClick(event) {
  return lastLabelClickPos
      && lastLabelClickPos.x == event.x
      && lastLabelClickPos.y == event.y;
}

/*
 * Update the given pointer based upon the given DOMEvent.
 * Distance, velocity, direction, duration, etc
 */
function updatePointerState(ev, pointer) {
  var point = getEventPoint(ev);
  var x = pointer.x = point.pageX;
  var y = pointer.y = point.pageY;

  pointer.distanceX = x - pointer.startX;
  pointer.distanceY = y - pointer.startY;
  pointer.distance = Math.sqrt(
    pointer.distanceX * pointer.distanceX + pointer.distanceY * pointer.distanceY
  );

  pointer.directionX = pointer.distanceX > 0 ? 'right' : pointer.distanceX < 0 ? 'left' : '';
  pointer.directionY = pointer.distanceY > 0 ? 'up' : pointer.distanceY < 0 ? 'down' : '';

  pointer.duration = +Date.now() - pointer.startTime;
  pointer.velocityX = pointer.distanceX / pointer.duration;
  pointer.velocityY = pointer.distanceY / pointer.duration;
}

/*
 * Normalize the point where the DOM event happened whether it's touch or mouse.
 * @returns point event obj with pageX and pageY on it.
 */
function getEventPoint(ev) {
  ev = ev.originalEvent || ev; // support jQuery events
  return (ev.touches && ev.touches[0]) ||
    (ev.changedTouches && ev.changedTouches[0]) ||
    ev;
}

})();
(function(){
"use strict";

angular.module('material.core')
  .provider('$$interimElement', InterimElementProvider);

/*
 * @ngdoc service
 * @name $$interimElement
 * @module material.core
 *
 * @description
 *
 * Factory that contructs `$$interimElement.$service` services.
 * Used internally in material design for elements that appear on screen temporarily.
 * The service provides a promise-like API for interacting with the temporary
 * elements.
 *
 * ```js
 * app.service('$mdToast', function($$interimElement) {
 *   var $mdToast = $$interimElement(toastDefaultOptions);
 *   return $mdToast;
 * });
 * ```
 * @param {object=} defaultOptions Options used by default for the `show` method on the service.
 *
 * @returns {$$interimElement.$service}
 *
 */

function InterimElementProvider() {
  createInterimElementProvider.$get = InterimElementFactory;
  InterimElementFactory.$inject = ["$document", "$q", "$$q", "$rootScope", "$timeout", "$rootElement", "$animate", "$mdUtil", "$mdCompiler", "$mdTheming", "$log"];
  return createInterimElementProvider;

  /**
   * Returns a new provider which allows configuration of a new interimElement
   * service. Allows configuration of default options & methods for options,
   * as well as configuration of 'preset' methods (eg dialog.basic(): basic is a preset method)
   */
  function createInterimElementProvider(interimFactoryName) {
    var EXPOSED_METHODS = ['onHide', 'onShow', 'onRemove'];

    var customMethods = {};
    var providerConfig = {
      presets: {}
    };

    var provider = {
      setDefaults: setDefaults,
      addPreset: addPreset,
      addMethod: addMethod,
      $get: factory
    };

    /**
     * all interim elements will come with the 'build' preset
     */
    provider.addPreset('build', {
      methods: ['controller', 'controllerAs', 'resolve',
        'template', 'templateUrl', 'themable', 'transformTemplate', 'parent']
    });

    factory.$inject = ["$$interimElement", "$injector"];
    return provider;

    /**
     * Save the configured defaults to be used when the factory is instantiated
     */
    function setDefaults(definition) {
      providerConfig.optionsFactory = definition.options;
      providerConfig.methods = (definition.methods || []).concat(EXPOSED_METHODS);
      return provider;
    }

    /**
     * Add a method to the factory that isn't specific to any interim element operations
     */

    function addMethod(name, fn) {
      customMethods[name] = fn;
      return provider;
    }

    /**
     * Save the configured preset to be used when the factory is instantiated
     */
    function addPreset(name, definition) {
      definition = definition || {};
      definition.methods = definition.methods || [];
      definition.options = definition.options || function() { return {}; };

      if (/^cancel|hide|show$/.test(name)) {
        throw new Error("Preset '" + name + "' in " + interimFactoryName + " is reserved!");
      }
      if (definition.methods.indexOf('_options') > -1) {
        throw new Error("Method '_options' in " + interimFactoryName + " is reserved!");
      }
      providerConfig.presets[name] = {
        methods: definition.methods.concat(EXPOSED_METHODS),
        optionsFactory: definition.options,
        argOption: definition.argOption
      };
      return provider;
    }

    /**
     * Create a factory that has the given methods & defaults implementing interimElement
     */
    /* @ngInject */
    function factory($$interimElement, $injector) {
      var defaultMethods;
      var defaultOptions;
      var interimElementService = $$interimElement();

      /*
       * publicService is what the developer will be using.
       * It has methods hide(), cancel(), show(), build(), and any other
       * presets which were set during the config phase.
       */
      var publicService = {
        hide: interimElementService.hide,
        cancel: interimElementService.cancel,
        show: showInterimElement,

        // Special internal method to destroy an interim element without animations
        // used when navigation changes causes a $scope.$destroy() action
        destroy : destroyInterimElement
      };


      defaultMethods = providerConfig.methods || [];
      // This must be invoked after the publicService is initialized
      defaultOptions = invokeFactory(providerConfig.optionsFactory, {});

      // Copy over the simple custom methods
      angular.forEach(customMethods, function(fn, name) {
        publicService[name] = fn;
      });

      angular.forEach(providerConfig.presets, function(definition, name) {
        var presetDefaults = invokeFactory(definition.optionsFactory, {});
        var presetMethods = (definition.methods || []).concat(defaultMethods);

        // Every interimElement built with a preset has a field called `$type`,
        // which matches the name of the preset.
        // Eg in preset 'confirm', options.$type === 'confirm'
        angular.extend(presetDefaults, { $type: name });

        // This creates a preset class which has setter methods for every
        // method given in the `.addPreset()` function, as well as every
        // method given in the `.setDefaults()` function.
        //
        // @example
        // .setDefaults({
        //   methods: ['hasBackdrop', 'clickOutsideToClose', 'escapeToClose', 'targetEvent'],
        //   options: dialogDefaultOptions
        // })
        // .addPreset('alert', {
        //   methods: ['title', 'ok'],
        //   options: alertDialogOptions
        // })
        //
        // Set values will be passed to the options when interimElement.show() is called.
        function Preset(opts) {
          this._options = angular.extend({}, presetDefaults, opts);
        }
        angular.forEach(presetMethods, function(name) {
          Preset.prototype[name] = function(value) {
            this._options[name] = value;
            return this;
          };
        });

        // Create shortcut method for one-linear methods
        if (definition.argOption) {
          var methodName = 'show' + name.charAt(0).toUpperCase() + name.slice(1);
          publicService[methodName] = function(arg) {
            var config = publicService[name](arg);
            return publicService.show(config);
          };
        }

        // eg $mdDialog.alert() will return a new alert preset
        publicService[name] = function(arg) {
          // If argOption is supplied, eg `argOption: 'content'`, then we assume
          // if the argument is not an options object then it is the `argOption` option.
          //
          // @example `$mdToast.simple('hello')` // sets options.content to hello
          //                                     // because argOption === 'content'
          if (arguments.length && definition.argOption &&
              !angular.isObject(arg) && !angular.isArray(arg))  {

            return (new Preset())[definition.argOption](arg);

          } else {
            return new Preset(arg);
          }

        };
      });

      return publicService;

      /**
       *
       */
      function showInterimElement(opts) {
        // opts is either a preset which stores its options on an _options field,
        // or just an object made up of options
        opts = opts || { };
        if (opts._options) opts = opts._options;

        return interimElementService.show(
          angular.extend({}, defaultOptions, opts)
        );
      }

      /**
       *  Special method to hide and destroy an interimElement WITHOUT
       *  any 'leave` or hide animations ( an immediate force hide/remove )
       *
       *  NOTE: This calls the onRemove() subclass method for each component...
       *  which must have code to respond to `options.$destroy == true`
       */
      function destroyInterimElement(opts) {
          return interimElementService.destroy(opts);
      }

      /**
       * Helper to call $injector.invoke with a local of the factory name for
       * this provider.
       * If an $mdDialog is providing options for a dialog and tries to inject
       * $mdDialog, a circular dependency error will happen.
       * We get around that by manually injecting $mdDialog as a local.
       */
      function invokeFactory(factory, defaultVal) {
        var locals = {};
        locals[interimFactoryName] = publicService;
        return $injector.invoke(factory || function() { return defaultVal; }, {}, locals);
      }

    }

  }

  /* @ngInject */
  function InterimElementFactory($document, $q, $$q, $rootScope, $timeout, $rootElement, $animate,
                                 $mdUtil, $mdCompiler, $mdTheming, $log ) {
    return function createInterimElementService() {
      var SHOW_CANCELLED = false;

      /*
       * @ngdoc service
       * @name $$interimElement.$service
       *
       * @description
       * A service used to control inserting and removing an element into the DOM.
       *
       */
      var service, stack = [];

      // Publish instance $$interimElement service;
      // ... used as $mdDialog, $mdToast, $mdMenu, and $mdSelect

      return service = {
        show: show,
        hide: hide,
        cancel: cancel,
        destroy : destroy
      };

      /*
       * @ngdoc method
       * @name $$interimElement.$service#show
       * @kind function
       *
       * @description
       * Adds the `$interimElement` to the DOM and returns a special promise that will be resolved or rejected
       * with hide or cancel, respectively. To external cancel/hide, developers should use the
       *
       * @param {*} options is hashMap of settings
       * @returns a Promise
       *
       */
      function show(options) {
        options = options || {};
        var interimElement = new InterimElement(options || {});
        var hideExisting = !options.skipHide && stack.length ? service.hide() : $q.when(true);

        // This hide()s only the current interim element before showing the next, new one
        // NOTE: this is not reversible (e.g. interim elements are not stackable)

        hideExisting.finally(function() {

          stack.push(interimElement);
          interimElement
            .show()
            .catch(function( reason ) {
              //$log.error("InterimElement.show() error: " + reason );
              return reason;
            });

        });

        // Return a promise that will be resolved when the interim
        // element is hidden or cancelled...

        return interimElement.deferred.promise;
      }

      /*
       * @ngdoc method
       * @name $$interimElement.$service#hide
       * @kind function
       *
       * @description
       * Removes the `$interimElement` from the DOM and resolves the promise returned from `show`
       *
       * @param {*} resolveParam Data to resolve the promise with
       * @returns a Promise that will be resolved after the element has been removed.
       *
       */
      function hide(reason, options) {
        if ( !stack.length ) return $q.when(reason);
        options = options || {};

        if (options.closeAll) {
          var promise = $q.all(stack.reverse().map(closeElement));
          stack = [];
          return promise;
        } else if (options.closeTo !== undefined) {
          return $q.all(stack.splice(options.closeTo).map(closeElement));
        } else {
          var interim = stack.pop();
          return closeElement(interim);
        }

        function closeElement(interim) {
          interim
            .remove(reason, false, options || { })
            .catch(function( reason ) {
              //$log.error("InterimElement.hide() error: " + reason );
              return reason;
            });
          return interim.deferred.promise;
        }
      }

      /*
       * @ngdoc method
       * @name $$interimElement.$service#cancel
       * @kind function
       *
       * @description
       * Removes the `$interimElement` from the DOM and rejects the promise returned from `show`
       *
       * @param {*} reason Data to reject the promise with
       * @returns Promise that will be resolved after the element has been removed.
       *
       */
      function cancel(reason, options) {
        var interim = stack.shift();
        if ( !interim ) return $q.when(reason);

        interim
          .remove(reason, true, options || { })
          .catch(function( reason ) {
            //$log.error("InterimElement.cancel() error: " + reason );
            return reason;
          });

        return interim.deferred.promise;
      }

      /*
       * Special method to quick-remove the interim element without animations
       */
      function destroy() {
        var interim = stack.shift();

        return interim ? interim.remove(SHOW_CANCELLED, false, {'$destroy':true}) :
               $q.when(SHOW_CANCELLED);
      }


      /*
       * Internal Interim Element Object
       * Used internally to manage the DOM element and related data
       */
      function InterimElement(options) {
        var self, element, showAction = $q.when(true);

        options = configureScopeAndTransitions(options);

        return self = {
          options : options,
          deferred: $q.defer(),
          show    : createAndTransitionIn,
          remove  : transitionOutAndRemove
        };

        /**
         * Compile, link, and show this interim element
         * Use optional autoHided and transition-in effects
         */
        function createAndTransitionIn() {
          return $q(function(resolve, reject){

            compileElement(options)
              .then(function( compiledData ) {
                element = linkElement( compiledData, options );

                showAction = showElement(element, options, compiledData.controller)
                  .then(resolve, rejectAll );

              }, rejectAll);

            function rejectAll(fault) {
              // Force the '$md<xxx>.show()' promise to reject
              self.deferred.reject(fault);

              // Continue rejection propagation
              reject(fault);
            }
          });
        }

        /**
         * After the show process has finished/rejected:
         * - announce 'removing',
         * - perform the transition-out, and
         * - perform optional clean up scope.
         */
        function transitionOutAndRemove(response, isCancelled, opts) {

          // abort if the show() and compile failed
          if ( !element ) return $q.when(false);

          options = angular.extend(options || {}, opts || {});
          options.cancelAutoHide && options.cancelAutoHide();
          options.element.triggerHandler('$mdInterimElementRemove');

          if ( options.$destroy === true ) {

            return hideElement(options.element, options);

          } else {

            $q.when(showAction)
                .finally(function() {
                  hideElement(options.element, options).then(function() {

                    (isCancelled && rejectAll(response)) || resolveAll(response);

                  }, rejectAll);
                });

            return self.deferred.promise;
          }


          /**
           * The `show()` returns a promise that will be resolved when the interim
           * element is hidden or cancelled...
           */
          function resolveAll(response) {
            self.deferred.resolve(response);
          }

          /**
           * Force the '$md<xxx>.show()' promise to reject
           */
          function rejectAll(fault) {
            self.deferred.reject(fault);
          }
        }

        /**
         * Prepare optional isolated scope and prepare $animate with default enter and leave
         * transitions for the new element instance.
         */
        function configureScopeAndTransitions(options) {
          options = options || { };
          if ( options.template ) {
            options.template = $mdUtil.processTemplate(options.template);
          }

          return angular.extend({
            preserveScope: false,
            cancelAutoHide : angular.noop,
            scope: options.scope || $rootScope.$new(options.isolateScope),

            /**
             * Default usage to enable $animate to transition-in; can be easily overridden via 'options'
             */
            onShow: function transitionIn(scope, element, options) {
              return $animate.enter(element, options.parent);
            },

            /**
             * Default usage to enable $animate to transition-out; can be easily overridden via 'options'
             */
            onRemove: function transitionOut(scope, element) {
              // Element could be undefined if a new element is shown before
              // the old one finishes compiling.
              return element && $animate.leave(element) || $q.when();
            }
          }, options );

        }

        /**
         * Compile an element with a templateUrl, controller, and locals
         */
        function compileElement(options) {

          var compiled = !options.skipCompile ? $mdCompiler.compile(options) : null;

          return compiled || $q(function (resolve) {
              resolve({
                locals: {},
                link: function () {
                  return options.element;
                }
              });
            });
        }

        /**
         *  Link an element with compiled configuration
         */
        function linkElement(compileData, options){
          angular.extend(compileData.locals, options);

          var element = compileData.link(options.scope);

          // Search for parent at insertion time, if not specified
          options.element = element;
          options.parent = findParent(element, options);
          if (options.themable) $mdTheming(element);

          return element;
        }

        /**
         * Search for parent at insertion time, if not specified
         */
        function findParent(element, options) {
          var parent = options.parent;

          // Search for parent at insertion time, if not specified
          if (angular.isFunction(parent)) {
            parent = parent(options.scope, element, options);
          } else if (angular.isString(parent)) {
            parent = angular.element($document[0].querySelector(parent));
          } else {
            parent = angular.element(parent);
          }

          // If parent querySelector/getter function fails, or it's just null,
          // find a default.
          if (!(parent || {}).length) {
            var el;
            if ($rootElement[0] && $rootElement[0].querySelector) {
              el = $rootElement[0].querySelector(':not(svg) > body');
            }
            if (!el) el = $rootElement[0];
            if (el.nodeName == '#comment') {
              el = $document[0].body;
            }
            return angular.element(el);
          }

          return parent;
        }

        /**
         * If auto-hide is enabled, start timer and prepare cancel function
         */
        function startAutoHide() {
          var autoHideTimer, cancelAutoHide = angular.noop;

          if (options.hideDelay) {
            autoHideTimer = $timeout(service.hide, options.hideDelay) ;
            cancelAutoHide = function() {
              $timeout.cancel(autoHideTimer);
            }
          }

          // Cache for subsequent use
          options.cancelAutoHide = function() {
            cancelAutoHide();
            options.cancelAutoHide = undefined;
          }
        }

        /**
         * Show the element ( with transitions), notify complete and start
         * optional auto-Hide
         */
        function showElement(element, options, controller) {
          // Trigger onShowing callback before the `show()` starts
          var notifyShowing = options.onShowing || angular.noop;
          // Trigger onComplete callback when the `show()` finishes
          var notifyComplete = options.onComplete || angular.noop;

          return $q(function (resolve, reject) {
            try {
              notifyShowing(options.scope, element, options);

              // Start transitionIn
              $q.when(options.onShow(options.scope, element, options, controller))
                .then(function () {
                  notifyComplete(options.scope, element, options);
                  startAutoHide();

                  resolve(element);

                }, reject );

            } catch(e) {
              reject(e.message);
            }
          });
        }

        function hideElement(element, options) {
          var announceRemoving = options.onRemoving || angular.noop;

          return $$q(function (resolve, reject) {
            try {
              // Start transitionIn
              var action = $$q.when( options.onRemove(options.scope, element, options) || true );

              // Trigger callback *before* the remove operation starts
              announceRemoving(element, action);

              if ( options.$destroy == true ) {

                // For $destroy, onRemove should be synchronous
                resolve(element);

              } else {

                // Wait until transition-out is done
                action.then(function () {

                  if (!options.preserveScope && options.scope ) {
                    options.scope.$destroy();
                  }

                  resolve(element);

                }, reject );
              }

            } catch(e) {
              reject(e.message);
            }
          });
        }

      }
    };

  }

}

})();
(function(){
"use strict";

(function() {
  'use strict';

  var $mdUtil, $interpolate;

  var SUFFIXES = /(-gt)?-(sm|md|lg)/g;
  var WHITESPACE = /\s+/g;

  var FLEX_OPTIONS = ['grow', 'initial', 'auto', 'none'];
  var LAYOUT_OPTIONS = ['row', 'column'];
  var ALIGNMENT_OPTIONS = [
        "start start", "start center", "start end",
        "center", "center center", "center start", "center end",
        "end", "end center", "end start", "end end",
        "space-around", "space-around center", "space-around start", "space-around end",
        "space-between", "space-between center", "space-between start", "space-between end"
      ];


  var config = {
    /**
     * Enable directive attribute-to-class conversions
     */
    enabled: true,

    /**
     * After translation to classname equivalents, remove the
     * original Layout attribute
     */
    removeAttributes : true,

    /**
     * List of mediaQuery breakpoints and associated suffixes
     *
     *   [
     *    { suffix: "sm", mediaQuery: "screen and (max-width: 599px)" },
     *    { suffix: "md", mediaQuery: "screen and (min-width: 600px) and (max-width: 959px)" }
     *   ]
     */
    breakpoints: []
  };

  /**
   *   The original ngMaterial Layout solution used attribute selectors and CSS.
   *
   *  ```html
   *  <div layout="column"> My Content </div>
   *  ```
   *
   *  ```css
   *  [layout] {
     *    box-sizing: border-box;
     *    display:flex;
     *  }
   *  [layout=column] {
     *    flex-direction : column
     *  }
   *  ```
   *
   *  Use of attribute selectors creates significant performance impacts in some
   *  browsers... mainly IE.
   *
   *  This module registers directives that allow the same layout attributes to be
   *  interpreted and converted to class selectors. The directive will add equivalent classes to each element that
   *  contains a Layout directive.
   *
   * ```html
   *   <div layout="column" class="layout layout-column"> My Content </div>
   *```
   *
   *  ```css
   *  .layout {
     *    box-sizing: border-box;
     *    display:flex;
     *  }
   *  .layout-column {
     *    flex-direction : column
     *  }
   *  ```
   */
  angular.module('material.core.layout', ['ng'])

    .directive('mdLayoutCss', disableLayoutDirective )

    .directive('layout', attributeWithObserve('layout'))
    .directive('layoutSm', attributeWithObserve('layout-sm'))
    .directive('layoutGtSm', attributeWithObserve('layout-gt-sm'))
    .directive('layoutMd', attributeWithObserve('layout-md'))
    .directive('layoutGtMd', attributeWithObserve('layout-gt-md'))
    .directive('layoutLg', attributeWithObserve('layout-lg'))
    .directive('layoutGtLg', attributeWithObserve('layout-gt-lg'))

    .directive('flex', attributeWithObserve('flex'))
    .directive('flexSm', attributeWithObserve('flex-sm'))
    .directive('flexGtSm', attributeWithObserve('flex-gt-sm'))
    .directive('flexMd', attributeWithObserve('flex-md'))
    .directive('flexGtMd', attributeWithObserve('flex-gt-md'))
    .directive('flexLg', attributeWithObserve('flex-lg'))
    .directive('flexGtLg', attributeWithObserve('flex-gt-lg'))

    .directive('flexOrder', attributeWithObserve('flex-order'))
    .directive('flexOrderSm', attributeWithObserve('flex-order-sm'))
    .directive('flexOrderGtSm', attributeWithObserve('flex-order-gt-sm'))
    .directive('flexOrderMd', attributeWithObserve('flex-order-md'))
    .directive('flexOrderGtMd', attributeWithObserve('flex-order-gt-md'))
    .directive('flexOrderLg', attributeWithObserve('flex-order-lg'))
    .directive('flexOrderGtLg', attributeWithObserve('flex-order-gt-lg'))

    .directive('flexOffset', attributeWithObserve('flex-offset'))
    .directive('flexOffsetSm', attributeWithObserve('flex-offset-sm'))
    .directive('flexOffsetGtSm', attributeWithObserve('flex-offset-gt-sm'))
    .directive('flexOffsetMd', attributeWithObserve('flex-offset-md'))
    .directive('flexOffsetGtMd', attributeWithObserve('flex-offset-gt-md'))
    .directive('flexOffsetLg', attributeWithObserve('flex-offset-lg'))
    .directive('flexOffsetGtLg', attributeWithObserve('flex-offset-gt-lg'))

    .directive('layoutAlign', attributeWithObserve('layout-align'))
    .directive('layoutAlignSm', attributeWithObserve('layout-align-sm'))
    .directive('layoutAlignGtSm', attributeWithObserve('layout-align-gt-sm'))
    .directive('layoutAlignMd', attributeWithObserve('layout-align-md'))
    .directive('layoutAlignGtMd', attributeWithObserve('layout-align-gt-md'))
    .directive('layoutAlignLg', attributeWithObserve('layout-align-lg'))
    .directive('layoutAlignGtLg', attributeWithObserve('layout-align-gt-lg'))

    // Attribute directives with no value(s)

    .directive('hide', attributeWithoutValue('hide'))
    .directive('hideSm', attributeWithoutValue('hide-sm'))
    .directive('hideGtSm', attributeWithoutValue('hide-gt-sm'))
    .directive('hideMd', attributeWithoutValue('hide-md'))
    .directive('hideGtMd', attributeWithoutValue('hide-gt-md'))
    .directive('hideLg', attributeWithoutValue('hide-lg'))
    .directive('hideGtLg', attributeWithoutValue('hide-gt-lg'))
    .directive('show', attributeWithoutValue('show'))
    .directive('showSm', attributeWithoutValue('show-sm'))
    .directive('showGtSm', attributeWithoutValue('show-gt-sm'))
    .directive('showMd', attributeWithoutValue('show-md'))
    .directive('showGtMd', attributeWithoutValue('show-gt-md'))
    .directive('showLg', attributeWithoutValue('show-lg'))
    .directive('showGtLg', attributeWithoutValue('show-gt-lg'))

    // Attribute directives with no value(s) and NO breakpoints

    .directive('layoutMargin', attributeWithoutValue('layout-margin'))
    .directive('layoutPadding', attributeWithoutValue('layout-padding'))
    .directive('layoutWrap', attributeWithoutValue('layout-wrap'))
    .directive('layoutNoWrap', attributeWithoutValue('layout-no-wrap'))
    .directive('layoutFill', attributeWithoutValue('layout-fill'))

    // !! Deprecated attributes: use the `-lt` (aka less-than) notations

    .directive('layoutLtMd', warnAttrNotSupported('layout-lt-md', true))
    .directive('layoutLtLg', warnAttrNotSupported('layout-lt-lg', true))
    .directive('flexLtMd', warnAttrNotSupported('flex-lt-md', true))
    .directive('flexLtLg', warnAttrNotSupported('flex-lt-lg', true))

    .directive('layoutAlignLtMd', warnAttrNotSupported('layout-align-lt-md'))
    .directive('layoutAlignLtLg', warnAttrNotSupported('layout-align-lt-lg'))
    .directive('flexOrderLtMd', warnAttrNotSupported('flex-order-lt-md'))
    .directive('flexOrderLtLg', warnAttrNotSupported('flex-order-lt-lg'))
    .directive('offsetLtMd', warnAttrNotSupported('flex-offset-lt-md'))
    .directive('offsetLtLg', warnAttrNotSupported('flex-offset-lt-lg'))

    .directive('hideLtMd', warnAttrNotSupported('hide-lt-md'))
    .directive('hideLtLg', warnAttrNotSupported('hide-lt-lg'))
    .directive('showLtMd', warnAttrNotSupported('show-lt-md'))
    .directive('showLtLg', warnAttrNotSupported('show-lt-lg'));

  /**
   * Special directive that will disable ALL Layout conversions of layout
   * attribute(s) to classname(s).
   *
   * <link rel="stylesheet" href="angular-material.min.css">
   * <link rel="stylesheet" href="angular-material.layout.css">
   *
   * <body md-layout-css>
   *  ...
   * </body>
   *
   * Note: Using md-layout-css directive requires the developer to load the Material
   * Layout Attribute stylesheet (which only uses attribute selectors):
   *
   *       `angular-material.layout.css`
   *
   * Another option is to use the LayoutProvider to configure and disable the attribute
   * conversions; this would obviate the use of the `md-layout-css` directive
   *
   */
  function disableLayoutDirective() {
    return {
      restrict : 'A',
      priority : '900',
      compile  : function(element, attr) {
        config.enabled = false;
        return angular.noop;
      }
    };
  }

  // *********************************************************************************
  //
  // These functions create registration functions for ngMaterial Layout attribute directives
  // This provides easy translation to switch ngMaterial attribute selectors to
  // CLASS selectors and directives; which has huge performance implications
  // for IE Browsers
  //
  // *********************************************************************************


  /**
   * Creates a directive registration function where a possible dynamic attribute
   * value will be observed/watched.
   * @param {string} className attribute name; eg `layout-gt-md` with value ="row"
   */
  function attributeWithObserve(className) {

    return ['$mdUtil', '$interpolate', function(_$mdUtil_, _$interpolate_) {
      $mdUtil = _$mdUtil_;
      $interpolate = _$interpolate_;

      return {
        restrict: 'A',
        compile: function(element, attr) {
          var linkFn;
          if (config.enabled) {
            // immediately replace static (non-interpolated) invalid values...

            validateAttributeValue( className,
              getNormalizedAttrValue(className, attr, ""),
              buildUpdateFn(element, className, attr)
            );

            linkFn = translateWithValueToCssClass;
          }

          // Use for postLink to account for transforms after ng-transclude.
          return linkFn || angular.noop;
        }
      };
    }];

    /**
     * Add as transformed class selector(s), then
     * remove the deprecated attribute selector
     */
    function translateWithValueToCssClass(scope, element, attrs) {
      var updateFn = updateClassWithValue(element, className, attrs);
      var unwatch = attrs.$observe(attrs.$normalize(className), updateFn);

      updateFn(getNormalizedAttrValue(className, attrs, ""));
      scope.$on("$destroy", function() { unwatch() });

      if (config.removeAttributes) element.removeAttr(className);
    }
  }

  /**
   * Creates a registration function for ngMaterial Layout attribute directive.
   * This is a `simple` transpose of attribute usage to class usage; where we ignore
   * any attribute value
   */
  function attributeWithoutValue(className) {
    return ['$interpolate', function(_$interpolate_) {
      $interpolate = _$interpolate_;

      return {
        restrict: 'A',
        compile: function(element, attr) {
          var linkFn;
          if (config.enabled) {
            // immediately replace static (non-interpolated) invalid values...

            validateAttributeValue( className,
              getNormalizedAttrValue(className, attr, ""),
              buildUpdateFn(element, className, attr)
            );

            translateToCssClass(null, element);

            // Use for postLink to account for transforms after ng-transclude.
            linkFn = translateToCssClass;
          }

          return linkFn || angular.noop;
        }
      };
    }];

    /**
     * Add as transformed class selector, then
     * remove the deprecated attribute selector
     */
    function translateToCssClass(scope, element) {
      element.addClass(className);

      if (config.removeAttributes) {
        // After link-phase, remove deprecated layout attribute selector
        element.removeAttr(className);
      }
    }
  }



  /**
   * After link-phase, do NOT remove deprecated layout attribute selector.
   * Instead watch the attribute so interpolated data-bindings to layout
   * selectors will continue to be supported.
   *
   * $observe() the className and update with new class (after removing the last one)
   *
   * e.g. `layout="{{layoutDemo.direction}}"` will update...
   *
   * NOTE: The value must match one of the specified styles in the CSS.
   * For example `flex-gt-md="{{size}}`  where `scope.size == 47` will NOT work since
   * only breakpoints for 0, 5, 10, 15... 100, 33, 34, 66, 67 are defined.
   *
   */
  function updateClassWithValue(element, className) {
    var lastClass;

    return function updateClassFn(newValue) {
      var value = validateAttributeValue(className, newValue || "");
      if ( angular.isDefined(value) ) {
        if (lastClass) { 
          element.removeClass(lastClass);
        }
        lastClass = !value ? className : className + "-" + value.replace(WHITESPACE, "-");
        element.addClass(lastClass);
      }
    };
  }

  /**
   * Provide console warning that this layout attribute has been deprecated
   *
   */
  function warnAttrNotSupported(className) {
    var parts = className.split("-");
    return ["$log", function($log) {
      $log.warn(className + "has been deprecated. Please use a `" + parts[0] + "-gt-<xxx>` variant.");
      return angular.noop;
    }];
  }

  /**
   * For the Layout attribute value, validate or replace with default
   * fallback value
   */
  function validateAttributeValue(className, value, updateFn) {
    var origValue = value;

    if (!needsInterpolation(value)) {
      switch (className.replace(SUFFIXES,"")) {
        case 'layout'        :
          if ( !findIn(value, LAYOUT_OPTIONS) ) {
            value = LAYOUT_OPTIONS[0];    // 'row';
          }
          break;

        case 'flex'          :
          if (!findIn(value, FLEX_OPTIONS)) {
            if (isNaN(value)) {
              value = '';
            }
          }
          break;

        case 'flex-offset' :
        case 'flex-order'    :
          if (!value || isNaN(+value)) {
            value = '0';
          }
          break;

        case 'layout-align'  :
          if (!findIn(value, ALIGNMENT_OPTIONS, "-")) {
            value = ALIGNMENT_OPTIONS[0];   // 'start-start';
          }
          break;

        case 'layout-padding' :
        case 'layout-margin'  :
        case 'layout-fill'    :
        case 'layout-wrap'    :
        case 'layout-no-wrap' :
          value = '';
          break;
      }

      if (value != origValue) {
        (updateFn || angular.noop)(value);
      }
    }

    return value;
  }

  /**
   * Replace current attribute value with fallback value
   */
  function buildUpdateFn(element, className, attrs) {
    return function updateAttrValue(fallback) {
      if (!needsInterpolation(fallback)) {
        element.attr(className, fallback);
        attrs[attrs.$normalize(className)] = fallback;
      }
    };
  }

  /**
   * See if the original value has interpolation symbols:
   * e.g.  flex-gt-md="{{triggerPoint}}"
   */
  function needsInterpolation(value) {
    return (value || "").indexOf($interpolate.startSymbol()) > -1;
  }

  function getNormalizedAttrValue(className, attrs, defaultVal) {
    var normalizedAttr = attrs.$normalize(className);
    return attrs[normalizedAttr] ? attrs[normalizedAttr].replace(WHITESPACE, "-") : defaultVal || null;
  }

  function findIn(item, list, replaceWith) {
    item = replaceWith && item ? item.replace(WHITESPACE, replaceWith) : item;

    var found = false;
    if (item) {
      list.forEach(function(it) {
        it = replaceWith ? it.replace(WHITESPACE, replaceWith) : it;
        found = found || (it === item);
      });
    }
    return found;
  }

})();

})();
(function(){
"use strict";

  /**
   * @ngdoc module
   * @name material.core.componentRegistry
   *
   * @description
   * A component instance registration service.
   * Note: currently this as a private service in the SideNav component.
   */
  angular.module('material.core')
    .factory('$mdComponentRegistry', ComponentRegistry);

  /*
   * @private
   * @ngdoc factory
   * @name ComponentRegistry
   * @module material.core.componentRegistry
   *
   */
  function ComponentRegistry($log, $q) {

    var self;
    var instances = [ ];
    var pendings = { };

    return self = {
      /**
       * Used to print an error when an instance for a handle isn't found.
       */
      notFoundError: function(handle) {
        $log.error('No instance found for handle', handle);
      },
      /**
       * Return all registered instances as an array.
       */
      getInstances: function() {
        return instances;
      },

      /**
       * Get a registered instance.
       * @param handle the String handle to look up for a registered instance.
       */
      get: function(handle) {
        if ( !isValidID(handle) ) return null;

        var i, j, instance;
        for(i = 0, j = instances.length; i < j; i++) {
          instance = instances[i];
          if(instance.$$mdHandle === handle) {
            return instance;
          }
        }
        return null;
      },

      /**
       * Register an instance.
       * @param instance the instance to register
       * @param handle the handle to identify the instance under.
       */
      register: function(instance, handle) {
        if ( !handle ) return angular.noop;

        instance.$$mdHandle = handle;
        instances.push(instance);
        resolveWhen();

        return deregister;

        /**
         * Remove registration for an instance
         */
        function deregister() {
          var index = instances.indexOf(instance);
          if (index !== -1) {
            instances.splice(index, 1);
          }
        }

        /**
         * Resolve any pending promises for this instance
         */
        function resolveWhen() {
          var dfd = pendings[handle];
          if ( dfd ) {
            dfd.resolve( instance );
            delete pendings[handle];
          }
        }
      },

      /**
       * Async accessor to registered component instance
       * If not available then a promise is created to notify
       * all listeners when the instance is registered.
       */
      when : function(handle) {
        if ( isValidID(handle) ) {
          var deferred = $q.defer();
          var instance = self.get(handle);

          if ( instance )  {
            deferred.resolve( instance );
          } else {
            pendings[handle] = deferred;
          }

          return deferred.promise;
        }
        return $q.reject("Invalid `md-component-id` value.");
      }

    };

    function isValidID(handle){
      return handle && (handle !== "");
    }

  }
  ComponentRegistry.$inject = ["$log", "$q"];

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name $mdButtonInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-button.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the default ripple configuration
   */

  angular.module('material.core')
    .factory('$mdButtonInkRipple', MdButtonInkRipple);

  function MdButtonInkRipple($mdInkRipple) {
    return {
      attach: function attachRipple(scope, element, options) {
        options = angular.extend(optionsForElement(element), options);

        return $mdInkRipple.attach(scope, element, options);
      }
    };

    function optionsForElement(element) {
      if (element.hasClass('md-icon-button')) {
        return {
          isMenuItem: element.hasClass('md-menu-item'),
          fitRipple: true,
          center: true
        };
      } else {
        return {
          isMenuItem: element.hasClass('md-menu-item'),
          dimBackground: true
        }
      }
    };
  }
  MdButtonInkRipple.$inject = ["$mdInkRipple"];;
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

    /**
   * @ngdoc service
   * @name $mdCheckboxInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-checkbox.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the defaultripple configuration
   */

  angular.module('material.core')
    .factory('$mdCheckboxInkRipple', MdCheckboxInkRipple);

  function MdCheckboxInkRipple($mdInkRipple) {
    return {
      attach: attach
    };

    function attach(scope, element, options) {
      return $mdInkRipple.attach(scope, element, angular.extend({
        center: true,
        dimBackground: false,
        fitRipple: true
      }, options));
    };
  }
  MdCheckboxInkRipple.$inject = ["$mdInkRipple"];;
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name $mdListInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-list.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the defaultripple configuration
   */

  angular.module('material.core')
    .factory('$mdListInkRipple', MdListInkRipple);

  function MdListInkRipple($mdInkRipple) {
    return {
      attach: attach
    };

    function attach(scope, element, options) {
      return $mdInkRipple.attach(scope, element, angular.extend({
        center: false,
        dimBackground: true,
        outline: false,
        rippleSize: 'full'
      }, options));
    };
  }
  MdListInkRipple.$inject = ["$mdInkRipple"];;
})();

})();
(function(){
"use strict";

angular.module('material.core')
    .factory('$mdInkRipple', InkRippleService)
    .directive('mdInkRipple', InkRippleDirective)
    .directive('mdNoInk', attrNoDirective)
    .directive('mdNoBar', attrNoDirective)
    .directive('mdNoStretch', attrNoDirective);

var DURATION = 450;

/**
 * Directive used to add ripples to any element
 * @ngInject
 */
function InkRippleDirective ($mdButtonInkRipple, $mdCheckboxInkRipple) {
  return {
    controller: angular.noop,
    link:       function (scope, element, attr) {
      attr.hasOwnProperty('mdInkRippleCheckbox')
          ? $mdCheckboxInkRipple.attach(scope, element)
          : $mdButtonInkRipple.attach(scope, element);
    }
  };
}
InkRippleDirective.$inject = ["$mdButtonInkRipple", "$mdCheckboxInkRipple"];

/**
 * Service for adding ripples to any element
 * @ngInject
 */
function InkRippleService ($injector) {
  return { attach: attach };
  function attach (scope, element, options) {
    if (element.controller('mdNoInk')) return angular.noop;
    return $injector.instantiate(InkRippleCtrl, {
      $scope:        scope,
      $element:      element,
      rippleOptions: options
    });
  }
}
InkRippleService.$inject = ["$injector"];

/**
 * Controller used by the ripple service in order to apply ripples
 * @ngInject
 */
function InkRippleCtrl ($scope, $element, rippleOptions, $window, $timeout, $mdUtil) {
  this.$window    = $window;
  this.$timeout   = $timeout;
  this.$mdUtil    = $mdUtil;
  this.$scope     = $scope;
  this.$element   = $element;
  this.options    = rippleOptions;
  this.mousedown  = false;
  this.ripples    = [];
  this.timeout    = null; // Stores a reference to the most-recent ripple timeout
  this.lastRipple = null;

  $mdUtil.valueOnUse(this, 'container', this.createContainer);
  $mdUtil.valueOnUse(this, 'background', this.getColor, 0.5);

  this.color = this.getColor(1);
  this.$element.addClass('md-ink-ripple');

  // attach method for unit tests
  ($element.controller('mdInkRipple') || {}).createRipple = angular.bind(this, this.createRipple);
  ($element.controller('mdInkRipple') || {}).setColor = angular.bind(this, this.setColor);

  this.bindEvents();
}
InkRippleCtrl.$inject = ["$scope", "$element", "rippleOptions", "$window", "$timeout", "$mdUtil"];

/**
 * Returns the color that the ripple should be (either based on CSS or hard-coded)
 * @returns {string}
 */
InkRippleCtrl.prototype.getColor = function () {
  return this._parseColor(this.$element.attr('md-ink-ripple'))
      || this._parseColor(getElementColor.call(this));

  /**
   * Finds the color element and returns its text color for use as default ripple color
   * @returns {string}
   */
  function getElementColor () {
    var colorElement = this.options.colorElement && this.options.colorElement[ 0 ];
    colorElement     = colorElement || this.$element[ 0 ];
    return colorElement ? this.$window.getComputedStyle(colorElement).color : 'rgb(0,0,0)';
  }
};
/**
 * Takes a string color and converts it to RGBA format
 * @param color {string}
 * @param [multiplier] {int}
 * @returns {string}
 */

InkRippleCtrl.prototype._parseColor = function parseColor (color, multiplier) {
  multiplier = multiplier || 1;

  if (!color) return;
  if (color.indexOf('rgba') === 0) return color.replace(/\d?\.?\d*\s*\)\s*$/, (0.1 * multiplier).toString() + ')');
  if (color.indexOf('rgb') === 0) return rgbToRGBA(color);
  if (color.indexOf('#') === 0) return hexToRGBA(color);

  /**
   * Converts hex value to RGBA string
   * @param color {string}
   * @returns {string}
   */
  function hexToRGBA (color) {
    var hex   = color[ 0 ] === '#' ? color.substr(1) : color,
      dig   = hex.length / 3,
      red   = hex.substr(0, dig),
      green = hex.substr(dig, dig),
      blue  = hex.substr(dig * 2);
    if (dig === 1) {
      red += red;
      green += green;
      blue += blue;
    }
    return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) + ',0.1)';
  }

  /**
   * Converts an RGB color to RGBA
   * @param color {string}
   * @returns {string}
   */
  function rgbToRGBA (color) {
    return color.replace(')', ', 0.1)').replace('(', 'a(');
  }

};

/**
 * Binds events to the root element for
 */
InkRippleCtrl.prototype.bindEvents = function () {
  this.$element.on('mousedown', angular.bind(this, this.handleMousedown));
  this.$element.on('mouseup', angular.bind(this, this.handleMouseup));
  this.$element.on('mouseleave', angular.bind(this, this.handleMouseup));
};

/**
 * Create a new ripple on every mousedown event from the root element
 * @param event {MouseEvent}
 */
InkRippleCtrl.prototype.handleMousedown = function (event) {
  if ( this.mousedown ) return;

  this.setColor(window.getComputedStyle(this.$element[0])['color']);

  // When jQuery is loaded, we have to get the original event
  if (event.hasOwnProperty('originalEvent')) event = event.originalEvent;
  this.mousedown = true;
  if (this.options.center) {
    this.createRipple(this.container.prop('clientWidth') / 2, this.container.prop('clientWidth') / 2);
  } else {
    this.createRipple(event.layerX, event.layerY);
  }
};

/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (either by
 * mouseup or mouseleave event)
 */
InkRippleCtrl.prototype.handleMouseup = function () {
  if ( this.mousedown || this.lastRipple ) {
    var ctrl       = this;
    this.mousedown = false;
    this.$mdUtil.nextTick(function () {
      ctrl.clearRipples();
    }, false);
  }
};

/**
 * Cycles through all ripples and attempts to remove them.
 * Depending on logic within `fadeInComplete`, some removals will be postponed.
 */
InkRippleCtrl.prototype.clearRipples = function () {
  for (var i = 0; i < this.ripples.length; i++) {
    this.fadeInComplete(this.ripples[ i ]);
  }
};

/**
 * Creates the ripple container element
 * @returns {*}
 */
InkRippleCtrl.prototype.createContainer = function () {
  var container = angular.element('<div class="md-ripple-container"></div>');
  this.$element.append(container);
  return container;
};

InkRippleCtrl.prototype.clearTimeout = function () {
  if (this.timeout) {
    this.$timeout.cancel(this.timeout);
    this.timeout = null;
  }
};

InkRippleCtrl.prototype.isRippleAllowed = function () {
  var element = this.$element[0];
  do {
    if (!element.tagName || element.tagName === 'BODY') break;
    if (element && element.hasAttribute && element.hasAttribute('disabled')) return false;
  } while (element = element.parentNode);
  return true;
};

/**
 * Creates a new ripple and adds it to the container.  Also tracks ripple in `this.ripples`.
 * @param left
 * @param top
 */
InkRippleCtrl.prototype.createRipple = function (left, top) {
  if (!this.isRippleAllowed()) return;

  var ctrl        = this;
  var ripple      = angular.element('<div class="md-ripple"></div>');
  var width       = this.$element.prop('clientWidth');
  var height      = this.$element.prop('clientHeight');
  var x           = Math.max(Math.abs(width - left), left) * 2;
  var y           = Math.max(Math.abs(height - top), top) * 2;
  var size        = getSize(this.options.fitRipple, x, y);

  ripple.css({
    left:            left + 'px',
    top:             top + 'px',
    background:      'black',
    width:           size + 'px',
    height:          size + 'px',
    backgroundColor: rgbaToRGB(this.color),
    borderColor:     rgbaToRGB(this.color)
  });
  this.lastRipple = ripple;

  // we only want one timeout to be running at a time
  this.clearTimeout();
  this.timeout    = this.$timeout(function () {
    ctrl.clearTimeout();
    if (!ctrl.mousedown) ctrl.fadeInComplete(ripple);
  }, DURATION * 0.35, false);

  if (this.options.dimBackground) this.container.css({ backgroundColor: this.background });
  this.container.append(ripple);
  this.ripples.push(ripple);
  ripple.addClass('md-ripple-placed');

  this.$mdUtil.nextTick(function () {

    ripple.addClass('md-ripple-scaled md-ripple-active');
    ctrl.$timeout(function () {
      ctrl.clearRipples();
    }, DURATION, false);

  }, false);

  function rgbaToRGB (color) {
    return color
        ? color.replace('rgba', 'rgb').replace(/,[^\),]+\)/, ')')
        : 'rgb(0,0,0)';
  }

  function getSize (fit, x, y) {
    return fit
        ? Math.max(x, y)
        : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }
};

InkRippleCtrl.prototype.setColor = function (color) {
  this.color = this._parseColor(color);
};

/**
 * Either kicks off the fade-out animation or queues the element for removal on mouseup
 * @param ripple
 */
InkRippleCtrl.prototype.fadeInComplete = function (ripple) {
  if (this.lastRipple === ripple) {
    if (!this.timeout && !this.mousedown) {
      this.removeRipple(ripple);
    }
  } else {
    this.removeRipple(ripple);
  }
};

/**
 * Kicks off the animation for removing a ripple
 * @param ripple {Element}
 */
InkRippleCtrl.prototype.removeRipple = function (ripple) {
  var ctrl  = this;
  var index = this.ripples.indexOf(ripple);
  if (index < 0) return;
  this.ripples.splice(this.ripples.indexOf(ripple), 1);
  ripple.removeClass('md-ripple-active');
  if (this.ripples.length === 0) this.container.css({ backgroundColor: '' });
  // use a 2-second timeout in order to allow for the animation to finish
  // we don't actually care how long the animation takes
  this.$timeout(function () {
    ctrl.fadeOutComplete(ripple);
  }, DURATION, false);
};

/**
 * Removes the provided ripple from the DOM
 * @param ripple
 */
InkRippleCtrl.prototype.fadeOutComplete = function (ripple) {
  ripple.remove();
  this.lastRipple = null;
};

/**
 * Used to create an empty directive.  This is used to track flag-directives whose children may have
 * functionality based on them.
 *
 * Example: `md-no-ink` will potentially be used by all child directives.
 */
function attrNoDirective () {
  return { controller: angular.noop };
}

})();
(function(){
"use strict";

(function() {
  'use strict';

    /**
   * @ngdoc service
   * @name $mdTabInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-tabs.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the defaultripple configuration
   */

  angular.module('material.core')
    .factory('$mdTabInkRipple', MdTabInkRipple);

  function MdTabInkRipple($mdInkRipple) {
    return {
      attach: attach
    };

    function attach(scope, element, options) {
      return $mdInkRipple.attach(scope, element, angular.extend({
        center: false,
        dimBackground: true,
        outline: false,
        rippleSize: 'full'
      }, options));
    };
  }
  MdTabInkRipple.$inject = ["$mdInkRipple"];;
})();

})();
(function(){
"use strict";

angular.module('material.core.theming.palette', [])
.constant('$mdColorPalette', {
  'red': {
    '50': '#ffebee',
    '100': '#ffcdd2',
    '200': '#ef9a9a',
    '300': '#e57373',
    '400': '#ef5350',
    '500': '#f44336',
    '600': '#e53935',
    '700': '#d32f2f',
    '800': '#c62828',
    '900': '#b71c1c',
    'A100': '#ff8a80',
    'A200': '#ff5252',
    'A400': '#ff1744',
    'A700': '#d50000',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 A100',
    'contrastStrongLightColors': '400 500 600 700 A200 A400 A700'
  },
  'pink': {
    '50': '#fce4ec',
    '100': '#f8bbd0',
    '200': '#f48fb1',
    '300': '#f06292',
    '400': '#ec407a',
    '500': '#e91e63',
    '600': '#d81b60',
    '700': '#c2185b',
    '800': '#ad1457',
    '900': '#880e4f',
    'A100': '#ff80ab',
    'A200': '#ff4081',
    'A400': '#f50057',
    'A700': '#c51162',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100',
    'contrastStrongLightColors': '500 600 A200 A400 A700'
  },
  'purple': {
    '50': '#f3e5f5',
    '100': '#e1bee7',
    '200': '#ce93d8',
    '300': '#ba68c8',
    '400': '#ab47bc',
    '500': '#9c27b0',
    '600': '#8e24aa',
    '700': '#7b1fa2',
    '800': '#6a1b9a',
    '900': '#4a148c',
    'A100': '#ea80fc',
    'A200': '#e040fb',
    'A400': '#d500f9',
    'A700': '#aa00ff',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100',
    'contrastStrongLightColors': '300 400 A200 A400 A700'
  },
  'deep-purple': {
    '50': '#ede7f6',
    '100': '#d1c4e9',
    '200': '#b39ddb',
    '300': '#9575cd',
    '400': '#7e57c2',
    '500': '#673ab7',
    '600': '#5e35b1',
    '700': '#512da8',
    '800': '#4527a0',
    '900': '#311b92',
    'A100': '#b388ff',
    'A200': '#7c4dff',
    'A400': '#651fff',
    'A700': '#6200ea',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100',
    'contrastStrongLightColors': '300 400 A200'
  },
  'indigo': {
    '50': '#e8eaf6',
    '100': '#c5cae9',
    '200': '#9fa8da',
    '300': '#7986cb',
    '400': '#5c6bc0',
    '500': '#3f51b5',
    '600': '#3949ab',
    '700': '#303f9f',
    '800': '#283593',
    '900': '#1a237e',
    'A100': '#8c9eff',
    'A200': '#536dfe',
    'A400': '#3d5afe',
    'A700': '#304ffe',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100',
    'contrastStrongLightColors': '300 400 A200 A400'
  },
  'blue': {
    '50': '#e3f2fd',
    '100': '#bbdefb',
    '200': '#90caf9',
    '300': '#64b5f6',
    '400': '#42a5f5',
    '500': '#2196f3',
    '600': '#1e88e5',
    '700': '#1976d2',
    '800': '#1565c0',
    '900': '#0d47a1',
    'A100': '#82b1ff',
    'A200': '#448aff',
    'A400': '#2979ff',
    'A700': '#2962ff',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 A100',
    'contrastStrongLightColors': '500 600 700 A200 A400 A700'
  },
  'light-blue': {
    '50': '#e1f5fe',
    '100': '#b3e5fc',
    '200': '#81d4fa',
    '300': '#4fc3f7',
    '400': '#29b6f6',
    '500': '#03a9f4',
    '600': '#039be5',
    '700': '#0288d1',
    '800': '#0277bd',
    '900': '#01579b',
    'A100': '#80d8ff',
    'A200': '#40c4ff',
    'A400': '#00b0ff',
    'A700': '#0091ea',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '600 700 800 900 A700',
    'contrastStrongLightColors': '600 700 800 A700'
  },
  'cyan': {
    '50': '#e0f7fa',
    '100': '#b2ebf2',
    '200': '#80deea',
    '300': '#4dd0e1',
    '400': '#26c6da',
    '500': '#00bcd4',
    '600': '#00acc1',
    '700': '#0097a7',
    '800': '#00838f',
    '900': '#006064',
    'A100': '#84ffff',
    'A200': '#18ffff',
    'A400': '#00e5ff',
    'A700': '#00b8d4',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '700 800 900',
    'contrastStrongLightColors': '700 800 900'
  },
  'teal': {
    '50': '#e0f2f1',
    '100': '#b2dfdb',
    '200': '#80cbc4',
    '300': '#4db6ac',
    '400': '#26a69a',
    '500': '#009688',
    '600': '#00897b',
    '700': '#00796b',
    '800': '#00695c',
    '900': '#004d40',
    'A100': '#a7ffeb',
    'A200': '#64ffda',
    'A400': '#1de9b6',
    'A700': '#00bfa5',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '500 600 700 800 900',
    'contrastStrongLightColors': '500 600 700'
  },
  'green': {
    '50': '#e8f5e9',
    '100': '#c8e6c9',
    '200': '#a5d6a7',
    '300': '#81c784',
    '400': '#66bb6a',
    '500': '#4caf50',
    '600': '#43a047',
    '700': '#388e3c',
    '800': '#2e7d32',
    '900': '#1b5e20',
    'A100': '#b9f6ca',
    'A200': '#69f0ae',
    'A400': '#00e676',
    'A700': '#00c853',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '600 700 800 900',
    'contrastStrongLightColors': '600 700'
  },
  'light-green': {
    '50': '#f1f8e9',
    '100': '#dcedc8',
    '200': '#c5e1a5',
    '300': '#aed581',
    '400': '#9ccc65',
    '500': '#8bc34a',
    '600': '#7cb342',
    '700': '#689f38',
    '800': '#558b2f',
    '900': '#33691e',
    'A100': '#ccff90',
    'A200': '#b2ff59',
    'A400': '#76ff03',
    'A700': '#64dd17',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '700 800 900',
    'contrastStrongLightColors': '700 800 900'
  },
  'lime': {
    '50': '#f9fbe7',
    '100': '#f0f4c3',
    '200': '#e6ee9c',
    '300': '#dce775',
    '400': '#d4e157',
    '500': '#cddc39',
    '600': '#c0ca33',
    '700': '#afb42b',
    '800': '#9e9d24',
    '900': '#827717',
    'A100': '#f4ff81',
    'A200': '#eeff41',
    'A400': '#c6ff00',
    'A700': '#aeea00',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '900',
    'contrastStrongLightColors': '900'
  },
  'yellow': {
    '50': '#fffde7',
    '100': '#fff9c4',
    '200': '#fff59d',
    '300': '#fff176',
    '400': '#ffee58',
    '500': '#ffeb3b',
    '600': '#fdd835',
    '700': '#fbc02d',
    '800': '#f9a825',
    '900': '#f57f17',
    'A100': '#ffff8d',
    'A200': '#ffff00',
    'A400': '#ffea00',
    'A700': '#ffd600',
    'contrastDefaultColor': 'dark'
  },
  'amber': {
    '50': '#fff8e1',
    '100': '#ffecb3',
    '200': '#ffe082',
    '300': '#ffd54f',
    '400': '#ffca28',
    '500': '#ffc107',
    '600': '#ffb300',
    '700': '#ffa000',
    '800': '#ff8f00',
    '900': '#ff6f00',
    'A100': '#ffe57f',
    'A200': '#ffd740',
    'A400': '#ffc400',
    'A700': '#ffab00',
    'contrastDefaultColor': 'dark'
  },
  'orange': {
    '50': '#fff3e0',
    '100': '#ffe0b2',
    '200': '#ffcc80',
    '300': '#ffb74d',
    '400': '#ffa726',
    '500': '#ff9800',
    '600': '#fb8c00',
    '700': '#f57c00',
    '800': '#ef6c00',
    '900': '#e65100',
    'A100': '#ffd180',
    'A200': '#ffab40',
    'A400': '#ff9100',
    'A700': '#ff6d00',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '800 900',
    'contrastStrongLightColors': '800 900'
  },
  'deep-orange': {
    '50': '#fbe9e7',
    '100': '#ffccbc',
    '200': '#ffab91',
    '300': '#ff8a65',
    '400': '#ff7043',
    '500': '#ff5722',
    '600': '#f4511e',
    '700': '#e64a19',
    '800': '#d84315',
    '900': '#bf360c',
    'A100': '#ff9e80',
    'A200': '#ff6e40',
    'A400': '#ff3d00',
    'A700': '#dd2c00',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 A100 A200',
    'contrastStrongLightColors': '500 600 700 800 900 A400 A700'
  },
  'brown': {
    '50': '#efebe9',
    '100': '#d7ccc8',
    '200': '#bcaaa4',
    '300': '#a1887f',
    '400': '#8d6e63',
    '500': '#795548',
    '600': '#6d4c41',
    '700': '#5d4037',
    '800': '#4e342e',
    '900': '#3e2723',
    'A100': '#d7ccc8',
    'A200': '#bcaaa4',
    'A400': '#8d6e63',
    'A700': '#5d4037',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200',
    'contrastStrongLightColors': '300 400'
  },
  'grey': {
    '50': '#fafafa',
    '100': '#f5f5f5',
    '200': '#eeeeee',
    '300': '#e0e0e0',
    '400': '#bdbdbd',
    '500': '#9e9e9e',
    '600': '#757575',
    '700': '#616161',
    '800': '#424242',
    '900': '#212121',
    '1000': '#000000',
    'A100': '#ffffff',
    'A200': '#eeeeee',
    'A400': '#bdbdbd',
    'A700': '#616161',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': '600 700 800 900'
  },
  'blue-grey': {
    '50': '#eceff1',
    '100': '#cfd8dc',
    '200': '#b0bec5',
    '300': '#90a4ae',
    '400': '#78909c',
    '500': '#607d8b',
    '600': '#546e7a',
    '700': '#455a64',
    '800': '#37474f',
    '900': '#263238',
    'A100': '#cfd8dc',
    'A200': '#b0bec5',
    'A400': '#78909c',
    'A700': '#455a64',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300',
    'contrastStrongLightColors': '400 500'
  }
});

})();
(function(){
"use strict";

angular.module('material.core.theming', ['material.core.theming.palette'])
  .directive('mdTheme', ThemingDirective)
  .directive('mdThemable', ThemableDirective)
  .provider('$mdTheming', ThemingProvider)
  .run(generateThemes);

/**
 * @ngdoc service
 * @name $mdThemingProvider
 * @module material.core.theming
 *
 * @description Provider to configure the `$mdTheming` service.
 */

/**
 * @ngdoc method
 * @name $mdThemingProvider#setDefaultTheme
 * @param {string} themeName Default theme name to be applied to elements. Default value is `default`.
 */

/**
 * @ngdoc method
 * @name $mdThemingProvider#alwaysWatchTheme
 * @param {boolean} watch Whether or not to always watch themes for changes and re-apply
 * classes when they change. Default is `false`. Enabling can reduce performance.
 */

/* Some Example Valid Theming Expressions
 * =======================================
 *
 * Intention group expansion: (valid for primary, accent, warn, background)
 *
 * {{primary-100}} - grab shade 100 from the primary palette
 * {{primary-100-0.7}} - grab shade 100, apply opacity of 0.7
 * {{primary-100-contrast}} - grab shade 100's contrast color
 * {{primary-hue-1}} - grab the shade assigned to hue-1 from the primary palette
 * {{primary-hue-1-0.7}} - apply 0.7 opacity to primary-hue-1
 * {{primary-color}} - Generates .md-hue-1, .md-hue-2, .md-hue-3 with configured shades set for each hue
 * {{primary-color-0.7}} - Apply 0.7 opacity to each of the above rules
 * {{primary-contrast}} - Generates .md-hue-1, .md-hue-2, .md-hue-3 with configured contrast (ie. text) color shades set for each hue
 * {{primary-contrast-0.7}} - Apply 0.7 opacity to each of the above rules
 *
 * Foreground expansion: Applies rgba to black/white foreground text
 *
 * {{foreground-1}} - used for primary text
 * {{foreground-2}} - used for secondary text/divider
 * {{foreground-3}} - used for disabled text
 * {{foreground-4}} - used for dividers
 *
 */

// In memory generated CSS rules; registered by theme.name
var GENERATED = { };

// In memory storage of defined themes and color palettes (both loaded by CSS, and user specified)
var PALETTES;
var THEMES;

var DARK_FOREGROUND = {
  name: 'dark',
  '1': 'rgba(0,0,0,0.87)',
  '2': 'rgba(0,0,0,0.54)',
  '3': 'rgba(0,0,0,0.26)',
  '4': 'rgba(0,0,0,0.12)'
};
var LIGHT_FOREGROUND = {
  name: 'light',
  '1': 'rgba(255,255,255,1.0)',
  '2': 'rgba(255,255,255,0.7)',
  '3': 'rgba(255,255,255,0.3)',
  '4': 'rgba(255,255,255,0.12)'
};

var DARK_SHADOW = '1px 1px 0px rgba(0,0,0,0.4), -1px -1px 0px rgba(0,0,0,0.4)';
var LIGHT_SHADOW = '';

var DARK_CONTRAST_COLOR = colorToRgbaArray('rgba(0,0,0,0.87)');
var LIGHT_CONTRAST_COLOR = colorToRgbaArray('rgba(255,255,255,0.87');
var STRONG_LIGHT_CONTRAST_COLOR = colorToRgbaArray('rgb(255,255,255)');

var THEME_COLOR_TYPES = ['primary', 'accent', 'warn', 'background'];
var DEFAULT_COLOR_TYPE = 'primary';

// A color in a theme will use these hues by default, if not specified by user.
var LIGHT_DEFAULT_HUES = {
  'accent': {
    'default': 'A200',
    'hue-1': 'A100',
    'hue-2': 'A400',
    'hue-3': 'A700'
  },
  'background': {
    'default': 'A100',
    'hue-1': '300',
    'hue-2': '800',
    'hue-3': '900'
  }
};

var DARK_DEFAULT_HUES = {
  'background': {
    'default': '800',
    'hue-1': '600',
    'hue-2': '300',
    'hue-3': '900'
  }
};
THEME_COLOR_TYPES.forEach(function(colorType) {
  // Color types with unspecified default hues will use these default hue values
  var defaultDefaultHues = {
    'default': '500',
    'hue-1': '300',
    'hue-2': '800',
    'hue-3': 'A100'
  };
  if (!LIGHT_DEFAULT_HUES[colorType]) LIGHT_DEFAULT_HUES[colorType] = defaultDefaultHues;
  if (!DARK_DEFAULT_HUES[colorType]) DARK_DEFAULT_HUES[colorType] = defaultDefaultHues;
});

var VALID_HUE_VALUES = [
  '50', '100', '200', '300', '400', '500', '600',
  '700', '800', '900', 'A100', 'A200', 'A400', 'A700'
];

function ThemingProvider($mdColorPalette) {
  PALETTES = { };
  THEMES = { };

  var themingProvider;
  var defaultTheme = 'default';
  var alwaysWatchTheme = false;

  // Load JS Defined Palettes
  angular.extend(PALETTES, $mdColorPalette);

  // Default theme defined in core.js

  ThemingService.$inject = ["$rootScope", "$log"];
  return themingProvider = {
    definePalette: definePalette,
    extendPalette: extendPalette,
    theme: registerTheme,

    setDefaultTheme: function(theme) {
      defaultTheme = theme;
    },
    alwaysWatchTheme: function(alwaysWatch) {
      alwaysWatchTheme = alwaysWatch;
    },
    $get: ThemingService,
    _LIGHT_DEFAULT_HUES: LIGHT_DEFAULT_HUES,
    _DARK_DEFAULT_HUES: DARK_DEFAULT_HUES,
    _PALETTES: PALETTES,
    _THEMES: THEMES,
    _parseRules: parseRules,
    _rgba: rgba
  };

  // Example: $mdThemingProvider.definePalette('neonRed', { 50: '#f5fafa', ... });
  function definePalette(name, map) {
    map = map || {};
    PALETTES[name] = checkPaletteValid(name, map);
    return themingProvider;
  }

  // Returns an new object which is a copy of a given palette `name` with variables from
  // `map` overwritten
  // Example: var neonRedMap = $mdThemingProvider.extendPalette('red', { 50: '#f5fafafa' });
  function extendPalette(name, map) {
    return checkPaletteValid(name,  angular.extend({}, PALETTES[name] || {}, map) );
  }

  // Make sure that palette has all required hues
  function checkPaletteValid(name, map) {
    var missingColors = VALID_HUE_VALUES.filter(function(field) {
      return !map[field];
    });
    if (missingColors.length) {
      throw new Error("Missing colors %1 in palette %2!"
                      .replace('%1', missingColors.join(', '))
                      .replace('%2', name));
    }

    return map;
  }

  // Register a theme (which is a collection of color palettes to use with various states
  // ie. warn, accent, primary )
  // Optionally inherit from an existing theme
  // $mdThemingProvider.theme('custom-theme').primaryPalette('red');
  function registerTheme(name, inheritFrom) {
    if (THEMES[name]) return THEMES[name];

    inheritFrom = inheritFrom || 'default';

    var parentTheme = typeof inheritFrom === 'string' ? THEMES[inheritFrom] : inheritFrom;
    var theme = new Theme(name);

    if (parentTheme) {
      angular.forEach(parentTheme.colors, function(color, colorType) {
        theme.colors[colorType] = {
          name: color.name,
          // Make sure a COPY of the hues is given to the child color,
          // not the same reference.
          hues: angular.extend({}, color.hues)
        };
      });
    }
    THEMES[name] = theme;

    return theme;
  }

  function Theme(name) {
    var self = this;
    self.name = name;
    self.colors = {};

    self.dark = setDark;
    setDark(false);

    function setDark(isDark) {
      isDark = arguments.length === 0 ? true : !!isDark;

      // If no change, abort
      if (isDark === self.isDark) return;

      self.isDark = isDark;

      self.foregroundPalette = self.isDark ? LIGHT_FOREGROUND : DARK_FOREGROUND;
      self.foregroundShadow = self.isDark ? DARK_SHADOW : LIGHT_SHADOW;

      // Light and dark themes have different default hues.
      // Go through each existing color type for this theme, and for every
      // hue value that is still the default hue value from the previous light/dark setting,
      // set it to the default hue value from the new light/dark setting.
      var newDefaultHues = self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES;
      var oldDefaultHues = self.isDark ? LIGHT_DEFAULT_HUES : DARK_DEFAULT_HUES;
      angular.forEach(newDefaultHues, function(newDefaults, colorType) {
        var color = self.colors[colorType];
        var oldDefaults = oldDefaultHues[colorType];
        if (color) {
          for (var hueName in color.hues) {
            if (color.hues[hueName] === oldDefaults[hueName]) {
              color.hues[hueName] = newDefaults[hueName];
            }
          }
        }
      });

      return self;
    }

    THEME_COLOR_TYPES.forEach(function(colorType) {
      var defaultHues = (self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES)[colorType];
      self[colorType + 'Palette'] = function setPaletteType(paletteName, hues) {
        var color = self.colors[colorType] = {
          name: paletteName,
          hues: angular.extend({}, defaultHues, hues)
        };

        Object.keys(color.hues).forEach(function(name) {
          if (!defaultHues[name]) {
            throw new Error("Invalid hue name '%1' in theme %2's %3 color %4. Available hue names: %4"
              .replace('%1', name)
              .replace('%2', self.name)
              .replace('%3', paletteName)
              .replace('%4', Object.keys(defaultHues).join(', '))
            );
          }
        });
        Object.keys(color.hues).map(function(key) {
          return color.hues[key];
        }).forEach(function(hueValue) {
          if (VALID_HUE_VALUES.indexOf(hueValue) == -1) {
            throw new Error("Invalid hue value '%1' in theme %2's %3 color %4. Available hue values: %5"
              .replace('%1', hueValue)
              .replace('%2', self.name)
              .replace('%3', colorType)
              .replace('%4', paletteName)
              .replace('%5', VALID_HUE_VALUES.join(', '))
            );
          }
        });
        return self;
      };

      self[colorType + 'Color'] = function() {
        var args = Array.prototype.slice.call(arguments);
        console.warn('$mdThemingProviderTheme.' + colorType + 'Color() has been deprecated. ' +
                     'Use $mdThemingProviderTheme.' + colorType + 'Palette() instead.');
        return self[colorType + 'Palette'].apply(self, args);
      };
    });
  }

  /**
   * @ngdoc service
   * @name $mdTheming
   *
   * @description
   *
   * Service that makes an element apply theming related classes to itself.
   *
   * ```js
   * app.directive('myFancyDirective', function($mdTheming) {
   *   return {
   *     restrict: 'e',
   *     link: function(scope, el, attrs) {
   *       $mdTheming(el);
   *     }
   *   };
   * });
   * ```
   * @param {el=} element to apply theming to
   */
  /* @ngInject */
  function ThemingService($rootScope, $log) {

    applyTheme.inherit = function(el, parent) {
      var ctrl = parent.controller('mdTheme');

      var attrThemeValue = el.attr('md-theme-watch');
      if ( (alwaysWatchTheme || angular.isDefined(attrThemeValue)) && attrThemeValue != 'false') {
        var deregisterWatch = $rootScope.$watch(function() {
          return ctrl && ctrl.$mdTheme || (defaultTheme == 'default' ? '' : defaultTheme);
        }, changeTheme);
        el.on('$destroy', deregisterWatch);
      } else {
        var theme = ctrl && ctrl.$mdTheme || (defaultTheme == 'default' ? '' : defaultTheme);
        changeTheme(theme);
      }

      function changeTheme(theme) {
        if (!theme) return;
        if (!registered(theme)) {
          $log.warn('Attempted to use unregistered theme \'' + theme + '\'. ' +
                    'Register it with $mdThemingProvider.theme().');
        }
        var oldTheme = el.data('$mdThemeName');
        if (oldTheme) el.removeClass('md-' + oldTheme +'-theme');
        el.addClass('md-' + theme + '-theme');
        el.data('$mdThemeName', theme);
        if (ctrl) {
          el.data('$mdThemeController', ctrl);
        }
      }
    };

    applyTheme.THEMES = angular.extend({}, THEMES);
    applyTheme.defaultTheme = function() { return defaultTheme; };
    applyTheme.registered = registered;

    return applyTheme;

    function registered(themeName) {
      if (themeName === undefined || themeName === '') return true;
      return applyTheme.THEMES[themeName] !== undefined;
    }

    function applyTheme(scope, el) {
      // Allow us to be invoked via a linking function signature.
      if (el === undefined) {
        el = scope;
        scope = undefined;
      }
      if (scope === undefined) {
        scope = $rootScope;
      }
      applyTheme.inherit(el, el);
    }
  }
}
ThemingProvider.$inject = ["$mdColorPalette"];

function ThemingDirective($mdTheming, $interpolate, $log) {
  return {
    priority: 100,
    link: {
      pre: function(scope, el, attrs) {
        var ctrl = {
          $setTheme: function(theme) {
            if (!$mdTheming.registered(theme)) {
              $log.warn('attempted to use unregistered theme \'' + theme + '\'');
            }
            ctrl.$mdTheme = theme;
          }
        };
        el.data('$mdThemeController', ctrl);
        ctrl.$setTheme($interpolate(attrs.mdTheme)(scope));
        attrs.$observe('mdTheme', ctrl.$setTheme);
      }
    }
  };
}
ThemingDirective.$inject = ["$mdTheming", "$interpolate", "$log"];

function ThemableDirective($mdTheming) {
  return $mdTheming;
}
ThemableDirective.$inject = ["$mdTheming"];

function parseRules(theme, colorType, rules) {
  checkValidPalette(theme, colorType);

  rules = rules.replace(/THEME_NAME/g, theme.name);
  var generatedRules = [];
  var color = theme.colors[colorType];

  var themeNameRegex = new RegExp('.md-' + theme.name + '-theme', 'g');
  // Matches '{{ primary-color }}', etc
  var hueRegex = new RegExp('(\'|")?{{\\s*(' + colorType + ')-(color|contrast)-?(\\d\\.?\\d*)?\\s*}}(\"|\')?','g');
  var simpleVariableRegex = /'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue\-[0-3]|shadow)-?(\d\.?\d*)?(contrast)?\s*\}\}'?"?/g;
  var palette = PALETTES[color.name];

  // find and replace simple variables where we use a specific hue, not an entire palette
  // eg. "{{primary-100}}"
  //\(' + THEME_COLOR_TYPES.join('\|') + '\)'
  rules = rules.replace(simpleVariableRegex, function(match, colorType, hue, opacity, contrast) {
    if (colorType === 'foreground') {
      if (hue == 'shadow') {
        return theme.foregroundShadow;
      } else {
        return theme.foregroundPalette[hue] || theme.foregroundPalette['1'];
      }
    }
    if (hue.indexOf('hue') === 0) {
      hue = theme.colors[colorType].hues[hue];
    }
    return rgba( (PALETTES[ theme.colors[colorType].name ][hue] || '')[contrast ? 'contrast' : 'value'], opacity );
  });

  // For each type, generate rules for each hue (ie. default, md-hue-1, md-hue-2, md-hue-3)
  angular.forEach(color.hues, function(hueValue, hueName) {
    var newRule = rules
      .replace(hueRegex, function(match, _, colorType, hueType, opacity) {
        return rgba(palette[hueValue][hueType === 'color' ? 'value' : 'contrast'], opacity);
      });
    if (hueName !== 'default') {
      newRule = newRule.replace(themeNameRegex, '.md-' + theme.name + '-theme.md-' + hueName);
    }

    // Don't apply a selector rule to the default theme, making it easier to override
    // styles of the base-component
    if (theme.name == 'default') {
      var themeRuleRegex = /((?:(?:(?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)+) )?)((?:(?:\w|\.|-)+)?)\.md-default-theme((?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)/g;
      newRule = newRule.replace(themeRuleRegex, function(match, prefix, target, suffix) {
        return match + ', ' + prefix + target + suffix;
      });
    }
    generatedRules.push(newRule);
  });

  return generatedRules;
}

// Generate our themes at run time given the state of THEMES and PALETTES
function generateThemes($injector) {

  var head = document.getElementsByTagName('head')[0];
  var firstChild = head ? head.firstElementChild : null;
  var themeCss = $injector.has('$MD_THEME_CSS') ? $injector.get('$MD_THEME_CSS') : '';

  if ( !firstChild ) return;
  if (themeCss.length === 0) return; // no rules, so no point in running this expensive task

  // Expose contrast colors for palettes to ensure that text is always readable
  angular.forEach(PALETTES, sanitizePalette);

  // MD_THEME_CSS is a string generated by the build process that includes all the themable
  // components as templates

  // Break the CSS into individual rules
  var rulesByType = {};
  var rules = themeCss
                  .split(/\}(?!(\}|'|"|;))/)
                  .filter(function(rule) { return rule && rule.length; })
                  .map(function(rule) { return rule.trim() + '}'; });


  var ruleMatchRegex = new RegExp('md-(' + THEME_COLOR_TYPES.join('|') + ')', 'g');

  THEME_COLOR_TYPES.forEach(function(type) {
    rulesByType[type] = '';
  });


  // Sort the rules based on type, allowing us to do color substitution on a per-type basis
  rules.forEach(function(rule) {
    var match = rule.match(ruleMatchRegex);
    // First: test that if the rule has '.md-accent', it goes into the accent set of rules
    for (var i = 0, type; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf('.md-' + type) > -1) {
        return rulesByType[type] += rule;
      }
    }

    // If no eg 'md-accent' class is found, try to just find 'accent' in the rule and guess from
    // there
    for (i = 0; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf(type) > -1) {
        return rulesByType[type] += rule;
      }
    }

    // Default to the primary array
    return rulesByType[DEFAULT_COLOR_TYPE] += rule;
  });

    // For each theme, use the color palettes specified for
    // `primary`, `warn` and `accent` to generate CSS rules.

    angular.forEach(THEMES, function(theme) {
      if ( !GENERATED[theme.name] ) {


        THEME_COLOR_TYPES.forEach(function(colorType) {
          var styleStrings = parseRules(theme, colorType, rulesByType[colorType]);
          while (styleStrings.length) {
            var style = document.createElement('style');
                style.setAttribute('type', 'text/css');
            style.appendChild(document.createTextNode(styleStrings.shift()));
            head.insertBefore(style, firstChild);
          }
        });


        if (theme.colors.primary.name == theme.colors.accent.name) {
          console.warn("$mdThemingProvider: Using the same palette for primary and" +
                       " accent. This violates the material design spec.");
        }

        GENERATED[theme.name] = true;
      }
    });


  // *************************
  // Internal functions
  // *************************

  // The user specifies a 'default' contrast color as either light or dark,
  // then explicitly lists which hues are the opposite contrast (eg. A100 has dark, A200 has light)
  function sanitizePalette(palette) {
    var defaultContrast = palette.contrastDefaultColor;
    var lightColors = palette.contrastLightColors || [];
    var strongLightColors = palette.contrastStrongLightColors || [];
    var darkColors = palette.contrastDarkColors || [];

    // These colors are provided as space-separated lists
    if (typeof lightColors === 'string') lightColors = lightColors.split(' ');
    if (typeof strongLightColors === 'string') strongLightColors = strongLightColors.split(' ');
    if (typeof darkColors === 'string') darkColors = darkColors.split(' ');

    // Cleanup after ourselves
    delete palette.contrastDefaultColor;
    delete palette.contrastLightColors;
    delete palette.contrastStrongLightColors;
    delete palette.contrastDarkColors;

    // Change { 'A100': '#fffeee' } to { 'A100': { value: '#fffeee', contrast:DARK_CONTRAST_COLOR }
    angular.forEach(palette, function(hueValue, hueName) {
      if (angular.isObject(hueValue)) return; // Already converted
      // Map everything to rgb colors
      var rgbValue = colorToRgbaArray(hueValue);
      if (!rgbValue) {
        throw new Error("Color %1, in palette %2's hue %3, is invalid. Hex or rgb(a) color expected."
                        .replace('%1', hueValue)
                        .replace('%2', palette.name)
                        .replace('%3', hueName));
      }

      palette[hueName] = {
        value: rgbValue,
        contrast: getContrastColor()
      };
      function getContrastColor() {
        if (defaultContrast === 'light') {
          if (darkColors.indexOf(hueName) > -1) {
            return DARK_CONTRAST_COLOR;
          } else {
            return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR
              : LIGHT_CONTRAST_COLOR;
          }
        } else {
          if (lightColors.indexOf(hueName) > -1) {
            return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR
              : LIGHT_CONTRAST_COLOR;
          } else {
            return DARK_CONTRAST_COLOR;
          }
        }
      }
    });
  }


}
generateThemes.$inject = ["$injector"];

function checkValidPalette(theme, colorType) {
  // If theme attempts to use a palette that doesnt exist, throw error
  if (!PALETTES[ (theme.colors[colorType] || {}).name ]) {
    throw new Error(
      "You supplied an invalid color palette for theme %1's %2 palette. Available palettes: %3"
                    .replace('%1', theme.name)
                    .replace('%2', colorType)
                    .replace('%3', Object.keys(PALETTES).join(', '))
    );
  }
}

function colorToRgbaArray(clr) {
  if (angular.isArray(clr) && clr.length == 3) return clr;
  if (/^rgb/.test(clr)) {
    return clr.replace(/(^\s*rgba?\(|\)\s*$)/g, '').split(',').map(function(value, i) {
      return i == 3 ? parseFloat(value, 10) : parseInt(value, 10);
    });
  }
  if (clr.charAt(0) == '#') clr = clr.substring(1);
  if (!/^([a-fA-F0-9]{3}){1,2}$/g.test(clr)) return;

  var dig = clr.length / 3;
  var red = clr.substr(0, dig);
  var grn = clr.substr(dig, dig);
  var blu = clr.substr(dig * 2);
  if (dig === 1) {
    red += red;
    grn += grn;
    blu += blu;
  }
  return [parseInt(red, 16), parseInt(grn, 16), parseInt(blu, 16)];
}

function rgba(rgbArray, opacity) {
  if ( !rgbArray ) return "rgb('0,0,0')";

  if (rgbArray.length == 4) {
    rgbArray = angular.copy(rgbArray);
    opacity ? rgbArray.pop() : opacity = rgbArray.pop();
  }
  return opacity && (typeof opacity == 'number' || (typeof opacity == 'string' && opacity.length)) ?
    'rgba(' + rgbArray.join(',') + ',' + opacity + ')' :
    'rgb(' + rgbArray.join(',') + ')';
}


})();
(function(){
"use strict";

// Polyfill angular < 1.4 (provide $animateCss)
angular
  .module('material.core')
  .factory('$$mdAnimate', ["$q", "$timeout", "$mdConstant", "$animateCss", function($q, $timeout, $mdConstant, $animateCss){

     // Since $$mdAnimate is injected into $mdUtil... use a wrapper function
     // to subsequently inject $mdUtil as an argument to the AnimateDomUtils

     return function($mdUtil) {
       return AnimateDomUtils( $mdUtil, $q, $timeout, $mdConstant, $animateCss);
     };
   }]);

/**
 * Factory function that requires special injections
 */
function AnimateDomUtils($mdUtil, $q, $timeout, $mdConstant, $animateCss) {
  var self;
  return self = {
    /**
     *
     */
    translate3d : function( target, from, to, options ) {
      return $animateCss(target,{
        from:from,
        to:to,
        addClass:options.transitionInClass
      })
      .start()
      .then(function(){
          // Resolve with reverser function...
          return reverseTranslate;
      });

      /**
       * Specific reversal of the request translate animation above...
       */
      function reverseTranslate (newFrom) {
        return $animateCss(target, {
           to: newFrom || from,
           addClass: options.transitionOutClass,
           removeClass: options.transitionInClass
        }).start();

      }
  },

    /**
     * Listen for transitionEnd event (with optional timeout)
     * Announce completion or failure via promise handlers
     */
    waitTransitionEnd: function (element, opts) {
        var TIMEOUT = 3000; // fallback is 3 secs

        return $q(function(resolve, reject){
          opts = opts || { };

          var timer = $timeout(finished, opts.timeout || TIMEOUT);
          element.on($mdConstant.CSS.TRANSITIONEND, finished);

          /**
           * Upon timeout or transitionEnd, reject or resolve (respectively) this promise.
           * NOTE: Make sure this transitionEnd didn't bubble up from a child
           */
          function finished(ev) {
            if ( ev && ev.target !== element[0]) return;

            if ( ev  ) $timeout.cancel(timer);
            element.off($mdConstant.CSS.TRANSITIONEND, finished);

            // Never reject since ngAnimate may cause timeouts due missed transitionEnd events
            resolve();

          }

        });
      },

    /**
     * Calculate the zoom transform from dialog to origin.
     *
     * We use this to set the dialog position immediately;
     * then the md-transition-in actually translates back to
     * `translate3d(0,0,0) scale(1.0)`...
     *
     * NOTE: all values are rounded to the nearest integer
     */
    calculateZoomToOrigin: function (element, originator) {
      var origin = originator.element;
      var bounds = originator.bounds;
      var zoomTemplate = "translate3d( {centerX}px, {centerY}px, 0 ) scale( {scaleX}, {scaleY} )";
      var buildZoom = angular.bind(null, $mdUtil.supplant, zoomTemplate);
      var zoomStyle = buildZoom({centerX: 0, centerY: 0, scaleX: 0.5, scaleY: 0.5});

      if (origin || bounds) {
        var originBnds = origin ? self.clientRect(origin) : self.copyRect(bounds);
        var dialogRect = self.copyRect(element[0].getBoundingClientRect());
        var dialogCenterPt = self.centerPointFor(dialogRect);
        var originCenterPt = self.centerPointFor(originBnds);

        // Build the transform to zoom from the dialog center to the origin center

        zoomStyle = buildZoom({
          centerX: originCenterPt.x - dialogCenterPt.x,
          centerY: originCenterPt.y - dialogCenterPt.y,
          scaleX: Math.round(100 * Math.min(0.5, originBnds.width / dialogRect.width))/100,
          scaleY: Math.round(100 * Math.min(0.5, originBnds.height / dialogRect.height))/100
        });
      }

      return zoomStyle;
    },

    /**
     * Enhance raw values to represent valid css stylings...
     */
    toCss : function( raw ) {
      var css = { };
      var lookups = 'left top right bottom width height x y min-width min-height max-width max-height';

      angular.forEach(raw, function(value,key) {
        if ( angular.isUndefined(value) ) return;

        if ( lookups.indexOf(key) >= 0 ) {
          css[key] = value + 'px';
        } else {
          switch (key) {
            case 'transition':
              convertToVendor(key, $mdConstant.CSS.TRANSITION, value);
              break;
            case 'transform':
              convertToVendor(key, $mdConstant.CSS.TRANSFORM, value);
              break;
            case 'transformOrigin':
              convertToVendor(key, $mdConstant.CSS.TRANSFORM_ORIGIN, value);
              break;
          }
        }
      });

      return css;

      function convertToVendor(key, vendor, value) {
        angular.forEach(vendor.split(' '), function (key) {
          css[key] = value;
        });
      }
    },

    /**
     * Convert the translate CSS value to key/value pair(s).
     */
    toTransformCss: function (transform, addTransition, transition) {
      var css = {};
      angular.forEach($mdConstant.CSS.TRANSFORM.split(' '), function (key) {
        css[key] = transform;
      });

      if (addTransition) {
        transition = transition || "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important";
        css['transition'] = transition;
      }

      return css;
    },

    /**
     *  Clone the Rect and calculate the height/width if needed
     */
    copyRect: function (source, destination) {
      if (!source) return null;

      destination = destination || {};

      angular.forEach('left top right bottom width height'.split(' '), function (key) {
        destination[key] = Math.round(source[key])
      });

      destination.width = destination.width || (destination.right - destination.left);
      destination.height = destination.height || (destination.bottom - destination.top);

      return destination;
    },

    /**
     * Calculate ClientRect of element; return null if hidden or zero size
     */
    clientRect: function (element) {
      var bounds = angular.element(element)[0].getBoundingClientRect();
      var isPositiveSizeClientRect = function (rect) {
        return rect && (rect.width > 0) && (rect.height > 0);
      };

      // If the event origin element has zero size, it has probably been hidden.
      return isPositiveSizeClientRect(bounds) ? self.copyRect(bounds) : null;
    },

    /**
     *  Calculate 'rounded' center point of Rect
     */
    centerPointFor: function (targetRect) {
      return {
        x: Math.round(targetRect.left + (targetRect.width / 2)),
        y: Math.round(targetRect.top + (targetRect.height / 2))
      }
    }

  };
};


})();
(function(){
"use strict";

"use strict";

if (angular.version.minor >= 4) {
  angular.module('material.core.animate', []);
} else {
(function() {

  var forEach = angular.forEach;

  var WEBKIT = angular.isDefined(document.documentElement.style.WebkitAppearance);
  var TRANSITION_PROP = WEBKIT ? 'WebkitTransition' : 'transition';
  var ANIMATION_PROP = WEBKIT ? 'WebkitAnimation' : 'animation';
  var PREFIX = WEBKIT ? '-webkit-' : '';

  var TRANSITION_EVENTS = (WEBKIT ? 'webkitTransitionEnd ' : '') + 'transitionend';
  var ANIMATION_EVENTS = (WEBKIT ? 'webkitAnimationEnd ' : '') + 'animationend';

  var $$ForceReflowFactory = ['$document', function($document) {
    return function() {
      return $document[0].body.clientWidth + 1;
    }
  }];

  var $$rAFMutexFactory = ['$$rAF', function($$rAF) {
    return function() {
      var passed = false;
      $$rAF(function() {
        passed = true;
      });
      return function(fn) {
        passed ? fn() : $$rAF(fn);
      };
    };
  }];

  var $$AnimateRunnerFactory = ['$q', '$$rAFMutex', function($q, $$rAFMutex) {
    var INITIAL_STATE = 0;
    var DONE_PENDING_STATE = 1;
    var DONE_COMPLETE_STATE = 2;

    function AnimateRunner(host) {
      this.setHost(host);

      this._doneCallbacks = [];
      this._runInAnimationFrame = $$rAFMutex();
      this._state = 0;
    }

    AnimateRunner.prototype = {
      setHost: function(host) {
        this.host = host || {};
      },

      done: function(fn) {
        if (this._state === DONE_COMPLETE_STATE) {
          fn();
        } else {
          this._doneCallbacks.push(fn);
        }
      },

      progress: angular.noop,

      getPromise: function() {
        if (!this.promise) {
          var self = this;
          this.promise = $q(function(resolve, reject) {
            self.done(function(status) {
              status === false ? reject() : resolve();
            });
          });
        }
        return this.promise;
      },

      then: function(resolveHandler, rejectHandler) {
        return this.getPromise().then(resolveHandler, rejectHandler);
      },

      'catch': function(handler) {
        return this.getPromise()['catch'](handler);
      },

      'finally': function(handler) {
        return this.getPromise()['finally'](handler);
      },

      pause: function() {
        if (this.host.pause) {
          this.host.pause();
        }
      },

      resume: function() {
        if (this.host.resume) {
          this.host.resume();
        }
      },

      end: function() {
        if (this.host.end) {
          this.host.end();
        }
        this._resolve(true);
      },

      cancel: function() {
        if (this.host.cancel) {
          this.host.cancel();
        }
        this._resolve(false);
      },

      complete: function(response) {
        var self = this;
        if (self._state === INITIAL_STATE) {
          self._state = DONE_PENDING_STATE;
          self._runInAnimationFrame(function() {
            self._resolve(response);
          });
        }
      },

      _resolve: function(response) {
        if (this._state !== DONE_COMPLETE_STATE) {
          forEach(this._doneCallbacks, function(fn) {
            fn(response);
          });
          this._doneCallbacks.length = 0;
          this._state = DONE_COMPLETE_STATE;
        }
      }
    };

    return AnimateRunner;
  }];

  angular
    .module('material.core.animate', [])
    .factory('$$forceReflow', $$ForceReflowFactory)
    .factory('$$AnimateRunner', $$AnimateRunnerFactory)
    .factory('$$rAFMutex', $$rAFMutexFactory)
    .factory('$animateCss', ['$window', '$$rAF', '$$AnimateRunner', '$$forceReflow', '$$jqLite', '$timeout',
                     function($window,   $$rAF,   $$AnimateRunner,   $$forceReflow,   $$jqLite,   $timeout) {

      function init(element, options) {

        var temporaryStyles = [];
        var node = getDomNode(element);

        if (options.transitionStyle) {
          temporaryStyles.push([PREFIX + 'transition', options.transitionStyle]);
        }

        if (options.keyframeStyle) {
          temporaryStyles.push([PREFIX + 'animation', options.keyframeStyle]);
        }

        if (options.delay) {
          temporaryStyles.push([PREFIX + 'transition-delay', options.delay + 's']);
        }

        if (options.duration) {
          temporaryStyles.push([PREFIX + 'transition-duration', options.duration + 's']);
        }

        var hasCompleteStyles = options.keyframeStyle ||
                                (options.to && (options.duration > 0 || options.transitionStyle));
        var hasCompleteClasses = !!options.addClass || !!options.removeClass;
        var hasCompleteAnimation = hasCompleteStyles || hasCompleteClasses;

        blockTransition(element, true);
        applyAnimationFromStyles(element, options);

        var animationClosed = false;
        var events, eventFn;

        return {
          close: $window.close,
          start: function() {
            var runner = new $$AnimateRunner();
            waitUntilQuiet(function() {
              blockTransition(element, false);
              if (!hasCompleteAnimation) {
                return close();
              }

              forEach(temporaryStyles, function(entry) {
                var key = entry[0];
                var value = entry[1];
                node.style[camelCase(key)] = value;
              });

              applyClasses(element, options);

              var timings = computeTimings(element);
              if (timings.duration === 0) {
                return close();
              }

              var moreStyles = [];

              if (options.easing) {
                if (timings.transitionDuration) {
                  moreStyles.push([PREFIX + 'transition-timing-function', options.easing]);
                }
                if (timings.animationDuration) {
                  moreStyles.push([PREFIX + 'animation-timing-function', options.easing]);
                }
              }

              if (options.delay && timings.animationDelay) {
                moreStyles.push([PREFIX + 'animation-delay', options.delay + 's']);
              }

              if (options.duration && timings.animationDuration) {
                moreStyles.push([PREFIX + 'animation-duration', options.duration + 's']);
              }

              forEach(moreStyles, function(entry) {
                var key = entry[0];
                var value = entry[1];
                node.style[camelCase(key)] = value;
                temporaryStyles.push(entry);
              });

              var maxDelay = timings.delay;
              var maxDelayTime = maxDelay * 1000;
              var maxDuration = timings.duration;
              var maxDurationTime = maxDuration * 1000;
              var startTime = Date.now();

              events = [];
              if (timings.transitionDuration) {
                events.push(TRANSITION_EVENTS);
              }
              if (timings.animationDuration) {
                events.push(ANIMATION_EVENTS);
              }
              events = events.join(' ');
              eventFn = function(event) {
                event.stopPropagation();
                var ev = event.originalEvent || event;
                var timeStamp = ev.timeStamp || Date.now();
                var elapsedTime = parseFloat(ev.elapsedTime.toFixed(3));
                if (Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration) {
                  close();
                }
              };
              element.on(events, eventFn);

              applyAnimationToStyles(element, options);

              $timeout(close, maxDelayTime + maxDurationTime * 1.5, false);
            });

            return runner;

            function close() {
              if (animationClosed) return;
              animationClosed = true;

              if (events && eventFn) {
                element.off(events, eventFn);
              }
              applyClasses(element, options);
              applyAnimationStyles(element, options);
              forEach(temporaryStyles, function(entry) {
                node.style[camelCase(entry[0])] = '';
              });
              runner.complete(true);
              return runner;
            }
          }
        }
      }

      function applyClasses(element, options) {
        if (options.addClass) {
          $$jqLite.addClass(element, options.addClass);
          options.addClass = null;
        }
        if (options.removeClass) {
          $$jqLite.removeClass(element, options.removeClass);
          options.removeClass = null;
        }
      }

      function computeTimings(element) {
        var node = getDomNode(element);
        var cs = $window.getComputedStyle(node)
        var tdr = parseMaxTime(cs[prop('transitionDuration')]);
        var adr = parseMaxTime(cs[prop('animationDuration')]);
        var tdy = parseMaxTime(cs[prop('transitionDelay')]);
        var ady = parseMaxTime(cs[prop('animationDelay')]);

        adr *= (parseInt(cs[prop('animationIterationCount')], 10) || 1);
        var duration = Math.max(adr, tdr);
        var delay = Math.max(ady, tdy);

        return {
          duration: duration,
          delay: delay,
          animationDuration: adr,
          transitionDuration: tdr,
          animationDelay: ady,
          transitionDelay: tdy
        };

        function prop(key) {
          return WEBKIT ? 'Webkit' + key.charAt(0).toUpperCase() + key.substr(1)
                        : key;
        }
      }

      function parseMaxTime(str) {
        var maxValue = 0;
        var values = (str || "").split(/\s*,\s*/);
        forEach(values, function(value) {
          // it's always safe to consider only second values and omit `ms` values since
          // getComputedStyle will always handle the conversion for us
          if (value.charAt(value.length - 1) == 's') {
            value = value.substring(0, value.length - 1);
          }
          value = parseFloat(value) || 0;
          maxValue = maxValue ? Math.max(value, maxValue) : value;
        });
        return maxValue;
      }

      var cancelLastRAFRequest;
      var rafWaitQueue = [];
      function waitUntilQuiet(callback) {
        if (cancelLastRAFRequest) {
          cancelLastRAFRequest(); //cancels the request
        }
        rafWaitQueue.push(callback);
        cancelLastRAFRequest = $$rAF(function() {
          cancelLastRAFRequest = null;

          // DO NOT REMOVE THIS LINE OR REFACTOR OUT THE `pageWidth` variable.
          // PLEASE EXAMINE THE `$$forceReflow` service to understand why.
          var pageWidth = $$forceReflow();

          // we use a for loop to ensure that if the queue is changed
          // during this looping then it will consider new requests
          for (var i = 0; i < rafWaitQueue.length; i++) {
            rafWaitQueue[i](pageWidth);
          }
          rafWaitQueue.length = 0;
        });
      }

      function applyAnimationStyles(element, options) {
        applyAnimationFromStyles(element, options);
        applyAnimationToStyles(element, options);
      }

      function applyAnimationFromStyles(element, options) {
        if (options.from) {
          element.css(options.from);
          options.from = null;
        }
      }

      function applyAnimationToStyles(element, options) {
        if (options.to) {
          element.css(options.to);
          options.to = null;
        }
      }

      function getDomNode(element) {
        for (var i = 0; i < element.length; i++) {
          if (element[i].nodeType === 1) return element[i];
        }
      }

      function blockTransition(element, bool) {
        var node = getDomNode(element);
        var key = camelCase(PREFIX + 'transition-delay');
        node.style[key] = bool ? '-9999s' : '';
      }

      return init;
    }]);

  /**
   * Older browsers [FF31] expect camelCase
   * property keys.
   * e.g.
   *  animation-duration --> animationDuration
   */
  function camelCase(str) {
    return str.replace(/-[a-z]/g, function(str) {
      return str.charAt(1).toUpperCase();
    });
  }

})();

}

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.autocomplete
 */
/*
 * @see js folder for autocomplete implementation
 */
angular.module('material.components.autocomplete', [
  'material.core',
  'material.components.icon',
  'material.components.virtualRepeat'
]);

})();
(function(){
"use strict";

/*
 * @ngdoc module
 * @name material.components.backdrop
 * @description Backdrop
 */

/**
 * @ngdoc directive
 * @name mdBackdrop
 * @module material.components.backdrop
 *
 * @restrict E
 *
 * @description
 * `<md-backdrop>` is a backdrop element used by other components, such as dialog and bottom sheet.
 * Apply class `opaque` to make the backdrop use the theme backdrop color.
 *
 */

angular
  .module('material.components.backdrop', ['material.core'])
  .directive('mdBackdrop', ["$mdTheming", "$animate", "$rootElement", "$window", "$log", "$$rAF", "$document", function BackdropDirective($mdTheming, $animate, $rootElement, $window, $log, $$rAF, $document) {
    var ERROR_CSS_POSITION = "<md-backdrop> may not work properly in a scrolled, static-positioned parent container.";

    return {
      restrict: 'E',
      link: postLink
    };

    function postLink(scope, element, attrs) {

      // If body scrolling has been disabled using mdUtil.disableBodyScroll(),
      // adjust the 'backdrop' height to account for the fixed 'body' top offset
      var body = $window.getComputedStyle($document[0].body);
      if (body.position == 'fixed') {
        var hViewport = parseInt(body.height, 10) + Math.abs(parseInt(body.top, 10));
        element.css({
          height: hViewport + 'px'
        });
      }

      // backdrop may be outside the $rootElement, tell ngAnimate to animate regardless
      if ($animate.pin) $animate.pin(element, $rootElement);

      $$rAF(function () {

        // Often $animate.enter() is used to append the backDrop element
        // so let's wait until $animate is done...
        var parent = element.parent()[0];
        if (parent) {
          var styles = $window.getComputedStyle(parent);
          if (styles.position == 'static') {
            // backdrop uses position:absolute and will not work properly with parent position:static (default)
            $log.warn(ERROR_CSS_POSITION);
          }
        }

        $mdTheming.inherit(element, element.parent());
      });

    }

  }]);

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.bottomSheet
 * @description
 * BottomSheet
 */
angular
  .module('material.components.bottomSheet', [
    'material.core',
    'material.components.backdrop'
  ])
  .directive('mdBottomSheet', MdBottomSheetDirective)
  .provider('$mdBottomSheet', MdBottomSheetProvider);

/* @ngInject */
function MdBottomSheetDirective($mdBottomSheet) {
  return {
    restrict: 'E',
    link : function postLink(scope, element, attr) {
      // When navigation force destroys an interimElement, then
      // listen and $destroy() that interim instance...
      scope.$on('$destroy', function() {
        $mdBottomSheet.destroy();
      });
    }
  };
}
MdBottomSheetDirective.$inject = ["$mdBottomSheet"];


/**
 * @ngdoc service
 * @name $mdBottomSheet
 * @module material.components.bottomSheet
 *
 * @description
 * `$mdBottomSheet` opens a bottom sheet over the app and provides a simple promise API.
 *
 * ## Restrictions
 *
 * - The bottom sheet's template must have an outer `<md-bottom-sheet>` element.
 * - Add the `md-grid` class to the bottom sheet for a grid layout.
 * - Add the `md-list` class to the bottom sheet for a list layout.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <md-button ng-click="openBottomSheet()">
 *     Open a Bottom Sheet!
 *   </md-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $mdBottomSheet) {
 *   $scope.openBottomSheet = function() {
 *     $mdBottomSheet.show({
 *       template: '<md-bottom-sheet>Hello!</md-bottom-sheet>'
 *     });
 *   };
 * });
 * </hljs>
 */

 /**
 * @ngdoc method
 * @name $mdBottomSheet#show
 *
 * @description
 * Show a bottom sheet with the specified options.
 *
 * @param {object} options An options object, with the following properties:
 *
 *   - `templateUrl` - `{string=}`: The url of an html template file that will
 *   be used as the content of the bottom sheet. Restrictions: the template must
 *   have an outer `md-bottom-sheet` element.
 *   - `template` - `{string=}`: Same as templateUrl, except this is an actual
 *   template string.
 *   - `scope` - `{object=}`: the scope to link the template / controller to. If none is specified, it will create a new child scope.
 *     This scope will be destroyed when the bottom sheet is removed unless `preserveScope` is set to true.
 *   - `preserveScope` - `{boolean=}`: whether to preserve the scope when the element is removed. Default is false
 *   - `controller` - `{string=}`: The controller to associate with this bottom sheet.
 *   - `locals` - `{string=}`: An object containing key/value pairs. The keys will
 *   be used as names of values to inject into the controller. For example,
 *   `locals: {three: 3}` would inject `three` into the controller with the value
 *   of 3.
 *   - `clickOutsideToClose` - `{boolean=}`: Whether the user can click outside the bottom sheet to
 *     close it. Default true.
 *   - `escapeToClose` - `{boolean=}`: Whether the user can press escape to close the bottom sheet.
 *     Default true.
 *   - `resolve` - `{object=}`: Similar to locals, except it takes promises as values
 *   and the bottom sheet will not open until the promises resolve.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the scope.
 *   - `parent` - `{element=}`: The element to append the bottom sheet to. The `parent` may be a `function`, `string`,
 *   `object`, or null. Defaults to appending to the body of the root element (or the root element) of the application.
 *   e.g. angular.element(document.getElementById('content')) or "#content"
 *   - `disableParentScroll` - `{boolean=}`: Whether to disable scrolling while the bottom sheet is open.
 *     Default true.
 *
 * @returns {promise} A promise that can be resolved with `$mdBottomSheet.hide()` or
 * rejected with `$mdBottomSheet.cancel()`.
 */

/**
 * @ngdoc method
 * @name $mdBottomSheet#hide
 *
 * @description
 * Hide the existing bottom sheet and resolve the promise returned from
 * `$mdBottomSheet.show()`. This call will close the most recently opened/current bottomsheet (if any).
 *
 * @param {*=} response An argument for the resolved promise.
 *
 */

/**
 * @ngdoc method
 * @name $mdBottomSheet#cancel
 *
 * @description
 * Hide the existing bottom sheet and reject the promise returned from
 * `$mdBottomSheet.show()`.
 *
 * @param {*=} response An argument for the rejected promise.
 *
 */

function MdBottomSheetProvider($$interimElementProvider) {
  // how fast we need to flick down to close the sheet, pixels/ms
  var CLOSING_VELOCITY = 0.5;
  var PADDING = 80; // same as css

  bottomSheetDefaults.$inject = ["$animate", "$mdConstant", "$mdUtil", "$mdTheming", "$mdBottomSheet", "$rootElement", "$mdGesture"];
  return $$interimElementProvider('$mdBottomSheet')
    .setDefaults({
      methods: ['disableParentScroll', 'escapeToClose', 'clickOutsideToClose'],
      options: bottomSheetDefaults
    });

  /* @ngInject */
  function bottomSheetDefaults($animate, $mdConstant, $mdUtil, $mdTheming, $mdBottomSheet, $rootElement, $mdGesture) {
    var backdrop;

    return {
      themable: true,
      onShow: onShow,
      onRemove: onRemove,
      escapeToClose: true,
      clickOutsideToClose: true,
      disableParentScroll: true
    };


    function onShow(scope, element, options, controller) {

      element = $mdUtil.extractElementByName(element, 'md-bottom-sheet');

      // Add a backdrop that will close on click
      backdrop = $mdUtil.createBackdrop(scope, "md-bottom-sheet-backdrop md-opaque");

      if (options.clickOutsideToClose) {
        backdrop.on('click', function() {
          $mdUtil.nextTick($mdBottomSheet.cancel,true);
        });
      }

      $mdTheming.inherit(backdrop, options.parent);

      $animate.enter(backdrop, options.parent, null);

      var bottomSheet = new BottomSheet(element, options.parent);
      options.bottomSheet = bottomSheet;

      $mdTheming.inherit(bottomSheet.element, options.parent);

      if (options.disableParentScroll) {
        options.restoreScroll = $mdUtil.disableScrollAround(bottomSheet.element, options.parent);
      }

      return $animate.enter(bottomSheet.element, options.parent)
        .then(function() {
          var focusable = $mdUtil.findFocusTarget(element) || angular.element(
            element[0].querySelector('button') ||
            element[0].querySelector('a') ||
            element[0].querySelector('[ng-click]')
          );
          focusable.focus();

          if (options.escapeToClose) {
            options.rootElementKeyupCallback = function(e) {
              if (e.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
                $mdUtil.nextTick($mdBottomSheet.cancel,true);
              }
            };
            $rootElement.on('keyup', options.rootElementKeyupCallback);
          }
        });

    }

    function onRemove(scope, element, options) {

      var bottomSheet = options.bottomSheet;

      $animate.leave(backdrop);
      return $animate.leave(bottomSheet.element).then(function() {
        if (options.disableParentScroll) {
          options.restoreScroll();
          delete options.restoreScroll;
        }

        bottomSheet.cleanup();
      });
    }

    /**
     * BottomSheet class to apply bottom-sheet behavior to an element
     */
    function BottomSheet(element, parent) {
      var deregister = $mdGesture.register(parent, 'drag', { horizontal: false });
      parent.on('$md.dragstart', onDragStart)
        .on('$md.drag', onDrag)
        .on('$md.dragend', onDragEnd);

      return {
        element: element,
        cleanup: function cleanup() {
          deregister();
          parent.off('$md.dragstart', onDragStart);
          parent.off('$md.drag', onDrag);
          parent.off('$md.dragend', onDragEnd);
        }
      };

      function onDragStart(ev) {
        // Disable transitions on transform so that it feels fast
        element.css($mdConstant.CSS.TRANSITION_DURATION, '0ms');
      }

      function onDrag(ev) {
        var transform = ev.pointer.distanceY;
        if (transform < 5) {
          // Slow down drag when trying to drag up, and stop after PADDING
          transform = Math.max(-PADDING, transform / 2);
        }
        element.css($mdConstant.CSS.TRANSFORM, 'translate3d(0,' + (PADDING + transform) + 'px,0)');
      }

      function onDragEnd(ev) {
        if (ev.pointer.distanceY > 0 &&
            (ev.pointer.distanceY > 20 || Math.abs(ev.pointer.velocityY) > CLOSING_VELOCITY)) {
          var distanceRemaining = element.prop('offsetHeight') - ev.pointer.distanceY;
          var transitionDuration = Math.min(distanceRemaining / ev.pointer.velocityY * 0.75, 500);
          element.css($mdConstant.CSS.TRANSITION_DURATION, transitionDuration + 'ms');
          $mdUtil.nextTick($mdBottomSheet.cancel,true);
        } else {
          element.css($mdConstant.CSS.TRANSITION_DURATION, '');
          element.css($mdConstant.CSS.TRANSFORM, '');
        }
      }
    }

  }

}
MdBottomSheetProvider.$inject = ["$$interimElementProvider"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.button
 * @description
 *
 * Button
 */
angular
    .module('material.components.button', [ 'material.core' ])
    .directive('mdButton', MdButtonDirective);

/**
 * @ngdoc directive
 * @name mdButton
 * @module material.components.button
 *
 * @restrict E
 *
 * @description
 * `<md-button>` is a button directive with optional ink ripples (default enabled).
 *
 * If you supply a `href` or `ng-href` attribute, it will become an `<a>` element. Otherwise, it will
 * become a `<button>` element. As per the [Material Design specifications](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
 * the FAB button background is filled with the accent color [by default]. The primary color palette may be used with
 * the `md-primary` class.
 *
 * @param {boolean=} md-no-ink If present, disable ripple ink effects.
 * @param {expression=} ng-disabled En/Disable based on the expression
 * @param {string=} md-ripple-size Overrides the default ripple size logic. Options: `full`, `partial`, `auto`
 * @param {string=} aria-label Adds alternative text to button for accessibility, useful for icon buttons.
 * If no default text is found, a warning will be logged.
 *
 * @usage
 *
 * Regular buttons:
 *
 * <hljs lang="html">
 *  <md-button> Flat Button </md-button>
 *  <md-button href="http://google.com"> Flat link </md-button>
 *  <md-button class="md-raised"> Raised Button </md-button>
 *  <md-button ng-disabled="true"> Disabled Button </md-button>
 *  <md-button>
 *    <md-icon md-svg-src="your/icon.svg"></md-icon>
 *    Register Now
 *  </md-button>
 * </hljs>
 *
 * FAB buttons:
 *
 * <hljs lang="html">
 *  <md-button class="md-fab" aria-label="FAB">
 *    <md-icon md-svg-src="your/icon.svg"></md-icon>
 *  </md-button>
 *  <!-- mini-FAB -->
 *  <md-button class="md-fab md-mini" aria-label="Mini FAB">
 *    <md-icon md-svg-src="your/icon.svg"></md-icon>
 *  </md-button>
 *  <!-- Button with SVG Icon -->
 *  <md-button class="md-icon-button" aria-label="Custom Icon Button">
 *    <md-icon md-svg-icon="path/to/your.svg"></md-icon>
 *  </md-button>
 * </hljs>
 */
function MdButtonDirective($mdButtonInkRipple, $mdTheming, $mdAria, $timeout) {

  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    template: getTemplate,
    link: postLink
  };

  function isAnchor(attr) {
    return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink) || angular.isDefined(attr.uiSref);
  }

  function getTemplate(element, attr) {
    return isAnchor(attr) ?
           '<a class="md-button" ng-transclude></a>' :
           '<button class="md-button" ng-transclude></button>';
  }

  function postLink(scope, element, attr) {
    var node = element[0];
    $mdTheming(element);
    $mdButtonInkRipple.attach(scope, element);

    var elementHasText = node.textContent.trim();
    if (!elementHasText) {
      $mdAria.expect(element, 'aria-label');
    }

    // For anchor elements, we have to set tabindex manually when the
    // element is disabled
    if (isAnchor(attr) && angular.isDefined(attr.ngDisabled) ) {
      scope.$watch(attr.ngDisabled, function(isDisabled) {
        element.attr('tabindex', isDisabled ? -1 : 0);
      });
    }

    // disabling click event when disabled is true
    element.on('click', function(e){
      if (attr.disabled === true) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });

    // restrict focus styles to the keyboard
    scope.mouseActive = false;
    element.on('mousedown', function() {
        scope.mouseActive = true;
        $timeout(function(){
          scope.mouseActive = false;
        }, 100);
      })
      .on('focus', function() {
        if (scope.mouseActive === false) {
          element.addClass('md-focused');
        }
      })
      .on('blur', function(ev) {
        element.removeClass('md-focused');
      });
  }

}
MdButtonDirective.$inject = ["$mdButtonInkRipple", "$mdTheming", "$mdAria", "$timeout"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.card
 *
 * @description
 * Card components.
 */
angular.module('material.components.card', [
  'material.core'
])
  .directive('mdCard', mdCardDirective);



/**
 * @ngdoc directive
 * @name mdCard
 * @module material.components.card
 *
 * @restrict E
 *
 * @description
 * The `<md-card>` directive is a container element used within `<md-content>` containers.
 *
 * An image included as a direct descendant will fill the card's width, while the `<md-card-content>`
 * container will wrap text content and provide padding. An `<md-card-footer>` element can be
 * optionally included to put content flush against the bottom edge of the card.
 *
 * Action buttons can be included in an element with the `.md-actions` class, also used in `md-dialog`.
 * You can then position buttons using layout attributes.
 *
 * Cards have constant width and variable heights; where the maximum height is limited to what can
 * fit within a single view on a platform, but it can temporarily expand as needed.
 *
 * @usage
 * ### Card with optional footer
 * <hljs lang="html">
 * <md-card>
 *  <img src="card-image.png" class="md-card-image" alt="image caption">
 *  <md-card-content>
 *    <h2>Card headline</h2>
 *    <p>Card content</p>
 *  </md-card-content>
 *  <md-card-footer>
 *    Card footer
 *  </md-card-footer>
 * </md-card>
 * </hljs>
 *
 * ### Card with actions
 * <hljs lang="html">
 * <md-card>
 *  <img src="card-image.png" class="md-card-image" alt="image caption">
 *  <md-card-content>
 *    <h2>Card headline</h2>
 *    <p>Card content</p>
 *  </md-card-content>
 *  <div class="md-actions" layout="row" layout-align="end center">
 *    <md-button>Action 1</md-button>
 *    <md-button>Action 2</md-button>
 *  </div>
 * </md-card>
 * </hljs>
 *
 */
function mdCardDirective($mdTheming) {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
      $mdTheming($element);
    }
  };
}
mdCardDirective.$inject = ["$mdTheming"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */
angular
  .module('material.components.checkbox', ['material.core'])
  .directive('mdCheckbox', MdCheckboxDirective);

/**
 * @ngdoc directive
 * @name mdCheckbox
 * @module material.components.checkbox
 * @restrict E
 *
 * @description
 * The checkbox directive is used like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D).
 *
 * As per the [material design spec](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
 * the checkbox is in the accent color by default. The primary color palette may be used with
 * the `md-primary` class.
 *
 * @param {string} ng-model Assignable angular expression to data-bind to.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {expression=} ng-true-value The value to which the expression should be set when selected.
 * @param {expression=} ng-false-value The value to which the expression should be set when not selected.
 * @param {string=} ng-change Angular expression to be executed when input changes due to user interaction with the input element.
 * @param {boolean=} md-no-ink Use of attribute indicates use of ripple ink effects
 * @param {string=} aria-label Adds label to checkbox for accessibility.
 * Defaults to checkbox's text. If no default text is found, a warning will be logged.
 *
 * @usage
 * <hljs lang="html">
 * <md-checkbox ng-model="isChecked" aria-label="Finished?">
 *   Finished ?
 * </md-checkbox>
 *
 * <md-checkbox md-no-ink ng-model="hasInk" aria-label="No Ink Effects">
 *   No Ink Effects
 * </md-checkbox>
 *
 * <md-checkbox ng-disabled="true" ng-model="isDisabled" aria-label="Disabled">
 *   Disabled
 * </md-checkbox>
 *
 * </hljs>
 *
 */
function MdCheckboxDirective(inputDirective, $mdAria, $mdConstant, $mdTheming, $mdUtil, $timeout) {
  inputDirective = inputDirective[0];
  var CHECKED_CSS = 'md-checked';

  return {
    restrict: 'E',
    transclude: true,
    require: '?ngModel',
    priority: 210, // Run before ngAria
    template: 
      '<div class="md-container" md-ink-ripple md-ink-ripple-checkbox>' +
        '<div class="md-icon"></div>' +
      '</div>' +
      '<div ng-transclude class="md-label"></div>',
    compile: compile
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function compile (tElement, tAttrs) {

    tAttrs.type = 'checkbox';
    tAttrs.tabindex = tAttrs.tabindex || '0';
    tElement.attr('role', tAttrs.type);

    // Attach a click handler in compile in order to immediately stop propagation
    // (especially for ng-click) when the checkbox is disabled.
    tElement.on('click', function(event) {
      if (this.hasAttribute('disabled')) {
        event.stopImmediatePropagation();
      }
    });

    return function postLink(scope, element, attr, ngModelCtrl) {
      ngModelCtrl = ngModelCtrl || $mdUtil.fakeNgModel();
      $mdTheming(element);

      if (attr.ngChecked) {
        scope.$watch(
            scope.$eval.bind(scope, attr.ngChecked),
            ngModelCtrl.$setViewValue.bind(ngModelCtrl)
        );
      }

      $$watchExpr('ngDisabled', 'tabindex', {
        true: '-1',
        false: attr.tabindex
      });

      $mdAria.expectWithText(element, 'aria-label');

      // Reuse the original input[type=checkbox] directive from Angular core.
      // This is a bit hacky as we need our own event listener and own render
      // function.
      inputDirective.link.pre(scope, {
        on: angular.noop,
        0: {}
      }, attr, [ngModelCtrl]);

      scope.mouseActive = false;
      element.on('click', listener)
        .on('keypress', keypressHandler)
        .on('mousedown', function() {
          scope.mouseActive = true;
          $timeout(function() {
            scope.mouseActive = false;
          }, 100);
        })
        .on('focus', function() {
          if (scope.mouseActive === false) {
            element.addClass('md-focused');
          }
        })
        .on('blur', function() {
          element.removeClass('md-focused');
        });

      ngModelCtrl.$render = render;

      function $$watchExpr(expr, htmlAttr, valueOpts) {
        if (attr[expr]) {
          scope.$watch(attr[expr], function(val) {
            if (valueOpts[val]) {
              element.attr(htmlAttr, valueOpts[val]);
            }
          });
        }
      }

      function keypressHandler(ev) {
        var keyCode = ev.which || ev.keyCode;
        if (keyCode === $mdConstant.KEY_CODE.SPACE || keyCode === $mdConstant.KEY_CODE.ENTER) {
          ev.preventDefault();

          if (!element.hasClass('md-focused')) {
            element.addClass('md-focused');
          }

          listener(ev);
        }
      }
      function listener(ev) {
        if (element[0].hasAttribute('disabled')) {
          return;
        }

        scope.$apply(function() {
          // Toggle the checkbox value...
          var viewValue = attr.ngChecked ? attr.checked : !ngModelCtrl.$viewValue;

          ngModelCtrl.$setViewValue( viewValue, ev && ev.type);
          ngModelCtrl.$render();
        });
      }

      function render() {
        if(ngModelCtrl.$viewValue) {
          element.addClass(CHECKED_CSS);
        } else {
          element.removeClass(CHECKED_CSS);
        }
      }
    };
  }
}
MdCheckboxDirective.$inject = ["inputDirective", "$mdAria", "$mdConstant", "$mdTheming", "$mdUtil", "$timeout"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.chips
 */
/*
 * @see js folder for chips implementation
 */
angular.module('material.components.chips', [
  'material.core',
  'material.components.autocomplete'
]);

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.content
 *
 * @description
 * Scrollable content
 */
angular.module('material.components.content', [
  'material.core'
])
  .directive('mdContent', mdContentDirective);

/**
 * @ngdoc directive
 * @name mdContent
 * @module material.components.content
 *
 * @restrict E
 *
 * @description
 * The `<md-content>` directive is a container element useful for scrollable content
 *
 * @usage
 *
 * - Add the `[layout-padding]` attribute to make the content padded.
 *
 * <hljs lang="html">
 *  <md-content layout-padding>
 *      Lorem ipsum dolor sit amet, ne quod novum mei.
 *  </md-content>
 * </hljs>
 *
 */

function mdContentDirective($mdTheming) {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', ContentController],
    link: function(scope, element, attr) {
      var node = element[0];

      $mdTheming(element);
      scope.$broadcast('$mdContentLoaded', element);

      iosScrollFix(element[0]);
    }
  };

  function ContentController($scope, $element) {
    this.$scope = $scope;
    this.$element = $element;
  }
}
mdContentDirective.$inject = ["$mdTheming"];

function iosScrollFix(node) {
  // IOS FIX:
  // If we scroll where there is no more room for the webview to scroll,
  // by default the webview itself will scroll up and down, this looks really
  // bad.  So if we are scrolling to the very top or bottom, add/subtract one
  angular.element(node).on('$md.pressdown', function(ev) {
    // Only touch events
    if (ev.pointer.type !== 't') return;
    // Don't let a child content's touchstart ruin it for us.
    if (ev.$materialScrollFixed) return;
    ev.$materialScrollFixed = true;

    if (node.scrollTop === 0) {
      node.scrollTop = 1;
    } else if (node.scrollHeight === node.scrollTop + node.offsetHeight) {
      node.scrollTop -= 1;
    }
  });
}

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.datepicker
   * @description Datepicker
   */
  angular.module('material.components.datepicker', [
    'material.core',
    'material.components.icon',
    'material.components.virtualRepeat'
  ]).directive('mdCalendar', calendarDirective);


  // POST RELEASE
  // TODO(jelbourn): Mac Cmd + left / right == Home / End
  // TODO(jelbourn): Clicking on the month label opens the month-picker.
  // TODO(jelbourn): Minimum and maximum date
  // TODO(jelbourn): Refactor month element creation to use cloneNode (performance).
  // TODO(jelbourn): Define virtual scrolling constants (compactness) users can override.
  // TODO(jelbourn): Animated month transition on ng-model change (virtual-repeat)
  // TODO(jelbourn): Scroll snapping (virtual repeat)
  // TODO(jelbourn): Remove superfluous row from short months (virtual-repeat)
  // TODO(jelbourn): Month headers stick to top when scrolling.
  // TODO(jelbourn): Previous month opacity is lowered when partially scrolled out of view.
  // TODO(jelbourn): Support md-calendar standalone on a page (as a tabstop w/ aria-live
  //     announcement and key handling).
  // Read-only calendar (not just date-picker).

  /**
   * Height of one calendar month tbody. This must be made known to the virtual-repeat and is
   * subsequently used for scrolling to specific months.
   */
  var TBODY_HEIGHT = 265;

  /**
   * Height of a calendar month with a single row. This is needed to calculate the offset for
   * rendering an extra month in virtual-repeat that only contains one row.
   */
  var TBODY_SINGLE_ROW_HEIGHT = 45;

  function calendarDirective() {
    return {
      template:
          '<table aria-hidden="true" class="md-calendar-day-header"><thead></thead></table>' +
          '<div class="md-calendar-scroll-mask">' +
          '<md-virtual-repeat-container class="md-calendar-scroll-container" ' +
                'md-offset-size="' + (TBODY_SINGLE_ROW_HEIGHT - TBODY_HEIGHT) + '">' +
              '<table role="grid" tabindex="0" class="md-calendar" aria-readonly="true">' +
                '<tbody role="rowgroup" md-virtual-repeat="i in ctrl.items" md-calendar-month ' +
                    'md-month-offset="$index" class="md-calendar-month" ' +
                    'md-start-index="ctrl.getSelectedMonthIndex()" ' +
                    'md-item-size="' + TBODY_HEIGHT + '"></tbody>' +
              '</table>' +
            '</md-virtual-repeat-container>' +
          '</div>',
      scope: {
        minDate: '=mdMinDate',
        maxDate: '=mdMaxDate',
      },
      require: ['ngModel', 'mdCalendar'],
      controller: CalendarCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        var mdCalendarCtrl = controllers[1];
        mdCalendarCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /** Class applied to the selected date cell/. */
  var SELECTED_DATE_CLASS = 'md-calendar-selected-date';

  /** Class applied to the focused date cell/. */
  var FOCUSED_DATE_CLASS = 'md-focus';

  /** Next identifier for calendar instance. */
  var nextUniqueId = 0;

  /** The first renderable date in the virtual-scrolling calendar (for all instances). */
  var firstRenderableDate = null;

  /**
   * Controller for the mdCalendar component.
   * @ngInject @constructor
   */
  function CalendarCtrl($element, $attrs, $scope, $animate, $q, $mdConstant,
      $mdTheming, $$mdDateUtil, $mdDateLocale, $mdInkRipple, $mdUtil) {
    $mdTheming($element);
    /**
     * Dummy array-like object for virtual-repeat to iterate over. The length is the total
     * number of months that can be viewed. This is shorter than ideal because of (potential)
     * Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=1181658.
     */
    this.items = {length: 2000};

    if (this.maxDate && this.minDate) {
      // Limit the number of months if min and max dates are set.
      var numMonths = $$mdDateUtil.getMonthDistance(this.minDate, this.maxDate) + 1;
      numMonths = Math.max(numMonths, 1);
      // Add an additional month as the final dummy month for rendering purposes.
      numMonths += 1;
      this.items.length = numMonths;
    }

    /** @final {!angular.$animate} */
    this.$animate = $animate;

    /** @final {!angular.$q} */
    this.$q = $q;

    /** @final */
    this.$mdInkRipple = $mdInkRipple;

    /** @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.keyCode = $mdConstant.KEY_CODE;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.dateLocale = $mdDateLocale;

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @final {HTMLElement} */
    this.calendarElement = $element[0].querySelector('.md-calendar');

    /** @final {HTMLElement} */
    this.calendarScroller = $element[0].querySelector('.md-virtual-repeat-scroller');

    /** @final {Date} */
    this.today = this.dateUtil.createDateAtMidnight();

    /** @type {Date} */
    this.firstRenderableDate = this.dateUtil.incrementMonths(this.today, -this.items.length / 2);

    if (this.minDate && this.minDate > this.firstRenderableDate) {
      this.firstRenderableDate = this.minDate;
    } else if (this.maxDate) {
      // Calculate the difference between the start date and max date.
      // Subtract 1 because it's an inclusive difference and 1 for the final dummy month.
      //
      var monthDifference = this.items.length - 2;
      this.firstRenderableDate = this.dateUtil.incrementMonths(this.maxDate, -(this.items.length - 2));
    }


    /** @final {number} Unique ID for this calendar instance. */
    this.id = nextUniqueId++;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /**
     * The selected date. Keep track of this separately from the ng-model value so that we
     * can know, when the ng-model value changes, what the previous value was before its updated
     * in the component's UI.
     *
     * @type {Date}
     */
    this.selectedDate = null;

    /**
     * The date that is currently focused or showing in the calendar. This will initially be set
     * to the ng-model value if set, otherwise to today. It will be updated as the user navigates
     * to other months. The cell corresponding to the displayDate does not necesarily always have
     * focus in the document (such as for cases when the user is scrolling the calendar).
     * @type {Date}
     */
    this.displayDate = null;

    /**
     * The date that has or should have focus.
     * @type {Date}
     */
    this.focusDate = null;

    /** @type {boolean} */
    this.isInitialized = false;

    /** @type {boolean} */
    this.isMonthTransitionInProgress = false;

    // Unless the user specifies so, the calendar should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs['tabindex']) {
      $element.attr('tabindex', '-1');
    }

    var self = this;

    /**
     * Handles a click event on a date cell.
     * Created here so that every cell can use the same function instance.
     * @this {HTMLTableCellElement} The cell that was clicked.
     */
    this.cellClickHandler = function() {
      var cellElement = this;
      if (this.hasAttribute('data-timestamp')) {
        $scope.$apply(function() {
          var timestamp = Number(cellElement.getAttribute('data-timestamp'));
          self.setNgModelValue(self.dateUtil.createDateAtMidnight(timestamp));
        });
      }
    };

    this.attachCalendarEventListeners();
  }
  CalendarCtrl.$inject = ["$element", "$attrs", "$scope", "$animate", "$q", "$mdConstant", "$mdTheming", "$$mdDateUtil", "$mdDateLocale", "$mdInkRipple", "$mdUtil"];


  /*** Initialization ***/

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  CalendarCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      self.changeSelectedDate(self.ngModelCtrl.$viewValue);
    };
  };

  /**
   * Initialize the calendar by building the months that are initially visible.
   * Initialization should occur after the ngModel value is known.
   */
  CalendarCtrl.prototype.buildInitialCalendarDisplay = function() {
    this.buildWeekHeader();
    this.hideVerticalScrollbar();

    this.displayDate = this.selectedDate || this.today;
    this.isInitialized = true;
  };

  /**
   * Hides the vertical scrollbar on the calendar scroller by setting the width on the
   * calendar scroller and the `overflow: hidden` wrapper around the scroller, and then setting
   * a padding-right on the scroller equal to the width of the browser's scrollbar.
   *
   * This will cause a reflow.
   */
  CalendarCtrl.prototype.hideVerticalScrollbar = function() {
    var element = this.$element[0];

    var scrollMask = element.querySelector('.md-calendar-scroll-mask');
    var scroller = this.calendarScroller;

    var headerWidth = element.querySelector('.md-calendar-day-header').clientWidth;
    var scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;

    scrollMask.style.width = headerWidth + 'px';
    scroller.style.width = (headerWidth + scrollbarWidth) + 'px';
    scroller.style.paddingRight = scrollbarWidth + 'px';
  };


  /** Attach event listeners for the calendar. */
  CalendarCtrl.prototype.attachCalendarEventListeners = function() {
    // Keyboard interaction.
    this.$element.on('keydown', angular.bind(this, this.handleKeyEvent));
  };
  
  /*** User input handling ***/

  /**
   * Handles a key event in the calendar with the appropriate action. The action will either
   * be to select the focused date or to navigate to focus a new date.
   * @param {KeyboardEvent} event
   */
  CalendarCtrl.prototype.handleKeyEvent = function(event) {
    var self = this;
    this.$scope.$apply(function() {
      // Capture escape and emit back up so that a wrapping component
      // (such as a date-picker) can decide to close.
      if (event.which == self.keyCode.ESCAPE || event.which == self.keyCode.TAB) {
        self.$scope.$emit('md-calendar-close');

        if (event.which == self.keyCode.TAB) {
          event.preventDefault();
        }

        return;
      }

      // Remaining key events fall into two categories: selection and navigation.
      // Start by checking if this is a selection event.
      if (event.which === self.keyCode.ENTER) {
        self.setNgModelValue(self.displayDate);
        event.preventDefault();
        return;
      }

      // Selection isn't occuring, so the key event is either navigation or nothing.
      var date = self.getFocusDateFromKeyEvent(event);
      if (date) {
        date = self.boundDateByMinAndMax(date);
        event.preventDefault();
        event.stopPropagation();

        // Since this is a keyboard interaction, actually give the newly focused date keyboard
        // focus after the been brought into view.
        self.changeDisplayDate(date).then(function () {
          self.focus(date);
        });
      }
    });
  };

  /**
   * Gets the date to focus as the result of a key event.
   * @param {KeyboardEvent} event
   * @returns {Date} Date to navigate to, or null if the key does not match a calendar shortcut.
   */
  CalendarCtrl.prototype.getFocusDateFromKeyEvent = function(event) {
    var dateUtil = this.dateUtil;
    var keyCode = this.keyCode;

    switch (event.which) {
      case keyCode.RIGHT_ARROW: return dateUtil.incrementDays(this.displayDate, 1);
      case keyCode.LEFT_ARROW: return dateUtil.incrementDays(this.displayDate, -1);
      case keyCode.DOWN_ARROW:
        return event.metaKey ?
          dateUtil.incrementMonths(this.displayDate, 1) :
          dateUtil.incrementDays(this.displayDate, 7);
      case keyCode.UP_ARROW:
        return event.metaKey ?
          dateUtil.incrementMonths(this.displayDate, -1) :
          dateUtil.incrementDays(this.displayDate, -7);
      case keyCode.PAGE_DOWN: return dateUtil.incrementMonths(this.displayDate, 1);
      case keyCode.PAGE_UP: return dateUtil.incrementMonths(this.displayDate, -1);
      case keyCode.HOME: return dateUtil.getFirstDateOfMonth(this.displayDate);
      case keyCode.END: return dateUtil.getLastDateOfMonth(this.displayDate);
      default: return null;
    }
  };

  /**
   * Gets the "index" of the currently selected date as it would be in the virtual-repeat.
   * @returns {number}
   */
  CalendarCtrl.prototype.getSelectedMonthIndex = function() {
    return this.dateUtil.getMonthDistance(this.firstRenderableDate,
        this.selectedDate || this.today);
  };

  /**
   * Scrolls to the month of the given date.
   * @param {Date} date
   */
  CalendarCtrl.prototype.scrollToMonth = function(date) {
    if (!this.dateUtil.isValidDate(date)) {
      return;
    }

    var monthDistance = this.dateUtil.getMonthDistance(this.firstRenderableDate, date);
    this.calendarScroller.scrollTop = monthDistance * TBODY_HEIGHT;
  };

  /**
   * Sets the ng-model value for the calendar and emits a change event.
   * @param {Date} date
   */
  CalendarCtrl.prototype.setNgModelValue = function(date) {
    this.$scope.$emit('md-calendar-change', date);
    this.ngModelCtrl.$setViewValue(date);
    this.ngModelCtrl.$render();
  };

  /**
   * Focus the cell corresponding to the given date.
   * @param {Date=} opt_date
   */
  CalendarCtrl.prototype.focus = function(opt_date) {
    var date = opt_date || this.selectedDate || this.today;

    var previousFocus = this.calendarElement.querySelector('.md-focus');
    if (previousFocus) {
      previousFocus.classList.remove(FOCUSED_DATE_CLASS);
    }

    var cellId = this.getDateId(date);
    var cell = document.getElementById(cellId);
    if (cell) {
      cell.classList.add(FOCUSED_DATE_CLASS);
      cell.focus();
    } else {
      this.focusDate = date;
    }
  };

  /**
   * If a date exceeds minDate or maxDate, returns date matching minDate or maxDate, respectively.
   * Otherwise, returns the date.
   * @param {Date} date
   * @return {Date}
   */
  CalendarCtrl.prototype.boundDateByMinAndMax = function(date) {
    var boundDate = date;
    if (this.minDate && date < this.minDate) {
      boundDate = new Date(this.minDate.getTime());
    }
    if (this.maxDate && date > this.maxDate) {
      boundDate = new Date(this.maxDate.getTime());
    }
    return boundDate;
  };

  /*** Updating the displayed / selected date ***/

  /**
   * Change the selected date in the calendar (ngModel value has already been changed).
   * @param {Date} date
   */
  CalendarCtrl.prototype.changeSelectedDate = function(date) {
    var self = this;
    var previousSelectedDate = this.selectedDate;
    this.selectedDate = date;
    this.changeDisplayDate(date).then(function() {

      // Remove the selected class from the previously selected date, if any.
      if (previousSelectedDate) {
        var prevDateCell =
            document.getElementById(self.getDateId(previousSelectedDate));
        if (prevDateCell) {
          prevDateCell.classList.remove(SELECTED_DATE_CLASS);
          prevDateCell.setAttribute('aria-selected', 'false');
        }
      }

      // Apply the select class to the new selected date if it is set.
      if (date) {
        var dateCell = document.getElementById(self.getDateId(date));
        if (dateCell) {
          dateCell.classList.add(SELECTED_DATE_CLASS);
          dateCell.setAttribute('aria-selected', 'true');
        }
      }
    });
  };


  /**
   * Change the date that is being shown in the calendar. If the given date is in a different
   * month, the displayed month will be transitioned.
   * @param {Date} date
   */
  CalendarCtrl.prototype.changeDisplayDate = function(date) {
    // Initialization is deferred until this function is called because we want to reflect
    // the starting value of ngModel.
    if (!this.isInitialized) {
      this.buildInitialCalendarDisplay();
      return this.$q.when();
    }

    // If trying to show an invalid date or a transition is in progress, do nothing.
    if (!this.dateUtil.isValidDate(date) || this.isMonthTransitionInProgress) {
      return this.$q.when();
    }

    this.isMonthTransitionInProgress = true;
    var animationPromise = this.animateDateChange(date);

    this.displayDate = date;

    var self = this;
    animationPromise.then(function() {
      self.isMonthTransitionInProgress = false;
    });

    return animationPromise;
  };

  /**
   * Animates the transition from the calendar's current month to the given month.
   * @param {Date} date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateDateChange = function(date) {
    this.scrollToMonth(date);
    return this.$q.when();
  };

  /*** Constructing the calendar table ***/

  /**
   * Builds and appends a day-of-the-week header to the calendar.
   * This should only need to be called once during initialization.
   */
  CalendarCtrl.prototype.buildWeekHeader = function() {
    var firstDayOfWeek = this.dateLocale.firstDayOfWeek;
    var shortDays = this.dateLocale.shortDays;

    var row = document.createElement('tr');
    for (var i = 0; i < 7; i++) {
      var th = document.createElement('th');
      th.textContent = shortDays[(i + firstDayOfWeek) % 7];
      row.appendChild(th);
    }

    this.$element.find('thead').append(row);
  };

    /**
   * Gets an identifier for a date unique to the calendar instance for internal
   * purposes. Not to be displayed.
   * @param {Date} date
   * @returns {string}
   */
  CalendarCtrl.prototype.getDateId = function(date) {
    return [
      'md',
      this.id,
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ].join('-');
  };
})();

})();
(function(){
"use strict";

(function() {
  'use strict';


  angular.module('material.components.datepicker')
      .directive('mdCalendarMonth', mdCalendarMonthDirective);


  /**
   * Private directive consumed by md-calendar. Having this directive lets the calender use
   * md-virtual-repeat and also cleanly separates the month DOM construction functions from
   * the rest of the calendar controller logic.
   */
  function mdCalendarMonthDirective() {
    return {
      require: ['^^mdCalendar', 'mdCalendarMonth'],
      scope: {offset: '=mdMonthOffset'},
      controller: CalendarMonthCtrl,
      controllerAs: 'mdMonthCtrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var calendarCtrl = controllers[0];
        var monthCtrl = controllers[1];

        monthCtrl.calendarCtrl = calendarCtrl;
        monthCtrl.generateContent();

        // The virtual-repeat re-uses the same DOM elements, so there are only a limited number
        // of repeated items that are linked, and then those elements have their bindings updataed.
        // Since the months are not generated by bindings, we simply regenerate the entire thing
        // when the binding (offset) changes.
        scope.$watch(function() { return monthCtrl.offset; }, function(offset, oldOffset) {
          if (offset != oldOffset) {
            monthCtrl.generateContent();
          }
        });
      }
    };
  }

  /** Class applied to the cell for today. */
  var TODAY_CLASS = 'md-calendar-date-today';

  /** Class applied to the selected date cell/. */
  var SELECTED_DATE_CLASS = 'md-calendar-selected-date';

  /** Class applied to the focused date cell/. */
  var FOCUSED_DATE_CLASS = 'md-focus';

  /**
   * Controller for a single calendar month.
   * @ngInject @constructor
   */
  function CalendarMonthCtrl($element, $$mdDateUtil, $mdDateLocale) {
    this.dateUtil = $$mdDateUtil;
    this.dateLocale = $mdDateLocale;
    this.$element = $element;
    this.calendarCtrl = null;

    /**
     * Number of months from the start of the month "items" that the currently rendered month
     * occurs. Set via angular data binding.
     * @type {number}
     */
    this.offset;

    /**
     * Date cell to focus after appending the month to the document.
     * @type {HTMLElement}
     */
    this.focusAfterAppend = null;
  }
  CalendarMonthCtrl.$inject = ["$element", "$$mdDateUtil", "$mdDateLocale"];

  /** Generate and append the content for this month to the directive element. */
  CalendarMonthCtrl.prototype.generateContent = function() {
    var calendarCtrl = this.calendarCtrl;
    var date = this.dateUtil.incrementMonths(calendarCtrl.firstRenderableDate, this.offset);

    this.$element.empty();
    this.$element.append(this.buildCalendarForMonth(date));

    if (this.focusAfterAppend) {
      this.focusAfterAppend.classList.add(FOCUSED_DATE_CLASS);
      this.focusAfterAppend.focus();
      this.focusAfterAppend = null;
    }
  };

  /**
   * Creates a single cell to contain a date in the calendar with all appropriate
   * attributes and classes added. If a date is given, the cell content will be set
   * based on the date.
   * @param {Date=} opt_date
   * @returns {HTMLElement}
   */
  CalendarMonthCtrl.prototype.buildDateCell = function(opt_date) {
    var calendarCtrl = this.calendarCtrl;

    // TODO(jelbourn): cloneNode is likely a faster way of doing this.
    var cell = document.createElement('td');
    cell.tabIndex = -1;
    cell.classList.add('md-calendar-date');
    cell.setAttribute('role', 'gridcell');

    if (opt_date) {
      cell.setAttribute('tabindex', '-1');
      cell.setAttribute('aria-label', this.dateLocale.longDateFormatter(opt_date));
      cell.id = calendarCtrl.getDateId(opt_date);

      // Use `data-timestamp` attribute because IE10 does not support the `dataset` property.
      cell.setAttribute('data-timestamp', opt_date.getTime());

      // TODO(jelourn): Doing these comparisons for class addition during generation might be slow.
      // It may be better to finish the construction and then query the node and add the class.
      if (this.dateUtil.isSameDay(opt_date, calendarCtrl.today)) {
        cell.classList.add(TODAY_CLASS);
      }

      if (this.dateUtil.isValidDate(calendarCtrl.selectedDate) &&
          this.dateUtil.isSameDay(opt_date, calendarCtrl.selectedDate)) {
        cell.classList.add(SELECTED_DATE_CLASS);
        cell.setAttribute('aria-selected', 'true');
      }

      var cellText = this.dateLocale.dates[opt_date.getDate()];

      if (this.dateUtil.isDateWithinRange(opt_date,
          this.calendarCtrl.minDate, this.calendarCtrl.maxDate)) {
        // Add a indicator for select, hover, and focus states.
        var selectionIndicator = document.createElement('span');
        cell.appendChild(selectionIndicator);
        selectionIndicator.classList.add('md-calendar-date-selection-indicator');
        selectionIndicator.textContent = cellText;

        cell.addEventListener('click', calendarCtrl.cellClickHandler);

        if (calendarCtrl.focusDate && this.dateUtil.isSameDay(opt_date, calendarCtrl.focusDate)) {
          this.focusAfterAppend = cell;
        }
      } else {
        cell.classList.add('md-calendar-date-disabled');
        cell.textContent = cellText;
      }
    }

    return cell;
  };

  /**
   * Builds a `tr` element for the calendar grid.
   * @param rowNumber The week number within the month.
   * @returns {HTMLElement}
   */
  CalendarMonthCtrl.prototype.buildDateRow = function(rowNumber) {
    var row = document.createElement('tr');
    row.setAttribute('role', 'row');

    // Because of an NVDA bug (with Firefox), the row needs an aria-label in order
    // to prevent the entire row being read aloud when the user moves between rows.
    // See http://community.nvda-project.org/ticket/4643.
    row.setAttribute('aria-label', this.dateLocale.weekNumberFormatter(rowNumber));

    return row;
  };

  /**
   * Builds the <tbody> content for the given date's month.
   * @param {Date=} opt_dateInMonth
   * @returns {DocumentFragment} A document fragment containing the <tr> elements.
   */
  CalendarMonthCtrl.prototype.buildCalendarForMonth = function(opt_dateInMonth) {
    var date = this.dateUtil.isValidDate(opt_dateInMonth) ? opt_dateInMonth : new Date();

    var firstDayOfMonth = this.dateUtil.getFirstDateOfMonth(date);
    var firstDayOfTheWeek = this.getLocaleDay_(firstDayOfMonth);
    var numberOfDaysInMonth = this.dateUtil.getNumberOfDaysInMonth(date);

    // Store rows for the month in a document fragment so that we can append them all at once.
    var monthBody = document.createDocumentFragment();

    var rowNumber = 1;
    var row = this.buildDateRow(rowNumber);
    monthBody.appendChild(row);

    // If this is the final month in the list of items, only the first week should render,
    // so we should return immediately after the first row is complete and has been
    // attached to the body.
    var isFinalMonth = this.offset === this.calendarCtrl.items.length - 1;

    // Add a label for the month. If the month starts on a Sun/Mon/Tues, the month label
    // goes on a row above the first of the month. Otherwise, the month label takes up the first
    // two cells of the first row.
    var blankCellOffset = 0;
    var monthLabelCell = document.createElement('td');
    monthLabelCell.classList.add('md-calendar-month-label');
    // If the entire month is after the max date, render the label as a disabled state.
    if (this.calendarCtrl.maxDate && firstDayOfMonth > this.calendarCtrl.maxDate) {
      monthLabelCell.classList.add('md-calendar-month-label-disabled');
    }
    monthLabelCell.textContent = this.dateLocale.monthHeaderFormatter(date);
    if (firstDayOfTheWeek <= 2) {
      monthLabelCell.setAttribute('colspan', '7');

      var monthLabelRow = this.buildDateRow();
      monthLabelRow.appendChild(monthLabelCell);
      monthBody.insertBefore(monthLabelRow, row);

      if (isFinalMonth) {
        return monthBody;
      }
    } else {
      blankCellOffset = 2;
      monthLabelCell.setAttribute('colspan', '2');
      row.appendChild(monthLabelCell);
    }

    // Add a blank cell for each day of the week that occurs before the first of the month.
    // For example, if the first day of the month is a Tuesday, add blank cells for Sun and Mon.
    // The blankCellOffset is needed in cases where the first N cells are used by the month label.
    for (var i = blankCellOffset; i < firstDayOfTheWeek; i++) {
      row.appendChild(this.buildDateCell());
    }

    // Add a cell for each day of the month, keeping track of the day of the week so that
    // we know when to start a new row.
    var dayOfWeek = firstDayOfTheWeek;
    var iterationDate = firstDayOfMonth;
    for (var d = 1; d <= numberOfDaysInMonth; d++) {
      // If we've reached the end of the week, start a new row.
      if (dayOfWeek === 7) {
        // We've finished the first row, so we're done if this is the final month.
        if (isFinalMonth) {
          return monthBody;
        }
        dayOfWeek = 0;
        rowNumber++;
        row = this.buildDateRow(rowNumber);
        monthBody.appendChild(row);
      }

      iterationDate.setDate(d);
      var cell = this.buildDateCell(iterationDate);
      row.appendChild(cell);

      dayOfWeek++;
    }

    // Ensure that the last row of the month has 7 cells.
    while (row.childNodes.length < 7) {
      row.appendChild(this.buildDateCell());
    }

    // Ensure that all months have 6 rows. This is necessary for now because the virtual-repeat
    // requires that all items have exactly the same height.
    while (monthBody.childNodes.length < 6) {
      var whitespaceRow = this.buildDateRow();
      for (var i = 0; i < 7; i++) {
        whitespaceRow.appendChild(this.buildDateCell());
      }
      monthBody.appendChild(whitespaceRow);
    }

    return monthBody;
  };

  /**
   * Gets the day-of-the-week index for a date for the current locale.
   * @private
   * @param {Date} date
   * @returns {number} The column index of the date in the calendar.
   */
  CalendarMonthCtrl.prototype.getLocaleDay_ = function(date) {
    return (date.getDay() + (7 - this.dateLocale.firstDayOfWeek)) % 7
  };
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name $mdDateLocaleProvider
   * @module material.components.datepicker
   *
   * @description
   * The `$mdDateLocaleProvider` is the provider that creates the `$mdDateLocale` service.
   * This provider that allows the user to specify messages, formatters, and parsers for date
   * internationalization. The `$mdDateLocale` service itself is consumed by Angular Material
   * components that that deal with dates.
   *
   * @property {(Array<string>)=} months Array of month names (in order).
   * @property {(Array<string>)=} shortMonths Array of abbreviated month names.
   * @property {(Array<string>)=} days Array of the days of the week (in order).
   * @property {(Array<string>)=} shortDays Array of abbreviated dayes of the week.
   * @property {(Array<string>)=} dates Array of dates of the month. Only necessary for locales
   *     using a numeral system other than [1, 2, 3...].
   * @property {(Array<string>)=} firstDayOfWeek The first day of the week. Sunday = 0, Monday = 1,
   *    etc.
   * @property {(function(string): Date)=} parseDate Function to parse a date object from a string.
   * @property {(function(Date): string)=} formatDate Function to format a date object to a string.
   * @property {(function(Date): string)=} monthHeaderFormatter Function that returns the label for
   *     a month given a date.
   * @property {(function(number): string)=} weekNumberFormatter Function that returns a label for
   *     a week given the week number.
   * @property {(string)=} msgCalendar Translation of the label "Calendar" for the current locale.
   * @property {(string)=} msgOpenCalendar Translation of the button label "Open calendar" for the
   *     current locale.
   *
   * @usage
   * <hljs lang="js">
   *   myAppModule.config(function($mdDateLocaleProvider) {
   *
   *     // Example of a French localization.
   *     $mdDateLocaleProvider.months = ['janvier', 'février', 'mars', ...];
   *     $mdDateLocaleProvider.shortMonths = ['janv', 'févr', 'mars', ...];
   *     $mdDateLocaleProvider.days = ['dimanche', 'lundi', 'mardi', ...];
   *     $mdDateLocaleProvider.shortDays = ['Di', 'Lu', 'Ma', ...];
   *
   *     // Can change week display to start on Monday.
   *     $mdDateLocaleProvider.firstDayOfWeek = 1;
   *
   *     // Optional.
   *     $mdDateLocaleProvider.dates = [1, 2, 3, 4, 5, 6, ...];
   *
   *     // Example uses moment.js to parse and format dates.
   *     $mdDateLocaleProvider.parseDate = function(dateString) {
   *       var m = moment(dateString, 'L', true);
   *       return m.isValid() ? m.toDate() : new Date(NaN);
   *     };
   *
   *     $mdDateLocaleProvider.formatDate = function(date) {
   *       return moment(date).format('L');
   *     };
   *
   *     $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
   *       return myShortMonths[date.getMonth()] + ' ' + date.getFullYear();
   *     };
   *
   *     // In addition to date display, date components also need localized messages
   *     // for aria-labels for screen-reader users.
   *
   *     $mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
   *       return 'Semaine ' + weekNumber;
   *     };
   *
   *     $mdDateLocaleProvider.msgCalendar = 'Calendrier';
   *     $mdDateLocaleProvider.msgOpenCalendar = 'Ouvrir le calendrier';
   *
   * });
   * </hljs>
   *
   */

  angular.module('material.components.datepicker').config(["$provide", function($provide) {
    // TODO(jelbourn): Assert provided values are correctly formatted. Need assertions.

    /** @constructor */
    function DateLocaleProvider() {
      /** Array of full month names. E.g., ['January', 'Febuary', ...] */
      this.months = null;

      /** Array of abbreviated month names. E.g., ['Jan', 'Feb', ...] */
      this.shortMonths = null;

      /** Array of full day of the week names. E.g., ['Monday', 'Tuesday', ...] */
      this.days = null;

      /** Array of abbreviated dat of the week names. E.g., ['M', 'T', ...] */
      this.shortDays = null;

      /** Array of dates of a month (1 - 31). Characters might be different in some locales. */
      this.dates = null;

      /** Index of the first day of the week. 0 = Sunday, 1 = Monday, etc. */
      this.firstDayOfWeek = 0;

      /**
       * Function that converts the date portion of a Date to a string.
       * @type {(function(Date): string)}
       */
      this.formatDate = null;

      /**
       * Function that converts a date string to a Date object (the date portion)
       * @type {function(string): Date}
       */
      this.parseDate = null;

      /**
       * Function that formats a Date into a month header string.
       * @type {function(Date): string}
       */
      this.monthHeaderFormatter = null;

      /**
       * Function that formats a week number into a label for the week.
       * @type {function(number): string}
       */
      this.weekNumberFormatter = null;

      /**
       * Function that formats a date into a long aria-label that is read
       * when the focused date changes.
       * @type {function(Date): string}
       */
      this.longDateFormatter = null;

      /**
       * ARIA label for the calendar "dialog" used in the datepicker.
       * @type {string}
       */
      this.msgCalendar = '';

      /**
       * ARIA label for the datepicker's "Open calendar" buttons.
       * @type {string}
       */
      this.msgOpenCalendar = '';
    }

    /**
     * Factory function that returns an instance of the dateLocale service.
     * @ngInject
     * @param $locale
     * @returns {DateLocale}
     */
    DateLocaleProvider.prototype.$get = function($locale) {
      /**
       * Default date-to-string formatting function.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultFormatDate(date) {
        if (!date) {
          return '';
        }

        // All of the dates created through ng-material *should* be set to midnight.
        // If we encounter a date where the localeTime shows at 11pm instead of midnight,
        // we have run into an issue with DST where we need to increment the hour by one:
        // var d = new Date(1992, 9, 8, 0, 0, 0);
        // d.toLocaleString(); // == "10/7/1992, 11:00:00 PM"
        var localeTime = date.toLocaleTimeString();
        var formatDate = date;
        if (date.getHours() == 0 &&
            (localeTime.indexOf('11:') !== -1 || localeTime.indexOf('23:') !== -1)) {
          formatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 1, 0, 0);
        }

        return formatDate.toLocaleDateString();
      }

      /**
       * Default string-to-date parsing function.
       * @param {string} dateString
       * @returns {!Date}
       */
      function defaultParseDate(dateString) {
        return new Date(dateString);
      }

      /**
       * Default function to determine whether a string makes sense to be
       * parsed to a Date object.
       *
       * This is very permissive and is just a basic sanity check to ensure that
       * things like single integers aren't able to be parsed into dates.
       * @param {string} dateString
       * @returns {boolean}
       */
      function defaultIsDateComplete(dateString) {
        dateString = dateString.trim();

        // Looks for three chunks of content (either numbers or text) separated
        // by delimiters.
        var re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ \.,]+|[\/\-])){2}([a-zA-Z]{3,}|[0-9]{1,4})$/;
        return re.test(dateString);
      }

      /**
       * Default date-to-string formatter to get a month header.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultMonthHeaderFormatter(date) {
        return service.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
      }

      /**
       * Default week number formatter.
       * @param number
       * @returns {string}
       */
      function defaultWeekNumberFormatter(number) {
        return 'Week ' + number;
      }

      /**
       * Default formatter for date cell aria-labels.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultLongDateFormatter(date) {
        // Example: 'Thursday June 18 2015'
        return [
          service.days[date.getDay()],
          service.months[date.getMonth()],
          service.dates[date.getDate()],
          date.getFullYear()
        ].join(' ');
      }

      // The default "short" day strings are the first character of each day,
      // e.g., "Monday" => "M".
      var defaultShortDays = $locale.DATETIME_FORMATS.DAY.map(function(day) {
        return day[0];
      });

      // The default dates are simply the numbers 1 through 31.
      var defaultDates = Array(32);
      for (var i = 1; i <= 31; i++) {
        defaultDates[i] = i;
      }

      // Default ARIA messages are in English (US).
      var defaultMsgCalendar = 'Calendar';
      var defaultMsgOpenCalendar = 'Open calendar';

      var service = {
        months: this.months || $locale.DATETIME_FORMATS.MONTH,
        shortMonths: this.shortMonths || $locale.DATETIME_FORMATS.SHORTMONTH,
        days: this.days || $locale.DATETIME_FORMATS.DAY,
        shortDays: this.shortDays || defaultShortDays,
        dates: this.dates || defaultDates,
        firstDayOfWeek: this.firstDayOfWeek || 0,
        formatDate: this.formatDate || defaultFormatDate,
        parseDate: this.parseDate || defaultParseDate,
        isDateComplete: this.isDateComplete || defaultIsDateComplete,
        monthHeaderFormatter: this.monthHeaderFormatter || defaultMonthHeaderFormatter,
        weekNumberFormatter: this.weekNumberFormatter || defaultWeekNumberFormatter,
        longDateFormatter: this.longDateFormatter || defaultLongDateFormatter,
        msgCalendar: this.msgCalendar || defaultMsgCalendar,
        msgOpenCalendar: this.msgOpenCalendar || defaultMsgOpenCalendar
      };

      return service;
    };
    DateLocaleProvider.prototype.$get.$inject = ["$locale"];

    $provide.provider('$mdDateLocale', new DateLocaleProvider());
  }]);
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  // POST RELEASE
  // TODO(jelbourn): Demo that uses moment.js
  // TODO(jelbourn): make sure this plays well with validation and ngMessages.
  // TODO(jelbourn): calendar pane doesn't open up outside of visible viewport.
  // TODO(jelbourn): forward more attributes to the internal input (required, autofocus, etc.)
  // TODO(jelbourn): something better for mobile (calendar panel takes up entire screen?)
  // TODO(jelbourn): input behavior (masking? auto-complete?)
  // TODO(jelbourn): UTC mode
  // TODO(jelbourn): RTL


  angular.module('material.components.datepicker')
      .directive('mdDatepicker', datePickerDirective);

  /**
   * @ngdoc directive
   * @name mdDatepicker
   * @module material.components.datepicker
   *
   * @param {Date} ng-model The component's model. Expects a JavaScript Date object.
   * @param {expression=} ng-change Expression evaluated when the model value changes.
   * @param {Date=} md-min-date Expression representing a min date (inclusive).
   * @param {Date=} md-max-date Expression representing a max date (inclusive).
   * @param {boolean=} disabled Whether the datepicker is disabled.
   * @param {boolean=} required Whether a value is required for the datepicker.
   *
   * @description
   * `<md-datepicker>` is a component used to select a single date.
   * For information on how to configure internationalization for the date picker,
   * see `$mdDateLocaleProvider`.
   *
   * This component supports [ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages).
   * Supported attributes are:
   * * `required`: whether a required date is not set.
   * * `mindate`: whether the selected date is before the minimum allowed date.
   * * `maxdate`: whether the selected date is after the maximum allowed date.
   *
   * @usage
   * <hljs lang="html">
   *   <md-datepicker ng-model="birthday"></md-datepicker>
   * </hljs>
   *
   */
  function datePickerDirective() {
    return {
      template:
          // Buttons are not in the tab order because users can open the calendar via keyboard
          // interaction on the text input, and multiple tab stops for one component (picker)
          // may be confusing.
          '<md-button class="md-datepicker-button md-icon-button" type="button" ' +
              'tabindex="-1" aria-hidden="true" ' +
              'ng-click="ctrl.openCalendarPane($event)">' +
            '<md-icon class="md-datepicker-calendar-icon" md-svg-icon="md-calendar"></md-icon>' +
          '</md-button>' +
          '<div class="md-datepicker-input-container" ' +
              'ng-class="{\'md-datepicker-focused\': ctrl.isFocused}">' +
            '<input class="md-datepicker-input" aria-haspopup="true" ' +
                'ng-focus="ctrl.setFocused(true)" ng-blur="ctrl.setFocused(false)">' +
            '<md-button type="button" md-no-ink ' +
                'class="md-datepicker-triangle-button md-icon-button" ' +
                'ng-click="ctrl.openCalendarPane($event)" ' +
                'aria-label="{{::ctrl.dateLocale.msgOpenCalendar}}">' +
              '<div class="md-datepicker-expand-triangle"></div>' +
            '</md-button>' +
          '</div>' +

          // This pane will be detached from here and re-attached to the document body.
          '<div class="md-datepicker-calendar-pane md-whiteframe-z1">' +
            '<div class="md-datepicker-input-mask">' +
              '<div class="md-datepicker-input-mask-opaque"></div>' +
            '</div>' +
            '<div class="md-datepicker-calendar">' +
              '<md-calendar role="dialog" aria-label="{{::ctrl.dateLocale.msgCalendar}}" ' +
                  'md-min-date="ctrl.minDate" md-max-date="ctrl.maxDate"' +
                  'ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen">' +
              '</md-calendar>' +
            '</div>' +
          '</div>',
      require: ['ngModel', 'mdDatepicker'],
      scope: {
        minDate: '=mdMinDate',
        maxDate: '=mdMaxDate',
        placeholder: '@mdPlaceholder'
      },
      controller: DatePickerCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      link: function(scope, element, attr, controllers) {
        var ngModelCtrl = controllers[0];
        var mdDatePickerCtrl = controllers[1];

        mdDatePickerCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /** Additional offset for the input's `size` attribute, which is updated based on its content. */
  var EXTRA_INPUT_SIZE = 3;

  /** Class applied to the container if the date is invalid. */
  var INVALID_CLASS = 'md-datepicker-invalid';

  /** Default time in ms to debounce input event by. */
  var DEFAULT_DEBOUNCE_INTERVAL = 500;

  /**
   * Height of the calendar pane used to check if the pane is going outside the boundary of
   * the viewport. See calendar.scss for how $md-calendar-height is computed; an extra 20px is
   * also added to space the pane away from the exact edge of the screen.
   *
   *  This is computed statically now, but can be changed to be measured if the circumstances
   *  of calendar sizing are changed.
   */
  var CALENDAR_PANE_HEIGHT = 368;

  /**
   * Width of the calendar pane used to check if the pane is going outside the boundary of
   * the viewport. See calendar.scss for how $md-calendar-width is computed; an extra 20px is
   * also added to space the pane away from the exact edge of the screen.
   *
   *  This is computed statically now, but can be changed to be measured if the circumstances
   *  of calendar sizing are changed.
   */
  var CALENDAR_PANE_WIDTH = 360;

  /**
   * Controller for md-datepicker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl($scope, $element, $attrs, $compile, $timeout, $window,
      $mdConstant, $mdTheming, $mdUtil, $mdDateLocale, $$mdDateUtil, $$rAF) {
    /** @final */
    this.$compile = $compile;

    /** @final */
    this.$timeout = $timeout;

    /** @final */
    this.$window = $window;

    /** @final */
    this.dateLocale = $mdDateLocale;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.$mdConstant = $mdConstant;

    /* @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.$$rAF = $$rAF;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector('input');

    /** @final {!angular.JQLite} */
    this.ngInputElement = angular.element(this.inputElement);

    /** @type {HTMLElement} */
    this.inputContainer = $element[0].querySelector('.md-datepicker-input-container');

    /** @type {HTMLElement} Floating calendar pane. */
    this.calendarPane = $element[0].querySelector('.md-datepicker-calendar-pane');

    /** @type {HTMLElement} Calendar icon button. */
    this.calendarButton = $element[0].querySelector('.md-datepicker-button');

    /**
     * Element covering everything but the input in the top of the floating calendar pane.
     * @type {HTMLElement}
     */
    this.inputMask = $element[0].querySelector('.md-datepicker-input-mask-opaque');

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Attributes} */
    this.$attrs = $attrs;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @type {Date} */
    this.date = null;

    /** @type {boolean} */
    this.isFocused = false;

    /** @type {boolean} */
    this.isDisabled;
    this.setDisabled($element[0].disabled || angular.isString($attrs['disabled']));

    /** @type {boolean} Whether the date-picker's calendar pane is open. */
    this.isCalendarOpen = false;

    /**
     * Element from which the calendar pane was opened. Keep track of this so that we can return
     * focus to it when the pane is closed.
     * @type {HTMLElement}
     */
    this.calendarPaneOpenedFrom = null;

    this.calendarPane.id = 'md-date-pane' + $mdUtil.nextUid();

    $mdTheming($element);

    /** Pre-bound click handler is saved so that the event listener can be removed. */
    this.bodyClickHandler = angular.bind(this, this.handleBodyClick);

    /** Pre-bound resize handler so that the event listener can be removed. */
    this.windowResizeHandler = $mdUtil.debounce(angular.bind(this, this.closeCalendarPane), 100);

    // Unless the user specifies so, the datepicker should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs['tabindex']) {
      $element.attr('tabindex', '-1');
    }

    this.installPropertyInterceptors();
    this.attachChangeListeners();
    this.attachInteractionListeners();

    var self = this;
    $scope.$on('$destroy', function() {
      self.detachCalendarPane();
    });
  }
  DatePickerCtrl.$inject = ["$scope", "$element", "$attrs", "$compile", "$timeout", "$window", "$mdConstant", "$mdTheming", "$mdUtil", "$mdDateLocale", "$$mdDateUtil", "$$rAF"];

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  DatePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      self.date = self.ngModelCtrl.$viewValue;
      self.inputElement.value = self.dateLocale.formatDate(self.date);
      self.resizeInputElement();
      self.setErrorFlags();
    };
  };

  /**
   * Attach event listeners for both the text input and the md-calendar.
   * Events are used instead of ng-model so that updates don't infinitely update the other
   * on a change. This should also be more performant than using a $watch.
   */
  DatePickerCtrl.prototype.attachChangeListeners = function() {
    var self = this;

    self.$scope.$on('md-calendar-change', function(event, date) {
      self.ngModelCtrl.$setViewValue(date);
      self.date = date;
      self.inputElement.value = self.dateLocale.formatDate(date);
      self.closeCalendarPane();
      self.resizeInputElement();
      self.inputContainer.classList.remove(INVALID_CLASS);
    });

    self.ngInputElement.on('input', angular.bind(self, self.resizeInputElement));
    // TODO(chenmike): Add ability for users to specify this interval.
    self.ngInputElement.on('input', self.$mdUtil.debounce(self.handleInputEvent,
        DEFAULT_DEBOUNCE_INTERVAL, self));
  };

  /** Attach event listeners for user interaction. */
  DatePickerCtrl.prototype.attachInteractionListeners = function() {
    var self = this;
    var $scope = this.$scope;
    var keyCodes = this.$mdConstant.KEY_CODE;

    // Add event listener through angular so that we can triggerHandler in unit tests.
    self.ngInputElement.on('keydown', function(event) {
      if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
        self.openCalendarPane(event);
        $scope.$digest();
      }
    });

    $scope.$on('md-calendar-close', function() {
      self.closeCalendarPane();
    });
  };

  /**
   * Capture properties set to the date-picker and imperitively handle internal changes.
   * This is done to avoid setting up additional $watches.
   */
  DatePickerCtrl.prototype.installPropertyInterceptors = function() {
    var self = this;

    if (this.$attrs['ngDisabled']) {
      // The expression is to be evaluated against the directive element's scope and not
      // the directive's isolate scope.
      var scope = this.$mdUtil.validateScope(this.$element) ? this.$element.scope() : null;

      if ( scope ) {
        scope.$watch(this.$attrs['ngDisabled'], function(isDisabled) {
          self.setDisabled(isDisabled);
        });
      }
    }

    Object.defineProperty(this, 'placeholder', {
      get: function() { return self.inputElement.placeholder; },
      set: function(value) { self.inputElement.placeholder = value || ''; }
    });
  };

  /**
   * Sets whether the date-picker is disabled.
   * @param {boolean} isDisabled
   */
  DatePickerCtrl.prototype.setDisabled = function(isDisabled) {
    this.isDisabled = isDisabled;
    this.inputElement.disabled = isDisabled;
    this.calendarButton.disabled = isDisabled;
  };

  /**
   * Sets the custom ngModel.$error flags to be consumed by ngMessages. Flags are:
   *   - mindate: whether the selected date is before the minimum date.
   *   - maxdate: whether the selected flag is after the maximum date.
   */
  DatePickerCtrl.prototype.setErrorFlags = function() {
    if (this.dateUtil.isValidDate(this.date)) {
      if (this.dateUtil.isValidDate(this.minDate)) {
        this.ngModelCtrl.$error['mindate'] = this.date < this.minDate;
      }

      if (this.dateUtil.isValidDate(this.maxDate)) {
        this.ngModelCtrl.$error['maxdate'] = this.date > this.maxDate;
      }
    }
  };

  /** Resizes the input element based on the size of its content. */
  DatePickerCtrl.prototype.resizeInputElement = function() {
    this.inputElement.size = this.inputElement.value.length + EXTRA_INPUT_SIZE;
  };

  /**
   * Sets the model value if the user input is a valid date.
   * Adds an invalid class to the input element if not.
   */
  DatePickerCtrl.prototype.handleInputEvent = function() {
    var inputString = this.inputElement.value;
    var parsedDate = this.dateLocale.parseDate(inputString);
    this.dateUtil.setDateTimeToMidnight(parsedDate);
    if (inputString === '') {
      this.ngModelCtrl.$setViewValue(null);
      this.date = null;
      this.inputContainer.classList.remove(INVALID_CLASS);
    } else if (this.dateUtil.isValidDate(parsedDate) &&
        this.dateLocale.isDateComplete(inputString) &&
        this.dateUtil.isDateWithinRange(parsedDate, this.minDate, this.maxDate)) {
      this.ngModelCtrl.$setViewValue(parsedDate);
      this.date = parsedDate;
      this.inputContainer.classList.remove(INVALID_CLASS);
    } else {
      // If there's an input string, it's an invalid date.
      this.inputContainer.classList.toggle(INVALID_CLASS, inputString);
    }
  };

  /** Position and attach the floating calendar to the document. */
  DatePickerCtrl.prototype.attachCalendarPane = function() {
    var calendarPane = this.calendarPane;
    calendarPane.style.transform = '';
    this.$element.addClass('md-datepicker-open');

    var elementRect = this.inputContainer.getBoundingClientRect();
    var bodyRect = document.body.getBoundingClientRect();

    // Check to see if the calendar pane would go off the screen. If so, adjust position
    // accordingly to keep it within the viewport.
    var paneTop = elementRect.top - bodyRect.top;
    var paneLeft = elementRect.left - bodyRect.left;

    var viewportTop = document.body.scrollTop;
    var viewportBottom = viewportTop + this.$window.innerHeight;

    var viewportLeft = document.body.scrollLeft;
    var viewportRight = document.body.scrollLeft + this.$window.innerWidth;

    // If the right edge of the pane would be off the screen and shifting it left by the
    // difference would not go past the left edge of the screen. If the calendar pane is too
    // big to fit on the screen at all, move it to the left of the screen and scale the entire
    // element down to fit.
    if (paneLeft + CALENDAR_PANE_WIDTH > viewportRight) {
      if (viewportRight - CALENDAR_PANE_WIDTH > 0) {
        paneLeft = viewportRight - CALENDAR_PANE_WIDTH;
      } else {
        paneLeft = viewportLeft;
        var scale = this.$window.innerWidth / CALENDAR_PANE_WIDTH;
        calendarPane.style.transform = 'scale(' + scale + ')';
      }

      calendarPane.classList.add('md-datepicker-pos-adjusted');
    }

    // If the bottom edge of the pane would be off the screen and shifting it up by the
    // difference would not go past the top edge of the screen.
    if (paneTop + CALENDAR_PANE_HEIGHT > viewportBottom &&
        viewportBottom - CALENDAR_PANE_HEIGHT > viewportTop) {
      paneTop = viewportBottom - CALENDAR_PANE_HEIGHT;
      calendarPane.classList.add('md-datepicker-pos-adjusted');
    }

    calendarPane.style.left = paneLeft + 'px';
    calendarPane.style.top = paneTop + 'px';
    document.body.appendChild(calendarPane);

    // The top of the calendar pane is a transparent box that shows the text input underneath.
    // Since the pane is floating, though, the page underneath the pane *adjacent* to the input is
    // also shown unless we cover it up. The inputMask does this by filling up the remaining space
    // based on the width of the input.
    this.inputMask.style.left = elementRect.width + 'px';

    // Add CSS class after one frame to trigger open animation.
    this.$$rAF(function() {
      calendarPane.classList.add('md-pane-open');
    });
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    this.$element.removeClass('md-datepicker-open');
    this.calendarPane.classList.remove('md-pane-open');
    this.calendarPane.classList.remove('md-datepicker-pos-adjusted');

    if (this.calendarPane.parentNode) {
      // Use native DOM removal because we do not want any of the angular state of this element
      // to be disposed.
      this.calendarPane.parentNode.removeChild(this.calendarPane);
    }
  };

  /**
   * Open the floating calendar pane.
   * @param {Event} event
   */
  DatePickerCtrl.prototype.openCalendarPane = function(event) {
    if (!this.isCalendarOpen && !this.isDisabled) {
      this.isCalendarOpen = true;
      this.calendarPaneOpenedFrom = event.target;
      this.attachCalendarPane();
      this.focusCalendar();

      // Because the calendar pane is attached directly to the body, it is possible that the
      // rest of the component (input, etc) is in a different scrolling container, such as
      // an md-content. This means that, if the container is scrolled, the pane would remain
      // stationary. To remedy this, we disable scrolling while the calendar pane is open, which
      // also matches the native behavior for things like `<select>` on Mac and Windows.
      this.$mdUtil.disableScrollAround(this.calendarPane);

      // Attach click listener inside of a timeout because, if this open call was triggered by a
      // click, we don't want it to be immediately propogated up to the body and handled.
      var self = this;
      this.$mdUtil.nextTick(function() {
        document.body.addEventListener('click', self.bodyClickHandler);
      }, false);

      window.addEventListener('resize', this.windowResizeHandler);
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    if (this.isCalendarOpen) {
      this.isCalendarOpen = false;
      this.detachCalendarPane();
      this.calendarPaneOpenedFrom.focus();
      this.calendarPaneOpenedFrom = null;
      this.$mdUtil.enableScrolling();

      document.body.removeEventListener('click', this.bodyClickHandler);
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  };

  /** Gets the controller instance for the calendar in the floating pane. */
  DatePickerCtrl.prototype.getCalendarCtrl = function() {
    return angular.element(this.calendarPane.querySelector('md-calendar')).controller('mdCalendar');
  };

  /** Focus the calendar in the floating pane. */
  DatePickerCtrl.prototype.focusCalendar = function() {
    // Use a timeout in order to allow the calendar to be rendered, as it is gated behind an ng-if.
    var self = this;
    this.$mdUtil.nextTick(function() {
      self.getCalendarCtrl().focus();
    }, false);
  };

  /**
   * Sets whether the input is currently focused.
   * @param {boolean} isFocused
   */
  DatePickerCtrl.prototype.setFocused = function(isFocused) {
    this.isFocused = isFocused;
  };

  /**
   * Handles a click on the document body when the floating calendar pane is open.
   * Closes the floating calendar pane if the click is not inside of it.
   * @param {MouseEvent} event
   */
  DatePickerCtrl.prototype.handleBodyClick = function(event) {
    if (this.isCalendarOpen) {
      // TODO(jelbourn): way want to also include the md-datepicker itself in this check.
      var isInCalendar = this.$mdUtil.getClosest(event.target, 'md-calendar');
      if (!isInCalendar) {
        this.closeCalendarPane();
      }

      this.$scope.$digest();
    }
  };
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * Utility for performing date calculations to facilitate operation of the calendar and
   * datepicker.
   */
  angular.module('material.components.datepicker').factory('$$mdDateUtil', function() {
    return {
      getFirstDateOfMonth: getFirstDateOfMonth,
      getNumberOfDaysInMonth: getNumberOfDaysInMonth,
      getDateInNextMonth: getDateInNextMonth,
      getDateInPreviousMonth: getDateInPreviousMonth,
      isInNextMonth: isInNextMonth,
      isInPreviousMonth: isInPreviousMonth,
      getDateMidpoint: getDateMidpoint,
      isSameMonthAndYear: isSameMonthAndYear,
      getWeekOfMonth: getWeekOfMonth,
      incrementDays: incrementDays,
      incrementMonths: incrementMonths,
      getLastDateOfMonth: getLastDateOfMonth,
      isSameDay: isSameDay,
      getMonthDistance: getMonthDistance,
      isValidDate: isValidDate,
      setDateTimeToMidnight: setDateTimeToMidnight,
      createDateAtMidnight: createDateAtMidnight,
      isDateWithinRange: isDateWithinRange
    };

    /**
     * Gets the first day of the month for the given date's month.
     * @param {Date} date
     * @returns {Date}
     */
    function getFirstDateOfMonth(date) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    /**
     * Gets the number of days in the month for the given date's month.
     * @param date
     * @returns {number}
     */
    function getNumberOfDaysInMonth(date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    /**
     * Get an arbitrary date in the month after the given date's month.
     * @param date
     * @returns {Date}
     */
    function getDateInNextMonth(date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }

    /**
     * Get an arbitrary date in the month before the given date's month.
     * @param date
     * @returns {Date}
     */
    function getDateInPreviousMonth(date) {
      return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    }

    /**
     * Gets whether two dates have the same month and year.
     * @param {Date} d1
     * @param {Date} d2
     * @returns {boolean}
     */
    function isSameMonthAndYear(d1, d2) {
      return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
    }

    /**
     * Gets whether two dates are the same day (not not necesarily the same time).
     * @param {Date} d1
     * @param {Date} d2
     * @returns {boolean}
     */
    function isSameDay(d1, d2) {
      return d1.getDate() == d2.getDate() && isSameMonthAndYear(d1, d2);
    }

    /**
     * Gets whether a date is in the month immediately after some date.
     * @param {Date} startDate The date from which to compare.
     * @param {Date} endDate The date to check.
     * @returns {boolean}
     */
    function isInNextMonth(startDate, endDate) {
      var nextMonth = getDateInNextMonth(startDate);
      return isSameMonthAndYear(nextMonth, endDate);
    }

    /**
     * Gets whether a date is in the month immediately before some date.
     * @param {Date} startDate The date from which to compare.
     * @param {Date} endDate The date to check.
     * @returns {boolean}
     */
    function isInPreviousMonth(startDate, endDate) {
      var previousMonth = getDateInPreviousMonth(startDate);
      return isSameMonthAndYear(endDate, previousMonth);
    }

    /**
     * Gets the midpoint between two dates.
     * @param {Date} d1
     * @param {Date} d2
     * @returns {Date}
     */
    function getDateMidpoint(d1, d2) {
      return createDateAtMidnight((d1.getTime() + d2.getTime()) / 2);
    }

    /**
     * Gets the week of the month that a given date occurs in.
     * @param {Date} date
     * @returns {number} Index of the week of the month (zero-based).
     */
    function getWeekOfMonth(date) {
      var firstDayOfMonth = getFirstDateOfMonth(date);
      return Math.floor((firstDayOfMonth.getDay() + date.getDate() - 1) / 7);
    }

    /**
     * Gets a new date incremented by the given number of days. Number of days can be negative.
     * @param {Date} date
     * @param {number} numberOfDays
     * @returns {Date}
     */
    function incrementDays(date, numberOfDays) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + numberOfDays);
    }

    /**
     * Gets a new date incremented by the given number of months. Number of months can be negative.
     * If the date of the given month does not match the target month, the date will be set to the
     * last day of the month.
     * @param {Date} date
     * @param {number} numberOfMonths
     * @returns {Date}
     */
    function incrementMonths(date, numberOfMonths) {
      // If the same date in the target month does not actually exist, the Date object will
      // automatically advance *another* month by the number of missing days.
      // For example, if you try to go from Jan. 30 to Feb. 30, you'll end up on March 2.
      // So, we check if the month overflowed and go to the last day of the target month instead.
      var dateInTargetMonth = new Date(date.getFullYear(), date.getMonth() + numberOfMonths, 1);
      var numberOfDaysInMonth = getNumberOfDaysInMonth(dateInTargetMonth);
      if (numberOfDaysInMonth < date.getDate()) {
        dateInTargetMonth.setDate(numberOfDaysInMonth);
      } else {
        dateInTargetMonth.setDate(date.getDate());
      }

      return dateInTargetMonth;
    }

    /**
     * Get the integer distance between two months. This *only* considers the month and year
     * portion of the Date instances.
     *
     * @param {Date} start
     * @param {Date} end
     * @returns {number} Number of months between `start` and `end`. If `end` is before `start`
     *     chronologically, this number will be negative.
     */
    function getMonthDistance(start, end) {
      return (12 * (end.getFullYear() - start.getFullYear())) + (end.getMonth() - start.getMonth());
    }

    /**
     * Gets the last day of the month for the given date.
     * @param {Date} date
     * @returns {Date}
     */
    function getLastDateOfMonth(date) {
      return new Date(date.getFullYear(), date.getMonth(), getNumberOfDaysInMonth(date));
    }

    /**
     * Checks whether a date is valid.
     * @param {Date} date
     * @return {boolean} Whether the date is a valid Date.
     */
    function isValidDate(date) {
      return date != null && date.getTime && !isNaN(date.getTime());
    }

    /**
     * Sets a date's time to midnight.
     * @param {Date} date
     */
    function setDateTimeToMidnight(date) {
      if (isValidDate(date)) {
        date.setHours(0, 0, 0, 0);
      }
    }

    /**
     * Creates a date with the time set to midnight.
     * Drop-in replacement for two forms of the Date constructor:
     * 1. No argument for Date representing now.
     * 2. Single-argument value representing number of seconds since Unix Epoch.
     * @param {number=} opt_value
     * @return {Date} New date with time set to midnight.
     */
    function createDateAtMidnight(opt_value) {
      var date;
      if (angular.isUndefined(opt_value)) {
        date = new Date();
      } else {
        date = new Date(opt_value);
      }
      setDateTimeToMidnight(date);
      return date;
    }

     /**
      * Checks if a date is within a min and max range.
      * If minDate or maxDate are not dates, they are ignored.
      * @param {Date} date
      * @param {Date} minDate
      * @param {Date} maxDate
      */
     function isDateWithinRange(date, minDate, maxDate) {
       return (!angular.isDate(minDate) || minDate <= date) &&
           (!angular.isDate(maxDate) || maxDate >= date);
     }
  });
})();

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.dialog
 */
angular
  .module('material.components.dialog', [
    'material.core',
    'material.components.backdrop'
  ])
  .directive('mdDialog', MdDialogDirective)
  .provider('$mdDialog', MdDialogProvider);

function MdDialogDirective($$rAF, $mdTheming, $mdDialog) {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      $mdTheming(element);
      $$rAF(function() {
        var images;
        var content = element[0].querySelector('md-dialog-content');

        if (content) {
          images = content.getElementsByTagName('img');
          addOverflowClass();
          //-- delayed image loading may impact scroll height, check after images are loaded
          angular.element(images).on('load', addOverflowClass);
        }

        scope.$on('$destroy', function() {
          $mdDialog.destroy();
        });

        /**
         *
         */
        function addOverflowClass() {
          element.toggleClass('md-content-overflow', content.scrollHeight > content.clientHeight);
        }


      });
    }
  };
}
MdDialogDirective.$inject = ["$$rAF", "$mdTheming", "$mdDialog"];

/**
 * @ngdoc service
 * @name $mdDialog
 * @module material.components.dialog
 *
 * @description
 * `$mdDialog` opens a dialog over the app to inform users about critical information or require
 *  them to make decisions. There are two approaches for setup: a simple promise API
 *  and regular object syntax.
 *
 * ## Restrictions
 *
 * - The dialog is always given an isolate scope.
 * - The dialog's template must have an outer `<md-dialog>` element.
 *   Inside, use an `<md-dialog-content>` element for the dialog's content, and use
 *   an element with class `md-actions` for the dialog's actions.
 * - Dialogs must cover the entire application to keep interactions inside of them.
 * Use the `parent` option to change where dialogs are appended.
 *
 * ## Sizing
 * - Complex dialogs can be sized with `flex="percentage"`, i.e. `flex="66"`.
 * - Default max-width is 80% of the `rootElement` or `parent`.
 *
 * ## Css
 * - `.md-dialog-content` - class that sets the padding on the content as the spec file
 *
 * @usage
 * <hljs lang="html">
 * <div  ng-app="demoApp" ng-controller="EmployeeController">
 *   <div>
 *     <md-button ng-click="showAlert()" class="md-raised md-warn">
 *       Employee Alert!
 *       </md-button>
 *   </div>
 *   <div>
 *     <md-button ng-click="showDialog($event)" class="md-raised">
 *       Custom Dialog
 *       </md-button>
 *   </div>
 *   <div>
 *     <md-button ng-click="closeAlert()" ng-disabled="!hasAlert()" class="md-raised">
 *       Close Alert
 *     </md-button>
 *   </div>
 *   <div>
 *     <md-button ng-click="showGreeting($event)" class="md-raised md-primary" >
 *       Greet Employee
 *       </md-button>
 *   </div>
 * </div>
 * </hljs>
 *
 * ### JavaScript: object syntax
 * <hljs lang="js">
 * (function(angular, undefined){
 *   "use strict";
 *
 *   angular
 *    .module('demoApp', ['ngMaterial'])
 *    .controller('AppCtrl', AppController);
 *
 *   function AppController($scope, $mdDialog) {
 *     var alert;
 *     $scope.showAlert = showAlert;
 *     $scope.showDialog = showDialog;
 *     $scope.items = [1, 2, 3];
 *
 *     // Internal method
 *     function showAlert() {
 *       alert = $mdDialog.alert({
 *         title: 'Attention',
 *         content: 'This is an example of how easy dialogs can be!',
 *         ok: 'Close'
 *       });
 *
 *       $mdDialog
 *         .show( alert )
 *         .finally(function() {
 *           alert = undefined;
 *         });
 *     }
 *
 *     function showDialog($event) {
 *        var parentEl = angular.element(document.body);
 *        $mdDialog.show({
 *          parent: parentEl,
 *          targetEvent: $event,
 *          template:
 *            '<md-dialog aria-label="List dialog">' +
 *            '  <md-dialog-content>'+
 *            '    <md-list>'+
 *            '      <md-list-item ng-repeat="item in items">'+
 *            '       <p>Number {{item}}</p>' +
 *            '      </md-item>'+
 *            '    </md-list>'+
 *            '  </md-dialog-content>' +
 *            '  <div class="md-actions">' +
 *            '    <md-button ng-click="closeDialog()" class="md-primary">' +
 *            '      Close Dialog' +
 *            '    </md-button>' +
 *            '  </div>' +
 *            '</md-dialog>',
 *          locals: {
 *            items: $scope.items
 *          },
 *          controller: DialogController
 *       });
 *       function DialogController($scope, $mdDialog, items) {
 *         $scope.items = items;
 *         $scope.closeDialog = function() {
 *           $mdDialog.hide();
 *         }
 *       }
 *     }
 *   }
 * })(angular);
 * </hljs>
 *
 * ### JavaScript: promise API syntax, custom dialog template
 * <hljs lang="js">
 * (function(angular, undefined){
 *   "use strict";
 *
 *   angular
 *     .module('demoApp', ['ngMaterial'])
 *     .controller('EmployeeController', EmployeeEditor)
 *     .controller('GreetingController', GreetingController);
 *
 *   // Fictitious Employee Editor to show how to use simple and complex dialogs.
 *
 *   function EmployeeEditor($scope, $mdDialog) {
 *     var alert;
 *
 *     $scope.showAlert = showAlert;
 *     $scope.closeAlert = closeAlert;
 *     $scope.showGreeting = showCustomGreeting;
 *
 *     $scope.hasAlert = function() { return !!alert };
 *     $scope.userName = $scope.userName || 'Bobby';
 *
 *     // Dialog #1 - Show simple alert dialog and cache
 *     // reference to dialog instance
 *
 *     function showAlert() {
 *       alert = $mdDialog.alert()
 *         .title('Attention, ' + $scope.userName)
 *         .content('This is an example of how easy dialogs can be!')
 *         .ok('Close');
 *
 *       $mdDialog
 *           .show( alert )
 *           .finally(function() {
 *             alert = undefined;
 *           });
 *     }
 *
 *     // Close the specified dialog instance and resolve with 'finished' flag
 *     // Normally this is not needed, just use '$mdDialog.hide()' to close
 *     // the most recent dialog popup.
 *
 *     function closeAlert() {
 *       $mdDialog.hide( alert, "finished" );
 *       alert = undefined;
 *     }
 *
 *     // Dialog #2 - Demonstrate more complex dialogs construction and popup.
 *
 *     function showCustomGreeting($event) {
 *         $mdDialog.show({
 *           targetEvent: $event,
 *           template:
 *             '<md-dialog>' +
 *
 *             '  <md-dialog-content>Hello {{ employee }}!</md-dialog-content>' +
 *
 *             '  <div class="md-actions">' +
 *             '    <md-button ng-click="closeDialog()" class="md-primary">' +
 *             '      Close Greeting' +
 *             '    </md-button>' +
 *             '  </div>' +
 *             '</md-dialog>',
 *           controller: 'GreetingController',
 *           onComplete: afterShowAnimation,
 *           locals: { employee: $scope.userName }
 *         });
 *
 *         // When the 'enter' animation finishes...
 *
 *         function afterShowAnimation(scope, element, options) {
 *            // post-show code here: DOM element focus, etc.
 *         }
 *     }
 *
 *     // Dialog #3 - Demonstrate use of ControllerAs and passing $scope to dialog
 *     //             Here we used ng-controller="GreetingController as vm" and
 *     //             $scope.vm === <controller instance>
 *
 *     function showCustomGreeting() {
 *
 *        $mdDialog.show({
 *           clickOutsideToClose: true,
 *
 *           scope: $scope,        // use parent scope in template
 *           preserveScope: true,  // do not forget this if use parent scope

 *           // Since GreetingController is instantiated with ControllerAs syntax
 *           // AND we are passing the parent '$scope' to the dialog, we MUST
 *           // use 'vm.<xxx>' in the template markup
 *
 *           template: '<md-dialog>' +
 *                     '  <md-dialog-content>' +
 *                     '     Hi There {{vm.employee}}' +
 *                     '  </md-dialog-content>' +
 *                     '</md-dialog>',
 *
 *           controller: function DialogController($scope, $mdDialog) {
 *             $scope.closeDialog = function() {
 *               $mdDialog.hide();
 *             }
 *           }
 *        });
 *     }
 *
 *   }
 *
 *   // Greeting controller used with the more complex 'showCustomGreeting()' custom dialog
 *
 *   function GreetingController($scope, $mdDialog, employee) {
 *     // Assigned from construction <code>locals</code> options...
 *     $scope.employee = employee;
 *
 *     $scope.closeDialog = function() {
 *       // Easily hides most recent dialog shown...
 *       // no specific instance reference is needed.
 *       $mdDialog.hide();
 *     };
 *   }
 *
 * })(angular);
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdDialog#alert
 *
 * @description
 * Builds a preconfigured dialog with the specified message.
 *
 * @returns {obj} an `$mdDialogPreset` with the chainable configuration methods:
 *
 * - $mdDialogPreset#title(string) - sets title to string
 * - $mdDialogPreset#content(string) - sets content / message to string
 * - $mdDialogPreset#ok(string) - sets okay button text to string
 * - $mdDialogPreset#theme(string) - sets the theme of the dialog
 *
 */

/**
 * @ngdoc method
 * @name $mdDialog#confirm
 *
 * @description
 * Builds a preconfigured dialog with the specified message. You can call show and the promise returned
 * will be resolved only if the user clicks the confirm action on the dialog.
 *
 * @returns {obj} an `$mdDialogPreset` with the chainable configuration methods:
 *
 * Additionally, it supports the following methods:
 *
 * - $mdDialogPreset#title(string) - sets title to string
 * - $mdDialogPreset#content(string) - sets content / message to string
 * - $mdDialogPreset#ok(string) - sets okay button text to string
 * - $mdDialogPreset#cancel(string) - sets cancel button text to string
 * - $mdDialogPreset#theme(string) - sets the theme of the dialog
 *
 */

/**
 * @ngdoc method
 * @name $mdDialog#show
 *
 * @description
 * Show a dialog with the specified options.
 *
 * @param {object} optionsOrPreset Either provide an `$mdDialogPreset` returned from `alert()`, and
 * `confirm()`, or an options object with the following properties:
 *   - `templateUrl` - `{string=}`: The url of a template that will be used as the content
 *   of the dialog.
 *   - `template` - `{string=}`: Same as templateUrl, except this is an actual template string.
 *   - `autoWrap` - `{boolean=}`: Whether or not to automatically wrap the template with a
 *     `<md-dialog>` tag if one is not provided. Defaults to true. Can be disabled if you provide a
 *     custom dialog directive.
 *   - `targetEvent` - `{DOMClickEvent=}`: A click's event object. When passed in as an option,
 *     the location of the click will be used as the starting point for the opening animation
 *     of the the dialog.
 *   - `openFrom` - `{string|Element|object}`: The query selector, DOM element or the Rect object
 *     that is used to determine the bounds (top, left, height, width) from which the Dialog will
 *     originate.
 *   - `closeTo` - `{string|Element|object}`: The query selector, DOM element or the Rect object
 *     that is used to determine the bounds (top, left, height, width) to which the Dialog will
 *     target.
 *   - `scope` - `{object=}`: the scope to link the template / controller to. If none is specified,
 *     it will create a new isolate scope.
 *     This scope will be destroyed when the dialog is removed unless `preserveScope` is set to true.
 *   - `preserveScope` - `{boolean=}`: whether to preserve the scope when the element is removed. Default is false
 *   - `disableParentScroll` - `{boolean=}`: Whether to disable scrolling while the dialog is open.
 *     Default true.
 *   - `hasBackdrop` - `{boolean=}`: Whether there should be an opaque backdrop behind the dialog.
 *     Default true.
 *   - `clickOutsideToClose` - `{boolean=}`: Whether the user can click outside the dialog to
 *     close it. Default false.
 *   - `escapeToClose` - `{boolean=}`: Whether the user can press escape to close the dialog.
 *     Default true.
 *   - `focusOnOpen` - `{boolean=}`: An option to override focus behavior on open. Only disable if
 *     focusing some other way, as focus management is required for dialogs to be accessible.
 *     Defaults to true.
 *   - `controller` - `{string=}`: The controller to associate with the dialog. The controller
 *     will be injected with the local `$mdDialog`, which passes along a scope for the dialog.
 *   - `locals` - `{object=}`: An object containing key/value pairs. The keys will be used as names
 *     of values to inject into the controller. For example, `locals: {three: 3}` would inject
 *     `three` into the controller, with the value 3. If `bindToController` is true, they will be
 *     copied to the controller instead.
 *   - `bindToController` - `bool`: bind the locals to the controller, instead of passing them in.
 *     These values will not be available until after initialization.
 *   - `resolve` - `{object=}`: Similar to locals, except it takes promises as values, and the
 *     dialog will not open until all of the promises resolve.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the scope.
 *   - `parent` - `{element=}`: The element to append the dialog to. Defaults to appending
 *     to the root element of the application.
 *   - `onShowing` `{function=} Callback function used to announce the show() action is
 *     starting.
 *   - `onComplete` `{function=}`: Callback function used to announce when the show() action is
 *     finished.
 *   - `onRemoving` `{function=}`: Callback function used to announce the close/hide() action is
 *     starting. This allows developers to run custom animations in parallel the close animations.
 *
 * @returns {promise} A promise that can be resolved with `$mdDialog.hide()` or
 * rejected with `$mdDialog.cancel()`.
 */

/**
 * @ngdoc method
 * @name $mdDialog#hide
 *
 * @description
 * Hide an existing dialog and resolve the promise returned from `$mdDialog.show()`.
 *
 * @param {*=} response An argument for the resolved promise.
 *
 * @returns {promise} A promise that is resolved when the dialog has been closed.
 */

/**
 * @ngdoc method
 * @name $mdDialog#cancel
 *
 * @description
 * Hide an existing dialog and reject the promise returned from `$mdDialog.show()`.
 *
 * @param {*=} response An argument for the rejected promise.
 *
 * @returns {promise} A promise that is resolved when the dialog has been closed.
 */

function MdDialogProvider($$interimElementProvider) {

  advancedDialogOptions.$inject = ["$mdDialog", "$mdTheming"];
  dialogDefaultOptions.$inject = ["$mdDialog", "$mdAria", "$mdUtil", "$mdConstant", "$animate", "$document", "$window", "$rootElement"];
  return $$interimElementProvider('$mdDialog')
    .setDefaults({
      methods: ['disableParentScroll', 'hasBackdrop', 'clickOutsideToClose', 'escapeToClose', 'targetEvent', 'closeTo', 'openFrom', 'parent'],
      options: dialogDefaultOptions
    })
    .addPreset('alert', {
      methods: ['title', 'content', 'ariaLabel', 'ok', 'theme', 'css'],
      options: advancedDialogOptions
    })
    .addPreset('confirm', {
      methods: ['title', 'content', 'ariaLabel', 'ok', 'cancel', 'theme', 'css'],
      options: advancedDialogOptions
    });

  /* @ngInject */
  function advancedDialogOptions($mdDialog, $mdTheming) {
    return {
      template: [
        '<md-dialog md-theme="{{ dialog.theme }}" aria-label="{{ dialog.ariaLabel }}" ng-class="dialog.css">',
        ' <md-dialog-content class="md-dialog-content" role="document" tabIndex="-1">',
        '   <h2 class="md-title">{{ dialog.title }}</h2>',
        '   <div class="md-dialog-content-body" md-template="::dialog.mdContent"></div>',
        ' </md-dialog-content>',
        ' <div class="md-actions">',
        '   <md-button ng-if="dialog.$type == \'confirm\'"' +
        '     ng-click="dialog.abort()" class="md-primary">',
        '     {{ dialog.cancel }}',
        '   </md-button>',
        '   <md-button ng-click="dialog.hide()" class="md-primary" md-autofocus="dialog.$type!=\'confirm\'">',
        '     {{ dialog.ok }}',
        '   </md-button>',
        ' </div>',
        '</md-dialog>'
      ].join('').replace(/\s\s+/g, ''),
      controller: function mdDialogCtrl() {
        this.hide = function() {
          $mdDialog.hide(true);
        };
        this.abort = function() {
          $mdDialog.cancel();
        };
      },
      controllerAs: 'dialog',
      bindToController: true,
      theme: $mdTheming.defaultTheme()
    };
  }

  /* @ngInject */
  function dialogDefaultOptions($mdDialog, $mdAria, $mdUtil, $mdConstant, $animate, $document, $window, $rootElement) {
    return {
      hasBackdrop: true,
      isolateScope: true,
      onShow: onShow,
      onRemove: onRemove,
      clickOutsideToClose: false,
      escapeToClose: true,
      targetEvent: null,
      closeTo: null,
      openFrom: null,
      focusOnOpen: true,
      disableParentScroll: true,
      autoWrap: true,
      transformTemplate: function(template, options) {
        return '<div class="md-dialog-container">' + validatedTemplate(template) + '</div>';

        /**
         * The specified template should contain a <md-dialog> wrapper element....
         */
        function validatedTemplate(template) {
          if (options.autoWrap && !/<\/md-dialog>/g.test(template)) {
            return '<md-dialog>' + (template || '') + '</md-dialog>';
          } else {
            return template || '';
          }
        }
      }
    };

    /**
     * Show method for dialogs
     */
    function onShow(scope, element, options, controller) {
      angular.element($document[0].body).addClass('md-dialog-is-showing');

      wrapSimpleContent();

      captureParentAndFromToElements(options);
      configureAria(element.find('md-dialog'), options);
      showBackdrop(scope, element, options);

      return dialogPopIn(element, options)
        .then(function() {
          activateListeners(element, options);
          lockScreenReader(element, options);
          focusOnOpen();
        });

      /**
       * For alerts, focus on content... otherwise focus on
       * the close button (or equivalent)
       */
      function focusOnOpen() {
        if (options.focusOnOpen) {
          var target = $mdUtil.findFocusTarget(element) || findCloseButton();
          target.focus();
        }

        /**
         *  If no element with class dialog-close, try to find the last
         *  button child in md-actions and assume it is a close button
         */
        function findCloseButton() {
          var closeButton = element[0].querySelector('.dialog-close');
          if (!closeButton) {
            var actionButtons = element[0].querySelectorAll('.md-actions button');
            closeButton = actionButtons[actionButtons.length - 1];
          }
          return angular.element(closeButton);
        }
      }

      /**
       * Wrap any simple content [specified via .content("")] in <p></p> tags.
       * otherwise accept HTML content within the dialog content area...
       * NOTE: Dialog uses the md-template directive to safely inject HTML content.
       */
      function wrapSimpleContent() {
        if ( controller ) {
          var HTML_END_TAG = /<\/[\w-]*>/gm;
          var content = controller.content || options.content || "";

          var hasHTML = HTML_END_TAG.test(content);
          if (!hasHTML) {
            content = $mdUtil.supplant("<p>{0}</p>", [content]);
          }

          // Publish updated dialog content body... to be compiled by mdTemplate directive
          controller.mdContent = content;
        }
      }

    }

    /**
     * Remove function for all dialogs
     */
    function onRemove(scope, element, options) {
      options.deactivateListeners();
      options.unlockScreenReader();
      options.hideBackdrop(options.$destroy);

      // For navigation $destroy events, do a quick, non-animated removal,
      // but for normal closes (from clicks, etc) animate the removal

      return !!options.$destroy ? detachAndClean() : animateRemoval().then( detachAndClean );

      /**
       * For normal closes, animate the removal.
       * For forced closes (like $destroy events), skip the animations
       */
      function animateRemoval() {
        return dialogPopOut(element, options);
      }

      /**
       * Detach the element
       */
      function detachAndClean() {
        angular.element($document[0].body).removeClass('md-dialog-is-showing');
        element.remove();

        if (!options.$destroy) options.origin.focus();
      }
    }

    /**
     * Capture originator/trigger/from/to element information (if available)
     * and the parent container for the dialog; defaults to the $rootElement
     * unless overridden in the options.parent
     */
    function captureParentAndFromToElements(options) {
          options.origin = angular.extend({
            element: null,
            bounds: null,
            focus: angular.noop
          }, options.origin || {});

          options.parent   = getDomElement(options.parent, $rootElement);
          options.closeTo  = getBoundingClientRect(getDomElement(options.closeTo));
          options.openFrom = getBoundingClientRect(getDomElement(options.openFrom));

          if ( options.targetEvent ) {
            options.origin   = getBoundingClientRect(options.targetEvent.target, options.origin);
          }

          /**
           * Identify the bounding RECT for the target element
           *
           */
          function getBoundingClientRect (element, orig) {
            var source = angular.element((element || {}));
            if (source && source.length) {
              // Compute and save the target element's bounding rect, so that if the
              // element is hidden when the dialog closes, we can shrink the dialog
              // back to the same position it expanded from.
              //
              // Checking if the source is a rect object or a DOM element
              var bounds = {top:0,left:0,height:0,width:0};
              var hasFn = angular.isFunction(source[0].getBoundingClientRect);

              return angular.extend(orig || {}, {
                  element : hasFn ? source : undefined,
                  bounds  : hasFn ? source[0].getBoundingClientRect() : angular.extend({}, bounds, source[0]),
                  focus   : angular.bind(source, source.focus),
              });
            }
          }

          /**
           * If the specifier is a simple string selector, then query for
           * the DOM element.
           */
          function getDomElement(element, defaultElement) {
            if (angular.isString(element)) {
              var simpleSelector = element,
                container = $document[0].querySelectorAll(simpleSelector);
                element = container.length ? container[0] : null;
            }

            // If we have a reference to a raw dom element, always wrap it in jqLite
            return angular.element(element || defaultElement);
          }


        }

    /**
     * Listen for escape keys and outside clicks to auto close
     */
    function activateListeners(element, options) {
      var window = angular.element($window);
      var onWindowResize = $mdUtil.debounce(function(){
        stretchDialogContainerToViewport(element, options);
      }, 60);

      var removeListeners = [];
      var smartClose = function() {
        // Only 'confirm' dialogs have a cancel button... escape/clickOutside will
        // cancel or fallback to hide.
        var closeFn = ( options.$type == 'alert' ) ? $mdDialog.hide : $mdDialog.cancel;
        $mdUtil.nextTick(closeFn, true);
      };

      if (options.escapeToClose) {
        var target = options.parent;
        var keyHandlerFn = function(ev) {
          if (ev.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
            ev.stopPropagation();
            ev.preventDefault();

            smartClose();
          }
        };

        // Add keydown listeners
        element.on('keydown', keyHandlerFn);
        target.on('keydown', keyHandlerFn);
        window.on('resize', onWindowResize);

        // Queue remove listeners function
        removeListeners.push(function() {

          element.off('keydown', keyHandlerFn);
          target.off('keydown', keyHandlerFn);
          window.off('resize', onWindowResize);

        });
      }
      if (options.clickOutsideToClose) {
        var target = element;
        var sourceElem;

        // Keep track of the element on which the mouse originally went down
        // so that we can only close the backdrop when the 'click' started on it.
        // A simple 'click' handler does not work,
        // it sets the target object as the element the mouse went down on.
        var mousedownHandler = function(ev) {
          sourceElem = ev.target;
        };

        // We check if our original element and the target is the backdrop
        // because if the original was the backdrop and the target was inside the dialog
        // we don't want to dialog to close.
        var mouseupHandler = function(ev) {
          if (sourceElem === target[0] && ev.target === target[0]) {
            ev.stopPropagation();
            ev.preventDefault();

            smartClose();
          }
        };

        // Add listeners
        target.on('mousedown', mousedownHandler);
        target.on('mouseup', mouseupHandler);

        // Queue remove listeners function
        removeListeners.push(function() {
          target.off('mousedown', mousedownHandler);
          target.off('mouseup', mouseupHandler);
        });
      }

      // Attach specific `remove` listener handler
      options.deactivateListeners = function() {
        removeListeners.forEach(function(removeFn) {
          removeFn();
        });
        options.deactivateListeners = null;
      };
    }

    /**
     * Show modal backdrop element...
     */
    function showBackdrop(scope, element, options) {

      if (options.disableParentScroll) {
        // !! DO this before creating the backdrop; since disableScrollAround()
        //    configures the scroll offset; which is used by mdBackDrop postLink()
        options.restoreScroll = $mdUtil.disableScrollAround(element, options.parent);
      }

      if (options.hasBackdrop) {
        options.backdrop = $mdUtil.createBackdrop(scope, "md-dialog-backdrop md-opaque");
        $animate.enter(options.backdrop, options.parent);
      }

      /**
       * Hide modal backdrop element...
       */
      options.hideBackdrop = function hideBackdrop($destroy) {
        if (options.backdrop) {
          if ( !!$destroy ) options.backdrop.remove();
          else              $animate.leave(options.backdrop);
        }

        if (options.disableParentScroll) {
          options.restoreScroll();
          delete options.restoreScroll;
        }

        options.hideBackdrop = null;
      }
    }

    /**
     * Inject ARIA-specific attributes appropriate for Dialogs
     */
    function configureAria(element, options) {

      var role = (options.$type === 'alert') ? 'alertdialog' : 'dialog';
      var dialogContent = element.find('md-dialog-content');
      var dialogId = element.attr('id') || ('dialog_' + $mdUtil.nextUid());

      element.attr({
        'role': role,
        'tabIndex': '-1'
      });

      if (dialogContent.length === 0) {
        dialogContent = element;
      }

      dialogContent.attr('id', dialogId);
      element.attr('aria-describedby', dialogId);

      if (options.ariaLabel) {
        $mdAria.expect(element, 'aria-label', options.ariaLabel);
      }
      else {
        $mdAria.expectAsync(element, 'aria-label', function() {
          var words = dialogContent.text().split(/\s+/);
          if (words.length > 3) words = words.slice(0, 3).concat('...');
          return words.join(' ');
        });
      }
    }

    /**
     * Prevents screen reader interaction behind modal window
     * on swipe interfaces
     */
    function lockScreenReader(element, options) {
      var isHidden = true;

      // get raw DOM node
      walkDOM(element[0]);

      options.unlockScreenReader = function() {
        isHidden = false;
        walkDOM(element[0]);

        options.unlockScreenReader = null;
      };

      /**
       * Walk DOM to apply or remove aria-hidden on sibling nodes
       * and parent sibling nodes
       *
       */
      function walkDOM(element) {
        while (element.parentNode) {
          if (element === document.body) {
            return;
          }
          var children = element.parentNode.children;
          for (var i = 0; i < children.length; i++) {
            // skip over child if it is an ascendant of the dialog
            // or a script or style tag
            if (element !== children[i] && !isNodeOneOf(children[i], ['SCRIPT', 'STYLE'])) {
              children[i].setAttribute('aria-hidden', isHidden);
            }
          }

          walkDOM(element = element.parentNode);
        }
      }
    }

    /**
     * Ensure the dialog container fill-stretches to the viewport
     */
    function stretchDialogContainerToViewport(container, options) {

      var isFixed = $window.getComputedStyle($document[0].body).position == 'fixed';
      var backdrop = options.backdrop ? $window.getComputedStyle(options.backdrop[0]) : null;
      var height = backdrop ? Math.min($document[0].body.clientHeight, Math.ceil(Math.abs(parseInt(backdrop.height, 10)))) : 0;

      container.css({
        top: (isFixed ? $mdUtil.scrollTop(options.parent) : 0) + 'px',
        height: height ? height + 'px' : '100%'
      });

      return container;
    }

    /**
     *  Dialog open and pop-in animation
     */
    function dialogPopIn(container, options) {

      // Add the `md-dialog-container` to the DOM
      options.parent.append(container);
      stretchDialogContainerToViewport(container, options);

      var dialogEl = container.find('md-dialog');
      var animator = $mdUtil.dom.animator;
      var buildTranslateToOrigin = animator.calculateZoomToOrigin;
      var translateOptions = {transitionInClass: 'md-transition-in', transitionOutClass: 'md-transition-out'};
      var from = animator.toTransformCss(buildTranslateToOrigin(dialogEl, options.openFrom || options.origin));
      var to = animator.toTransformCss("");  // defaults to center display (or parent or $rootElement)

      return animator
        .translate3d(dialogEl, from, to, translateOptions)
        .then(function(animateReversal) {
          // Build a reversal translate function synched to this translation...
          options.reverseAnimate = function() {
            delete options.reverseAnimate;

            if (options.closeTo) {
              // Using the opposite classes to create a close animation to the closeTo element
              translateOptions = {transitionInClass: 'md-transition-out', transitionOutClass: 'md-transition-in'};
              from = to;
              to = animator.toTransformCss(buildTranslateToOrigin(dialogEl, options.closeTo));

              return animator
                .translate3d(dialogEl, from, to,translateOptions);
            }

            return animateReversal(
              animator.toTransformCss(
                // in case the origin element has moved or is hidden,
                // let's recalculate the translateCSS
                buildTranslateToOrigin(dialogEl, options.origin)
              )
            );

          };
          return true;
        });
    }

    /**
     * Dialog close and pop-out animation
     */
    function dialogPopOut(container, options) {
      return options.reverseAnimate();
    }

    /**
     * Utility function to filter out raw DOM nodes
     */
    function isNodeOneOf(elem, nodeTypeArray) {
      if (nodeTypeArray.indexOf(elem.nodeName) !== -1) {
        return true;
      }
    }

  }
}
MdDialogProvider.$inject = ["$$interimElementProvider"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.divider
 * @description Divider module!
 */
angular.module('material.components.divider', [
  'material.core'
])
  .directive('mdDivider', MdDividerDirective);

/**
 * @ngdoc directive
 * @name mdDivider
 * @module material.components.divider
 * @restrict E
 *
 * @description
 * Dividers group and separate content within lists and page layouts using strong visual and spatial distinctions. This divider is a thin rule, lightweight enough to not distract the user from content.
 *
 * @param {boolean=} md-inset Add this attribute to activate the inset divider style.
 * @usage
 * <hljs lang="html">
 * <md-divider></md-divider>
 *
 * <md-divider md-inset></md-divider>
 * </hljs>
 *
 */
function MdDividerDirective($mdTheming) {
  return {
    restrict: 'E',
    link: $mdTheming
  };
}
MdDividerDirective.$inject = ["$mdTheming"];

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.fabActions
   */
  angular
    .module('material.components.fabActions', ['material.core'])
    .directive('mdFabActions', MdFabActionsDirective);

  /**
   * @ngdoc directive
   * @name mdFabActions
   * @module material.components.fabActions
   *
   * @restrict E
   *
   * @description
   * The `<md-fab-actions>` directive is used inside of a `<md-fab-speed-dial>` or
   * `<md-fab-toolbar>` directive to mark an element (or elements) as the actions and setup the
   * proper event listeners.
   *
   * @usage
   * See the `<md-fab-speed-dial>` or `<md-fab-toolbar>` directives for example usage.
   */
  function MdFabActionsDirective() {
    return {
      restrict: 'E',

      require: ['^?mdFabSpeedDial', '^?mdFabToolbar'],

      compile: function(element, attributes) {
        var children = element.children();

        var hasNgRepeat = false;

        angular.forEach(['', 'data-', 'x-'], function(prefix) {
          hasNgRepeat = hasNgRepeat || (children.attr(prefix + 'ng-repeat') ? true : false);
        });

        // Support both ng-repeat and static content
        if (hasNgRepeat) {
          children.addClass('md-fab-action-item');
        } else {
          // Wrap every child in a new div and add a class that we can scale/fling independently
          children.wrap('<div class="md-fab-action-item">');
        }
      }
    }
  }

})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  angular.module('material.components.fabShared', ['material.core'])
    .controller('FabController', FabController);

  function FabController($scope, $element, $animate, $mdUtil, $mdConstant, $timeout) {
    var vm = this;

    // NOTE: We use async evals below to avoid conflicts with any existing digest loops

    vm.open = function() {
      $scope.$evalAsync("vm.isOpen = true");
    };

    vm.close = function() {
      // Async eval to avoid conflicts with existing digest loops
      $scope.$evalAsync("vm.isOpen = false");

      // Focus the trigger when the element closes so users can still tab to the next item
      $element.find('md-fab-trigger')[0].focus();
    };

    // Toggle the open/close state when the trigger is clicked
    vm.toggle = function() {
      $scope.$evalAsync("vm.isOpen = !vm.isOpen");
    };

    setupDefaults();
    setupListeners();
    setupWatchers();
    fireInitialAnimations();

    function setupDefaults() {
      // Set the default direction to 'down' if none is specified
      vm.direction = vm.direction || 'down';

      // Set the default to be closed
      vm.isOpen = vm.isOpen || false;

      // Start the keyboard interaction at the first action
      resetActionIndex();
    }

    function setupListeners() {
      var eventTypes = [
        '$md.pressdown',

        'click', // Fired via keyboard ENTER

        'focusin', 'focusout'
      ];

      // Add our listeners
      angular.forEach(eventTypes, function(eventType) {
        $element.on(eventType, parseEvents);
      });

      // Remove our listeners when destroyed
      $scope.$on('$destroy', function() {
        angular.forEach(eventTypes, function(eventType) {
          $element.off(eventType, parseEvents);
        });

        // remove any attached keyboard handlers in case element is removed while
        // speed dial is open
        disableKeyboard();
      });
    }

    var recentEvent;
    function parseEvents(event) {
      // If we've had a recent press/click event, or material is sending us an additional event,
      // ignore it
      if (recentEvent && (isClick(recentEvent) || recentEvent.$material)) {
        return;
      }

      // Otherwise, handle our events
      if (isClick(event)) {
        handleItemClick(event);

        // Store our recent click event
        recentEvent = event;
      } else if (event.type == 'focusin') {
        vm.open();
      } else if (event.type == 'focusout') {
        vm.close();
      }

      // Clear the recent event after all others have fired so we stop ignoring
      $timeout(function() {
        recentEvent = null;
      }, 100, false);
    }

    function isClick(event) {
      return event.type == '$md.pressdown' || event.type == 'click';
    }

    function resetActionIndex() {
      vm.currentActionIndex = -1;
    }

    function setupWatchers() {
      // Watch for changes to the direction and update classes/attributes
      $scope.$watch('vm.direction', function(newDir, oldDir) {
        // Add the appropriate classes so we can target the direction in the CSS
        $animate.removeClass($element, 'md-' + oldDir);
        $animate.addClass($element, 'md-' + newDir);

        // Reset the action index since it may have changed
        resetActionIndex();
      });

      var trigger, actions;

      // Watch for changes to md-open
      $scope.$watch('vm.isOpen', function(isOpen) {
        // Reset the action index since it may have changed
        resetActionIndex();

        // We can't get the trigger/actions outside of the watch because the component hasn't been
        // linked yet, so we wait until the first watch fires to cache them.
        if (!trigger || !actions) {
          trigger = getTriggerElement();
          actions = getActionsElement();
        }

        if (isOpen) {
          enableKeyboard();
        } else {
          disableKeyboard();
        }

        var toAdd = isOpen ? 'md-is-open' : '';
        var toRemove = isOpen ? '' : 'md-is-open';

        // Set the proper ARIA attributes
        trigger.attr('aria-haspopup', true);
        trigger.attr('aria-expanded', isOpen);
        actions.attr('aria-hidden', !isOpen);

        // Animate the CSS classes
        $animate.setClass($element, toAdd, toRemove);
      });
    }

    // Fire the animations once in a separate digest loop to initialize them
    function fireInitialAnimations() {
      $mdUtil.nextTick(function() {
        $animate.addClass($element, 'md-noop');
      });
    }

    function enableKeyboard() {
      angular.element(document).on('keydown', keyPressed);

      // TODO: On desktop, we should be able to reset the indexes so you cannot tab through
      //resetActionTabIndexes();
    }

    function disableKeyboard() {
      angular.element(document).off('keydown', keyPressed);
    }

    function keyPressed(event) {
      switch (event.which) {
        case $mdConstant.KEY_CODE.SPACE: event.preventDefault(); return false;
        case $mdConstant.KEY_CODE.ESCAPE: vm.close(); event.preventDefault(); return false;
        case $mdConstant.KEY_CODE.LEFT_ARROW: doKeyLeft(event); return false;
        case $mdConstant.KEY_CODE.UP_ARROW: doKeyUp(event); return false;
        case $mdConstant.KEY_CODE.RIGHT_ARROW: doKeyRight(event); return false;
        case $mdConstant.KEY_CODE.DOWN_ARROW: doKeyDown(event); return false;
      }
    }

    function doActionPrev(event) {
      focusAction(event, -1);
    }

    function doActionNext(event) {
      focusAction(event, 1);
    }

    function focusAction(event, direction) {
      var actions = resetActionTabIndexes();

      // Increment/decrement the counter with restrictions
      vm.currentActionIndex = vm.currentActionIndex + direction;
      vm.currentActionIndex = Math.min(actions.length - 1, vm.currentActionIndex);
      vm.currentActionIndex = Math.max(0, vm.currentActionIndex);

      // Focus the element
      var focusElement =  angular.element(actions[vm.currentActionIndex]).children()[0];
      angular.element(focusElement).attr('tabindex', 0);
      focusElement.focus();

      // Make sure the event doesn't bubble and cause something else
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function resetActionTabIndexes() {
      // Grab all of the actions
      var actions = getActionsElement()[0].querySelectorAll('.md-fab-action-item');

      // Disable all other actions for tabbing
      angular.forEach(actions, function(action) {
        angular.element(angular.element(action).children()[0]).attr('tabindex', -1);
      });

      return actions;
    }

    function doKeyLeft(event) {
      if (vm.direction === 'left') {
        doActionNext(event);
      } else {
        doActionPrev(event);
      }
    }

    function doKeyUp(event) {
      if (vm.direction === 'down') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function doKeyRight(event) {
      if (vm.direction === 'left') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function doKeyDown(event) {
      if (vm.direction === 'up') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function isTrigger(element) {
      return $mdUtil.getClosest(element, 'md-fab-trigger');
    }

    function isAction(element) {
      return $mdUtil.getClosest(element, 'md-fab-actions');
    }

    function handleItemClick(event) {
      if (isTrigger(event.target)) {
        vm.toggle();
      }

      if (isAction(event.target)) {
        vm.close();
      }
    }

    function getTriggerElement() {
      return $element.find('md-fab-trigger');
    }

    function getActionsElement() {
      return $element.find('md-fab-actions');
    }
  }
  FabController.$inject = ["$scope", "$element", "$animate", "$mdUtil", "$mdConstant", "$timeout"];
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.fabSpeedDial
   */
  angular
    // Declare our module
    .module('material.components.fabSpeedDial', [
      'material.core',
      'material.components.fabShared',
      'material.components.fabTrigger',
      'material.components.fabActions'
    ])

    // Register our directive
    .directive('mdFabSpeedDial', MdFabSpeedDialDirective)

    // Register our custom animations
    .animation('.md-fling', MdFabSpeedDialFlingAnimation)
    .animation('.md-scale', MdFabSpeedDialScaleAnimation)

    // Register a service for each animation so that we can easily inject them into unit tests
    .service('mdFabSpeedDialFlingAnimation', MdFabSpeedDialFlingAnimation)
    .service('mdFabSpeedDialScaleAnimation', MdFabSpeedDialScaleAnimation);

  /**
   * @ngdoc directive
   * @name mdFabSpeedDial
   * @module material.components.fabSpeedDial
   *
   * @restrict E
   *
   * @description
   * The `<md-fab-speed-dial>` directive is used to present a series of popup elements (usually
   * `<md-button>`s) for quick access to common actions.
   *
   * There are currently two animations available by applying one of the following classes to
   * the component:
   *
   *  - `md-fling` - The speed dial items appear from underneath the trigger and move into their
   *    appropriate positions.
   *  - `md-scale` - The speed dial items appear in their proper places by scaling from 0% to 100%.
   *
   * You may also easily position the trigger by applying one one of the following classes to the
   * `<md-fab-speed-dial>` element:
   *  - `md-fab-top-left`
   *  - `md-fab-top-right`
   *  - `md-fab-bottom-left`
   *  - `md-fab-bottom-right`
   *
   * These CSS classes use `position: absolute`, so you need to ensure that the container element
   * also uses `position: absolute` or `position: relative` in order for them to work.
   *
   * Additionally, you may use the standard `ng-mouseenter` and `ng-mouseleave` directives to
   * open or close the speed dial. However, if you wish to allow users to hover over the empty
   * space where the actions will appear, you must also add the `md-hover-full` class to the speed
   * dial element. Without this, the hover effect will only occur on top of the trigger.
   *
   * @usage
   * <hljs lang="html">
   * <md-fab-speed-dial md-direction="up" class="md-fling">
   *   <md-fab-trigger>
   *     <md-button aria-label="Add..."><md-icon icon="/img/icons/plus.svg"></md-icon></md-button>
   *   </md-fab-trigger>
   *
   *   <md-fab-actions>
   *     <md-button aria-label="Add User">
   *       <md-icon icon="/img/icons/user.svg"></md-icon>
   *     </md-button>
   *
   *     <md-button aria-label="Add Group">
   *       <md-icon icon="/img/icons/group.svg"></md-icon>
   *     </md-button>
   *   </md-fab-actions>
   * </md-fab-speed-dial>
   * </hljs>
   *
   * @param {string} md-direction From which direction you would like the speed dial to appear
   * relative to the trigger element.
   * @param {expression=} md-open Programmatically control whether or not the speed-dial is visible.
   */
  function MdFabSpeedDialDirective() {
    return {
      restrict: 'E',

      scope: {
        direction: '@?mdDirection',
        isOpen: '=?mdOpen'
      },

      bindToController: true,
      controller: 'FabController',
      controllerAs: 'vm',

      link: FabSpeedDialLink
    };

    function FabSpeedDialLink(scope, element) {
      // Prepend an element to hold our CSS variables so we can use them in the animations below
      element.prepend('<div class="md-css-variables"></div>');
    }
  }

  function MdFabSpeedDialFlingAnimation() {
    function runAnimation(element) {
      var el = element[0];
      var ctrl = element.controller('mdFabSpeedDial');
      var items = el.querySelectorAll('.md-fab-action-item');

      // Grab our trigger element
      var triggerElement = el.querySelector('md-fab-trigger');

      // Grab our element which stores CSS variables
      var variablesElement = el.querySelector('.md-css-variables');

      // Setup JS variables based on our CSS variables
      var startZIndex = parseInt(window.getComputedStyle(variablesElement).zIndex);

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        var styles = item.style;

        styles.transform = styles.webkitTransform = '';
        styles.transitionDelay = '';
        styles.opacity = 1;

        // Make the items closest to the trigger have the highest z-index
        styles.zIndex = (items.length - index) + startZIndex;
      });

      // Set the trigger to be above all of the actions so they disappear behind it.
      triggerElement.style.zIndex = startZIndex + items.length + 1;

      // If the control is closed, hide the items behind the trigger
      if (!ctrl.isOpen) {
        angular.forEach(items, function(item, index) {
          var newPosition, axis;
          var styles = item.style;

          switch (ctrl.direction) {
            case 'up':
              newPosition = item.scrollHeight * (index + 1);
              axis = 'Y';
              break;
            case 'down':
              newPosition = -item.scrollHeight * (index + 1);
              axis = 'Y';
              break;
            case 'left':
              newPosition = item.scrollWidth * (index + 1);
              axis = 'X';
              break;
            case 'right':
              newPosition = -item.scrollWidth * (index + 1);
              axis = 'X';
              break;
          }

          var newTranslate = 'translate' + axis + '(' + newPosition + 'px)';

          styles.transform = styles.webkitTransform = newTranslate;
        });
      }
    }

    return {
      addClass: function(element, className, done) {
        if (element.hasClass('md-fling')) {
          runAnimation(element);
          done();
        }
      },
      removeClass: function(element, className, done) {
        runAnimation(element);
        done();
      }
    }
  }

  function MdFabSpeedDialScaleAnimation() {
    var delay = 65;

    function runAnimation(element) {
      var el = element[0];
      var ctrl = element.controller('mdFabSpeedDial');
      var items = el.querySelectorAll('.md-fab-action-item');

      // Grab our element which stores CSS variables
      var variablesElement = el.querySelector('.md-css-variables');

      // Setup JS variables based on our CSS variables
      var startZIndex = parseInt(window.getComputedStyle(variablesElement).zIndex);

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        var styles = item.style,
          offsetDelay = index * delay;

        styles.opacity = ctrl.isOpen ? 1 : 0;
        styles.transform = styles.webkitTransform = ctrl.isOpen ? 'scale(1)' : 'scale(0.1)';
        styles.transitionDelay = (ctrl.isOpen ? offsetDelay : (items.length - offsetDelay)) + 'ms';

        // Make the items closest to the trigger have the highest z-index
        styles.zIndex = (items.length - index) + startZIndex;
      });
    }

    return {
      addClass: function(element, className, done) {
        runAnimation(element);
        done();
      },

      removeClass: function(element, className, done) {
        runAnimation(element);
        done();
      }
    }
  }
})();

})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.fabToolbar
   */
  angular
    // Declare our module
    .module('material.components.fabToolbar', [
      'material.core',
      'material.components.fabShared',
      'material.components.fabTrigger',
      'material.components.fabActions'
    ])

    // Register our directive
    .directive('mdFabToolbar', MdFabToolbarDirective)

    // Register our custom animations
    .animation('.md-fab-toolbar', MdFabToolbarAnimation)

    // Register a service for the animation so that we can easily inject it into unit tests
    .service('mdFabToolbarAnimation', MdFabToolbarAnimation);

  /**
   * @ngdoc directive
   * @name mdFabToolbar
   * @module material.components.fabToolbar
   *
   * @restrict E
   *
   * @description
   *
   * The `<md-fab-toolbar>` directive is used present a toolbar of elements (usually `<md-button>`s)
   * for quick access to common actions when a floating action button is activated (via click or
   * keyboard navigation).
   *
   * You may also easily position the trigger by applying one one of the following classes to the
   * `<md-fab-toolbar>` element:
   *  - `md-fab-top-left`
   *  - `md-fab-top-right`
   *  - `md-fab-bottom-left`
   *  - `md-fab-bottom-right`
   *
   * These CSS classes use `position: absolute`, so you need to ensure that the container element
   * also uses `position: absolute` or `position: relative` in order for them to work.
   *
   * @usage
   *
   * <hljs lang="html">
   * <md-fab-toolbar md-direction='left'>
   *   <md-fab-trigger>
   *     <md-button aria-label="Add..."><md-icon icon="/img/icons/plus.svg"></md-icon></md-button>
   *   </md-fab-trigger>
   *
   *   <md-fab-actions>
   *     <md-button aria-label="Add User">
   *       <md-icon icon="/img/icons/user.svg"></md-icon>
   *     </md-button>
   *
   *     <md-button aria-label="Add Group">
   *       <md-icon icon="/img/icons/group.svg"></md-icon>
   *     </md-button>
   *   </md-fab-actions>
   * </md-fab-toolbar>
   * </hljs>
   *
   * @param {string} md-direction From which direction you would like the toolbar items to appear
   * relative to the trigger element. Supports `left` and `right` directions.
   * @param {expression=} md-open Programmatically control whether or not the toolbar is visible.
   */
  function MdFabToolbarDirective() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="md-fab-toolbar-wrapper">' +
      '  <div class="md-fab-toolbar-content" ng-transclude></div>' +
      '</div>',

      scope: {
        direction: '@?mdDirection',
        isOpen: '=?mdOpen'
      },

      bindToController: true,
      controller: 'FabController',
      controllerAs: 'vm',

      link: link
    };

    function link(scope, element, attributes) {
      // Add the base class for animations
      element.addClass('md-fab-toolbar');

      // Prepend the background element to the trigger's button
      element.find('md-fab-trigger').find('button')
        .prepend('<div class="md-fab-toolbar-background"></div>');
    }
  }

  function MdFabToolbarAnimation() {

    function runAnimation(element, className, done) {
      // If no className was specified, don't do anything
      if (!className) {
        return;
      }

      var el = element[0];
      var ctrl = element.controller('mdFabToolbar');

      // Grab the relevant child elements
      var backgroundElement = el.querySelector('.md-fab-toolbar-background');
      var triggerElement = el.querySelector('md-fab-trigger button');
      var toolbarElement = el.querySelector('md-toolbar');
      var iconElement = el.querySelector('md-fab-trigger button md-icon');
      var actions = element.find('md-fab-actions').children();

      // If we have both elements, use them to position the new background
      if (triggerElement && backgroundElement) {
        // Get our variables
        var color = window.getComputedStyle(triggerElement).getPropertyValue('background-color');
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        // Make it twice as big as it should be since we scale from the center
        var scale = 2 * (width / triggerElement.offsetWidth);

        // Set some basic styles no matter what animation we're doing
        backgroundElement.style.backgroundColor = color;
        backgroundElement.style.borderRadius = width + 'px';

        // If we're open
        if (ctrl.isOpen) {
          // Turn on toolbar pointer events when closed
          toolbarElement.style.pointerEvents = 'initial';

          backgroundElement.style.width = triggerElement.offsetWidth + 'px';
          backgroundElement.style.height = triggerElement.offsetHeight + 'px';
          backgroundElement.style.transform = 'scale(' + scale + ')';

          // Set the next close animation to have the proper delays
          backgroundElement.style.transitionDelay = '0ms';
          iconElement && (iconElement.style.transitionDelay = '.3s');

          // Apply a transition delay to actions
          angular.forEach(actions, function(action, index) {
            action.style.transitionDelay = (actions.length - index) * 25 + 'ms';
          });
        } else {
          // Turn off toolbar pointer events when closed
          toolbarElement.style.pointerEvents = 'none';

          // Scale it back down to the trigger's size
          backgroundElement.style.transform = 'scale(1)';

          // Reset the position
          backgroundElement.style.top = '0';

          if (element.hasClass('md-right')) {
            backgroundElement.style.left = '0';
            backgroundElement.style.right = null;
          }

          if (element.hasClass('md-left')) {
            backgroundElement.style.right = '0';
            backgroundElement.style.left = null;
          }

          // Set the next open animation to have the proper delays
          backgroundElement.style.transitionDelay = '200ms';
          iconElement && (iconElement.style.transitionDelay = '0ms');

          // Apply a transition delay to actions
          angular.forEach(actions, function(action, index) {
            action.style.transitionDelay = 200 + (index * 25) + 'ms';
          });
        }
      }
    }

    return {
      addClass: function(element, className, done) {
        runAnimation(element, className, done);
        done();
      },

      removeClass: function(element, className, done) {
        runAnimation(element, className, done);
        done();
      }
    }
  }
})();
})();
(function(){
"use strict";

(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.fabTrigger
   */
  angular
    .module('material.components.fabTrigger', ['material.core'])
    .directive('mdFabTrigger', MdFabTriggerDirective);

  /**
   * @ngdoc directive
   * @name mdFabTrigger
   * @module material.components.fabSpeedDial
   *
   * @restrict E
   *
   * @description
   * The `<md-fab-trigger>` directive is used inside of a `<md-fab-speed-dial>` or
   * `<md-fab-toolbar>` directive to mark an element (or elements) as the trigger and setup the
   * proper event listeners.
   *
   * @usage
   * See the `<md-fab-speed-dial>` or `<md-fab-toolbar>` directives for example usage.
   */
  function MdFabTriggerDirective() {
    // TODO: Remove this completely?
    return {
      restrict: 'E',

      require: ['^?mdFabSpeedDial', '^?mdFabToolbar']
    };
  }
})();


})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.gridList
 */
angular.module('material.components.gridList', ['material.core'])
       .directive('mdGridList', GridListDirective)
       .directive('mdGridTile', GridTileDirective)
       .directive('mdGridTileFooter', GridTileCaptionDirective)
       .directive('mdGridTileHeader', GridTileCaptionDirective)
       .factory('$mdGridLayout', GridLayoutFactory);

/**
 * @ngdoc directive
 * @name mdGridList
 * @module material.components.gridList
 * @restrict E
 * @description
 * Grid lists are an alternative to standard list views. Grid lists are distinct
 * from grids used for layouts and other visual presentations.
 *
 * A grid list is best suited to presenting a homogenous data type, typically
 * images, and is optimized for visual comprehension and differentiating between
 * like data types.
 *
 * A grid list is a continuous element consisting of tessellated, regular
 * subdivisions called cells that contain tiles (`md-grid-tile`).
 *
 * <img src="//material-design.storage.googleapis.com/publish/v_2/material_ext_publish/0Bx4BSt6jniD7OVlEaXZ5YmU1Xzg/components_grids_usage2.png"
 *    style="width: 300px; height: auto; margin-right: 16px;" alt="Concept of grid explained visually">
 * <img src="//material-design.storage.googleapis.com/publish/v_2/material_ext_publish/0Bx4BSt6jniD7VGhsOE5idWlJWXM/components_grids_usage3.png"
 *    style="width: 300px; height: auto;" alt="Grid concepts legend">
 *
 * Cells are arrayed vertically and horizontally within the grid.
 *
 * Tiles hold content and can span one or more cells vertically or horizontally.
 *
 * ### Responsive Attributes
 *
 * The `md-grid-list` directive supports "responsive" attributes, which allow
 * different `md-cols`, `md-gutter` and `md-row-height` values depending on the
 * currently matching media query (as defined in `$mdConstant.MEDIA`).
 *
 * In order to set a responsive attribute, first define the fallback value with
 * the standard attribute name, then add additional attributes with the
 * following convention: `{base-attribute-name}-{media-query-name}="{value}"`
 * (ie. `md-cols-lg="8"`)
 *
 * @param {number} md-cols Number of columns in the grid.
 * @param {string} md-row-height One of
 * <ul>
 *   <li>CSS length - Fixed height rows (eg. `8px` or `1rem`)</li>
 *   <li>`{width}:{height}` - Ratio of width to height (eg.
 *   `md-row-height="16:9"`)</li>
 *   <li>`"fit"` - Height will be determined by subdividing the available
 *   height by the number of rows</li>
 * </ul>
 * @param {string=} md-gutter The amount of space between tiles in CSS units
 *     (default 1px)
 * @param {expression=} md-on-layout Expression to evaluate after layout. Event
 *     object is available as `$event`, and contains performance information.
 *
 * @usage
 * Basic:
 * <hljs lang="html">
 * <md-grid-list md-cols="5" md-gutter="1em" md-row-height="4:3">
 *   <md-grid-tile></md-grid-tile>
 * </md-grid-list>
 * </hljs>
 *
 * Fixed-height rows:
 * <hljs lang="html">
 * <md-grid-list md-cols="4" md-row-height="200px" ...>
 *   <md-grid-tile></md-grid-tile>
 * </md-grid-list>
 * </hljs>
 *
 * Fit rows:
 * <hljs lang="html">
 * <md-grid-list md-cols="4" md-row-height="fit" style="height: 400px;" ...>
 *   <md-grid-tile></md-grid-tile>
 * </md-grid-list>
 * </hljs>
 *
 * Using responsive attributes:
 * <hljs lang="html">
 * <md-grid-list
 *     md-cols-sm="2"
 *     md-cols-md="4"
 *     md-cols-lg="8"
 *     md-cols-gt-lg="12"
 *     ...>
 *   <md-grid-tile></md-grid-tile>
 * </md-grid-list>
 * </hljs>
 */
function GridListDirective($interpolate, $mdConstant, $mdGridLayout, $mdMedia) {
  return {
    restrict: 'E',
    controller: GridListController,
    scope: {
      mdOnLayout: '&'
    },
    link: postLink
  };

  function postLink(scope, element, attrs, ctrl) {
    // Apply semantics
    element.attr('role', 'list');

    // Provide the controller with a way to trigger layouts.
    ctrl.layoutDelegate = layoutDelegate;

    var invalidateLayout = angular.bind(ctrl, ctrl.invalidateLayout),
        unwatchAttrs = watchMedia();
      scope.$on('$destroy', unwatchMedia);

    /**
     * Watches for changes in media, invalidating layout as necessary.
     */
    function watchMedia() {
      for (var mediaName in $mdConstant.MEDIA) {
        $mdMedia(mediaName); // initialize
        $mdMedia.getQuery($mdConstant.MEDIA[mediaName])
            .addListener(invalidateLayout);
      }
      return $mdMedia.watchResponsiveAttributes(
          ['md-cols', 'md-row-height', 'md-gutter'], attrs, layoutIfMediaMatch);
    }

    function unwatchMedia() {
      ctrl.layoutDelegate = angular.noop;

      unwatchAttrs();
      for (var mediaName in $mdConstant.MEDIA) {
        $mdMedia.getQuery($mdConstant.MEDIA[mediaName])
            .removeListener(invalidateLayout);
      }
    }

    /**
     * Performs grid layout if the provided mediaName matches the currently
     * active media type.
     */
    function layoutIfMediaMatch(mediaName) {
      if (mediaName == null) {
        // TODO(shyndman): It would be nice to only layout if we have
        // instances of attributes using this media type
        ctrl.invalidateLayout();
      } else if ($mdMedia(mediaName)) {
        ctrl.invalidateLayout();
      }
    }

    var lastLayoutProps;

    /**
     * Invokes the layout engine, and uses its results to lay out our
     * tile elements.
     *
     * @param {boolean} tilesInvalidated Whether tiles have been
     *    added/removed/moved since the last layout. This is to avoid situations
     *    where tiles are replaced with properties identical to their removed
     *    counterparts.
     */
    function layoutDelegate(tilesInvalidated) {
      var tiles = getTileElements();
      var props = {
        tileSpans: getTileSpans(tiles),
        colCount: getColumnCount(),
        rowMode: getRowMode(),
        rowHeight: getRowHeight(),
        gutter: getGutter()
      };

      if (!tilesInvalidated && angular.equals(props, lastLayoutProps)) {
        return;
      }

      var performance =
        $mdGridLayout(props.colCount, props.tileSpans, tiles)
          .map(function(tilePositions, rowCount) {
            return {
              grid: {
                element: element,
                style: getGridStyle(props.colCount, rowCount,
                    props.gutter, props.rowMode, props.rowHeight)
              },
              tiles: tilePositions.map(function(ps, i) {
                return {
                  element: angular.element(tiles[i]),
                  style: getTileStyle(ps.position, ps.spans,
                      props.colCount, rowCount,
                      props.gutter, props.rowMode, props.rowHeight)
                }
              })
            }
          })
          .reflow()
          .performance();

      // Report layout
      scope.mdOnLayout({
        $event: {
          performance: performance
        }
      });

      lastLayoutProps = props;
    }

    // Use $interpolate to do some simple string interpolation as a convenience.

    var startSymbol = $interpolate.startSymbol();
    var endSymbol = $interpolate.endSymbol();

    // Returns an expression wrapped in the interpolator's start and end symbols.
    function expr(exprStr) {
      return startSymbol + exprStr + endSymbol;
    }

    // The amount of space a single 1x1 tile would take up (either width or height), used as
    // a basis for other calculations. This consists of taking the base size percent (as would be
    // if evenly dividing the size between cells), and then subtracting the size of one gutter.
    // However, since there are no gutters on the edges, each tile only uses a fration
    // (gutterShare = numGutters / numCells) of the gutter size. (Imagine having one gutter per
    // tile, and then breaking up the extra gutter on the edge evenly among the cells).
    var UNIT = $interpolate(expr('share') + '% - (' + expr('gutter') + ' * ' + expr('gutterShare') + ')');

    // The horizontal or vertical position of a tile, e.g., the 'top' or 'left' property value.
    // The position comes the size of a 1x1 tile plus gutter for each previous tile in the
    // row/column (offset).
    var POSITION  = $interpolate('calc((' + expr('unit') + ' + ' + expr('gutter') + ') * ' + expr('offset') + ')');

    // The actual size of a tile, e.g., width or height, taking rowSpan or colSpan into account.
    // This is computed by multiplying the base unit by the rowSpan/colSpan, and then adding back
    // in the space that the gutter would normally have used (which was already accounted for in
    // the base unit calculation).
    var DIMENSION = $interpolate('calc((' + expr('unit') + ') * ' + expr('span') + ' + (' + expr('span') + ' - 1) * ' + expr('gutter') + ')');

    /**
     * Gets the styles applied to a tile element described by the given parameters.
     * @param {{row: number, col: number}} position The row and column indices of the tile.
     * @param {{row: number, col: number}} spans The rowSpan and colSpan of the tile.
     * @param {number} colCount The number of columns.
     * @param {number} rowCount The number of rows.
     * @param {string} gutter The amount of space between tiles. This will be something like
     *     '5px' or '2em'.
     * @param {string} rowMode The row height mode. Can be one of:
     *     'fixed': all rows have a fixed size, given by rowHeight,
     *     'ratio': row height defined as a ratio to width, or
     *     'fit': fit to the grid-list element height, divinding evenly among rows.
     * @param {string|number} rowHeight The height of a row. This is only used for 'fixed' mode and
     *     for 'ratio' mode. For 'ratio' mode, this is the *ratio* of width-to-height (e.g., 0.75).
     * @returns {Object} Map of CSS properties to be applied to the style element. Will define
     *     values for top, left, width, height, marginTop, and paddingTop.
     */
    function getTileStyle(position, spans, colCount, rowCount, gutter, rowMode, rowHeight) {
      // TODO(shyndman): There are style caching opportunities here.

      // Percent of the available horizontal space that one column takes up.
      var hShare = (1 / colCount) * 100;

      // Fraction of the gutter size that each column takes up.
      var hGutterShare = (colCount - 1) / colCount;

      // Base horizontal size of a column.
      var hUnit = UNIT({share: hShare, gutterShare: hGutterShare, gutter: gutter});

      // The width and horizontal position of each tile is always calculated the same way, but the
      // height and vertical position depends on the rowMode.
      var style = {
        left: POSITION({ unit: hUnit, offset: position.col, gutter: gutter }),
        width: DIMENSION({ unit: hUnit, span: spans.col, gutter: gutter }),
        // resets
        paddingTop: '',
        marginTop: '',
        top: '',
        height: ''
      };

      switch (rowMode) {
        case 'fixed':
          // In fixed mode, simply use the given rowHeight.
          style.top = POSITION({ unit: rowHeight, offset: position.row, gutter: gutter });
          style.height = DIMENSION({ unit: rowHeight, span: spans.row, gutter: gutter });
          break;

        case 'ratio':
          // Percent of the available vertical space that one row takes up. Here, rowHeight holds
          // the ratio value. For example, if the width:height ratio is 4:3, rowHeight = 1.333.
          var vShare = hShare / rowHeight;

          // Base veritcal size of a row.
          var vUnit = UNIT({ share: vShare, gutterShare: hGutterShare, gutter: gutter });

          // padidngTop and marginTop are used to maintain the given aspect ratio, as
          // a percentage-based value for these properties is applied to the *width* of the
          // containing block. See http://www.w3.org/TR/CSS2/box.html#margin-properties
          style.paddingTop = DIMENSION({ unit: vUnit, span: spans.row, gutter: gutter});
          style.marginTop = POSITION({ unit: vUnit, offset: position.row, gutter: gutter });
          break;

        case 'fit':
          // Fraction of the gutter size that each column takes up.
          var vGutterShare = (rowCount - 1) / rowCount;

          // Percent of the available vertical space that one row takes up.
          var vShare = (1 / rowCount) * 100;

          // Base vertical size of a row.
          var vUnit = UNIT({share: vShare, gutterShare: vGutterShare, gutter: gutter});

          style.top = POSITION({unit: vUnit, offset: position.row, gutter: gutter});
          style.height = DIMENSION({unit: vUnit, span: spans.row, gutter: gutter});
          break;
      }

      return style;
    }

    function getGridStyle(colCount, rowCount, gutter, rowMode, rowHeight) {
      var style = {};

      switch(rowMode) {
        case 'fixed':
          style.height = DIMENSION({ unit: rowHeight, span: rowCount, gutter: gutter });
          style.paddingBottom = '';
          break;

        case 'ratio':
          // rowHeight is width / height
          var hGutterShare = colCount === 1 ? 0 : (colCount - 1) / colCount,
              hShare = (1 / colCount) * 100,
              vShare = hShare * (1 / rowHeight),
              vUnit = UNIT({ share: vShare, gutterShare: hGutterShare, gutter: gutter });

          style.height = '';
          style.paddingBottom = DIMENSION({ unit: vUnit, span: rowCount, gutter: gutter});
          break;

        case 'fit':
          // noop, as the height is user set
          break;
      }

      return style;
    }

    function getTileElements() {
      return [].filter.call(element.children(), function(ele) {
        return ele.tagName == 'MD-GRID-TILE' && !ele.$$mdDestroyed;
      });
    }

    /**
     * Gets an array of objects containing the rowspan and colspan for each tile.
     * @returns {Array<{row: number, col: number}>}
     */
    function getTileSpans(tileElements) {
      return [].map.call(tileElements, function(ele) {
        var ctrl = angular.element(ele).controller('mdGridTile');
        return {
          row: parseInt(
              $mdMedia.getResponsiveAttribute(ctrl.$attrs, 'md-rowspan'), 10) || 1,
          col: parseInt(
              $mdMedia.getResponsiveAttribute(ctrl.$attrs, 'md-colspan'), 10) || 1
        };
      });
    }

    function getColumnCount() {
      var colCount = parseInt($mdMedia.getResponsiveAttribute(attrs, 'md-cols'), 10);
      if (isNaN(colCount)) {
        throw 'md-grid-list: md-cols attribute was not found, or contained a non-numeric value';
      }
      return colCount;
    }

    function getGutter() {
      return applyDefaultUnit($mdMedia.getResponsiveAttribute(attrs, 'md-gutter') || 1);
    }

    function getRowHeight() {
      var rowHeight = $mdMedia.getResponsiveAttribute(attrs, 'md-row-height');
      switch (getRowMode()) {
        case 'fixed':
          return applyDefaultUnit(rowHeight);
        case 'ratio':
          var whRatio = rowHeight.split(':');
          return parseFloat(whRatio[0]) / parseFloat(whRatio[1]);
        case 'fit':
          return 0; // N/A
      }
    }

    function getRowMode() {
      var rowHeight = $mdMedia.getResponsiveAttribute(attrs, 'md-row-height');
      if (rowHeight == 'fit') {
        return 'fit';
      } else if (rowHeight.indexOf(':') !== -1) {
        return 'ratio';
      } else {
        return 'fixed';
      }
    }

    function applyDefaultUnit(val) {
      return /\D$/.test(val) ? val : val + 'px';
    }
  }
}
GridListDirective.$inject = ["$interpolate", "$mdConstant", "$mdGridLayout", "$mdMedia"];

/* @ngInject */
function GridListController($mdUtil) {
  this.layoutInvalidated = false;
  this.tilesInvalidated = false;
  this.$timeout_ = $mdUtil.nextTick;
  this.layoutDelegate = angular.noop;
}
GridListController.$inject = ["$mdUtil"];

GridListController.prototype = {
  invalidateTiles: function() {
    this.tilesInvalidated = true;
    this.invalidateLayout();
  },

  invalidateLayout: function() {
    if (this.layoutInvalidated) {
      return;
    }
    this.layoutInvalidated = true;
    this.$timeout_(angular.bind(this, this.layout));
  },

  layout: function() {
    try {
      this.layoutDelegate(this.tilesInvalidated);
    } finally {
      this.layoutInvalidated = false;
      this.tilesInvalidated = false;
    }
  }
};


/* @ngInject */
function GridLayoutFactory($mdUtil) {
  var defaultAnimator = GridTileAnimator;

  /**
   * Set the reflow animator callback
   */
  GridLayout.animateWith = function(customAnimator) {
    defaultAnimator = !angular.isFunction(customAnimator) ? GridTileAnimator : customAnimator;
  };

  return GridLayout;

  /**
   * Publish layout function
   */
  function GridLayout(colCount, tileSpans) {
      var self, layoutInfo, gridStyles, layoutTime, mapTime, reflowTime;

      layoutTime = $mdUtil.time(function() {
        layoutInfo = calculateGridFor(colCount, tileSpans);
      });

      return self = {

        /**
         * An array of objects describing each tile's position in the grid.
         */
        layoutInfo: function() {
          return layoutInfo;
        },

        /**
         * Maps grid positioning to an element and a set of styles using the
         * provided updateFn.
         */
        map: function(updateFn) {
          mapTime = $mdUtil.time(function() {
            var info = self.layoutInfo();
            gridStyles = updateFn(info.positioning, info.rowCount);
          });
          return self;
        },

        /**
         * Default animator simply sets the element.css( <styles> ). An alternate
         * animator can be provided as an argument. The function has the following
         * signature:
         *
         *    function({grid: {element: JQLite, style: Object}, tiles: Array<{element: JQLite, style: Object}>)
         */
        reflow: function(animatorFn) {
          reflowTime = $mdUtil.time(function() {
            var animator = animatorFn || defaultAnimator;
            animator(gridStyles.grid, gridStyles.tiles);
          });
          return self;
        },

        /**
         * Timing for the most recent layout run.
         */
        performance: function() {
          return {
            tileCount: tileSpans.length,
            layoutTime: layoutTime,
            mapTime: mapTime,
            reflowTime: reflowTime,
            totalTime: layoutTime + mapTime + reflowTime
          };
        }
      };
    }

  /**
   * Default Gridlist animator simple sets the css for each element;
   * NOTE: any transitions effects must be manually set in the CSS.
   * e.g.
   *
   *  md-grid-tile {
   *    transition: all 700ms ease-out 50ms;
   *  }
   *
   */
  function GridTileAnimator(grid, tiles) {
    grid.element.css(grid.style);
    tiles.forEach(function(t) {
      t.element.css(t.style);
    })
  }

  /**
   * Calculates the positions of tiles.
   *
   * The algorithm works as follows:
   *    An Array<Number> with length colCount (spaceTracker) keeps track of
   *    available tiling positions, where elements of value 0 represents an
   *    empty position. Space for a tile is reserved by finding a sequence of
   *    0s with length <= than the tile's colspan. When such a space has been
   *    found, the occupied tile positions are incremented by the tile's
   *    rowspan value, as these positions have become unavailable for that
   *    many rows.
   *
   *    If the end of a row has been reached without finding space for the
   *    tile, spaceTracker's elements are each decremented by 1 to a minimum
   *    of 0. Rows are searched in this fashion until space is found.
   */
  function calculateGridFor(colCount, tileSpans) {
    var curCol = 0,
        curRow = 0,
        spaceTracker = newSpaceTracker();

    return {
      positioning: tileSpans.map(function(spans, i) {
        return {
          spans: spans,
          position: reserveSpace(spans, i)
        };
      }),
      rowCount: curRow + Math.max.apply(Math, spaceTracker)
    };

    function reserveSpace(spans, i) {
      if (spans.col > colCount) {
        throw 'md-grid-list: Tile at position ' + i + ' has a colspan ' +
            '(' + spans.col + ') that exceeds the column count ' +
            '(' + colCount + ')';
      }

      var start = 0,
          end = 0;

      // TODO(shyndman): This loop isn't strictly necessary if you can
      // determine the minimum number of rows before a space opens up. To do
      // this, recognize that you've iterated across an entire row looking for
      // space, and if so fast-forward by the minimum rowSpan count. Repeat
      // until the required space opens up.
      while (end - start < spans.col) {
        if (curCol >= colCount) {
          nextRow();
          continue;
        }

        start = spaceTracker.indexOf(0, curCol);
        if (start === -1 || (end = findEnd(start + 1)) === -1) {
          start = end = 0;
          nextRow();
          continue;
        }

        curCol = end + 1;
      }

      adjustRow(start, spans.col, spans.row);
      curCol = start + spans.col;

      return {
        col: start,
        row: curRow
      };
    }

    function nextRow() {
      curCol = 0;
      curRow++;
      adjustRow(0, colCount, -1); // Decrement row spans by one
    }

    function adjustRow(from, cols, by) {
      for (var i = from; i < from + cols; i++) {
        spaceTracker[i] = Math.max(spaceTracker[i] + by, 0);
      }
    }

    function findEnd(start) {
      var i;
      for (i = start; i < spaceTracker.length; i++) {
        if (spaceTracker[i] !== 0) {
          return i;
        }
      }

      if (i === spaceTracker.length) {
        return i;
      }
    }

    function newSpaceTracker() {
      var tracker = [];
      for (var i = 0; i < colCount; i++) {
        tracker.push(0);
      }
      return tracker;
    }
  }
}
GridLayoutFactory.$inject = ["$mdUtil"];

/**
 * @ngdoc directive
 * @name mdGridTile
 * @module material.components.gridList
 * @restrict E
 * @description
 * Tiles contain the content of an `md-grid-list`. They span one or more grid
 * cells vertically or horizontally, and use `md-grid-tile-{footer,header}` to
 * display secondary content.
 *
 * ### Responsive Attributes
 *
 * The `md-grid-tile` directive supports "responsive" attributes, which allow
 * different `md-rowspan` and `md-colspan` values depending on the currently
 * matching media query (as defined in `$mdConstant.MEDIA`).
 *
 * In order to set a responsive attribute, first define the fallback value with
 * the standard attribute name, then add additional attributes with the
 * following convention: `{base-attribute-name}-{media-query-name}="{value}"`
 * (ie. `md-colspan-sm="4"`)
 *
 * @param {number=} md-colspan The number of columns to span (default 1). Cannot
 *    exceed the number of columns in the grid. Supports interpolation.
 * @param {number=} md-rowspan The number of rows to span (default 1). Supports
 *     interpolation.
 *
 * @usage
 * With header:
 * <hljs lang="html">
 * <md-grid-tile>
 *   <md-grid-tile-header>
 *     <h3>This is a header</h3>
 *   </md-grid-tile-header>
 * </md-grid-tile>
 * </hljs>
 *
 * With footer:
 * <hljs lang="html">
 * <md-grid-tile>
 *   <md-grid-tile-footer>
 *     <h3>This is a footer</h3>
 *   </md-grid-tile-footer>
 * </md-grid-tile>
 * </hljs>
 *
 * Spanning multiple rows/columns:
 * <hljs lang="html">
 * <md-grid-tile md-colspan="2" md-rowspan="3">
 * </md-grid-tile>
 * </hljs>
 *
 * Responsive attributes:
 * <hljs lang="html">
 * <md-grid-tile md-colspan="1" md-colspan-sm="3" md-colspan-md="5">
 * </md-grid-tile>
 * </hljs>
 */
function GridTileDirective($mdMedia) {
  return {
    restrict: 'E',
    require: '^mdGridList',
    template: '<figure ng-transclude></figure>',
    transclude: true,
    scope: {},
    // Simple controller that exposes attributes to the grid directive
    controller: ["$attrs", function($attrs) {
      this.$attrs = $attrs;
    }],
    link: postLink
  };

  function postLink(scope, element, attrs, gridCtrl) {
    // Apply semantics
    element.attr('role', 'listitem');

    // If our colspan or rowspan changes, trigger a layout
    var unwatchAttrs = $mdMedia.watchResponsiveAttributes(['md-colspan', 'md-rowspan'],
        attrs, angular.bind(gridCtrl, gridCtrl.invalidateLayout));

    // Tile registration/deregistration
    gridCtrl.invalidateTiles();
    scope.$on('$destroy', function() {
      // Mark the tile as destroyed so it is no longer considered in layout,
      // even if the DOM element sticks around (like during a leave animation)
      element[0].$$mdDestroyed = true;
      unwatchAttrs();
      gridCtrl.invalidateLayout();
    });

    if (angular.isDefined(scope.$parent.$index)) {
      scope.$watch(function() { return scope.$parent.$index; },
        function indexChanged(newIdx, oldIdx) {
          if (newIdx === oldIdx) {
            return;
          }
          gridCtrl.invalidateTiles();
        });
    }
  }
}
GridTileDirective.$inject = ["$mdMedia"];


function GridTileCaptionDirective() {
  return {
    template: '<figcaption ng-transclude></figcaption>',
    transclude: true
  };
}

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [
    'material.core'
  ]);

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.input
 */

angular.module('material.components.input', [
  'material.core'
])
  .directive('mdInputContainer', mdInputContainerDirective)
  .directive('label', labelDirective)
  .directive('input', inputTextareaDirective)
  .directive('textarea', inputTextareaDirective)
  .directive('mdMaxlength', mdMaxlengthDirective)
  .directive('placeholder', placeholderDirective)
  .directive('ngMessages', ngMessagesDirective);

/**
 * @ngdoc directive
 * @name mdInputContainer
 * @module material.components.input
 *
 * @restrict E
 *
 * @description
 * `<md-input-container>` is the parent of any input or textarea element.
 *
 * Input and textarea elements will not behave properly unless the md-input-container
 * parent is provided.
 *
 * @param md-is-error {expression=} When the given expression evaluates to true, the input container
 *   will go into error state. Defaults to erroring if the input has been touched and is invalid.
 * @param md-no-float {boolean=} When present, placeholders will not be converted to floating
 *   labels.
 *
 * @usage
 * <hljs lang="html">
 *
 * <md-input-container>
 *   <label>Username</label>
 *   <input type="text" ng-model="user.name">
 * </md-input-container>
 *
 * <md-input-container>
 *   <label>Description</label>
 *   <textarea ng-model="user.description"></textarea>
 * </md-input-container>
 *
 * </hljs>
 */
function mdInputContainerDirective($mdTheming, $parse) {
  ContainerCtrl.$inject = ["$scope", "$element", "$attrs"];
  return {
    restrict: 'E',
    link: postLink,
    controller: ContainerCtrl
  };

  function postLink(scope, element, attr) {
    $mdTheming(element);
  }

  function ContainerCtrl($scope, $element, $attrs) {
    var self = this;

    self.isErrorGetter = $attrs.mdIsError && $parse($attrs.mdIsError);

    self.delegateClick = function() {
      self.input.focus();
    };
    self.element = $element;
    self.setFocused = function(isFocused) {
      $element.toggleClass('md-input-focused', !!isFocused);
    };
    self.setHasValue = function(hasValue) {
      $element.toggleClass('md-input-has-value', !!hasValue);
    };
    self.setHasMessages = function(hasMessages) {
      $element.toggleClass('md-input-has-messages', !!hasMessages);
    };
    self.setHasPlaceholder = function(hasPlaceholder) {
      $element.toggleClass('md-input-has-placeholder', !!hasPlaceholder);
    };
    self.setInvalid = function(isInvalid) {
      $element.toggleClass('md-input-invalid', !!isInvalid);
    };
    $scope.$watch(function() {
      return self.label && self.input;
    }, function(hasLabelAndInput) {
      if (hasLabelAndInput && !self.label.attr('for')) {
        self.label.attr('for', self.input.attr('id'));
      }
    });
  }
}
mdInputContainerDirective.$inject = ["$mdTheming", "$parse"];

function labelDirective() {
  return {
    restrict: 'E',
    require: '^?mdInputContainer',
    link: function(scope, element, attr, containerCtrl) {
      if (!containerCtrl || attr.mdNoFloat) return;

      containerCtrl.label = element;
      scope.$on('$destroy', function() {
        containerCtrl.label = null;
      });
    }
  };
}

/**
 * @ngdoc directive
 * @name mdInput
 * @restrict E
 * @module material.components.input
 *
 * @description
 * Use the `<input>` or the  `<textarea>` as a child of an `<md-input-container>`.
 *
 * @param {number=} md-maxlength The maximum number of characters allowed in this input. If this is
 *   specified, a character counter will be shown underneath the input.<br/><br/>
 *   The purpose of **`md-maxlength`** is exactly to show the max length counter text. If you don't
 *   want the counter text and only need "plain" validation, you can use the "simple" `ng-maxlength`
 *   or maxlength attributes.
 * @param {string=} aria-label Aria-label is required when no label is present.  A warning message
 *   will be logged in the console if not present.
 * @param {string=} placeholder An alternative approach to using aria-label when the label is not
 *   PRESENT. The placeholder text is copied to the aria-label attribute.
 * @param md-no-autogrow {boolean=} When present, textareas will not grow automatically.
 * @param md-detect-hidden {boolean=} When present, textareas will be sized properly when they are revealed after being hidden. This is off by default for performance reasons because it guarantees a reflow every digest cycle.
 *
 * @usage
 * <hljs lang="html">
 * <md-input-container>
 *   <label>Color</label>
 *   <input type="text" ng-model="color" required md-maxlength="10">
 * </md-input-container>
 * </hljs>
 * <h3>With Errors</h3>
 *
 * <hljs lang="html">
 * <form name="userForm">
 *   <md-input-container>
 *     <label>Last Name</label>
 *     <input name="lastName" ng-model="lastName" required md-maxlength="10" minlength="4">
 *     <div ng-messages="userForm.lastName.$error" ng-show="userForm.lastName.$dirty">
 *       <div ng-message="required">This is required!</div>
 *       <div ng-message="md-maxlength">That's too long!</div>
 *       <div ng-message="minlength">That's too short!</div>
 *     </div>
 *   </md-input-container>
 *   <md-input-container>
 *     <label>Biography</label>
 *     <textarea name="bio" ng-model="biography" required md-maxlength="150"></textarea>
 *     <div ng-messages="userForm.bio.$error" ng-show="userForm.bio.$dirty">
 *       <div ng-message="required">This is required!</div>
 *       <div ng-message="md-maxlength">That's too long!</div>
 *     </div>
 *   </md-input-container>
 *   <md-input-container>
 *     <input aria-label='title' ng-model='title'>
 *   </md-input-container>
 *   <md-input-container>
 *     <input placeholder='title' ng-model='title'>
 *   </md-input-container>
 * </form>
 * </hljs>
 *
 * Requires [ngMessages](https://docs.angularjs.org/api/ngMessages).
 * Behaves like the [AngularJS input directive](https://docs.angularjs.org/api/ng/directive/input).
 *
 */

function inputTextareaDirective($mdUtil, $window, $mdAria) {
  return {
    restrict: 'E',
    require: ['^?mdInputContainer', '?ngModel'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {

    var containerCtrl = ctrls[0];
    var hasNgModel = !!ctrls[1];
    var ngModelCtrl = ctrls[1] || $mdUtil.fakeNgModel();
    var isReadonly = angular.isDefined(attr.readonly);

    if (!containerCtrl) return;
    if (containerCtrl.input) {
      throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
    }
    containerCtrl.input = element;

    if (!containerCtrl.label) {
      $mdAria.expect(element, 'aria-label', element.attr('placeholder'));
    }

    element.addClass('md-input');
    if (!element.attr('id')) {
      element.attr('id', 'input_' + $mdUtil.nextUid());
    }

    if (element[0].tagName.toLowerCase() === 'textarea') {
      setupTextarea();
    }

    // If the input doesn't have an ngModel, it may have a static value. For that case,
    // we have to do one initial check to determine if the container should be in the
    // "has a value" state.
    if (!hasNgModel) {
      inputCheckValue();
    }

    var isErrorGetter = containerCtrl.isErrorGetter || function() {
        return ngModelCtrl.$invalid && ngModelCtrl.$touched;
      };
    scope.$watch(isErrorGetter, containerCtrl.setInvalid);

    ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
    ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

    element.on('input', inputCheckValue);

    if (!isReadonly) {
      element
        .on('focus', function(ev) {
          containerCtrl.setFocused(true);
        })
        .on('blur', function(ev) {
          containerCtrl.setFocused(false);
          inputCheckValue();
        });

    }

    //ngModelCtrl.$setTouched();
    //if( ngModelCtrl.$invalid ) containerCtrl.setInvalid();

    scope.$on('$destroy', function() {
      containerCtrl.setFocused(false);
      containerCtrl.setHasValue(false);
      containerCtrl.input = null;
    });

    /**
     *
     */
    function ngModelPipelineCheckValue(arg) {
      containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
      return arg;
    }

    function inputCheckValue() {
      // An input's value counts if its length > 0,
      // or if the input's validity state says it has bad input (eg string in a number input)
      containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
    }

    function setupTextarea() {
      if (angular.isDefined(element.attr('md-no-autogrow'))) {
        return;
      }

      var node = element[0];
      var container = containerCtrl.element[0];

      var min_rows = NaN;
      var lineHeight = null;
      // can't check if height was or not explicity set,
      // so rows attribute will take precedence if present
      if (node.hasAttribute('rows')) {
        min_rows = parseInt(node.getAttribute('rows'));
      }

      var onChangeTextarea = $mdUtil.debounce(growTextarea, 1);

      function pipelineListener(value) {
        onChangeTextarea();
        return value;
      }

      if (ngModelCtrl) {
        ngModelCtrl.$formatters.push(pipelineListener);
        ngModelCtrl.$viewChangeListeners.push(pipelineListener);
      } else {
        onChangeTextarea();
      }
      element.on('keydown input', onChangeTextarea);

      if (isNaN(min_rows)) {
        element.attr('rows', '1');

        element.on('scroll', onScroll);
      }

      angular.element($window).on('resize', onChangeTextarea);

      scope.$on('$destroy', function() {
        angular.element($window).off('resize', onChangeTextarea);
      });

      function growTextarea() {
        // sets the md-input-container height to avoid jumping around
        container.style.height = container.offsetHeight + 'px';

        // temporarily disables element's flex so its height 'runs free'
        element.addClass('md-no-flex');

        if (isNaN(min_rows)) {
          node.style.height = "auto";
          node.scrollTop = 0;
          var height = getHeight();
          if (height) node.style.height = height + 'px';
        } else {
          node.setAttribute("rows", 1);

          if (!lineHeight) {
            node.style.minHeight = '0';

            lineHeight = element.prop('clientHeight');

            node.style.minHeight = null;
          }

          var rows = Math.max(min_rows, Math.round(node.scrollHeight / lineHeight));
          node.setAttribute("rows", rows);
        }

        // reset everything back to normal
        element.removeClass('md-no-flex');
        container.style.height = 'auto';
      }

      function getHeight() {
        var line = node.scrollHeight - node.offsetHeight;
        return node.offsetHeight + (line > 0 ? line : 0);
      }

      function onScroll(e) {
        node.scrollTop = 0;
        // for smooth new line adding
        var line = node.scrollHeight - node.offsetHeight;
        var height = node.offsetHeight + line;
        node.style.height = height + 'px';
      }

      // Attach a watcher to detect when the textarea gets shown.
      if (angular.isDefined(element.attr('md-detect-hidden'))) {

        var handleHiddenChange = function() {
          var wasHidden = false;

          return function() {
            var isHidden = node.offsetHeight === 0;

            if (isHidden === false && wasHidden === true) {
              growTextarea();
            }

            wasHidden = isHidden;
          };
        }();

        // Check every digest cycle whether the visibility of the textarea has changed.
        // Queue up to run after the digest cycle is complete.
        scope.$watch(function() {
          $mdUtil.nextTick(handleHiddenChange, false);
          return true;
        });
      }
    }
  }
}
inputTextareaDirective.$inject = ["$mdUtil", "$window", "$mdAria"];

function mdMaxlengthDirective($animate) {
  return {
    restrict: 'A',
    require: ['ngModel', '^mdInputContainer'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var maxlength;
    var ngModelCtrl = ctrls[0];
    var containerCtrl = ctrls[1];
    var charCountEl = angular.element('<div class="md-char-counter">');
    var input = angular.element(containerCtrl.element[0].querySelector('[md-maxlength]'));

    // Stop model from trimming. This makes it so whitespace
    // over the maxlength still counts as invalid.
    attr.$set('ngTrim', 'false');

    var ngMessagesSelectors = [
      'ng-messages',
      'data-ng-messages',
      'x-ng-messages',
      '[ng-messages]',
      '[data-ng-messages]',
      '[x-ng-messages]'
    ];

    var ngMessages = containerCtrl.element[0].querySelector(ngMessagesSelectors.join(','));

    // If we have an ngMessages container, put the counter at the top; otherwise, put it after the
    // input so it will be positioned properly in the SCSS
    if (ngMessages) {
      angular.element(ngMessages).prepend(charCountEl);
    } else {
      input.after(charCountEl);
    }

    ngModelCtrl.$formatters.push(renderCharCount);
    ngModelCtrl.$viewChangeListeners.push(renderCharCount);
    element.on('input keydown keyup', function() {
      renderCharCount(); //make sure it's called with no args
    });

    scope.$watch(attr.mdMaxlength, function(value) {
      maxlength = value;
      if (angular.isNumber(value) && value > 0) {
        if (!charCountEl.parent().length) {
          $animate.enter(charCountEl, containerCtrl.element, input);
        }
        renderCharCount();
      } else {
        $animate.leave(charCountEl);
      }
    });

    ngModelCtrl.$validators['md-maxlength'] = function(modelValue, viewValue) {
      if (!angular.isNumber(maxlength) || maxlength < 0) {
        return true;
      }
      return ( modelValue || element.val() || viewValue || '' ).length <= maxlength;
    };

    function renderCharCount(value) {
      // Force the value into a string since it may be a number,
      // which does not have a length property.
      charCountEl.text(String(element.val() || value || '').length + '/' + maxlength);
      return value;
    }
  }
}
mdMaxlengthDirective.$inject = ["$animate"];

function placeholderDirective($log) {
  return {
    restrict: 'A',
    require: '^^?mdInputContainer',
    priority: 200,
    link: postLink
  };

  function postLink(scope, element, attr, inputContainer) {
    // If there is no input container, just return
    if (!inputContainer) return;

    var label = inputContainer.element.find('label');
    var hasNoFloat = angular.isDefined(inputContainer.element.attr('md-no-float'));

    // If we have a label, or they specify the md-no-float attribute, just return
    if ((label && label.length) || hasNoFloat) {
      // Add a placeholder class so we can target it in the CSS
      inputContainer.setHasPlaceholder(true);
      return;
    }

    // Otherwise, grab/remove the placeholder
    var placeholderText = attr.placeholder;
    element.removeAttr('placeholder');

    // And add the placeholder text as a separate label
    if (inputContainer.input && inputContainer.input[0].nodeName != 'MD-SELECT') {
      var placeholder = '<label ng-click="delegateClick()">' + placeholderText + '</label>';

      inputContainer.element.addClass('md-icon-float');
      inputContainer.element.prepend(placeholder);
    }
  }
}
placeholderDirective.$inject = ["$log"];

function ngMessagesDirective() {
  return {
    restrict: 'EA',
    link: postLink,

    // This is optional because we don't want target *all* ngMessage instances, just those inside of
    // mdInputContainer.
    require: '^^?mdInputContainer'
  };

  function postLink(scope, element, attr, inputContainer) {
    // If we are not a child of an input container, don't do anything
    if (!inputContainer) return;

    // Tell our parent input container we have messages so we can set the proper classes
    inputContainer.setHasMessages(true);

    // When destroyed, inform our input container
    scope.$on('$destroy', function() {
      inputContainer.setHasMessages(false);
    });
  }
}

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.list
 * @description
 * List module
 */
angular.module('material.components.list', [
  'material.core'
])
  .controller('MdListController', MdListController)
  .directive('mdList', mdListDirective)
  .directive('mdListItem', mdListItemDirective);

/**
 * @ngdoc directive
 * @name mdList
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<md-list>` directive is a list container for 1..n `<md-list-item>` tags.
 *
 * @usage
 * <hljs lang="html">
 * <md-list>
 *   <md-list-item class="md-2-line" ng-repeat="item in todos">
 *     <md-checkbox ng-model="item.done"></md-checkbox>
 *     <div class="md-list-item-text">
 *       <h3>{{item.title}}</h3>
 *       <p>{{item.description}}</p>
 *     </div>
 *   </md-list-item>
 * </md-list>
 * </hljs>
 */

function mdListDirective($mdTheming) {
  return {
    restrict: 'E',
    compile: function(tEl) {
      tEl[0].setAttribute('role', 'list');
      return $mdTheming;
    }
  };
}
mdListDirective.$inject = ["$mdTheming"];
/**
 * @ngdoc directive
 * @name mdListItem
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<md-list-item>` directive is a container intended for row items in a `<md-list>` container.
 *
 * ## CSS
 * `.md-avatar` - class for image avatars
 *
 * `.md-avatar-icon` - class for icon avatars
 *
 * `.md-offset` - on content without an avatar
 *
 * @usage
 * <hljs lang="html">
 *  <md-list>
 *    <md-list-item>
 *      <img class="md-avatar" ng-src="path/to/img"/>
 *      <span>Item content in list</span>
 *    </md-list-item>
 *    <md-list-item>
 *      <md-icon class="md-avatar-icon" md-svg-icon="communication:phone"></md-icon>
 *      <span>Item content in list</span>
 *    </md-list-item>
 *  </md-list>
 * </hljs>
 *
 * _**Note:** We automatically apply special styling when the inner contents are wrapped inside
 * of a `<md-button>` tag. This styling is automatically ignored for `class="md-secondary"` buttons
 * and you can include a class of `class="md-exclude"` if you need to use a non-secondary button
 * that is inside the list, but does not wrap the contents._
 */
function mdListItemDirective($mdAria, $mdConstant, $mdUtil, $timeout) {
  var proxiedTypes = ['md-checkbox', 'md-switch'];
  return {
    restrict: 'E',
    controller: 'MdListController',
    compile: function(tEl, tAttrs) {
      // Check for proxy controls (no ng-click on parent, and a control inside)
      var secondaryItem = tEl[0].querySelector('.md-secondary');
      var hasProxiedElement;
      var proxyElement;

      tEl[0].setAttribute('role', 'listitem');

      if (tAttrs.ngClick || tAttrs.ngHref || tAttrs.href || tAttrs.uiSref || tAttrs.ngAttrUiSref) {
        wrapIn('button');
      } else {
        for (var i = 0, type; type = proxiedTypes[i]; ++i) {
          if (proxyElement = tEl[0].querySelector(type)) {
            hasProxiedElement = true;
            break;
          }
        }
        if (hasProxiedElement) {
          wrapIn('div');
        } else if (!tEl[0].querySelector('md-button:not(.md-secondary):not(.md-exclude)')) {
          tEl.addClass('md-no-proxy');
        }
      }
      setupToggleAria();


      function setupToggleAria() {
        var toggleTypes = ['md-switch', 'md-checkbox'];
        var toggle;

        for (var i = 0, toggleType; toggleType = toggleTypes[i]; ++i) {
          if (toggle = tEl.find(toggleType)[0]) {
            if (!toggle.hasAttribute('aria-label')) {
              var p = tEl.find('p')[0];
              if (!p) return;
              toggle.setAttribute('aria-label', 'Toggle ' + p.textContent);
            }
          }
        }
      }

      function wrapIn(type) {
        var container;
        if (type == 'div') {
          container = angular.element('<div class="md-no-style md-list-item-inner">');
          container.append(tEl.contents());
          tEl.addClass('md-proxy-focus');
        } else {
          container = angular.element('<md-button class="md-no-style"><div class="md-list-item-inner"></div></md-button>');
          var copiedAttrs = ['ng-click', 'aria-label', 'ng-disabled', 
            'ui-sref', 'href', 'ng-href', 'ng-attr-ui-sref'];
          angular.forEach(copiedAttrs, function(attr) {
            if (tEl[0].hasAttribute(attr)) {
              container[0].setAttribute(attr, tEl[0].getAttribute(attr));
              tEl[0].removeAttribute(attr);
            }
          });
          container.children().eq(0).append(tEl.contents());
        }

        tEl[0].setAttribute('tabindex', '-1');
        tEl.append(container);

        if (secondaryItem && secondaryItem.hasAttribute('ng-click')) {
          $mdAria.expect(secondaryItem, 'aria-label');
          var buttonWrapper = angular.element('<md-button class="md-secondary-container md-icon-button">');
          buttonWrapper.attr('ng-click', secondaryItem.getAttribute('ng-click'));
          secondaryItem.removeAttribute('ng-click');
          secondaryItem.setAttribute('tabindex', '-1');
          secondaryItem.classList.remove('md-secondary');
          buttonWrapper.append(secondaryItem);
          secondaryItem = buttonWrapper[0];
        }

        // Check for a secondary item and move it outside
        if ( secondaryItem && (
          secondaryItem.hasAttribute('ng-click') ||
            ( tAttrs.ngClick &&
             isProxiedElement(secondaryItem) )
        )) {
          tEl.addClass('md-with-secondary');
          tEl.append(secondaryItem);
        }
      }

      function isProxiedElement(el) {
        return proxiedTypes.indexOf(el.nodeName.toLowerCase()) != -1;
      }

      return postLink;

      function postLink($scope, $element, $attr, ctrl) {

        var proxies    = [],
            firstChild = $element[0].firstElementChild,
            hasClick   = firstChild && hasClickEvent(firstChild);

        computeProxies();
        computeClickable();

        if ($element.hasClass('md-proxy-focus') && proxies.length) {
          angular.forEach(proxies, function(proxy) {
            proxy = angular.element(proxy);

            $scope.mouseActive = false;
            proxy.on('mousedown', function() {
              $scope.mouseActive = true;
              $timeout(function(){
                $scope.mouseActive = false;
              }, 100);
            })
            .on('focus', function() {
              if ($scope.mouseActive === false) { $element.addClass('md-focused'); }
              proxy.on('blur', function proxyOnBlur() {
                $element.removeClass('md-focused');
                proxy.off('blur', proxyOnBlur);
              });
            });
          });
        }

        function hasClickEvent (element) {
          var attr = element.attributes;
          for (var i = 0; i < attr.length; i++) {
            if ($attr.$normalize(attr[i].name) === 'ngClick') return true;
          }
          return false;
        }

        function computeProxies() {
          var children = $element.children();
          if (children.length && !children[0].hasAttribute('ng-click')) {
            angular.forEach(proxiedTypes, function(type) {
              angular.forEach(firstChild.querySelectorAll(type), function(child) {
                proxies.push(child);
              });
            });
          }
        }
        function computeClickable() {
          if (proxies.length || hasClick) {
            $element.addClass('md-clickable');

            ctrl.attachRipple($scope, angular.element($element[0].querySelector('.md-no-style')));
          }
        }

        if (!hasClick && !proxies.length) {
          firstChild && firstChild.addEventListener('keypress', function(e) {
            if (e.target.nodeName != 'INPUT' && e.target.nodeName != 'TEXTAREA' && e.target.getAttribute('contenteditable') != 'true') {
              var keyCode = e.which || e.keyCode;
              if (keyCode == $mdConstant.KEY_CODE.SPACE) {
                if (firstChild) {
                  firstChild.click();
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
            }
          });
        }

        $element.off('click');
        $element.off('keypress');

        if (proxies.length && firstChild) {
          $element.children().eq(0).on('click', function(e) {
            var parentButton = $mdUtil.getClosest(e.target, 'BUTTON');
            if (!parentButton && firstChild.contains(e.target)) {
              angular.forEach(proxies, function(proxy) {
                if (e.target !== proxy && !proxy.contains(e.target)) {
                  angular.element(proxy).triggerHandler('click');
                }
              });
            }
          });
        }
      }
    }
  };
}
mdListItemDirective.$inject = ["$mdAria", "$mdConstant", "$mdUtil", "$timeout"];

/*
 * @private
 * @ngdoc controller
 * @name MdListController
 * @module material.components.list
 *
 */
function MdListController($scope, $element, $mdListInkRipple) {
  var ctrl = this;
  ctrl.attachRipple = attachRipple;

  function attachRipple (scope, element) {
    var options = {};
    $mdListInkRipple.attach(scope, element, options);
  }
}
MdListController.$inject = ["$scope", "$element", "$mdListInkRipple"];


})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.menu
 */

angular.module('material.components.menu', [
  'material.core',
  'material.components.backdrop'
]);

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.menu-bar
 */

angular.module('material.components.menuBar', [
  'material.core',
  'material.components.menu'
]);

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.progressCircular
 * @description Circular Progress module!
 */
angular.module('material.components.progressCircular', [
  'material.core'
])
  .directive('mdProgressCircular', MdProgressCircularDirective);

/**
 * @ngdoc directive
 * @name mdProgressCircular
 * @module material.components.progressCircular
 * @restrict E
 *
* @description
 * The circular progress directive is used to make loading content in your app as delightful and
 * painless as possible by minimizing the amount of visual change a user sees before they can view
 * and interact with content.
 *
 * For operations where the percentage of the operation completed can be determined, use a
 * determinate indicator. They give users a quick sense of how long an operation will take.
 *
 * For operations where the user is asked to wait a moment while something finishes up, and it’s
 * not necessary to expose what's happening behind the scenes and how long it will take, use an
 * indeterminate indicator.
 *
 * @param {string} md-mode Select from one of two modes: **'determinate'** and **'indeterminate'**.
 *
 * Note: if the `md-mode` value is set as undefined or specified as not 1 of the two (2) valid modes, then `.ng-hide`
 * will be auto-applied as a style to the component.
 *
 * Note: if not configured, the `md-mode="indeterminate"` will be auto injected as an attribute.
 * If `value=""` is also specified, however, then `md-mode="determinate"` would be auto-injected instead.
 * @param {number=} value In determinate mode, this number represents the percentage of the
 *     circular progress. Default: 0
 * @param {number=} md-diameter This specifies the diamter of the circular progress. The value
 * may be a percentage (eg '25%') or a pixel-size value (eg '48'). If this attribute is
 * not present then a default value of '48px' is assumed.
 *
 * @usage
 * <hljs lang="html">
 * <md-progress-circular md-mode="determinate" value="..."></md-progress-circular>
 *
 * <md-progress-circular md-mode="determinate" ng-value="..."></md-progress-circular>
 *
 * <md-progress-circular md-mode="determinate" value="..." md-diameter="100"></md-progress-circular>
 *
 * <md-progress-circular md-mode="indeterminate"></md-progress-circular>
 * </hljs>
 */
function MdProgressCircularDirective($mdTheming, $mdUtil, $log) {
  var DEFAULT_PROGRESS_SIZE = 100;
  var DEFAULT_SCALING = 0.5;

  var MODE_DETERMINATE = "determinate",
      MODE_INDETERMINATE = "indeterminate";


  return {
    restrict: 'E',
    scope : true,
    template:
        // The progress 'circle' is composed of two half-circles: the left side and the right
        // side. Each side has CSS applied to 'fill-in' the half-circle to the appropriate progress.
        '<div class="md-spinner-wrapper">' +
          '<div class="md-inner">' +
            '<div class="md-gap"></div>' +
            '<div class="md-left">' +
              '<div class="md-half-circle"></div>' +
            '</div>' +
            '<div class="md-right">' +
              '<div class="md-half-circle"></div>' +
            '</div>' +
          '</div>' +
        '</div>',
    compile: compile
  };

  function compile(tElement) {
    // The javascript in this file is mainly responsible for setting the correct aria attributes.
    // The animation of the progress spinner is done entirely with just CSS.
    tElement.attr('aria-valuemin', 0);
    tElement.attr('aria-valuemax', 100);
    tElement.attr('role', 'progressbar');

    return postLink;
  }

  function postLink(scope, element, attr) {
    $mdTheming(element);

    var circle = element;
    var spinnerWrapper =  angular.element(element.children()[0]);
    var lastMode, toVendorCSS = $mdUtil.dom.animator.toCss;

    element.attr('md-mode', mode());

    updateScale();
    validateMode();
    watchAttributes();

    /**
     * Watch the value and md-mode attributes
     */
    function watchAttributes() {
     attr.$observe('value', function(value) {
           var percentValue = clamp(value);
           element.attr('aria-valuenow', percentValue);

           if (mode() == MODE_DETERMINATE) {
             animateIndicator(percentValue);
           }
         });
     attr.$observe('mdMode',function(mode){
       switch( mode ) {
         case MODE_DETERMINATE:
         case MODE_INDETERMINATE:
           spinnerWrapper.removeClass('ng-hide');
           spinnerWrapper.removeClass( lastMode );
           spinnerWrapper.addClass( lastMode = "md-mode-" + mode );
           break;
         default:
           spinnerWrapper.removeClass( lastMode );
           spinnerWrapper.addClass('ng-hide');
           lastMode = undefined;
           break;
       }
     });
    }

    /**
     * Update size/scaling of the progress indicator
     * Watch the "value" and "md-mode" attributes
     */
    function updateScale() {
      circle.css(toVendorCSS({
        transform : $mdUtil.supplant('scale( {0} )',[getDiameterRatio()])
      }));
    }

    /**
     * Auto-defaults the mode to either `determinate` or `indeterminate` mode; if not specified
     */
    function validateMode() {
      if ( angular.isUndefined(attr.mdMode) ) {
        var hasValue = angular.isDefined(attr.value);
        var mode = hasValue ? MODE_DETERMINATE : MODE_INDETERMINATE;
        var info = "Auto-adding the missing md-mode='{0}' to the ProgressCircular element";

        $log.debug( $mdUtil.supplant(info, [mode]) );

        element.attr("md-mode",mode);
        attr['mdMode'] = mode;
      }
    }

    var leftC, rightC, gap;

    /**
     * Manually animate the Determinate indicator based on the specified
     * percentage value (0-100).
     *
     * Note: this animation was previously done using SCSS.
     * - generated 54K of styles
     * - use attribute selectors which had poor performances in IE
     */
    function animateIndicator(value) {
      if ( !mode() ) return;

      leftC  = leftC  || angular.element(element[0].querySelector('.md-left > .md-half-circle'));
      rightC = rightC || angular.element(element[0].querySelector('.md-right > .md-half-circle'));
      gap    = gap    || angular.element(element[0].querySelector('.md-gap'));

      var gapStyles = removeEmptyValues({
          borderBottomColor: (value <= 50) ? "transparent !important" : "",
          transition: (value <= 50) ? "" : "borderBottomColor 0.1s linear"
        }),
        leftStyles = removeEmptyValues({
          transition: (value <= 50) ? "transform 0.1s linear" : "",
          transform: $mdUtil.supplant("rotate({0}deg)", [value <= 50 ? 135 : (((value - 50) / 50 * 180) + 135)])
        }),
        rightStyles = removeEmptyValues({
          transition: (value >= 50) ? "transform 0.1s linear" : "",
          transform: $mdUtil.supplant("rotate({0}deg)", [value >= 50 ? 45 : (value / 50 * 180 - 135)])
        });

      leftC.css(toVendorCSS(leftStyles));
      rightC.css(toVendorCSS(rightStyles));
      gap.css(toVendorCSS(gapStyles));

    }

    /**
     * We will scale the progress circle based on the default diameter.
     *
     * Determine the diameter percentage (defaults to 100%)
     * May be express as float, percentage, or integer
     */
    function getDiameterRatio() {
      if ( !attr.mdDiameter ) return DEFAULT_SCALING;

      var match = /([0-9]*)%/.exec(attr.mdDiameter);
      var value = Math.max(0, (match && match[1]/100) || parseFloat(attr.mdDiameter));

      // should return ratio; DEFAULT_PROGRESS_SIZE === 100px is default size
      return  (value > 1) ? value / DEFAULT_PROGRESS_SIZE : value;
    }

    /**
     * Is the md-mode a valid option?
     */
    function mode() {
      var value = (attr.mdMode || "").trim();
      if ( value ) {
        switch(value) {
          case MODE_DETERMINATE :
          case MODE_INDETERMINATE :
            break;
          default:
            value = undefined;
            break;
        }
      }
      return value;
    }

  }

  /**
   * Clamps the value to be between 0 and 100.
   * @param {number} value The value to clamp.
   * @returns {number}
   */
  function clamp(value) {
    return Math.max(0, Math.min(value || 0, 100));
  }

  function removeEmptyValues(target) {
    for (var key in target) {
      if (target.hasOwnProperty(key)) {
        if ( target[key] == "" ) delete target[key];
      }
    }

    return target;
  }
}
MdProgressCircularDirective.$inject = ["$mdTheming", "$mdUtil", "$log"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.progressLinear
 * @description Linear Progress module!
 */
angular.module('material.components.progressLinear', [
  'material.core'
])
  .directive('mdProgressLinear', MdProgressLinearDirective);

/**
 * @ngdoc directive
 * @name mdProgressLinear
 * @module material.components.progressLinear
 * @restrict E
 *
 * @description
 * The linear progress directive is used to make loading content
 * in your app as delightful and painless as possible by minimizing
 * the amount of visual change a user sees before they can view
 * and interact with content.
 *
 * Each operation should only be represented by one activity indicator
 * For example: one refresh operation should not display both a
 * refresh bar and an activity circle.
 *
 * For operations where the percentage of the operation completed
 * can be determined, use a determinate indicator. They give users
 * a quick sense of how long an operation will take.
 *
 * For operations where the user is asked to wait a moment while
 * something finishes up, and it’s not necessary to expose what's
 * happening behind the scenes and how long it will take, use an
 * indeterminate indicator.
 *
 * @param {string} md-mode Select from one of four modes: determinate, indeterminate, buffer or query.
 *
 * Note: if the `md-mode` value is set as undefined or specified as 1 of the four (4) valid modes, then `.ng-hide`
 * will be auto-applied as a style to the component.
 *
 * Note: if not configured, the `md-mode="indeterminate"` will be auto injected as an attribute. If `value=""` is also specified, however,
 * then `md-mode="determinate"` would be auto-injected instead.
 * @param {number=} value In determinate and buffer modes, this number represents the percentage of the primary progress bar. Default: 0
 * @param {number=} md-buffer-value In the buffer mode, this number represents the percentage of the secondary progress bar. Default: 0
 *
 * @usage
 * <hljs lang="html">
 * <md-progress-linear md-mode="determinate" value="..."></md-progress-linear>
 *
 * <md-progress-linear md-mode="determinate" ng-value="..."></md-progress-linear>
 *
 * <md-progress-linear md-mode="indeterminate"></md-progress-linear>
 *
 * <md-progress-linear md-mode="buffer" value="..." md-buffer-value="..."></md-progress-linear>
 *
 * <md-progress-linear md-mode="query"></md-progress-linear>
 * </hljs>
 */
function MdProgressLinearDirective($mdTheming, $mdUtil, $log) {
  var MODE_DETERMINATE = "determinate",
      MODE_INDETERMINATE = "indeterminate",
      MODE_BUFFER = "buffer",
      MODE_QUERY = "query";

  return {
    restrict: 'E',
    template: '<div class="md-container">' +
      '<div class="md-dashed"></div>' +
      '<div class="md-bar md-bar1"></div>' +
      '<div class="md-bar md-bar2"></div>' +
      '</div>',
    compile: compile
  };
  
  function compile(tElement, tAttrs, transclude) {
    tElement.attr('aria-valuemin', 0);
    tElement.attr('aria-valuemax', 100);
    tElement.attr('role', 'progressbar');

    return postLink;
  }
  function postLink(scope, element, attr) {
    $mdTheming(element);

    var lastMode, toVendorCSS = $mdUtil.dom.animator.toCss;
    var bar1 = angular.element(element[0].querySelector('.md-bar1')),
        bar2 = angular.element(element[0].querySelector('.md-bar2')),
        container = angular.element(element[0].querySelector('.md-container'));

    element.attr('md-mode', mode());

    validateMode();
    watchAttributes();

    /**
     * Watch the value, md-buffer-value, and md-mode attributes
     */
    function watchAttributes() {
      attr.$observe('value', function(value) {
        var percentValue = clamp(value);
        element.attr('aria-valuenow', percentValue);

        if (mode() != MODE_QUERY) animateIndicator(bar2, percentValue);
      });

      attr.$observe('mdBufferValue', function(value) {
        animateIndicator(bar1, clamp(value));
      });

      attr.$observe('mdMode',function(mode){
        switch( mode ) {
          case MODE_QUERY:
          case MODE_BUFFER:
          case MODE_DETERMINATE:
          case MODE_INDETERMINATE:
            container.removeClass( 'ng-hide' + ' ' + lastMode );
            container.addClass( lastMode = "md-mode-" + mode );
            break;
          default:
            container.removeClass( lastMode );
            container.addClass('ng-hide');
            lastMode = undefined;
            break;
        }
      });
    }

    /**
     * Auto-defaults the mode to either `determinate` or `indeterminate` mode; if not specified
     */
    function validateMode() {
      if ( angular.isUndefined(attr.mdMode) ) {
        var hasValue = angular.isDefined(attr.value);
        var mode = hasValue ? MODE_DETERMINATE : MODE_INDETERMINATE;
        var info = "Auto-adding the missing md-mode='{0}' to the ProgressLinear element";

        $log.debug( $mdUtil.supplant(info, [mode]) );

        element.attr("md-mode",mode);
        attr['mdMode'] = mode;
      }
    }

    /**
     * Is the md-mode a valid option?
     */
    function mode() {
      var value = (attr.mdMode || "").trim();
      if ( value ) {
        switch(value) {
          case MODE_DETERMINATE:
          case MODE_INDETERMINATE:
          case MODE_BUFFER:
          case MODE_QUERY:
            break;
          default:
            value = undefined;
            break;
        }
      }
      return value;
    }

    /**
     * Manually set CSS to animate the Determinate indicator based on the specified
     * percentage value (0-100).
     */
    function animateIndicator(target, value) {
      if ( !mode() ) return;

      var to = $mdUtil.supplant("translateX({0}%) scale({1},1)", [ (value-100)/2, value/100 ]);
      var styles = toVendorCSS({ transform : to });
      angular.element(target).css( styles );
    }
  }

  /**
   * Clamps the value to be between 0 and 100.
   * @param {number} value The value to clamp.
   * @returns {number}
   */
  function clamp(value) {
    return Math.max(0, Math.min(value || 0, 100));
  }
}
MdProgressLinearDirective.$inject = ["$mdTheming", "$mdUtil", "$log"];


})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.radioButton
 * @description radioButton module!
 */
angular.module('material.components.radioButton', [
  'material.core'
])
  .directive('mdRadioGroup', mdRadioGroupDirective)
  .directive('mdRadioButton', mdRadioButtonDirective);

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name mdRadioGroup
 *
 * @restrict E
 *
 * @description
 * The `<md-radio-group>` directive identifies a grouping
 * container for the 1..n grouped radio buttons; specified using nested
 * `<md-radio-button>` tags.
 *
 * As per the [material design spec](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
 * the radio button is in the accent color by default. The primary color palette may be used with
 * the `md-primary` class.
 *
 * Note: `<md-radio-group>` and `<md-radio-button>` handle tabindex differently
 * than the native `<input type='radio'>` controls. Whereas the native controls
 * force the user to tab through all the radio buttons, `<md-radio-group>`
 * is focusable, and by default the `<md-radio-button>`s are not.
 *
 * @param {string} ng-model Assignable angular expression to data-bind to.
 * @param {boolean=} md-no-ink Use of attribute indicates flag to disable ink ripple effects.
 *
 * @usage
 * <hljs lang="html">
 * <md-radio-group ng-model="selected">
 *
 *   <md-radio-button
 *        ng-repeat="d in colorOptions"
 *        ng-value="d.value" aria-label="{{ d.label }}">
 *
 *          {{ d.label }}
 *
 *   </md-radio-button>
 *
 * </md-radio-group>
 * </hljs>
 *
 */
function mdRadioGroupDirective($mdUtil, $mdConstant, $mdTheming, $timeout) {
  RadioGroupController.prototype = createRadioGroupControllerProto();

  return {
    restrict: 'E',
    controller: ['$element', RadioGroupController],
    require: ['mdRadioGroup', '?ngModel'],
    link: { pre: linkRadioGroup }
  };

  function linkRadioGroup(scope, element, attr, ctrls) {
    $mdTheming(element);
    var rgCtrl = ctrls[0];
    var ngModelCtrl = ctrls[1] || $mdUtil.fakeNgModel();

    rgCtrl.init(ngModelCtrl);

    scope.mouseActive = false;
    element.attr({
              'role': 'radiogroup',
              'tabIndex': element.attr('tabindex') || '0'
            })
            .on('keydown', keydownListener)
            .on('mousedown', function(event) {
              scope.mouseActive = true;
              $timeout(function() {
                scope.mouseActive = false;
              }, 100);
            })
            .on('focus', function() {
              if(scope.mouseActive === false) { rgCtrl.$element.addClass('md-focused'); }
            })
            .on('blur', function() { rgCtrl.$element.removeClass('md-focused'); });

    /**
     *
     */
    function setFocus() {
      if (!element.hasClass('md-focused')) { element.addClass('md-focused'); }
    }

    /**
     *
     */
    function keydownListener(ev) {
      var keyCode = ev.which || ev.keyCode;
      switch(keyCode) {
        case $mdConstant.KEY_CODE.LEFT_ARROW:
        case $mdConstant.KEY_CODE.UP_ARROW:
          ev.preventDefault();
          rgCtrl.selectPrevious();
          setFocus();
          break;

        case $mdConstant.KEY_CODE.RIGHT_ARROW:
        case $mdConstant.KEY_CODE.DOWN_ARROW:
          ev.preventDefault();
          rgCtrl.selectNext();
          setFocus();
          break;

        case $mdConstant.KEY_CODE.ENTER:
          var form = angular.element($mdUtil.getClosest(element[0], 'form'));
          if (form.length > 0) {
            form.triggerHandler('submit');
          }
          break;
      }
    }
  }

  function RadioGroupController($element) {
    this._radioButtonRenderFns = [];
    this.$element = $element;
  }

  function createRadioGroupControllerProto() {
    return {
      init: function(ngModelCtrl) {
        this._ngModelCtrl = ngModelCtrl;
        this._ngModelCtrl.$render = angular.bind(this, this.render);
      },
      add: function(rbRender) {
        this._radioButtonRenderFns.push(rbRender);
      },
      remove: function(rbRender) {
        var index = this._radioButtonRenderFns.indexOf(rbRender);
        if (index !== -1) {
          this._radioButtonRenderFns.splice(index, 1);
        }
      },
      render: function() {
        this._radioButtonRenderFns.forEach(function(rbRender) {
          rbRender();
        });
      },
      setViewValue: function(value, eventType) {
        this._ngModelCtrl.$setViewValue(value, eventType);
        // update the other radio buttons as well
        this.render();
      },
      getViewValue: function() {
        return this._ngModelCtrl.$viewValue;
      },
      selectNext: function() {
        return changeSelectedButton(this.$element, 1);
      },
      selectPrevious: function() {
        return changeSelectedButton(this.$element, -1);
      },
      setActiveDescendant: function (radioId) {
        this.$element.attr('aria-activedescendant', radioId);
      }
    };
  }
  /**
   * Change the radio group's selected button by a given increment.
   * If no button is selected, select the first button.
   */
  function changeSelectedButton(parent, increment) {
    // Coerce all child radio buttons into an array, then wrap then in an iterator
    var buttons = $mdUtil.iterator(parent[0].querySelectorAll('md-radio-button'), true);

    if (buttons.count()) {
      var validate = function (button) {
        // If disabled, then NOT valid
        return !angular.element(button).attr("disabled");
      };

      var selected = parent[0].querySelector('md-radio-button.md-checked');
      var target = buttons[increment < 0 ? 'previous' : 'next'](selected, validate) || buttons.first();

      // Activate radioButton's click listener (triggerHandler won't create a real click event)
      angular.element(target).triggerHandler('click');


    }
  }

}
mdRadioGroupDirective.$inject = ["$mdUtil", "$mdConstant", "$mdTheming", "$timeout"];

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name mdRadioButton
 *
 * @restrict E
 *
 * @description
 * The `<md-radio-button>`directive is the child directive required to be used within `<md-radio-group>` elements.
 *
 * While similar to the `<input type="radio" ng-model="" value="">` directive,
 * the `<md-radio-button>` directive provides ink effects, ARIA support, and
 * supports use within named radio groups.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} ngChange Angular expression to be executed when input changes due to user
 *    interaction with the input element.
 * @param {string} ngValue Angular expression which sets the value to which the expression should
 *    be set when selected.
 * @param {string} value The value to which the expression should be set when selected.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {string=} aria-label Adds label to radio button for accessibility.
 * Defaults to radio button's text. If no text content is available, a warning will be logged.
 *
 * @usage
 * <hljs lang="html">
 *
 * <md-radio-button value="1" aria-label="Label 1">
 *   Label 1
 * </md-radio-button>
 *
 * <md-radio-button ng-model="color" ng-value="specialValue" aria-label="Green">
 *   Green
 * </md-radio-button>
 *
 * </hljs>
 *
 */
function mdRadioButtonDirective($mdAria, $mdUtil, $mdTheming) {

  var CHECKED_CSS = 'md-checked';

  return {
    restrict: 'E',
    require: '^mdRadioGroup',
    transclude: true,
    template: '<div class="md-container" md-ink-ripple md-ink-ripple-checkbox>' +
                '<div class="md-off"></div>' +
                '<div class="md-on"></div>' +
              '</div>' +
              '<div ng-transclude class="md-label"></div>',
    link: link
  };

  function link(scope, element, attr, rgCtrl) {
    var lastChecked;

    $mdTheming(element);
    configureAria(element, scope);

    initialize();

    /**
     *
     */
    function initialize(controller) {
      if ( !rgCtrl ) {
        throw 'RadioGroupController not found.';
      }

      rgCtrl.add(render);
      attr.$observe('value', render);

      element
        .on('click', listener)
        .on('$destroy', function() {
          rgCtrl.remove(render);
        });
    }

    /**
     *
     */
    function listener(ev) {
      if (element[0].hasAttribute('disabled')) return;

      scope.$apply(function() {
        rgCtrl.setViewValue(attr.value, ev && ev.type);
      });
    }

    /**
     *  Add or remove the `.md-checked` class from the RadioButton (and conditionally its parent).
     *  Update the `aria-activedescendant` attribute.
     */
    function render() {
      var checked = (rgCtrl.getViewValue() == attr.value);
      if (checked === lastChecked) {
        return;
      }

      lastChecked = checked;
      element.attr('aria-checked', checked);

      if (checked) {
        markParentAsChecked(true);
        element.addClass(CHECKED_CSS);

        rgCtrl.setActiveDescendant(element.attr('id'));

      } else {
        markParentAsChecked(false);
        element.removeClass(CHECKED_CSS);
      }

      /**
       * If the radioButton is inside a div, then add class so highlighting will work...
       */
      function markParentAsChecked(addClass ) {
        if ( element.parent()[0].nodeName != "MD-RADIO-GROUP") {
          element.parent()[ !!addClass ? 'addClass' : 'removeClass'](CHECKED_CSS);
        }

      }
    }

    /**
     * Inject ARIA-specific attributes appropriate for each radio button
     */
    function configureAria( element, scope ){
      scope.ariaId = buildAriaID();

      element.attr({
        'id' :  scope.ariaId,
        'role' : 'radio',
        'aria-checked' : 'false'
      });

      $mdAria.expectWithText(element, 'aria-label');

      /**
       * Build a unique ID for each radio button that will be used with aria-activedescendant.
       * Preserve existing ID if already specified.
       * @returns {*|string}
       */
      function buildAriaID() {
        return attr.id || ( 'radio' + "_" + $mdUtil.nextUid() );
      }
    }
  }
}
mdRadioButtonDirective.$inject = ["$mdAria", "$mdUtil", "$mdTheming"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.select
 */

/***************************************************

 ### TODO ###
 **DOCUMENTATION AND DEMOS**

 - [ ] ng-model with child mdOptions (basic)
 - [ ] ng-model="foo" ng-model-options="{ trackBy: '$value.id' }" for objects
 - [ ] mdOption with value
 - [ ] Usage with input inside

 ### TODO - POST RC1 ###
 - [ ] Abstract placement logic in $mdSelect service to $mdMenu service

 ***************************************************/

var SELECT_EDGE_MARGIN = 8;
var selectNextId = 0;

angular.module('material.components.select', [
    'material.core',
    'material.components.backdrop'
  ])
  .directive('mdSelect', SelectDirective)
  .directive('mdSelectMenu', SelectMenuDirective)
  .directive('mdOption', OptionDirective)
  .directive('mdOptgroup', OptgroupDirective)
  .provider('$mdSelect', SelectProvider);

/**
 * @ngdoc directive
 * @name mdSelect
 * @restrict E
 * @module material.components.select
 *
 * @description Displays a select box, bound to an ng-model.
 *
 * @param {expression} ng-model The model!
 * @param {boolean=} multiple Whether it's multiple.
 * @param {expression=} md-on-close Expression to be evaluated when the select is closed.
 * @param {string=} placeholder Placeholder hint text.
 * @param {string=} aria-label Optional label for accessibility. Only necessary if no placeholder or
 * explicit label is present.
 * @param {string=} md-container-class Class list to get applied to the `.md-select-menu-container`
 * element (for custom styling).
 *
 * @usage
 * With a placeholder (label and aria-label are added dynamically)
 * <hljs lang="html">
 *   <md-input-container>
 *     <md-select
 *       ng-model="someModel"
 *       placeholder="Select a state">
 *       <md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option>
 *     </md-select>
 *   </md-input-container>
 * </hljs>
 *
 * With an explicit label
 * <hljs lang="html">
 *   <md-input-container>
 *     <label>State</label>
 *     <md-select
 *       ng-model="someModel">
 *       <md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option>
 *     </md-select>
 *   </md-input-container>
 * </hljs>
 */
function SelectDirective($mdSelect, $mdUtil, $mdTheming, $mdAria, $compile, $parse) {
  return {
    restrict: 'E',
    require: ['^?mdInputContainer', 'mdSelect', 'ngModel', '?^form'],
    compile: compile,
    controller: function() {
    } // empty placeholder controller to be initialized in link
  };

  function compile(element, attr) {
    // add the select value that will hold our placeholder or selected option value
    var valueEl = angular.element('<md-select-value><span></span></md-select-value>');
    valueEl.append('<span class="md-select-icon" aria-hidden="true"></span>');
    valueEl.addClass('md-select-value');
    if (!valueEl[0].hasAttribute('id')) {
      valueEl.attr('id', 'select_value_label_' + $mdUtil.nextUid());
    }

    // There's got to be an md-content inside. If there's not one, let's add it.
    if (!element.find('md-content').length) {
      element.append(angular.element('<md-content>').append(element.contents()));
    }

    // Add progress spinner for md-options-loading
    if (attr.mdOnOpen) {

      // Show progress indicator while loading async
      // Use ng-hide for `display:none` so the indicator does not interfere with the options list
      element
        .find('md-content')
        .prepend(angular.element(
          '<div>' +
          ' <md-progress-circular md-mode="{{progressMode}}" ng-hide="$$loadingAsyncDone"></md-progress-circular>' +
          '</div>'
        ));

      // Hide list [of item options] while loading async
      element
        .find('md-option')
        .attr('ng-show', '$$loadingAsyncDone');
    }

    if (attr.name) {
      var autofillClone = angular.element('<select class="md-visually-hidden">');
      autofillClone.attr({
        'name': '.' + attr.name,
        'ng-model': attr.ngModel,
        'aria-hidden': 'true',
        'tabindex': '-1'
      });
      var opts = element.find('md-option');
      angular.forEach(opts, function(el) {
        var newEl = angular.element('<option>' + el.innerHTML + '</option>');
        if (el.hasAttribute('ng-value')) newEl.attr('ng-value', el.getAttribute('ng-value'));
        else if (el.hasAttribute('value')) newEl.attr('value', el.getAttribute('value'));
        autofillClone.append(newEl);
      });

      element.parent().append(autofillClone);
    }

    // Use everything that's left inside element.contents() as the contents of the menu
    var multiple = angular.isDefined(attr.multiple) ? 'multiple' : '';
    var selectTemplate = '' +
      '<div class="md-select-menu-container">' +
      '<md-select-menu {0}>{1}</md-select-menu>' +
      '</div>';

    selectTemplate = $mdUtil.supplant(selectTemplate, [multiple, element.html()]);
    element.empty().append(valueEl);

    attr.tabindex = attr.tabindex || '0';

    return function postLink(scope, element, attr, ctrls) {
      var isDisabled;

      var containerCtrl = ctrls[0];
      var mdSelectCtrl = ctrls[1];
      var ngModelCtrl = ctrls[2];
      var formCtrl = ctrls[3];
      // grab a reference to the select menu value label
      var valueEl = element.find('md-select-value');
      var isReadonly = angular.isDefined(attr.readonly);

      if (containerCtrl) {
        var isErrorGetter = containerCtrl.isErrorGetter || function() {
            return ngModelCtrl.$invalid && ngModelCtrl.$touched;
          };

        if (containerCtrl.input) {
          throw new Error("<md-input-container> can only have *one* child <input>, <textarea> or <select> element!");
        }

        containerCtrl.input = element;
        if (!containerCtrl.label) {
          $mdAria.expect(element, 'aria-label', element.attr('placeholder'));
        }

        scope.$watch(isErrorGetter, containerCtrl.setInvalid);
      }

      var selectContainer, selectScope, selectMenuCtrl;

      createSelect();
      $mdTheming(element);

      if (attr.name && formCtrl) {
        var selectEl = element.parent()[0].querySelector('select[name=".' + attr.name + '"]');
        var controller = angular.element(selectEl).controller();
        if (controller) {
          formCtrl.$removeControl(controller);
        }
      }

      if (formCtrl) {
        $mdUtil.nextTick(function() {
          formCtrl.$setPristine();
        });
      }

      var originalRender = ngModelCtrl.$render;
      ngModelCtrl.$render = function() {
        originalRender();
        syncLabelText();
        inputCheckValue();
      };

      attr.$observe('placeholder', ngModelCtrl.$render);

      mdSelectCtrl.setLabelText = function(text) {
        mdSelectCtrl.setIsPlaceholder(!text);
        // Use placeholder attribute, otherwise fallback to the md-input-container label
        var tmpPlaceholder = attr.placeholder || (containerCtrl && containerCtrl.label ? containerCtrl.label.text() : '');
        text = text || tmpPlaceholder || '';
        var target = valueEl.children().eq(0);
        target.text(text);
      };

      mdSelectCtrl.setIsPlaceholder = function(isPlaceholder) {
        if (isPlaceholder) {
          valueEl.addClass('md-select-placeholder');
          if (containerCtrl && containerCtrl.label) {
            containerCtrl.label.addClass('md-placeholder md-static');
          }
        } else {
          valueEl.removeClass('md-select-placeholder');
          if (containerCtrl && containerCtrl.label) {
            containerCtrl.label.removeClass('md-placeholder');
          }
        }
      };

      if (!isReadonly) {
        element
          .on('focus', function(ev) {
            // only set focus on if we don't currently have a selected value. This avoids the "bounce"
            // on the label transition because the focus will immediately switch to the open menu.
            if (containerCtrl && containerCtrl.element.hasClass('md-input-has-value')) {
              containerCtrl.setFocused(true);
            }
          })
          .on('blur', function(ev) {
            containerCtrl && containerCtrl.setFocused(false);
            inputCheckValue();
          });
      }

      mdSelectCtrl.triggerClose = function() {
        $parse(attr.mdOnClose)(scope);
      };

      scope.$$postDigest(function() {
        setAriaLabel();
        syncLabelText();
      });

      function setAriaLabel() {
        var labelText = element.attr('placeholder');
        if (!labelText && containerCtrl && containerCtrl.label) {
          labelText = containerCtrl.label.text();
        }
        $mdAria.expect(element, 'aria-label', labelText);
      }

      function syncLabelText() {
        if (selectContainer) {
          selectMenuCtrl = selectMenuCtrl || selectContainer.find('md-select-menu').controller('mdSelectMenu');
          mdSelectCtrl.setLabelText(selectMenuCtrl.selectedLabels());
        }
      }

      var deregisterWatcher;
      attr.$observe('ngMultiple', function(val) {
        if (deregisterWatcher) deregisterWatcher();
        var parser = $parse(val);
        deregisterWatcher = scope.$watch(function() {
          return parser(scope);
        }, function(multiple, prevVal) {
          if (multiple === undefined && prevVal === undefined) return; // assume compiler did a good job
          if (multiple) {
            element.attr('multiple', 'multiple');
          } else {
            element.removeAttr('multiple');
          }
          if (selectContainer) {
            selectMenuCtrl.setMultiple(multiple);
            originalRender = ngModelCtrl.$render;
            ngModelCtrl.$render = function() {
              originalRender();
              syncLabelText();
            };
            selectMenuCtrl.refreshViewValue();
            ngModelCtrl.$render();
          }
        });
      });

      attr.$observe('disabled', function(disabled) {
        if (angular.isString(disabled)) {
          disabled = true;
        }
        // Prevent click event being registered twice
        if (isDisabled !== undefined && isDisabled === disabled) {
          return;
        }
        isDisabled = disabled;
        if (disabled) {
          element.attr({'tabindex': -1, 'aria-disabled': 'true'});
          element.off('click', openSelect);
          element.off('keydown', handleKeypress);
        } else {
          element.attr({'tabindex': attr.tabindex, 'aria-disabled': 'false'});
          element.on('click', openSelect);
          element.on('keydown', handleKeypress);
        }
      });

      if (!attr.disabled && !attr.ngDisabled) {
        element.attr({'tabindex': attr.tabindex, 'aria-disabled': 'false'});
        element.on('click', openSelect);
        element.on('keydown', handleKeypress);
      }

      var ariaAttrs = {
        role: 'combobox',
        'aria-expanded': 'false'
      };
      if (!element[0].hasAttribute('id')) {
        ariaAttrs.id = 'select_' + $mdUtil.nextUid();
      }
      element.attr(ariaAttrs);

      scope.$on('$destroy', function() {
        $mdSelect
          .destroy()
          .finally(function() {
            if ( selectContainer ) {
              selectContainer.remove();
            }

            if (containerCtrl) {
              containerCtrl.setFocused(false);
              containerCtrl.setHasValue(false);
              containerCtrl.input = null;
            }
          });
      });



      function inputCheckValue() {
        // The select counts as having a value if one or more options are selected,
        // or if the input's validity state says it has bad input (eg string in a number input)
        containerCtrl && containerCtrl.setHasValue(selectMenuCtrl.selectedLabels().length > 0 || (element[0].validity || {}).badInput);
      }

      // Create a fake select to find out the label value
      function createSelect() {
        selectContainer = angular.element(selectTemplate);
        var selectEl = selectContainer.find('md-select-menu');
        selectEl.data('$ngModelController', ngModelCtrl);
        selectEl.data('$mdSelectController', mdSelectCtrl);
        selectScope = scope.$new();
        $mdTheming.inherit(selectContainer, element);
        if (element.attr('md-container-class')) {
          var value = selectContainer[0].getAttribute('class') + ' ' + element.attr('md-container-class');
          selectContainer[0].setAttribute('class', value);
        }
        selectContainer = $compile(selectContainer)(selectScope);
        selectMenuCtrl = selectContainer.find('md-select-menu').controller('mdSelectMenu');
      }

      function handleKeypress(e) {
        var allowedCodes = [32, 13, 38, 40];
        if (allowedCodes.indexOf(e.keyCode) != -1) {
          // prevent page scrolling on interaction
          e.preventDefault();
          openSelect(e);
        } else {
          if (e.keyCode <= 90 && e.keyCode >= 31) {
            e.preventDefault();
            var node = selectMenuCtrl.optNodeForKeyboardSearch(e);
            if (!node) return;
            var optionCtrl = angular.element(node).controller('mdOption');
            if (!selectMenuCtrl.isMultiple) {
              selectMenuCtrl.deselect(Object.keys(selectMenuCtrl.selected)[0]);
            }
            selectMenuCtrl.select(optionCtrl.hashKey, optionCtrl.value);
            selectMenuCtrl.refreshViewValue();
            ngModelCtrl.$render();
          }
        }
      }

      function openSelect() {
        selectScope.isOpen = true;

        $mdSelect.show({
          scope: selectScope,
          preserveScope: true,
          skipCompile: true,
          element: selectContainer,
          target: element[0],
          hasBackdrop: true,
          loadingAsync: attr.mdOnOpen ? scope.$eval(attr.mdOnOpen) || true : false
        }).then(function() {
          selectScope.isOpen = false;
        });
      }
    };
  }
}
SelectDirective.$inject = ["$mdSelect", "$mdUtil", "$mdTheming", "$mdAria", "$compile", "$parse"];

function SelectMenuDirective($parse, $mdUtil, $mdTheming) {

  SelectMenuController.$inject = ["$scope", "$attrs", "$element"];
  return {
    restrict: 'E',
    require: ['mdSelectMenu', '?ngModel'],
    controller: SelectMenuController,
    link: {pre: preLink}
  };

  // We use preLink instead of postLink to ensure that the select is initialized before
  // its child options run postLink.
  function preLink(scope, element, attr, ctrls) {
    var selectCtrl = ctrls[0];
    var ngModel = ctrls[1];

    $mdTheming(element);
    element.on('click', clickListener);
    element.on('keypress', keyListener);
    if (ngModel) selectCtrl.init(ngModel);
    configureAria();

    function configureAria() {
      element.attr({
        'id': 'select_menu_' + $mdUtil.nextUid(),
        'role': 'listbox',
        'aria-multiselectable': (selectCtrl.isMultiple ? 'true' : 'false')
      });
    }

    function keyListener(e) {
      if (e.keyCode == 13 || e.keyCode == 32) {
        clickListener(e);
      }
    }

    function clickListener(ev) {
      var option = $mdUtil.getClosest(ev.target, 'md-option');
      var optionCtrl = option && angular.element(option).data('$mdOptionController');
      if (!option || !optionCtrl) return;
      if (option.hasAttribute('disabled')) {
        ev.stopImmediatePropagation();
        return false;
      }

      var optionHashKey = selectCtrl.hashGetter(optionCtrl.value);
      var isSelected = angular.isDefined(selectCtrl.selected[optionHashKey]);

      scope.$apply(function() {
        if (selectCtrl.isMultiple) {
          if (isSelected) {
            selectCtrl.deselect(optionHashKey);
          } else {
            selectCtrl.select(optionHashKey, optionCtrl.value);
          }
        } else {
          if (!isSelected) {
            selectCtrl.deselect(Object.keys(selectCtrl.selected)[0]);
            selectCtrl.select(optionHashKey, optionCtrl.value);
          }
        }
        selectCtrl.refreshViewValue();
      });
    }
  }

  function SelectMenuController($scope, $attrs, $element) {
    var self = this;
    self.isMultiple = angular.isDefined($attrs.multiple);
    // selected is an object with keys matching all of the selected options' hashed values
    self.selected = {};
    // options is an object with keys matching every option's hash value,
    // and values matching every option's controller.
    self.options = {};

    $scope.$watch(function() {
      return self.options;
    }, function() {
      self.ngModel.$render();
    }, true);

    var deregisterCollectionWatch;
    var defaultIsEmpty;
    self.setMultiple = function(isMultiple) {
      var ngModel = self.ngModel;
      defaultIsEmpty = defaultIsEmpty || ngModel.$isEmpty;

      self.isMultiple = isMultiple;
      if (deregisterCollectionWatch) deregisterCollectionWatch();

      if (self.isMultiple) {
        ngModel.$validators['md-multiple'] = validateArray;
        ngModel.$render = renderMultiple;

        // watchCollection on the model because by default ngModel only watches the model's
        // reference. This allowed the developer to also push and pop from their array.
        $scope.$watchCollection($attrs.ngModel, function(value) {
          if (validateArray(value)) renderMultiple(value);
          self.ngModel.$setPristine();
        });

        ngModel.$isEmpty = function(value) {
          return !value || value.length === 0;
        };
      } else {
        delete ngModel.$validators['md-multiple'];
        ngModel.$render = renderSingular;
      }

      function validateArray(modelValue, viewValue) {
        // If a value is truthy but not an array, reject it.
        // If value is undefined/falsy, accept that it's an empty array.
        return angular.isArray(modelValue || viewValue || []);
      }
    };

    var searchStr = '';
    var clearSearchTimeout, optNodes, optText;
    var CLEAR_SEARCH_AFTER = 300;
    self.optNodeForKeyboardSearch = function(e) {
      clearSearchTimeout && clearTimeout(clearSearchTimeout);
      clearSearchTimeout = setTimeout(function() {
        clearSearchTimeout = undefined;
        searchStr = '';
        optText = undefined;
        optNodes = undefined;
      }, CLEAR_SEARCH_AFTER);
      searchStr += String.fromCharCode(e.keyCode);
      var search = new RegExp('^' + searchStr, 'i');
      if (!optNodes) {
        optNodes = $element.find('md-option');
        optText = new Array(optNodes.length);
        angular.forEach(optNodes, function(el, i) {
          optText[i] = el.textContent.trim();
        });
      }
      for (var i = 0; i < optText.length; ++i) {
        if (search.test(optText[i])) {
          return optNodes[i];
        }
      }
    };

    self.init = function(ngModel) {
      self.ngModel = ngModel;

      // Allow users to provide `ng-model="foo" ng-model-options="{trackBy: 'foo.id'}"` so
      // that we can properly compare objects set on the model to the available options
      if (ngModel.$options && ngModel.$options.trackBy) {
        var trackByLocals = {};
        var trackByParsed = $parse(ngModel.$options.trackBy);
        self.hashGetter = function(value, valueScope) {
          trackByLocals.$value = value;
          return trackByParsed(valueScope || $scope, trackByLocals);
        };
        // If the user doesn't provide a trackBy, we automatically generate an id for every
        // value passed in
      } else {
        self.hashGetter = function getHashValue(value) {
          if (angular.isObject(value)) {
            return 'object_' + (value.$$mdSelectId || (value.$$mdSelectId = ++selectNextId));
          }
          return value;
        };
      }
      self.setMultiple(self.isMultiple);
    };

    self.selectedLabels = function() {
      var selectedOptionEls = $mdUtil.nodesToArray($element[0].querySelectorAll('md-option[selected]'));
      if (selectedOptionEls.length) {
        return selectedOptionEls.map(function(el) {
          return el.textContent;
        }).join(', ');
      } else {
        return '';
      }
    };

    self.select = function(hashKey, hashedValue) {
      var option = self.options[hashKey];
      option && option.setSelected(true);
      self.selected[hashKey] = hashedValue;
    };
    self.deselect = function(hashKey) {
      var option = self.options[hashKey];
      option && option.setSelected(false);
      delete self.selected[hashKey];
    };

    self.addOption = function(hashKey, optionCtrl) {
      if (angular.isDefined(self.options[hashKey])) {
        throw new Error('Duplicate md-option values are not allowed in a select. ' +
          'Duplicate value "' + optionCtrl.value + '" found.');
      }
      self.options[hashKey] = optionCtrl;

      // If this option's value was already in our ngModel, go ahead and select it.
      if (angular.isDefined(self.selected[hashKey])) {
        self.select(hashKey, optionCtrl.value);
        self.refreshViewValue();
      }
    };
    self.removeOption = function(hashKey) {
      delete self.options[hashKey];
      // Don't deselect an option when it's removed - the user's ngModel should be allowed
      // to have values that do not match a currently available option.
    };

    self.refreshViewValue = function() {
      var values = [];
      var option;
      for (var hashKey in self.selected) {
        // If this hashKey has an associated option, push that option's value to the model.
        if ((option = self.options[hashKey])) {
          values.push(option.value);
        } else {
          // Otherwise, the given hashKey has no associated option, and we got it
          // from an ngModel value at an earlier time. Push the unhashed value of
          // this hashKey to the model.
          // This allows the developer to put a value in the model that doesn't yet have
          // an associated option.
          values.push(self.selected[hashKey]);
        }
      }
      self.ngModel.$setViewValue(self.isMultiple ? values : values[0]);
    };

    function renderMultiple() {
      var newSelectedValues = self.ngModel.$modelValue || self.ngModel.$viewValue || [];
      if (!angular.isArray(newSelectedValues)) return;

      var oldSelected = Object.keys(self.selected);

      var newSelectedHashes = newSelectedValues.map(self.hashGetter);
      var deselected = oldSelected.filter(function(hash) {
        return newSelectedHashes.indexOf(hash) === -1;
      });

      deselected.forEach(self.deselect);
      newSelectedHashes.forEach(function(hashKey, i) {
        self.select(hashKey, newSelectedValues[i]);
      });
    }

    function renderSingular() {
      var value = self.ngModel.$viewValue || self.ngModel.$modelValue;
      Object.keys(self.selected).forEach(self.deselect);
      self.select(self.hashGetter(value), value);
    }
  }

}
SelectMenuDirective.$inject = ["$parse", "$mdUtil", "$mdTheming"];

function OptionDirective($mdButtonInkRipple, $mdUtil) {

  OptionController.$inject = ["$element"];
  return {
    restrict: 'E',
    require: ['mdOption', '^^mdSelectMenu'],
    controller: OptionController,
    compile: compile
  };

  function compile(element, attr) {
    // Manual transclusion to avoid the extra inner <span> that ng-transclude generates
    element.append(angular.element('<div class="md-text">').append(element.contents()));

    element.attr('tabindex', attr.tabindex || '0');
    return postLink;
  }

  function postLink(scope, element, attr, ctrls) {
    var optionCtrl = ctrls[0];
    var selectCtrl = ctrls[1];

    if (angular.isDefined(attr.ngValue)) {
      scope.$watch(attr.ngValue, setOptionValue);
    } else if (angular.isDefined(attr.value)) {
      setOptionValue(attr.value);
    } else {
      scope.$watch(function() {
        return element.text();
      }, setOptionValue);
    }

    attr.$observe('disabled', function(disabled) {
      if (disabled) {
        element.attr('tabindex', '-1');
      } else {
        element.attr('tabindex', '0');
      }
    });

    scope.$$postDigest(function() {
      attr.$observe('selected', function(selected) {
        if (!angular.isDefined(selected)) return;
        if (typeof selected == 'string') selected = true;
        if (selected) {
          if (!selectCtrl.isMultiple) {
            selectCtrl.deselect(Object.keys(selectCtrl.selected)[0]);
          }
          selectCtrl.select(optionCtrl.hashKey, optionCtrl.value);
        } else {
          selectCtrl.deselect(optionCtrl.hashKey);
        }
        selectCtrl.refreshViewValue();
        selectCtrl.ngModel.$render();
      });
    });

    $mdButtonInkRipple.attach(scope, element);
    configureAria();

    function setOptionValue(newValue, oldValue) {
      var oldHashKey = selectCtrl.hashGetter(oldValue, scope);
      var newHashKey = selectCtrl.hashGetter(newValue, scope);

      optionCtrl.hashKey = newHashKey;
      optionCtrl.value = newValue;

      selectCtrl.removeOption(oldHashKey, optionCtrl);
      selectCtrl.addOption(newHashKey, optionCtrl);
    }

    scope.$on('$destroy', function() {
      selectCtrl.removeOption(optionCtrl.hashKey, optionCtrl);
    });

    function configureAria() {
      var ariaAttrs = {
        'role': 'option',
        'aria-selected': 'false'
      };

      if (!element[0].hasAttribute('id')) {
        ariaAttrs.id = 'select_option_' + $mdUtil.nextUid();
      }
      element.attr(ariaAttrs);
    }
  }

  function OptionController($element) {
    this.selected = false;
    this.setSelected = function(isSelected) {
      if (isSelected && !this.selected) {
        $element.attr({
          'selected': 'selected',
          'aria-selected': 'true'
        });
      } else if (!isSelected && this.selected) {
        $element.removeAttr('selected');
        $element.attr('aria-selected', 'false');
      }
      this.selected = isSelected;
    };
  }

}
OptionDirective.$inject = ["$mdButtonInkRipple", "$mdUtil"];

function OptgroupDirective() {
  return {
    restrict: 'E',
    compile: compile
  };
  function compile(el, attrs) {
    var labelElement = el.find('label');
    if (!labelElement.length) {
      labelElement = angular.element('<label>');
      el.prepend(labelElement);
    }
    if (attrs.label) labelElement.text(attrs.label);
  }
}

function SelectProvider($$interimElementProvider) {
  selectDefaultOptions.$inject = ["$mdSelect", "$mdConstant", "$mdUtil", "$window", "$q", "$$rAF", "$animateCss", "$animate"];
  return $$interimElementProvider('$mdSelect')
    .setDefaults({
      methods: ['target'],
      options: selectDefaultOptions
    });

  /* @ngInject */
  function selectDefaultOptions($mdSelect, $mdConstant, $mdUtil, $window, $q, $$rAF, $animateCss, $animate) {
    var ERRROR_TARGET_EXPECTED = "$mdSelect.show() expected a target element in options.target but got '{0}'!";
    var animator = $mdUtil.dom.animator;

    return {
      parent: 'body',
      themable: true,
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: true
    };

    /**
     * Interim-element onRemove logic....
     */
    function onRemove(scope, element, opts) {
      opts = opts || { };
      opts.cleanupInteraction();
      opts.cleanupResizing();
      opts.hideBackdrop();

      // For navigation $destroy events, do a quick, non-animated removal,
      // but for normal closes (from clicks, etc) animate the removal

      return  (opts.$destroy === true) ? detachAndClean() : animateRemoval().then( detachAndClean );

      /**
       * For normal closes (eg clicks), animate the removal.
       * For forced closes (like $destroy events from navigation),
       * skip the animations
       */
      function animateRemoval() {
        return $animateCss(element, {addClass: 'md-leave'}).start();
      }

      /**
       * Detach the element and cleanup prior changes
       */
      function detachAndClean() {
        configureAria(opts.target, false);

        element.attr('opacity', 0);
        element.removeClass('md-active');
        detachElement(element, opts);

        announceClosed(opts);

        if (!opts.$destroy && opts.restoreFocus) {
          opts.target.focus();
        }
      }

    }

    /**
     * Interim-element onShow logic....
     */
    function onShow(scope, element, opts) {

      watchAsyncLoad();
      sanitizeAndConfigure(scope, opts);
      configureAria(opts.target);

      opts.hideBackdrop = showBackdrop(scope, element, opts);

      return showDropDown(scope, element, opts)
        .then(function(response) {
          opts.alreadyOpen = true;
          opts.cleanupInteraction = activateInteraction();
          opts.cleanupResizing = activateResizing();

          return response;
        }, opts.hideBackdrop);

      // ************************************
      // Closure Functions
      // ************************************

      /**
       *  Attach the select DOM element(s) and animate to the correct positions
       *  and scalings...
       */
      function showDropDown(scope, element, opts) {
        opts.parent.append(element);

        return $q(function(resolve, reject) {

          try {

            $animateCss(element, {removeClass: 'md-leave', duration: 0})
              .start()
              .then(positionAndFocusMenu)
              .then(resolve);

          } catch (e) {
            reject(e);
          }

        });
      }

      /**
       * Initialize container and dropDown menu positions/scale, then animate
       * to show... and autoFocus.
       */
      function positionAndFocusMenu() {
        return $q(function(resolve) {
          if (opts.isRemoved) return $q.reject(false);

          var info = calculateMenuPositions(scope, element, opts);

          info.container.element.css(animator.toCss(info.container.styles));
          info.dropDown.element.css(animator.toCss(info.dropDown.styles));

          $$rAF(function() {
            element.addClass('md-active');
            info.dropDown.element.css(animator.toCss({transform: ''}));

            autoFocus(opts.focusedNode);
            resolve();
          });

        });
      }

      /**
       * Show modal backdrop element...
       */
      function showBackdrop(scope, element, options) {

        // If we are not within a dialog...
        if (options.disableParentScroll && !$mdUtil.getClosest(options.target, 'MD-DIALOG')) {
          // !! DO this before creating the backdrop; since disableScrollAround()
          //    configures the scroll offset; which is used by mdBackDrop postLink()
          options.restoreScroll = $mdUtil.disableScrollAround(options.element, options.parent);
        } else {
          options.disableParentScroll = false;
        }

        if (options.hasBackdrop) {
          // Override duration to immediately show invisible backdrop
          options.backdrop = $mdUtil.createBackdrop(scope, "md-select-backdrop md-click-catcher");
          $animate.enter(options.backdrop, options.parent, null, {duration: 0});
        }

        /**
         * Hide modal backdrop element...
         */
        return function hideBackdrop() {
          if (options.backdrop) options.backdrop.remove();
          if (options.disableParentScroll) options.restoreScroll();

          delete options.restoreScroll;
        }
      }

      /**
       *
       */
      function autoFocus(focusedNode) {
        if (focusedNode && !focusedNode.hasAttribute('disabled')) {
          focusedNode.focus();
        }
      }

      /**
       * Check for valid opts and set some sane defaults
       */
      function sanitizeAndConfigure(scope, options) {
        var selectEl = element.find('md-select-menu');

        if (!options.target) {
          throw new Error($mdUtil.supplant(ERRROR_TARGET_EXPECTED, [options.target]));
        }

        angular.extend(options, {
          isRemoved: false,
          target: angular.element(options.target), //make sure it's not a naked dom node
          parent: angular.element(options.parent),
          selectEl: selectEl,
          contentEl: element.find('md-content'),
          optionNodes: selectEl[0].getElementsByTagName('md-option')
        });
      }

      /**
       * Configure various resize listeners for screen changes
       */
      function activateResizing() {
        var debouncedOnResize = (function(scope, target, options) {

          return function() {
            if (options.isRemoved) return;

            var updates = calculateMenuPositions(scope, target, options);
            var container = updates.container;
            var dropDown = updates.dropDown;

            container.element.css(animator.toCss(container.styles));
            dropDown.element.css(animator.toCss(dropDown.styles));
          };

        })(scope, element, opts);

        var window = angular.element($window);
        window.on('resize', debouncedOnResize);
        window.on('orientationchange', debouncedOnResize);

        // Publish deactivation closure...
        return function deactivateResizing() {

          // Disable resizing handlers
          window.off('resize', debouncedOnResize);
          window.off('orientationchange', debouncedOnResize);
        }
      }

      /**
       *  If asynchronously loading, watch and update internal
       *  '$$loadingAsyncDone' flag
       */
      function watchAsyncLoad() {
        if (opts.loadingAsync && !opts.isRemoved) {
          scope.$$loadingAsyncDone = false;
          scope.progressMode = 'indeterminate';

          $q.when(opts.loadingAsync)
            .then(function() {
              scope.$$loadingAsyncDone = true;
              scope.progressMode = '';
              delete opts.loadingAsync;
            }).then(function() {
              $$rAF(positionAndFocusMenu);
            })
        }
      }

      /**
       *
       */
      function activateInteraction() {
        if (opts.isRemoved) return;

        var dropDown = opts.selectEl;
        var selectCtrl = dropDown.controller('mdSelectMenu') || {};

        element.addClass('md-clickable');

        // Close on backdrop click
        opts.backdrop && opts.backdrop.on('click', onBackdropClick);

        // Escape to close
        // Cycling of options, and closing on enter
        dropDown.on('keydown', onMenuKeyDown);
        dropDown.on('mouseup', checkCloseMenu);

        return function cleanupInteraction() {
          opts.backdrop && opts.backdrop.off('click', onBackdropClick);
          dropDown.off('keydown', onMenuKeyDown);
          dropDown.off('mouseup', checkCloseMenu);

          element.removeClass('md-clickable');
          opts.isRemoved = true;
        };

        // ************************************
        // Closure Functions
        // ************************************

        function onBackdropClick(e) {
          e.preventDefault();
          e.stopPropagation();
          opts.restoreFocus = false;
          $mdUtil.nextTick($mdSelect.hide, true);
        }

        function onMenuKeyDown(ev) {
          var keyCodes = $mdConstant.KEY_CODE;

          switch (ev.keyCode) {
            case keyCodes.UP_ARROW:
              return focusPrevOption();
              break;
            case keyCodes.DOWN_ARROW:
              return focusNextOption();
              break;
            case keyCodes.SPACE:
            case keyCodes.ENTER:
              var option = $mdUtil.getClosest(ev.target, 'md-option');
              if (option) {
                dropDown.triggerHandler({
                  type: 'click',
                  target: option
                });
                ev.preventDefault();
              }
              checkCloseMenu(ev);
              break;
            case keyCodes.TAB:
            case keyCodes.ESCAPE:
              ev.preventDefault();
              opts.restoreFocus = true;
              $mdUtil.nextTick($mdSelect.hide, true);
              break;
            default:
              if (ev.keyCode >= 31 && ev.keyCode <= 90) {
                var optNode = dropDown.controller('mdSelectMenu').optNodeForKeyboardSearch(ev);
                opts.focusedNode = optNode || opts.focusedNode;
                optNode && optNode.focus();
              }
          }
        }

        function focusOption(direction) {
          var optionsArray = $mdUtil.nodesToArray(opts.optionNodes);
          var index = optionsArray.indexOf(opts.focusedNode);

          var newOption;

          do {
            if (index === -1) {
              // We lost the previously focused element, reset to first option
              index = 0;
            } else if (direction === 'next' && index < optionsArray.length - 1) {
              index++;
            } else if (direction === 'prev' && index > 0) {
              index--;
            }
            newOption = optionsArray[index];
            if (newOption.hasAttribute('disabled')) newOption = undefined;
          } while (!newOption && index < optionsArray.length - 1 && index > 0)
          newOption && newOption.focus();
          opts.focusedNode = newOption;
        }

        function focusNextOption() {
          focusOption('next');
        }

        function focusPrevOption() {
          focusOption('prev');
        }

        function checkCloseMenu(ev) {
          if (ev && ( ev.type == 'mouseup') && (ev.currentTarget != dropDown[0])) return;
          if ( mouseOnScrollbar() ) return;

          if (!selectCtrl.isMultiple) {
            opts.restoreFocus = true;

            $mdUtil.nextTick(function() {
              $mdSelect.hide(selectCtrl.ngModel.$viewValue);
            }, true);
          }

          /**
           * check if the mouseup event was on a scrollbar
           */
          function mouseOnScrollbar() {
            var clickOnScrollbar = false;
            if (ev && (ev.currentTarget.children.length > 0)) {
              var child = ev.currentTarget.children[0];
              var hasScrollbar = child.scrollHeight > child.clientHeight;
              if (hasScrollbar && child.children.length > 0) {
                var relPosX = ev.pageX - ev.currentTarget.getBoundingClientRect().left;
                if (relPosX > child.querySelector('md-option').offsetWidth)
                  clickOnScrollbar = true;
              }
            }
            return clickOnScrollbar;
          }
        }
      }

    }

    /**
     *
     */
    function configureAria(element, isExpanded) {
      isExpanded = angular.isUndefined(isExpanded) ? 'true' : 'false';
      element && element.attr('aria-expanded', isExpanded);
    }

    /**
     * To notify listeners that the Select menu has closed,
     * trigger the [optional] user-defined expression
     */
    function announceClosed(opts) {
      var mdSelect = opts.selectEl.controller('mdSelect');
      if (mdSelect) {
        var menuController = opts.selectEl.controller('mdSelectMenu');
        mdSelect.setLabelText(menuController.selectedLabels());
        mdSelect.triggerClose();
      }
    }

    /**
     * Use browser to remove this element without triggering a $destroy event
     */
    function detachElement(element, opts) {
      if (element[0].parentNode === opts.parent[0]) {
        opts.parent[0].removeChild(element[0]);
      }
    }

    /**
     * Calculate the
     */
    function calculateMenuPositions(scope, element, opts) {
      var optionNodes,
        containerNode = element[0],
        targetNode = opts.target[0].firstElementChild, // target the label
        parentNode = opts.parent[0],
        selectNode = opts.selectEl[0],
        contentNode = opts.contentEl[0],
        parentRect = parentNode.getBoundingClientRect(),
        targetRect = targetNode.getBoundingClientRect(),
        shouldOpenAroundTarget = false,
        bounds = {
          left: parentRect.left + SELECT_EDGE_MARGIN,
          top: SELECT_EDGE_MARGIN,
          bottom: parentRect.height - SELECT_EDGE_MARGIN,
          right: parentRect.width - SELECT_EDGE_MARGIN - ($mdUtil.floatingScrollbars() ? 16 : 0)
        },
        spaceAvailable = {
          top: targetRect.top - bounds.top,
          left: targetRect.left - bounds.left,
          right: bounds.right - (targetRect.left + targetRect.width),
          bottom: bounds.bottom - (targetRect.top + targetRect.height)
        },
        maxWidth = parentRect.width - SELECT_EDGE_MARGIN * 2,
        isScrollable = contentNode.scrollHeight > contentNode.offsetHeight,
        selectedNode = selectNode.querySelector('md-option[selected]'),
        optionNodes = selectNode.getElementsByTagName('md-option'),
        optgroupNodes = selectNode.getElementsByTagName('md-optgroup');

      var loading = isPromiseLike(opts.loadingAsync);
      var centeredNode;
      if (!loading) {
        // If a selected node, center around that
        if (selectedNode) {
          centeredNode = selectedNode;
          // If there are option groups, center around the first option group
        } else if (optgroupNodes.length) {
          centeredNode = optgroupNodes[0];
          // Otherwise - if we are not loading async - center around the first optionNode
        } else if (optionNodes.length) {
          centeredNode = optionNodes[0];
          // In case there are no options, center on whatever's in there... (eg progress indicator)
        } else {
          centeredNode = contentNode.firstElementChild || contentNode;
        }
      } else {
        // If loading, center on progress indicator
        centeredNode = contentNode.firstElementChild || contentNode;
      }

      if (contentNode.offsetWidth > maxWidth) {
        contentNode.style['max-width'] = maxWidth + 'px';
      }
      if (shouldOpenAroundTarget) {
        contentNode.style['min-width'] = targetRect.width + 'px';
      }

      // Remove padding before we compute the position of the menu
      if (isScrollable) {
        selectNode.classList.add('md-overflow');
      }

      var focusedNode = centeredNode;
      if ((focusedNode.tagName || '').toUpperCase() === 'MD-OPTGROUP') {
        focusedNode = optionNodes[0] || contentNode.firstElementChild || contentNode;
        centeredNode = focusedNode;
      }
      // Cache for autoFocus()
      opts.focusedNode = focusedNode;

      // Get the selectMenuRect *after* max-width is possibly set above
      var selectMenuRect = selectNode.getBoundingClientRect();
      var centeredRect = getOffsetRect(centeredNode);

      if (centeredNode) {
        var centeredStyle = $window.getComputedStyle(centeredNode);
        centeredRect.paddingLeft = parseInt(centeredStyle.paddingLeft, 10) || 0;
        centeredRect.paddingRight = parseInt(centeredStyle.paddingRight, 10) || 0;
      }

      if (isScrollable) {
        var scrollBuffer = contentNode.offsetHeight / 2;
        contentNode.scrollTop = centeredRect.top + centeredRect.height / 2 - scrollBuffer;

        if (spaceAvailable.top < scrollBuffer) {
          contentNode.scrollTop = Math.min(
            centeredRect.top,
            contentNode.scrollTop + scrollBuffer - spaceAvailable.top
          );
        } else if (spaceAvailable.bottom < scrollBuffer) {
          contentNode.scrollTop = Math.max(
            centeredRect.top + centeredRect.height - selectMenuRect.height,
            contentNode.scrollTop - scrollBuffer + spaceAvailable.bottom
          );
        }
      }

      var left, top, transformOrigin, minWidth;
      if (shouldOpenAroundTarget) {
        left = targetRect.left;
        top = targetRect.top + targetRect.height;
        transformOrigin = '50% 0';
        if (top + selectMenuRect.height > bounds.bottom) {
          top = targetRect.top - selectMenuRect.height;
          transformOrigin = '50% 100%';
        }
      } else {
        left = (targetRect.left + centeredRect.left - centeredRect.paddingLeft) + 2;
        top = Math.floor(targetRect.top + targetRect.height / 2 - centeredRect.height / 2 -
            centeredRect.top + contentNode.scrollTop) + 2;

        transformOrigin = (centeredRect.left + targetRect.width / 2) + 'px ' +
          (centeredRect.top + centeredRect.height / 2 - contentNode.scrollTop) + 'px 0px';

        minWidth = targetRect.width + centeredRect.paddingLeft + centeredRect.paddingRight;
      }

      // Keep left and top within the window
      var containerRect = containerNode.getBoundingClientRect();
      var scaleX = Math.round(100 * Math.min(targetRect.width / selectMenuRect.width, 1.0)) / 100;
      var scaleY = Math.round(100 * Math.min(targetRect.height / selectMenuRect.height, 1.0)) / 100;

      return {
        container: {
          element: angular.element(containerNode),
          styles: {
            left: Math.floor(clamp(bounds.left, left, bounds.right - containerRect.width)),
            top: Math.floor(clamp(bounds.top, top, bounds.bottom - containerRect.height)),
            'min-width': minWidth
          }
        },
        dropDown: {
          element: angular.element(selectNode),
          styles: {
            transformOrigin: transformOrigin,
            transform: !opts.alreadyOpen ? $mdUtil.supplant('scale({0},{1})', [scaleX, scaleY]) : ""
          }
        }
      };

    }

  }

  function isPromiseLike(obj) {
    return obj && angular.isFunction(obj.then);
  }

  function clamp(min, n, max) {
    return Math.max(min, Math.min(n, max));
  }

  function getOffsetRect(node) {
    return node ? {
      left: node.offsetLeft,
      top: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight
    } : {left: 0, top: 0, width: 0, height: 0};
  }
}
SelectProvider.$inject = ["$$interimElementProvider"];


})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */
angular
  .module('material.components.sidenav', [
    'material.core',
    'material.components.backdrop'
  ])
  .factory('$mdSidenav', SidenavService )
  .directive('mdSidenav', SidenavDirective)
  .directive('mdSidenavFocus', SidenavFocusDirective)
  .controller('$mdSidenavController', SidenavController);


/**
 * @ngdoc service
 * @name $mdSidenav
 * @module material.components.sidenav
 *
 * @description
 * `$mdSidenav` makes it easy to interact with multiple sidenavs
 * in an app.
 *
 * @usage
 * <hljs lang="js">
 * // Async lookup for sidenav instance; will resolve when the instance is available
 * $mdSidenav(componentId).then(function(instance) {
 *   $log.debug( componentId + "is now ready" );
 * });
 * // Async toggle the given sidenav;
 * // when instance is known ready and lazy lookup is not needed.
 * $mdSidenav(componentId)
 *    .toggle()
 *    .then(function(){
 *      $log.debug('toggled');
 *    });
 * // Async open the given sidenav
 * $mdSidenav(componentId)
 *    .open()
 *    .then(function(){
 *      $log.debug('opened');
 *    });
 * // Async close the given sidenav
 * $mdSidenav(componentId)
 *    .close()
 *    .then(function(){
 *      $log.debug('closed');
 *    });
 * // Sync check to see if the specified sidenav is set to be open
 * $mdSidenav(componentId).isOpen();
 * // Sync check to whether given sidenav is locked open
 * // If this is true, the sidenav will be open regardless of close()
 * $mdSidenav(componentId).isLockedOpen();
 * </hljs>
 */
function SidenavService($mdComponentRegistry, $q) {
  return function(handle) {

    // Lookup the controller instance for the specified sidNav instance
    var self;
    var errorMsg = "SideNav '" + handle + "' is not available!";
    var instance = $mdComponentRegistry.get(handle);

    if(!instance) {
      $mdComponentRegistry.notFoundError(handle);
    }

    return self = {
      // -----------------
      // Sync methods
      // -----------------
      isOpen: function() {
        return instance && instance.isOpen();
      },
      isLockedOpen: function() {
        return instance && instance.isLockedOpen();
      },
      // -----------------
      // Async methods
      // -----------------
      toggle: function() {
        return instance ? instance.toggle() : $q.reject(errorMsg);
      },
      open: function() {
        return instance ? instance.open() : $q.reject(errorMsg);
      },
      close: function() {
        return instance ? instance.close() : $q.reject(errorMsg);
      },
      then : function( callbackFn ) {
        var promise = instance ? $q.when(instance) : waitForInstance();
        return promise.then( callbackFn || angular.noop );
      }
    };

    /**
     * Deferred lookup of component instance using $component registry
     */
    function waitForInstance() {
      return $mdComponentRegistry
                .when(handle)
                .then(function( it ){
                  instance = it;
                  return it;
                });
    }
  };
}
SidenavService.$inject = ["$mdComponentRegistry", "$q"];
/**
 * @ngdoc directive
 * @name mdSidenavFocus
 * @module material.components.sidenav
 *
 * @restrict A
 *
 * @description
 * `mdSidenavFocus` provides a way to specify the focused element when a sidenav opens.
 * This is completely optional, as the sidenav itself is focused by default.
 *
 * @usage
 * <hljs lang="html">
 * <md-sidenav>
 *   <form>
 *     <md-input-container>
 *       <label for="testInput">Label</label>
 *       <input id="testInput" type="text" md-sidenav-focus>
 *     </md-input-container>
 *   </form>
 * </md-sidenav>
 * </hljs>
 **/
function SidenavFocusDirective() {
  return {
    restrict: 'A',
    require: '^mdSidenav',
    link: function(scope, element, attr, sidenavCtrl) {
      // @see $mdUtil.findFocusTarget(...)
    }
  };
}
/**
 * @ngdoc directive
 * @name mdSidenav
 * @module material.components.sidenav
 * @restrict E
 *
 * @description
 *
 * A Sidenav component that can be opened and closed programatically.
 *
 * By default, upon opening it will slide out on top of the main content area.
 *
 * For keyboard and screen reader accessibility, focus is sent to the sidenav wrapper by default.
 * It can be overridden with the `md-autofocus` directive on the child element you want focused.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="row" ng-controller="MyController">
 *   <md-sidenav md-component-id="left" class="md-sidenav-left">
 *     Left Nav!
 *   </md-sidenav>
 *
 *   <md-content>
 *     Center Content
 *     <md-button ng-click="openLeftMenu()">
 *       Open Left Menu
 *     </md-button>
 *   </md-content>
 *
 *   <md-sidenav md-component-id="right"
 *     md-is-locked-open="$mdMedia('min-width: 333px')"
 *     class="md-sidenav-right">
 *     <form>
 *       <md-input-container>
 *         <label for="testInput">Test input</label>
 *         <input id="testInput" type="text"
 *                ng-model="data" md-autofocus>
 *       </md-input-container>
 *     </form>
 *   </md-sidenav>
 * </div>
 * </hljs>
 *
 * <hljs lang="js">
 * var app = angular.module('myApp', ['ngMaterial']);
 * app.controller('MyController', function($scope, $mdSidenav) {
 *   $scope.openLeftMenu = function() {
 *     $mdSidenav('left').toggle();
 *   };
 * });
 * </hljs>
 *
 * @param {expression=} md-is-open A model bound to whether the sidenav is opened.
 * @param {string=} md-component-id componentId to use with $mdSidenav service.
 * @param {expression=} md-is-locked-open When this expression evalutes to true,
 * the sidenav 'locks open': it falls into the content's flow instead
 * of appearing over it. This overrides the `is-open` attribute.
 *
 * The $mdMedia() service is exposed to the is-locked-open attribute, which
 * can be given a media query or one of the `sm`, `gt-sm`, `md`, `gt-md`, `lg` or `gt-lg` presets.
 * Examples:
 *
 *   - `<md-sidenav md-is-locked-open="shouldLockOpen"></md-sidenav>`
 *   - `<md-sidenav md-is-locked-open="$mdMedia('min-width: 1000px')"></md-sidenav>`
 *   - `<md-sidenav md-is-locked-open="$mdMedia('sm')"></md-sidenav>` (locks open on small screens)
 */
function SidenavDirective($mdMedia, $mdUtil, $mdConstant, $mdTheming, $animate, $compile, $parse, $log, $q, $document) {
  return {
    restrict: 'E',
    scope: {
      isOpen: '=?mdIsOpen'
    },
    controller: '$mdSidenavController',
    compile: function(element) {
      element.addClass('md-closed');
      element.attr('tabIndex', '-1');
      return postLink;
    }
  };

  /**
   * Directive Post Link function...
   */
  function postLink(scope, element, attr, sidenavCtrl) {
    var lastParentOverFlow;
    var triggeringElement = null;
    var promise = $q.when(true);

    var isLockedOpenParsed = $parse(attr.mdIsLockedOpen);
    var isLocked = function() {
      return isLockedOpenParsed(scope.$parent, {
        $media: function(arg) {
          $log.warn("$media is deprecated for is-locked-open. Use $mdMedia instead.");
          return $mdMedia(arg);
        },
        $mdMedia: $mdMedia
      });
    };
    var backdrop = $mdUtil.createBackdrop(scope, "md-sidenav-backdrop md-opaque ng-enter");

    $mdTheming.inherit(backdrop, element);

    element.on('$destroy', function() {
      backdrop.remove();
      sidenavCtrl.destroy();
    });

    scope.$on('$destroy', function(){
      backdrop.remove()
    });

    scope.$watch(isLocked, updateIsLocked);
    scope.$watch('isOpen', updateIsOpen);


    // Publish special accessor for the Controller instance
    sidenavCtrl.$toggleOpen = toggleOpen;

    /**
     * Toggle the DOM classes to indicate `locked`
     * @param isLocked
     */
    function updateIsLocked(isLocked, oldValue) {
      scope.isLockedOpen = isLocked;
      if (isLocked === oldValue) {
        element.toggleClass('md-locked-open', !!isLocked);
      } else {
        $animate[isLocked ? 'addClass' : 'removeClass'](element, 'md-locked-open');
      }
      backdrop.toggleClass('md-locked-open', !!isLocked);
    }

    /**
     * Toggle the SideNav view and attach/detach listeners
     * @param isOpen
     */
    function updateIsOpen(isOpen) {
      // Support deprecated md-sidenav-focus attribute as fallback
      var focusEl = $mdUtil.findFocusTarget(element) || $mdUtil.findFocusTarget(element,'[md-sidenav-focus]') || element;
      var parent = element.parent();

      parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
      backdrop[isOpen ? 'on' : 'off']('click', close);

      if ( isOpen ) {
        // Capture upon opening..
        triggeringElement = $document[0].activeElement;
      }

      disableParentScroll(isOpen);

      return promise = $q.all([
                isOpen ? $animate.enter(backdrop, parent) : $animate.leave(backdrop),
                $animate[isOpen ? 'removeClass' : 'addClass'](element, 'md-closed')
              ])
              .then(function() {
                // Perform focus when animations are ALL done...
                if (scope.isOpen) {
                  focusEl && focusEl.focus();
                }
              });
    }

    /**
     * Prevent parent scrolling (when the SideNav is open)
     */
    function disableParentScroll(disabled) {
      var parent = element.parent();
      if ( disabled && !lastParentOverFlow ) {

        lastParentOverFlow = parent.css('overflow');
        parent.css('overflow', 'hidden');

      } else if (angular.isDefined(lastParentOverFlow)) {

        parent.css('overflow', lastParentOverFlow);
        lastParentOverFlow = undefined;

      }
    }

    /**
     * Toggle the sideNav view and publish a promise to be resolved when
     * the view animation finishes.
     *
     * @param isOpen
     * @returns {*}
     */
    function toggleOpen( isOpen ) {
      if (scope.isOpen == isOpen ) {

        return $q.when(true);

      } else {
        return $q(function(resolve){
          // Toggle value to force an async `updateIsOpen()` to run
          scope.isOpen = isOpen;

          $mdUtil.nextTick(function() {
            // When the current `updateIsOpen()` animation finishes
            promise.then(function(result) {

              if ( !scope.isOpen ) {
                // reset focus to originating element (if available) upon close
                triggeringElement && triggeringElement.focus();
                triggeringElement = null;
              }

              resolve(result);
            });
          });

        });

      }
    }

    /**
     * Auto-close sideNav when the `escape` key is pressed.
     * @param evt
     */
    function onKeyDown(ev) {
      var isEscape = (ev.keyCode === $mdConstant.KEY_CODE.ESCAPE);
      return isEscape ? close(ev) : $q.when(true);
    }

    /**
     * With backdrop `clicks` or `escape` key-press, immediately
     * apply the CSS close transition... Then notify the controller
     * to close() and perform its own actions.
     */
    function close(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      return sidenavCtrl.close();
    }

  }
}
SidenavDirective.$inject = ["$mdMedia", "$mdUtil", "$mdConstant", "$mdTheming", "$animate", "$compile", "$parse", "$log", "$q", "$document"];

/*
 * @private
 * @ngdoc controller
 * @name SidenavController
 * @module material.components.sidenav
 *
 */
function SidenavController($scope, $element, $attrs, $mdComponentRegistry, $q) {

  var self = this;

  // Use Default internal method until overridden by directive postLink

  // Synchronous getters
  self.isOpen = function() { return !!$scope.isOpen; };
  self.isLockedOpen = function() { return !!$scope.isLockedOpen; };

  // Async actions
  self.open   = function() { return self.$toggleOpen( true );  };
  self.close  = function() { return self.$toggleOpen( false ); };
  self.toggle = function() { return self.$toggleOpen( !$scope.isOpen );  };
  self.$toggleOpen = function(value) { return $q.when($scope.isOpen = value); };

  self.destroy = $mdComponentRegistry.register(self, $attrs.mdComponentId);
}
SidenavController.$inject = ["$scope", "$element", "$attrs", "$mdComponentRegistry", "$q"];

})();
(function(){
"use strict";

  /**
   * @ngdoc module
   * @name material.components.slider
   */
  angular.module('material.components.slider', [
    'material.core'
  ])
  .directive('mdSlider', SliderDirective);

/**
 * @ngdoc directive
 * @name mdSlider
 * @module material.components.slider
 * @restrict E
 * @description
 * The `<md-slider>` component allows the user to choose from a range of
 * values.
 *
 * As per the [material design spec](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
 * the slider is in the accent color by default. The primary color palette may be used with
 * the `md-primary` class.
 *
 * It has two modes: 'normal' mode, where the user slides between a wide range
 * of values, and 'discrete' mode, where the user slides between only a few
 * select values.
 *
 * To enable discrete mode, add the `md-discrete` attribute to a slider,
 * and use the `step` attribute to change the distance between
 * values the user is allowed to pick.
 *
 * @usage
 * <h4>Normal Mode</h4>
 * <hljs lang="html">
 * <md-slider ng-model="myValue" min="5" max="500">
 * </md-slider>
 * </hljs>
 * <h4>Discrete Mode</h4>
 * <hljs lang="html">
 * <md-slider md-discrete ng-model="myDiscreteValue" step="10" min="10" max="130">
 * </md-slider>
 * </hljs>
 *
 * @param {boolean=} md-discrete Whether to enable discrete mode.
 * @param {number=} step The distance between values the user is allowed to pick. Default 1.
 * @param {number=} min The minimum value the user is allowed to pick. Default 0.
 * @param {number=} max The maximum value the user is allowed to pick. Default 100.
 */
function SliderDirective($$rAF, $window, $mdAria, $mdUtil, $mdConstant, $mdTheming, $mdGesture, $parse, $log) {
  return {
    scope: {},
    require: '?ngModel',
    template:
      '<div class="md-slider-wrapper">' +
        '<div class="md-track-container">' +
          '<div class="md-track"></div>' +
          '<div class="md-track md-track-fill"></div>' +
          '<div class="md-track-ticks"></div>' +
        '</div>' +
        '<div class="md-thumb-container">' +
          '<div class="md-thumb"></div>' +
          '<div class="md-focus-thumb"></div>' +
          '<div class="md-focus-ring"></div>' +
          '<div class="md-sign">' +
            '<span class="md-thumb-text"></span>' +
          '</div>' +
          '<div class="md-disabled-thumb"></div>' +
        '</div>' +
      '</div>',
    compile: compile
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function compile (tElement, tAttrs) {
    tElement.attr({
      tabIndex: 0,
      role: 'slider'
    });

    $mdAria.expect(tElement, 'aria-label');

    return postLink;
  }

  function postLink(scope, element, attr, ngModelCtrl) {
    $mdTheming(element);
    ngModelCtrl = ngModelCtrl || {
      // Mock ngModelController if it doesn't exist to give us
      // the minimum functionality needed
      $setViewValue: function(val) {
        this.$viewValue = val;
        this.$viewChangeListeners.forEach(function(cb) { cb(); });
      },
      $parsers: [],
      $formatters: [],
      $viewChangeListeners: []
    };

    var isDisabledGetter = angular.noop;
    if (attr.disabled != null) {
      isDisabledGetter = function() { return true; };
    } else if (attr.ngDisabled) {
      isDisabledGetter = angular.bind(null, $parse(attr.ngDisabled), scope.$parent);
    }

    var thumb = angular.element(element[0].querySelector('.md-thumb'));
    var thumbText = angular.element(element[0].querySelector('.md-thumb-text'));
    var thumbContainer = thumb.parent();
    var trackContainer = angular.element(element[0].querySelector('.md-track-container'));
    var activeTrack = angular.element(element[0].querySelector('.md-track-fill'));
    var tickContainer = angular.element(element[0].querySelector('.md-track-ticks'));
    var throttledRefreshDimensions = $mdUtil.throttle(refreshSliderDimensions, 5000);

    // Default values, overridable by attrs
    angular.isDefined(attr.min) ? attr.$observe('min', updateMin) : updateMin(0);
    angular.isDefined(attr.max) ? attr.$observe('max', updateMax) : updateMax(100);
    angular.isDefined(attr.step)? attr.$observe('step', updateStep) : updateStep(1);

    // We have to manually stop the $watch on ngDisabled because it exists
    // on the parent scope, and won't be automatically destroyed when
    // the component is destroyed.
    var stopDisabledWatch = angular.noop;
    if (attr.ngDisabled) {
      stopDisabledWatch = scope.$parent.$watch(attr.ngDisabled, updateAriaDisabled);
    }

    $mdGesture.register(element, 'drag');

    element
      .on('keydown', keydownListener)
      .on('$md.pressdown', onPressDown)
      .on('$md.pressup', onPressUp)
      .on('$md.dragstart', onDragStart)
      .on('$md.drag', onDrag)
      .on('$md.dragend', onDragEnd);

    // On resize, recalculate the slider's dimensions and re-render
    function updateAll() {
      refreshSliderDimensions();
      ngModelRender();
      redrawTicks();
    }
    setTimeout(updateAll, 0);

    var debouncedUpdateAll = $$rAF.throttle(updateAll);
    angular.element($window).on('resize', debouncedUpdateAll);

    scope.$on('$destroy', function() {
      angular.element($window).off('resize', debouncedUpdateAll);
      stopDisabledWatch();
    });

    ngModelCtrl.$render = ngModelRender;
    ngModelCtrl.$viewChangeListeners.push(ngModelRender);
    ngModelCtrl.$formatters.push(minMaxValidator);
    ngModelCtrl.$formatters.push(stepValidator);

    /**
     * Attributes
     */
    var min;
    var max;
    var step;
    function updateMin(value) {
      min = parseFloat(value);
      element.attr('aria-valuemin', value);
      updateAll();
    }
    function updateMax(value) {
      max = parseFloat(value);
      element.attr('aria-valuemax', value);
      updateAll();
    }
    function updateStep(value) {
      step = parseFloat(value);
      redrawTicks();
    }
    function updateAriaDisabled(isDisabled) {
      element.attr('aria-disabled', !!isDisabled);
    }

    // Draw the ticks with canvas.
    // The alternative to drawing ticks with canvas is to draw one element for each tick,
    // which could quickly become a performance bottleneck.
    var tickCanvas, tickCtx;
    function redrawTicks() {
      if (!angular.isDefined(attr.mdDiscrete)) return;
      if ( angular.isUndefined(step) )         return;

      if ( step <= 0 ) {
        var msg = 'Slider step value must be greater than zero when in discrete mode';
        $log.error(msg);
        throw new Error(msg);
      }

      var numSteps = Math.floor( (max - min) / step );
      if (!tickCanvas) {
        tickCanvas = angular.element('<canvas style="position:absolute;">');
        tickContainer.append(tickCanvas);

        var trackTicksStyle = $window.getComputedStyle(tickContainer[0]);
        tickCtx = tickCanvas[0].getContext('2d');
        tickCtx.fillStyle = trackTicksStyle.backgroundColor || 'black';
      }

      var dimensions = getSliderDimensions();
      tickCanvas[0].width = dimensions.width;
      tickCanvas[0].height = dimensions.height;

      var distance;
      for (var i = 0; i <= numSteps; i++) {
        distance = Math.floor(dimensions.width * (i / numSteps));
        tickCtx.fillRect(distance - 1, 0, 2, dimensions.height);
      }
    }


    /**
     * Refreshing Dimensions
     */
    var sliderDimensions = {};
    refreshSliderDimensions();
    function refreshSliderDimensions() {
      sliderDimensions = trackContainer[0].getBoundingClientRect();
    }
    function getSliderDimensions() {
      throttledRefreshDimensions();
      return sliderDimensions;
    }

    /**
     * left/right arrow listener
     */
    function keydownListener(ev) {
      if(element[0].hasAttribute('disabled')) {
        return;
      }

      var changeAmount;
      if (ev.keyCode === $mdConstant.KEY_CODE.LEFT_ARROW) {
        changeAmount = -step;
      } else if (ev.keyCode === $mdConstant.KEY_CODE.RIGHT_ARROW) {
        changeAmount = step;
      }
      if (changeAmount) {
        if (ev.metaKey || ev.ctrlKey || ev.altKey) {
          changeAmount *= 4;
        }
        ev.preventDefault();
        ev.stopPropagation();
        scope.$evalAsync(function() {
          setModelValue(ngModelCtrl.$viewValue + changeAmount);
        });
      }
    }

    /**
     * ngModel setters and validators
     */
    function setModelValue(value) {
      ngModelCtrl.$setViewValue( minMaxValidator(stepValidator(value)) );
    }
    function ngModelRender() {
      if (isNaN(ngModelCtrl.$viewValue)) {
        ngModelCtrl.$viewValue = ngModelCtrl.$modelValue;
      }

      var percent = (ngModelCtrl.$viewValue - min) / (max - min);
      scope.modelValue = ngModelCtrl.$viewValue;
      element.attr('aria-valuenow', ngModelCtrl.$viewValue);
      setSliderPercent(percent);
      thumbText.text( ngModelCtrl.$viewValue );
    }

    function minMaxValidator(value) {
      if (angular.isNumber(value)) {
        return Math.max(min, Math.min(max, value));
      }
    }
    function stepValidator(value) {
      if (angular.isNumber(value)) {
        var formattedValue = (Math.round((value - min) / step) * step + min);
        // Format to 3 digits after the decimal point - fixes #2015.
        return (Math.round(formattedValue * 1000) / 1000);
      }
    }

    /**
     * @param percent 0-1
     */
    function setSliderPercent(percent) {
        var percentStr = (percent * 100) + '%';

        activeTrack.css('width', percentStr);
        thumbContainer.css('left',percentStr);

        element.toggleClass('md-min', percent === 0);
        element.toggleClass('md-max', percent === 1);
    }


    /**
     * Slide listeners
     */
    var isDragging = false;
    var isDiscrete = angular.isDefined(attr.mdDiscrete);

    function onPressDown(ev) {
      if (isDisabledGetter()) return;

      element.addClass('md-active');
      element[0].focus();
      refreshSliderDimensions();

      var exactVal = percentToValue( positionToPercent( ev.pointer.x ));
      var closestVal = minMaxValidator( stepValidator(exactVal) );
      scope.$apply(function() {
        setModelValue( closestVal );
        setSliderPercent( valueToPercent(closestVal));
      });
    }
    function onPressUp(ev) {
      if (isDisabledGetter()) return;

      element.removeClass('md-dragging md-active');

      var exactVal = percentToValue( positionToPercent( ev.pointer.x ));
      var closestVal = minMaxValidator( stepValidator(exactVal) );
      scope.$apply(function() {
        setModelValue(closestVal);
        ngModelRender();
      });
    }
    function onDragStart(ev) {
      if (isDisabledGetter()) return;
      isDragging = true;
      ev.stopPropagation();

      element.addClass('md-dragging');
      setSliderFromEvent(ev);
    }
    function onDrag(ev) {
      if (!isDragging) return;
      ev.stopPropagation();
      setSliderFromEvent(ev);
    }
    function onDragEnd(ev) {
      if (!isDragging) return;
      ev.stopPropagation();
      isDragging = false;
    }

    function setSliderFromEvent(ev) {
      // While panning discrete, update only the
      // visual positioning but not the model value.
      if ( isDiscrete ) adjustThumbPosition( ev.pointer.x );
      else              doSlide( ev.pointer.x );
    }

    /**
     * Slide the UI by changing the model value
     * @param x
     */
    function doSlide( x ) {
      scope.$evalAsync( function() {
        setModelValue( percentToValue( positionToPercent(x) ));
      });
    }

    /**
     * Slide the UI without changing the model (while dragging/panning)
     * @param x
     */
    function adjustThumbPosition( x ) {
      var exactVal = percentToValue( positionToPercent( x ));
      var closestVal = minMaxValidator( stepValidator(exactVal) );
      setSliderPercent( positionToPercent(x) );
      thumbText.text( closestVal );
    }

    /**
     * Convert horizontal position on slider to percentage value of offset from beginning...
     * @param x
     * @returns {number}
     */
    function positionToPercent( x ) {
      return Math.max(0, Math.min(1, (x - sliderDimensions.left) / (sliderDimensions.width)));
    }

    /**
     * Convert percentage offset on slide to equivalent model value
     * @param percent
     * @returns {*}
     */
    function percentToValue( percent ) {
      return (min + percent * (max - min));
    }

    function valueToPercent( val ) {
      return (val - min)/(max - min);
    }
  }
}
SliderDirective.$inject = ["$$rAF", "$window", "$mdAria", "$mdUtil", "$mdConstant", "$mdTheming", "$mdGesture", "$parse", "$log"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.sticky
 * @description
 * Sticky effects for md
 *
 */
angular
  .module('material.components.sticky', [
    'material.core',
    'material.components.content'
  ])
  .factory('$mdSticky', MdSticky);

/**
 * @ngdoc service
 * @name $mdSticky
 * @module material.components.sticky
 *
 * @description
 * The `$mdSticky`service provides a mixin to make elements sticky.
 *
 * @returns A `$mdSticky` function that takes three arguments:
 *   - `scope`
 *   - `element`: The element that will be 'sticky'
 *   - `elementClone`: A clone of the element, that will be shown
 *     when the user starts scrolling past the original element.
 *     If not provided, it will use the result of `element.clone()`.
 */
function MdSticky($document, $mdConstant, $$rAF, $mdUtil) {

  var browserStickySupport = checkStickySupport();

  /**
   * Registers an element as sticky, used internally by directives to register themselves
   */
  return function registerStickyElement(scope, element, stickyClone) {
    var contentCtrl = element.controller('mdContent');
    if (!contentCtrl) return;

    if (browserStickySupport) {
      element.css({
        position: browserStickySupport,
        top: 0,
        'z-index': 2
      });
    } else {
      var $$sticky = contentCtrl.$element.data('$$sticky');
      if (!$$sticky) {
        $$sticky = setupSticky(contentCtrl);
        contentCtrl.$element.data('$$sticky', $$sticky);
      }

      var deregister = $$sticky.add(element, stickyClone || element.clone());
      scope.$on('$destroy', deregister);
    }
  };

  function setupSticky(contentCtrl) {
    var contentEl = contentCtrl.$element;

    // Refresh elements is very expensive, so we use the debounced
    // version when possible.
    var debouncedRefreshElements = $$rAF.throttle(refreshElements);

    // setupAugmentedScrollEvents gives us `$scrollstart` and `$scroll`,
    // more reliable than `scroll` on android.
    setupAugmentedScrollEvents(contentEl);
    contentEl.on('$scrollstart', debouncedRefreshElements);
    contentEl.on('$scroll', onScroll);

    var self;
    return self = {
      prev: null,
      current: null, //the currently stickied item
      next: null,
      items: [],
      add: add,
      refreshElements: refreshElements
    };

    /***************
     * Public
     ***************/
    // Add an element and its sticky clone to this content's sticky collection
    function add(element, stickyClone) {
      stickyClone.addClass('md-sticky-clone');

      var item = {
        element: element,
        clone: stickyClone
      };
      self.items.push(item);

      $mdUtil.nextTick(function() {
        contentEl.prepend(item.clone);
      });

      debouncedRefreshElements();

      return function remove() {
        self.items.forEach(function(item, index) {
          if (item.element[0] === element[0]) {
            self.items.splice(index, 1);
            item.clone.remove();
          }
        });
        debouncedRefreshElements();
      };
    }

    function refreshElements() {
      // Sort our collection of elements by their current position in the DOM.
      // We need to do this because our elements' order of being added may not
      // be the same as their order of display.
      self.items.forEach(refreshPosition);
      self.items = self.items.sort(function(a, b) {
        return a.top < b.top ? -1 : 1;
      });

      // Find which item in the list should be active, 
      // based upon the content's current scroll position
      var item;
      var currentScrollTop = contentEl.prop('scrollTop');
      for (var i = self.items.length - 1; i >= 0; i--) {
        if (currentScrollTop > self.items[i].top) {
          item = self.items[i];
          break;
        }
      }
      setCurrentItem(item);
    }

    /***************
     * Private
     ***************/

    // Find the `top` of an item relative to the content element,
    // and also the height.
    function refreshPosition(item) {
      // Find the top of an item by adding to the offsetHeight until we reach the 
      // content element.
      var current = item.element[0];
      item.top = 0;
      item.left = 0;
      while (current && current !== contentEl[0]) {
        item.top += current.offsetTop;
        item.left += current.offsetLeft;
        current = current.offsetParent;
      }
      item.height = item.element.prop('offsetHeight');
      item.clone.css('margin-left', item.left + 'px');
      if ($mdUtil.floatingScrollbars()) {
        item.clone.css('margin-right', '0');
      }
    }

    // As we scroll, push in and select the correct sticky element.
    function onScroll() {
      var scrollTop = contentEl.prop('scrollTop');
      var isScrollingDown = scrollTop > (onScroll.prevScrollTop || 0);

      // Store the previous scroll so we know which direction we are scrolling
      onScroll.prevScrollTop = scrollTop;

      //
      // AT TOP (not scrolling)
      //
      if (scrollTop === 0) {
        // If we're at the top, just clear the current item and return
        setCurrentItem(null);
        return;
      }

      //
      // SCROLLING DOWN (going towards the next item)
      //
      if (isScrollingDown) {

        // If we've scrolled down past the next item's position, sticky it and return
        if (self.next && self.next.top <= scrollTop) {
          setCurrentItem(self.next);
          return;
        }

        // If the next item is close to the current one, push the current one up out of the way
        if (self.current && self.next && self.next.top - scrollTop <= self.next.height) {
          translate(self.current, scrollTop + (self.next.top - self.next.height - scrollTop));
          return;
        }
      }

      //
      // SCROLLING UP (not at the top & not scrolling down; must be scrolling up)
      //
      if (!isScrollingDown) {

        // If we've scrolled up past the previous item's position, sticky it and return
        if (self.current && self.prev && scrollTop < self.current.top) {
          setCurrentItem(self.prev);
          return;
        }

        // If the next item is close to the current one, pull the current one down into view
        if (self.next && self.current && (scrollTop >= (self.next.top - self.current.height))) {
          translate(self.current, scrollTop + (self.next.top - scrollTop - self.current.height));
          return;
        }
      }

      //
      // Otherwise, just move the current item to the proper place (scrolling up or down)
      //
      if (self.current) {
        translate(self.current, scrollTop);
      }
    }

    function setCurrentItem(item) {
      if (self.current === item) return;
      // Deactivate currently active item
      if (self.current) {
        translate(self.current, null);
        setStickyState(self.current, null);
      }

      // Activate new item if given
      if (item) {
        setStickyState(item, 'active');
      }

      self.current = item;
      var index = self.items.indexOf(item);
      // If index === -1, index + 1 = 0. It works out.
      self.next = self.items[index + 1];
      self.prev = self.items[index - 1];
      setStickyState(self.next, 'next');
      setStickyState(self.prev, 'prev');
    }

    function setStickyState(item, state) {
      if (!item || item.state === state) return;
      if (item.state) {
        item.clone.attr('sticky-prev-state', item.state);
        item.element.attr('sticky-prev-state', item.state);
      }
      item.clone.attr('sticky-state', state);
      item.element.attr('sticky-state', state);
      item.state = state;
    }

    function translate(item, amount) {
      if (!item) return;
      if (amount === null || amount === undefined) {
        if (item.translateY) {
          item.translateY = null;
          item.clone.css($mdConstant.CSS.TRANSFORM, '');
        }
      } else {
        item.translateY = amount;
        item.clone.css(
          $mdConstant.CSS.TRANSFORM,
          'translate3d(' + item.left + 'px,' + amount + 'px,0)'
        );
      }
    }
  }

  // Function to check for browser sticky support
  function checkStickySupport($el) {
    var stickyProp;
    var testEl = angular.element('<div>');
    $document[0].body.appendChild(testEl[0]);

    var stickyProps = ['sticky', '-webkit-sticky'];
    for (var i = 0; i < stickyProps.length; ++i) {
      testEl.css({position: stickyProps[i], top: 0, 'z-index': 2});
      if (testEl.css('position') == stickyProps[i]) {
        stickyProp = stickyProps[i];
        break;
      }
    }
    testEl.remove();
    return stickyProp;
  }

  // Android 4.4 don't accurately give scroll events.
  // To fix this problem, we setup a fake scroll event. We say:
  // > If a scroll or touchmove event has happened in the last DELAY milliseconds, 
  //   then send a `$scroll` event every animationFrame.
  // Additionally, we add $scrollstart and $scrollend events.
  function setupAugmentedScrollEvents(element) {
    var SCROLL_END_DELAY = 200;
    var isScrolling;
    var lastScrollTime;
    element.on('scroll touchmove', function() {
      if (!isScrolling) {
        isScrolling = true;
        $$rAF.throttle(loopScrollEvent);
        element.triggerHandler('$scrollstart');
      }
      element.triggerHandler('$scroll');
      lastScrollTime = +$mdUtil.now();
    });

    function loopScrollEvent() {
      if (+$mdUtil.now() - lastScrollTime > SCROLL_END_DELAY) {
        isScrolling = false;
        element.triggerHandler('$scrollend');
      } else {
        element.triggerHandler('$scroll');
        $$rAF.throttle(loopScrollEvent);
      }
    }
  }

}
MdSticky.$inject = ["$document", "$mdConstant", "$$rAF", "$mdUtil"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.subheader
 * @description
 * SubHeader module
 *
 *  Subheaders are special list tiles that delineate distinct sections of a
 *  list or grid list and are typically related to the current filtering or
 *  sorting criteria. Subheader tiles are either displayed inline with tiles or
 *  can be associated with content, for example, in an adjacent column.
 *
 *  Upon scrolling, subheaders remain pinned to the top of the screen and remain
 *  pinned until pushed on or off screen by the next subheader. @see [Material
 *  Design Specifications](https://www.google.com/design/spec/components/subheaders.html)
 *
 *  > To improve the visual grouping of content, use the system color for your subheaders.
 *
 */
angular
  .module('material.components.subheader', [
    'material.core',
    'material.components.sticky'
  ])
  .directive('mdSubheader', MdSubheaderDirective);

/**
 * @ngdoc directive
 * @name mdSubheader
 * @module material.components.subheader
 *
 * @restrict E
 *
 * @description
 * The `<md-subheader>` directive is a subheader for a section. By default it is sticky.
 * You can make it not sticky by applying the `md-no-sticky` class to the subheader.
 *
 *
 * @usage
 * <hljs lang="html">
 * <md-subheader>Online Friends</md-subheader>
 * </hljs>
 */

function MdSubheaderDirective($mdSticky, $compile, $mdTheming, $mdUtil) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: (
    '<div class="md-subheader">' +
    '  <div class="md-subheader-inner">' +
    '    <span class="md-subheader-content"></span>' +
    '  </div>' +
    '</div>'
    ),
    link: function postLink(scope, element, attr, controllers, transclude) {
      $mdTheming(element);
      var outerHTML = element[0].outerHTML;

      function getContent(el) {
        return angular.element(el[0].querySelector('.md-subheader-content'));
      }

      // Transclude the user-given contents of the subheader
      // the conventional way.
      transclude(scope, function(clone) {
        getContent(element).append(clone);
      });

      // Create another clone, that uses the outer and inner contents
      // of the element, that will be 'stickied' as the user scrolls.
      if (!element.hasClass('md-no-sticky')) {
        transclude(scope, function(clone) {
          // If the user adds an ng-if or ng-repeat directly to the md-subheader element, the
          // compiled clone below will only be a comment tag (since they replace their elements with
          // a comment) which cannot be properly passed to the $mdSticky; so we wrap it in our own
          // DIV to ensure we have something $mdSticky can use
          var wrapperHtml = '<div class="md-subheader-wrapper">' + outerHTML + '</div>';
          var stickyClone = $compile(wrapperHtml)(scope);

          // Append the sticky
          $mdSticky(scope, element, stickyClone);

          // Delay initialization until after any `ng-if`/`ng-repeat`/etc has finished before
          // attempting to create the clone
          $mdUtil.nextTick(function() {
            getContent(stickyClone).append(clone);
          });
        });
      }
    }
  }
}
MdSubheaderDirective.$inject = ["$mdSticky", "$compile", "$mdTheming", "$mdUtil"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.swipe
 * @description Swipe module!
 */
/**
 * @ngdoc directive
 * @module material.components.swipe
 * @name mdSwipeLeft
 *
 * @restrict A
 *
 * @description
 * The md-swipe-left directives allows you to specify custom behavior when an element is swiped
 * left.
 *
 * @usage
 * <hljs lang="html">
 * <div md-swipe-left="onSwipeLeft()">Swipe me left!</div>
 * </hljs>
 */
/**
 * @ngdoc directive
 * @module material.components.swipe
 * @name mdSwipeRight
 *
 * @restrict A
 *
 * @description
 * The md-swipe-right directives allows you to specify custom behavior when an element is swiped
 * right.
 *
 * @usage
 * <hljs lang="html">
 * <div md-swipe-right="onSwipeRight()">Swipe me right!</div>
 * </hljs>
 */

angular.module('material.components.swipe', ['material.core'])
    .directive('mdSwipeLeft', getDirective('SwipeLeft'))
    .directive('mdSwipeRight', getDirective('SwipeRight'));

function getDirective(name) {
  var directiveName = 'md' + name;
  var eventName = '$md.' + name.toLowerCase();

    DirectiveFactory.$inject = ["$parse"];
  return DirectiveFactory;

  /* @ngInject */
  function DirectiveFactory($parse) {
      return { restrict: 'A', link: postLink };
      function postLink(scope, element, attr) {
        var fn = $parse(attr[directiveName]);
        element.on(eventName, function(ev) {
          scope.$apply(function() { fn(scope, { $event: ev }); });
        });
      }
    }
}



})();
(function(){
"use strict";

/**
 * @private
 * @ngdoc module
 * @name material.components.switch
 */

angular.module('material.components.switch', [
  'material.core',
  'material.components.checkbox'
])
  .directive('mdSwitch', MdSwitch);

/**
 * @private
 * @ngdoc directive
 * @module material.components.switch
 * @name mdSwitch
 * @restrict E
 *
 * The switch directive is used very much like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D).
 *
 * As per the [material design spec](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
 * the switch is in the accent color by default. The primary color palette may be used with
 * the `md-primary` class.
 *
 * @param {string} ng-model Assignable angular expression to data-bind to.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {expression=} ng-true-value The value to which the expression should be set when selected.
 * @param {expression=} ng-false-value The value to which the expression should be set when not selected.
 * @param {string=} ng-change Angular expression to be executed when input changes due to user interaction with the input element.
 * @param {boolean=} md-no-ink Use of attribute indicates use of ripple ink effects.
 * @param {string=} aria-label Publish the button label used by screen-readers for accessibility. Defaults to the switch's text.
 *
 * @usage
 * <hljs lang="html">
 * <md-switch ng-model="isActive" aria-label="Finished?">
 *   Finished ?
 * </md-switch>
 *
 * <md-switch md-no-ink ng-model="hasInk" aria-label="No Ink Effects">
 *   No Ink Effects
 * </md-switch>
 *
 * <md-switch ng-disabled="true" ng-model="isDisabled" aria-label="Disabled">
 *   Disabled
 * </md-switch>
 *
 * </hljs>
 */
function MdSwitch(mdCheckboxDirective, $mdUtil, $mdConstant, $parse, $$rAF, $mdGesture) {
  var checkboxDirective = mdCheckboxDirective[0];

  return {
    restrict: 'E',
    priority: 210, // Run before ngAria
    transclude: true,
    template:
      '<div class="md-container">' +
        '<div class="md-bar"></div>' +
        '<div class="md-thumb-container">' +
          '<div class="md-thumb" md-ink-ripple md-ink-ripple-checkbox></div>' +
        '</div>'+
      '</div>' +
      '<div ng-transclude class="md-label"></div>',
    require: '?ngModel',
    compile: mdSwitchCompile
  };

  function mdSwitchCompile(element, attr) {
    var checkboxLink = checkboxDirective.compile(element, attr);
    // No transition on initial load.
    element.addClass('md-dragging');

    return function (scope, element, attr, ngModel) {
      ngModel = ngModel || $mdUtil.fakeNgModel();

      var disabledGetter = null;
      if (attr.disabled != null) {
        disabledGetter = function() { return true; };
      } else if (attr.ngDisabled) {
        disabledGetter = $parse(attr.ngDisabled);
      }

      var thumbContainer = angular.element(element[0].querySelector('.md-thumb-container'));
      var switchContainer = angular.element(element[0].querySelector('.md-container'));

      // no transition on initial load
      $$rAF(function() {
        element.removeClass('md-dragging');
      });

      checkboxLink(scope, element, attr, ngModel);

      if (disabledGetter) {
        scope.$watch(disabledGetter, function(isDisabled) {
          element.attr('tabindex', isDisabled ? -1 : 0);
        });
      }

      // These events are triggered by setup drag
      $mdGesture.register(switchContainer, 'drag');
      switchContainer
        .on('$md.dragstart', onDragStart)
        .on('$md.drag', onDrag)
        .on('$md.dragend', onDragEnd);

      var drag;
      function onDragStart(ev) {
        // Don't go if the switch is disabled.
        if (disabledGetter && disabledGetter(scope)) return;
        ev.stopPropagation();

        element.addClass('md-dragging');
        drag = {width: thumbContainer.prop('offsetWidth')};
        element.removeClass('transition');
      }

      function onDrag(ev) {
        if (!drag) return;
        ev.stopPropagation();
        ev.srcEvent && ev.srcEvent.preventDefault();

        var percent = ev.pointer.distanceX / drag.width;

        //if checked, start from right. else, start from left
        var translate = ngModel.$viewValue ?  1 + percent : percent;
        // Make sure the switch stays inside its bounds, 0-1%
        translate = Math.max(0, Math.min(1, translate));

        thumbContainer.css($mdConstant.CSS.TRANSFORM, 'translate3d(' + (100*translate) + '%,0,0)');
        drag.translate = translate;
      }

      function onDragEnd(ev) {
        if (!drag) return;
        ev.stopPropagation();

        element.removeClass('md-dragging');
        thumbContainer.css($mdConstant.CSS.TRANSFORM, '');

        // We changed if there is no distance (this is a click a click),
        // or if the drag distance is >50% of the total.
        var isChanged = ngModel.$viewValue ? drag.translate > 0.5 : drag.translate < 0.5;
        if (isChanged) {
          applyModelValue(!ngModel.$viewValue);
        }
        drag = null;
      }

      function applyModelValue(newValue) {
        scope.$apply(function() {
          ngModel.$setViewValue(newValue);
          ngModel.$render();
        });
      }

    };
  }


}
MdSwitch.$inject = ["mdCheckboxDirective", "$mdUtil", "$mdConstant", "$parse", "$$rAF", "$mdGesture"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.tabs
 * @description
 *
 *  Tabs, created with the `<md-tabs>` directive provide *tabbed* navigation with different styles.
 *  The Tabs component consists of clickable tabs that are aligned horizontally side-by-side.
 *
 *  Features include support for:
 *
 *  - static or dynamic tabs,
 *  - responsive designs,
 *  - accessibility support (ARIA),
 *  - tab pagination,
 *  - external or internal tab content,
 *  - focus indicators and arrow-key navigations,
 *  - programmatic lookup and access to tab controllers, and
 *  - dynamic transitions through different tab contents.
 *
 */
/*
 * @see js folder for tabs implementation
 */
angular.module('material.components.tabs', [
  'material.core',
  'material.components.icon'
]);

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */
angular.module('material.components.toast', [
  'material.core',
  'material.components.button'
])
  .directive('mdToast', MdToastDirective)
  .provider('$mdToast', MdToastProvider);

/* @ngInject */
function MdToastDirective($mdToast) {
  return {
    restrict: 'E',
    link: function postLink(scope, element, attr) {
      // When navigation force destroys an interimElement, then
      // listen and $destroy() that interim instance...
      scope.$on('$destroy', function() {
        $mdToast.destroy();
      });
    }
  };
}
MdToastDirective.$inject = ["$mdToast"];

/**
 * @ngdoc service
 * @name $mdToast
 * @module material.components.toast
 *
 * @description
 * `$mdToast` is a service to build a toast notification on any position
 * on the screen with an optional duration, and provides a simple promise API.
 *
 *
 * ## Restrictions on custom toasts
 * - The toast's template must have an outer `<md-toast>` element.
 * - For a toast action, use element with class `md-action`.
 * - Add the class `md-capsule` for curved corners.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <md-button ng-click="openToast()">
 *     Open a Toast!
 *   </md-button>
 * </div>
 * </hljs>
 *
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $mdToast) {
 *   $scope.openToast = function($event) {
 *     $mdToast.show($mdToast.simple().content('Hello!'));
 *     // Could also do $mdToast.showSimple('Hello');
 *   };
 * });
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdToast#showSimple
 * 
 * @description
 * Convenience method which builds and shows a simple toast.
 *
 * @returns {promise} A promise that can be resolved with `$mdToast.hide()` or
 * rejected with `$mdToast.cancel()`.
 *
 */

 /**
 * @ngdoc method
 * @name $mdToast#simple
 *
 * @description
 * Builds a preconfigured toast.
 *
 * @returns {obj} a `$mdToastPreset` with the chainable configuration methods:
 *
 * - $mdToastPreset#content(string) - sets toast content to string
 * - $mdToastPreset#action(string) - adds an action button. If clicked the promise (returned from `show()`) will resolve
 *   with value 'ok'; otherwise it promise is resolved with 'true' after a hideDelay timeout.
 * - $mdToastPreset#highlightAction(boolean) - sets action button to be highlighted
 * - $mdToastPreset#capsule(boolean) - adds 'md-capsule' class to the toast (curved corners)
 * - $mdToastPreset#theme(string) - sets the theme on the toast to theme (default is `$mdThemingProvider`'s default theme)
 */

/**
 * @ngdoc method
 * @name $mdToast#updateContent
 * 
 * @description
 * Updates the content of an existing toast. Useful for updating things like counts, etc.
 *
 */

 /**
 * @ngdoc method
 * @name $mdToast#build
 *
 * @description
 * Creates a custom `$mdToastPreset` that you can configure.
 *
 * @returns {obj} a `$mdToastPreset` with the chainable configuration methods for shows' options (see below).
 */

 /**
 * @ngdoc method
 * @name $mdToast#show
 *
 * @description Shows the toast.
 *
 * @param {object} optionsOrPreset Either provide an `$mdToastPreset` returned from `simple()`
 * and `build()`, or an options object with the following properties:
 *
 *   - `templateUrl` - `{string=}`: The url of an html template file that will
 *     be used as the content of the toast. Restrictions: the template must
 *     have an outer `md-toast` element.
 *   - `template` - `{string=}`: Same as templateUrl, except this is an actual
 *     template string.
 *   - `scope` - `{object=}`: the scope to link the template / controller to. If none is specified, it will create a new child scope.
 *     This scope will be destroyed when the toast is removed unless `preserveScope` is set to true.
 *   - `preserveScope` - `{boolean=}`: whether to preserve the scope when the element is removed. Default is false
 *   - `hideDelay` - `{number=}`: How many milliseconds the toast should stay
 *     active before automatically closing.  Set to 0 or false to have the toast stay open until
 *     closed manually. Default: 3000.
 *   - `position` - `{string=}`: Where to place the toast. Available: any combination
 *     of 'bottom', 'left', 'top', 'right', 'fit'. Default: 'bottom left'.
 *   - `controller` - `{string=}`: The controller to associate with this toast.
 *     The controller will be injected the local `$mdToast.hide( )`, which is a function
 *     used to hide the toast.
 *   - `locals` - `{string=}`: An object containing key/value pairs. The keys will
 *     be used as names of values to inject into the controller. For example,
 *     `locals: {three: 3}` would inject `three` into the controller with the value
 *     of 3.
 *   - `bindToController` - `bool`: bind the locals to the controller, instead of passing them in. These values will not be available until after initialization.
 *   - `resolve` - `{object=}`: Similar to locals, except it takes promises as values
 *     and the toast will not open until the promises resolve.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the scope.
 *   - `parent` - `{element=}`: The element to append the toast to. Defaults to appending
 *     to the root element of the application.
 *
 * @returns {promise} A promise that can be resolved with `$mdToast.hide()` or
 * rejected with `$mdToast.cancel()`. `$mdToast.hide()` will resolve either with a Boolean
 * value == 'true' or the value passed as an argument to `$mdToast.hide()`.
 * And `$mdToast.cancel()` will resolve the promise with a Boolean value == 'false'
 */

/**
 * @ngdoc method
 * @name $mdToast#hide
 *
 * @description
 * Hide an existing toast and resolve the promise returned from `$mdToast.show()`.
 *
 * @param {*=} response An argument for the resolved promise.
 *
 * @returns {promise} a promise that is called when the existing element is removed from the DOM.
 * The promise is resolved with either a Boolean value == 'true' or the value passed as the
 * argument to `.hide()`.
 *
 */

/**
 * @ngdoc method
 * @name $mdToast#cancel
 *
 * @description
 * Hide the existing toast and reject the promise returned from
 * `$mdToast.show()`.
 *
 * @param {*=} response An argument for the rejected promise.
 *
 * @returns {promise} a promise that is called when the existing element is removed from the DOM
 * The promise is resolved with a Boolean value == 'false'.
 *
 */

function MdToastProvider($$interimElementProvider) {
  // Differentiate promise resolves: hide timeout (value == true) and hide action clicks (value == ok).
  var ACTION_RESOLVE = 'ok';

  var activeToastContent;
  var $mdToast = $$interimElementProvider('$mdToast')
    .setDefaults({
      methods: ['position', 'hideDelay', 'capsule', 'parent' ],
      options: toastDefaultOptions
    })
    .addPreset('simple', {
      argOption: 'content',
      methods: ['content', 'action', 'highlightAction', 'theme', 'parent'],
      options: /* @ngInject */ ["$mdToast", "$mdTheming", function($mdToast, $mdTheming) {
        var opts = {
          template: [
            '<md-toast md-theme="{{ toast.theme }}" ng-class="{\'md-capsule\': toast.capsule}">',
              '<span flex>{{ toast.content }}</span>',
              '<md-button class="md-action" ng-if="toast.action" ng-click="toast.resolve()" ng-class="{\'md-highlight\': toast.highlightAction}">',
                '{{ toast.action }}',
              '</md-button>',
            '</md-toast>'
          ].join(''),
          controller: /* @ngInject */ ["$scope", function mdToastCtrl($scope) {
            var self = this;
            $scope.$watch(function() { return activeToastContent; }, function() {
              self.content = activeToastContent;
            });
            this.resolve = function() {
              $mdToast.hide( ACTION_RESOLVE );
            };
          }],
          theme: $mdTheming.defaultTheme(),
          controllerAs: 'toast',
          bindToController: true
        };
        return opts;
      }]
    })
    .addMethod('updateContent', function(newContent) {
      activeToastContent = newContent;
    });

  toastDefaultOptions.$inject = ["$animate", "$mdToast", "$mdUtil"];
    return $mdToast;

  /* @ngInject */
  function toastDefaultOptions($animate, $mdToast, $mdUtil) {
    var SWIPE_EVENTS = '$md.swipeleft $md.swiperight';
    return {
      onShow: onShow,
      onRemove: onRemove,
      position: 'bottom left',
      themable: true,
      hideDelay: 3000
    };

    function onShow(scope, element, options) {
      activeToastContent = options.content;

      element = $mdUtil.extractElementByName(element, 'md-toast', true);
      options.onSwipe = function(ev, gesture) {
        //Add swipeleft/swiperight class to element so it can animate correctly
        element.addClass('md-' + ev.type.replace('$md.',''));
        $mdUtil.nextTick($mdToast.cancel);
      };
      options.openClass = toastOpenClass(options.position);


      // 'top left' -> 'md-top md-left'
      options.parent.addClass(options.openClass);
      element.on(SWIPE_EVENTS, options.onSwipe);
      element.addClass(options.position.split(' ').map(function(pos) {
        return 'md-' + pos;
      }).join(' '));

      return $animate.enter(element, options.parent);
    }

    function onRemove(scope, element, options) {
      element.off(SWIPE_EVENTS, options.onSwipe);
      options.parent.removeClass(options.openClass);

      return (options.$destroy == true) ? element.remove() : $animate.leave(element);
    }

    function toastOpenClass(position) {
      return 'md-toast-open-' +
        (position.indexOf('top') > -1 ? 'top' : 'bottom');
    }
  }

}
MdToastProvider.$inject = ["$$interimElementProvider"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.toolbar
 */
angular.module('material.components.toolbar', [
  'material.core',
  'material.components.content'
])
  .directive('mdToolbar', mdToolbarDirective);

/**
 * @ngdoc directive
 * @name mdToolbar
 * @module material.components.toolbar
 * @restrict E
 * @description
 * `md-toolbar` is used to place a toolbar in your app.
 *
 * Toolbars are usually used above a content area to display the title of the
 * current page, and show relevant action buttons for that page.
 *
 * You can change the height of the toolbar by adding either the
 * `md-medium-tall` or `md-tall` class to the toolbar.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="column" layout-fill>
 *   <md-toolbar>
 *
 *     <div class="md-toolbar-tools">
 *       <span>My App's Title</span>
 *
 *       <!-- fill up the space between left and right area -->
 *       <span flex></span>
 *
 *       <md-button>
 *         Right Bar Button
 *       </md-button>
 *     </div>
 *
 *   </md-toolbar>
 *   <md-content>
 *     Hello!
 *   </md-content>
 * </div>
 * </hljs>
 *
 * @param {boolean=} md-scroll-shrink Whether the header should shrink away as
 * the user scrolls down, and reveal itself as the user scrolls up.
 *
 * _**Note (1):** for scrollShrink to work, the toolbar must be a sibling of a
 * `md-content` element, placed before it. See the scroll shrink demo._
 *
 * _**Note (2):** The `md-scroll-shrink` attribute is only parsed on component
 * initialization, it does not watch for scope changes._
 *
 *
 * @param {number=} md-shrink-speed-factor How much to change the speed of the toolbar's
 * shrinking by. For example, if 0.25 is given then the toolbar will shrink
 * at one fourth the rate at which the user scrolls down. Default 0.5.
 */

function mdToolbarDirective($$rAF, $mdConstant, $mdUtil, $mdTheming, $animate) {
  var translateY = angular.bind(null, $mdUtil.supplant, 'translate3d(0,{0}px,0)');

  return {
    restrict: 'E',

    link: function(scope, element, attr) {

      $mdTheming(element);

      if (angular.isDefined(attr.mdScrollShrink)) {
        setupScrollShrink();
      }

      function setupScrollShrink() {

        var toolbarHeight;
        var contentElement;
        var disableScrollShrink = angular.noop;

        // Current "y" position of scroll
        // Store the last scroll top position
        var y = 0;
        var prevScrollTop = 0;
        var shrinkSpeedFactor = attr.mdShrinkSpeedFactor || 0.5;

        var debouncedContentScroll = $$rAF.throttle(onContentScroll);
        var debouncedUpdateHeight = $mdUtil.debounce(updateToolbarHeight, 5 * 1000);

        // Wait for $mdContentLoaded event from mdContent directive.
        // If the mdContent element is a sibling of our toolbar, hook it up
        // to scroll events.

        scope.$on('$mdContentLoaded', onMdContentLoad);

        // If the toolbar is used inside an ng-if statement, we may miss the
        // $mdContentLoaded event, so we attempt to fake it if we have a
        // md-content close enough.

        attr.$observe('mdScrollShrink', onChangeScrollShrink);

        // If the scope is destroyed (which could happen with ng-if), make sure
        // to disable scroll shrinking again

        scope.$on('$destroy', disableScrollShrink);

        /**
         *
         */
        function onChangeScrollShrink(shrinkWithScroll) {
          var closestContent = element.parent().find('md-content');

          // If we have a content element, fake the call; this might still fail
          // if the content element isn't a sibling of the toolbar

          if (!contentElement && closestContent.length) {
            onMdContentLoad(null, closestContent);
          }

          // Evaluate the expression
          shrinkWithScroll = scope.$eval(shrinkWithScroll);

          // Disable only if the attribute's expression evaluates to false
          if (shrinkWithScroll === false) {
            disableScrollShrink();
          } else {
            disableScrollShrink = enableScrollShrink();
          }
        }

        /**
         *
         */
        function onMdContentLoad($event, newContentEl) {
          // Toolbar and content must be siblings
          if (newContentEl && element.parent()[0] === newContentEl.parent()[0]) {
            // unhook old content event listener if exists
            if (contentElement) {
              contentElement.off('scroll', debouncedContentScroll);
            }

            contentElement = newContentEl;
            disableScrollShrink = enableScrollShrink();
          }
        }

        /**
         *
         */
        function onContentScroll(e) {
          var scrollTop = e ? e.target.scrollTop : prevScrollTop;

          debouncedUpdateHeight();

          y = Math.min(
            toolbarHeight / shrinkSpeedFactor,
            Math.max(0, y + scrollTop - prevScrollTop)
          );

          element.css($mdConstant.CSS.TRANSFORM, translateY([-y * shrinkSpeedFactor]));
          contentElement.css($mdConstant.CSS.TRANSFORM, translateY([(toolbarHeight - y) * shrinkSpeedFactor]));

          prevScrollTop = scrollTop;

          $mdUtil.nextTick(function() {
            var hasWhiteFrame = element.hasClass('md-whiteframe-z1');

            if (hasWhiteFrame && !y) {
              $animate.removeClass(element, 'md-whiteframe-z1');
            } else if (!hasWhiteFrame && y) {
              $animate.addClass(element, 'md-whiteframe-z1');
            }
          });

        }

        /**
         *
         */
        function enableScrollShrink() {
          if (!contentElement)     return angular.noop;           // no md-content

          contentElement.on('scroll', debouncedContentScroll);
          contentElement.attr('scroll-shrink', 'true');

          $$rAF(updateToolbarHeight);

          return function disableScrollShrink() {
            contentElement.off('scroll', debouncedContentScroll);
            contentElement.attr('scroll-shrink', 'false');

            $$rAF(updateToolbarHeight);
          }
        }

        /**
         *
         */
        function updateToolbarHeight() {
          toolbarHeight = element.prop('offsetHeight');
          // Add a negative margin-top the size of the toolbar to the content el.
          // The content will start transformed down the toolbarHeight amount,
          // so everything looks normal.
          //
          // As the user scrolls down, the content will be transformed up slowly
          // to put the content underneath where the toolbar was.
          var margin = (-toolbarHeight * shrinkSpeedFactor) + 'px';

          contentElement.css({
            "margin-top": margin,
            "margin-bottom": margin
          });

          onContentScroll();
        }

      }

    }
  };

}
mdToolbarDirective.$inject = ["$$rAF", "$mdConstant", "$mdUtil", "$mdTheming", "$animate"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.tooltip
 */
angular
    .module('material.components.tooltip', [ 'material.core' ])
    .directive('mdTooltip', MdTooltipDirective);

/**
 * @ngdoc directive
 * @name mdTooltip
 * @module material.components.tooltip
 * @description
 * Tooltips are used to describe elements that are interactive and primarily graphical (not textual).
 *
 * Place a `<md-tooltip>` as a child of the element it describes.
 *
 * A tooltip will activate when the user focuses, hovers over, or touches the parent.
 *
 * @usage
 * <hljs lang="html">
 * <md-button class="md-fab md-accent" aria-label="Play">
 *   <md-tooltip>
 *     Play Music
 *   </md-tooltip>
 *   <md-icon icon="img/icons/ic_play_arrow_24px.svg"></md-icon>
 * </md-button>
 * </hljs>
 *
 * @param {expression=} md-visible Boolean bound to whether the tooltip is
 * currently visible.
 * @param {number=} md-delay How many milliseconds to wait to show the tooltip after the user focuses, hovers, or touches the parent. Defaults to 300ms.
 * @param {string=} md-direction Which direction would you like the tooltip to go?  Supports left, right, top, and bottom.  Defaults to bottom.
 * @param {boolean=} md-autohide If present or provided with a boolean value, the tooltip will hide on mouse leave, regardless of focus
 */
function MdTooltipDirective($timeout, $window, $$rAF, $document, $mdUtil, $mdTheming, $rootElement,
                            $animate, $q) {

  var TOOLTIP_SHOW_DELAY = 0;
  var TOOLTIP_WINDOW_EDGE_SPACE = 8;

  return {
    restrict: 'E',
    transclude: true,
    priority:210, // Before ngAria
    template: '<div class="md-content" ng-transclude></div>',
    scope: {
      visible: '=?mdVisible',
      delay: '=?mdDelay',
      autohide: '=?mdAutohide'
    },
    link: postLink
  };

  function postLink(scope, element, attr) {

    $mdTheming(element);

    var parent        = getParentWithPointerEvents(),
        content       = angular.element(element[0].getElementsByClassName('md-content')[0]),
        direction     = attr.mdDirection,
        current       = getNearestContentElement(),
        tooltipParent = angular.element(current || document.body),
        debouncedOnResize = $$rAF.throttle(function () { if (scope.visible) positionTooltip(); });

    // Initialize element

    setDefaults();
    manipulateElement();
    bindEvents();
    configureWatchers();
    addAriaLabel();

    content.css('transform-origin', getTransformOrigin(direction));

    function setDefaults () {
      if (!angular.isDefined(attr.mdDelay)) scope.delay = TOOLTIP_SHOW_DELAY;
    }

    function getTransformOrigin (direction) {
      switch (direction) {
        case 'left': return 'right center';
        case 'right': return 'left center';
        case 'top': return 'center bottom';
        case 'bottom': return 'center top';
      }
    }

    function configureWatchers () {
      scope.$on('$destroy', function() {
        scope.visible = false;
        element.remove();
        angular.element($window).off('resize', debouncedOnResize);
      });
      scope.$watch('visible', function (isVisible) {
        if (isVisible) showTooltip();
        else hideTooltip();
      });
    }

    function addAriaLabel () {
      if (!parent.attr('aria-label') && !parent.text().trim()) {
        parent.attr('aria-label', element.text().trim());
      }
    }

    function manipulateElement () {
      element.detach();
      element.attr('role', 'tooltip');
    }

    /**
     * Scan up dom hierarchy for enabled parent;
     */
    function getParentWithPointerEvents () {
      var parent = element.parent();

      // jqLite might return a non-null, but still empty, parent; so check for parent and length
      while (hasComputedStyleValue('pointer-events','none', parent)) {
        parent = parent.parent();
      }

      return parent;
    }

     function getNearestContentElement () {
       var current = element.parent()[0];
       // Look for the nearest parent md-content, stopping at the rootElement.
       while (current && current !== $rootElement[0] && current !== document.body && current.nodeName !== 'MD-CONTENT') {
         current = current.parentNode;
       }
       return current;
     }


    function hasComputedStyleValue(key, value, target) {
      var hasValue = false;

      if ( target && target.length  ) {
        key    = attr.$normalize(key);
        target = target[0] || element[0];

        var computedStyles = $window.getComputedStyle(target);
        hasValue = angular.isDefined(computedStyles[key]) && (computedStyles[key] == value);
      }

      return hasValue;
    }

    function bindEvents () {
      var mouseActive = false;

      var ngWindow = angular.element($window);

      // Store whether the element was focused when the window loses focus.
      var windowBlurHandler = function() {
        elementFocusedOnWindowBlur = document.activeElement === parent[0];
      };
      var elementFocusedOnWindowBlur = false;
      ngWindow.on('blur', windowBlurHandler);
      scope.$on('$destroy', function() {
        ngWindow.off('blur', windowBlurHandler);
      });

      var enterHandler = function(e) {
        // Prevent the tooltip from showing when the window is receiving focus.
        if (e.type === 'focus' && elementFocusedOnWindowBlur) {
          elementFocusedOnWindowBlur = false;
          return;
        }
        parent.on('blur mouseleave touchend touchcancel', leaveHandler );
        setVisible(true);
      };
      var leaveHandler = function () {
        var autohide = scope.hasOwnProperty('autohide') ? scope.autohide : attr.hasOwnProperty('mdAutohide');
        if (autohide || mouseActive || ($document[0].activeElement !== parent[0]) ) {
          parent.off('blur mouseleave touchend touchcancel', leaveHandler );
          parent.triggerHandler("blur");
          setVisible(false);
        }
        mouseActive = false;
      };

      // to avoid `synthetic clicks` we listen to mousedown instead of `click`
      parent.on('mousedown', function() { mouseActive = true; });
      parent.on('focus mouseenter touchstart', enterHandler );


      angular.element($window).on('resize', debouncedOnResize);
    }

    function setVisible (value) {
      setVisible.value = !!value;
      if (!setVisible.queued) {
        if (value) {
          setVisible.queued = true;
          $timeout(function() {
            scope.visible = setVisible.value;
            setVisible.queued = false;
          }, scope.delay);
        } else {
          $mdUtil.nextTick(function() { scope.visible = false; });
        }
      }
    }

    function showTooltip() {
      // Insert the element before positioning it, so we can get the position
      // and check if we should display it
      tooltipParent.append(element);

      // Check if we should display it or not.
      // This handles hide-* and show-* along with any user defined css
      if ( hasComputedStyleValue('display','none') ) {
        scope.visible = false;
        element.detach();
        return;
      }

      positionTooltip();
      angular.forEach([element, content], function (element) {
        $animate.addClass(element, 'md-show');
      });
    }

    function hideTooltip() {
        var promises = [];
        angular.forEach([element, content], function (it) {
          if (it.parent() && it.hasClass('md-show')) {
            promises.push($animate.removeClass(it, 'md-show'));
          }
        });

        $q.all(promises)
          .then(function () {
            if (!scope.visible) element.detach();
          });
    }

    function positionTooltip() {
      var tipRect = $mdUtil.offsetRect(element, tooltipParent);
      var parentRect = $mdUtil.offsetRect(parent, tooltipParent);
      var newPosition = getPosition(direction);

      // If the user provided a direction, just nudge the tooltip onto the screen
      // Otherwise, recalculate based on 'top' since default is 'bottom'
      if (direction) {
        newPosition = fitInParent(newPosition);
      } else if (newPosition.top > element.prop('offsetParent').scrollHeight - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE) {
        newPosition = fitInParent(getPosition('top'));
      }

      element.css({top: newPosition.top + 'px', left: newPosition.left + 'px'});

      function fitInParent (pos) {
        var newPosition = { left: pos.left, top: pos.top };
        newPosition.left = Math.min( newPosition.left, tooltipParent.prop('scrollWidth') - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.left = Math.max( newPosition.left, TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.top  = Math.min( newPosition.top,  tooltipParent.prop('scrollHeight') - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.top  = Math.max( newPosition.top,  TOOLTIP_WINDOW_EDGE_SPACE );
        return newPosition;
      }

      function getPosition (dir) {
        return dir === 'left'
          ? { left: parentRect.left - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE,
              top: parentRect.top + parentRect.height / 2 - tipRect.height / 2 }
          : dir === 'right'
          ? { left: parentRect.left + parentRect.width + TOOLTIP_WINDOW_EDGE_SPACE,
              top: parentRect.top + parentRect.height / 2 - tipRect.height / 2 }
          : dir === 'top'
          ? { left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
              top: parentRect.top - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE }
          : { left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
              top: parentRect.top + parentRect.height + TOOLTIP_WINDOW_EDGE_SPACE };
      }
    }

  }

}
MdTooltipDirective.$inject = ["$timeout", "$window", "$$rAF", "$document", "$mdUtil", "$mdTheming", "$rootElement", "$animate", "$q"];

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.virtualRepeat
 */
angular.module('material.components.virtualRepeat', [
  'material.core'
])
.directive('mdVirtualRepeatContainer', VirtualRepeatContainerDirective)
.directive('mdVirtualRepeat', VirtualRepeatDirective);


/**
 * @ngdoc directive
 * @name mdVirtualRepeatContainer
 * @module material.components.virtualRepeat
 * @restrict E
 * @description
 * `md-virtual-repeat-container` provides the scroll container for md-virtual-repeat.
 *
 * Virtual repeat is a limited substitute for ng-repeat that renders only
 * enough dom nodes to fill the container and recycling them as the user scrolls.
 *
 * @usage
 * <hljs lang="html">
 *
 * <md-virtual-repeat-container md-top-index="topIndex">
 *   <div md-virtual-repeat="i in items" md-item-size="20">Hello {{i}}!</div>
 * </md-virtual-repeat-container>
 * </hljs>
 *
 * @param {number=} md-top-index Binds the index of the item that is at the top of the scroll
 *     container to $scope. It can both read and set the scroll position.
 * @param {boolean=} md-orient-horizontal Whether the container should scroll horizontally
 *     (defaults to orientation and scrolling vertically).
 * @param {boolean=} md-auto-shrink When present, the container will shrink to fit
 *     the number of items when that number is less than its original size.
 * @param {number=} md-auto-shrink-min Minimum number of items that md-auto-shrink
 *     will shrink to (default: 0).
 */
function VirtualRepeatContainerDirective() {
  return {
    controller: VirtualRepeatContainerController,
    template: virtualRepeatContainerTemplate,
    compile: function virtualRepeatContainerCompile($element, $attrs) {
      $element
          .addClass('md-virtual-repeat-container')
          .addClass($attrs.hasOwnProperty('mdOrientHorizontal')
              ? 'md-orient-horizontal'
              : 'md-orient-vertical');
    }
  };
}


function virtualRepeatContainerTemplate($element) {
  return '<div class="md-virtual-repeat-scroller">' +
    '<div class="md-virtual-repeat-sizer"></div>' +
    '<div class="md-virtual-repeat-offsetter">' +
      $element[0].innerHTML +
    '</div></div>';
}

/**
 * Maximum size, in pixels, that can be explicitly set to an element. The actual value varies
 * between browsers, but IE11 has the very lowest size at a mere 1,533,917px. Ideally we could
 * *compute* this value, but Firefox always reports an element to have a size of zero if it
 * goes over the max, meaning that we'd have to binary search for the value.
 * @const {number}
 */
var MAX_ELEMENT_SIZE = 1533917;

/**
 * Number of additional elements to render above and below the visible area inside
 * of the virtual repeat container. A higher number results in less flicker when scrolling
 * very quickly in Safari, but comes with a higher rendering and dirty-checking cost.
 * @const {number}
 */
var NUM_EXTRA = 3;

/** @ngInject */
function VirtualRepeatContainerController($$rAF, $parse, $scope, $element, $attrs) {
  this.$scope = $scope;
  this.$element = $element;
  this.$attrs = $attrs;

  /** @type {number} The width or height of the container */
  this.size = 0;
  /** @type {number} The scroll width or height of the scroller */
  this.scrollSize = 0;
  /** @type {number} The scrollLeft or scrollTop of the scroller */
  this.scrollOffset = 0;
  /** @type {boolean} Whether the scroller is oriented horizontally */
  this.horizontal = this.$attrs.hasOwnProperty('mdOrientHorizontal');
  /** @type {!VirtualRepeatController} The repeater inside of this container */
  this.repeater = null;
  /** @type {boolean} Whether auto-shrink is enabled */
  this.autoShrink = this.$attrs.hasOwnProperty('mdAutoShrink');
  /** @type {number} Minimum number of items to auto-shrink to */
  this.autoShrinkMin = parseInt(this.$attrs.mdAutoShrinkMin, 10) || 0;
  /** @type {?number} Original container size when shrank */
  this.originalSize = null;
  /** @type {number} Amount to offset the total scroll size by. */
  this.offsetSize = parseInt(this.$attrs.mdOffsetSize, 10) || 0;

  if (this.$attrs.mdTopIndex) {
    /** @type {function(angular.Scope): number} Binds to topIndex on Angular scope */
    this.bindTopIndex = $parse(this.$attrs.mdTopIndex);
    /** @type {number} The index of the item that is at the top of the scroll container */
    this.topIndex = this.bindTopIndex(this.$scope);

    if (!angular.isDefined(this.topIndex)) {
      this.topIndex = 0;
      this.bindTopIndex.assign(this.$scope, 0);
    }

    this.$scope.$watch(this.bindTopIndex, angular.bind(this, function(newIndex) {
      if (newIndex !== this.topIndex) {
        this.scrollToIndex(newIndex);
      }
    }));
  } else {
    this.topIndex = 0;
  }

  this.scroller = $element[0].getElementsByClassName('md-virtual-repeat-scroller')[0];
  this.sizer = this.scroller.getElementsByClassName('md-virtual-repeat-sizer')[0];
  this.offsetter = this.scroller.getElementsByClassName('md-virtual-repeat-offsetter')[0];

  $$rAF(angular.bind(this, this.updateSize));

  // TODO: Come up with a more robust (But hopefully also quick!) way of
  // detecting that we're not visible.
  if ($attrs.ngHide) {
    $scope.$watch($attrs.ngHide, angular.bind(this, function(hidden) {
      if (!hidden) {
        $$rAF(angular.bind(this, this.updateSize));
      }
    }));
  }
}
VirtualRepeatContainerController.$inject = ["$$rAF", "$parse", "$scope", "$element", "$attrs"];


/** Called by the md-virtual-repeat inside of the container at startup. */
VirtualRepeatContainerController.prototype.register = function(repeaterCtrl) {
  this.repeater = repeaterCtrl;

  angular.element(this.scroller)
      .on('scroll wheel touchmove touchend', angular.bind(this, this.handleScroll_));
};


/** @return {boolean} Whether the container is configured for horizontal scrolling. */
VirtualRepeatContainerController.prototype.isHorizontal = function() {
  return this.horizontal;
};


/** @return {number} The size (width or height) of the container. */
VirtualRepeatContainerController.prototype.getSize = function() {
  return this.size;
};


/**
 * Resizes the container.
 * @private
 * @param {number} The new size to set.
 */
VirtualRepeatContainerController.prototype.setSize_ = function(size) {
  this.size = size;
  this.$element[0].style[this.isHorizontal() ? 'width' : 'height'] = size + 'px';
};


/** Instructs the container to re-measure its size. */
VirtualRepeatContainerController.prototype.updateSize = function() {
  if (this.originalSize) return;

  this.size = this.isHorizontal()
      ? this.$element[0].clientWidth
      : this.$element[0].clientHeight;
  this.repeater && this.repeater.containerUpdated();
};


/** @return {number} The container's scrollHeight or scrollWidth. */
VirtualRepeatContainerController.prototype.getScrollSize = function() {
  return this.scrollSize;
};


/**
 * Sets the scroller element to the specified size.
 * @private
 * @param {number} size The new size.
 */
VirtualRepeatContainerController.prototype.sizeScroller_ = function(size) {
  var dimension =  this.isHorizontal() ? 'width' : 'height';
  var crossDimension = this.isHorizontal() ? 'height' : 'width';

  // If the size falls within the browser's maximum explicit size for a single element, we can
  // set the size and be done. Otherwise, we have to create children that add up the the desired
  // size.
  if (size < MAX_ELEMENT_SIZE) {
    this.sizer.style[dimension] = size + 'px';
  } else {
    // Clear any existing dimensions.
    this.sizer.innerHTML = '';
    this.sizer.style[dimension] = 'auto';
    this.sizer.style[crossDimension] = 'auto';

    // Divide the total size we have to render into N max-size pieces.
    var numChildren = Math.floor(size / MAX_ELEMENT_SIZE);

    // Element template to clone for each max-size piece.
    var sizerChild = document.createElement('div');
    sizerChild.style[dimension] = MAX_ELEMENT_SIZE + 'px';
    sizerChild.style[crossDimension] = '1px';

    for (var i = 0; i < numChildren; i++) {
      this.sizer.appendChild(sizerChild.cloneNode(false));
    }

    // Re-use the element template for the remainder.
    sizerChild.style[dimension] = (size - (numChildren * MAX_ELEMENT_SIZE)) + 'px';
    this.sizer.appendChild(sizerChild);
  }
};


/**
 * If auto-shrinking is enabled, shrinks or unshrinks as appropriate.
 * @private
 * @param {number} size The new size.
 */
VirtualRepeatContainerController.prototype.autoShrink_ = function(size) {
  var shrinkSize = Math.max(size, this.autoShrinkMin * this.repeater.getItemSize());
  if (this.autoShrink && shrinkSize !== this.size) {
    if (shrinkSize < (this.originalSize || this.size)) {
      if (!this.originalSize) {
        this.originalSize = this.size;
      }

      this.setSize_(shrinkSize);
    } else if (this.originalSize) {
      this.setSize_(this.originalSize);
      this.originalSize = null;
    }
  }
};


/**
 * Sets the scrollHeight or scrollWidth. Called by the repeater based on
 * its item count and item size.
 * @param {number} itemsSize The total size of the items.
 */
VirtualRepeatContainerController.prototype.setScrollSize = function(itemsSize) {
  var size = itemsSize + this.offsetSize;
  if (this.scrollSize === size) return;

  this.sizeScroller_(size);
  this.autoShrink_(size);
  this.scrollSize = size;
};


/** @return {number} The container's current scroll offset. */
VirtualRepeatContainerController.prototype.getScrollOffset = function() {
  return this.scrollOffset;
};

/**
 * Scrolls to a given scrollTop position.
 * @param {number} position
 */
VirtualRepeatContainerController.prototype.scrollTo = function(position) {
  this.scroller[this.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = position;
  this.handleScroll_();
};

/**
 * Scrolls the item with the given index to the top of the scroll container.
 * @param {number} index
 */
VirtualRepeatContainerController.prototype.scrollToIndex = function(index) {
  var itemSize = this.repeater.getItemSize();
  var itemsLength = this.repeater.itemsLength;
  if(index > itemsLength) {
    index = itemsLength - 1;
  }
  this.scrollTo(itemSize * index);
};

VirtualRepeatContainerController.prototype.resetScroll = function() {
  this.scrollTo(0);
};


VirtualRepeatContainerController.prototype.handleScroll_ = function() {
  var offset = this.isHorizontal() ? this.scroller.scrollLeft : this.scroller.scrollTop;
  if (offset === this.scrollOffset) return;

  var itemSize = this.repeater.getItemSize();
  if (!itemSize) return;

  var numItems = Math.max(0, Math.floor(offset / itemSize) - NUM_EXTRA);

  var transform = this.isHorizontal() ? 'translateX(' : 'translateY(';
      transform +=  (numItems * itemSize) + 'px)';

  this.scrollOffset = offset;
  this.offsetter.style.webkitTransform = transform;
  this.offsetter.style.transform = transform;

  if (this.bindTopIndex) {
    var topIndex = Math.floor(offset / itemSize);
    if (topIndex !== this.topIndex && topIndex < this.repeater.itemsLength) {
      this.topIndex = topIndex;
      this.bindTopIndex.assign(this.$scope, topIndex);
      if (!this.$scope.$root.$$phase) this.$scope.$digest();
    }
  }

  this.repeater.containerUpdated();
};


/**
 * @ngdoc directive
 * @name mdVirtualRepeat
 * @module material.components.virtualRepeat
 * @restrict A
 * @priority 1000
 * @description
 * `md-virtual-repeat` specifies an element to repeat using virtual scrolling.
 *
 * Virtual repeat is a limited substitute for ng-repeat that renders only
 * enough dom nodes to fill the container and recycling them as the user scrolls.
 * Arrays, but not objects are supported for iteration.
 * Track by, as alias, and (key, value) syntax are not supported.
 *
 * @usage
 * <hljs lang="html">
 * <md-virtual-repeat-container>
 *   <div md-virtual-repeat="i in items">Hello {{i}}!</div>
 * </md-virtual-repeat-container>
 *
 * <md-virtual-repeat-container md-orient-horizontal>
 *   <div md-virtual-repeat="i in items" md-item-size="20">Hello {{i}}!</div>
 * </md-virtual-repeat-container>
 * </hljs>
 *
 * @param {number=} md-item-size The height or width of the repeated elements (which must be
 *   identical for each element). Optional. Will attempt to read the size from the dom if missing,
 *   but still assumes that all repeated nodes have same height or width.
 * @param {string=} md-extra-name Evaluates to an additional name to which the current iterated item
 *   can be assigned on the repeated scope (needed for use in `md-autocomplete`).
 * @param {boolean=} md-on-demand When present, treats the md-virtual-repeat argument as an object
 *   that can fetch rows rather than an array.
 *
 *   **NOTE:** This object must implement the following interface with two (2) methods:
 *
 *   - `getItemAtIndex: function(index) [object]` The item at that index or null if it is not yet
 *     loaded (it should start downloading the item in that case).
 *   - `getLength: function() [number]` The data length to which the repeater container
 *     should be sized. Ideally, when the count is known, this method should return it.
 *     Otherwise, return a higher number than the currently loaded items to produce an
 *     infinite-scroll behavior.
 */
function VirtualRepeatDirective($parse) {
  return {
    controller: VirtualRepeatController,
    priority: 1000,
    require: ['mdVirtualRepeat', '^^mdVirtualRepeatContainer'],
    restrict: 'A',
    terminal: true,
    transclude: 'element',
    compile: function VirtualRepeatCompile($element, $attrs) {
      var expression = $attrs.mdVirtualRepeat;
      var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
      var repeatName = match[1];
      var repeatListExpression = $parse(match[2]);
      var extraName = $attrs.mdExtraName && $parse($attrs.mdExtraName);

      return function VirtualRepeatLink($scope, $element, $attrs, ctrl, $transclude) {
        ctrl[0].link_(ctrl[1], $transclude, repeatName, repeatListExpression, extraName);
      };
    }
  };
}
VirtualRepeatDirective.$inject = ["$parse"];


/** @ngInject */
function VirtualRepeatController($scope, $element, $attrs, $browser, $document, $$rAF) {
  this.$scope = $scope;
  this.$element = $element;
  this.$attrs = $attrs;
  this.$browser = $browser;
  this.$document = $document;
  this.$$rAF = $$rAF;

  /** @type {boolean} Whether we are in on-demand mode. */
  this.onDemand = $attrs.hasOwnProperty('mdOnDemand');
  /** @type {!Function} Backup reference to $browser.$$checkUrlChange */
  this.browserCheckUrlChange = $browser.$$checkUrlChange;
  /** @type {number} Most recent starting repeat index (based on scroll offset) */
  this.newStartIndex = 0;
  /** @type {number} Most recent ending repeat index (based on scroll offset) */
  this.newEndIndex = 0;
  /** @type {number} Most recent end visible index (based on scroll offset) */
  this.newVisibleEnd = 0;
  /** @type {number} Previous starting repeat index (based on scroll offset) */
  this.startIndex = 0;
  /** @type {number} Previous ending repeat index (based on scroll offset) */
  this.endIndex = 0;
  // TODO: measure width/height of first element from dom if not provided.
  // getComputedStyle?
  /** @type {?number} Height/width of repeated elements. */
  this.itemSize = $scope.$eval($attrs.mdItemSize) || null;

  /** @type {boolean} Whether this is the first time that items are rendered. */
  this.isFirstRender = true;

  /** @type {number} Most recently seen length of items. */
  this.itemsLength = 0;

  /**
   * @type {!Function} Unwatch callback for item size (when md-items-size is
   *     not specified), or angular.noop otherwise.
   */
  this.unwatchItemSize_ = angular.noop;

  /**
   * Presently rendered blocks by repeat index.
   * @type {Object<number, !VirtualRepeatController.Block}
   */
  this.blocks = {};
  /** @type {Array<!VirtualRepeatController.Block>} A pool of presently unused blocks. */
  this.pooledBlocks = [];
}
VirtualRepeatController.$inject = ["$scope", "$element", "$attrs", "$browser", "$document", "$$rAF"];


/**
 * An object representing a repeated item.
 * @typedef {{element: !jqLite, new: boolean, scope: !angular.Scope}}
 */
VirtualRepeatController.Block;


/**
 * Called at startup by the md-virtual-repeat postLink function.
 * @param {!VirtualRepeatContainerController} container The container's controller.
 * @param {!Function} transclude The repeated element's bound transclude function.
 * @param {string} repeatName The left hand side of the repeat expression, indicating
 *     the name for each item in the array.
 * @param {!Function} repeatListExpression A compiled expression based on the right hand side
 *     of the repeat expression. Points to the array to repeat over.
 * @param {string|undefined} extraName The optional extra repeatName.
 */
VirtualRepeatController.prototype.link_ =
    function(container, transclude, repeatName, repeatListExpression, extraName) {
  this.container = container;
  this.transclude = transclude;
  this.repeatName = repeatName;
  this.rawRepeatListExpression = repeatListExpression;
  this.extraName = extraName;
  this.sized = false;

  this.repeatListExpression = angular.bind(this, this.repeatListExpression_);

  this.container.register(this);
};


/** @private Attempts to set itemSize by measuring a repeated element in the dom */
VirtualRepeatController.prototype.readItemSize_ = function() {
  if (this.itemSize) {
    // itemSize was successfully read in a different asynchronous call.
    return;
  }

  this.items = this.repeatListExpression(this.$scope);
  this.parentNode = this.$element[0].parentNode;
  var block = this.getBlock_(0);
  if (!block.element[0].parentNode) {
    this.parentNode.appendChild(block.element[0]);
  }

  this.itemSize = block.element[0][
      this.container.isHorizontal() ? 'offsetWidth' : 'offsetHeight'] || null;

  this.blocks[0] = block;
  this.poolBlock_(0);

  if (this.itemSize) {
    this.containerUpdated();
  }
};


/**
 * Returns the user-specified repeat list, transforming it into an array-like
 * object in the case of infinite scroll/dynamic load mode.
 * @param {!angular.Scope} The scope.
 * @return {!Array|!Object} An array or array-like object for iteration.
 */
VirtualRepeatController.prototype.repeatListExpression_ = function(scope) {
  var repeatList = this.rawRepeatListExpression(scope);

  if (this.onDemand && repeatList) {
    var virtualList = new VirtualRepeatModelArrayLike(repeatList);
    virtualList.$$includeIndexes(this.newStartIndex, this.newVisibleEnd);
    return virtualList;
  } else {
    return repeatList;
  }
};


/**
 * Called by the container. Informs us that the containers scroll or size has
 * changed.
 */
VirtualRepeatController.prototype.containerUpdated = function() {
  // If itemSize is unknown, attempt to measure it.
  if (!this.itemSize) {
    this.unwatchItemSize_ = this.$scope.$watchCollection(
        this.repeatListExpression,
        angular.bind(this, function(items) {
          if (items && items.length) {
            this.$$rAF(angular.bind(this, this.readItemSize_));
          }
        }));
    if (!this.$scope.$root.$$phase) this.$scope.$digest();

    return;
  } else if (!this.sized) {
    this.items = this.repeatListExpression(this.$scope);
  }

  if (!this.sized) {
    this.unwatchItemSize_();
    this.sized = true;
    this.$scope.$watchCollection(this.repeatListExpression,
        angular.bind(this, this.virtualRepeatUpdate_));
  }

  this.updateIndexes_();

  if (this.newStartIndex !== this.startIndex ||
      this.newEndIndex !== this.endIndex ||
      this.container.getScrollOffset() > this.container.getScrollSize()) {
    if (this.items instanceof VirtualRepeatModelArrayLike) {
      this.items.$$includeIndexes(this.newStartIndex, this.newEndIndex);
    }
    this.virtualRepeatUpdate_(this.items, this.items);
  }
};


/**
 * Called by the container. Returns the size of a single repeated item.
 * @return {?number} Size of a repeated item.
 */
VirtualRepeatController.prototype.getItemSize = function() {
  return this.itemSize;
};


/**
 * Updates the order and visible offset of repeated blocks in response to scrolling
 * or items updates.
 * @private
 */
VirtualRepeatController.prototype.virtualRepeatUpdate_ = function(items, oldItems) {
  var itemsLength = items && items.length || 0;
  var lengthChanged = false;

  // If the number of items shrank, scroll up to the top.
  if (this.items && itemsLength < this.items.length && this.container.getScrollOffset() !== 0) {
    this.items = items;
    this.container.resetScroll();
    return;
  }

  if (itemsLength !== this.itemsLength) {
    lengthChanged = true;
    this.itemsLength = itemsLength;
  }

  this.items = items;
  if (items !== oldItems || lengthChanged) {
    this.updateIndexes_();
  }

  this.parentNode = this.$element[0].parentNode;

  if (lengthChanged) {
    this.container.setScrollSize(itemsLength * this.itemSize);
  }

  if (this.isFirstRender) {
    this.isFirstRender = false;
    var startIndex = this.$attrs.mdStartIndex ?
      this.$scope.$eval(this.$attrs.mdStartIndex) :
      this.container.topIndex;
    this.container.scrollToIndex(startIndex);
  }

  // Detach and pool any blocks that are no longer in the viewport.
  Object.keys(this.blocks).forEach(function(blockIndex) {
    var index = parseInt(blockIndex, 10);
    if (index < this.newStartIndex || index >= this.newEndIndex) {
      this.poolBlock_(index);
    }
  }, this);

  // Add needed blocks.
  // For performance reasons, temporarily block browser url checks as we digest
  // the restored block scopes ($$checkUrlChange reads window.location to
  // check for changes and trigger route change, etc, which we don't need when
  // trying to scroll at 60fps).
  this.$browser.$$checkUrlChange = angular.noop;

  var i, block,
      newStartBlocks = [],
      newEndBlocks = [];

  // Collect blocks at the top.
  for (i = this.newStartIndex; i < this.newEndIndex && this.blocks[i] == null; i++) {
    block = this.getBlock_(i);
    this.updateBlock_(block, i);
    newStartBlocks.push(block);
  }

  // Update blocks that are already rendered.
  for (; this.blocks[i] != null; i++) {
    this.updateBlock_(this.blocks[i], i);
  }
  var maxIndex = i - 1;

  // Collect blocks at the end.
  for (; i < this.newEndIndex; i++) {
    block = this.getBlock_(i);
    this.updateBlock_(block, i);
    newEndBlocks.push(block);
  }

  // Attach collected blocks to the document.
  if (newStartBlocks.length) {
    this.parentNode.insertBefore(
        this.domFragmentFromBlocks_(newStartBlocks),
        this.$element[0].nextSibling);
  }
  if (newEndBlocks.length) {
    this.parentNode.insertBefore(
        this.domFragmentFromBlocks_(newEndBlocks),
        this.blocks[maxIndex] && this.blocks[maxIndex].element[0].nextSibling);
  }

  // Restore $$checkUrlChange.
  this.$browser.$$checkUrlChange = this.browserCheckUrlChange;

  this.startIndex = this.newStartIndex;
  this.endIndex = this.newEndIndex;
};


/**
 * @param {number} index Where the block is to be in the repeated list.
 * @return {!VirtualRepeatController.Block} A new or pooled block to place at the specified index.
 * @private
 */
VirtualRepeatController.prototype.getBlock_ = function(index) {
  if (this.pooledBlocks.length) {
    return this.pooledBlocks.pop();
  }

  var block;
  this.transclude(angular.bind(this, function(clone, scope) {
    block = {
      element: clone,
      new: true,
      scope: scope
    };

    this.updateScope_(scope, index);
    this.parentNode.appendChild(clone[0]);
  }));

  return block;
};


/**
 * Updates and if not in a digest cycle, digests the specified block's scope to the data
 * at the specified index.
 * @param {!VirtualRepeatController.Block} block The block whose scope should be updated.
 * @param {number} index The index to set.
 * @private
 */
VirtualRepeatController.prototype.updateBlock_ = function(block, index) {
  this.blocks[index] = block;

  if (!block.new &&
      (block.scope.$index === index && block.scope[this.repeatName] === this.items[index])) {
    return;
  }
  block.new = false;

  // Update and digest the block's scope.
  this.updateScope_(block.scope, index);

  // Perform digest before reattaching the block.
  // Any resulting synchronous dom mutations should be much faster as a result.
  // This might break some directives, but I'm going to try it for now.
  if (!this.$scope.$root.$$phase) {
    block.scope.$digest();
  }
};


/**
 * Updates scope to the data at the specified index.
 * @param {!angular.Scope} scope The scope which should be updated.
 * @param {number} index The index to set.
 * @private
 */
VirtualRepeatController.prototype.updateScope_ = function(scope, index) {
  scope.$index = index;
  scope[this.repeatName] = this.items && this.items[index];
  if (this.extraName) scope[this.extraName(this.$scope)] = this.items[index];
};


/**
 * Pools the block at the specified index (Pulls its element out of the dom and stores it).
 * @param {number} index The index at which the block to pool is stored.
 * @private
 */
VirtualRepeatController.prototype.poolBlock_ = function(index) {
  this.pooledBlocks.push(this.blocks[index]);
  this.parentNode.removeChild(this.blocks[index].element[0]);
  delete this.blocks[index];
};


/**
 * Produces a dom fragment containing the elements from the list of blocks.
 * @param {!Array<!VirtualRepeatController.Block>} blocks The blocks whose elements
 *     should be added to the document fragment.
 * @return {DocumentFragment}
 * @private
 */
VirtualRepeatController.prototype.domFragmentFromBlocks_ = function(blocks) {
  var fragment = this.$document[0].createDocumentFragment();
  blocks.forEach(function(block) {
    fragment.appendChild(block.element[0]);
  });
  return fragment;
};


/**
 * Updates start and end indexes based on length of repeated items and container size.
 * @private
 */
VirtualRepeatController.prototype.updateIndexes_ = function() {
  var itemsLength = this.items ? this.items.length : 0;
  var containerLength = Math.ceil(this.container.getSize() / this.itemSize);

  this.newStartIndex = Math.max(0, Math.min(
      itemsLength - containerLength,
      Math.floor(this.container.getScrollOffset() / this.itemSize)));
  this.newVisibleEnd = this.newStartIndex + containerLength + NUM_EXTRA;
  this.newEndIndex = Math.min(itemsLength, this.newVisibleEnd);
  this.newStartIndex = Math.max(0, this.newStartIndex - NUM_EXTRA);
};

/**
 * This VirtualRepeatModelArrayLike class enforces the interface requirements
 * for infinite scrolling within a mdVirtualRepeatContainer. An object with this
 * interface must implement the following interface with two (2) methods:
 *
 * getItemAtIndex: function(index) -> item at that index or null if it is not yet
 *     loaded (It should start downloading the item in that case).
 *
 * getLength: function() -> number The data legnth to which the repeater container
 *     should be sized. Ideally, when the count is known, this method should return it.
 *     Otherwise, return a higher number than the currently loaded items to produce an
 *     infinite-scroll behavior.
 *
 * @usage
 * <hljs lang="html">
 *  <md-virtual-repeat-container md-orient-horizontal>
 *    <div md-virtual-repeat="i in items" md-on-demand>
 *      Hello {{i}}!
 *    </div>
 *  </md-virtual-repeat-container>
 * </hljs>
 *
 */
function VirtualRepeatModelArrayLike(model) {
  if (!angular.isFunction(model.getItemAtIndex) ||
      !angular.isFunction(model.getLength)) {
    throw Error('When md-on-demand is enabled, the Object passed to md-virtual-repeat must implement ' +
        'functions getItemAtIndex() and getLength() ');
  }

  this.model = model;
}


VirtualRepeatModelArrayLike.prototype.$$includeIndexes = function(start, end) {
  for (var i = start; i < end; i++) {
    if (!this.hasOwnProperty(i)) {
      this[i] = this.model.getItemAtIndex(i);
    }
  }
  this.length = this.model.getLength();
};


function abstractMethod() {
  throw Error('Non-overridden abstract method called.');
}

})();
(function(){
"use strict";

/**
 * @ngdoc module
 * @name material.components.whiteframe
 */
angular.module('material.components.whiteframe', []);

})();
(function(){
"use strict";

angular
    .module('material.components.autocomplete')
    .controller('MdAutocompleteCtrl', MdAutocompleteCtrl);

var ITEM_HEIGHT  = 41,
    MAX_HEIGHT   = 5.5 * ITEM_HEIGHT,
    MENU_PADDING = 8;

function MdAutocompleteCtrl ($scope, $element, $mdUtil, $mdConstant, $mdTheming, $window,
                             $animate, $rootElement, $attrs, $q) {
  //-- private variables
  var ctrl                 = this,
      itemParts            = $scope.itemsExpr.split(/ in /i),
      itemExpr             = itemParts[ 1 ],
      elements             = null,
      cache                = {},
      noBlur               = false,
      selectedItemWatchers = [],
      hasFocus             = false,
      lastCount            = 0;

  //-- public variables with handlers
  defineProperty('hidden', handleHiddenChange, true);

  //-- public variables
  ctrl.scope      = $scope;
  ctrl.parent     = $scope.$parent;
  ctrl.itemName   = itemParts[ 0 ];
  ctrl.matches    = [];
  ctrl.loading    = false;
  ctrl.hidden     = true;
  ctrl.index      = null;
  ctrl.messages   = [];
  ctrl.id         = $mdUtil.nextUid();
  ctrl.isDisabled = null;
  ctrl.isRequired = null;
  ctrl.hasNotFound = false;

  //-- public methods
  ctrl.keydown                       = keydown;
  ctrl.blur                          = blur;
  ctrl.focus                         = focus;
  ctrl.clear                         = clearValue;
  ctrl.select                        = select;
  ctrl.listEnter                     = onListEnter;
  ctrl.listLeave                     = onListLeave;
  ctrl.mouseUp                       = onMouseup;
  ctrl.getCurrentDisplayValue        = getCurrentDisplayValue;
  ctrl.registerSelectedItemWatcher   = registerSelectedItemWatcher;
  ctrl.unregisterSelectedItemWatcher = unregisterSelectedItemWatcher;
  ctrl.notFoundVisible               = notFoundVisible;
  ctrl.loadingIsVisible              = loadingIsVisible;

  return init();

  //-- initialization methods

  /**
   * Initialize the controller, setup watchers, gather elements
   */
  function init () {
    $mdUtil.initOptionalProperties($scope, $attrs, { searchText: null, selectedItem: null });
    $mdTheming($element);
    configureWatchers();
    $mdUtil.nextTick(function () {
      gatherElements();
      moveDropdown();
      focusElement();
      $element.on('focus', focusElement);
    });
  }

  /**
   * Calculates the dropdown's position and applies the new styles to the menu element
   * @returns {*}
   */
  function positionDropdown () {
    if (!elements) return $mdUtil.nextTick(positionDropdown, false, $scope);
    var hrect  = elements.wrap.getBoundingClientRect(),
        vrect  = elements.snap.getBoundingClientRect(),
        root   = elements.root.getBoundingClientRect(),
        top    = vrect.bottom - root.top,
        bot    = root.bottom - vrect.top,
        left   = hrect.left - root.left,
        width  = hrect.width,
        offset = getVerticalOffset(),
        styles = {
          left:     left + 'px',
          minWidth: width + 'px',
          maxWidth: Math.max(hrect.right - root.left, root.right - hrect.left) - MENU_PADDING + 'px'
        };
    if (top > bot && root.height - hrect.bottom - MENU_PADDING < MAX_HEIGHT) {
      styles.top       = 'auto';
      styles.bottom    = bot + 'px';
      styles.maxHeight = Math.min(MAX_HEIGHT, hrect.top - root.top - MENU_PADDING) + 'px';
    } else {
      styles.top       = (top - offset) + 'px';
      styles.bottom    = 'auto';
      styles.maxHeight = Math.min(MAX_HEIGHT, root.bottom - hrect.bottom - MENU_PADDING) + 'px';
    }

    elements.$.scrollContainer.css(styles);
    $mdUtil.nextTick(correctHorizontalAlignment, false);

    /**
     * Calculates the vertical offset for floating label examples to account for ngMessages
     * @returns {number}
     */
    function getVerticalOffset () {
      var offset = 0;
      var inputContainer = $element.find('md-input-container');
      if (inputContainer.length) {
        var input = inputContainer.find('input');
        offset = inputContainer.prop('offsetHeight');
        offset -= input.prop('offsetTop');
        offset -= input.prop('offsetHeight');
      }
      return offset;
    }

    /**
     * Makes sure that the menu doesn't go off of the screen on either side.
     */
    function correctHorizontalAlignment () {
      var dropdown = elements.scrollContainer.getBoundingClientRect(),
          styles   = {};
      if (dropdown.right > root.right - MENU_PADDING) {
        styles.left = (hrect.right - dropdown.width) + 'px';
      }
      elements.$.scrollContainer.css(styles);
    }
  }

  /**
   * Moves the dropdown menu to the body tag in order to avoid z-index and overflow issues.
   */
  function moveDropdown () {
    if (!elements.$.root.length) return;
    $mdTheming(elements.$.scrollContainer);
    elements.$.scrollContainer.detach();
    elements.$.root.append(elements.$.scrollContainer);
    if ($animate.pin) $animate.pin(elements.$.scrollContainer, $rootElement);
  }

  /**
   * Sends focus to the input element.
   */
  function focusElement () {
    if ($scope.autofocus) elements.input.focus();
  }

  /**
   * Sets up any watchers used by autocomplete
   */
  function configureWatchers () {
    var wait = parseInt($scope.delay, 10) || 0;
    $attrs.$observe('disabled', function (value) { ctrl.isDisabled = value; });
    $attrs.$observe('required', function (value) { ctrl.isRequired = value !== null; });
    $scope.$watch('searchText', wait ? $mdUtil.debounce(handleSearchText, wait) : handleSearchText);
    $scope.$watch('selectedItem', selectedItemChange);
    angular.element($window).on('resize', positionDropdown);
    $scope.$on('$destroy', cleanup);
  }

  /**
   * Removes any events or leftover elements created by this controller
   */
  function cleanup () {
    angular.element($window).off('resize', positionDropdown);
    if ( elements ){
      var items = 'ul scroller scrollContainer input'.split(' ');
      angular.forEach(items, function(key){
        elements.$[key].remove();
      });
    }
  }

  /**
   * Gathers all of the elements needed for this controller
   */
  function gatherElements () {
    elements = {
      main:  $element[0],
      scrollContainer: $element[0].getElementsByClassName('md-virtual-repeat-container')[0],
      scroller: $element[0].getElementsByClassName('md-virtual-repeat-scroller')[0],
      ul:    $element.find('ul')[0],
      input: $element.find('input')[0],
      wrap:  $element.find('md-autocomplete-wrap')[0],
      root:  document.body
    };
    elements.li   = elements.ul.getElementsByTagName('li');
    elements.snap = getSnapTarget();
    elements.$    = getAngularElements(elements);
  }

  /**
   * Finds the element that the menu will base its position on
   * @returns {*}
   */
  function getSnapTarget () {
    for (var element = $element; element.length; element = element.parent()) {
      if (angular.isDefined(element.attr('md-autocomplete-snap'))) return element[ 0 ];
    }
    return elements.wrap;
  }

  /**
   * Gathers angular-wrapped versions of each element
   * @param elements
   * @returns {{}}
   */
  function getAngularElements (elements) {
    var obj = {};
    for (var key in elements) {
      if (elements.hasOwnProperty(key)) obj[ key ] = angular.element(elements[ key ]);
    }
    return obj;
  }

  //-- event/change handlers

  /**
   * Handles changes to the `hidden` property.
   * @param hidden
   * @param oldHidden
   */
  function handleHiddenChange (hidden, oldHidden) {
    if (!hidden && oldHidden) {
      positionDropdown();

      if (elements) {
        $mdUtil.nextTick(function () {
          $mdUtil.disableScrollAround(elements.ul);
        }, false, $scope);
      }
    } else if (hidden && !oldHidden) {
      $mdUtil.nextTick(function () {
        $mdUtil.enableScrolling();
      }, false, $scope);
    }
  }

  /**
   * When the user mouses over the dropdown menu, ignore blur events.
   */
  function onListEnter () {
    noBlur = true;
  }

  /**
   * When the user's mouse leaves the menu, blur events may hide the menu again.
   */
  function onListLeave () {
    noBlur = false;
    ctrl.hidden = shouldHide();
  }

  /**
   * When the mouse button is released, send focus back to the input field.
   */
  function onMouseup () {
    elements.input.focus();
  }

  /**
   * Handles changes to the selected item.
   * @param selectedItem
   * @param previousSelectedItem
   */
  function selectedItemChange (selectedItem, previousSelectedItem) {
    if (selectedItem) {
      getDisplayValue(selectedItem).then(function (val) {
        $scope.searchText = val;
        handleSelectedItemChange(selectedItem, previousSelectedItem);
      });
    }

    if (selectedItem !== previousSelectedItem) announceItemChange();
  }

  /**
   * Use the user-defined expression to announce changes each time a new item is selected
   */
  function announceItemChange () {
    angular.isFunction($scope.itemChange) && $scope.itemChange(getItemAsNameVal($scope.selectedItem));
  }

  /**
   * Use the user-defined expression to announce changes each time the search text is changed
   */
  function announceTextChange () {
    angular.isFunction($scope.textChange) && $scope.textChange();
  }

  /**
   * Calls any external watchers listening for the selected item.  Used in conjunction with
   * `registerSelectedItemWatcher`.
   * @param selectedItem
   * @param previousSelectedItem
   */
  function handleSelectedItemChange (selectedItem, previousSelectedItem) {
    selectedItemWatchers.forEach(function (watcher) { watcher(selectedItem, previousSelectedItem); });
  }

  /**
   * Register a function to be called when the selected item changes.
   * @param cb
   */
  function registerSelectedItemWatcher (cb) {
    if (selectedItemWatchers.indexOf(cb) == -1) {
      selectedItemWatchers.push(cb);
    }
  }

  /**
   * Unregister a function previously registered for selected item changes.
   * @param cb
   */
  function unregisterSelectedItemWatcher (cb) {
    var i = selectedItemWatchers.indexOf(cb);
    if (i != -1) {
      selectedItemWatchers.splice(i, 1);
    }
  }

  /**
   * Handles changes to the searchText property.
   * @param searchText
   * @param previousSearchText
   */
  function handleSearchText (searchText, previousSearchText) {
    ctrl.index = getDefaultIndex();
    // do nothing on init
    if (searchText === previousSearchText) return;

    getDisplayValue($scope.selectedItem).then(function (val) {
      // clear selected item if search text no longer matches it
      if (searchText !== val) {
        $scope.selectedItem = null;

        // trigger change event if available
        if (searchText !== previousSearchText) announceTextChange();

        // cancel results if search text is not long enough
        if (!isMinLengthMet()) {
          ctrl.matches = [];
          setLoading(false);
          updateMessages();
        } else {
          handleQuery();
        }
      }
    });

  }

  /**
   * Handles input blur event, determines if the dropdown should hide.
   */
  function blur () {
    if (!noBlur) {
      hasFocus = false;
      ctrl.hidden = shouldHide();
    }
  }

  /**
   * Force blur on input element
   * @param forceBlur
   */
  function doBlur(forceBlur) {
    if (forceBlur) noBlur = false;
    elements.input.blur();
  }

  /**
   * Handles input focus event, determines if the dropdown should show.
   */
  function focus () {
    hasFocus = true;
    //-- if searchText is null, let's force it to be a string
    if (!angular.isString($scope.searchText)) $scope.searchText = '';
    ctrl.hidden = shouldHide();
    if (!ctrl.hidden) handleQuery();
  }

  /**
   * Handles keyboard input.
   * @param event
   */
  function keydown (event) {
    switch (event.keyCode) {
      case $mdConstant.KEY_CODE.DOWN_ARROW:
        if (ctrl.loading) return;
        event.stopPropagation();
        event.preventDefault();
        ctrl.index   = Math.min(ctrl.index + 1, ctrl.matches.length - 1);
        updateScroll();
        updateMessages();
        break;
      case $mdConstant.KEY_CODE.UP_ARROW:
        if (ctrl.loading) return;
        event.stopPropagation();
        event.preventDefault();
        ctrl.index   = ctrl.index < 0 ? ctrl.matches.length - 1 : Math.max(0, ctrl.index - 1);
        updateScroll();
        updateMessages();
        break;
      case $mdConstant.KEY_CODE.TAB:
        if (ctrl.hidden || ctrl.loading || ctrl.index < 0 || ctrl.matches.length < 1) return;
        select(ctrl.index);
        break;
      case $mdConstant.KEY_CODE.ENTER:
        event.stopPropagation();
        event.preventDefault();
        if (ctrl.hidden || ctrl.loading || ctrl.index < 0 || ctrl.matches.length < 1) return;
        select(ctrl.index);
        break;
      case $mdConstant.KEY_CODE.ESCAPE:
        event.stopPropagation();
        event.preventDefault();
        clearValue();

        // Force the component to blur if they hit escape
        doBlur(true);

        break;
      default:
    }
  }

  //-- getters

  /**
   * Returns the minimum length needed to display the dropdown.
   * @returns {*}
   */
  function getMinLength () {
    return angular.isNumber($scope.minLength) ? $scope.minLength : 1;
  }

  /**
   * Returns the display value for an item.
   * @param item
   * @returns {*}
   */
  function getDisplayValue (item) {
    return $q.when(getItemText(item) || item);

    /**
     * Getter function to invoke user-defined expression (in the directive)
     * to convert your object to a single string.
     */
    function getItemText (item) {
      return (item && $scope.itemText) ? $scope.itemText(getItemAsNameVal(item)) : null;
    }
  }

  /**
   * Returns the locals object for compiling item templates.
   * @param item
   * @returns {{}}
   */
  function getItemAsNameVal (item) {
    if (!item) return undefined;

    var locals = {};
    if (ctrl.itemName) locals[ ctrl.itemName ] = item;

    return locals;
  }

  /**
   * Returns the default index based on whether or not autoselect is enabled.
   * @returns {number}
   */
  function getDefaultIndex () {
    return $scope.autoselect ? 0 : -1;
  }

  /**
   * Sets the loading parameter and updates the hidden state.
   * @param value {boolean} Whether or not the component is currently loading.
   */
  function setLoading(value) {
    if (ctrl.loading != value) {
      ctrl.loading = value;
    }

    // Always refresh the hidden variable as something else might have changed
    ctrl.hidden = shouldHide();
  }

  /**
   * Determines if the menu should be hidden.
   * @returns {boolean}
   */
  function shouldHide () {
    if ((ctrl.loading && !hasMatches()) || hasSelection() || !hasFocus) {
      return true;
    }

    return !shouldShow();
  }

  /**
   * Determines if the menu should be shown.
   * @returns {boolean}
   */
  function shouldShow() {
    return (isMinLengthMet() && hasMatches()) || notFoundVisible();
  }

  /**
   * Returns true if the search text has matches.
   * @returns {boolean}
   */
  function hasMatches() {
    return ctrl.matches.length ? true : false;
  }

  /**
   * Returns true if the autocomplete has a valid selection.
   * @returns {boolean}
   */
  function hasSelection() {
    return ctrl.scope.selectedItem ? true : false;
  }

  /**
   * Returns true if the loading indicator is, or should be, visible.
   * @returns {boolean}
   */
  function loadingIsVisible() {
    return ctrl.loading && !hasSelection();
  }

  /**
   * Returns the display value of the current item.
   * @returns {*}
   */
  function getCurrentDisplayValue () {
    return getDisplayValue(ctrl.matches[ ctrl.index ]);
  }

  /**
   * Determines if the minimum length is met by the search text.
   * @returns {*}
   */
  function isMinLengthMet () {
    return ($scope.searchText || '').length >= getMinLength();
  }

  //-- actions

  /**
   * Defines a public property with a handler and a default value.
   * @param key
   * @param handler
   * @param value
   */
  function defineProperty (key, handler, value) {
    Object.defineProperty(ctrl, key, {
      get: function () { return value; },
      set: function (newValue) {
        var oldValue = value;
        value        = newValue;
        handler(newValue, oldValue);
      }
    });
  }

  /**
   * Selects the item at the given index.
   * @param index
   */
  function select (index) {
    //-- force form to update state for validation
    $mdUtil.nextTick(function () {
      getDisplayValue(ctrl.matches[ index ]).then(function (val) {
        var ngModel = elements.$.input.controller('ngModel');
        ngModel.$setViewValue(val);
        ngModel.$render();
      }).finally(function () {
        $scope.selectedItem = ctrl.matches[ index ];
        setLoading(false);
      });
    }, false);
  }

  /**
   * Clears the searchText value and selected item.
   */
  function clearValue () {
    // Set the loading to true so we don't see flashes of content
    setLoading(true);

    // Reset our variables
    ctrl.index = 0;
    ctrl.matches = [];
    $scope.searchText = '';

    // Tell the select to fire and select nothing
    select(-1);

    // Per http://www.w3schools.com/jsref/event_oninput.asp
    var eventObj = document.createEvent('CustomEvent');
    eventObj.initCustomEvent('input', true, true, { value: $scope.searchText });
    elements.input.dispatchEvent(eventObj);

    elements.input.focus();
  }

  /**
   * Fetches the results for the provided search text.
   * @param searchText
   */
  function fetchResults (searchText) {
    var items = $scope.$parent.$eval(itemExpr),
        term  = searchText.toLowerCase();
    if (angular.isArray(items)) {
      handleResults(items);
    } else if (items) {
      setLoading(true);
      $mdUtil.nextTick(function () {
        if (items.success) items.success(handleResults);
        if (items.then)    items.then(handleResults);
        if (items.finally) items.finally(function () {
          setLoading(false);
        });
      },true, $scope);
    }
    function handleResults (matches) {
      cache[ term ] = matches;
      if ((searchText || '') !== ($scope.searchText || '')) return; //-- just cache the results if old request
      ctrl.matches = matches;
      ctrl.hidden  = shouldHide();
      if ($scope.selectOnMatch) selectItemOnMatch();
      updateMessages();
      positionDropdown();
    }
  }

  /**
   * Updates the ARIA messages
   */
  function updateMessages () {
    getCurrentDisplayValue().then(function (msg) {
      ctrl.messages = [ getCountMessage(), msg ];
    });
  }

  /**
   * Returns the ARIA message for how many results match the current query.
   * @returns {*}
   */
  function getCountMessage () {
    if (lastCount === ctrl.matches.length) return '';
    lastCount = ctrl.matches.length;
    switch (ctrl.matches.length) {
      case 0:
        return 'There are no matches available.';
      case 1:
        return 'There is 1 match available.';
      default:
        return 'There are ' + ctrl.matches.length + ' matches available.';
    }
  }

  /**
   * Makes sure that the focused element is within view.
   */
  function updateScroll () {
    if (!elements.li[0]) return;
    var height = elements.li[0].offsetHeight,
        top = height * ctrl.index,
        bot = top + height,
        hgt = elements.scroller.clientHeight,
        scrollTop = elements.scroller.scrollTop;
    if (top < scrollTop) {
      scrollTo(top);
    } else if (bot > scrollTop + hgt) {
      scrollTo(bot - hgt);
    }
  }

  function scrollTo (offset) {
    elements.$.scrollContainer.controller('mdVirtualRepeatContainer').scrollTo(offset);
  }

  function notFoundVisible () {
    var textLength = (ctrl.scope.searchText || '').length;

    return ctrl.hasNotFound && !hasMatches() && !ctrl.loading && textLength >= getMinLength() && hasFocus && !hasSelection();
  }

  /**
   * Starts the query to gather the results for the current searchText.  Attempts to return cached
   * results first, then forwards the process to `fetchResults` if necessary.
   */
  function handleQuery () {
    var searchText = $scope.searchText,
        term       = searchText.toLowerCase();
    //-- if results are cached, pull in cached results
    if (!$scope.noCache && cache[ term ]) {
      ctrl.matches = cache[ term ];
      updateMessages();
    } else {
      fetchResults(searchText);
    }

    ctrl.hidden = shouldHide();
  }

  /**
   * If there is only one matching item and the search text matches its display value exactly,
   * automatically select that item.  Note: This function is only called if the user uses the
   * `md-select-on-match` flag.
   */
  function selectItemOnMatch () {
    var searchText = $scope.searchText,
        matches    = ctrl.matches,
        item       = matches[ 0 ];
    if (matches.length === 1) getDisplayValue(item).then(function (displayValue) {
      if (searchText == displayValue) select(0);
    });
  }

}
MdAutocompleteCtrl.$inject = ["$scope", "$element", "$mdUtil", "$mdConstant", "$mdTheming", "$window", "$animate", "$rootElement", "$attrs", "$q"];

})();
(function(){
"use strict";

angular
    .module('material.components.autocomplete')
    .directive('mdAutocomplete', MdAutocomplete);

/**
 * @ngdoc directive
 * @name mdAutocomplete
 * @module material.components.autocomplete
 *
 * @description
 * `<md-autocomplete>` is a special input component with a drop-down of all possible matches to a
 *     custom query. This component allows you to provide real-time suggestions as the user types
 *     in the input area.
 *
 * To start, you will need to specify the required parameters and provide a template for your
 *     results. The content inside `md-autocomplete` will be treated as a template.
 *
 * In more complex cases, you may want to include other content such as a message to display when
 *     no matches were found.  You can do this by wrapping your template in `md-item-template` and
 *     adding a tag for `md-not-found`.  An example of this is shown below.
 *
 * ### Validation
 *
 * You can use `ng-messages` to include validation the same way that you would normally validate;
 *     however, if you want to replicate a standard input with a floating label, you will have to
 *     do the following:
 *
 * - Make sure that your template is wrapped in `md-item-template`
 * - Add your `ng-messages` code inside of `md-autocomplete`
 * - Add your validation properties to `md-autocomplete` (ie. `required`)
 * - Add a `name` to `md-autocomplete` (to be used on the generated `input`)
 *
 * There is an example below of how this should look.
 *
 *
 * @param {expression} md-items An expression in the format of `item in items` to iterate over
 *     matches for your search.
 * @param {expression=} md-selected-item-change An expression to be run each time a new item is
 *     selected
 * @param {expression=} md-search-text-change An expression to be run each time the search text
 *     updates
 * @param {expression=} md-search-text A model to bind the search query text to
 * @param {object=} md-selected-item A model to bind the selected item to
 * @param {expression=} md-item-text An expression that will convert your object to a single string.
 * @param {string=} placeholder Placeholder text that will be forwarded to the input.
 * @param {boolean=} md-no-cache Disables the internal caching that happens in autocomplete
 * @param {boolean=} ng-disabled Determines whether or not to disable the input field
 * @param {number=} md-min-length Specifies the minimum length of text before autocomplete will
 *     make suggestions
 * @param {number=} md-delay Specifies the amount of time (in milliseconds) to wait before looking
 *     for results
 * @param {boolean=} md-autofocus If true, will immediately focus the input element
 * @param {boolean=} md-autoselect If true, the first item will be selected by default
 * @param {string=} md-menu-class This will be applied to the dropdown menu for styling
 * @param {string=} md-floating-label This will add a floating label to autocomplete and wrap it in
 *     `md-input-container`
 * @param {string=} md-input-name The name attribute given to the input element to be used with
 *     FormController
 * @param {string=} md-input-id An ID to be added to the input element
 * @param {number=} md-input-minlength The minimum length for the input's value for validation
 * @param {number=} md-input-maxlength The maximum length for the input's value for validation
 * @param {boolean=} md-select-on-match When set, autocomplete will automatically select exact
 *     the item if the search text is an exact match
 *
 * @usage
 * ### Basic Example
 * <hljs lang="html">
 *   <md-autocomplete
 *       md-selected-item="selectedItem"
 *       md-search-text="searchText"
 *       md-items="item in getMatches(searchText)"
 *       md-item-text="item.display">
 *     <span md-highlight-text="searchText">{{item.display}}</span>
 *   </md-autocomplete>
 * </hljs>
 *
 * ### Example with "not found" message
 * <hljs lang="html">
 * <md-autocomplete
 *     md-selected-item="selectedItem"
 *     md-search-text="searchText"
 *     md-items="item in getMatches(searchText)"
 *     md-item-text="item.display">
 *   <md-item-template>
 *     <span md-highlight-text="searchText">{{item.display}}</span>
 *   </md-item-template>
 *   <md-not-found>
 *     No matches found.
 *   </md-not-found>
 * </md-autocomplete>
 * </hljs>
 *
 * In this example, our code utilizes `md-item-template` and `md-not-found` to specify the
 *     different parts that make up our component.
 *
 * ### Example with validation
 * <hljs lang="html">
 * <form name="autocompleteForm">
 *   <md-autocomplete
 *       required
 *       md-input-name="autocomplete"
 *       md-selected-item="selectedItem"
 *       md-search-text="searchText"
 *       md-items="item in getMatches(searchText)"
 *       md-item-text="item.display">
 *     <md-item-template>
 *       <span md-highlight-text="searchText">{{item.display}}</span>
 *     </md-item-template>
 *     <div ng-messages="autocompleteForm.autocomplete.$error">
 *       <div ng-message="required">This field is required</div>
 *     </div>
 *   </md-autocomplete>
 * </form>
 * </hljs>
 *
 * In this example, our code utilizes `md-item-template` and `md-not-found` to specify the
 *     different parts that make up our component.
 */

function MdAutocomplete () {
  var hasNotFoundTemplate = false;

  return {
    controller:   'MdAutocompleteCtrl',
    controllerAs: '$mdAutocompleteCtrl',
    scope:        {
      inputName:      '@mdInputName',
      inputMinlength: '@mdInputMinlength',
      inputMaxlength: '@mdInputMaxlength',
      searchText:     '=?mdSearchText',
      selectedItem:   '=?mdSelectedItem',
      itemsExpr:      '@mdItems',
      itemText:       '&mdItemText',
      placeholder:    '@placeholder',
      noCache:        '=?mdNoCache',
      selectOnMatch:  '=?mdSelectOnMatch',
      itemChange:     '&?mdSelectedItemChange',
      textChange:     '&?mdSearchTextChange',
      minLength:      '=?mdMinLength',
      delay:          '=?mdDelay',
      autofocus:      '=?mdAutofocus',
      floatingLabel:  '@?mdFloatingLabel',
      autoselect:     '=?mdAutoselect',
      menuClass:      '@?mdMenuClass',
      inputId:        '@?mdInputId'
    },
    link: function(scope, element, attrs, controller) {
      controller.hasNotFound = hasNotFoundTemplate;
    },
    template:     function (element, attr) {
      var noItemsTemplate = getNoItemsTemplate(),
          itemTemplate    = getItemTemplate(),
          leftover        = element.html(),
          tabindex        = attr.tabindex;

      if (noItemsTemplate) {
        hasNotFoundTemplate = true;
      }

      if (attr.hasOwnProperty('tabindex')) {
        element.attr('tabindex', '-1');
      }

      return '\
        <md-autocomplete-wrap\
            layout="row"\
            ng-class="{ \'md-whiteframe-z1\': !floatingLabel, \'md-menu-showing\': !$mdAutocompleteCtrl.hidden }"\
            role="listbox">\
          ' + getInputElement() + '\
          <md-progress-linear\
              ng-if="$mdAutocompleteCtrl.loadingIsVisible()"\
              md-mode="indeterminate"></md-progress-linear>\
          <md-virtual-repeat-container\
              md-auto-shrink\
              md-auto-shrink-min="1"\
              ng-hide="$mdAutocompleteCtrl.hidden"\
              class="md-autocomplete-suggestions-container md-whiteframe-z1"\
              role="presentation">\
            <ul class="md-autocomplete-suggestions"\
                ng-class="::menuClass"\
                id="ul-{{$mdAutocompleteCtrl.id}}"\
                ng-mouseenter="$mdAutocompleteCtrl.listEnter()"\
                ng-mouseleave="$mdAutocompleteCtrl.listLeave()"\
                ng-mouseup="$mdAutocompleteCtrl.mouseUp()">\
              <li md-virtual-repeat="item in $mdAutocompleteCtrl.matches"\
                  ng-class="{ selected: $index === $mdAutocompleteCtrl.index }"\
                  ng-click="$mdAutocompleteCtrl.select($index)"\
                  md-extra-name="$mdAutocompleteCtrl.itemName">\
                  ' + itemTemplate + '\
                  </li>' + noItemsTemplate + '\
            </ul>\
          </md-virtual-repeat-container>\
        </md-autocomplete-wrap>\
        <aria-status\
            class="md-visually-hidden"\
            role="status"\
            aria-live="assertive">\
          <p ng-repeat="message in $mdAutocompleteCtrl.messages track by $index" ng-if="message">{{message}}</p>\
        </aria-status>';

      function getItemTemplate() {
        var templateTag = element.find('md-item-template').detach(),
            html = templateTag.length ? templateTag.html() : element.html();
        if (!templateTag.length) element.empty();
        return '<md-autocomplete-parent-scope md-autocomplete-replace>' + html + '</md-autocomplete-parent-scope>';
      }

      function getNoItemsTemplate() {
        var templateTag = element.find('md-not-found').detach(),
            template = templateTag.length ? templateTag.html() : '';
        return template
            ? '<li ng-if="$mdAutocompleteCtrl.notFoundVisible()"\
                         md-autocomplete-parent-scope>' + template + '</li>'
            : '';

      }

      function getInputElement () {
        if (attr.mdFloatingLabel) {
          return '\
            <md-input-container flex ng-if="floatingLabel">\
              <label>{{floatingLabel}}</label>\
              <input type="search"\
                  ' + (tabindex != null ? 'tabindex="' + tabindex + '"' : '') + '\
                  id="{{ inputId || \'fl-input-\' + $mdAutocompleteCtrl.id }}"\
                  name="{{inputName}}"\
                  autocomplete="off"\
                  ng-required="$mdAutocompleteCtrl.isRequired"\
                  ng-minlength="inputMinlength"\
                  ng-maxlength="inputMaxlength"\
                  ng-disabled="$mdAutocompleteCtrl.isDisabled"\
                  ng-model="$mdAutocompleteCtrl.scope.searchText"\
                  ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                  ng-blur="$mdAutocompleteCtrl.blur()"\
                  ng-focus="$mdAutocompleteCtrl.focus()"\
                  aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                  aria-label="{{floatingLabel}}"\
                  aria-autocomplete="list"\
                  aria-haspopup="true"\
                  aria-activedescendant=""\
                  aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
              <div md-autocomplete-parent-scope md-autocomplete-replace>' + leftover + '</div>\
            </md-input-container>';
        } else {
          return '\
            <input flex type="search"\
                ' + (tabindex != null ? 'tabindex="' + tabindex + '"' : '') + '\
                id="{{ inputId || \'input-\' + $mdAutocompleteCtrl.id }}"\
                name="{{inputName}}"\
                ng-if="!floatingLabel"\
                autocomplete="off"\
                ng-required="$mdAutocompleteCtrl.isRequired"\
                ng-disabled="$mdAutocompleteCtrl.isDisabled"\
                ng-model="$mdAutocompleteCtrl.scope.searchText"\
                ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                ng-blur="$mdAutocompleteCtrl.blur()"\
                ng-focus="$mdAutocompleteCtrl.focus()"\
                placeholder="{{placeholder}}"\
                aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                aria-label="{{placeholder}}"\
                aria-autocomplete="list"\
                aria-haspopup="true"\
                aria-activedescendant=""\
                aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
            <button\
                type="button"\
                tabindex="-1"\
                ng-if="$mdAutocompleteCtrl.scope.searchText && !$mdAutocompleteCtrl.isDisabled"\
                ng-click="$mdAutocompleteCtrl.clear()">\
              <md-icon md-svg-icon="md-close"></md-icon>\
              <span class="md-visually-hidden">Clear</span>\
            </button>\
                ';
        }
      }
    }
  };
}

})();
(function(){
"use strict";

angular
  .module('material.components.autocomplete')
  .directive('mdAutocompleteParentScope', MdAutocompleteItemScopeDirective);

function MdAutocompleteItemScopeDirective($compile, $mdUtil) {
  return {
    restrict: 'AE',
    link: postLink,
    terminal: true
  };

  function postLink(scope, element, attr) {
    var ctrl = scope.$mdAutocompleteCtrl;
    var newScope = ctrl.parent.$new();
    var itemName = ctrl.itemName;

    // Watch for changes to our scope's variables and copy them to the new scope
    watchVariable('$index', '$index');
    watchVariable('item', itemName);

    // Recompile the contents with the new/modified scope
    $compile(element.contents())(newScope);

    // Replace it if required
    if (attr.hasOwnProperty('mdAutocompleteReplace')) {
      element.after(element.contents());
      element.remove();
    }

    /**
     * Creates a watcher for variables that are copied from the parent scope
     * @param variable
     * @param alias
     */
    function watchVariable(variable, alias) {
      newScope[alias] = scope[variable];

      scope.$watch(variable, function(value) {
        $mdUtil.nextTick(function() {
          newScope[alias] = value;
        });
      });
    }
  }
}
MdAutocompleteItemScopeDirective.$inject = ["$compile", "$mdUtil"];
})();
(function(){
"use strict";

angular
    .module('material.components.autocomplete')
    .controller('MdHighlightCtrl', MdHighlightCtrl);

function MdHighlightCtrl ($scope, $element, $attrs) {
  this.init = init;

  function init (termExpr, unsafeTextExpr) {
    var text = null,
        regex = null,
        flags = $attrs.mdHighlightFlags || '',
        watcher = $scope.$watch(function($scope) {
          return {
            term: termExpr($scope),
            unsafeText: unsafeTextExpr($scope)
          };
        }, function (state, prevState) {
          if (text === null || state.unsafeText !== prevState.unsafeText) {
            text = angular.element('<div>').text(state.unsafeText).html()
          }
          if (regex === null || state.term !== prevState.term) {
            regex = getRegExp(state.term, flags);
          }

          $element.html(text.replace(regex, '<span class="highlight">$&</span>'));
        }, true);
    $element.on('$destroy', function () { watcher(); });
  }

  function sanitize (term) {
    return term && term.replace(/[\\\^\$\*\+\?\.\(\)\|\{}\[\]]/g, '\\$&');
  }

  function getRegExp (text, flags) {
    var str = '';
    if (flags.indexOf('^') >= 1) str += '^';
    str += text;
    if (flags.indexOf('$') >= 1) str += '$';
    return new RegExp(sanitize(str), flags.replace(/[\$\^]/g, ''));
  }
}
MdHighlightCtrl.$inject = ["$scope", "$element", "$attrs"];

})();
(function(){
"use strict";

angular
    .module('material.components.autocomplete')
    .directive('mdHighlightText', MdHighlight);

/**
 * @ngdoc directive
 * @name mdHighlightText
 * @module material.components.autocomplete
 *
 * @description
 * The `md-highlight-text` directive allows you to specify text that should be highlighted within
 *     an element.  Highlighted text will be wrapped in `<span class="highlight"></span>` which can
 *     be styled through CSS.  Please note that child elements may not be used with this directive.
 *
 * @param {string} md-highlight-text A model to be searched for
 * @param {string=} md-highlight-flags A list of flags (loosely based on JavaScript RexExp flags).
 * #### **Supported flags**:
 * - `g`: Find all matches within the provided text
 * - `i`: Ignore case when searching for matches
 * - `$`: Only match if the text ends with the search term
 * - `^`: Only match if the text begins with the search term
 *
 * @usage
 * <hljs lang="html">
 * <input placeholder="Enter a search term..." ng-model="searchTerm" type="text" />
 * <ul>
 *   <li ng-repeat="result in results" md-highlight-text="searchTerm">
 *     {{result.text}}
 *   </li>
 * </ul>
 * </hljs>
 */

function MdHighlight ($interpolate, $parse) {
  return {
    terminal: true,
    controller: 'MdHighlightCtrl',
    compile: function mdHighlightCompile(tElement, tAttr) {
      var termExpr = $parse(tAttr.mdHighlightText);
      var unsafeTextExpr = $interpolate(tElement.html());

      return function mdHighlightLink(scope, element, attr, ctrl) {
        ctrl.init(termExpr, unsafeTextExpr);
      };
    }
  };
}
MdHighlight.$inject = ["$interpolate", "$parse"];

})();
(function(){
"use strict";

angular
    .module('material.components.chips')
    .directive('mdChip', MdChip);

/**
 * @ngdoc directive
 * @name mdChip
 * @module material.components.chips
 *
 * @description
 * `<md-chip>` is a component used within `<md-chips>` and is responsible for rendering individual
 * chips.
 *
 *
 * @usage
 * <hljs lang="html">
 *   <md-chip>{{$chip}}</md-chip>
 * </hljs>
 *
 */

// This hint text is hidden within a chip but used by screen readers to
// inform the user how they can interact with a chip.
var DELETE_HINT_TEMPLATE = '\
    <span ng-if="!$mdChipsCtrl.readonly" class="md-visually-hidden">\
      {{$mdChipsCtrl.deleteHint}}\
    </span>';

/**
 * MDChip Directive Definition
 *
 * @param $mdTheming
 * @param $mdInkRipple
 * @ngInject
 */
function MdChip($mdTheming, $mdUtil) {
  var hintTemplate = $mdUtil.processTemplate(DELETE_HINT_TEMPLATE);

  return {
    restrict: 'E',
    require: '^?mdChips',
    compile:  compile
  };

  function compile(element, attr) {
    // Append the delete template
    element.append($mdUtil.processTemplate(hintTemplate));

    return function postLink(scope, element, attr, ctrl) {
      element.addClass('md-chip');
      $mdTheming(element);

      if (ctrl) angular.element(element[0].querySelector('.md-chip-content'))
          .on('blur', function () {
            ctrl.selectedChip = -1;
          });
    };
  }
}
MdChip.$inject = ["$mdTheming", "$mdUtil"];

})();
(function(){
"use strict";

angular
    .module('material.components.chips')
    .directive('mdChipRemove', MdChipRemove);

/**
 * @ngdoc directive
 * @name mdChipRemove
 * @module material.components.chips
 *
 * @description
 * `<md-chip-remove>`
 * Designates an element to be used as the delete button for a chip. This
 * element is passed as a child of the `md-chips` element.
 *
 * @usage
 * <hljs lang="html">
 *   <md-chips><button md-chip-remove>DEL</button></md-chips>
 * </hljs>
 */


/**
 * MdChipRemove Directive Definition.
 * 
 * @param $compile
 * @param $timeout
 * @returns {{restrict: string, require: string[], link: Function, scope: boolean}}
 * @constructor
 */
function MdChipRemove ($timeout) {
  return {
    restrict: 'A',
    require: '^mdChips',
    scope: false,
    link: postLink
  };

  function postLink(scope, element, attr, ctrl) {
    element.on('click', function(event) {
      scope.$apply(function() {
        ctrl.removeChip(scope.$$replacedScope.$index);
      });
    });

    // Child elements aren't available until after a $timeout tick as they are hidden by an
    // `ng-if`. see http://goo.gl/zIWfuw
    $timeout(function() {
      element.attr({ tabindex: -1, ariaHidden: true });
      element.find('button').attr('tabindex', '-1');
    });
  }
}
MdChipRemove.$inject = ["$timeout"];

})();
(function(){
"use strict";

angular
    .module('material.components.chips')
    .directive('mdChipTransclude', MdChipTransclude);

function MdChipTransclude ($compile) {
  return {
    restrict: 'EA',
    terminal: true,
    link: link,
    scope: false
  };
  function link (scope, element, attr) {
    var ctrl = scope.$parent.$mdChipsCtrl,
        newScope = ctrl.parent.$new(false, ctrl.parent);
    newScope.$$replacedScope = scope;
    newScope.$chip = scope.$chip;
    newScope.$index = scope.$index;
    newScope.$mdChipsCtrl = ctrl;

    var newHtml = ctrl.$scope.$eval(attr.mdChipTransclude);

    element.html(newHtml);
    $compile(element.contents())(newScope);
  }
}
MdChipTransclude.$inject = ["$compile"];

})();
(function(){
"use strict";

angular
    .module('material.components.chips')
    .controller('MdChipsCtrl', MdChipsCtrl);

/**
 * Controller for the MdChips component. Responsible for adding to and
 * removing from the list of chips, marking chips as selected, and binding to
 * the models of various input components.
 *
 * @param $scope
 * @param $mdConstant
 * @param $log
 * @param $element
 * @constructor
 */
function MdChipsCtrl ($scope, $mdConstant, $log, $element, $timeout) {
  /** @type {$timeout} **/
  this.$timeout = $timeout;

  /** @type {Object} */
  this.$mdConstant = $mdConstant;

  /** @type {angular.$scope} */
  this.$scope = $scope;

  /** @type {angular.$scope} */
  this.parent = $scope.$parent;

  /** @type {$log} */
  this.$log = $log;

  /** @type {$element} */
  this.$element = $element;

  /** @type {angular.NgModelController} */
  this.ngModelCtrl = null;

  /** @type {angular.NgModelController} */
  this.userInputNgModelCtrl = null;

  /** @type {Element} */
  this.userInputElement = null;

  /** @type {Array.<Object>} */
  this.items = [];

  /** @type {number} */
  this.selectedChip = -1;

  /** @type {boolean} */
  this.hasAutocomplete = false;


  /**
   * Hidden hint text for how to delete a chip. Used to give context to screen readers.
   * @type {string}
   */
  this.deleteHint = 'Press delete to remove this chip.';

  /**
   * Hidden label for the delete button. Used to give context to screen readers.
   * @type {string}
   */
  this.deleteButtonLabel = 'Remove';

  /**
   * Model used by the input element.
   * @type {string}
   */
  this.chipBuffer = '';

  /**
   * Whether to use the onAppend expression to transform the chip buffer
   * before appending it to the list.
   * @type {boolean}
   */
  this.useOnAppend = false;

  /**
   * Whether to use the onSelect expression to notify the component's user
   * after selecting a chip from the list.
   * @type {boolean}
   */
  this.useOnSelect = false;
}
MdChipsCtrl.$inject = ["$scope", "$mdConstant", "$log", "$element", "$timeout"];

/**
 * Handles the keydown event on the input element: <enter> appends the
 * buffer to the chip list, while backspace removes the last chip in the list
 * if the current buffer is empty.
 * @param event
 */
MdChipsCtrl.prototype.inputKeydown = function(event) {
  var chipBuffer = this.getChipBuffer();

  switch (event.keyCode) {
    case this.$mdConstant.KEY_CODE.ENTER:
      if ((this.hasAutocomplete && this.requireMatch) || !chipBuffer) break;
      event.preventDefault();
      this.appendChip(chipBuffer);
      this.resetChipBuffer();
      break;
    case this.$mdConstant.KEY_CODE.BACKSPACE:
      if (chipBuffer) break;
      event.preventDefault();
      event.stopPropagation();
      if (this.items.length) this.selectAndFocusChipSafe(this.items.length - 1);
      break;
  }
};

/**
 * Handles the keydown event on the chip elements: backspace removes the selected chip, arrow
 * keys switch which chips is active
 * @param event
 */
MdChipsCtrl.prototype.chipKeydown = function (event) {
  if (this.getChipBuffer()) return;
  switch (event.keyCode) {
    case this.$mdConstant.KEY_CODE.BACKSPACE:
    case this.$mdConstant.KEY_CODE.DELETE:
      if (this.selectedChip < 0) return;
      event.preventDefault();
      this.removeAndSelectAdjacentChip(this.selectedChip);
      break;
    case this.$mdConstant.KEY_CODE.LEFT_ARROW:
      event.preventDefault();
      if (this.selectedChip < 0) this.selectedChip = this.items.length;
      if (this.items.length) this.selectAndFocusChipSafe(this.selectedChip - 1);
      break;
    case this.$mdConstant.KEY_CODE.RIGHT_ARROW:
      event.preventDefault();
      this.selectAndFocusChipSafe(this.selectedChip + 1);
      break;
    case this.$mdConstant.KEY_CODE.ESCAPE:
    case this.$mdConstant.KEY_CODE.TAB:
      if (this.selectedChip < 0) return;
      event.preventDefault();
      this.onFocus();
      break;
  }
};

/**
 * Get the input's placeholder - uses `placeholder` when list is empty and `secondary-placeholder`
 * when the list is non-empty. If `secondary-placeholder` is not provided, `placeholder` is used
 * always.
 */
MdChipsCtrl.prototype.getPlaceholder = function() {
  // Allow `secondary-placeholder` to be blank.
  var useSecondary = (this.items.length &&
      (this.secondaryPlaceholder == '' || this.secondaryPlaceholder));
  return useSecondary ? this.placeholder : this.secondaryPlaceholder;
};

/**
 * Removes chip at {@code index} and selects the adjacent chip.
 * @param index
 */
MdChipsCtrl.prototype.removeAndSelectAdjacentChip = function(index) {
  var selIndex = this.getAdjacentChipIndex(index);
  this.removeChip(index);
  this.$timeout(angular.bind(this, function () {
      this.selectAndFocusChipSafe(selIndex);
  }));
};

/**
 * Sets the selected chip index to -1.
 */
MdChipsCtrl.prototype.resetSelectedChip = function() {
  this.selectedChip = -1;
};

/**
 * Gets the index of an adjacent chip to select after deletion. Adjacency is
 * determined as the next chip in the list, unless the target chip is the
 * last in the list, then it is the chip immediately preceding the target. If
 * there is only one item in the list, -1 is returned (select none).
 * The number returned is the index to select AFTER the target has been
 * removed.
 * If the current chip is not selected, then -1 is returned to select none.
 */
MdChipsCtrl.prototype.getAdjacentChipIndex = function(index) {
  var len = this.items.length - 1;
  return (len == 0) ? -1 :
      (index == len) ? index -1 : index;
};

/**
 * Append the contents of the buffer to the chip list. This method will first
 * call out to the md-on-append method, if provided
 * @param newChip
 */
MdChipsCtrl.prototype.appendChip = function(newChip) {
  if (this.useOnAppend && this.onAppend) {
    newChip = this.onAppend({'$chip': newChip});
  }
  if (this.items.indexOf(newChip) + 1) return;
  this.items.push(newChip);
};

/**
 * Sets whether to use the md-on-append expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code onAppend}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 */
MdChipsCtrl.prototype.useOnAppendExpression = function() {
  this.useOnAppend = true;
};

/**
 * Sets whether to use the md-on-remove expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code onRemove}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 */
MdChipsCtrl.prototype.useOnRemoveExpression = function() {
  this.useOnRemove = true;
};

/*
 * Sets whether to use the md-on-select expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code onSelect}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 */
MdChipsCtrl.prototype.useOnSelectExpression = function() {
  this.useOnSelect = true;
};

/**
 * Gets the input buffer. The input buffer can be the model bound to the
 * default input item {@code this.chipBuffer}, the {@code selectedItem}
 * model of an {@code md-autocomplete}, or, through some magic, the model
 * bound to any inpput or text area element found within a
 * {@code md-input-container} element.
 * @return {Object|string}
 */
MdChipsCtrl.prototype.getChipBuffer = function() {
  return !this.userInputElement ? this.chipBuffer :
      this.userInputNgModelCtrl ? this.userInputNgModelCtrl.$viewValue :
          this.userInputElement[0].value;
};

/**
 * Resets the input buffer for either the internal input or user provided input element.
 */
MdChipsCtrl.prototype.resetChipBuffer = function() {
  if (this.userInputElement) {
    if (this.userInputNgModelCtrl) {
      this.userInputNgModelCtrl.$setViewValue('');
      this.userInputNgModelCtrl.$render();
    } else {
      this.userInputElement[0].value = '';
    }
  } else {
    this.chipBuffer = '';
  }
};

/**
 * Removes the chip at the given index.
 * @param index
 */
MdChipsCtrl.prototype.removeChip = function(index) {
  var removed = this.items.splice(index, 1);

  if (removed && removed.length && this.useOnRemove && this.onRemove) {
    this.onRemove({ '$chip': removed[0], '$index': index });
  }
};

MdChipsCtrl.prototype.removeChipAndFocusInput = function (index) {
  this.removeChip(index);
  this.onFocus();
};
/**
 * Selects the chip at `index`,
 * @param index
 */
MdChipsCtrl.prototype.selectAndFocusChipSafe = function(index) {
  if (!this.items.length) {
    this.selectChip(-1);
    this.onFocus();
    return;
  }
  if (index === this.items.length) return this.onFocus();
  index = Math.max(index, 0);
  index = Math.min(index, this.items.length - 1);
  this.selectChip(index);
  this.focusChip(index);
};

/**
 * Marks the chip at the given index as selected.
 * @param index
 */
MdChipsCtrl.prototype.selectChip = function(index) {
  if (index >= -1 && index <= this.items.length) {
    this.selectedChip = index;

    // Fire the onSelect if provided
    if (this.useOnSelect && this.onSelect) {
      this.onSelect({'$chip': this.items[this.selectedChip] });
    }
  } else {
    this.$log.warn('Selected Chip index out of bounds; ignoring.');
  }
};

/**
 * Selects the chip at `index` and gives it focus.
 * @param index
 */
MdChipsCtrl.prototype.selectAndFocusChip = function(index) {
  this.selectChip(index);
  if (index != -1) {
    this.focusChip(index);
  }
};

/**
 * Call `focus()` on the chip at `index`
 */
MdChipsCtrl.prototype.focusChip = function(index) {
  this.$element[0].querySelector('md-chip[index="' + index + '"] .md-chip-content').focus();
};

/**
 * Configures the required interactions with the ngModel Controller.
 * Specifically, set {@code this.items} to the {@code NgModelCtrl#$viewVale}.
 * @param ngModelCtrl
 */
MdChipsCtrl.prototype.configureNgModel = function(ngModelCtrl) {
  this.ngModelCtrl = ngModelCtrl;

  var self = this;
  ngModelCtrl.$render = function() {
    // model is updated. do something.
    self.items = self.ngModelCtrl.$viewValue;
  };
};

MdChipsCtrl.prototype.onFocus = function () {
  var input = this.$element[0].querySelector('input');
  input && input.focus();
  this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputFocus = function () {
  this.inputHasFocus = true;
  this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputBlur = function () {
  this.inputHasFocus = false;
};

/**
 * Configure event bindings on a user-provided input element.
 * @param inputElement
 */
MdChipsCtrl.prototype.configureUserInput = function(inputElement) {
  this.userInputElement = inputElement;

  // Find the NgModelCtrl for the input element
  var ngModelCtrl = inputElement.controller('ngModel');
  // `.controller` will look in the parent as well.
  if (ngModelCtrl != this.ngModelCtrl) {
    this.userInputNgModelCtrl = ngModelCtrl;
  }

  var scope = this.$scope;
  var ctrl = this;

  // Run all of the events using evalAsync because a focus may fire a blur in the same digest loop
  var scopeApplyFn = function(event, fn) {
    scope.$evalAsync(angular.bind(ctrl, fn, event));
  };

  // Bind to keydown and focus events of input
  inputElement
      .attr({ tabindex: 0 })
      .on('keydown', function(event) { scopeApplyFn(event, ctrl.inputKeydown) })
      .on('focus', function(event) { scopeApplyFn(event, ctrl.onInputFocus) })
      .on('blur', function(event) { scopeApplyFn(event, ctrl.onInputBlur) })
};

MdChipsCtrl.prototype.configureAutocomplete = function(ctrl) {
  if ( ctrl ){
    this.hasAutocomplete = true;
    ctrl.registerSelectedItemWatcher(angular.bind(this, function (item) {
      if (item) {
        this.appendChip(item);
        this.resetChipBuffer();
      }
    }));

    this.$element.find('input')
        .on('focus',angular.bind(this, this.onInputFocus) )
        .on('blur', angular.bind(this, this.onInputBlur) );
  }
};

MdChipsCtrl.prototype.hasFocus = function () {
  return this.inputHasFocus || this.selectedChip >= 0;
};

})();
(function(){
"use strict";

  angular
      .module('material.components.chips')
      .directive('mdChips', MdChips);

  /**
   * @ngdoc directive
   * @name mdChips
   * @module material.components.chips
   *
   * @description
   * `<md-chips>` is an input component for building lists of strings or objects. The list items are
   * displayed as 'chips'. This component can make use of an `<input>` element or an
   * `<md-autocomplete>` element.
   *
   * ### Custom templates
   * A custom template may be provided to render the content of each chip. This is achieved by
   * specifying an `<md-chip-template>` element containing the custom content as a child of
   * `<md-chips>`.
   *
   * Note: Any attributes on
   * `<md-chip-template>` will be dropped as only the innerHTML is used for the chip template. The
   * variables `$chip` and `$index` are available in the scope of `<md-chip-template>`, representing
   * the chip object and its index in the list of chips, respectively.
   * To override the chip delete control, include an element (ideally a button) with the attribute
   * `md-chip-remove`. A click listener to remove the chip will be added automatically. The element
   * is also placed as a sibling to the chip content (on which there are also click listeners) to
   * avoid a nested ng-click situation.
   *
   * <h3> Pending Features </h3>
   * <ul style="padding-left:20px;">
   *
   *   <ul>Style
   *     <li>Colours for hover, press states (ripple?).</li>
   *   </ul>
   *
   *   <ul>Validation
   *     <li>allow a validation callback</li>
   *     <li>hilighting style for invalid chips</li>
   *   </ul>
   *
   *   <ul>Item mutation
   *     <li>Support `
   *       <md-chip-edit>` template, show/hide the edit element on tap/click? double tap/double
   *       click?
   *     </li>
   *   </ul>
   *
   *   <ul>Truncation and Disambiguation (?)
   *     <li>Truncate chip text where possible, but do not truncate entries such that two are
   *     indistinguishable.</li>
   *   </ul>
   *
   *   <ul>Drag and Drop
   *     <li>Drag and drop chips between related `<md-chips>` elements.
   *     </li>
   *   </ul>
   * </ul>
   *
   *  <span style="font-size:.8em;text-align:center">
   *    Warning: This component is a WORK IN PROGRESS. If you use it now,
   *    it will probably break on you in the future.
   *  </span>
   *
   * @param {string=|object=} ng-model A model to bind the list of items to
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input,
   *    displayed when there is at least on item in the list
   * @param {boolean=} readonly Disables list manipulation (deleting or adding list items), hiding
   *    the input and delete buttons
   * @param {expression} md-on-append An expression that when called expects you to return an object
   *    representation of the chip input string.
   * @param {expression=} md-on-remove An expression which will be called when a chip has been
   *    removed.
   * @param {expression=} md-on-select An expression which will be called when a chip is selected.
   * @param {string=} delete-hint A string read by screen readers instructing users that pressing
   *    the delete key will remove the chip.
   * @param {string=} delete-button-label A label for the delete button. Also hidden and read by
   *    screen readers.
   *
   * @usage
   * <hljs lang="html">
   *   <md-chips
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       readonly="isReadOnly">
   *   </md-chips>
   * </hljs>
   *
   */


  var MD_CHIPS_TEMPLATE = '\
      <md-chips-wrap\
          ng-if="!$mdChipsCtrl.readonly || $mdChipsCtrl.items.length > 0"\
          ng-keydown="$mdChipsCtrl.chipKeydown($event)"\
          ng-class="{ \'md-focused\': $mdChipsCtrl.hasFocus(), \'md-readonly\': !$mdChipsCtrl.ngModelCtrl }"\
          class="md-chips">\
        <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
            index="{{$index}}"\
            ng-class="{\'md-focused\': $mdChipsCtrl.selectedChip == $index, \'md-readonly\': $mdChipsCtrl.readonly}">\
          <div class="md-chip-content"\
              tabindex="-1"\
              aria-hidden="true"\
              ng-focus="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              md-chip-transclude="$mdChipsCtrl.chipContentsTemplate"></div>\
          <div ng-if="!$mdChipsCtrl.readonly"\
               class="md-chip-remove-container"\
               md-chip-transclude="$mdChipsCtrl.chipRemoveTemplate"></div>\
        </md-chip>\
        <div ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl"\
            class="md-chip-input-container"\
            md-chip-transclude="$mdChipsCtrl.chipInputTemplate"></div>\
        </div>\
      </md-chips-wrap>';

  var CHIP_INPUT_TEMPLATE = '\
        <input\
            tabindex="0"\
            placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
            aria-label="{{$mdChipsCtrl.getPlaceholder()}}"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.onInputFocus()"\
            ng-blur="$mdChipsCtrl.onInputBlur()"\
            ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

  var CHIP_DEFAULT_TEMPLATE = '\
      <span>{{$chip}}</span>';

  var CHIP_REMOVE_TEMPLATE = '\
      <button\
          class="md-chip-remove"\
          ng-if="!$mdChipsCtrl.readonly"\
          ng-click="$mdChipsCtrl.removeChipAndFocusInput($$replacedScope.$index)"\
          type="button"\
          aria-hidden="true"\
          tabindex="-1">\
        <md-icon md-svg-icon="md-close"></md-icon>\
        <span class="md-visually-hidden">\
          {{$mdChipsCtrl.deleteButtonLabel}}\
        </span>\
      </button>';

  /**
   * MDChips Directive Definition
   */
  function MdChips ($mdTheming, $mdUtil, $compile, $log, $timeout) {
    // Run our templates through $mdUtil.processTemplate() to allow custom start/end symbols
    var templates = getTemplates();

    return {
      template: function(element, attrs) {
        // Clone the element into an attribute. By prepending the attribute
        // name with '$', Angular won't write it into the DOM. The cloned
        // element propagates to the link function via the attrs argument,
        // where various contained-elements can be consumed.
        attrs['$mdUserTemplate'] = element.clone();
        return templates.chips;
      },
      require: ['mdChips'],
      restrict: 'E',
      controller: 'MdChipsCtrl',
      controllerAs: '$mdChipsCtrl',
      bindToController: true,
      compile: compile,
      scope: {
        readonly: '=readonly',
        placeholder: '@',
        secondaryPlaceholder: '@',
        onAppend: '&mdOnAppend',
        onRemove: '&mdOnRemove',
        onSelect: '&mdOnSelect',
        deleteHint: '@',
        deleteButtonLabel: '@',
        requireMatch: '=?mdRequireMatch'
      }
    };

    /**
     * Builds the final template for `md-chips` and returns the postLink function.
     *
     * Building the template involves 3 key components:
     * static chips
     * chip template
     * input control
     *
     * If no `ng-model` is provided, only the static chip work needs to be done.
     *
     * If no user-passed `md-chip-template` exists, the default template is used. This resulting
     * template is appended to the chip content element.
     *
     * The remove button may be overridden by passing an element with an md-chip-remove attribute.
     *
     * If an `input` or `md-autocomplete` element is provided by the caller, it is set aside for
     * transclusion later. The transclusion happens in `postLink` as the parent scope is required.
     * If no user input is provided, a default one is appended to the input container node in the
     * template.
     *
     * Static Chips (i.e. `md-chip` elements passed from the caller) are gathered and set aside for
     * transclusion in the `postLink` function.
     *
     *
     * @param element
     * @param attr
     * @returns {Function}
     */
    function compile(element, attr) {
      // Grab the user template from attr and reset the attribute to null.
      var userTemplate = attr['$mdUserTemplate'];
      attr['$mdUserTemplate'] = null;

      // Set the chip remove, chip contents and chip input templates. The link function will put
      // them on the scope for transclusion later.
      var chipRemoveTemplate   = getTemplateByQuery('md-chips>*[md-chip-remove]') || templates.remove,
          chipContentsTemplate = getTemplateByQuery('md-chips>md-chip-template') || templates.default,
          chipInputTemplate    = getTemplateByQuery('md-chips>md-autocomplete')
              || getTemplateByQuery('md-chips>input')
              || templates.input,
          staticChips = userTemplate.find('md-chip');

      // Warn of malformed template. See #2545
      if (userTemplate[0].querySelector('md-chip-template>*[md-chip-remove]')) {
        $log.warn('invalid placement of md-chip-remove within md-chip-template.');
      }

      function getTemplateByQuery (query) {
        if (!attr.ngModel) return;
        var element = userTemplate[0].querySelector(query);
        return element && element.outerHTML;
      }

      /**
       * Configures controller and transcludes.
       */
      return function postLink(scope, element, attrs, controllers) {

        $mdUtil.initOptionalProperties(scope, attr);

        $mdTheming(element);
        var mdChipsCtrl = controllers[0];
        mdChipsCtrl.chipContentsTemplate = chipContentsTemplate;
        mdChipsCtrl.chipRemoveTemplate   = chipRemoveTemplate;
        mdChipsCtrl.chipInputTemplate    = chipInputTemplate;

        element
            .attr({ ariaHidden: true, tabindex: -1 })
            .on('focus', function () { mdChipsCtrl.onFocus(); });

        if (attr.ngModel) {
          mdChipsCtrl.configureNgModel(element.controller('ngModel'));

          // If an `md-on-append` attribute was set, tell the controller to use the expression
          // when appending chips.
          if (attrs.mdOnAppend) mdChipsCtrl.useOnAppendExpression();

          // If an `md-on-remove` attribute was set, tell the controller to use the expression
          // when removing chips.
          if (attrs.mdOnRemove) mdChipsCtrl.useOnRemoveExpression();

          // If an `md-on-select` attribute was set, tell the controller to use the expression
          // when selecting chips.
          if (attrs.mdOnSelect) mdChipsCtrl.useOnSelectExpression();

          // The md-autocomplete and input elements won't be compiled until after this directive
          // is complete (due to their nested nature). Wait a tick before looking for them to
          // configure the controller.
          if (chipInputTemplate != templates.input) {
            // The autocomplete will not appear until the readonly attribute is not true (i.e.
            // false or undefined), so we have to watch the readonly and then on the next tick
            // after the chip transclusion has run, we can configure the autocomplete and user
            // input.
            scope.$watch('$mdChipsCtrl.readonly', function(readonly) {
              if (!readonly) {
                $mdUtil.nextTick(function(){
                  if (chipInputTemplate.indexOf('<md-autocomplete') === 0)
                    mdChipsCtrl
                        .configureAutocomplete(element.find('md-autocomplete')
                            .controller('mdAutocomplete'));
                  mdChipsCtrl.configureUserInput(element.find('input'));
                });
              }
            });
          }
        }

        // Compile with the parent's scope and prepend any static chips to the wrapper.
        if (staticChips.length > 0) {
          var compiledStaticChips = $compile(staticChips.clone())(scope.$parent);
          $timeout(function() { element.find('md-chips-wrap').prepend(compiledStaticChips); });
        }
      };
    }

    function getTemplates() {
      return {
        chips: $mdUtil.processTemplate(MD_CHIPS_TEMPLATE),
        input: $mdUtil.processTemplate(CHIP_INPUT_TEMPLATE),
        default: $mdUtil.processTemplate(CHIP_DEFAULT_TEMPLATE),
        remove: $mdUtil.processTemplate(CHIP_REMOVE_TEMPLATE)
      };
    }
  }
  MdChips.$inject = ["$mdTheming", "$mdUtil", "$compile", "$log", "$timeout"];

})();
(function(){
"use strict";

angular
    .module('material.components.chips')
    .controller('MdContactChipsCtrl', MdContactChipsCtrl);



/**
 * Controller for the MdContactChips component
 * @constructor
 */
function MdContactChipsCtrl () {
  /** @type {Object} */
  this.selectedItem = null;

  /** @type {string} */
  this.searchText = '';
}


MdContactChipsCtrl.prototype.queryContact = function(searchText) {
  var results = this.contactQuery({'$query': searchText});
  return this.filterSelected ?
      results.filter(angular.bind(this, this.filterSelectedContacts)) : results;
};


MdContactChipsCtrl.prototype.itemName = function(item) {
  return item[this.contactName];
};


MdContactChipsCtrl.prototype.filterSelectedContacts = function(contact) {
  return this.contacts.indexOf(contact) == -1;
};

})();
(function(){
"use strict";

angular
  .module('material.components.chips')
  .directive('mdContactChips', MdContactChips);

/**
 * @ngdoc directive
 * @name mdContactChips
 * @module material.components.chips
 *
 * @description
 * `<md-contact-chips>` is an input component based on `md-chips` and makes use of an
 * `md-autocomplete` element. The component allows the caller to supply a query expression which
 * returns  a list of possible contacts. The user can select one of these and add it to the list of
 * chips.
 *
 * You may also use the `md-highlight-text` directive along with it's parameters to control the
 * appearance of the matched text inside of the contacts' autocomplete popup.
 *
 * @param {string=|object=} ng-model A model to bind the list of items to
 * @param {string=} placeholder Placeholder text that will be forwarded to the input.
 * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input,
 *    displayed when there is at least on item in the list
 * @param {expression} md-contacts An expression expected to return contacts matching the search
 *    test, `$query`.
 * @param {string} md-contact-name The field name of the contact object representing the
 *    contact's name.
 * @param {string} md-contact-email The field name of the contact object representing the
 *    contact's email address.
 * @param {string} md-contact-image The field name of the contact object representing the
 *    contact's image.
 *
 *
 * // The following attribute has been removed but may come back.
 * @param {expression=} filter-selected Whether to filter selected contacts from the list of
 *    suggestions shown in the autocomplete.
 *
 *
 *
 * @usage
 * <hljs lang="html">
 *   <md-contact-chips
 *       ng-model="ctrl.contacts"
 *       md-contacts="ctrl.querySearch($query)"
 *       md-contact-name="name"
 *       md-contact-image="image"
 *       md-contact-email="email"
 *       placeholder="To">
 *   </md-contact-chips>
 * </hljs>
 *
 */


var MD_CONTACT_CHIPS_TEMPLATE = '\
      <md-chips class="md-contact-chips"\
          ng-model="$mdContactChipsCtrl.contacts"\
          md-require-match="$mdContactChipsCtrl.requireMatch"\
          md-autocomplete-snap>\
          <md-autocomplete\
              md-menu-class="md-contact-chips-suggestions"\
              md-selected-item="$mdContactChipsCtrl.selectedItem"\
              md-search-text="$mdContactChipsCtrl.searchText"\
              md-items="item in $mdContactChipsCtrl.queryContact($mdContactChipsCtrl.searchText)"\
              md-item-text="$mdContactChipsCtrl.itemName(item)"\
              md-no-cache="true"\
              md-autoselect\
              placeholder="{{$mdContactChipsCtrl.contacts.length == 0 ?\
                  $mdContactChipsCtrl.placeholder : $mdContactChipsCtrl.secondaryPlaceholder}}">\
            <div class="md-contact-suggestion">\
              <img \
                  ng-src="{{item[$mdContactChipsCtrl.contactImage]}}"\
                  alt="{{item[$mdContactChipsCtrl.contactName]}}"\
                  ng-if="item[$mdContactChipsCtrl.contactImage]" />\
              <span class="md-contact-name" md-highlight-text="$mdContactChipsCtrl.searchText"\
                    md-highlight-flags="{{$mdContactChipsCtrl.highlightFlags}}">\
                {{item[$mdContactChipsCtrl.contactName]}}\
              </span>\
              <span class="md-contact-email" >{{item[$mdContactChipsCtrl.contactEmail]}}</span>\
            </div>\
          </md-autocomplete>\
          <md-chip-template>\
            <div class="md-contact-avatar">\
              <img \
                  ng-src="{{$chip[$mdContactChipsCtrl.contactImage]}}"\
                  alt="{{$chip[$mdContactChipsCtrl.contactName]}}"\
                  ng-if="$chip[$mdContactChipsCtrl.contactImage]" />\
            </div>\
            <div class="md-contact-name">\
              {{$chip[$mdContactChipsCtrl.contactName]}}\
            </div>\
          </md-chip-template>\
      </md-chips>';


/**
 * MDContactChips Directive Definition
 *
 * @param $mdTheming
 * @returns {*}
 * @ngInject
 */
function MdContactChips($mdTheming, $mdUtil) {
  return {
    template: function(element, attrs) {
      return MD_CONTACT_CHIPS_TEMPLATE;
    },
    restrict: 'E',
    controller: 'MdContactChipsCtrl',
    controllerAs: '$mdContactChipsCtrl',
    bindToController: true,
    compile: compile,
    scope: {
      contactQuery: '&mdContacts',
      placeholder: '@',
      secondaryPlaceholder: '@',
      contactName: '@mdContactName',
      contactImage: '@mdContactImage',
      contactEmail: '@mdContactEmail',
      contacts: '=ngModel',
      requireMatch: '=?mdRequireMatch',
      highlightFlags: '@?mdHighlightFlags'
    }
  };

  function compile(element, attr) {
    return function postLink(scope, element, attrs, controllers) {

      $mdUtil.initOptionalProperties(scope, attr);
      $mdTheming(element);

      element.attr('tabindex', '-1');
    };
  }
}
MdContactChips.$inject = ["$mdTheming", "$mdUtil"];

})();
(function(){
"use strict";

angular
  .module('material.components.icon')
  .directive('mdIcon', ['$mdIcon', '$mdTheming', '$mdAria', mdIconDirective]);

/**
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `md-icon` directive makes it easier to use vector-based icons in your app (as opposed to
 * raster-based icons types like PNG). The directive supports both icon fonts and SVG icons.
 *
 * Icons should be consider view-only elements that should not be used directly as buttons; instead nest a `<md-icon>`
 * inside a `md-button` to add hover and click features.
 *
 * ### Icon fonts
 * Icon fonts are a technique in which you use a font where the glyphs in the font are
 * your icons instead of text. Benefits include a straightforward way to bundle everything into a
 * single HTTP request, simple scaling, easy color changing, and more.
 *
 * `md-icon` let's you consume an icon font by letting you reference specific icons in that font
 * by name rather than character code.
 *
 * ### SVG
 * For SVGs, the problem with using `<img>` or a CSS `background-image` is that you can't take
 * advantage of some SVG features, such as styling specific parts of the icon with CSS or SVG
 * animation.
 *
 * `md-icon` makes it easier to use SVG icons by *inlining* the SVG into an `<svg>` element in the
 * document. The most straightforward way of referencing an SVG icon is via URL, just like a
 * traditional `<img>`. `$mdIconProvider`, as a convenience, let's you _name_ an icon so you can
 * reference it by name instead of URL throughout your templates.
 *
 * Additionally, you may not want to make separate HTTP requests for every icon, so you can bundle
 * your SVG icons together and pre-load them with $mdIconProvider as an icon set. An icon set can
 * also be given a name, which acts as a namespace for individual icons, so you can reference them
 * like `"social:cake"`.
 *
 * When using SVGs, both external SVGs (via URLs) or sets of SVGs [from icon sets] can be
 * easily loaded and used.When use font-icons, developers must following three (3) simple steps:
 *
 * <ol>
 * <li>Load the font library. e.g.<br/>
 *    &lt;link href="https://fonts.googleapis.com/icon?family=Material+Icons"
 *    rel="stylesheet"&gt;
 * </li>
 * <li> Use either (a) font-icon class names or (b) font ligatures to render the font glyph by using its textual name</li>
 * <li> Use &lt;md-icon md-font-icon="classname" /&gt; or <br/>
 *     use &lt;md-icon md-font-set="font library classname or alias"&gt; textual_name &lt;/md-icon&gt; or <br/>
 *     use &lt;md-icon md-font-set="font library classname or alias"&gt; numerical_character_reference &lt;/md-icon&gt;
 * </li>
 * </ol>
 *
 * Full details for these steps can be found:
 *
 * <ul>
 * <li>http://google.github.io/material-design-icons/</li>
 * <li>http://google.github.io/material-design-icons/#icon-font-for-the-web</li>
 * </ul>
 *
 * The Material Design icon style <code>.material-icons</code> and the icon font references are published in
 * Material Design Icons:
 *
 * <ul>
 * <li>http://www.google.com/design/icons/</li>
 * <li>https://www.google.com/design/icons/#ic_accessibility</li>
 * </ul>
 *
 * <h2 id="material_design_icons">Material Design Icons</h2>
 * Using the Material Design Icon-Selector, developers can easily and quickly search for a Material Design font-icon and
 * determine its textual name and character reference code. Click on any icon to see the slide-up information
 * panel with details regarding a SVG download or information on the font-icon usage.
 *
 * <a href="https://www.google.com/design/icons/#ic_accessibility" target="_blank" style="border-bottom:none;">
 * <img src="https://cloud.githubusercontent.com/assets/210413/7902490/fe8dd14c-0780-11e5-98fb-c821cc6475e6.png"
 *      aria-label="Material Design Icon-Selector" style="max-width:75%;padding-left:10%">
 * </a>
 *
 * <span class="image_caption">
 *  Click on the image above to link to the
 *  <a href="https://www.google.com/design/icons/#ic_accessibility" target="_blank">Material Design Icon-Selector</a>.
 * </span>
 *
 * @param {string} md-font-icon String name of CSS icon associated with the font-face will be used
 * to render the icon. Requires the fonts and the named CSS styles to be preloaded.
 * @param {string} md-font-set CSS style name associated with the font library; which will be assigned as
 * the class for the font-icon ligature. This value may also be an alias that is used to lookup the classname;
 * internally use `$mdIconProvider.fontSet(<alias>)` to determine the style name.
 * @param {string} md-svg-src String URL (or expression) used to load, cache, and display an
 *     external SVG.
 * @param {string} md-svg-icon md-svg-icon String name used for lookup of the icon from the internal cache;
 *     interpolated strings or expressions may also be used. Specific set names can be used with
 *     the syntax `<set name>:<icon name>`.<br/><br/>
 * To use icon sets, developers are required to pre-register the sets using the `$mdIconProvider` service.
 * @param {string=} aria-label Labels icon for accessibility. If an empty string is provided, icon
 * will be hidden from accessibility layer with `aria-hidden="true"`. If there's no aria-label on the icon
 * nor a label on the parent element, a warning will be logged to the console.
 * @param {string=} alt Labels icon for accessibility. If an empty string is provided, icon
 * will be hidden from accessibility layer with `aria-hidden="true"`. If there's no alt on the icon
 * nor a label on the parent element, a warning will be logged to the console.
 *
 * @usage
 * When using SVGs:
 * <hljs lang="html">
 *
 *  <!-- Icon ID; may contain optional icon set prefix; icons must registered using $mdIconProvider -->
 *  <md-icon md-svg-icon="social:android"    aria-label="android " ></md-icon>
 *
 *  <!-- Icon urls; may be preloaded in templateCache -->
 *  <md-icon md-svg-src="/android.svg"       aria-label="android " ></md-icon>
 *  <md-icon md-svg-src="{{ getAndroid() }}" aria-label="android " ></md-icon>
 *
 * </hljs>
 *
 * Use the <code>$mdIconProvider</code> to configure your application with
 * svg iconsets.
 *
 * <hljs lang="js">
 *  angular.module('appSvgIconSets', ['ngMaterial'])
 *    .controller('DemoCtrl', function($scope) {})
 *    .config(function($mdIconProvider) {
 *      $mdIconProvider
 *         .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
 *         .defaultIconSet('img/icons/sets/core-icons.svg', 24);
 *     });
 * </hljs>
 *
 *
 * When using Font Icons with classnames:
 * <hljs lang="html">
 *
 *  <md-icon md-font-icon="android" aria-label="android" ></md-icon>
 *  <md-icon class="icon_home"      aria-label="Home"    ></md-icon>
 *
 * </hljs>
 *
 * When using Material Font Icons with ligatures:
 * <hljs lang="html">
 *  <!-- For Material Design Icons -->
 *  <!-- The class '.material-icons' is auto-added if a style has NOT been specified -->
 *  <md-icon> face </md-icon>
 *  <md-icon md-font-set="material-icons"> face </md-icon>
 *  <md-icon> #xE87C; </md-icon>
 *  <!-- The class '.material-icons' must be manually added if other styles are also specified-->
 *  <md-icon class="material-icons md-light md-48"> face </md-icon>
 * </hljs>
 *
 * When using other Font-Icon libraries:
 *
 * <hljs lang="js">
 *  // Specify a font-icon style alias
 *  angular.config(function($mdIconProvider) {
 *    $mdIconProvider.fontSet('fa', 'fontawesome');
 *  });
 * </hljs>
 *
 * <hljs lang="html">
 *  <md-icon md-font-set="fa">email</md-icon>
 * </hljs>
 *
 */
function mdIconDirective($mdIcon, $mdTheming, $mdAria ) {

  return {
    scope: {
      fontSet : '@mdFontSet',
      fontIcon: '@mdFontIcon',
      svgIcon : '@mdSvgIcon',
      svgSrc  : '@mdSvgSrc'
    },
    restrict: 'E',
    link : postLink
  };


  /**
   * Directive postLink
   * Supports embedded SVGs, font-icons, & external SVGs
   */
  function postLink(scope, element, attr) {
    $mdTheming(element);

    prepareForFontIcon();

    // If using a font-icon, then the textual name of the icon itself
    // provides the aria-label.

    var label = attr.alt || scope.fontIcon || scope.svgIcon || element.text();
    var attrName = attr.$normalize(attr.$attr.mdSvgIcon || attr.$attr.mdSvgSrc || '');

    if ( !attr['aria-label'] ) {

      if (label != '' && !parentsHaveText() ) {

        $mdAria.expect(element, 'aria-label', label);
        $mdAria.expect(element, 'role', 'img');

      } else if ( !element.text() ) {
        // If not a font-icon with ligature, then
        // hide from the accessibility layer.

        $mdAria.expect(element, 'aria-hidden', 'true');
      }
    }

    if (attrName) {
      // Use either pre-configured SVG or URL source, respectively.
      attr.$observe(attrName, function(attrVal) {

        element.empty();
        if (attrVal) {
          $mdIcon(attrVal).then(function(svg) {
            element.append(svg);
          });
        }

      });
    }

    function parentsHaveText() {
      var parent = element.parent();
      if (parent.attr('aria-label') || parent.text()) {
        return true;
      }
      else if(parent.parent().attr('aria-label') || parent.parent().text()) {
        return true;
      }
      return false;
    }

    function prepareForFontIcon() {
      if (!scope.svgIcon && !scope.svgSrc) {
        if (scope.fontIcon) {
          element.addClass('md-font ' + scope.fontIcon);
        }
        element.addClass($mdIcon.fontSet(scope.fontSet));
      }
    }
  }
}

})();
(function(){
"use strict";

  angular
    .module('material.components.icon' )
    .provider('$mdIcon', MdIconProvider);

  /**
    * @ngdoc service
    * @name $mdIconProvider
    * @module material.components.icon
    *
    * @description
    * `$mdIconProvider` is used only to register icon IDs with URLs. These configuration features allow
    * icons and icon sets to be pre-registered and associated with source URLs **before** the `<md-icon />`
    * directives are compiled.
    *
    * If using font-icons, the developer is responsible for loading the fonts.
    *
    * If using SVGs, loading of the actual svg files are deferred to on-demand requests and are loaded
    * internally by the `$mdIcon` service using the `$http` service. When an SVG is requested by name/ID,
    * the `$mdIcon` service searches its registry for the associated source URL;
    * that URL is used to on-demand load and parse the SVG dynamically.
    *
    * @usage
    * <hljs lang="js">
    *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .defaultFontSet( 'fontawesome' )
    *          .defaultIconSet('my/app/icons.svg')       // Register a default set of SVG icons
    *          .iconSet('social', 'my/app/social.svg')   // Register a named icon set of SVGs
    *          .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
    *          .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
    *   });
    * </hljs>
    *
    * SVG icons and icon sets can be easily pre-loaded and cached using either (a) a build process or (b) a runtime
    * **startup** process (shown below):
    *
    * <hljs lang="js">
    *   app.config(function($mdIconProvider) {
    *
    *     // Register a default set of SVG icon definitions
    *     $mdIconProvider.defaultIconSet('my/app/icons.svg')
    *
    *   })
    *   .run(function($http, $templateCache){
    *
    *     // Pre-fetch icons sources by URL and cache in the $templateCache...
    *     // subsequent $http calls will look there first.
    *
    *     var urls = [ 'imy/app/icons.svg', 'img/icons/android.svg'];
    *
    *     angular.forEach(urls, function(url) {
    *       $http.get(url, {cache: $templateCache});
    *     });
    *
    *   });
    *
    * </hljs>
    *
    * NOTE: the loaded SVG data is subsequently cached internally for future requests.
    *
    */

   /**
    * @ngdoc method
    * @name $mdIconProvider#icon
    *
    * @description
    * Register a source URL for a specific icon name; the name may include optional 'icon set' name prefix.
    * These icons  will later be retrieved from the cache using `$mdIcon( <icon name> )`
    *
    * @param {string} id Icon name/id used to register the icon
    * @param {string} url specifies the external location for the data file. Used internally by `$http` to load the
    * data or as part of the lookup in `$templateCache` if pre-loading was configured.
    * @param {number=} viewBoxSize Sets the width and height the icon's viewBox.
    * It is ignored for icons with an existing viewBox. Default size is 24.
    *
    * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
    *
    * @usage
    * <hljs lang="js">
    *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
    *          .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
    *   });
    * </hljs>
    *
    */
   /**
    * @ngdoc method
    * @name $mdIconProvider#iconSet
    *
    * @description
    * Register a source URL for a 'named' set of icons; group of SVG definitions where each definition
    * has an icon id. Individual icons can be subsequently retrieved from this cached set using
    * `$mdIcon(<icon set name>:<icon name>)`
    *
    * @param {string} id Icon name/id used to register the iconset
    * @param {string} url specifies the external location for the data file. Used internally by `$http` to load the
    * data or as part of the lookup in `$templateCache` if pre-loading was configured.
    * @param {number=} viewBoxSize Sets the width and height of the viewBox of all icons in the set. 
    * It is ignored for icons with an existing viewBox. All icons in the icon set should be the same size.
    * Default value is 24.
    *
    * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
    *
    *
    * @usage
    * <hljs lang="js">
    *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .iconSet('social', 'my/app/social.svg')   // Register a named icon set
    *   });
    * </hljs>
    *
    */
   /**
    * @ngdoc method
    * @name $mdIconProvider#defaultIconSet
    *
    * @description
    * Register a source URL for the default 'named' set of icons. Unless explicitly registered,
    * subsequent lookups of icons will failover to search this 'default' icon set.
    * Icon can be retrieved from this cached, default set using `$mdIcon(<name>)`
    *
    * @param {string} url specifies the external location for the data file. Used internally by `$http` to load the
    * data or as part of the lookup in `$templateCache` if pre-loading was configured.
    * @param {number=} viewBoxSize Sets the width and height of the viewBox of all icons in the set. 
    * It is ignored for icons with an existing viewBox. All icons in the icon set should be the same size.
    * Default value is 24.
    *
    * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
    *
    * @usage
    * <hljs lang="js">
    *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .defaultIconSet( 'my/app/social.svg' )   // Register a default icon set
    *   });
    * </hljs>
    *
    */
  /**
   * @ngdoc method
   * @name $mdIconProvider#defaultFontSet
   *
   * @description
   * When using Font-Icons, Angular Material assumes the the Material Design icons will be used and automatically
   * configures the default font-set == 'material-icons'. Note that the font-set references the font-icon library
   * class style that should be applied to the `<md-icon>`.
   *
   * Configuring the default means that the attributes
   * `md-font-set="material-icons"` or `class="material-icons"` do not need to be explicitly declared on the
   * `<md-icon>` markup. For example:
   *
   *  `<md-icon> face </md-icon>`
   *  will render as
   *  `<span class="material-icons"> face </span>`, and
   *
   *  `<md-icon md-font-set="fa"> face </md-icon>`
   *  will render as
   *  `<span class="fa"> face </span>`
   *
   * @param {string} name of the font-library style that should be applied to the md-icon DOM element
   *
   * @usage
   * <hljs lang="js">
   *   app.config(function($mdIconProvider) {
   *     $mdIconProvider.defaultFontSet( 'fontawesome' );
   *   });
   * </hljs>
   *
   */

   /**
    * @ngdoc method
    * @name $mdIconProvider#defaultViewBoxSize
    *
    * @description
    * While `<md-icon />` markup can also be style with sizing CSS, this method configures
    * the default width **and** height used for all icons; unless overridden by specific CSS.
    * The default sizing is (24px, 24px).
    * @param {number=} viewBoxSize Sets the width and height of the viewBox for an icon or an icon set.
    * All icons in a set should be the same size. The default value is 24.
    *
    * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
    *
    * @usage
    * <hljs lang="js">
    *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .defaultViewBoxSize(36)   // Register a default icon size (width == height)
    *   });
    * </hljs>
    *
    */

 var config = {
   defaultViewBoxSize: 24,
   defaultFontSet: 'material-icons',
   fontSets : [ ]
 };

 function MdIconProvider() { }

 MdIconProvider.prototype = {
   icon : function (id, url, viewBoxSize) {
     if ( id.indexOf(':') == -1 ) id = '$default:' + id;

     config[id] = new ConfigurationItem(url, viewBoxSize );
     return this;
   },

   iconSet : function (id, url, viewBoxSize) {
     config[id] = new ConfigurationItem(url, viewBoxSize );
     return this;
   },

   defaultIconSet : function (url, viewBoxSize) {
     var setName = '$default';

     if ( !config[setName] ) {
       config[setName] = new ConfigurationItem(url, viewBoxSize );
     }

     config[setName].viewBoxSize = viewBoxSize || config.defaultViewBoxSize;

     return this;
   },

   defaultViewBoxSize : function (viewBoxSize) {
     config.defaultViewBoxSize = viewBoxSize;
     return this;
   },
   
   /**
    * Register an alias name associated with a font-icon library style ;
    */
   fontSet : function fontSet(alias, className) {
    config.fontSets.push({
      alias : alias,
      fontSet : className || alias
    });
    return this;
   },

   /**
    * Specify a default style name associated with a font-icon library
    * fallback to Material Icons.
    *
    */
   defaultFontSet : function defaultFontSet(className) {
    config.defaultFontSet = !className ? '' : className;
    return this;
   },

   defaultIconSize : function defaultIconSize(iconSize) {
     config.defaultIconSize = iconSize;
     return this;
   },

   preloadIcons: function ($templateCache) {
     var iconProvider = this;
     var svgRegistry = [
       {
         id : 'md-tabs-arrow',
         url: 'md-tabs-arrow.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><polygon points="15.4,7.4 14,6 8,12 14,18 15.4,16.6 10.8,12 "/></g></svg>'
       },
       {
         id : 'md-close',
         url: 'md-close.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/></g></svg>'
       },
       {
         id:  'md-cancel',
         url: 'md-cancel.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M12 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10-4.47-10-10-10zm5 13.59l-1.41 1.41-3.59-3.59-3.59 3.59-1.41-1.41 3.59-3.59-3.59-3.59 1.41-1.41 3.59 3.59 3.59-3.59 1.41 1.41-3.59 3.59 3.59 3.59z"/></g></svg>'
       },
       {
         id:  'md-menu',
         url: 'md-menu.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /></svg>'
       },
       {
         id:  'md-toggle-arrow',
         url: 'md-toggle-arrow-svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 48 48"><path d="M24 16l-12 12 2.83 2.83 9.17-9.17 9.17 9.17 2.83-2.83z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>'
       },
       {
         id:  'md-calendar',
         url: 'md-calendar.svg',
         svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>'
       }
     ];

     svgRegistry.forEach(function(asset){
       iconProvider.icon(asset.id,  asset.url);
       $templateCache.put(asset.url, asset.svg);
     });

   },

   $get : ['$http', '$q', '$log', '$templateCache', function($http, $q, $log, $templateCache) {
     this.preloadIcons($templateCache);
     return MdIconService(config, $http, $q, $log, $templateCache);
   }]
 };

   /**
    *  Configuration item stored in the Icon registry; used for lookups
    *  to load if not already cached in the `loaded` cache
    */
   function ConfigurationItem(url, viewBoxSize) {
     this.url = url;
     this.viewBoxSize = viewBoxSize || config.defaultViewBoxSize;
   }

 /**
  * @ngdoc service
  * @name $mdIcon
  * @module material.components.icon
  *
  * @description
  * The `$mdIcon` service is a function used to lookup SVG icons.
  *
  * @param {string} id Query value for a unique Id or URL. If the argument is a URL, then the service will retrieve the icon element
  * from its internal cache or load the icon and cache it first. If the value is not a URL-type string, then an ID lookup is
  * performed. The Id may be a unique icon ID or may include an iconSet ID prefix.
  *
  * For the **id** query to work properly, this means that all id-to-URL mappings must have been previously configured
  * using the `$mdIconProvider`.
  *
  * @returns {obj} Clone of the initial SVG DOM element; which was created from the SVG markup in the SVG data file.
  *
  * @usage
  * <hljs lang="js">
  * function SomeDirective($mdIcon) {
  *
  *   // See if the icon has already been loaded, if not
  *   // then lookup the icon from the registry cache, load and cache
  *   // it for future requests.
  *   // NOTE: ID queries require configuration with $mdIconProvider
  *
  *   $mdIcon('android').then(function(iconEl)    { element.append(iconEl); });
  *   $mdIcon('work:chair').then(function(iconEl) { element.append(iconEl); });
  *
  *   // Load and cache the external SVG using a URL
  *
  *   $mdIcon('img/icons/android.svg').then(function(iconEl) {
  *     element.append(iconEl);
  *   });
  * };
  * </hljs>
  *
  * NOTE: The `<md-icon />  ` directive internally uses the `$mdIcon` service to query, loaded, and instantiate
  * SVG DOM elements.
  */

  /* @ngInject */
 function MdIconService(config, $http, $q, $log, $templateCache) {
   var iconCache = {};
   var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i;

   Icon.prototype = { clone : cloneSVG, prepare: prepareAndStyle };
   getIcon.fontSet = findRegisteredFontSet;

   // Publish service...
   return getIcon;

   /**
    * Actual $mdIcon service is essentially a lookup function
    */
   function getIcon(id) {
     id = id || '';

     // If already loaded and cached, use a clone of the cached icon.
     // Otherwise either load by URL, or lookup in the registry and then load by URL, and cache.

     if ( iconCache[id]         ) return $q.when( iconCache[id].clone() );
     if ( urlRegex.test(id)     ) return loadByURL(id).then( cacheIcon(id) );
     if ( id.indexOf(':') == -1 ) id = '$default:' + id;

     var load = config[id] ? loadByID : loadFromIconSet;
     return load(id)
         .then( cacheIcon(id) );
   }

   /**
    * Lookup registered fontSet style using its alias...
    * If not found,
    */
   function findRegisteredFontSet(alias) {
      var useDefault = angular.isUndefined(alias) || !(alias && alias.length);
      if ( useDefault ) return config.defaultFontSet;

      var result = alias;
      angular.forEach(config.fontSets, function(it){
        if ( it.alias == alias ) result = it.fontSet || result;
      });

      return result;
   }

   /**
    * Prepare and cache the loaded icon for the specified `id`
    */
   function cacheIcon( id ) {

     return function updateCache( icon ) {
       iconCache[id] = isIcon(icon) ? icon : new Icon(icon, config[id]);

       return iconCache[id].clone();
     };
   }

   /**
    * Lookup the configuration in the registry, if !registered throw an error
    * otherwise load the icon [on-demand] using the registered URL.
    *
    */
   function loadByID(id) {
    var iconConfig = config[id];
     return loadByURL(iconConfig.url).then(function(icon) {
       return new Icon(icon, iconConfig);
     });
   }

   /**
    *    Loads the file as XML and uses querySelector( <id> ) to find
    *    the desired node...
    */
   function loadFromIconSet(id) {
     var setName = id.substring(0, id.lastIndexOf(':')) || '$default';
     var iconSetConfig = config[setName];

     return !iconSetConfig ? announceIdNotFound(id) : loadByURL(iconSetConfig.url).then(extractFromSet);

     function extractFromSet(set) {
       var iconName = id.slice(id.lastIndexOf(':') + 1);
       var icon = set.querySelector('#' + iconName);
       return !icon ? announceIdNotFound(id) : new Icon(icon, iconSetConfig);
     }

     function announceIdNotFound(id) {
       var msg = 'icon ' + id + ' not found';
      $log.warn(msg);

       return $q.reject(msg || id);
     }
   }

   /**
    * Load the icon by URL (may use the $templateCache).
    * Extract the data for later conversion to Icon
    */
   function loadByURL(url) {
     return $http
       .get(url, { cache: $templateCache })
       .then(function(response) {
         return angular.element('<div>').append(response.data).find('svg')[0];
       }).catch(announceNotFound);
   }

   /**
    * Catch HTTP or generic errors not related to incorrect icon IDs.
    */
   function announceNotFound(err) {
     var msg = angular.isString(err) ? err : (err.message || err.data || err.statusText);
     $log.warn(msg);

     return $q.reject(msg);
   }

   /**
    * Check target signature to see if it is an Icon instance.
    */
   function isIcon(target) {
     return angular.isDefined(target.element) && angular.isDefined(target.config);
   }

   /**
    *  Define the Icon class
    */
   function Icon(el, config) {
     if (el && el.tagName != 'svg') {
       el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el)[0];
     }

     // Inject the namespace if not available...
     if ( !el.getAttribute('xmlns') ) {
       el.setAttribute('xmlns', "http://www.w3.org/2000/svg");
     }

     this.element = el;
     this.config = config;
     this.prepare();
   }

   /**
    *  Prepare the DOM element that will be cached in the
    *  loaded iconCache store.
    */
   function prepareAndStyle() {
     var viewBoxSize = this.config ? this.config.viewBoxSize : config.defaultViewBoxSize;
         angular.forEach({
           'fit'   : '',
           'height': '100%',
           'width' : '100%',
           'preserveAspectRatio': 'xMidYMid meet',
           'viewBox' : this.element.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize)
         }, function(val, attr) {
           this.element.setAttribute(attr, val);
         }, this);

         angular.forEach({
           'pointer-events' : 'none',
           'display' : 'block'
         }, function(val, style) {
           this.element.style[style] = val;
         }, this);
   }

   /**
    * Clone the Icon DOM element.
    */
   function cloneSVG(){
     return this.element.cloneNode(true);
   }

 }
 MdIconService.$inject = ["config", "$http", "$q", "$log", "$templateCache"];

})();
(function(){
"use strict";



angular
    .module('material.components.menu')
    .controller('mdMenuCtrl', MenuController);

/**
 * @ngInject
 */
function MenuController($mdMenu, $attrs, $element, $scope, $mdUtil, $timeout) {

  var menuContainer;
  var self = this;
  var triggerElement;

  this.nestLevel = parseInt($attrs.mdNestLevel, 10) || 0;

  /**
   * Called by our linking fn to provide access to the menu-content
   * element removed during link
   */
  this.init = function init(setMenuContainer, opts) {
    opts = opts || {};
    menuContainer = setMenuContainer;
    // Default element for ARIA attributes has the ngClick or ngMouseenter expression
    triggerElement = $element[0].querySelector('[ng-click],[ng-mouseenter]');

    this.isInMenuBar = opts.isInMenuBar;
    this.nestedMenus = $mdUtil.nodesToArray(menuContainer[0].querySelectorAll('.md-nested-menu'));
    this.enableHoverListener();

    menuContainer.on('$mdInterimElementRemove', function() {
      self.isOpen = false;
    });
  };

  this.enableHoverListener = function() {
    $scope.$on('$mdMenuOpen', function(event, el) {
      if (menuContainer[0].contains(el[0])) {
        self.currentlyOpenMenu = el.controller('mdMenu');
        self.isAlreadyOpening = false;
        self.currentlyOpenMenu.registerContainerProxy(self.triggerContainerProxy.bind(self));
      }
    });
    $scope.$on('$mdMenuClose', function(event, el) {
      if (menuContainer[0].contains(el[0])) {
        self.currentlyOpenMenu = undefined;
      }
    });

    var menuItems = angular.element($mdUtil.nodesToArray(menuContainer[0].querySelectorAll('md-menu-item')));

    var openMenuTimeout;
    menuItems.on('mouseenter', function(event) {
      if (self.isAlreadyOpening) return;
      var nestedMenu = (
        event.target.querySelector('md-menu')
          || $mdUtil.getClosest(event.target, 'MD-MENU')
      );
      openMenuTimeout = $timeout(function() {
        if (nestedMenu) {
          nestedMenu = angular.element(nestedMenu).controller('mdMenu');
        }

        if (self.currentlyOpenMenu && self.currentlyOpenMenu != nestedMenu) {
          var closeTo = self.nestLevel + 1;
          self.currentlyOpenMenu.close(true, { closeTo: closeTo });
        } else if (nestedMenu && !nestedMenu.isOpen && nestedMenu.open) {
          self.isAlreadyOpening = true;
          nestedMenu.open();
        }
      }, nestedMenu ? 100 : 250);
      var focusableTarget = event.currentTarget.querySelector('button:not([disabled])');
      focusableTarget && focusableTarget.focus();
    });
    menuItems.on('mouseleave', function(event) {
      if (openMenuTimeout) {
        $timeout.cancel(openMenuTimeout);
        openMenuTimeout = undefined;
      }
    });
  };

  /**
   * Uses the $mdMenu interim element service to open the menu contents
   */
  this.open = function openMenu(ev) {
    ev && ev.stopPropagation();
    ev && ev.preventDefault();
    if (self.isOpen) return;
    self.isOpen = true;
    triggerElement = triggerElement || (ev ? ev.target : $element[0]);
    $scope.$emit('$mdMenuOpen', $element);
    $mdMenu.show({
      scope: $scope,
      mdMenuCtrl: self,
      nestLevel: self.nestLevel,
      element: menuContainer,
      target: triggerElement,
      preserveElement: self.isInMenuBar || self.nestedMenus.length > 0,
      parent: self.isInMenuBar ? $element : 'body'
    });
  };

  // Expose a open function to the child scope for html to use
  $scope.$mdOpenMenu = this.open;

  $scope.$watch(function() { return self.isOpen; }, function(isOpen) {
    if (isOpen) {
      triggerElement.setAttribute('aria-expanded', 'true');
      $element[0].classList.add('md-open');
      angular.forEach(self.nestedMenus, function(el) {
        el.classList.remove('md-open');
      });
    } else {
      triggerElement && triggerElement.setAttribute('aria-expanded', 'false');
      $element[0].classList.remove('md-open');
    }
    $scope.$mdMenuIsOpen = self.isOpen;
  });

  this.focusMenuContainer = function focusMenuContainer() {
    var focusTarget = menuContainer[0].querySelector('[md-menu-focus-target]');
    if (!focusTarget) focusTarget = menuContainer[0].querySelector('.md-button');
    focusTarget.focus();
  };

  this.registerContainerProxy = function registerContainerProxy(handler) {
    this.containerProxy = handler;
  };

  this.triggerContainerProxy = function triggerContainerProxy(ev) {
    this.containerProxy && this.containerProxy(ev);
  };

  this.destroy = function() {
    return $mdMenu.destroy();
  };

  // Use the $mdMenu interim element service to close the menu contents
  this.close = function closeMenu(skipFocus, closeOpts) {
    if ( !self.isOpen ) return;
    self.isOpen = false;

    var eventDetails = angular.extend({}, closeOpts, { skipFocus: skipFocus });
    $scope.$emit('$mdMenuClose', $element, eventDetails);
    $mdMenu.hide(null, closeOpts);

    if (!skipFocus) {
      var el = self.restoreFocusTo || $element.find('button')[0];
      if (el instanceof angular.element) el = el[0];
      if (el) el.focus();
    }
  };

  /**
   * Build a nice object out of our string attribute which specifies the
   * target mode for left and top positioning
   */
  this.positionMode = function positionMode() {
    var attachment = ($attrs.mdPositionMode || 'target').split(' ');

    // If attachment is a single item, duplicate it for our second value.
    // ie. 'target' -> 'target target'
    if (attachment.length == 1) {
      attachment.push(attachment[0]);
    }

    return {
      left: attachment[0],
      top: attachment[1]
    };
  }

  /**
   * Build a nice object out of our string attribute which specifies
   * the offset of top and left in pixels.
   */
  this.offsets = function offsets() {
    var position = ($attrs.mdOffset || '0 0').split(' ').map(parseFloat);
    if (position.length == 2) {
      return {
        left: position[0],
        top: position[1]
      };
    } else if (position.length == 1) {
      return {
        top: position[0],
        left: position[0]
      };
    } else {
      throw Error('Invalid offsets specified. Please follow format <x, y> or <n>');
    }
  }
}
MenuController.$inject = ["$mdMenu", "$attrs", "$element", "$scope", "$mdUtil", "$timeout"];

})();
(function(){
"use strict";

/**
 * @ngdoc directive
 * @name mdMenu
 * @module material.components.menu
 * @restrict E
 * @description
 *
 * Menus are elements that open when clicked. They are useful for displaying
 * additional options within the context of an action.
 *
 * Every `md-menu` must specify exactly two child elements. The first element is what is
 * left in the DOM and is used to open the menu. This element is called the trigger element.
 * The trigger element's scope has access to `$mdOpenMenu($event)`
 * which it may call to open the menu. By passing $event as argument, the
 * corresponding event is stopped from propagating up the DOM-tree.
 *
 * The second element is the `md-menu-content` element which represents the
 * contents of the menu when it is open. Typically this will contain `md-menu-item`s,
 * but you can do custom content as well.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <!-- Trigger element is a md-button with an icon -->
 *  <md-button ng-click="$mdOpenMenu($event)" class="md-icon-button" aria-label="Open sample menu">
 *    <md-icon md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item><md-button ng-click="doSomething()">Do Something</md-button></md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>

 * ## Sizing Menus
 *
 * The width of the menu when it is open may be specified by specifying a `width`
 * attribute on the `md-menu-content` element.
 * See the [Material Design Spec](http://www.google.com/design/spec/components/menus.html#menus-specs)
 * for more information.
 *
 *
 * ## Aligning Menus
 *
 * When a menu opens, it is important that the content aligns with the trigger element.
 * Failure to align menus can result in jarring experiences for users as content
 * suddenly shifts. To help with this, `md-menu` provides serveral APIs to help
 * with alignment.
 *
 * ### Target Mode
 *
 * By default, `md-menu` will attempt to align the `md-menu-content` by aligning
 * designated child elements in both the trigger and the menu content.
 *
 * To specify the alignment element in the `trigger` you can use the `md-menu-origin`
 * attribute on a child element. If no `md-menu-origin` is specified, the `md-menu`
 * will be used as the origin element.
 *
 * Similarly, the `md-menu-content` may specify a `md-menu-align-target` for a
 * `md-menu-item` to specify the node that it should try and align with.
 *
 * In this example code, we specify an icon to be our origin element, and an
 * icon in our menu content to be our alignment target. This ensures that both
 * icons are aligned when the menu opens.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdOpenMenu($event)" class="md-icon-button" aria-label="Open some menu">
 *    <md-icon md-menu-origin md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item>
 *      <md-button ng-click="doSomething()" aria-label="Do something">
 *        <md-icon md-menu-align-target md-svg-icon="call:phone"></md-icon>
 *        Do Something
 *      </md-button>
 *    </md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>
 *
 * Sometimes we want to specify alignment on the right side of an element, for example
 * if we have a menu on the right side a toolbar, we want to right align our menu content.
 *
 * We can specify the origin by using the `md-position-mode` attribute on both
 * the `x` and `y` axis. Right now only the `x-axis` has more than one option.
 * You may specify the default mode of `target target` or
 * `target-right target` to specify a right-oriented alignment target. See the
 * position section of the demos for more examples.
 *
 * ### Menu Offsets
 *
 * It is sometimes unavoidable to need to have a deeper level of control for
 * the positioning of a menu to ensure perfect alignment. `md-menu` provides
 * the `md-offset` attribute to allow pixel level specificty of adjusting the
 * exact positioning.
 *
 * This offset is provided in the format of `x y` or `n` where `n` will be used
 * in both the `x` and `y` axis.
 *
 * For example, to move a menu by `2px` from the top, we can use:
 * <hljs lang="html">
 * <md-menu md-offset="2 0">
 *   <!-- menu-content -->
 * </md-menu>
 * </hljs>
 *
 * @usage
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdOpenMenu($event)" class="md-icon-button">
 *    <md-icon md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item><md-button ng-click="doSomething()">Do Something</md-button></md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>
 *
 * @param {string} md-position-mode The position mode in the form of
 *           `x`, `y`. Default value is `target`,`target`. Right now the `x` axis
 *           also suppports `target-right`.
 * @param {string} md-offset An offset to apply to the dropdown after positioning
 *           `x`, `y`. Default value is `0`,`0`.
 *
 */

angular
    .module('material.components.menu')
    .directive('mdMenu', MenuDirective);

/**
 * @ngInject
 */
function MenuDirective($mdUtil) {
  var INVALID_PREFIX = 'Invalid HTML for md-menu: ';
  return {
    restrict: 'E',
    require: ['mdMenu', '?^mdMenuBar'],
    controller: 'mdMenuCtrl', // empty function to be built by link
    scope: true,
    compile: compile
  };

  function compile(templateElement) {
    templateElement.addClass('md-menu');
    var triggerElement = templateElement.children()[0];
    if (!triggerElement.hasAttribute('ng-click')) {
      triggerElement = triggerElement.querySelector('[ng-click],[ng-mouseenter]') || triggerElement;
    }
    if (triggerElement && (
      triggerElement.nodeName == 'MD-BUTTON' ||
      triggerElement.nodeName == 'BUTTON'
    ) && !triggerElement.hasAttribute('type')) {
      triggerElement.setAttribute('type', 'button');
    }

    if (templateElement.children().length != 2) {
      throw Error(INVALID_PREFIX + 'Expected two children elements.');
    }

    // Default element for ARIA attributes has the ngClick or ngMouseenter expression
    triggerElement && triggerElement.setAttribute('aria-haspopup', 'true');

    var nestedMenus = templateElement[0].querySelectorAll('md-menu');
    var nestingDepth = parseInt(templateElement[0].getAttribute('md-nest-level'), 10) || 0;
    if (nestedMenus) {
      angular.forEach($mdUtil.nodesToArray(nestedMenus), function(menuEl) {
        if (!menuEl.hasAttribute('md-position-mode')) {
          menuEl.setAttribute('md-position-mode', 'cascade');
        }
        menuEl.classList.add('md-nested-menu');
        menuEl.setAttribute('md-nest-level', nestingDepth + 1);
        menuEl.setAttribute('role', 'menu');
      });
    }
    return link;
  }

  function link(scope, element, attrs, ctrls) {
    var mdMenuCtrl = ctrls[0];
    var isInMenuBar = ctrls[1] != undefined;
    // Move everything into a md-menu-container and pass it to the controller
    var menuContainer = angular.element(
      '<div class="md-open-menu-container md-whiteframe-z2"></div>'
    );
    var menuContents = element.children()[1];
    menuContainer.append(menuContents);
    if (isInMenuBar) {
      element.append(menuContainer);
      menuContainer[0].style.display = 'none';
    }
    mdMenuCtrl.init(menuContainer, { isInMenuBar: isInMenuBar });

    scope.$on('$destroy', function() {
      mdMenuCtrl
        .destroy()
        .finally(function(){
          menuContainer.remove();
        });
    });

  }
}
MenuDirective.$inject = ["$mdUtil"];

})();
(function(){
"use strict";

angular
  .module('material.components.menu')
  .provider('$mdMenu', MenuProvider);

/*
 * Interim element provider for the menu.
 * Handles behavior for a menu while it is open, including:
 *    - handling animating the menu opening/closing
 *    - handling key/mouse events on the menu element
 *    - handling enabling/disabling scroll while the menu is open
 *    - handling redrawing during resizes and orientation changes
 *
 */

function MenuProvider($$interimElementProvider) {
  var MENU_EDGE_MARGIN = 8;

  menuDefaultOptions.$inject = ["$mdUtil", "$mdTheming", "$mdConstant", "$document", "$window", "$q", "$$rAF", "$animateCss", "$animate"];
  return $$interimElementProvider('$mdMenu')
    .setDefaults({
      methods: ['target'],
      options: menuDefaultOptions
    });

  /* @ngInject */
  function menuDefaultOptions($mdUtil, $mdTheming, $mdConstant, $document, $window, $q, $$rAF, $animateCss, $animate) {
    var animator = $mdUtil.dom.animator;

    return {
      parent: 'body',
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: true,
      skipCompile: true,
      preserveScope: true,
      skipHide: true,
      themable: true
    };

    /**
     * Show modal backdrop element...
     * @returns {function(): void} A function that removes this backdrop
     */
    function showBackdrop(scope, element, options) {
      if (options.nestLevel) return angular.noop;

      // If we are not within a dialog...
      if (options.disableParentScroll && !$mdUtil.getClosest(options.target, 'MD-DIALOG')) {
        // !! DO this before creating the backdrop; since disableScrollAround()
        //    configures the scroll offset; which is used by mdBackDrop postLink()
        options.restoreScroll = $mdUtil.disableScrollAround(options.element, options.parent);
      } else {
        options.disableParentScroll = false;
      }

      if (options.hasBackdrop) {
        options.backdrop = $mdUtil.createBackdrop(scope, "md-menu-backdrop md-click-catcher");

        $animate.enter(options.backdrop, options.parent);
      }

      /**
       * Hide and destroys the backdrop created by showBackdrop()
       */
      return function hideBackdrop() {
        if (options.backdrop) options.backdrop.remove();
        if (options.disableParentScroll) options.restoreScroll();
      };
    }

    /**
     * Removing the menu element from the DOM and remove all associated evetn listeners
     * and backdrop
     */
    function onRemove(scope, element, opts) {
      opts.cleanupInteraction();
      opts.cleanupResizing();
      opts.hideBackdrop();

      // For navigation $destroy events, do a quick, non-animated removal,
      // but for normal closes (from clicks, etc) animate the removal

      return (opts.$destroy === true) ? detachAndClean() : animateRemoval().then( detachAndClean );

      /**
       * For normal closes, animate the removal.
       * For forced closes (like $destroy events), skip the animations
       */
      function animateRemoval() {
        return $animateCss(element, {addClass: 'md-leave'}).start();
      }

      /**
       * Detach the element
       */
      function detachAndClean() {
        element.removeClass('md-active');
        detachElement(element, opts);
        opts.alreadyOpen = false;
      }

    }

    /**
     * Inserts and configures the staged Menu element into the DOM, positioning it,
     * and wiring up various interaction events
     */
    function onShow(scope, element, opts) {
      sanitizeAndConfigure(opts);

      // Wire up theming on our menu element
      $mdTheming.inherit(opts.menuContentEl, opts.target);

      // Register various listeners to move menu on resize/orientation change
      opts.cleanupResizing = startRepositioningOnResize();
      opts.hideBackdrop = showBackdrop(scope, element, opts);

      // Return the promise for when our menu is done animating in
      return showMenu()
        .then(function(response) {
          opts.alreadyOpen = true;
          opts.cleanupInteraction = activateInteraction();
          return response;
        });

      /**
       * Place the menu into the DOM and call positioning related functions
       */
      function showMenu() {
        if (!opts.preserveElement) {
          opts.parent.append(element);
        } else {
          element[0].style.display = '';
        }

        return $q(function(resolve) {
          var position = calculateMenuPosition(element, opts);

          element.removeClass('md-leave');

          // Animate the menu scaling, and opacity [from its position origin (default == top-left)]
          // to normal scale.
          $animateCss(element, {
            addClass: 'md-active',
            from: animator.toCss(position),
            to: animator.toCss({transform: ''})
          })
          .start()
          .then(resolve);

        });
      }

      /**
       * Check for valid opts and set some sane defaults
       */
      function sanitizeAndConfigure() {
        if (!opts.target) {
          throw Error(
            '$mdMenu.show() expected a target to animate from in options.target'
          );
        }
        angular.extend(opts, {
          alreadyOpen: false,
          isRemoved: false,
          target: angular.element(opts.target), //make sure it's not a naked dom node
          parent: angular.element(opts.parent),
          menuContentEl: angular.element(element[0].querySelector('md-menu-content'))
        });
      }

      /**
       * Configure various resize listeners for screen changes
       */
      function startRepositioningOnResize() {

        var repositionMenu = (function(target, options) {
          return $$rAF.throttle(function() {
            if (opts.isRemoved) return;
            var position = calculateMenuPosition(target, options);

            target.css(animator.toCss(position));
          });
        })(element, opts);

        $window.addEventListener('resize', repositionMenu);
        $window.addEventListener('orientationchange', repositionMenu);

        return function stopRepositioningOnResize() {

          // Disable resizing handlers
          $window.removeEventListener('resize', repositionMenu);
          $window.removeEventListener('orientationchange', repositionMenu);

        }
      }

      /**
       * Activate interaction on the menu. Wire up keyboard listerns for
       * clicks, keypresses, backdrop closing, etc.
       */
      function activateInteraction() {
        element.addClass('md-clickable');

        // close on backdrop click
        if (opts.backdrop) opts.backdrop.on('click', onBackdropClick);

        // Wire up keyboard listeners.
        // - Close on escape,
        // - focus next item on down arrow,
        // - focus prev item on up
        opts.menuContentEl.on('keydown', onMenuKeyDown);
        opts.menuContentEl[0].addEventListener('click', captureClickListener, true);

        // kick off initial focus in the menu on the first element
        var focusTarget = opts.menuContentEl[0].querySelector('[md-menu-focus-target]');
        if ( !focusTarget ) {
          var firstChild = opts.menuContentEl[0].firstElementChild;

          focusTarget = firstChild && (firstChild.querySelector('.md-button:not([disabled])') || firstChild.firstElementChild);
        }

        focusTarget && focusTarget.focus();

        return function cleanupInteraction() {
          element.removeClass('md-clickable');
          if (opts.backdrop) opts.backdrop.off('click', onBackdropClick);
          opts.menuContentEl.off('keydown', onMenuKeyDown);
          opts.menuContentEl[0].removeEventListener('click', captureClickListener, true);
        };

        // ************************************
        // internal functions
        // ************************************

        function onMenuKeyDown(ev) {
          var handled;
          switch (ev.keyCode) {
            case $mdConstant.KEY_CODE.ESCAPE:
              opts.mdMenuCtrl.close(false, { closeAll: true });
              handled = true;
              break;
            case $mdConstant.KEY_CODE.UP_ARROW:
              if (!focusMenuItem(ev, opts.menuContentEl, opts, -1)) {
                opts.mdMenuCtrl.triggerContainerProxy(ev);
              }
              handled = true;
              break;
            case $mdConstant.KEY_CODE.DOWN_ARROW:
              if (!focusMenuItem(ev, opts.menuContentEl, opts, 1)) {
                opts.mdMenuCtrl.triggerContainerProxy(ev);
              }
              handled = true;
              break;
            case $mdConstant.KEY_CODE.LEFT_ARROW:
              if (opts.nestLevel) {
                opts.mdMenuCtrl.close();
              } else {
                opts.mdMenuCtrl.triggerContainerProxy(ev);
              }
              handled = true;
              break;
            case $mdConstant.KEY_CODE.RIGHT_ARROW:
              var parentMenu = $mdUtil.getClosest(ev.target, 'MD-MENU');
              if (parentMenu && parentMenu != opts.parent[0]) {
                ev.target.click();
              } else {
                opts.mdMenuCtrl.triggerContainerProxy(ev);
              }
              handled = true;
              break;
          }
          if (handled) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
          }
        }

        function onBackdropClick(e) {
          e.preventDefault();
          e.stopPropagation();
          scope.$apply(function() {
            opts.mdMenuCtrl.close(true, { closeAll: true });
          });
        }

        // Close menu on menu item click, if said menu-item is not disabled
        function captureClickListener(e) {
          var target = e.target;
          // Traverse up the event until we get to the menuContentEl to see if
          // there is an ng-click and that the ng-click is not disabled
          do {
            if (target == opts.menuContentEl[0]) return;
            if (hasAnyAttribute(target, ['ng-click', 'ng-href', 'ui-sref']) ||
                target.nodeName == 'BUTTON' || target.nodeName == 'MD-BUTTON') {
              var closestMenu = $mdUtil.getClosest(target, 'MD-MENU');
              if (!target.hasAttribute('disabled') && (!closestMenu || closestMenu == opts.parent[0])) {
                close();
              }
              break;
            }
          } while (target = target.parentNode)

          function close() {
            scope.$apply(function() {
              opts.mdMenuCtrl.close(true, { closeAll: true });
            });
          }

          function hasAnyAttribute(target, attrs) {
            if (!target) return false;
            for (var i = 0, attr; attr = attrs[i]; ++i) {
              var altForms = [attr, 'data-' + attr, 'x-' + attr];
              for (var j = 0, rawAttr; rawAttr = altForms[j]; ++j) {
                if (target.hasAttribute(rawAttr)) {
                  return true;
                }
              }
            }
            return false;
          }
        }

        opts.menuContentEl[0].addEventListener('click', captureClickListener, true);

        return function cleanupInteraction() {
          element.removeClass('md-clickable');
          opts.menuContentEl.off('keydown');
          opts.menuContentEl[0].removeEventListener('click', captureClickListener, true);
        };
      }
    }

    /**
     * Takes a keypress event and focuses the next/previous menu
     * item from the emitting element
     * @param {event} e - The origin keypress event
     * @param {angular.element} menuEl - The menu element
     * @param {object} opts - The interim element options for the mdMenu
     * @param {number} direction - The direction to move in (+1 = next, -1 = prev)
     */
    function focusMenuItem(e, menuEl, opts, direction) {
      var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM');

      var items = $mdUtil.nodesToArray(menuEl[0].children);
      var currentIndex = items.indexOf(currentItem);

      // Traverse through our elements in the specified direction (+/-1) and try to
      // focus them until we find one that accepts focus
      var didFocus;
      for (var i = currentIndex + direction; i >= 0 && i < items.length; i = i + direction) {
        var focusTarget = items[i].querySelector('.md-button');
        didFocus = attemptFocus(focusTarget);
        if (didFocus) {
          break;
        }
      }
      return didFocus;
    }

    /**
     * Attempts to focus an element. Checks whether that element is the currently
     * focused element after attempting.
     * @param {HTMLElement} el - the element to attempt focus on
     * @returns {bool} - whether the element was successfully focused
     */
    function attemptFocus(el) {
      if (el && el.getAttribute('tabindex') != -1) {
        el.focus();
        return ($document[0].activeElement == el);
      }
    }

    /**
     * Use browser to remove this element without triggering a $destroy event
     */
    function detachElement(element, opts) {
      if (!opts.preserveElement) {
        if (toNode(element).parentNode === toNode(opts.parent)) {
          toNode(opts.parent).removeChild(toNode(element));
        }
      } else {
        toNode(element).style.display = 'none';
      }
    }

    /**
     * Computes menu position and sets the style on the menu container
     * @param {HTMLElement} el - the menu container element
     * @param {object} opts - the interim element options object
     */
    function calculateMenuPosition(el, opts) {

      var containerNode = el[0],
        openMenuNode = el[0].firstElementChild,
        openMenuNodeRect = openMenuNode.getBoundingClientRect(),
        boundryNode = $document[0].body,
        boundryNodeRect = boundryNode.getBoundingClientRect();

      var menuStyle = $window.getComputedStyle(openMenuNode);

      var originNode = opts.target[0].querySelector('[md-menu-origin]') || opts.target[0],
        originNodeRect = originNode.getBoundingClientRect();

      var bounds = {
        left: boundryNodeRect.left + MENU_EDGE_MARGIN,
        top: Math.max(boundryNodeRect.top, 0) + MENU_EDGE_MARGIN,
        bottom: Math.max(boundryNodeRect.bottom, Math.max(boundryNodeRect.top, 0) + boundryNodeRect.height) - MENU_EDGE_MARGIN,
        right: boundryNodeRect.right - MENU_EDGE_MARGIN
      };

      var alignTarget, alignTargetRect = { top:0, left : 0, right:0, bottom:0 }, existingOffsets  = { top:0, left : 0, right:0, bottom:0  };
      var positionMode = opts.mdMenuCtrl.positionMode();

      if (positionMode.top == 'target' || positionMode.left == 'target' || positionMode.left == 'target-right') {
        alignTarget = firstVisibleChild();
        if ( alignTarget ) {
          // TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
          alignTarget = alignTarget.firstElementChild || alignTarget;
          alignTarget = alignTarget.querySelector('[md-menu-align-target]') || alignTarget;
          alignTargetRect = alignTarget.getBoundingClientRect();

          existingOffsets = {
            top: parseFloat(containerNode.style.top || 0),
            left: parseFloat(containerNode.style.left || 0)
          };
        }
      }

      var position = {};
      var transformOrigin = 'top ';

      switch (positionMode.top) {
        case 'target':
          position.top = existingOffsets.top + originNodeRect.top - alignTargetRect.top;
          break;
        case 'cascade':
          position.top = originNodeRect.top - parseFloat(menuStyle.paddingTop) - originNode.style.top;
          break;
        case 'bottom':
          position.top = originNodeRect.top + originNodeRect.height;
          break;
        default:
          throw new Error('Invalid target mode "' + positionMode.top + '" specified for md-menu on Y axis.');
      }

      switch (positionMode.left) {
        case 'target':
          position.left = existingOffsets.left + originNodeRect.left - alignTargetRect.left;
          transformOrigin += 'left';
          break;
        case 'target-right':
          position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
          transformOrigin += 'right';
          break;
        case 'cascade':
          var willFitRight = (originNodeRect.right + openMenuNodeRect.width) < bounds.right;
          position.left = willFitRight ? originNodeRect.right - originNode.style.left : originNodeRect.left - originNode.style.left - openMenuNodeRect.width;
          transformOrigin += willFitRight ? 'left' : 'right';
          break;
        case 'left':
          position.left = originNodeRect.left;
          transformOrigin += 'left';
          break;
        default:
          throw new Error('Invalid target mode "' + positionMode.left + '" specified for md-menu on X axis.');
      }

      var offsets = opts.mdMenuCtrl.offsets();
      position.top += offsets.top;
      position.left += offsets.left;

      clamp(position);

      var scaleX = Math.round(100 * Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0)) / 100;
      var scaleY = Math.round(100 * Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0)) / 100;

      return {
        top: Math.round(position.top),
        left: Math.round(position.left),
        // Animate a scale out if we aren't just repositioning
        transform: !opts.alreadyOpen ? $mdUtil.supplant('scale({0},{1})', [scaleX, scaleY]) : undefined,
        transformOrigin: transformOrigin
      };

      /**
       * Clamps the repositioning of the menu within the confines of
       * bounding element (often the screen/body)
       */
      function clamp(pos) {
        pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
        pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
      }

      /**
       * Gets the first visible child in the openMenuNode
       * Necessary incase menu nodes are being dynamically hidden
       */
      function firstVisibleChild() {
        for (var i = 0; i < openMenuNode.children.length; ++i) {
          if ($window.getComputedStyle(openMenuNode.children[i]).display != 'none') {
            return openMenuNode.children[i];
          }
        }
      }
    }
  }
  function toNode(el) {
    if (el instanceof angular.element) {
      el = el[0];
    }
    return el;
  }
}
MenuProvider.$inject = ["$$interimElementProvider"];

})();
(function(){
"use strict";


angular
  .module('material.components.menuBar')
  .controller('MenuBarController', MenuBarController);

var BOUND_MENU_METHODS = ['handleKeyDown', 'handleMenuHover', 'scheduleOpenHoveredMenu', 'cancelScheduledOpen'];

/**
 * @ngInject
 */
function MenuBarController($scope, $element, $attrs, $mdConstant, $document, $mdUtil, $timeout) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$mdConstant = $mdConstant;
  this.$mdUtil = $mdUtil;
  this.$document = $document;
  this.$scope = $scope;
  this.$timeout = $timeout;

  var self = this;
  angular.forEach(BOUND_MENU_METHODS, function(methodName) {
    self[methodName] = angular.bind(self, self[methodName]);
  });
}
MenuBarController.$inject = ["$scope", "$element", "$attrs", "$mdConstant", "$document", "$mdUtil", "$timeout"];

MenuBarController.prototype.init = function() {
  var $element = this.$element;
  var $mdUtil = this.$mdUtil;
  var $scope = this.$scope;

  var self = this;
  $element.on('keydown', this.handleKeyDown);
  this.parentToolbar = $mdUtil.getClosest($element, 'MD-TOOLBAR');

  $scope.$on('$mdMenuOpen', function(event, el) {
    if (self.getMenus().indexOf(el[0]) != -1) {
      $element[0].classList.add('md-open');
      el[0].classList.add('md-open');
      self.currentlyOpenMenu = el.controller('mdMenu');
      self.currentlyOpenMenu.registerContainerProxy(self.handleKeyDown);
      self.enableOpenOnHover();
    }
  });

  $scope.$on('$mdMenuClose', function(event, el, opts) {
    var rootMenus = self.getMenus();
    if (rootMenus.indexOf(el[0]) != -1) {
      $element[0].classList.remove('md-open');
      el[0].classList.remove('md-open');
    }

    if (opts.closeAll) {
      if ($element[0].contains(el[0])) {
        var parentMenu = el[0];
        while (parentMenu && rootMenus.indexOf(parentMenu) == -1) {
          parentMenu = $mdUtil.getClosest(parentMenu, 'MD-MENU', true);
        }
        if (parentMenu) {
          if (!opts.skipFocus) parentMenu.querySelector('button:not([disabled])').focus();
          self.currentlyOpenMenu = undefined;
          self.disableOpenOnHover();
          self.setKeyboardMode(true);
        }
      }
    }
  });

  angular
    .element(this.getMenus())
    .on('mouseenter', this.handleMenuHover);

  this.setKeyboardMode(true);
};

MenuBarController.prototype.setKeyboardMode = function(enabled) {
  if (enabled) this.$element[0].classList.add('md-keyboard-mode');
  else this.$element[0].classList.remove('md-keyboard-mode');
};

MenuBarController.prototype.enableOpenOnHover = function() {
  if (this.openOnHoverEnabled) return;
  this.openOnHoverEnabled = true;

  var parentToolbar;
  if (parentToolbar = this.parentToolbar) {
    parentToolbar.dataset.mdRestoreStyle = parentToolbar.getAttribute('style');
    parentToolbar.style.position = 'relative';
    parentToolbar.style.zIndex = 100;
  }
};

MenuBarController.prototype.handleMenuHover = function(e) {
  this.setKeyboardMode(false);
  if (this.openOnHoverEnabled) {
    this.scheduleOpenHoveredMenu(e);
  }
};


MenuBarController.prototype.disableOpenOnHover = function() {
  if (!this.openOnHoverEnabled) return;
  this.openOnHoverEnabled = false;
  var parentToolbar;
  if (parentToolbar = this.parentToolbar) {
    parentToolbar.setAttribute('style', parentToolbar.dataset.mdRestoreStyle || '');
  }
};

MenuBarController.prototype.scheduleOpenHoveredMenu = function(e) {
  var menuEl = angular.element(e.currentTarget);
  var menuCtrl = menuEl.controller('mdMenu');
  this.setKeyboardMode(false);
  this.scheduleOpenMenu(menuCtrl);
};

MenuBarController.prototype.scheduleOpenMenu = function(menuCtrl) {
  var self = this;
  var $timeout = this.$timeout;
  if (menuCtrl != self.currentlyOpenMenu) {
    $timeout.cancel(self.pendingMenuOpen);
    self.pendingMenuOpen = $timeout(function() {
      self.pendingMenuOpen = undefined;
      if (self.currentlyOpenMenu) {
        self.currentlyOpenMenu.close(true, { closeAll: true });
      }
      menuCtrl.open();
    }, 200, false);
  }
};

MenuBarController.prototype.handleKeyDown = function(e) {
  var keyCodes = this.$mdConstant.KEY_CODE;
  var currentMenu = this.currentlyOpenMenu;
  var wasOpen = currentMenu && currentMenu.isOpen;
  this.setKeyboardMode(true);
  var handled, newMenu, newMenuCtrl;
  switch (e.keyCode) {
    case keyCodes.DOWN_ARROW:
      if (currentMenu) {
        currentMenu.focusMenuContainer();
      } else {
        this.openFocusedMenu();
      }
      handled = true;
      break;
    case keyCodes.UP_ARROW:
      currentMenu && currentMenu.close();
      handled = true;
      break;
    case keyCodes.LEFT_ARROW:
      newMenu = this.focusMenu(-1);
      if (wasOpen) {
        newMenuCtrl = angular.element(newMenu).controller('mdMenu');
        this.scheduleOpenMenu(newMenuCtrl);
      }
      handled = true;
      break;
    case keyCodes.RIGHT_ARROW:
      newMenu = this.focusMenu(+1);
      if (wasOpen) {
        newMenuCtrl = angular.element(newMenu).controller('mdMenu');
        this.scheduleOpenMenu(newMenuCtrl);
      }
      handled = true;
      break;
  }
  if (handled) {
    e && e.preventDefault && e.preventDefault();
    e && e.stopImmediatePropagation && e.stopImmediatePropagation();
  }
};

MenuBarController.prototype.focusMenu = function(direction) {
  var menus = this.getMenus();
  var focusedIndex = this.getFocusedMenuIndex();

  if (focusedIndex == -1) { focusedIndex = this.getOpenMenuIndex(); }

  var changed = false;

  if (focusedIndex == -1) { focusedIndex = 0; }
  else if (
    direction < 0 && focusedIndex > 0 ||
    direction > 0 && focusedIndex < menus.length - direction
  ) {
    focusedIndex += direction;
    changed = true;
  }
  if (changed) {
    menus[focusedIndex].querySelector('button').focus();
    return menus[focusedIndex];
  }
};

MenuBarController.prototype.openFocusedMenu = function() {
  var menu = this.getFocusedMenu();
  menu && angular.element(menu).controller('mdMenu').open();
};

MenuBarController.prototype.getMenus = function() {
  var $element = this.$element;
  return this.$mdUtil.nodesToArray($element[0].children)
    .filter(function(el) { return el.nodeName == 'MD-MENU'; });
};

MenuBarController.prototype.getFocusedMenu = function() {
  return this.getMenus()[this.getFocusedMenuIndex()];
};

MenuBarController.prototype.getFocusedMenuIndex = function() {
  var $mdUtil = this.$mdUtil;
  var focusedEl = $mdUtil.getClosest(
    this.$document[0].activeElement,
    'MD-MENU'
  );
  if (!focusedEl) return -1;

  var focusedIndex = this.getMenus().indexOf(focusedEl);
  return focusedIndex;

};

MenuBarController.prototype.getOpenMenuIndex = function() {
  var menus = this.getMenus();
  for (var i = 0; i < menus.length; ++i) {
    if (menus[i].classList.contains('md-open')) return i;
  }
  return -1;
};









})();
(function(){
"use strict";

/**
 * @ngdoc directive
 * @name mdMenuBar
 * @module material.components.menu-bar
 * @restrict E
 * @description
 *
 * Menu bars are containers that hold multiple menus. They change the behavior and appearence
 * of the `md-menu` directive to behave similar to an operating system provided menu.
 *
 * @usage
 * <hljs lang="html">
 * <md-menu-bar>
 *   <md-menu>
 *     <button ng-click="$mdOpenMenu()">
 *       File
 *     </button>
 *     <md-menu-content>
 *       <md-menu-item>
 *         <md-button ng-click="ctrl.sampleAction('share', $event)">
 *           Share...
 *         </md-button>
 *       </md-menu-item>
 *       <md-menu-divider></md-menu-divider>
 *       <md-menu-item>
 *       <md-menu-item>
 *         <md-menu>
 *           <md-button ng-click="$mdOpenMenu()">New</md-button>
 *           <md-menu-content>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Document', $event)">Document</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Spreadsheet', $event)">Spreadsheet</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Presentation', $event)">Presentation</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Form', $event)">Form</md-button></md-menu-item>
 *             <md-menu-item><md-button ng-click="ctrl.sampleAction('New Drawing', $event)">Drawing</md-button></md-menu-item>
 *           </md-menu-content>
 *         </md-menu>
 *       </md-menu-item>
 *     </md-menu-content>
 *   </md-menu>
 * </md-menu-bar>
 * </hljs>
 *
 * ## Menu Bar Controls
 *
 * You may place `md-menu-items` that function as controls within menu bars.
 * There are two modes that are exposed via the `type` attribute of the `md-menu-item`.
 * `type="checkbox"` will function as a boolean control for the `ng-model` attribute of the
 * `md-menu-item`. `type="radio"` will function like a radio button, setting the `ngModel`
 * to the `string` value of the `value` attribute. If you need non-string values, you can use
 * `ng-value` to provide an expression (this is similar to how angular's native `input[type=radio]` works.
 *
 * <hljs lang="html">
 * <md-menu-bar>
 *  <md-menu>
 *    <button ng-click="$mdOpenMenu()">
 *      Sample Menu
 *    </button>
 *    <md-menu-content>
 *      <md-menu-item type="checkbox" ng-model="settings.allowChanges">Allow changes</md-menu-item>
 *      <md-menu-divider></md-menu-divider>
 *      <md-menu-item type="radio" ng-model="settings.mode" ng-value="1">Mode 1</md-menu-item>
 *      <md-menu-item type="radio" ng-model="settings.mode" ng-value="1">Mode 2</md-menu-item>
 *      <md-menu-item type="radio" ng-model="settings.mode" ng-value="1">Mode 3</md-menu-item>
 *    </md-menu-content>
 *  </md-menu>
 * </md-menu-bar>
 * </hljs>
 *
 *
 * ### Nesting Menus
 *
 * Menus may be nested within menu bars. This is commonly called cascading menus.
 * To nest a menu place the nested menu inside the content of the `md-menu-item`.
 * <hljs lang="html">
 * <md-menu-item>
 *   <md-menu>
 *     <button ng-click="$mdOpenMenu()">New</md-button>
 *     <md-menu-content>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Document', $event)">Document</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Spreadsheet', $event)">Spreadsheet</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Presentation', $event)">Presentation</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Form', $event)">Form</md-button></md-menu-item>
 *       <md-menu-item><md-button ng-click="ctrl.sampleAction('New Drawing', $event)">Drawing</md-button></md-menu-item>
 *     </md-menu-content>
 *   </md-menu>
 * </md-menu-item>
 * </hljs>
 *
 */

angular
  .module('material.components.menuBar')
  .directive('mdMenuBar', MenuBarDirective);

/**
 *
 * @ngInjdect
 */
function MenuBarDirective($mdUtil, $mdTheming) {
  return {
    restrict: 'E',
    require: 'mdMenuBar',
    controller: 'MenuBarController',

    compile: function compile(templateEl, templateAttrs) {
      if (!templateAttrs.ariaRole) {
        templateEl[0].setAttribute('role', 'menubar');
      }
      angular.forEach(templateEl[0].children, function(menuEl) {
        if (menuEl.nodeName == 'MD-MENU') {
          if (!menuEl.hasAttribute('md-position-mode')) {
            menuEl.setAttribute('md-position-mode', 'left bottom');
          }
          menuEl.setAttribute('role', 'menu');
          var contentEls = $mdUtil.nodesToArray(menuEl.querySelectorAll('md-menu-content'));
          angular.forEach(contentEls, function(contentEl) {
            contentEl.classList.add('md-menu-bar-menu');
            contentEl.classList.add('md-dense');
            if (!contentEl.hasAttribute('width')) {
              contentEl.setAttribute('width', 5);
            }
          });
        }
      });

      return function postLink(scope, el, attrs, ctrl) {
        $mdTheming(scope, el);
        ctrl.init();
      };
    }
  };

}
MenuBarDirective.$inject = ["$mdUtil", "$mdTheming"];

})();
(function(){
"use strict";


angular
  .module('material.components.menuBar')
  .directive('mdMenuDivider', MenuDividerDirective);


function MenuDividerDirective() {
  return {
    restrict: 'E',
    compile: function(templateEl, templateAttrs) {
      if (!templateAttrs.role) {
        templateEl[0].setAttribute('role', 'separator');
      }
    }
  };
}

})();
(function(){
"use strict";


angular
  .module('material.components.menuBar')
  .controller('MenuItemController', MenuItemController);


/**
 * @ngInject
 */
function MenuItemController($scope, $element, $attrs) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$scope = $scope;
}
MenuItemController.$inject = ["$scope", "$element", "$attrs"];

MenuItemController.prototype.init = function(ngModel) {
  var $element = this.$element;
  var $attrs = this.$attrs;

  this.ngModel = ngModel;
  if ($attrs.type == 'checkbox' || $attrs.type == 'radio') {
    this.mode  = $attrs.type;
    this.iconEl = $element[0].children[0];
    this.buttonEl = $element[0].children[1];
    if (ngModel) this.initClickListeners();
  }
};

MenuItemController.prototype.initClickListeners = function() {
  var ngModel = this.ngModel;
  var $scope = this.$scope;
  var $attrs = this.$attrs;
  var $element = this.$element;
  var mode = this.mode;

  this.handleClick = angular.bind(this, this.handleClick);

  var icon = this.iconEl
  var button = angular.element(this.buttonEl);
  var handleClick = this.handleClick;

  $attrs.$observe('disabled', setDisabled);
  setDisabled($attrs.disabled);

  ngModel.$render = function render() {
    if (isSelected()) {
      icon.style.display = '';
      $element.attr('aria-checked', 'true');
    } else {
      icon.style.display = 'none';
      $element.attr('aria-checked', 'false');
    }
  };

  $scope.$$postDigest(ngModel.$render);

  function isSelected() {
    if (mode == 'radio') {
      var val = $attrs.ngValue ? $scope.$eval($attrs.ngValue) : $attrs.value;
      return ngModel.$modelValue == val;
    } else {
      return ngModel.$modelValue;
    }
  }

  function setDisabled(disabled) {
    if (disabled) {
      button.off('click', handleClick);
    } else {
      button.on('click', handleClick);
    }
  }
};

MenuItemController.prototype.handleClick = function(e) {
  var mode = this.mode;
  var ngModel = this.ngModel;
  var $attrs = this.$attrs;
  var newVal;
  if (mode == 'checkbox') {
    newVal = !ngModel.$modelValue;
  } else if (mode == 'radio') {
    newVal = $attrs.ngValue ? this.$scope.$eval($attrs.ngValue) : $attrs.value;
  }
  ngModel.$setViewValue(newVal);
  ngModel.$render();
};

})();
(function(){
"use strict";


angular
  .module('material.components.menuBar')
  .directive('mdMenuItem', MenuItemDirective);

 /**
  *
  * @ngInjdect
  */
function MenuItemDirective() {
  return {
    require: ['mdMenuItem', '?ngModel'],
    compile: function(templateEl, templateAttrs) {
      if (templateAttrs.type == 'checkbox' || templateAttrs.type == 'radio') {
        var text = templateEl[0].textContent;
        var buttonEl = angular.element('<md-button type="button"></md-button>');
            buttonEl.html(text);
            buttonEl.attr('tabindex', '0');

        templateEl.html('');
        templateEl.append(angular.element('<md-icon md-svg-icon="check"></md-icon>'));
        templateEl.append(buttonEl);
        templateEl[0].classList.add('md-indent');

        setDefault('role', (templateAttrs.type == 'checkbox') ? 'menuitemcheckbox' : 'menuitemradio');
        angular.forEach(['ng-disabled'], moveAttrToButton);

      } else {
        setDefault('role', 'menuitem');
      }


      return function(scope, el, attrs, ctrls) {
        var ctrl = ctrls[0];
        var ngModel = ctrls[1];
        ctrl.init(ngModel);
      };

      function setDefault(attr, val) {
        if (!templateEl[0].hasAttribute(attr)) {
          templateEl[0].setAttribute(attr, val);
        }
      }

      function moveAttrToButton(attr) {
        if (templateEl[0].hasAttribute(attr)) {
          var val = templateEl[0].getAttribute(attr);
          buttonEl[0].setAttribute(attr, val);
          templateEl[0].removeAttribute(attr);
        }
      }
    },
    controller: 'MenuItemController'
  };
}

})();
(function(){
"use strict";

/**
 * @ngdoc directive
 * @name mdTab
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @description
 * Use the `<md-tab>` a nested directive used within `<md-tabs>` to specify a tab with a **label** and optional *view content*.
 *
 * If the `label` attribute is not specified, then an optional `<md-tab-label>` tag can be used to specify more
 * complex tab header markup. If neither the **label** nor the **md-tab-label** are specified, then the nested
 * markup of the `<md-tab>` is used as the tab header markup.
 *
 * Please note that if you use `<md-tab-label>`, your content **MUST** be wrapped in the `<md-tab-body>` tag.  This
 * is to define a clear separation between the tab content and the tab label.
 *
 * If a tab **label** has been identified, then any **non-**`<md-tab-label>` markup
 * will be considered tab content and will be transcluded to the internal `<div class="md-tabs-content">` container.
 *
 * This container is used by the TabsController to show/hide the active tab's content view. This synchronization is
 * automatically managed by the internal TabsController whenever the tab selection changes. Selection changes can
 * be initiated via data binding changes, programmatic invocation, or user gestures.
 *
 * @param {string=} label Optional attribute to specify a simple string as the tab label
 * @param {boolean=} disabled If present, disabled tab selection.
 * @param {expression=} md-on-deselect Expression to be evaluated after the tab has been de-selected.
 * @param {expression=} md-on-select Expression to be evaluated after the tab has been selected.
 * @param {boolean=} md-active When true, sets the active tab.  Note: There can only be one active tab at a time.
 *
 *
 * @usage
 *
 * <hljs lang="html">
 * <md-tab label="" disabled="" md-on-select="" md-on-deselect="" >
 *   <h3>My Tab content</h3>
 * </md-tab>
 *
 * <md-tab >
 *   <md-tab-label>
 *     <h3>My Tab content</h3>
 *   </md-tab-label>
 *   <md-tab-body>
 *     <p>
 *       Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
 *       totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
 *       dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
 *       sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
 *     </p>
 *   </md-tab-body>
 * </md-tab>
 * </hljs>
 *
 */
angular
    .module('material.components.tabs')
    .directive('mdTab', MdTab);

function MdTab () {
  return {
    require:  '^?mdTabs',
    terminal: true,
    compile:  function (element, attr) {
      var label = element.find('md-tab-label'),
          body  = element.find('md-tab-body');

      if (label.length == 0) {
        label = angular.element('<md-tab-label></md-tab-label>');
        if (attr.label) label.text(attr.label);
        else label.append(element.contents());
        if (body.length == 0) {
          var contents = element.contents().detach();
          body         = angular.element('<md-tab-body></md-tab-body>');
          body.append(contents);
        }
      }

      element.append(label);
      if (body.html()) element.append(body);

      return postLink;
    },
    scope:    {
      active:   '=?mdActive',
      disabled: '=?ngDisabled',
      select:   '&?mdOnSelect',
      deselect: '&?mdOnDeselect'
    }
  };

  function postLink (scope, element, attr, ctrl) {
    if (!ctrl) return;
    var index = ctrl.getTabElementIndex(element),
        body  = element.find('md-tab-body').eq(0).remove(),
        label = element.find('md-tab-label').eq(0).remove(),
        data  = ctrl.insertTab({
          scope:    scope,
          parent:   scope.$parent,
          index:    index,
          element:  element,
          template: body.html(),
          label:    label.html()
        }, index);

    scope.select   = scope.select || angular.noop;
    scope.deselect = scope.deselect || angular.noop;

    scope.$watch('active', function (active) { if (active) ctrl.select(data.getIndex()); });
    scope.$watch('disabled', function () { ctrl.refreshIndex(); });
    scope.$watch(
        function () {
          return ctrl.getTabElementIndex(element);
        },
        function (newIndex) {
          data.index = newIndex;
          ctrl.updateTabOrder();
        }
    );
    scope.$on('$destroy', function () { ctrl.removeTab(data); });

  }
}

})();
(function(){
"use strict";

angular
    .module('material.components.tabs')
    .directive('mdTabItem', MdTabItem);

function MdTabItem () {
  return {
    require: '^?mdTabs',
    link:    function link (scope, element, attr, ctrl) {
      if (!ctrl) return;
      ctrl.attachRipple(scope, element);
    }
  };
}

})();
(function(){
"use strict";

angular
    .module('material.components.tabs')
    .directive('mdTabLabel', MdTabLabel);

function MdTabLabel () {
  return { terminal: true };
}


})();
(function(){
"use strict";

angular.module('material.components.tabs')
    .directive('mdTabScroll', MdTabScroll);

function MdTabScroll ($parse) {
  return {
    restrict: 'A',
    compile: function ($element, attr) {
      var fn = $parse(attr.mdTabScroll, null, true);
      return function ngEventHandler (scope, element) {
        element.on('mousewheel', function (event) {
          scope.$apply(function () { fn(scope, { $event: event }); });
        });
      };
    }
  }
}
MdTabScroll.$inject = ["$parse"];

})();
(function(){
"use strict";

angular
    .module('material.components.tabs')
    .controller('MdTabsController', MdTabsController);

/**
 * @ngInject
 */
function MdTabsController ($scope, $element, $window, $mdConstant, $mdTabInkRipple,
                           $mdUtil, $animateCss, $attrs, $compile, $mdTheming) {
  // define private properties
  var ctrl      = this,
      locked    = false,
      elements  = getElements(),
      queue     = [],
      destroyed = false,
      loaded    = false;

  // define one-way bindings
  defineOneWayBinding('stretchTabs', handleStretchTabs);

  // define public properties with change handlers
  defineProperty('focusIndex', handleFocusIndexChange, ctrl.selectedIndex || 0);
  defineProperty('offsetLeft', handleOffsetChange, 0);
  defineProperty('hasContent', handleHasContent, false);
  defineProperty('maxTabWidth', handleMaxTabWidth, getMaxTabWidth());
  defineProperty('shouldPaginate', handleShouldPaginate, false);

  // define boolean attributes
  defineBooleanAttribute('noInkBar', handleInkBar);
  defineBooleanAttribute('dynamicHeight', handleDynamicHeight);
  defineBooleanAttribute('noPagination');
  defineBooleanAttribute('swipeContent');
  defineBooleanAttribute('noDisconnect');
  defineBooleanAttribute('autoselect');
  defineBooleanAttribute('centerTabs', handleCenterTabs, false);
  defineBooleanAttribute('enableDisconnect');

  // define public properties
  ctrl.scope             = $scope;
  ctrl.parent            = $scope.$parent;
  ctrl.tabs              = [];
  ctrl.lastSelectedIndex = null;
  ctrl.hasFocus          = false;
  ctrl.lastClick         = true;
  ctrl.shouldCenterTabs  = shouldCenterTabs();

  // define public methods
  ctrl.updatePagination   = $mdUtil.debounce(updatePagination, 100);
  ctrl.redirectFocus      = redirectFocus;
  ctrl.attachRipple       = attachRipple;
  ctrl.insertTab          = insertTab;
  ctrl.removeTab          = removeTab;
  ctrl.select             = select;
  ctrl.scroll             = scroll;
  ctrl.nextPage           = nextPage;
  ctrl.previousPage       = previousPage;
  ctrl.keydown            = keydown;
  ctrl.canPageForward     = canPageForward;
  ctrl.canPageBack        = canPageBack;
  ctrl.refreshIndex       = refreshIndex;
  ctrl.incrementIndex     = incrementIndex;
  ctrl.getTabElementIndex = getTabElementIndex;
  ctrl.updateInkBarStyles = $mdUtil.debounce(updateInkBarStyles, 100);
  ctrl.updateTabOrder     = $mdUtil.debounce(updateTabOrder, 100);

  init();

  /**
   * Perform initialization for the controller, setup events and watcher(s)
   */
  function init () {
    ctrl.selectedIndex = ctrl.selectedIndex || 0;
    compileTemplate();
    configureWatchers();
    bindEvents();
    $mdTheming($element);
    $mdUtil.nextTick(function () {
      updateHeightFromContent();
      adjustOffset();
      updateInkBarStyles();
      ctrl.tabs[ ctrl.selectedIndex ] && ctrl.tabs[ ctrl.selectedIndex ].scope.select();
      loaded = true;
      updatePagination();
    });
  }

  /**
   * Compiles the template provided by the user.  This is passed as an attribute from the tabs
   * directive's template function.
   */
  function compileTemplate () {
    var template = $attrs.$mdTabsTemplate,
        element  = angular.element(elements.data);
    element.html(template);
    $compile(element.contents())(ctrl.parent);
    delete $attrs.$mdTabsTemplate;
  }

  /**
   * Binds events used by the tabs component.
   */
  function bindEvents () {
    angular.element($window).on('resize', handleWindowResize);
    $scope.$on('$destroy', cleanup);
  }

  /**
   * Configure watcher(s) used by Tabs
   */
  function configureWatchers () {
    $scope.$watch('$mdTabsCtrl.selectedIndex', handleSelectedIndexChange);
  }

  /**
   * Creates a one-way binding manually rather than relying on Angular's isolated scope
   * @param key
   * @param handler
   */
  function defineOneWayBinding (key, handler) {
    var attr = $attrs.$normalize('md-' + key);
    if (handler) defineProperty(key, handler);
    $attrs.$observe(attr, function (newValue) { ctrl[ key ] = newValue; });
  }

  /**
   * Defines boolean attributes with default value set to true.  (ie. md-stretch-tabs with no value
   * will be treated as being truthy)
   * @param key
   * @param handler
   */
  function defineBooleanAttribute (key, handler) {
    var attr = $attrs.$normalize('md-' + key);
    if (handler) defineProperty(key, handler);
    if ($attrs.hasOwnProperty(attr)) updateValue($attrs[attr]);
    $attrs.$observe(attr, updateValue);
    function updateValue (newValue) {
      ctrl[ key ] = newValue !== 'false';
    }
  }

  /**
   * Remove any events defined by this controller
   */
  function cleanup () {
    destroyed = true;
    angular.element($window).off('resize', handleWindowResize);
  }

  // Change handlers

  /**
   * Toggles stretch tabs class and updates inkbar when tab stretching changes
   * @param stretchTabs
   */
  function handleStretchTabs (stretchTabs) {
    angular.element(elements.wrapper).toggleClass('md-stretch-tabs', shouldStretchTabs());
    updateInkBarStyles();
  }

  function handleCenterTabs (newValue) {
    ctrl.shouldCenterTabs = shouldCenterTabs();
  }

  function handleMaxTabWidth (newWidth, oldWidth) {
    if (newWidth !== oldWidth) {
      $mdUtil.nextTick(ctrl.updateInkBarStyles);
    }
  }

  function handleShouldPaginate (newValue, oldValue) {
    if (newValue !== oldValue) {
      ctrl.maxTabWidth      = getMaxTabWidth();
      ctrl.shouldCenterTabs = shouldCenterTabs();
      $mdUtil.nextTick(function () {
        ctrl.maxTabWidth = getMaxTabWidth();
        adjustOffset(ctrl.selectedIndex);
      });
    }
  }

  /**
   * Add/remove the `md-no-tab-content` class depending on `ctrl.hasContent`
   * @param hasContent
   */
  function handleHasContent (hasContent) {
    $element[ hasContent ? 'removeClass' : 'addClass' ]('md-no-tab-content');
  }

  /**
   * Apply ctrl.offsetLeft to the paging element when it changes
   * @param left
   */
  function handleOffsetChange (left) {
    var newValue = ctrl.shouldCenterTabs ? '' : '-' + left + 'px';
    angular.element(elements.paging).css($mdConstant.CSS.TRANSFORM, 'translate3d(' + newValue + ', 0, 0)');
    $scope.$broadcast('$mdTabsPaginationChanged');
  }

  /**
   * Update the UI whenever `ctrl.focusIndex` is updated
   * @param newIndex
   * @param oldIndex
   */
  function handleFocusIndexChange (newIndex, oldIndex) {
    if (newIndex === oldIndex) return;
    if (!elements.tabs[ newIndex ]) return;
    adjustOffset();
    redirectFocus();
  }

  /**
   * Update the UI whenever the selected index changes. Calls user-defined select/deselect methods.
   * @param newValue
   * @param oldValue
   */
  function handleSelectedIndexChange (newValue, oldValue) {
    if (newValue === oldValue) return;
    
    ctrl.selectedIndex     = getNearestSafeIndex(newValue);
    ctrl.lastSelectedIndex = oldValue;
    ctrl.updateInkBarStyles();
    updateHeightFromContent();
    adjustOffset(newValue);
    $scope.$broadcast('$mdTabsChanged');
    ctrl.tabs[ oldValue ] && ctrl.tabs[ oldValue ].scope.deselect();
    ctrl.tabs[ newValue ] && ctrl.tabs[ newValue ].scope.select();
  }

  function getTabElementIndex(tabEl){
    var tabs = $element[0].getElementsByTagName('md-tab');
    return Array.prototype.indexOf.call(tabs, tabEl[0]);
  }

  /**
   * Queues up a call to `handleWindowResize` when a resize occurs while the tabs component is
   * hidden.
   */
  function handleResizeWhenVisible () {
    // if there is already a watcher waiting for resize, do nothing
    if (handleResizeWhenVisible.watcher) return;
    // otherwise, we will abuse the $watch function to check for visible
    handleResizeWhenVisible.watcher = $scope.$watch(function () {
      // since we are checking for DOM size, we use $mdUtil.nextTick() to wait for after the DOM updates
      $mdUtil.nextTick(function () {
        // if the watcher has already run (ie. multiple digests in one cycle), do nothing
        if (!handleResizeWhenVisible.watcher) return;

        if ($element.prop('offsetParent')) {
          handleResizeWhenVisible.watcher();
          handleResizeWhenVisible.watcher = null;

          handleWindowResize();
        }
      }, false);
    });
  }

  // Event handlers / actions

  /**
   * Handle user keyboard interactions
   * @param event
   */
  function keydown (event) {
    switch (event.keyCode) {
      case $mdConstant.KEY_CODE.LEFT_ARROW:
        event.preventDefault();
        incrementIndex(-1, true);
        break;
      case $mdConstant.KEY_CODE.RIGHT_ARROW:
        event.preventDefault();
        incrementIndex(1, true);
        break;
      case $mdConstant.KEY_CODE.SPACE:
      case $mdConstant.KEY_CODE.ENTER:
        event.preventDefault();
        if (!locked) ctrl.selectedIndex = ctrl.focusIndex;
        break;
    }
    ctrl.lastClick = false;
  }

  /**
   * Update the selected index and trigger a click event on the original `md-tab` element in order
   * to fire user-added click events.
   * @param index
   */
  function select (index) {
    if (!locked) ctrl.focusIndex = ctrl.selectedIndex = index;
    ctrl.lastClick = true;
    // nextTick is required to prevent errors in user-defined click events
    $mdUtil.nextTick(function () {
      ctrl.tabs[ index ].element.triggerHandler('click');
    }, false);
  }

  /**
   * When pagination is on, this makes sure the selected index is in view.
   * @param event
   */
  function scroll (event) {
    if (!ctrl.shouldPaginate) return;
    event.preventDefault();
    ctrl.offsetLeft = fixOffset(ctrl.offsetLeft - event.wheelDelta);
  }

  /**
   * Slides the tabs over approximately one page forward.
   */
  function nextPage () {
    var viewportWidth = elements.canvas.clientWidth,
        totalWidth    = viewportWidth + ctrl.offsetLeft,
        i, tab;
    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[ i ];
      if (tab.offsetLeft + tab.offsetWidth > totalWidth) break;
    }
    ctrl.offsetLeft = fixOffset(tab.offsetLeft);
  }

  /**
   * Slides the tabs over approximately one page backward.
   */
  function previousPage () {
    var i, tab;
    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[ i ];
      if (tab.offsetLeft + tab.offsetWidth >= ctrl.offsetLeft) break;
    }
    ctrl.offsetLeft = fixOffset(tab.offsetLeft + tab.offsetWidth - elements.canvas.clientWidth);
  }

  /**
   * Update size calculations when the window is resized.
   */
  function handleWindowResize () {
    ctrl.lastSelectedIndex = ctrl.selectedIndex;
    ctrl.offsetLeft        = fixOffset(ctrl.offsetLeft);
    $mdUtil.nextTick(function () {
      ctrl.updateInkBarStyles();
      updatePagination();
    });
  }

  function handleInkBar (hide) {
    angular.element(elements.inkBar).toggleClass('ng-hide', hide);
  }

  /**
   * Toggle dynamic height class when value changes
   * @param value
   */
  function handleDynamicHeight (value) {
    $element.toggleClass('md-dynamic-height', value);
  }

  /**
   * Remove a tab from the data and select the nearest valid tab.
   * @param tabData
   */
  function removeTab (tabData) {
    if (destroyed) return;
    var selectedIndex = ctrl.selectedIndex,
        tab           = ctrl.tabs.splice(tabData.getIndex(), 1)[ 0 ];
    refreshIndex();
    // when removing a tab, if the selected index did not change, we have to manually trigger the
    //   tab select/deselect events
    if (ctrl.selectedIndex === selectedIndex) {
      tab.scope.deselect();
      ctrl.tabs[ ctrl.selectedIndex ] && ctrl.tabs[ ctrl.selectedIndex ].scope.select();
    }
    $mdUtil.nextTick(function () {
      updatePagination();
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
    });
  }

  /**
   * Create an entry in the tabs array for a new tab at the specified index.
   * @param tabData
   * @param index
   * @returns {*}
   */
  function insertTab (tabData, index) {
    var hasLoaded = loaded;
    var proto     = {
          getIndex:     function () { return ctrl.tabs.indexOf(tab); },
          isActive:     function () { return this.getIndex() === ctrl.selectedIndex; },
          isLeft:       function () { return this.getIndex() < ctrl.selectedIndex; },
          isRight:      function () { return this.getIndex() > ctrl.selectedIndex; },
          shouldRender: function () { return !ctrl.noDisconnect || this.isActive(); },
          hasFocus:     function () {
            return !ctrl.lastClick
                && ctrl.hasFocus && this.getIndex() === ctrl.focusIndex;
          },
          id:           $mdUtil.nextUid()
        },
        tab       = angular.extend(proto, tabData);
    if (angular.isDefined(index)) {
      ctrl.tabs.splice(index, 0, tab);
    } else {
      ctrl.tabs.push(tab);
    }
    processQueue();
    updateHasContent();
    $mdUtil.nextTick(function () {
      updatePagination();
      // if autoselect is enabled, select the newly added tab
      if (hasLoaded && ctrl.autoselect) $mdUtil.nextTick(function () {
        $mdUtil.nextTick(function () { select(ctrl.tabs.indexOf(tab)); });
      });
    });
    return tab;
  }

  // Getter methods

  /**
   * Gathers references to all of the DOM elements used by this controller.
   * @returns {{}}
   */
  function getElements () {
    var elements = {};

    // gather tab bar elements
    elements.wrapper = $element[ 0 ].getElementsByTagName('md-tabs-wrapper')[ 0 ];
    elements.data    = $element[ 0 ].getElementsByTagName('md-tab-data')[ 0 ];
    elements.canvas  = elements.wrapper.getElementsByTagName('md-tabs-canvas')[ 0 ];
    elements.paging  = elements.canvas.getElementsByTagName('md-pagination-wrapper')[ 0 ];
    elements.tabs    = elements.paging.getElementsByTagName('md-tab-item');
    elements.dummies = elements.canvas.getElementsByTagName('md-dummy-tab');
    elements.inkBar  = elements.paging.getElementsByTagName('md-ink-bar')[ 0 ];

    // gather tab content elements
    elements.contentsWrapper = $element[ 0 ].getElementsByTagName('md-tabs-content-wrapper')[ 0 ];
    elements.contents        = elements.contentsWrapper.getElementsByTagName('md-tab-content');

    return elements;
  }

  /**
   * Determines whether or not the left pagination arrow should be enabled.
   * @returns {boolean}
   */
  function canPageBack () {
    return ctrl.offsetLeft > 0;
  }

  /**
   * Determines whether or not the right pagination arrow should be enabled.
   * @returns {*|boolean}
   */
  function canPageForward () {
    var lastTab = elements.tabs[ elements.tabs.length - 1 ];
    return lastTab && lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth +
        ctrl.offsetLeft;
  }

  /**
   * Determines if the UI should stretch the tabs to fill the available space.
   * @returns {*}
   */
  function shouldStretchTabs () {
    switch (ctrl.stretchTabs) {
      case 'always':
        return true;
      case 'never':
        return false;
      default:
        return !ctrl.shouldPaginate
            && $window.matchMedia('(max-width: 600px)').matches;
    }
  }

  /**
   * Determines if the tabs should appear centered.
   * @returns {string|boolean}
   */
  function shouldCenterTabs () {
    return ctrl.centerTabs && !ctrl.shouldPaginate;
  }

  /**
   * Determines if pagination is necessary to display the tabs within the available space.
   * @returns {boolean}
   */
  function shouldPaginate () {
    if (ctrl.noPagination || !loaded) return false;
    var canvasWidth = $element.prop('clientWidth');
    angular.forEach(getElements().dummies, function (tab) { canvasWidth -= tab.offsetWidth; });
    return canvasWidth < 0;
  }

  /**
   * Finds the nearest tab index that is available.  This is primarily used for when the active
   * tab is removed.
   * @param newIndex
   * @returns {*}
   */
  function getNearestSafeIndex (newIndex) {
    if (newIndex === -1) return -1;
    var maxOffset = Math.max(ctrl.tabs.length - newIndex, newIndex),
        i, tab;
    for (i = 0; i <= maxOffset; i++) {
      tab = ctrl.tabs[ newIndex + i ];
      if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
      tab = ctrl.tabs[ newIndex - i ];
      if (tab && (tab.scope.disabled !== true)) return tab.getIndex();
    }
    return newIndex;
  }

  // Utility methods

  /**
   * Defines a property using a getter and setter in order to trigger a change handler without
   * using `$watch` to observe changes.
   * @param key
   * @param handler
   * @param value
   */
  function defineProperty (key, handler, value) {
    Object.defineProperty(ctrl, key, {
      get: function () { return value; },
      set: function (newValue) {
        var oldValue = value;
        value        = newValue;
        handler && handler(newValue, oldValue);
      }
    });
  }

  /**
   * Updates whether or not pagination should be displayed.
   */
  function updatePagination () {
    if (!shouldStretchTabs()) updatePagingWidth();
    ctrl.maxTabWidth = getMaxTabWidth();
    ctrl.shouldPaginate = shouldPaginate();
  }

  function updatePagingWidth() {
    var width = 1;
    angular.forEach(getElements().dummies, function (element) { width += element.offsetWidth; });
    angular.element(elements.paging).css('width', width + 'px');
  }

  function getMaxTabWidth () {
    return $element.prop('clientWidth');
  }

  /**
   * Re-orders the tabs and updates the selected and focus indexes to their new positions.
   * This is triggered by `tabDirective.js` when the user's tabs have been re-ordered.
   */
  function updateTabOrder () {
    var selectedItem   = ctrl.tabs[ ctrl.selectedIndex ],
        focusItem      = ctrl.tabs[ ctrl.focusIndex ];
    ctrl.tabs          = ctrl.tabs.sort(function (a, b) {
      return a.index - b.index;
    });
    ctrl.selectedIndex = ctrl.tabs.indexOf(selectedItem);
    ctrl.focusIndex    = ctrl.tabs.indexOf(focusItem);
  }

  /**
   * This moves the selected or focus index left or right.  This is used by the keydown handler.
   * @param inc
   */
  function incrementIndex (inc, focus) {
    var newIndex,
        key   = focus ? 'focusIndex' : 'selectedIndex',
        index = ctrl[ key ];
    for (newIndex = index + inc;
         ctrl.tabs[ newIndex ] && ctrl.tabs[ newIndex ].scope.disabled;
         newIndex += inc) {}
    if (ctrl.tabs[ newIndex ]) {
      ctrl[ key ] = newIndex;
    }
  }

  /**
   * This is used to forward focus to dummy elements.  This method is necessary to avoid animation
   * issues when attempting to focus an item that is out of view.
   */
  function redirectFocus () {
    getElements().dummies[ ctrl.focusIndex ].focus();
  }

  /**
   * Forces the pagination to move the focused tab into view.
   */
  function adjustOffset (index) {
    if (index == null) index = ctrl.focusIndex;
    if (!elements.tabs[ index ]) return;
    if (ctrl.shouldCenterTabs) return;
    var tab         = elements.tabs[ index ],
        left        = tab.offsetLeft,
        right       = tab.offsetWidth + left;
    ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements.canvas.clientWidth + 32 * 2));
    ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
  }

  /**
   * Iterates through all queued functions and clears the queue.  This is used for functions that
   * are called before the UI is ready, such as size calculations.
   */
  function processQueue () {
    queue.forEach(function (func) { $mdUtil.nextTick(func); });
    queue = [];
  }

  /**
   * Determines if the tab content area is needed.
   */
  function updateHasContent () {
    var hasContent  = false;
    angular.forEach(ctrl.tabs, function (tab) {
      if (tab.template) hasContent = true;
    });
    ctrl.hasContent = hasContent;
  }

  /**
   * Moves the indexes to their nearest valid values.
   */
  function refreshIndex () {
    ctrl.selectedIndex = getNearestSafeIndex(ctrl.selectedIndex);
    ctrl.focusIndex    = getNearestSafeIndex(ctrl.focusIndex);
  }

  /**
   * Calculates the content height of the current tab.
   * @returns {*}
   */
  function updateHeightFromContent () {
    if (!ctrl.dynamicHeight) return $element.css('height', '');
    if (!ctrl.tabs.length) return queue.push(updateHeightFromContent);

    var tabContent    = elements.contents[ ctrl.selectedIndex ],
        contentHeight = tabContent ? tabContent.offsetHeight : 0,
        tabsHeight    = elements.wrapper.offsetHeight,
        newHeight     = contentHeight + tabsHeight,
        currentHeight = $element.prop('offsetHeight');

    // Adjusts calculations for when the buttons are bottom-aligned since this relies on absolute
    // positioning.  This should probably be cleaned up if a cleaner solution is possible.
    if ($element.attr('md-align-tabs') === 'bottom') {
      currentHeight -= tabsHeight;
      newHeight -= tabsHeight;
      // Need to include bottom border in these calculations
      if ($element.attr('md-border-bottom') !== undefined) ++currentHeight;
    }

    if (currentHeight === newHeight) return;

    // Lock during animation so the user can't change tabs
    locked = true;

    var fromHeight = { height: currentHeight + 'px' },
        toHeight = { height: newHeight + 'px' };

    // Set the height to the current, specific pixel height to fix a bug on iOS where the height
    // first animates to 0, then back to the proper height causing a visual glitch
    $element.css(fromHeight);

    // Animate the height from the old to the new
    $animateCss($element, {
      from: fromHeight,
      to: toHeight,
      easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
      duration: 0.5
    }).start().done(function () {
      // Then (to fix the same iOS issue as above), disable transitions and remove the specific
      // pixel height so the height can size with browser width/content changes, etc.
      $element.css({
        transition: 'none',
        height: ''
      });

      // In the next tick, re-allow transitions (if we do it all at once, $element.css is "smart"
      // enough to batch it for us instead of doing it immediately, which undoes the original
      // transition: none)
      $mdUtil.nextTick(function() {
        $element.css('transition', '');
      });

      // And unlock so tab changes can occur
      locked = false;
    });
  }

  /**
   * Repositions the ink bar to the selected tab.
   * @returns {*}
   */
  function updateInkBarStyles () {
    if (!elements.tabs[ ctrl.selectedIndex ]) {
      angular.element(elements.inkBar).css({ left: 'auto', right: 'auto' });
      return;
    }
    if (!ctrl.tabs.length) return queue.push(ctrl.updateInkBarStyles);
    // if the element is not visible, we will not be able to calculate sizes until it is
    // we should treat that as a resize event rather than just updating the ink bar
    if (!$element.prop('offsetParent')) return handleResizeWhenVisible();
    var index      = ctrl.selectedIndex,
        totalWidth = elements.paging.offsetWidth,
        tab        = elements.tabs[ index ],
        left       = tab.offsetLeft,
        right      = totalWidth - left - tab.offsetWidth,
        tabWidth;
    if (ctrl.shouldCenterTabs) {
      tabWidth = Array.prototype.slice.call(elements.tabs).reduce(function (value, element) {
        return value + element.offsetWidth;
      }, 0);
      if (totalWidth > tabWidth) $mdUtil.nextTick(updateInkBarStyles, false);
    }
    updateInkBarClassName();
    angular.element(elements.inkBar).css({ left: left + 'px', right: right + 'px' });
  }

  /**
   * Adds left/right classes so that the ink bar will animate properly.
   */
  function updateInkBarClassName () {
    var newIndex = ctrl.selectedIndex,
        oldIndex = ctrl.lastSelectedIndex,
        ink      = angular.element(elements.inkBar);
    if (!angular.isNumber(oldIndex)) return;
    ink
        .toggleClass('md-left', newIndex < oldIndex)
        .toggleClass('md-right', newIndex > oldIndex);
  }

  /**
   * Takes an offset value and makes sure that it is within the min/max allowed values.
   * @param value
   * @returns {*}
   */
  function fixOffset (value) {
    if (!elements.tabs.length || !ctrl.shouldPaginate) return 0;
    var lastTab    = elements.tabs[ elements.tabs.length - 1 ],
        totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;
    value          = Math.max(0, value);
    value          = Math.min(totalWidth - elements.canvas.clientWidth, value);
    return value;
  }

  /**
   * Attaches a ripple to the tab item element.
   * @param scope
   * @param element
   */
  function attachRipple (scope, element) {
    var options = { colorElement: angular.element(elements.inkBar) };
    $mdTabInkRipple.attach(scope, element, options);
  }
}
MdTabsController.$inject = ["$scope", "$element", "$window", "$mdConstant", "$mdTabInkRipple", "$mdUtil", "$animateCss", "$attrs", "$compile", "$mdTheming"];

})();
(function(){
"use strict";

/**
 * @ngdoc directive
 * @name mdTabs
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @description
 * The `<md-tabs>` directive serves as the container for 1..n `<md-tab>` child directives to produces a Tabs components.
 * In turn, the nested `<md-tab>` directive is used to specify a tab label for the **header button** and a [optional] tab view
 * content that will be associated with each tab button.
 *
 * Below is the markup for its simplest usage:
 *
 *  <hljs lang="html">
 *  <md-tabs>
 *    <md-tab label="Tab #1"></md-tab>
 *    <md-tab label="Tab #2"></md-tab>
 *    <md-tab label="Tab #3"></md-tab>
 *  </md-tabs>
 *  </hljs>
 *
 * Tabs supports three (3) usage scenarios:
 *
 *  1. Tabs (buttons only)
 *  2. Tabs with internal view content
 *  3. Tabs with external view content
 *
 * **Tab-only** support is useful when tab buttons are used for custom navigation regardless of any other components, content, or views.
 * **Tabs with internal views** are the traditional usages where each tab has associated view content and the view switching is managed internally by the Tabs component.
 * **Tabs with external view content** is often useful when content associated with each tab is independently managed and data-binding notifications announce tab selection changes.
 *
 * Additional features also include:
 *
 * *  Content can include any markup.
 * *  If a tab is disabled while active/selected, then the next tab will be auto-selected.
 *
 * ### Explanation of tab stretching
 *
 * Initially, tabs will have an inherent size.  This size will either be defined by how much space is needed to accommodate their text or set by the user through CSS.  Calculations will be based on this size.
 *
 * On mobile devices, tabs will be expanded to fill the available horizontal space.  When this happens, all tabs will become the same size.
 *
 * On desktops, by default, stretching will never occur.
 *
 * This default behavior can be overridden through the `md-stretch-tabs` attribute.  Here is a table showing when stretching will occur:
 *
 * `md-stretch-tabs` | mobile    | desktop
 * ------------------|-----------|--------
 * `auto`            | stretched | ---
 * `always`          | stretched | stretched
 * `never`           | ---       | ---
 *
 * @param {integer=} md-selected Index of the active/selected tab
 * @param {boolean=} md-no-ink If present, disables ink ripple effects.
 * @param {boolean=} md-no-ink-bar If present, disables the selection ink bar.
 * @param {string=}  md-align-tabs Attribute to indicate position of tab buttons: `bottom` or `top`; default is `top`
 * @param {string=} md-stretch-tabs Attribute to indicate whether or not to stretch tabs: `auto`, `always`, or `never`; default is `auto`
 * @param {boolean=} md-dynamic-height When enabled, the tab wrapper will resize based on the contents of the selected tab
 * @param {boolean=} md-center-tabs When enabled, tabs will be centered provided there is no need for pagination
 * @param {boolean=} md-no-pagination When enabled, pagination will remain off
 * @param {boolean=} md-swipe-content When enabled, swipe gestures will be enabled for the content area to jump between tabs
 * @param {boolean=} md-no-disconnect If your tab content has background tasks (ie. event listeners), you will want to include this to prevent the scope from being disconnected
 * @param {boolean=} md-autoselect When present, any tabs added after the initial load will be automatically selected
 *
 * @usage
 * <hljs lang="html">
 * <md-tabs md-selected="selectedIndex" >
 *   <img ng-src="img/angular.png" class="centered">
 *   <md-tab
 *       ng-repeat="tab in tabs | orderBy:predicate:reversed"
 *       md-on-select="onTabSelected(tab)"
 *       md-on-deselect="announceDeselected(tab)"
 *       ng-disabled="tab.disabled">
 *     <md-tab-label>
 *       {{tab.title}}
 *       <img src="img/removeTab.png" ng-click="removeTab(tab)" class="delete">
 *     </md-tab-label>
 *     <md-tab-body>
 *       {{tab.content}}
 *     </md-tab-body>
 *   </md-tab>
 * </md-tabs>
 * </hljs>
 *
 */
angular
    .module('material.components.tabs')
    .directive('mdTabs', MdTabs);

function MdTabs () {
  return {
    scope:            {
      selectedIndex: '=?mdSelected'
    },
    template:         function (element, attr) {
      attr[ "$mdTabsTemplate" ] = element.html();
      return '' +
        '<md-tabs-wrapper> ' +
          '<md-tab-data></md-tab-data> ' +
          '<md-prev-button ' +
              'tabindex="-1" ' +
              'role="button" ' +
              'aria-label="Previous Page" ' +
              'aria-disabled="{{!$mdTabsCtrl.canPageBack()}}" ' +
              'ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageBack() }" ' +
              'ng-if="$mdTabsCtrl.shouldPaginate" ' +
              'ng-click="$mdTabsCtrl.previousPage()"> ' +
            '<md-icon md-svg-icon="md-tabs-arrow"></md-icon> ' +
          '</md-prev-button> ' +
          '<md-next-button ' +
              'tabindex="-1" ' +
              'role="button" ' +
              'aria-label="Next Page" ' +
              'aria-disabled="{{!$mdTabsCtrl.canPageForward()}}" ' +
              'ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageForward() }" ' +
              'ng-if="$mdTabsCtrl.shouldPaginate" ' +
              'ng-click="$mdTabsCtrl.nextPage()"> ' +
            '<md-icon md-svg-icon="md-tabs-arrow"></md-icon> ' +
          '</md-next-button> ' +
          '<md-tabs-canvas ' +
              'tabindex="0" ' +
              'aria-activedescendant="tab-item-{{$mdTabsCtrl.tabs[$mdTabsCtrl.focusIndex].id}}" ' +
              'ng-focus="$mdTabsCtrl.redirectFocus()" ' +
              'ng-class="{ ' +
                  '\'md-paginated\': $mdTabsCtrl.shouldPaginate, ' +
                  '\'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs ' +
              '}" ' +
              'ng-keydown="$mdTabsCtrl.keydown($event)" ' +
              'role="tablist"> ' +
            '<md-pagination-wrapper ' +
                'ng-class="{ \'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs }" ' +
                'md-tab-scroll="$mdTabsCtrl.scroll($event)"> ' +
              '<md-tab-item ' +
                  'tabindex="-1" ' +
                  'class="md-tab" ' +
                  'style="max-width: {{ $mdTabsCtrl.maxTabWidth + \'px\' }}" ' +
                  'ng-repeat="tab in $mdTabsCtrl.tabs" ' +
                  'role="tab" ' +
                  'aria-controls="tab-content-{{::tab.id}}" ' +
                  'aria-selected="{{tab.isActive()}}" ' +
                  'aria-disabled="{{tab.scope.disabled || \'false\'}}" ' +
                  'ng-click="$mdTabsCtrl.select(tab.getIndex())" ' +
                  'ng-class="{ ' +
                      '\'md-active\':    tab.isActive(), ' +
                      '\'md-focused\':   tab.hasFocus(), ' +
                      '\'md-disabled\':  tab.scope.disabled ' +
                  '}" ' +
                  'ng-disabled="tab.scope.disabled" ' +
                  'md-swipe-left="$mdTabsCtrl.nextPage()" ' +
                  'md-swipe-right="$mdTabsCtrl.previousPage()" ' +
                  'md-tabs-template="::tab.label" ' +
                  'md-scope="::tab.parent"></md-tab-item> ' +
              '<md-ink-bar></md-ink-bar> ' +
            '</md-pagination-wrapper> ' +
            '<div class="md-visually-hidden md-dummy-wrapper"> ' +
              '<md-dummy-tab ' +
                  'class="md-tab" ' +
                  'tabindex="-1" ' +
                  'id="tab-item-{{::tab.id}}" ' +
                  'role="tab" ' +
                  'aria-controls="tab-content-{{::tab.id}}" ' +
                  'aria-selected="{{tab.isActive()}}" ' +
                  'aria-disabled="{{tab.scope.disabled || \'false\'}}" ' +
                  'ng-focus="$mdTabsCtrl.hasFocus = true" ' +
                  'ng-blur="$mdTabsCtrl.hasFocus = false" ' +
                  'ng-repeat="tab in $mdTabsCtrl.tabs" ' +
                  'md-tabs-template="::tab.label" ' +
                  'md-scope="::tab.parent"></md-dummy-tab> ' +
            '</div> ' +
          '</md-tabs-canvas> ' +
        '</md-tabs-wrapper> ' +
        '<md-tabs-content-wrapper ng-show="$mdTabsCtrl.hasContent && $mdTabsCtrl.selectedIndex >= 0"> ' +
          '<md-tab-content ' +
              'id="tab-content-{{::tab.id}}" ' +
              'role="tabpanel" ' +
              'aria-labelledby="tab-item-{{::tab.id}}" ' +
              'md-swipe-left="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(1)" ' +
              'md-swipe-right="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(-1)" ' +
              'ng-if="$mdTabsCtrl.hasContent" ' +
              'ng-repeat="(index, tab) in $mdTabsCtrl.tabs" ' +
              'ng-class="{ ' +
                '\'md-no-transition\': $mdTabsCtrl.lastSelectedIndex == null, ' +
                '\'md-active\':        tab.isActive(), ' +
                '\'md-left\':          tab.isLeft(), ' +
                '\'md-right\':         tab.isRight(), ' +
                '\'md-no-scroll\':     $mdTabsCtrl.dynamicHeight ' +
              '}"> ' +
            '<div ' +
                'md-tabs-template="::tab.template" ' +
                'md-connected-if="tab.isActive()" ' +
                'md-scope="::tab.parent" ' +
                'ng-if="$mdTabsCtrl.enableDisconnect || tab.shouldRender()"></div> ' +
          '</md-tab-content> ' +
        '</md-tabs-content-wrapper>';
    },
    controller:       'MdTabsController',
    controllerAs:     '$mdTabsCtrl',
    bindToController: true
  };
}

})();
(function(){
"use strict";

angular
    .module('material.components.tabs')
    .directive('mdTabsTemplate', MdTabsTemplate);

function MdTabsTemplate ($compile, $mdUtil) {
  return {
    restrict: 'A',
    link:     link,
    scope:    {
      template:     '=mdTabsTemplate',
      connected:    '=?mdConnectedIf',
      compileScope: '=mdScope'
    },
    require:  '^?mdTabs'
  };
  function link (scope, element, attr, ctrl) {
    if (!ctrl) return;
    var compileScope = ctrl.enableDisconnect ? scope.compileScope.$new() : scope.compileScope;
    element.html(scope.template);
    $compile(element.contents())(compileScope);
    element.on('DOMSubtreeModified', function () {
      ctrl.updatePagination();
      ctrl.updateInkBarStyles();
    });
    return $mdUtil.nextTick(handleScope);

    function handleScope () {
      scope.$watch('connected', function (value) { value === false ? disconnect() : reconnect(); });
      scope.$on('$destroy', reconnect);
    }

    function disconnect () {
      if (ctrl.enableDisconnect) $mdUtil.disconnectScope(compileScope);
    }

    function reconnect () {
      if (ctrl.enableDisconnect) $mdUtil.reconnectScope(compileScope);
    }
  }
}
MdTabsTemplate.$inject = ["$compile", "$mdUtil"];

})();
(function(){ 
angular.module("material.core").constant("$MD_THEME_CSS", "md-autocomplete.md-THEME_NAME-theme {  background: '{{background-50}}'; }  md-autocomplete.md-THEME_NAME-theme[disabled] {    background: '{{background-100}}'; }  md-autocomplete.md-THEME_NAME-theme button md-icon path {    fill: '{{background-600}}'; }  md-autocomplete.md-THEME_NAME-theme button:after {    background: '{{background-600-0.3}}'; }.md-autocomplete-suggestions-container.md-THEME_NAME-theme {  background: '{{background-50}}'; }  .md-autocomplete-suggestions-container.md-THEME_NAME-theme li {    color: '{{background-900}}'; }    .md-autocomplete-suggestions-container.md-THEME_NAME-theme li .highlight {      color: '{{background-600}}'; }    .md-autocomplete-suggestions-container.md-THEME_NAME-theme li:hover, .md-autocomplete-suggestions-container.md-THEME_NAME-theme li.selected {      background: '{{background-200}}'; }md-backdrop {  background-color: '{{background-900-0.0}}'; }  md-backdrop.md-opaque.md-THEME_NAME-theme {    background-color: '{{background-900-1.0}}'; }md-bottom-sheet.md-THEME_NAME-theme {  background-color: '{{background-50}}';  border-top-color: '{{background-300}}'; }  md-bottom-sheet.md-THEME_NAME-theme.md-list md-list-item {    color: '{{foreground-1}}'; }  md-bottom-sheet.md-THEME_NAME-theme .md-subheader {    background-color: '{{background-50}}'; }  md-bottom-sheet.md-THEME_NAME-theme .md-subheader {    color: '{{foreground-1}}'; }a.md-button.md-THEME_NAME-theme:not([disabled]):hover, .md-button.md-THEME_NAME-theme:not([disabled]):hover {  background-color: '{{background-500-0.2}}'; }a.md-button.md-THEME_NAME-theme:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme:not([disabled]).md-focused {  background-color: '{{background-500-0.2}}'; }a.md-button.md-THEME_NAME-theme:not([disabled]).md-icon-button:hover, .md-button.md-THEME_NAME-theme:not([disabled]).md-icon-button:hover {  background-color: transparent; }a.md-button.md-THEME_NAME-theme.md-fab, .md-button.md-THEME_NAME-theme.md-fab {  background-color: '{{accent-color}}';  color: '{{accent-contrast}}'; }  a.md-button.md-THEME_NAME-theme.md-fab md-icon, .md-button.md-THEME_NAME-theme.md-fab md-icon {    color: '{{accent-contrast}}'; }  a.md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover {    background-color: '{{accent-color}}'; }  a.md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused {    background-color: '{{accent-A700}}'; }a.md-button.md-THEME_NAME-theme.md-primary, .md-button.md-THEME_NAME-theme.md-primary {  color: '{{primary-color}}'; }  a.md-button.md-THEME_NAME-theme.md-primary.md-raised, a.md-button.md-THEME_NAME-theme.md-primary.md-fab, .md-button.md-THEME_NAME-theme.md-primary.md-raised, .md-button.md-THEME_NAME-theme.md-primary.md-fab {    color: '{{primary-contrast}}';    background-color: '{{primary-color}}'; }    a.md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]) md-icon, a.md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]) md-icon {      color: '{{primary-contrast}}'; }    a.md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]):hover, a.md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]):hover {      background-color: '{{primary-color}}'; }    a.md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]).md-focused, a.md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]).md-focused {      background-color: '{{primary-600}}'; }  a.md-button.md-THEME_NAME-theme.md-primary:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-primary:not([disabled]) md-icon {    color: '{{primary-color}}'; }a.md-button.md-THEME_NAME-theme.md-fab, .md-button.md-THEME_NAME-theme.md-fab {  background-color: '{{accent-color}}';  color: '{{accent-contrast}}'; }  a.md-button.md-THEME_NAME-theme.md-fab:not([disabled]) .md-icon, .md-button.md-THEME_NAME-theme.md-fab:not([disabled]) .md-icon {    color: '{{accent-contrast}}'; }  a.md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover {    background-color: '{{accent-color}}'; }  a.md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused {    background-color: '{{accent-A700}}'; }a.md-button.md-THEME_NAME-theme.md-raised, .md-button.md-THEME_NAME-theme.md-raised {  color: '{{background-contrast}}';  background-color: '{{background-50}}'; }  a.md-button.md-THEME_NAME-theme.md-raised:not([disabled]) .md-icon, .md-button.md-THEME_NAME-theme.md-raised:not([disabled]) .md-icon {    color: '{{background-contrast}}'; }  a.md-button.md-THEME_NAME-theme.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-raised:not([disabled]):hover {    background-color: '{{background-50}}'; }  a.md-button.md-THEME_NAME-theme.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-raised:not([disabled]).md-focused {    background-color: '{{background-200}}'; }a.md-button.md-THEME_NAME-theme.md-warn, .md-button.md-THEME_NAME-theme.md-warn {  color: '{{warn-color}}'; }  a.md-button.md-THEME_NAME-theme.md-warn.md-raised, a.md-button.md-THEME_NAME-theme.md-warn.md-fab, .md-button.md-THEME_NAME-theme.md-warn.md-raised, .md-button.md-THEME_NAME-theme.md-warn.md-fab {    color: '{{warn-contrast}}';    background-color: '{{warn-color}}'; }    a.md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]) md-icon, a.md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]) md-icon {      color: '{{warn-contrast}}'; }    a.md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]):hover, a.md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]):hover {      background-color: '{{warn-color}}'; }    a.md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]).md-focused, a.md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]).md-focused {      background-color: '{{warn-700}}'; }  a.md-button.md-THEME_NAME-theme.md-warn:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-warn:not([disabled]) md-icon {    color: '{{warn-color}}'; }a.md-button.md-THEME_NAME-theme.md-accent, .md-button.md-THEME_NAME-theme.md-accent {  color: '{{accent-color}}'; }  a.md-button.md-THEME_NAME-theme.md-accent.md-raised, a.md-button.md-THEME_NAME-theme.md-accent.md-fab, .md-button.md-THEME_NAME-theme.md-accent.md-raised, .md-button.md-THEME_NAME-theme.md-accent.md-fab {    color: '{{accent-contrast}}';    background-color: '{{accent-color}}'; }    a.md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]) md-icon, a.md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]) md-icon {      color: '{{accent-contrast}}'; }    a.md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]):hover, a.md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]):hover {      background-color: '{{accent-color}}'; }    a.md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]).md-focused, a.md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]).md-focused {      background-color: '{{accent-700}}'; }  a.md-button.md-THEME_NAME-theme.md-accent:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-accent:not([disabled]) md-icon {    color: '{{accent-color}}'; }a.md-button.md-THEME_NAME-theme[disabled], a.md-button.md-THEME_NAME-theme.md-raised[disabled], a.md-button.md-THEME_NAME-theme.md-fab[disabled], a.md-button.md-THEME_NAME-theme.md-accent[disabled], a.md-button.md-THEME_NAME-theme.md-warn[disabled], .md-button.md-THEME_NAME-theme[disabled], .md-button.md-THEME_NAME-theme.md-raised[disabled], .md-button.md-THEME_NAME-theme.md-fab[disabled], .md-button.md-THEME_NAME-theme.md-accent[disabled], .md-button.md-THEME_NAME-theme.md-warn[disabled] {  color: '{{foreground-3}}';  cursor: not-allowed; }  a.md-button.md-THEME_NAME-theme[disabled] md-icon, a.md-button.md-THEME_NAME-theme.md-raised[disabled] md-icon, a.md-button.md-THEME_NAME-theme.md-fab[disabled] md-icon, a.md-button.md-THEME_NAME-theme.md-accent[disabled] md-icon, a.md-button.md-THEME_NAME-theme.md-warn[disabled] md-icon, .md-button.md-THEME_NAME-theme[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-raised[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-fab[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-accent[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-warn[disabled] md-icon {    color: '{{foreground-3}}'; }a.md-button.md-THEME_NAME-theme.md-raised[disabled], a.md-button.md-THEME_NAME-theme.md-fab[disabled], .md-button.md-THEME_NAME-theme.md-raised[disabled], .md-button.md-THEME_NAME-theme.md-fab[disabled] {  background-color: '{{foreground-4}}'; }a.md-button.md-THEME_NAME-theme[disabled], .md-button.md-THEME_NAME-theme[disabled] {  background-color: transparent; }md-card.md-THEME_NAME-theme {  background-color: '{{background-color}}';  border-radius: 2px; }  md-card.md-THEME_NAME-theme .md-card-image {    border-radius: 2px 2px 0 0; }md-checkbox.md-THEME_NAME-theme .md-ripple {  color: '{{accent-600}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-ripple {  color: '{{background-600}}'; }md-checkbox.md-THEME_NAME-theme.md-checked.md-focused .md-container:before {  background-color: '{{accent-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme .md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-icon {  background-color: '{{accent-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-icon:after {  border-color: '{{background-200}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ripple {  color: '{{primary-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ripple {  color: '{{background-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple {  color: '{{primary-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-icon {  background-color: '{{primary-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked.md-focused .md-container:before {  background-color: '{{primary-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-icon:after {  border-color: '{{background-200}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ripple {  color: '{{warn-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple {  color: '{{warn-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-icon {  background-color: '{{warn-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked.md-focused:not([disabled]) .md-container:before {  background-color: '{{warn-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-icon:after {  border-color: '{{background-200}}'; }md-checkbox.md-THEME_NAME-theme[disabled] .md-icon {  border-color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme[disabled].md-checked .md-icon {  background-color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme[disabled] .md-label {  color: '{{foreground-3}}'; }md-chips.md-THEME_NAME-theme .md-chips {  box-shadow: 0 1px '{{background-300}}'; }  md-chips.md-THEME_NAME-theme .md-chips.md-focused {    box-shadow: 0 2px '{{primary-color}}'; }md-chips.md-THEME_NAME-theme .md-chip {  background: '{{background-300}}';  color: '{{background-800}}'; }  md-chips.md-THEME_NAME-theme .md-chip.md-focused {    background: '{{primary-color}}';    color: '{{primary-contrast}}'; }    md-chips.md-THEME_NAME-theme .md-chip.md-focused md-icon {      color: '{{primary-contrast}}'; }md-chips.md-THEME_NAME-theme md-chip-remove .md-button md-icon path {  fill: '{{background-500}}'; }.md-contact-suggestion span.md-contact-email {  color: '{{background-400}}'; }md-content.md-THEME_NAME-theme {  color: '{{foreground-1}}';  background-color: '{{background-color}}'; }/** Theme styles for mdCalendar. */.md-calendar.md-THEME_NAME-theme {  color: '{{foreground-1}}'; }  .md-calendar.md-THEME_NAME-theme tr:last-child td {    border-bottom-color: '{{background-200}}'; }.md-THEME_NAME-theme .md-calendar-day-header {  background: '{{background-hue-1}}';  color: '{{foreground-1}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today .md-calendar-date-selection-indicator {  border: 1px solid '{{primary-500}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today.md-calendar-date-disabled {  color: '{{primary-500-0.6}}'; }.md-THEME_NAME-theme .md-calendar-date.md-focus .md-calendar-date-selection-indicator {  background: '{{background-hue-1}}'; }.md-THEME_NAME-theme .md-calendar-date-selection-indicator:hover {  background: '{{background-hue-1}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-selected-date .md-calendar-date-selection-indicator, .md-THEME_NAME-theme .md-calendar-date.md-focus.md-calendar-selected-date .md-calendar-date-selection-indicator {  background: '{{primary-500}}';  color: '{{primary-500-contrast}}';  border-color: transparent; }.md-THEME_NAME-theme .md-calendar-date-disabled, .md-THEME_NAME-theme .md-calendar-month-label-disabled {  color: '{{foreground-3}}'; }/** Theme styles for mdDatepicker. */md-datepicker.md-THEME_NAME-theme {  background: '{{background-color}}'; }.md-THEME_NAME-theme .md-datepicker-input {  color: '{{background-contrast}}';  background: '{{background-color}}'; }  .md-THEME_NAME-theme .md-datepicker-input::-webkit-input-placeholder, .md-THEME_NAME-theme .md-datepicker-input::-moz-placeholder, .md-THEME_NAME-theme .md-datepicker-input:-moz-placeholder, .md-THEME_NAME-theme .md-datepicker-input:-ms-input-placeholder {    color: '{{foreground-3}}'; }.md-THEME_NAME-theme .md-datepicker-input-container {  border-bottom-color: '{{background-300}}'; }  .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused {    border-bottom-color: '{{primary-500}}'; }  .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-invalid {    border-bottom-color: '{{warn-500}}'; }.md-THEME_NAME-theme .md-datepicker-calendar-pane {  border-color: '{{background-300}}'; }.md-THEME_NAME-theme .md-datepicker-triangle-button .md-datepicker-expand-triangle {  border-top-color: '{{foreground-3}}'; }.md-THEME_NAME-theme .md-datepicker-triangle-button:hover .md-datepicker-expand-triangle {  border-top-color: '{{foreground-2}}'; }.md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon {  fill: '{{primary-500}}'; }.md-THEME_NAME-theme .md-datepicker-calendar, .md-THEME_NAME-theme .md-datepicker-input-mask-opaque {  background: '{{background-color}}'; }md-dialog.md-THEME_NAME-theme {  border-radius: 4px;  background-color: '{{background-color}}'; }  md-dialog.md-THEME_NAME-theme.md-content-overflow .md-actions {    border-top-color: '{{foreground-4}}'; }md-divider.md-THEME_NAME-theme {  border-top-color: '{{foreground-4}}'; }md-icon.md-THEME_NAME-theme {  color: '{{foreground-2}}'; }  md-icon.md-THEME_NAME-theme.md-primary {    color: '{{primary-color}}'; }  md-icon.md-THEME_NAME-theme.md-accent {    color: '{{accent-color}}'; }  md-icon.md-THEME_NAME-theme.md-warn {    color: '{{warn-color}}'; }md-input-container.md-THEME_NAME-theme .md-input {  color: '{{foreground-1}}';  border-color: '{{foreground-4}}';  text-shadow: '{{foreground-shadow}}'; }  md-input-container.md-THEME_NAME-theme .md-input::-webkit-input-placeholder, md-input-container.md-THEME_NAME-theme .md-input::-moz-placeholder, md-input-container.md-THEME_NAME-theme .md-input:-moz-placeholder, md-input-container.md-THEME_NAME-theme .md-input:-ms-input-placeholder {    color: '{{foreground-3}}'; }md-input-container.md-THEME_NAME-theme > md-icon {  color: '{{foreground-1}}'; }md-input-container.md-THEME_NAME-theme label, md-input-container.md-THEME_NAME-theme .md-placeholder {  text-shadow: '{{foreground-shadow}}';  color: '{{foreground-3}}'; }md-input-container.md-THEME_NAME-theme ng-messages :not(.md-char-counter), md-input-container.md-THEME_NAME-theme [ng-messages] :not(.md-char-counter), md-input-container.md-THEME_NAME-theme ng-message :not(.md-char-counter), md-input-container.md-THEME_NAME-theme data-ng-message :not(.md-char-counter), md-input-container.md-THEME_NAME-theme x-ng-message :not(.md-char-counter), md-input-container.md-THEME_NAME-theme [ng-message] :not(.md-char-counter), md-input-container.md-THEME_NAME-theme [data-ng-message] :not(.md-char-counter), md-input-container.md-THEME_NAME-theme [x-ng-message] :not(.md-char-counter), md-input-container.md-THEME_NAME-theme [ng-message-exp] :not(.md-char-counter), md-input-container.md-THEME_NAME-theme [data-ng-message-exp] :not(.md-char-counter), md-input-container.md-THEME_NAME-theme [x-ng-message-exp] :not(.md-char-counter) {  color: '{{warn-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-has-value label {  color: '{{foreground-2}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused .md-input {  border-color: '{{primary-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused label {  color: '{{primary-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused md-icon {  color: '{{primary-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent .md-input {  border-color: '{{accent-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent label {  color: '{{accent-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn .md-input {  border-color: '{{warn-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn label {  color: '{{warn-500}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid .md-input {  border-color: '{{warn-500}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid.md-input-focused label {  color: '{{warn-500}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid ng-message, md-input-container.md-THEME_NAME-theme.md-input-invalid data-ng-message, md-input-container.md-THEME_NAME-theme.md-input-invalid x-ng-message, md-input-container.md-THEME_NAME-theme.md-input-invalid [ng-message], md-input-container.md-THEME_NAME-theme.md-input-invalid [data-ng-message], md-input-container.md-THEME_NAME-theme.md-input-invalid [x-ng-message], md-input-container.md-THEME_NAME-theme.md-input-invalid [ng-message-exp], md-input-container.md-THEME_NAME-theme.md-input-invalid [data-ng-message-exp], md-input-container.md-THEME_NAME-theme.md-input-invalid [x-ng-message-exp], md-input-container.md-THEME_NAME-theme.md-input-invalid .md-char-counter {  color: '{{warn-500}}'; }md-input-container.md-THEME_NAME-theme .md-input[disabled], md-input-container.md-THEME_NAME-theme .md-input [disabled] {  border-bottom-color: transparent;  color: '{{foreground-3}}';  background-image: linear-gradient(to right, '{{foreground-3}}' 0%, '{{foreground-3}}' 33%, transparent 0%);  background-image: -ms-linear-gradient(left, transparent 0%, '{{foreground-3}}' 100%); }md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h3, md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h4, md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h3, md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h4 {  color: '{{foreground-1}}'; }md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text p, md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text p {  color: '{{foreground-2}}'; }md-list.md-THEME_NAME-theme .md-proxy-focus.md-focused div.md-no-style {  background-color: '{{background-100}}'; }md-list.md-THEME_NAME-theme md-list-item > .md-avatar-icon {  background-color: '{{foreground-3}}';  color: '{{background-color}}'; }md-list.md-THEME_NAME-theme md-list-item > md-icon {  color: '{{foreground-2}}'; }  md-list.md-THEME_NAME-theme md-list-item > md-icon.md-highlight {    color: '{{primary-color}}'; }    md-list.md-THEME_NAME-theme md-list-item > md-icon.md-highlight.md-accent {      color: '{{accent-color}}'; }md-list.md-THEME_NAME-theme md-list-item button {  background-color: '{{background-color}}'; }  md-list.md-THEME_NAME-theme md-list-item button.md-button:not([disabled]):hover {    background-color: '{{background-color}}'; }md-menu-content.md-THEME_NAME-theme {  background-color: '{{background-color}}'; }  md-menu-content.md-THEME_NAME-theme md-menu-divider {    background-color: '{{foreground-4}}'; }md-menu-bar.md-THEME_NAME-theme > button.md-button {  color: '{{foreground-2}}';  border-radius: 2px; }md-menu-bar.md-THEME_NAME-theme md-menu.md-open > button, md-menu-bar.md-THEME_NAME-theme md-menu > button:focus {  outline: none;  background: '{{background-200}}'; }md-menu-bar.md-THEME_NAME-theme.md-open:not(.md-keyboard-mode) md-menu:hover > button {  background-color: '{{ background-500-0.2}}'; }md-menu-bar.md-THEME_NAME-theme:not(.md-keyboard-mode):not(.md-open) md-menu button:hover, md-menu-bar.md-THEME_NAME-theme:not(.md-keyboard-mode):not(.md-open) md-menu button:focus {  background: transparent; }md-menu-content.md-THEME_NAME-theme .md-menu > .md-button:after {  color: '{{foreground-2}}'; }md-menu-content.md-THEME_NAME-theme .md-menu.md-open > .md-button {  background-color: '{{ background-500-0.2}}'; }md-toolbar.md-THEME_NAME-theme.md-menu-toolbar {  background-color: '{{background-color}}';  color: '{{foreground-1}}'; }  md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler {    background-color: '{{primary-color}}';    color: '{{primary-contrast}}'; }    md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler md-icon {      color: '{{primary-contrast}}'; }md-progress-circular.md-THEME_NAME-theme {  background-color: transparent; }  md-progress-circular.md-THEME_NAME-theme .md-inner .md-gap {    border-top-color: '{{primary-color}}';    border-bottom-color: '{{primary-color}}'; }  md-progress-circular.md-THEME_NAME-theme .md-inner .md-left .md-half-circle, md-progress-circular.md-THEME_NAME-theme .md-inner .md-right .md-half-circle {    border-top-color: '{{primary-color}}'; }  md-progress-circular.md-THEME_NAME-theme .md-inner .md-right .md-half-circle {    border-right-color: '{{primary-color}}'; }  md-progress-circular.md-THEME_NAME-theme .md-inner .md-left .md-half-circle {    border-left-color: '{{primary-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-warn .md-inner .md-gap {    border-top-color: '{{warn-color}}';    border-bottom-color: '{{warn-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-warn .md-inner .md-left .md-half-circle, md-progress-circular.md-THEME_NAME-theme.md-warn .md-inner .md-right .md-half-circle {    border-top-color: '{{warn-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-warn .md-inner .md-right .md-half-circle {    border-right-color: '{{warn-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-warn .md-inner .md-left .md-half-circle {    border-left-color: '{{warn-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-accent .md-inner .md-gap {    border-top-color: '{{accent-color}}';    border-bottom-color: '{{accent-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-accent .md-inner .md-left .md-half-circle, md-progress-circular.md-THEME_NAME-theme.md-accent .md-inner .md-right .md-half-circle {    border-top-color: '{{accent-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-accent .md-inner .md-right .md-half-circle {    border-right-color: '{{accent-color}}'; }  md-progress-circular.md-THEME_NAME-theme.md-accent .md-inner .md-left .md-half-circle {    border-left-color: '{{accent-color}}'; }md-progress-linear.md-THEME_NAME-theme .md-container {  background-color: '{{primary-100}}'; }md-progress-linear.md-THEME_NAME-theme .md-bar {  background-color: '{{primary-color}}'; }md-progress-linear.md-THEME_NAME-theme.md-warn .md-container {  background-color: '{{warn-100}}'; }md-progress-linear.md-THEME_NAME-theme.md-warn .md-bar {  background-color: '{{warn-color}}'; }md-progress-linear.md-THEME_NAME-theme.md-accent .md-container {  background-color: '{{accent-100}}'; }md-progress-linear.md-THEME_NAME-theme.md-accent .md-bar {  background-color: '{{accent-color}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn .md-bar1 {  background-color: '{{warn-100}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn .md-dashed:before {  background: radial-gradient('{{warn-100}}' 0%, '{{warn-100}}' 16%, transparent 42%); }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent .md-bar1 {  background-color: '{{accent-100}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent .md-dashed:before {  background: radial-gradient('{{accent-100}}' 0%, '{{accent-100}}' 16%, transparent 42%); }md-radio-button.md-THEME_NAME-theme .md-off {  border-color: '{{foreground-2}}'; }md-radio-button.md-THEME_NAME-theme .md-on {  background-color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme.md-checked .md-off {  border-color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme .md-container .md-ripple {  color: '{{accent-600}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-on, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-on, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-on, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-on {  background-color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-off {  border-color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple {  color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-container .md-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-container .md-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-container .md-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-container .md-ripple {  color: '{{primary-600}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-on, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-on, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-on, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-on {  background-color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-off, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-off {  border-color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple {  color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-container .md-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-container .md-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-container .md-ripple, md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-container .md-ripple {  color: '{{warn-600}}'; }md-radio-group.md-THEME_NAME-theme[disabled], md-radio-button.md-THEME_NAME-theme[disabled] {  color: '{{foreground-3}}'; }  md-radio-group.md-THEME_NAME-theme[disabled] .md-container .md-off, md-radio-button.md-THEME_NAME-theme[disabled] .md-container .md-off {    border-color: '{{foreground-3}}'; }  md-radio-group.md-THEME_NAME-theme[disabled] .md-container .md-on, md-radio-button.md-THEME_NAME-theme[disabled] .md-container .md-on {    border-color: '{{foreground-3}}'; }md-radio-group.md-THEME_NAME-theme .md-checked .md-ink-ripple {  color: '{{accent-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-primary .md-checked:not([disabled]) .md-ink-ripple, md-radio-group.md-THEME_NAME-theme .md-checked:not([disabled]).md-primary .md-ink-ripple {  color: '{{primary-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme .md-checked.md-primary .md-ink-ripple {  color: '{{warn-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked .md-container:before {  background-color: '{{accent-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked:not([disabled]).md-primary .md-container:before {  background-color: '{{primary-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked.md-primary .md-container:before {  background-color: '{{warn-color-0.26}}'; }md-select.md-THEME_NAME-theme[disabled] .md-select-value {  border-bottom-color: transparent;  background-image: linear-gradient(to right, '{{foreground-3}}' 0%, '{{foreground-3}}' 33%, transparent 0%);  background-image: -ms-linear-gradient(left, transparent 0%, '{{foreground-3}}' 100%); }md-select.md-THEME_NAME-theme .md-select-value {  border-bottom-color: '{{foreground-4}}'; }  md-select.md-THEME_NAME-theme .md-select-value.md-select-placeholder {    color: '{{foreground-3}}'; }md-select.md-THEME_NAME-theme.ng-invalid.ng-dirty .md-select-value {  color: '{{warn-500}}' !important;  border-bottom-color: '{{warn-500}}' !important; }md-select.md-THEME_NAME-theme:not([disabled]):focus .md-select-value {  border-bottom-color: '{{primary-color}}';  color: '{{ foreground-1 }}'; }  md-select.md-THEME_NAME-theme:not([disabled]):focus .md-select-value.md-select-placeholder {    color: '{{ foreground-1 }}'; }md-select.md-THEME_NAME-theme:not([disabled]):focus.md-accent .md-select-value {  border-bottom-color: '{{accent-color}}'; }md-select.md-THEME_NAME-theme:not([disabled]):focus.md-warn .md-select-value {  border-bottom-color: '{{warn-color}}'; }md-select.md-THEME_NAME-theme[disabled] .md-select-value {  color: '{{foreground-3}}'; }  md-select.md-THEME_NAME-theme[disabled] .md-select-value.md-select-placeholder {    color: '{{foreground-3}}'; }md-select-menu.md-THEME_NAME-theme md-option[disabled] {  color: '{{foreground-3}}'; }md-select-menu.md-THEME_NAME-theme md-optgroup {  color: '{{foreground-2}}'; }  md-select-menu.md-THEME_NAME-theme md-optgroup md-option {    color: '{{foreground-1}}'; }md-select-menu.md-THEME_NAME-theme md-option[selected] {  color: '{{primary-500}}'; }  md-select-menu.md-THEME_NAME-theme md-option[selected]:focus {    color: '{{primary-600}}'; }  md-select-menu.md-THEME_NAME-theme md-option[selected].md-accent {    color: '{{accent-500}}'; }    md-select-menu.md-THEME_NAME-theme md-option[selected].md-accent:focus {      color: '{{accent-600}}'; }md-select-menu.md-THEME_NAME-theme md-option:focus:not([selected]) {  background: '{{background-200}}'; }md-sidenav.md-THEME_NAME-theme {  background-color: '{{background-color}}'; }md-slider.md-THEME_NAME-theme .md-track {  background-color: '{{foreground-3}}'; }md-slider.md-THEME_NAME-theme .md-track-ticks {  background-color: '{{foreground-4}}'; }md-slider.md-THEME_NAME-theme .md-focus-thumb {  background-color: '{{foreground-2}}'; }md-slider.md-THEME_NAME-theme .md-focus-ring {  background-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme .md-disabled-thumb {  border-color: '{{background-color}}'; }md-slider.md-THEME_NAME-theme.md-min .md-thumb:after {  background-color: '{{background-color}}'; }md-slider.md-THEME_NAME-theme .md-track.md-track-fill {  background-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme .md-thumb:after {  border-color: '{{accent-color}}';  background-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme .md-sign {  background-color: '{{accent-color}}'; }  md-slider.md-THEME_NAME-theme .md-sign:after {    border-top-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme .md-thumb-text {  color: '{{accent-contrast}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-focus-ring {  background-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-track.md-track-fill {  background-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-thumb:after {  border-color: '{{warn-color}}';  background-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-sign {  background-color: '{{warn-color}}'; }  md-slider.md-THEME_NAME-theme.md-warn .md-sign:after {    border-top-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-thumb-text {  color: '{{warn-contrast}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-focus-ring {  background-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-track.md-track-fill {  background-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-thumb:after {  border-color: '{{primary-color}}';  background-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-sign {  background-color: '{{primary-color}}'; }  md-slider.md-THEME_NAME-theme.md-primary .md-sign:after {    border-top-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-thumb-text {  color: '{{primary-contrast}}'; }md-slider.md-THEME_NAME-theme[disabled] .md-thumb:after {  border-color: '{{foreground-3}}'; }md-slider.md-THEME_NAME-theme[disabled]:not(.md-min) .md-thumb:after {  background-color: '{{foreground-3}}'; }.md-subheader.md-THEME_NAME-theme {  color: '{{ foreground-2-0.23 }}';  background-color: '{{background-color}}'; }  .md-subheader.md-THEME_NAME-theme.md-primary {    color: '{{primary-color}}'; }  .md-subheader.md-THEME_NAME-theme.md-accent {    color: '{{accent-color}}'; }  .md-subheader.md-THEME_NAME-theme.md-warn {    color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme .md-ink-ripple {  color: '{{background-500}}'; }md-switch.md-THEME_NAME-theme .md-thumb {  background-color: '{{background-50}}'; }md-switch.md-THEME_NAME-theme .md-bar {  background-color: '{{background-500}}'; }md-switch.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color}}'; }md-switch.md-THEME_NAME-theme.md-checked .md-thumb {  background-color: '{{accent-color}}'; }md-switch.md-THEME_NAME-theme.md-checked .md-bar {  background-color: '{{accent-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-focused .md-thumb:before {  background-color: '{{accent-color-0.26}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-ink-ripple {  color: '{{primary-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-thumb {  background-color: '{{primary-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-bar {  background-color: '{{primary-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary.md-focused .md-thumb:before {  background-color: '{{primary-color-0.26}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-ink-ripple {  color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-thumb {  background-color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-bar {  background-color: '{{warn-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn.md-focused .md-thumb:before {  background-color: '{{warn-color-0.26}}'; }md-switch.md-THEME_NAME-theme[disabled] .md-thumb {  background-color: '{{background-400}}'; }md-switch.md-THEME_NAME-theme[disabled] .md-bar {  background-color: '{{foreground-4}}'; }md-tabs.md-THEME_NAME-theme md-tabs-wrapper {  background-color: transparent;  border-color: '{{foreground-4}}'; }md-tabs.md-THEME_NAME-theme .md-paginator md-icon {  color: '{{primary-color}}'; }md-tabs.md-THEME_NAME-theme md-ink-bar {  color: '{{accent-color}}';  background: '{{accent-color}}'; }md-tabs.md-THEME_NAME-theme .md-tab {  color: '{{foreground-2}}'; }  md-tabs.md-THEME_NAME-theme .md-tab[disabled], md-tabs.md-THEME_NAME-theme .md-tab[disabled] md-icon {    color: '{{foreground-3}}'; }  md-tabs.md-THEME_NAME-theme .md-tab.md-active, md-tabs.md-THEME_NAME-theme .md-tab.md-active md-icon, md-tabs.md-THEME_NAME-theme .md-tab.md-focused, md-tabs.md-THEME_NAME-theme .md-tab.md-focused md-icon {    color: '{{primary-color}}'; }  md-tabs.md-THEME_NAME-theme .md-tab.md-focused {    background: '{{primary-color-0.1}}'; }  md-tabs.md-THEME_NAME-theme .md-tab .md-ripple-container {    color: '{{accent-100}}'; }md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper {  background-color: '{{accent-color}}'; }  md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{accent-100}}'; }    md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      color: '{{accent-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{accent-contrast-0.1}}'; }  md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-ink-bar {    color: '{{primary-600-1}}';    background: '{{primary-600-1}}'; }md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper {  background-color: '{{primary-color}}'; }  md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{primary-100}}'; }    md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      color: '{{primary-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{primary-contrast-0.1}}'; }md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper {  background-color: '{{warn-color}}'; }  md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{warn-100}}'; }    md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      color: '{{warn-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{warn-contrast-0.1}}'; }md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{primary-color}}'; }  md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{primary-100}}'; }    md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      color: '{{primary-contrast}}'; }    md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{primary-contrast-0.1}}'; }md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{accent-color}}'; }  md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{accent-100}}'; }    md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      color: '{{accent-contrast}}'; }    md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{accent-contrast-0.1}}'; }  md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-ink-bar {    color: '{{primary-600-1}}';    background: '{{primary-600-1}}'; }md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{warn-color}}'; }  md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{warn-100}}'; }    md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      color: '{{warn-contrast}}'; }    md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{warn-contrast-0.1}}'; }md-toast.md-THEME_NAME-theme {  background-color: #323232;  color: '{{background-50}}'; }  md-toast.md-THEME_NAME-theme .md-button {    color: '{{background-50}}'; }    md-toast.md-THEME_NAME-theme .md-button.md-highlight {      color: '{{primary-A200}}'; }      md-toast.md-THEME_NAME-theme .md-button.md-highlight.md-accent {        color: '{{accent-A200}}'; }      md-toast.md-THEME_NAME-theme .md-button.md-highlight.md-warn {        color: '{{warn-A200}}'; }md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) {  background-color: '{{primary-color}}';  color: '{{primary-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) md-icon {    color: '{{primary-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) .md-button {    color: '{{primary-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent {    background-color: '{{accent-color}}';    color: '{{accent-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-warn {    background-color: '{{warn-color}}';    color: '{{warn-contrast}}'; }md-tooltip.md-THEME_NAME-theme {  color: '{{background-A100}}'; }  md-tooltip.md-THEME_NAME-theme .md-content {    background-color: '{{foreground-2}}'; }"); 
})();


})(window, window.angular);;window.ngMaterial={version:{full: "1.0.0-rc1"}};