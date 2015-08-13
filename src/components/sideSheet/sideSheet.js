/**
 * @ngdoc module
 * @name material.components.sideSheet
 * @description
 * SideSheet
 */
angular.module('material.components.sideSheet', [
    'material.core',
    'material.components.backdrop'
])
    .provider('$mdSideSheet', MdSideSheetProvider)
    .directive('mdSideSheet', MdSideSheetDirective)
    .directive('mdSideSheetFocus', MdSideSheetFocusDirective);

function MdSideSheetDirective() {
    return {
        restrict: 'E',
        controller: function () {
        }
    };
}

/**
 * @ngdoc service
 * @name $mdSideSheet
 * @module material.components.sideSheet
 *
 * @description
 * `$mdSideSheet` opens a side sheet over the app and provides a simple promise API.
 *
 * ## Restrictions
 *
 * - The side sheet's template must have an outer `<md-side-sheet>` element.
 * - Add the `md-grid` class to the side sheet for a grid layout.
 * - Add the `md-list` class to the side sheet for a list layout.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <md-button ng-click="openSideSheet()">
 *     Open a Side Sheet!
 *   </md-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $mdSideSheet) {
 *   $scope.openSideSheet = function() {
 *     $mdSideSheet.show({
 *       template: '<md-side-sheet>Hello!</md-side-sheet>'
 *     });
 *   };
 * });
 * </hljs>
 */

/**
 * @ngdoc directive
 * @name mdSideSheetFocus
 * @module material.components.sideSheet
 *
 * @restrict A
 *
 * @description
 * `$mdSideSheetFocus` provides a way to specify the focused element when a sideSheet opens.
 * This is completely optional, as the sideSheet itself is focused by default.
 *
 * @usage
 * <hljs lang="html">
 * <md-side-sheet>
 *   <form>
 *     <md-input-container>
 *       <label for="testInput">Label</label>
 *       <input id="testInput" type="text" md-side-sheet-focus>
 *     </md-input-container>
 *   </form>
 * </md-side-sheet>
 * </hljs>
 **/
function MdSideSheetFocusDirective() {
    return {
        restrict: 'A',
        require: '^mdSideSheet',
        link: function () {
            // @see $mdUtil.findFocusTarget(...)
        }
    };
}

/**
 * @ngdoc method
 * @name $mdSideSheet#show
 *
 * @description
 * Show a side sheet with the specified options.
 *
 * @param {object} options An options object, with the following properties:
 *
 *   - `templateUrl` - `{string=}`: The url of an html template file that will
 *   be used as the content of the side sheet. Restrictions: the template must
 *   have an outer `md-side-sheet` element.
 *   - `template` - `{string=}`: Same as templateUrl, except this is an actual
 *   template string.
 *   - `targetEvent` - `{DOMClickEvent=}`: A click's event object. When passed in as an option,
 *   the location of the click will be used as the starting point for the opening animation
 *   of the the dialog.
 *   - `scope` - `{object=}`: the scope to link the template / controller to. If none is specified, it will create a new child scope.
 *     This scope will be destroyed when the side sheet is removed unless `preserveScope` is set to true.
 *   - `preserveScope` - `{boolean=}`: whether to preserve the scope when the element is removed. Default is false
 *   - `disableParentScroll` - `{boolean=}`: Whether to disable scrolling while the side sheet is open.
 *   - `controller` - `{string=}`: The controller to associate with this side sheet.
 *   - `locals` - `{object=}`: An object containing key/value pairs. The keys will be used as names of values to inject
 *   into the controller.  For example, `locals: {three: 3}` would inject `three` into the controller, with the value 3.
 *   If `bindToController` is true, they will be copied to the controller instead.
 *   - `bindToController` - `{boolean=}`: binds the locals to the controller, instead of passing them in.
 *   These values will not be available until after initialization.
 *   - `resolve` - `{object=}`: Similar to locals, except it takes promises as values
 *   and the side sheet will not open until the promises resolve.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the scope.
 *   - `parent` - `{element=}`: The element to append the side sheet to. The `parent` may be a `function`, `string`,
 *   `object`, or null. Defaults to appending to the body of the root element (or the root element) of the application.
 *   e.g. angular.element(document.getElementById('content')) or "#content"
 *   - `hasBackDrop` - `{boolean=}`: Whether the side sheet has a backdrop.
 *     Default false.
 *   - `clickOutsideToClose` - `{boolean=}`: Whether clicking anywhere outside the sheet to close it.
 *     Default true.
 *   - `escapeToClose` - `{boolean=}`: Whether the user can press escape to close the dialog. Default true.
 *     Default false.
 *   - `side` - `{string=}`: Which side the side sheet opens on. Values are 'left', 'right' or 'auto.
 *     Default auto.
 *
 * @returns {promise} A promise that can be resolved with `$mdSideSheet.hide()` or
 * rejected with `$mdSideSheet.cancel()`.
 */

/**
 * @ngdoc method
 * @name $mdSideSheet#hide
 *
 * @description
 * Hide the existing side sheet and resolve the promise returned from
 * `$mdSideSheet.show()`. This call will close the most recently opened/current sidesheet (if any).
 *
 * @param {*=} response An argument for the resolved promise.
 *
 */

/**
 * @ngdoc method
 * @name $mdSideSheet#cancel
 *
 * @description
 * Hide the existing side sheet and reject the promise returned from
 * `$mdSideSheet.show()`.
 *
 * @param {*=} response An argument for the rejected promise.
 *
 */

