/**
 * @ngdoc module
 * @name material.components.dialog
 */
angular.module('material.components.dialog', [
  'material.core',
  'material.components.backdrop'
])
  .directive('mdDialog', MdDialogDirective)
  .provider('$mdDialog', MdDialogProvider);

function MdDialogDirective($$rAF, $mdTheming) {
  return {
    restrict: 'E',
    link: function (scope, element, attr) {
      $mdTheming(element);
      $$rAF(function () {
        var images;
        var content = element[0].querySelector('md-dialog-content');

        if (content) {
          images = content.getElementsByTagName('img');
          addOverflowClass();
          //-- delayed image loading may impact scroll height, check after images are loaded
          angular.element(images).on('load', addOverflowClass);
        }
        function addOverflowClass () {
          element.toggleClass('md-content-overflow', content.scrollHeight > content.clientHeight);
        }
      });
    }
  };
}

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
 *   - `targetEvent` - `{DOMClickEvent=}`: A click's event object. When passed in as an option,
 *     the location of the click will be used as the starting point for the opening animation
 *     of the the dialog.
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
 *   - `onComplete` `{function=}`: Callback function used to announce when the show() action is
 *     finished.
 *   - `onRemoving` `{function=} Callback function used to announce the close/hide() action is
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

  return $$interimElementProvider('$mdDialog')
    .setDefaults({
      methods: ['disableParentScroll', 'hasBackdrop', 'clickOutsideToClose', 'escapeToClose', 'targetEvent', 'parent'],
      options: dialogDefaultOptions
    })
    .addPreset('alert', {
      methods: ['title', 'content', 'ariaLabel', 'ok', 'theme'],
      options: advancedDialogOptions
    })
    .addPreset('confirm', {
      methods: ['title', 'content', 'ariaLabel', 'ok', 'cancel', 'theme'],
      options: advancedDialogOptions
    });

  /* @ngInject */
  function advancedDialogOptions($mdDialog, $mdTheming) {
    return {
      template: [
        '<md-dialog md-theme="{{ dialog.theme }}" aria-label="{{ dialog.ariaLabel }}">',
        ' <md-dialog-content role="document" tabIndex="-1">',
        '   <h2 class="md-title">{{ dialog.title }}</h2>',
        '   <p>{{ dialog.content }}</p>',
        ' </md-dialog-content>',
        ' <div class="md-actions">',
        '   <md-button ng-if="dialog.$type == \'confirm\'"' +
        '     ng-click="dialog.abort()" class="md-primary">',
        '     {{ dialog.cancel }}',
        '   </md-button>',
        '   <md-button ng-click="dialog.hide()" class="md-primary">',
        '     {{ dialog.ok }}',
        '   </md-button>',
        ' </div>',
        '</md-dialog>'
      ].join('').replace(/\s\s+/g,''),
      controller: function mdDialogCtrl() {
        this.hide = function () { $mdDialog.hide(true); };
        this.abort = function (){ $mdDialog.cancel(); };
      },
      controllerAs: 'dialog',
      bindToController: true,
      theme: $mdTheming.defaultTheme()
    };
  }

  /* @ngInject */
  function dialogDefaultOptions($mdAria, $document, $mdUtil, $mdConstant, $mdTheming, $mdDialog, $animate, $q ) {

    return {
      hasBackdrop: true,
      isolateScope: true,
      onShow: onShow,
      onRemove: onRemove,
      clickOutsideToClose: false,
      escapeToClose: true,
      targetEvent: null,
      focusOnOpen: true,
      disableParentScroll: true,
      transformTemplate: function (template) {
        return '<div class="md-dialog-container">' + template + '</div>';
      }
    };

    /**
     * Show method for dialogs
     */
    function onShow(scope, element, options) {
      element = $mdUtil.extractElementByName(element, 'md-dialog');
      angular.element($document[0].body).addClass('md-dialog-is-showing');

      captureSourceAndParent(element, options);
      configureAria(element.find('md-dialog'), options);
      showBackdrop(element, options);

      return dialogPopIn(element, options)
        .then(function () {
          activateListeners(element, options);
          lockScreenReader(element, options);
          focusOnOpen();
        });

      function focusOnOpen() {
        if (options.focusOnOpen) {
          var target = (options.$type === 'alert') ? element.find('md-dialog-content') : findCloseButton();
          target.focus();
        }

        function findCloseButton() {
          //If no element with class dialog-close, try to find the last
          //button child in md-actions and assume it is a close button
          var closeButton = element[0].querySelector('.dialog-close');
          if (!closeButton) {
            var actionButtons = element[0].querySelectorAll('.md-actions button');
            closeButton = actionButtons[actionButtons.length - 1];
          }
          return angular.element(closeButton);
        }
      }

    }

    /**
     * Remove function for all dialogs
     */
    function onRemove(scope, element, options) {
      angular.element($document[0].body).removeClass('md-dialog-is-showing');

      options.deactivateListeners();
      options.unlockScreenReader();
      options.hideBackdrop();

      return dialogPopOut(element, options)
        .then(function () {
          element.remove();
          options.origin.focus();
        });
    }

    function captureSourceAndParent(element, options) {
         options.origin = {
           element: null,
           bounds: null,
           focus: angular.noop
         };

         var source = angular.element((options.targetEvent || {}).target);
         if (source && source.length) {
           // Compute and save the target element's bounding rect, so that if the
           // element is hidden when the dialog closes, we can shrink the dialog
           // back to the same position it expanded from.
           options.origin.element = source;
           options.origin.bounds = source[0].getBoundingClientRect();
           options.origin.focus = function () {
             source.focus();
           }
         }

         // In case the user provides a raw dom element, always wrap it in jqLite
         options.parent = angular.element(options.parent);

         if (options.disableParentScroll) {
           options.restoreScroll = $mdUtil.disableScrollAround(element);
         }
       }

    /**
     * Listen for escape keys and outside clicks to auto close
     */
    function activateListeners(element, options) {
      var removeListeners = [ ];

      if (options.escapeToClose) {
        var target = options.parent;
        var keyHandlerFn = function (ev) {
              if (ev.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
                ev.stopPropagation();
                ev.preventDefault();

                $mdUtil.nextTick($mdDialog.cancel);
              }
            };

        // Add keyup listeners
        element.on('keyup', keyHandlerFn);
        target.on('keyup', keyHandlerFn);

        // Queue remove listeners function
        removeListeners.push(function() {
          element.off('keyup', keyHandlerFn);
          target.off('keyup', keyHandlerFn);
        });
      }
      if (options.clickOutsideToClose) {
        var target = element;
        var clickHandler = function (ev) {
              // Only close if we click the flex container outside the backdrop
              if (ev.target === target[0]) {
                ev.stopPropagation();
                ev.preventDefault();

                $mdUtil.nextTick($mdDialog.cancel);
              }
            };

        // Add click listeners
        target.on('click', clickHandler);

        // Queue remove listeners function
        removeListeners.push(function(){
          target.off('click',clickHandler);
        });
      }

      // Attach specific `remove` listener handler
      options.deactivateListeners = function() {
        removeListeners.forEach(function(removeFn){
          removeFn();
        });
        options.deactivateListeners = null;
      };
    }


    /**
     * Show modal backdrop element...
     */
    function showBackdrop(element, options) {

      if (options.hasBackdrop) {
        // Fix for IE 10
        var docElement = $document[0].documentElement;
        var hasScrollTop = (options.parent[0] == $document[0].body) && (docElement && docElement.scrollTop);
        var computeFrom = hasScrollTop ? angular.element(docElement) : options.parent;
        var parentOffset = computeFrom.prop('scrollTop');

        element.css('top', parentOffset + 'px');

        options.backdrop = angular.element('<md-backdrop class="md-dialog-backdrop md-opaque">');
        options.backdrop.css('top', parentOffset + 'px');
        $mdTheming.inherit(options.backdrop, options.parent);

        $animate.enter(options.backdrop, options.parent);
      }

      /**
       * Hide modal backdrop element...
       */
      options.hideBackdrop = function hideBackdrop() {
        if (options.backdrop) {
          $animate.leave(options.backdrop);
        }
        if (options.disableParentScroll) {
          options.restoreScroll();
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
        $mdAria.expectAsync(element, 'aria-label', function () {
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
     *  Dialog open and pop-in animation
     */
    function dialogPopIn(container, options ) {
      options.parent.append(container);

      var animator = $mdUtil.dom.animator ;
      var buildTranslateToOrigin = animator.calculateZoomToOrigin;
      var translateOptions = { transitionInClass :'md-transition-in' , transitionOutClass : 'md-transition-out' };

      var dialogEl = container.find('md-dialog');
      var from = animator.toTransformCss( buildTranslateToOrigin(dialogEl, options.origin) );
      var to = animator.toTransformCss("");  // defaults to center display (or parent or $rootElement)

      return animator
         .translate3d(dialogEl,from,to,translateOptions)
         .then(function(animateReversal){
           // Build a reversal translate function synched to this translation...
           options.reverseAnimate = function() {

             delete options.reverseAnimate;
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
