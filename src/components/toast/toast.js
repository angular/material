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
  * ## Parent container notes
  *
  * The toast is positioned using absolute positioning relative to it's first non-static parent
  * container. Thus, if the requested parent container uses static positioning, we will temporarily
  * set it's positioning to `relative` while the toast is visible and reset it when the toast is
  * hidden.
  *
  * Because of this, it is usually best to ensure that the parent container has a fixed height and
  * prevents scrolling by setting the `overflow: hidden;` style. Since the position is based off of
  * the parent's height, the toast may be mispositioned if you allow the parent to scroll.
  *
  * You can, however, have a scrollable element inside of the container; just make sure the
  * container itself does not scroll.
  *
  * <hljs lang="html">
  * <div layout-fill id="toast-container">
  *   <md-content>
  *     I can have lots of content and scroll!
  *   </md-content>
  * </div>
  * </hljs>
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
  *     $mdToast.show($mdToast.simple().textContent('Hello!'));
  *     // Could also do $mdToast.showSimple('Hello');
  *   };
  * });
  * </hljs>
  */

/**
 * @ngdoc method
 * @name $mdToast#showSimple
 * 
 * @param {string} message The message to display inside the toast
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
  * @returns {obj} a `$mdToastPreset` with the following chainable configuration methods.
  *
  * _**Note:** These configuration methods are provided in addition to the methods provided by
  *   the `build()` and `show()` methods below._
  *
  * - `.textContent(string)` - Sets the toast content to the specified string.
  *
  * - `.action(string)` - Adds an action button. If clicked, the promise (returned from `show()`)
  * will resolve with the value `'ok'`; otherwise, it is resolved with `true` after a `hideDelay`
  * timeout.
  *
  * - `.highlightAction(boolean)` - Whether or not the action button will have an additional
  * highlight class.
  *
  * - `.capsule(boolean)` - Whether or not to add the `md-capsule` class to the toast to provide
  * rounded corners.
  *
  * - `.theme(string)` - Sets the theme on the toast to the requested theme. Default is
  * `$mdThemingProvider`'s default.
  */