function MdSideSheetProvider($$interimElementProvider) {
    // how fast we need to flick left or right to close the sheet, pixels/ms
    var CLOSING_VELOCITY = 0.5;
    var PADDING = 80; // same as css

    return $$interimElementProvider('$mdSideSheet')
        .setDefaults({
            methods: ['disableParentScroll', 'escapeToClose', 'targetEvent'],
            options: sideSheetDefaults
        });

    /* @ngInject */
    function sideSheetDefaults($timeout, $animate, $mdConstant, $mdUtil, $mdTheming, $mdSideSheet, $rootElement, $mdGesture) {
        var backdrop;

        return {
            themable: true,
            targetEvent: null,
            onShow: onShow,
            onRemove: onRemove,
            escapeToClose: false,
            disableParentScroll: true,
            hasBackdrop: false,
            clickOutsideToClose: true,
            side: 'auto'
        };

        function onShow(scope, element, options) {

            element = $mdUtil.extractElementByName(element, 'md-side-sheet');
            var focusEl = $mdUtil.findFocusTarget(element) || $mdUtil.findFocusTarget(element, '[md-side-sheet-focus]') || element;

            // Left, Right or Auto?
            var sideClass;
            if ('left' === options.side.toLowerCase()) {
                sideClass = 'md-side-sheet-left';
            } else if ('right' === options.side.toLowerCase()) {
                sideClass = 'md-side-sheet-right';
            } else if (options.targetEvent) {
                if (options.targetEvent) {
                    sideClass = options.targetEvent.pageX > (options.targetEvent.view.innerWidth / 2)
                        ? 'md-side-sheet-left' : sideClass = 'md-side-sheet-right';
                } else {
                    sideClass = 'md-side-sheet-left';
                }
            }

            element.addClass(sideClass);

            // Add a backdrop that will close on click
            if (options.hasBackdrop) {
                backdrop = $mdUtil.createBackdrop(scope, 'md-side-sheet-backdrop md-opaque');

                if (options.clickOutsideToClose) {
                    backdrop.on('click', function () {
                        $mdUtil.nextTick($mdSideSheet.cancel, true);
                    });
                }

                $mdTheming.inherit(backdrop, options.parent);

                $animate.enter(backdrop, options.parent);
            }

            var sideSheet = new SideSheet(element, options.parent);
            options.sideSheet = sideSheet;

            // Give up focus on calling item
            options.targetEvent && angular.element(options.targetEvent.target).blur();
            $mdTheming.inherit(sideSheet.element, options.parent);

            if (options.disableParentScroll) {
                options.lastOverflow = options.parent.css('overflow');
                options.parent.css('overflow', 'hidden');
            }

            $animate.enter(sideSheet.element, options.parent).then(function () {

                if (options.escapeToClose) {
                    options.rootElementKeyupCallback = function (e) {
                        if (e.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
                            $mdUtil.nextTick($mdSideSheet.cancel, true);
                        }
                    };
                    $rootElement.on('keyup', options.rootElementKeyupCallback);
                }

                if (focusEl) {

                    $timeout(function () {
                        focusEl.focus();
                    }, 50);

                } else {
                    var focusable = angular.element(
                        element[0].querySelector('button') ||
                        element[0].querySelector('a') ||
                        element[0].querySelector('[ng-click]')
                    );
                    focusable.focus();
                }
            });
        }

        function onRemove(scope, element, options) {

            var sideSheet = options.sideSheet;

            if (options.hasBackdrop) {
                $animate.leave(backdrop);
            }

            return $animate.leave(sideSheet.element).then(function () {
                if (options.disableParentScroll) {
                    options.parent.css('overflow', options.lastOverflow);
                    delete options.lastOverflow;
                }

                //sideSheet.cleanup();

                // Restore focus
                options.targetEvent && angular.element(options.targetEvent.target).focus();
            });
        }

        /**
         * SideSheet class to apply side-sheet behavior to an element
         */
        function SideSheet(element) {
            return {
                element: element
            };

        }

        //function SideSheet(element, parent) {
        //    var deregister = $mdGesture.register(parent, 'drag', {horizontal: true, vertical: false});
        //    parent.on('$md.dragstart', onDragStart)
        //        .on('$md.drag', onDrag)
        //        .on('$md.dragend', onDragEnd);
        //
        //    return {
        //        element: element,
        //        cleanup: function cleanup() {
        //            deregister();
        //            parent.off('$md.dragstart', onDragStart)
        //                .off('$md.drag', onDrag)
        //                .off('$md.dragend', onDragEnd);
        //        }
        //    };
        //
        //    function onDragStart(ev) {
        //        // Disable transitions on transform so that it feels fast
        //        element.css($mdConstant.CSS.TRANSITION_DURATION, '0ms');
        //    }
        //
        //    function onDrag(ev) {
        //        var transform = ev.pointer.distanceX;
        //        if (transform < 5) {
        //            // Slow down drag when trying to drag up, and stop after PADDING
        //            transform = Math.max(-PADDING, transform / 2);
        //        }
        //        element.css($mdConstant.CSS.TRANSFORM, 'translate3d(' + (PADDING + transform) + 'px,0,0)');
        //    }
        //
        //    function onDragEnd(ev) {
        //        if (ev.pointer.distanceX > 0 &&
        //            (ev.pointer.distanceX > 20 || Math.abs(ev.pointer.velocityX) > CLOSING_VELOCITY)) {
        //            var distanceRemaining = element.prop('offsetWidth') - ev.pointer.distanceX;
        //            var transitionDuration = Math.min(distanceRemaining / ev.pointer.velocityX * 0.75, 500);
        //            element.css($mdConstant.CSS.TRANSITION_DURATION, transitionDuration + 'ms');
        //            $mdUtil.nextTick($mdSideSheet.cancel, true);
        //        } else {
        //            element.css($mdConstant.CSS.TRANSITION_DURATION, '');
        //            element.css($mdConstant.CSS.TRANSFORM, '');
        //        }
        //    }
        //}
    }
}