/**
  * @ngdoc method
  * @name $mdToast#updateTextContent
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
  *   - `autoWrap` - `{boolean=}`: Whether or not to automatically wrap the template content with a
  *     `<div class="md-toast-content">` if one is not provided. Defaults to true. Can be disabled if you provide a
  *     custom toast directive.
  *   - `scope` - `{object=}`: the scope to link the template / controller to. If none is specified, it will create a new child scope.
  *     This scope will be destroyed when the toast is removed unless `preserveScope` is set to true.
  *   - `preserveScope` - `{boolean=}`: whether to preserve the scope when the element is removed. Default is false
  *   - `hideDelay` - `{number=}`: How many milliseconds the toast should stay
  *     active before automatically closing.  Set to 0 or false to have the toast stay open until
  *     closed manually. Default: 3000.
  *   - `position` - `{string=}`: Where to place the toast. Available: any combination
  *     of 'bottom', 'left', 'top', 'right'. Default: 'bottom left'.
  *   - `controller` - `{string=}`: The controller to associate with this toast.
  *     The controller will be injected the local `$mdToast.hide( )`, which is a function
  *     used to hide the toast.
  *   - `locals` - `{string=}`: An object containing key/value pairs. The keys will
  *     be used as names of values to inject into the controller. For example,
  *     `locals: {three: 3}` would inject `three` into the controller with the value
  *     of 3.
  *   - `bindToController` - `bool`: bind the locals to the controller, instead of passing them in.
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
  * `DEPRECATED` - The promise returned from opening a toast is used only to notify about the closing of the toast.
  * As such, there isn't any reason to also allow that promise to be rejected,
  * since it's not clear what the difference between resolve and reject would be.
  *
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
      argOption: 'textContent',
      methods: ['textContent', 'content', 'action', 'highlightAction', 'theme', 'parent'],
      options: /* @ngInject */ function($mdToast, $mdTheming) {
        var opts = {
          template:
            '<md-toast md-theme="{{ toast.theme }}" ng-class="{\'md-capsule\': toast.capsule}">' +
            '  <div class="md-toast-content">' +
            '    <span flex role="alert" aria-relevant="all" aria-atomic="true">' +
            '      {{ toast.content }}' +
            '    </span>' +
            '    <md-button class="md-action" ng-if="toast.action" ng-click="toast.resolve()" ng-class="{\'md-highlight\': toast.highlightAction}">' +
            '      {{ toast.action }}' +
            '    </md-button>' +
            '  </div>' +
            '</md-toast>',
          controller: /* @ngInject */ function mdToastCtrl($scope) {
            var self = this;
            $scope.$watch(function() { return activeToastContent; }, function() {
              self.content = activeToastContent;
            });
            this.resolve = function() {
              $mdToast.hide( ACTION_RESOLVE );
            };
          },
          theme: $mdTheming.defaultTheme(),
          controllerAs: 'toast',
          bindToController: true
        };
        return opts;
      }
    })
    .addMethod('updateTextContent', updateTextContent)
    .addMethod('updateContent', updateTextContent);

    function updateTextContent(newContent) {
      activeToastContent = newContent;
    }

    return $mdToast;

  /* @ngInject */
  function toastDefaultOptions($animate, $mdToast, $mdUtil, $mdMedia) {
    var SWIPE_EVENTS = '$md.swipeleft $md.swiperight $md.swipeup $md.swipedown';
    return {
      onShow: onShow,
      onRemove: onRemove,
      position: 'bottom left',
      themable: true,
      hideDelay: 3000,
      autoWrap: true,
      transformTemplate: function(template, options) {
        var shouldAddWrapper = options.autoWrap && template && !/md-toast-content/g.test(template);

        if (shouldAddWrapper) {
          // Root element of template will be <md-toast>. We need to wrap all of its content inside of
          // of <div class="md-toast-content">. All templates provided here should be static, developer-controlled
          // content (meaning we're not attempting to guard against XSS).
          var parsedTemplate = angular.element(template);
          var wrappedContent = '<div class="md-toast-content">' + parsedTemplate.html() + '</div>';

          parsedTemplate.empty().append(wrappedContent);

          // Underlying interimElement expects a template string.
          return parsedTemplate[0].outerHTML;
        }

        return shouldAddWrapper ?
            '<div class="md-toast-content">' + template + '</div>' :
            template || '';
      }
    };

    function onShow(scope, element, options) {
      activeToastContent = options.textContent || options.content; // support deprecated #content method

      var isSmScreen = !$mdMedia('gt-sm');

      element = $mdUtil.extractElementByName(element, 'md-toast', true);
      options.onSwipe = function(ev, gesture) {
        //Add the relevant swipe class to the element so it can animate correctly
        var swipe = ev.type.replace('$md.','');
        var direction = swipe.replace('swipe', '');

        // If the swipe direction is down/up but the toast came from top/bottom don't fade away
        // Unless the screen is small, then the toast always on bottom
        if ((direction === 'down' && options.position.indexOf('top') != -1 && !isSmScreen) ||
            (direction === 'up' && (options.position.indexOf('bottom') != -1 || isSmScreen))) {
          return;
        }

        if ((direction === 'left' || direction === 'right') && isSmScreen) {
          return;
        }

        element.addClass('md-' + swipe);
        $mdUtil.nextTick($mdToast.cancel);
      };
      options.openClass = toastOpenClass(options.position);


      // 'top left' -> 'md-top md-left'
      options.parent.addClass(options.openClass);

      // static is the default position
      if ($mdUtil.hasComputedStyle(options.parent, 'position', 'static')) {
        options.parent.css('position', 'relative');
      }

      element.on(SWIPE_EVENTS, options.onSwipe);
      element.addClass(isSmScreen ? 'md-bottom' : options.position.split(' ').map(function(pos) {
        return 'md-' + pos;
      }).join(' '));

      if (options.parent) options.parent.addClass('md-toast-animating');
      return $animate.enter(element, options.parent).then(function() {
        if (options.parent) options.parent.removeClass('md-toast-animating');
      });
    }

    function onRemove(scope, element, options) {
      element.off(SWIPE_EVENTS, options.onSwipe);
      if (options.parent) options.parent.addClass('md-toast-animating');
      if (options.openClass) options.parent.removeClass(options.openClass);

      return ((options.$destroy == true) ? element.remove() : $animate.leave(element))
        .then(function () {
          if (options.parent) options.parent.removeClass('md-toast-animating');
          if ($mdUtil.hasComputedStyle(options.parent, 'position', 'static')) {
            options.parent.css('position', '');
          }
        });
    }

    function toastOpenClass(position) {
      if (!$mdMedia('gt-sm')) {
        return 'md-toast-open-bottom';
      }

      return 'md-toast-open-' +
        (position.indexOf('top') > -1 ? 'top' : 'bottom');
    }
  }

}
