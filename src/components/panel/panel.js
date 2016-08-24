/**
 * @ngdoc module
 * @name material.components.panel
 */
angular
    .module('material.components.panel', [
      'material.core',
      'material.components.backdrop'
    ])
    .service('$mdPanel', MdPanelService);


/*****************************************************************************
 *                            PUBLIC DOCUMENTATION                           *
 *****************************************************************************/

/**
 * @ngdoc service
 * @name $mdPanel
 * @module material.components.panel
 *
 * @description
 * `$mdPanel` is a robust, low-level service for creating floating panels on
 * the screen. It can be used to implement tooltips, dialogs, pop-ups, etc.
 *
 * @usage
 * <hljs lang="js">
 * (function(angular, undefined) {
 *   ‘use strict’;
 *
 *   angular
 *       .module('demoApp', ['ngMaterial'])
 *       .controller('DemoDialogController', DialogController);
 *
 *   var panelRef;
 *
 *   function showPanel($event) {
 *     var panelPosition = $mdPanel.newPanelPosition()
 *         .absolute()
 *         .top('50%')
 *         .left('50%');
 *
 *     var panelAnimation = $mdPanel.newPanelAnimation()
 *         .targetEvent($event)
 *         .defaultAnimation('md-panel-animate-fly')
 *         .closeTo('.show-button');
 *
 *     var config = {
 *       attachTo: angular.element(document.body),
 *       controller: DialogController,
 *       controllerAs: 'ctrl',
 *       position: panelPosition,
 *       animation: panelAnimation,
 *       targetEvent: $event,
 *       templateUrl: 'dialog-template.html',
 *       clickOutsideToClose: true,
 *       escapeToClose: true,
 *       focusOnOpen: true
 *     }
 *
 *     $mdPanel.open(config)
 *         .then(function(result) {
 *           panelRef = result;
 *         });
 *   }
 *
 *   function DialogController(MdPanelRef, toppings) {
 *     var toppings;
 *
 *     function closeDialog() {
 *       MdPanelRef && MdPanelRef.close();
 *     }
 *   }
 * })(angular);
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdPanel#create
 * @description
 * Creates a panel with the specified options.
 *
 * @param config {!Object=} Specific configuration object that may contain the
 *     following properties:
 *
 *   - `id` - `{string=}`: An ID to track the panel by. When an ID is provided,
 *     the created panel is added to a tracked panels object. Any subsequent
 *     requests made to create a panel with that ID are ignored. This is useful
 *     in having the panel service not open multiple panels from the same user
 *     interaction when there is no backdrop and events are propagated. Defaults
 *     to an arbitrary string that is not tracked.
 *   - `template` - `{string=}`: HTML template to show in the panel. This
 *     **must** be trusted HTML with respect to Angular’s
 *     [$sce service](https://docs.angularjs.org/api/ng/service/$sce).
 *   - `templateUrl` - `{string=}`: The URL that will be used as the content of
 *     the panel.
 *   - `controller` - `{(function|string)=}`: The controller to associate with
 *     the panel. The controller can inject a reference to the returned
 *     panelRef, which allows the panel to be closed, hidden, and shown. Any
 *     fields passed in through locals or resolve will be bound to the
 *     controller.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on
 *     the scope.
 *   - `bindToController` - `{boolean=}`: Binds locals to the controller
 *     instead of passing them in. Defaults to true, as this is a best
 *     practice.
 *   - `locals` - `{Object=}`: An object containing key/value pairs. The keys
 *     will be used as names of values to inject into the controller. For
 *     example, `locals: {three: 3}` would inject `three` into the controller,
 *     with the value 3.
 *   - `resolve` - `{Object=}`: Similar to locals, except it takes promises as
 *     values. The panel will not open until all of the promises resolve.
 *   - `attachTo` - `{(string|!angular.JQLite|!Element)=}`: The element to
 *     attach the panel to. Defaults to appending to the root element of the
 *     application.
 *   - `propagateContainerEvents` - `{boolean=}`: Whether pointer or touch
 *     events should be allowed to propagate 'go through' the container, aka the
 *     wrapper, of the panel. Defaults to false.
 *   - `panelClass` - `{string=}`: A css class to apply to the panel element.
 *     This class should define any borders, box-shadow, etc. for the panel.
 *   - `zIndex` - `{number=}`: The z-index to place the panel at.
 *     Defaults to 80.
 *   - `position` - `{MdPanelPosition=}`: An MdPanelPosition object that
 *     specifies the alignment of the panel. For more information, see
 *     `MdPanelPosition`.
 *   - `clickOutsideToClose` - `{boolean=}`: Whether the user can click
 *     outside the panel to close it. Defaults to false.
 *   - `escapeToClose` - `{boolean=}`: Whether the user can press escape to
 *     close the panel. Defaults to false.
 *   - `trapFocus` - `{boolean=}`: Whether focus should be trapped within the
 *     panel. If `trapFocus` is true, the user will not be able to interact
 *     with the rest of the page until the panel is dismissed. Defaults to
 *     false.
 *   - `focusOnOpen` - `{boolean=}`: An option to override focus behavior on
 *     open. Only disable if focusing some other way, as focus management is
 *     required for panels to be accessible. Defaults to true.
 *   - `fullscreen` - `{boolean=}`: Whether the panel should be full screen.
 *     Applies the class `._md-panel-fullscreen` to the panel on open. Defaults
 *     to false.
 *   - `animation` - `{MdPanelAnimation=}`: An MdPanelAnimation object that
 *     specifies the animation of the panel. For more information, see
 *     `MdPanelAnimation`.
 *   - `hasBackdrop` - `{boolean=}`: Whether there should be an opaque backdrop
 *     behind the panel. Defaults to false.
 *   - `disableParentScroll` - `{boolean=}`: Whether the user can scroll the
 *     page behind the panel. Defaults to false.
 *   - `onDomAdded` - `{function=}`: Callback function used to announce when
 *     the panel is added to the DOM.
 *   - `onOpenComplete` - `{function=}`: Callback function used to announce
 *     when the open() action is finished.
 *   - `onRemoving` - `{function=}`: Callback function used to announce the
 *     close/hide() action is starting.
 *   - `onDomRemoved` - `{function=}`: Callback function used to announce when
 *     the panel is removed from the DOM.
 *   - `origin` - `{(string|!angular.JQLite|!Element)=}`: The element to focus
 *     on when the panel closes. This is commonly the element which triggered
 *     the opening of the panel. If you do not use `origin`, you need to control
 *     the focus manually.
 *
 * @returns {!MdPanelRef} panelRef
 */


/**
 * @ngdoc method
 * @name $mdPanel#open
 * @description
 * Calls the create method above, then opens the panel. This is a shortcut for
 * creating and then calling open manually. If custom methods need to be
 * called when the panel is added to the DOM or opened, do not use this method.
 * Instead create the panel, chain promises on the domAdded and openComplete
 * methods, and call open from the returned panelRef.
 *
 * @param {!Object=} config Specific configuration object that may contain
 *     the properties defined in `$mdPanel.create`.
 * @returns {!angular.$q.Promise<!MdPanelRef>} panelRef A promise that resolves
 *     to an instance of the panel.
 */


/**
 * @ngdoc method
 * @name $mdPanel#newPanelPosition
 * @description
 * Returns a new instance of the MdPanelPosition object. Use this to create
 * the position config object.
 *
 * @returns {!MdPanelPosition} panelPosition
 */


/**
 * @ngdoc method
 * @name $mdPanel#newPanelAnimation
 * @description
 * Returns a new instance of the MdPanelAnimation object. Use this to create
 * the animation config object.
 *
 * @returns {!MdPanelAnimation} panelAnimation
 */


/*****************************************************************************
 *                                 MdPanelRef                                *
 *****************************************************************************/


/**
 * @ngdoc type
 * @name MdPanelRef
 * @module material.components.panel
 * @description
 * A reference to a created panel. This reference contains a unique id for the
 * panel, along with the following properties:
 *
 *   - `id` - `{string}`: The unique id for the panel. This id is used to track
 *     when a panel was interacted with.
 *   - `config` - `{!Object=}`: The entire config object that was used in
 *     create.
 *   - `isAttached` - `{boolean}`: Whether the panel is attached to the DOM.
 *     Visibility to the user does not factor into isAttached.
 *   - `panelContainer` - `{angular.JQLite}`: The wrapper element containing the
 *     panel. This property is added in order to have access to the `addClass`,
 *     `removeClass`, `toggleClass`, etc methods.
 *   - `panelEl` - `{angular.JQLite}`: The panel element. This property is added
 *     in order to have access to the `addClass`, `removeClass`, `toggleClass`,
 *     etc methods.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#open
 * @description
 * Attaches and shows the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 *     opened.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#close
 * @description
 * Hides and detaches the panel. Note that this will **not** destroy the panel.
 * If you don't intend on using the panel again, call the {@link #destroy
 * destroy} method afterwards.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 *     closed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#attach
 * @description
 * Create the panel elements and attach them to the DOM. The panel will be
 * hidden by default.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 *     attached.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#detach
 * @description
 * Removes the panel from the DOM. This will NOT hide the panel before removing
 * it.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 *     detached.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#show
 * @description
 * Shows the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 *     shown and animations are completed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#hide
 * @description
 * Hides the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 *     hidden and animations are completed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#destroy
 * @description
 * Destroys the panel. The panel cannot be opened again after this is called.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#addClass
 * @deprecated
 * This method is in the process of being deprecated in favor of using the panel
 * and container JQLite elements that are referenced in the MdPanelRef object.
 * Full deprecation is scheduled for material 1.2.
 * @description
 * Adds a class to the panel. DO NOT use this hide/show the panel.
 *
 * @param {string} newClass class to be added.
 * @param {boolean} toElement Whether or not to add the class to the panel
 *     element instead of the container.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#removeClass
 * @deprecated
 * This method is in the process of being deprecated in favor of using the panel
 * and container JQLite elements that are referenced in the MdPanelRef object.
 * Full deprecation is scheduled for material 1.2.
 * @description
 * Removes a class from the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} oldClass Class to be removed.
 * @param {boolean} fromElement Whether or not to remove the class from the
 *     panel element instead of the container.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#toggleClass
 * @deprecated
 * This method is in the process of being deprecated in favor of using the panel
 * and container JQLite elements that are referenced in the MdPanelRef object.
 * Full deprecation is scheduled for material 1.2.
 * @description
 * Toggles a class on the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} toggleClass Class to be toggled.
 * @param {boolean} onElement Whether or not to remove the class from the panel
 *     element instead of the container.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#updatePosition
 * @description
 * Updates the position configuration of a panel. Use this to update the
 * position of a panel that is open, without having to close and re-open the
 * panel.
 *
 * @param {!MdPanelPosition} position
 */


/*****************************************************************************
 *                               MdPanelPosition                            *
 *****************************************************************************/


/**
 * @ngdoc type
 * @name MdPanelPosition
 * @module material.components.panel
 * @description
 *
 * Object for configuring the position of the panel.
 *
 * @usage
 *
 * #### Centering the panel
 *
 * <hljs lang="js">
 * new MdPanelPosition().absolute().center();
 * </hljs>
 *
 * #### Overlapping the panel with an element
 *
 * <hljs lang="js">
 * new MdPanelPosition()
 *     .relativeTo(someElement)
 *     .addPanelPosition(
 *       $mdPanel.xPosition.ALIGN_START,
 *       $mdPanel.yPosition.ALIGN_TOPS
 *     );
 * </hljs>
 *
 * #### Aligning the panel with the bottom of an element
 *
 * <hljs lang="js">
 * new MdPanelPosition()
 *     .relativeTo(someElement)
 *     .addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.BELOW);
 * </hljs>
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#absolute
 * @description
 * Positions the panel absolutely relative to the parent element. If the parent
 * is document.body, this is equivalent to positioning the panel absolutely
 * within the viewport.
 *
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#relativeTo
 * @description
 * Positions the panel relative to a specific element.
 *
 * @param {string|!Element|!angular.JQLite} element Query selector, DOM element,
 *     or angular element to position the panel with respect to.
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#top
 * @description
 * Sets the value of `top` for the panel. Clears any previously set vertical
 * position.
 *
 * @param {string=} top Value of `top`. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#bottom
 * @description
 * Sets the value of `bottom` for the panel. Clears any previously set vertical
 * position.
 *
 * @param {string=} bottom Value of `bottom`. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#start
 * @description
 * Sets the panel to the start of the page - `left` if `ltr` or `right` for
 * `rtl`. Clears any previously set horizontal position.
 *
 * @param {string=} start Value of position. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#end
 * @description
 * Sets the panel to the end of the page - `right` if `ltr` or `left` for `rtl`.
 * Clears any previously set horizontal position.
 *
 * @param {string=} end Value of position. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#left
 * @description
 * Sets the value of `left` for the panel. Clears any previously set
 * horizontal position.
 *
 * @param {string=} left Value of `left`. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#right
 * @description
 * Sets the value of `right` for the panel. Clears any previously set
 * horizontal position.
 *
 * @param {string=} right Value of `right`. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#centerHorizontally
 * @description
 * Centers the panel horizontally in the viewport. Clears any previously set
 * horizontal position.
 *
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#centerVertically
 * @description
 * Centers the panel vertically in the viewport. Clears any previously set
 * vertical position.
 *
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#center
 * @description
 * Centers the panel horizontally and vertically in the viewport. This is
 * equivalent to calling both `centerHorizontally` and `centerVertically`.
 * Clears any previously set horizontal and vertical positions.
 *
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#addPanelPosition
 * @description
 * Sets the x and y position for the panel relative to another element. Can be
 * called multiple times to specify an ordered list of panel positions. The
 * first position which allows the panel to be completely on-screen will be
 * chosen; the last position will be chose whether it is on-screen or not.
 *
 * xPosition must be one of the following values available on
 * $mdPanel.xPosition:
 *
 * CENTER | ALIGN_START | ALIGN_END | OFFSET_START | OFFSET_END
 *
 *    *************
 *    *           *
 *    *   PANEL   *
 *    *           *
 *    *************
 *   A B    C    D E
 *
 * A: OFFSET_START (for LTR displays)
 * B: ALIGN_START (for LTR displays)
 * C: CENTER
 * D: ALIGN_END (for LTR displays)
 * E: OFFSET_END (for LTR displays)
 *
 * yPosition must be one of the following values available on
 * $mdPanel.yPosition:
 *
 * CENTER | ALIGN_TOPS | ALIGN_BOTTOMS | ABOVE | BELOW
 *
 *   F
 *   G *************
 *     *           *
 *   H *   PANEL   *
 *     *           *
 *   I *************
 *   J
 *
 * F: BELOW
 * G: ALIGN_TOPS
 * H: CENTER
 * I: ALIGN_BOTTOMS
 * J: ABOVE
 *
 * @param {string} xPosition
 * @param {string} yPosition
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#withOffsetX
 * @description
 * Sets the value of the offset in the x-direction.
 *
 * @param {string} offsetX
 * @returns {!MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#withOffsetY
 * @description
 * Sets the value of the offset in the y-direction.
 *
 * @param {string} offsetY
 * @returns {!MdPanelPosition}
 */


/*****************************************************************************
 *                               MdPanelAnimation                            *
 *****************************************************************************/


/**
 * @ngdoc object
 * @name MdPanelAnimation
 * @description
 * Animation configuration object. To use, create an MdPanelAnimation with the
 * desired properties, then pass the object as part of $mdPanel creation.
 *
 * Example:
 *
 * var panelAnimation = new MdPanelAnimation()
 *     .openFrom(myButtonEl)
 *     .closeTo('.my-button')
 *     .withAnimation($mdPanel.animation.SCALE);
 *
 * $mdPanel.create({
 *   animation: panelAnimation
 * });
 */

/**
 * @ngdoc method
 * @name MdPanelAnimation#openFrom
 * @description
 * Specifies where to start the open animation. `openFrom` accepts a
 * click event object, query selector, DOM element, or a Rect object that
 * is used to determine the bounds. When passed a click event, the location
 * of the click will be used as the position to start the animation.
 *
 * @param {string|!Element|!Event|{top: number, left: number}}
 * @returns {!MdPanelAnimation}
 */

/**
 * @ngdoc method
 * @name MdPanelAnimation#closeTo
 * @description
 * Specifies where to animate the panel close. `closeTo` accepts a
 * query selector, DOM element, or a Rect object that is used to determine
 * the bounds.
 *
 * @param {string|!Element|{top: number, left: number}}
 * @returns {!MdPanelAnimation}
 */

/**
 * @ngdoc method
 * @name MdPanelAnimation#withAnimation
 * @description
 * Specifies the animation class.
 *
 * There are several default animations that can be used:
 * ($mdPanel.animation)
 *   SLIDE: The panel slides in and out from the specified
 *       elements. It will not fade in or out.
 *   SCALE: The panel scales in and out. Slide and fade are
 *       included in this animation.
 *   FADE: The panel fades in and out.
 *
 * Custom classes will by default fade in and out unless
 * "transition: opacity 1ms" is added to the to custom class.
 *
 * @param {string|{open: string, close: string}} cssClass
 * @returns {!MdPanelAnimation}
 */


/*****************************************************************************
 *                                IMPLEMENTATION                             *
 *****************************************************************************/


// Default z-index for the panel.
var defaultZIndex = 80;
var MD_PANEL_HIDDEN = '_md-panel-hidden';

var FOCUS_TRAP_TEMPLATE = angular.element(
    '<div class="_md-panel-focus-trap" tabindex="0"></div>');


/**
 * A service that is used for controlling/displaying panels on the screen.
 * @param {!angular.JQLite} $rootElement
 * @param {!angular.Scope} $rootScope
 * @param {!angular.$injector} $injector
 * @param {!angular.$window} $window
 * @final @constructor @ngInject
 */
function MdPanelService($rootElement, $rootScope, $injector, $window) {
  /**
   * Default config options for the panel.
   * Anything angular related needs to be done later. Therefore
   *     scope: $rootScope.$new(true),
   *     attachTo: $rootElement,
   * are added later.
   * @private {!Object}
   */
  this._defaultConfigOptions = {
    bindToController: true,
    clickOutsideToClose: false,
    disableParentScroll: false,
    escapeToClose: false,
    focusOnOpen: true,
    fullscreen: false,
    hasBackdrop: false,
    propagateContainerEvents: false,
    transformTemplate: angular.bind(this, this._wrapTemplate),
    trapFocus: false,
    zIndex: defaultZIndex
  };

  /** @private {!Object} */
  this._config = {};

  /** @private @const */
  this._$rootElement = $rootElement;

  /** @private @const */
  this._$rootScope = $rootScope;

  /** @private @const */
  this._$injector = $injector;

  /** @private @const */
  this._$window = $window;

  /** @private {!Object<string, !MdPanelRef>} */
  this._trackedPanels = {};

  /**
   * Default animations that can be used within the panel.
   * @type {enum}
   */
  this.animation = MdPanelAnimation.animation;

  /**
   * Possible values of xPosition for positioning the panel relative to
   * another element.
   * @type {enum}
   */
  this.xPosition = MdPanelPosition.xPosition;

  /**
   * Possible values of yPosition for positioning the panel relative to
   * another element.
   * @type {enum}
   */
  this.yPosition = MdPanelPosition.yPosition;
}


/**
 * Creates a panel with the specified options.
 * @param {!Object=} config Configuration object for the panel.
 * @returns {!MdPanelRef}
 */
MdPanelService.prototype.create = function(config) {
  config = config || {};

  // If the passed-in config contains an ID and the ID is within _trackedPanels,
  // return the tracked panel.
  if (angular.isDefined(config.id) && this._trackedPanels[config.id]) {
    return this._trackedPanels[config.id];
  }

  // If no ID is set within the passed-in config, then create an arbitrary ID.
  this._config = {
    id: config.id || 'panel_' + this._$injector.get('$mdUtil').nextUid(),
    scope: this._$rootScope.$new(true),
    attachTo: this._$rootElement
  };
  angular.extend(this._config, this._defaultConfigOptions, config);

  var panelRef = new MdPanelRef(this._config, this._$injector);
  this._trackedPanels[config.id] = panelRef;

  return panelRef;
};


/**
 * Creates and opens a panel with the specified options.
 * @param {!Object=} config Configuration object for the panel.
 * @returns {!angular.$q.Promise<!MdPanelRef>} The panel created from create.
 */
MdPanelService.prototype.open = function(config) {
  var panelRef = this.create(config);
  return panelRef.open().then(function() {
    return panelRef;
  });
};


/**
 * Returns a new instance of the MdPanelPosition. Use this to create the
 * positioning object.
 * @returns {!MdPanelPosition}
 */
MdPanelService.prototype.newPanelPosition = function() {
  return new MdPanelPosition(this._$injector);
};


/**
 * Returns a new instance of the MdPanelAnimation. Use this to create the
 * animation object.
 * @returns {!MdPanelAnimation}
 */
MdPanelService.prototype.newPanelAnimation = function() {
  return new MdPanelAnimation(this._$injector);
};


/**
 * Wraps the users template in two elements, md-panel-outer-wrapper, which
 * covers the entire attachTo element, and md-panel, which contains only the
 * template. This allows the panel control over positioning, animations,
 * and similar properties.
 * @param {string} origTemplate The original template.
 * @returns {string} The wrapped template.
 * @private
 */
MdPanelService.prototype._wrapTemplate = function(origTemplate) {
  var template = origTemplate || '';

  // The panel should be initially rendered offscreen so we can calculate
  // height and width for positioning.
  return '' +
      '<div class="md-panel-outer-wrapper">' +
      '  <div class="md-panel" style="left: -9999px;">' + template + '</div>' +
      '</div>';
};


/*****************************************************************************
 *                                 MdPanelRef                                *
 *****************************************************************************/


/**
 * A reference to a created panel. This reference contains a unique id for the
 * panel, along with properties/functions used to control the panel.
 * @param {!Object} config
 * @param {!angular.$injector} $injector
 * @final @constructor
 */
function MdPanelRef(config, $injector) {
  // Injected variables.
  /** @private @const {!angular.$q} */
  this._$q = $injector.get('$q');

  /** @private @const {!angular.$mdCompiler} */
  this._$mdCompiler = $injector.get('$mdCompiler');

  /** @private @const {!angular.$mdConstant} */
  this._$mdConstant = $injector.get('$mdConstant');

  /** @private @const {!angular.$mdUtil} */
  this._$mdUtil = $injector.get('$mdUtil');

  /** @private @const {!angular.Scope} */
  this._$rootScope = $injector.get('$rootScope');

  /** @private @const {!angular.$animate} */
  this._$animate = $injector.get('$animate');

  /** @private @const {!MdPanelRef} */
  this._$mdPanel = $injector.get('$mdPanel');

  /** @private @const {!angular.$log} */
  this._$log = $injector.get('$log');

  /** @private @const {!angular.$window} */
  this._$window = $injector.get('$window');

  /** @private @const {!Function} */
  this._$$rAF = $injector.get('$$rAF');

  // Public variables.
  /**
   * Unique id for the panelRef.
   * @type {string}
   */
  this.id = config.id;

  /** @type {!Object} */
  this.config = config;

  /** @type {!angular.JQLite|undefined} */
  this.panelContainer;

  /** @type {!angular.JQLite|undefined} */
  this.panelEl;

  /**
   * Whether the panel is attached. This is synchronous. When attach is called,
   * isAttached is set to true. When detach is called, isAttached is set to
   * false.
   * @type {boolean}
   */
  this.isAttached = false;

  // Private variables.
  /** @private {Array<function()>} */
  this._removeListeners = [];

  /** @private {!angular.JQLite|undefined} */
  this._topFocusTrap;

  /** @private {!angular.JQLite|undefined} */
  this._bottomFocusTrap;

  /** @private {!$mdPanel|undefined} */
  this._backdropRef;

  /** @private {Function?} */
  this._restoreScroll = null;
}


/**
 * Opens an already created and configured panel. If the panel is already
 * visible, does nothing.
 * @returns {!angular.$q.Promise<!MdPanelRef>} A promise that is resolved when
 *     the panel is opened and animations finish.
 */
MdPanelRef.prototype.open = function() {
  var self = this;
  return this._$q(function(resolve, reject) {
    var done = self._done(resolve, self);
    var show = self._simpleBind(self.show, self);

    self.attach()
        .then(show)
        .then(done)
        .catch(reject);
  });
};


/**
 * Closes the panel.
 * @returns {!angular.$q.Promise<!MdPanelRef>} A promise that is resolved when
 *     the panel is closed and animations finish.
 */
MdPanelRef.prototype.close = function() {
  var self = this;

  return this._$q(function(resolve, reject) {
    var done = self._done(resolve, self);
    var detach = self._simpleBind(self.detach, self);

    self.hide()
        .then(detach)
        .then(done)
        .catch(reject);
  });
};


/**
 * Attaches the panel. The panel will be hidden afterwards.
 * @returns {!angular.$q.Promise<!MdPanelRef>} A promise that is resolved when
 *     the panel is attached.
 */
MdPanelRef.prototype.attach = function() {
  if (this.isAttached && this.panelEl) {
    return this._$q.when(this);
  }

  var self = this;
  return this._$q(function(resolve, reject) {
    var done = self._done(resolve, self);
    var onDomAdded = self.config['onDomAdded'] || angular.noop;
    var addListeners = function(response) {
        self.isAttached = true;
        self._addEventListeners();
        return response;
    };

    self._$q.all([
        self._createBackdrop(),
        self._createPanel()
            .then(addListeners)
            .catch(reject)
    ]).then(onDomAdded)
      .then(done)
      .catch(reject);
  });
};


/**
 * Only detaches the panel. Will NOT hide the panel first.
 * @returns {!angular.$q.Promise<!MdPanelRef>} A promise that is resolved when
 *     the panel is detached.
 */
MdPanelRef.prototype.detach = function() {
  if (!this.isAttached) {
    return this._$q.when(this);
  }

  var self = this;
  var onDomRemoved = self.config['onDomRemoved'] || angular.noop;

  var detachFn = function() {
    self._removeEventListeners();

    // Remove the focus traps that we added earlier for keeping focus within
    // the panel.
    if (self._topFocusTrap && self._topFocusTrap.parentNode) {
      self._topFocusTrap.parentNode.removeChild(self._topFocusTrap);
    }

    if (self._bottomFocusTrap && self._bottomFocusTrap.parentNode) {
      self._bottomFocusTrap.parentNode.removeChild(self._bottomFocusTrap);
    }

    self.panelContainer.remove();
    self.isAttached = false;
    return self._$q.when(self);
  };

  if (this._restoreScroll) {
    this._restoreScroll();
    this._restoreScroll = null;
  }

  return this._$q(function(resolve, reject) {
    var done = self._done(resolve, self);

    self._$q.all([
      detachFn(),
      self._backdropRef ? self._backdropRef.detach() : true
    ]).then(onDomRemoved)
      .then(done)
      .catch(reject);
  });
};


/**
 * Destroys the panel. The Panel cannot be opened again after this.
 */
MdPanelRef.prototype.destroy = function() {
  this.config.scope.$destroy();
  this.config.locals = null;
};


/**
 * Shows the panel.
 * @returns {!angular.$q.Promise<!MdPanelRef>} A promise that is resolved when
 *     the panel has shown and animations finish.
 */
MdPanelRef.prototype.show = function() {
  if (!this.panelContainer) {
    return this._$q(function(resolve, reject) {
      reject('Panel does not exist yet. Call open() or attach().');
    });
  }

  if (!this.panelContainer.hasClass(MD_PANEL_HIDDEN)) {
    return this._$q.when(this);
  }

  var self = this;
  var animatePromise = function() {
    self.panelContainer.removeClass(MD_PANEL_HIDDEN);
    return self._animateOpen();
  };

  return this._$q(function(resolve, reject) {
    var done = self._done(resolve, self);
    var onOpenComplete = self.config['onOpenComplete'] || angular.noop;

    self._$q.all([
      self._backdropRef ? self._backdropRef.show() : self,
      animatePromise().then(function() { self._focusOnOpen(); }, reject)
    ]).then(onOpenComplete)
      .then(done)
      .catch(reject);
  });
};


/**
 * Hides the panel.
 * @returns {!angular.$q.Promise<!MdPanelRef>} A promise that is resolved when
 *     the panel has hidden and animations finish.
 */
MdPanelRef.prototype.hide = function() {
  if (!this.panelContainer) {
    return this._$q(function(resolve, reject) {
      reject('Panel does not exist yet. Call open() or attach().');
    });
  }

  if (this.panelContainer.hasClass(MD_PANEL_HIDDEN)) {
    return this._$q.when(this);
  }

  var self = this;

  return this._$q(function(resolve, reject) {
    var done = self._done(resolve, self);
    var onRemoving = self.config['onRemoving'] || angular.noop;

    var focusOnOrigin = function() {
      var origin = self.config['origin'];
      if (origin) {
        getElement(origin).focus();
      }
    };

    var hidePanel = function() {
      self.panelContainer.addClass(MD_PANEL_HIDDEN);
    };

    self._$q.all([
      self._backdropRef ? self._backdropRef.hide() : self,
      self._animateClose()
          .then(onRemoving)
          .then(hidePanel)
          .then(focusOnOrigin)
          .catch(reject)
    ]).then(done, reject);
  });
};


/**
 * Add a class to the panel. DO NOT use this to hide/show the panel.
 * @deprecated
 * This method is in the process of being deprecated in favor of using the panel
 * and container JQLite elements that are referenced in the MdPanelRef object.
 * Full deprecation is scheduled for material 1.2.
 *
 * @param {string} newClass Class to be added.
 * @param {boolean} toElement Whether or not to add the class to the panel
 *     element instead of the container.
 */
MdPanelRef.prototype.addClass = function(newClass, toElement) {
  this._$log.warn(
      'The addClass method is in the process of being deprecated. ' +
      'Full deprecation is scheduled for the Angular Material 1.2 release. ' +
      'To achieve the same results, use the panelContainer or panelEl ' +
      'JQLite elements that are referenced in MdPanelRef.');

  if (!this.panelContainer) {
    throw new Error('Panel does not exist yet. Call open() or attach().');
  }

  if (!toElement && !this.panelContainer.hasClass(newClass)) {
    this.panelContainer.addClass(newClass);
  } else if (toElement && !this.panelEl.hasClass(newClass)) {
    this.panelEl.addClass(newClass);
  }
};


/**
 * Remove a class from the panel. DO NOT use this to hide/show the panel.
 * @deprecated
 * This method is in the process of being deprecated in favor of using the panel
 * and container JQLite elements that are referenced in the MdPanelRef object.
 * Full deprecation is scheduled for material 1.2.
 *
 * @param {string} oldClass Class to be removed.
 * @param {boolean} fromElement Whether or not to remove the class from the
 *     panel element instead of the container.
 */
MdPanelRef.prototype.removeClass = function(oldClass, fromElement) {
  this._$log.warn(
      'The removeClass method is in the process of being deprecated. ' +
      'Full deprecation is scheduled for the Angular Material 1.2 release. ' +
      'To achieve the same results, use the panelContainer or panelEl ' +
      'JQLite elements that are referenced in MdPanelRef.');

  if (!this.panelContainer) {
    throw new Error('Panel does not exist yet. Call open() or attach().');
  }

  if (!fromElement && this.panelContainer.hasClass(oldClass)) {
    this.panelContainer.removeClass(oldClass);
  } else if (fromElement && this.panelEl.hasClass(oldClass)) {
    this.panelEl.removeClass(oldClass);
  }
};


/**
 * Toggle a class on the panel. DO NOT use this to hide/show the panel.
 * @deprecated
 * This method is in the process of being deprecated in favor of using the panel
 * and container JQLite elements that are referenced in the MdPanelRef object.
 * Full deprecation is scheduled for material 1.2.
 *
 * @param {string} toggleClass The class to toggle.
 * @param {boolean} onElement Whether or not to toggle the class on the panel
 *     element instead of the container.
 */
MdPanelRef.prototype.toggleClass = function(toggleClass, onElement) {
  this._$log.warn(
      'The toggleClass method is in the process of being deprecated. ' +
      'Full deprecation is scheduled for the Angular Material 1.2 release. ' +
      'To achieve the same results, use the panelContainer or panelEl ' +
      'JQLite elements that are referenced in MdPanelRef.');

  if (!this.panelContainer) {
    throw new Error('Panel does not exist yet. Call open() or attach().');
  }

  if (!onElement) {
    this.panelContainer.toggleClass(toggleClass);
  } else {
    this.panelEl.toggleClass(toggleClass);
  }
};


/**
 * Creates a panel and adds it to the dom.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 *     created.
 * @private
 */
MdPanelRef.prototype._createPanel = function() {
  var self = this;

  return this._$q(function(resolve, reject) {
    if (!self.config.locals) {
      self.config.locals = {};
    }

    self.config.locals.mdPanelRef = self;
    self._$mdCompiler.compile(self.config)
        .then(function(compileData) {
          self.panelContainer = compileData.link(self.config['scope']);
          getElement(self.config['attachTo']).append(self.panelContainer);

          if (self.config['disableParentScroll']) {
            self._restoreScroll = self._$mdUtil.disableScrollAround(
              null,
              self.panelContainer,
              { disableScrollMask: true }
            );
          }

          self.panelEl = angular.element(
              self.panelContainer[0].querySelector('.md-panel'));

          // Add a custom CSS class to the panel element.
          if (self.config['panelClass']) {
            self.panelEl.addClass(self.config['panelClass']);
          }

          // Handle click and touch events for the panel container.
          if (self.config['propagateContainerEvents']) {
            self.panelContainer.css('pointer-events', 'none');
          }

          // Panel may be outside the $rootElement, tell ngAnimate to animate
          // regardless.
          if (self._$animate.pin) {
            self._$animate.pin(self.panelContainer,
                getElement(self.config['attachTo']));
          }

          self._configureTrapFocus();
          self._addStyles().then(function() {
            resolve(self);
          }, reject);
        }, reject);
  });
};


/**
 * Adds the styles for the panel, such as positioning and z-index.
 * @returns {!angular.$q.Promise<!MdPanelRef>}
 * @private
 */
MdPanelRef.prototype._addStyles = function() {
  var self = this;
  return this._$q(function(resolve) {
    self.panelContainer.css('z-index', self.config['zIndex']);
    self.panelEl.css('z-index', self.config['zIndex'] + 1);

    var hideAndResolve = function() {
      // Remove left: -9999px and add hidden class.
      self.panelEl.css('left', '');
      self.panelContainer.addClass(MD_PANEL_HIDDEN);
      resolve(self);
    };

    if (self.config['fullscreen']) {
      self.panelEl.addClass('_md-panel-fullscreen');
      hideAndResolve();
      return; // Don't setup positioning.
    }

    var positionConfig = self.config['position'];
    if (!positionConfig) {
      hideAndResolve();
      return; // Don't setup positioning.
    }

    // Wait for angular to finish processing the template, then position it
    // correctly. This is necessary so that the panel will have a defined height
    // and width.
    self._$rootScope['$$postDigest'](function() {
      self._updatePosition(true);
      resolve(self);
    });
  });
};


/**
 * Updates the position configuration of a panel
 * @param {!MdPanelPosition} position
 */
MdPanelRef.prototype.updatePosition = function(position) {
  if (!this.panelContainer) {
    throw new Error('Panel does not exist yet. Call open() or attach().');
  }

  this.config['position'] = position;
  this._updatePosition();
};


/**
 * Calculates and updates the position of the panel.
 * @param {boolean=} init
 * @private
 */
MdPanelRef.prototype._updatePosition = function(init) {
  var positionConfig = this.config['position'];

  if (positionConfig) {
    positionConfig._setPanelPosition(this.panelEl);

    // Hide the panel now that position is known.
    if (init) {
      this.panelContainer.addClass(MD_PANEL_HIDDEN);
    }

    this.panelEl.css(
      MdPanelPosition.absPosition.TOP,
      positionConfig.getTop()
    );
    this.panelEl.css(
      MdPanelPosition.absPosition.BOTTOM,
      positionConfig.getBottom()
    );
    this.panelEl.css(
      MdPanelPosition.absPosition.LEFT,
      positionConfig.getLeft()
    );
    this.panelEl.css(
      MdPanelPosition.absPosition.RIGHT,
      positionConfig.getRight()
    );

    // Use the vendor prefixed version of transform.
    var prefixedTransform = this._$mdConstant.CSS.TRANSFORM;
    this.panelEl.css(prefixedTransform, positionConfig.getTransform());
  }
};


/**
 * Focuses on the panel or the first focus target.
 * @private
 */
MdPanelRef.prototype._focusOnOpen = function() {
  if (this.config['focusOnOpen']) {
    // Wait for the template to finish rendering to guarantee md-autofocus has
    // finished adding the class md-autofocus, otherwise the focusable element
    // isn't available to focus.
    var self = this;
    this._$rootScope['$$postDigest'](function() {
      var target = self._$mdUtil.findFocusTarget(self.panelEl) ||
          self.panelEl;
      target.focus();
    });
  }
};


/**
 * Shows the backdrop.
 * @returns {!angular.$q.Promise} A promise that is resolved when the backdrop
 *     is created and attached.
 * @private
 */
MdPanelRef.prototype._createBackdrop = function() {
  if (this.config.hasBackdrop) {
    if (!this._backdropRef) {
      var backdropAnimation = this._$mdPanel.newPanelAnimation()
          .openFrom(this.config.attachTo)
          .withAnimation({
            open: '_md-opaque-enter',
            close: '_md-opaque-leave'
          });
      var backdropConfig = {
        animation: backdropAnimation,
        attachTo: this.config.attachTo,
        focusOnOpen: false,
        panelClass: '_md-panel-backdrop',
        zIndex: this.config.zIndex - 1
      };
      this._backdropRef = this._$mdPanel.create(backdropConfig);
    }
    if (!this._backdropRef.isAttached) {
      return this._backdropRef.attach();
    }
  }
};


/**
 * Listen for escape keys and outside clicks to auto close.
 * @private
 */
MdPanelRef.prototype._addEventListeners = function() {
  this._configureEscapeToClose();
  this._configureClickOutsideToClose();
  this._configureScrollListener();
};


/**
 * Remove event listeners added in _addEventListeners.
 * @private
 */
MdPanelRef.prototype._removeEventListeners = function() {
  this._removeListeners && this._removeListeners.forEach(function(removeFn) {
    removeFn();
  });
  this._removeListeners = [];
};


/**
 * Setup the escapeToClose event listeners.
 * @private
 */
MdPanelRef.prototype._configureEscapeToClose = function() {
  if (this.config['escapeToClose']) {
    var parentTarget = getElement(this.config['attachTo']);
    var self = this;

    var keyHandlerFn = function(ev) {
      if (ev.keyCode === self._$mdConstant.KEY_CODE.ESCAPE) {
        ev.stopPropagation();
        ev.preventDefault();

        self.close();
      }
    };

    // Add keydown listeners
    this.panelContainer.on('keydown', keyHandlerFn);
    parentTarget.on('keydown', keyHandlerFn);

    // Queue remove listeners function
    this._removeListeners.push(function() {
      self.panelContainer.off('keydown', keyHandlerFn);
      parentTarget.off('keydown', keyHandlerFn);
    });
  }
};


/**
 * Setup the clickOutsideToClose event listeners.
 * @private
 */
MdPanelRef.prototype._configureClickOutsideToClose = function() {
  if (this.config['clickOutsideToClose']) {
    var target = this.panelContainer;
    var sourceElem;

    // Keep track of the element on which the mouse originally went down
    // so that we can only close the backdrop when the 'click' started on it.
    // A simple 'click' handler does not work,
    // it sets the target object as the element the mouse went down on.
    var mousedownHandler = function(ev) {
      sourceElem = ev.target;
    };

    // We check if our original element and the target is the backdrop
    // because if the original was the backdrop and the target was inside the
    // panel we don't want to panel to close.
    var self = this;
    var mouseupHandler = function(ev) {
      if (sourceElem === target[0] && ev.target === target[0]) {
        ev.stopPropagation();
        ev.preventDefault();

        self.close();
      }
    };

    // Add listeners
    target.on('mousedown', mousedownHandler);
    target.on('mouseup', mouseupHandler);

    // Queue remove listeners function
    this._removeListeners.push(function() {
      target.off('mousedown', mousedownHandler);
      target.off('mouseup', mouseupHandler);
    });
  }
};


/**
 * Configures the listeners for updating the panel position on scroll.
 * @private
*/
MdPanelRef.prototype._configureScrollListener = function() {
  var updatePosition = angular.bind(this, this._updatePosition);
  var debouncedUpdatePosition = this._$$rAF.throttle(updatePosition);
  var self = this;

  var onScroll = function() {
    if (!self.config['disableParentScroll']) {
      debouncedUpdatePosition();
    }
  };

  // Add listeners.
  this._$window.addEventListener('scroll', onScroll, true);

  // Queue remove listeners function.
  this._removeListeners.push(function() {
    self._$window.removeEventListener('scroll', onScroll, true);
  });
};


/**
 * Setup the focus traps. These traps will wrap focus when tabbing past the
 * panel. When shift-tabbing, the focus will stick in place.
 * @private
 */
MdPanelRef.prototype._configureTrapFocus = function() {
  // Focus doesn't remain instead of the panel without this.
  this.panelEl.attr('tabIndex', '-1');
  if (this.config['trapFocus']) {
    var element = this.panelEl;
    // Set up elements before and after the panel to capture focus and
    // redirect back into the panel.
    this._topFocusTrap = FOCUS_TRAP_TEMPLATE.clone()[0];
    this._bottomFocusTrap = FOCUS_TRAP_TEMPLATE.clone()[0];

    // When focus is about to move out of the panel, we want to intercept it
    // and redirect it back to the panel element.
    var focusHandler = function() {
      element.focus();
    };
    this._topFocusTrap.addEventListener('focus', focusHandler);
    this._bottomFocusTrap.addEventListener('focus', focusHandler);

    // Queue remove listeners function
    this._removeListeners.push(this._simpleBind(function() {
      this._topFocusTrap.removeEventListener('focus', focusHandler);
      this._bottomFocusTrap.removeEventListener('focus', focusHandler);
    }, this));

    // The top focus trap inserted immediately before the md-panel element (as
    // a sibling). The bottom focus trap inserted immediately after the
    // md-panel element (as a sibling).
    element[0].parentNode.insertBefore(this._topFocusTrap, element[0]);
    element.after(this._bottomFocusTrap);
  }
};


/**
 * Animate the panel opening.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 *     animated open.
 * @private
 */
MdPanelRef.prototype._animateOpen = function() {
  this.panelContainer.addClass('md-panel-is-showing');
  var animationConfig = this.config['animation'];
  if (!animationConfig) {
    // Promise is in progress, return it.
    this.panelContainer.addClass('_md-panel-shown');
    return this._$q.when(this);
  }

  var self = this;
  return this._$q(function(resolve) {
    var done = self._done(resolve, self);
    var warnAndOpen = function() {
      self._$log.warn(
          'MdPanel Animations failed. Showing panel without animating.');
      done();
    };

    animationConfig.animateOpen(self.panelEl)
        .then(done, warnAndOpen);
  });
};


/**
 * Animate the panel closing.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 *     animated closed.
 * @private
 */
MdPanelRef.prototype._animateClose = function() {
  var animationConfig = this.config['animation'];
  if (!animationConfig) {
    this.panelContainer.removeClass('md-panel-is-showing');
    this.panelContainer.removeClass('_md-panel-shown');
    return this._$q.when(this);
  }

  var self = this;
  return this._$q(function(resolve) {
    var done = function() {
      self.panelContainer.removeClass('md-panel-is-showing');
      resolve(self);
    };
    var warnAndClose = function() {
      self._$log.warn(
          'MdPanel Animations failed. Hiding panel without animating.');
      done();
    };

    animationConfig.animateClose(self.panelEl)
        .then(done, warnAndClose);
  });
};


/**
 * Faster, more basic than angular.bind
 * http://jsperf.com/angular-bind-vs-custom-vs-native
 * @param {function} callback
 * @param {!Object} self
 * @return {function} Callback function with a bound self.
 */
MdPanelRef.prototype._simpleBind = function(callback, self) {
  return function(value) {
    return callback.apply(self, value);
  };
};


/**
 * @param {function} callback
 * @param {!Object} self
 * @return {function} Callback function with a self param.
 */
MdPanelRef.prototype._done = function(callback, self) {
  return function() {
    callback(self);
  };
};


/*****************************************************************************
 *                               MdPanelPosition                             *
 *****************************************************************************/


/**
 * Position configuration object. To use, create an MdPanelPosition with the
 * desired properties, then pass the object as part of $mdPanel creation.
 *
 * Example:
 *
 * var panelPosition = new MdPanelPosition()
 *     .relativeTo(myButtonEl)
 *     .addPanelPosition(
 *       $mdPanel.xPosition.CENTER,
 *       $mdPanel.yPosition.ALIGN_TOPS
 *     );
 *
 * $mdPanel.create({
 *   position: panelPosition
 * });
 *
 * @param {!angular.$injector} $injector
 * @final @constructor
 */
function MdPanelPosition($injector) {
  /** @private @const {!angular.$window} */
  this._$window = $injector.get('$window');

  /** @private {boolean} */
  this._isRTL = $injector.get('$mdUtil').bidi() === 'rtl';

  /** @private {boolean} */
  this._absolute = false;

  /** @private {!angular.JQLite} */
  this._relativeToEl;

  /** @private {string} */
  this._top = '';

  /** @private {string} */
  this._bottom = '';

  /** @private {string} */
  this._left = '';

  /** @private {string} */
  this._right = '';

  /** @private {!Array<string>} */
  this._translateX = [];

  /** @private {!Array<string>} */
  this._translateY = [];

  /** @private {!Array<{x:string, y:string}>} */
  this._positions = [];

  /** @private {?{x:string, y:string}} */
  this._actualPosition;
}


/**
 * Possible values of xPosition.
 * @enum {string}
 */
MdPanelPosition.xPosition = {
  CENTER: 'center',
  ALIGN_START: 'align-start',
  ALIGN_END: 'align-end',
  OFFSET_START: 'offset-start',
  OFFSET_END: 'offset-end'
};


/**
 * Possible values of yPosition.
 * @enum {string}
 */
MdPanelPosition.yPosition = {
  CENTER: 'center',
  ALIGN_TOPS: 'align-tops',
  ALIGN_BOTTOMS: 'align-bottoms',
  ABOVE: 'above',
  BELOW: 'below'
};


/**
 * Possible values of absolute position.
 * @enum {string}
 */
MdPanelPosition.absPosition = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left'
};


/**
 * Sets absolute positioning for the panel.
 * @return {!MdPanelPosition}
 */
MdPanelPosition.prototype.absolute = function() {
  this._absolute = true;
  return this;
};

/**
 * Sets the value of a position for the panel. Clears any previously set
 * position.
 * @param {string} position Position to set
 * @param {string=} value Value of the position. Defaults to '0'.
 * @returns {!MdPanelPosition}
 * @private
 */
MdPanelPosition.prototype._setPosition = function(position, value) {
  if (position === MdPanelPosition.absPosition.RIGHT ||
      position === MdPanelPosition.absPosition.LEFT) {
    this._left = this._right = '';
  } else if (
      position === MdPanelPosition.absPosition.BOTTOM ||
      position === MdPanelPosition.absPosition.TOP) {
    this._top = this._bottom = '';
  } else {
    var positions = Object.keys(MdPanelPosition.absPosition).join()
        .toLowerCase();

    throw new Error('Position must be one of ' + positions + '.');
  }

  this['_' +  position] = angular.isString(value) ? value : '0';

  return this;
};


/**
 * Sets the value of `top` for the panel. Clears any previously set vertical
 * position.
 * @param {string=} top Value of `top`. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.top = function(top) {
  return this._setPosition(MdPanelPosition.absPosition.TOP, top);
};


/**
 * Sets the value of `bottom` for the panel. Clears any previously set vertical
 * position.
 * @param {string=} bottom Value of `bottom`. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.bottom = function(bottom) {
  return this._setPosition(MdPanelPosition.absPosition.BOTTOM, bottom);
};


/**
 * Sets the panel to the start of the page - `left` if `ltr` or `right` for
 * `rtl`. Clears any previously set horizontal position.
 * @param {string=} start Value of position. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.start = function(start) {
  var position = this._isRTL ? MdPanelPosition.absPosition.RIGHT : MdPanelPosition.absPosition.LEFT;
  return this._setPosition(position, start);
};


/**
 * Sets the panel to the end of the page - `right` if `ltr` or `left` for `rtl`.
 * Clears any previously set horizontal position.
 * @param {string=} end Value of position. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.end = function(end) {
  var position = this._isRTL ? MdPanelPosition.absPosition.LEFT : MdPanelPosition.absPosition.RIGHT;
  return this._setPosition(position, end);
};


/**
 * Sets the value of `left` for the panel. Clears any previously set
 * horizontal position.
 * @param {string=} left Value of `left`. Defaults to '0'.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.left = function(left) {
  return this._setPosition(MdPanelPosition.absPosition.LEFT, left);
};


/**
 * Sets the value of `right` for the panel. Clears any previously set
 * horizontal position.
 * @param {string=} right Value of `right`. Defaults to '0'.
 * @returns {!MdPanelPosition}
*/
MdPanelPosition.prototype.right = function(right) {
  return this._setPosition(MdPanelPosition.absPosition.RIGHT, right);
};


/**
 * Centers the panel horizontally in the viewport. Clears any previously set
 * horizontal position.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.centerHorizontally = function() {
  this._left = '50%';
  this._right = '';
  this._translateX = ['-50%'];
  return this;
};


/**
 * Centers the panel vertically in the viewport. Clears any previously set
 * vertical position.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.centerVertically = function() {
  this._top = '50%';
  this._bottom = '';
  this._translateY = ['-50%'];
  return this;
};


/**
 * Centers the panel horizontally and vertically in the viewport. This is
 * equivalent to calling both `centerHorizontally` and `centerVertically`.
 * Clears any previously set horizontal and vertical positions.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.center = function() {
  return this.centerHorizontally().centerVertically();
};


/**
 * Sets element for relative positioning.
 * @param {string|!Element|!angular.JQLite} element Query selector, DOM element,
 *     or angular element to set the panel relative to.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.relativeTo = function(element) {
  this._absolute = false;
  this._relativeToEl = getElement(element);
  return this;
};


/**
 * Sets the x and y positions for the panel relative to another element.
 * @param {string} xPosition must be one of the MdPanelPosition.xPosition
 *     values.
 * @param {string} yPosition must be one of the MdPanelPosition.yPosition
 *     values.
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.addPanelPosition = function(xPosition, yPosition) {
  if (!this._relativeToEl) {
    throw new Error('addPanelPosition can only be used with relative ' +
        'positioning. Set relativeTo first.');
  }

  this._validateXPosition(xPosition);
  this._validateYPosition(yPosition);

  this._positions.push({
      x: xPosition,
      y: yPosition,
  });
  return this;
};


/**
 * Ensures that yPosition is a valid position name. Throw an exception if not.
 * @param {string} yPosition
 */
MdPanelPosition.prototype._validateYPosition = function(yPosition) {
  // empty is ok
  if (yPosition == null) {
      return;
  }

  var positionKeys = Object.keys(MdPanelPosition.yPosition);
  var positionValues = [];
  for (var key, i = 0; key = positionKeys[i]; i++) {
    var position = MdPanelPosition.yPosition[key];
    positionValues.push(position);

    if (position === yPosition) {
      return;
    }
  }

  throw new Error('Panel y position only accepts the following values:\n' +
    positionValues.join(' | '));
};


/**
 * Ensures that xPosition is a valid position name. Throw an exception if not.
 * @param {string} xPosition
 */
MdPanelPosition.prototype._validateXPosition = function(xPosition) {
  // empty is ok
  if (xPosition == null) {
      return;
  }

  var positionKeys = Object.keys(MdPanelPosition.xPosition);
  var positionValues = [];
  for (var key, i = 0; key = positionKeys[i]; i++) {
    var position = MdPanelPosition.xPosition[key];
    positionValues.push(position);
    if (position === xPosition) {
      return;
    }
  }

  throw new Error('Panel x Position only accepts the following values:\n' +
      positionValues.join(' | '));
};


/**
 * Sets the value of the offset in the x-direction. This will add to any
 * previously set offsets.
 * @param {string} offsetX
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.withOffsetX = function(offsetX) {
  this._translateX.push(offsetX);
  return this;
};


/**
 * Sets the value of the offset in the y-direction. This will add to any
 * previously set offsets.
 * @param {string} offsetY
 * @returns {!MdPanelPosition}
 */
MdPanelPosition.prototype.withOffsetY = function(offsetY) {
  this._translateY.push(offsetY);
  return this;
};


/**
 * Gets the value of `top` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getTop = function() {
  return this._top;
};


/**
 * Gets the value of `bottom` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getBottom = function() {
  return this._bottom;
};


/**
 * Gets the value of `left` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getLeft = function() {
  return this._left;
};


/**
 * Gets the value of `right` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getRight = function() {
  return this._right;
};


/**
 * Gets the value of `transform` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getTransform = function() {
  var translateX = this._reduceTranslateValues('translateX', this._translateX);
  var translateY = this._reduceTranslateValues('translateY', this._translateY);

  // It's important to trim the result, because the browser will ignore the set
  // operation if the string contains only whitespace.
  return (translateX + ' ' + translateY).trim();
};

/**
 * True if the panel is completely on-screen with this positioning; false
 * otherwise.
 * @param {!angular.JQLite} panelEl
 * @return {boolean}
 */
MdPanelPosition.prototype._isOnscreen = function(panelEl) {
  // this works because we always use fixed positioning for the panel,
  // which is relative to the viewport.
  // TODO(gmoothart): take into account _translateX and _translateY to the
  // extent feasible.

  var left = parseInt(this.getLeft());
  var top = parseInt(this.getTop());
  var right = left + panelEl[0].offsetWidth;
  var bottom = top + panelEl[0].offsetHeight;

  return (left >= 0) &&
    (top >= 0) &&
    (bottom <= this._$window.innerHeight) &&
    (right <= this._$window.innerWidth);
};


/**
 * Gets the first x/y position that can fit on-screen.
 * @returns {{x: string, y: string}}
 */
MdPanelPosition.prototype.getActualPosition = function() {
  return this._actualPosition;
};


/**
 * Reduces a list of translate values to a string that can be used within
 * transform.
 * @param {string} translateFn
 * @param {!Array<string>} values
 * @returns {string}
 * @private
 */
MdPanelPosition.prototype._reduceTranslateValues =
    function(translateFn, values) {
      return values.map(function(translation) {
        return translateFn + '(' + translation + ')';
      }).join(' ');
    };


/**
 * Sets the panel position based on the created panel element and best x/y
 * positioning.
 * @param {!angular.JQLite} panelEl
 * @private
 */
MdPanelPosition.prototype._setPanelPosition = function(panelEl) {
  // Only calculate the position if necessary.
  if (this._absolute) {
    return;
  }

  if (this._actualPosition) {
    this._calculatePanelPosition(panelEl, this._actualPosition);
    return;
  }

  for (var i = 0; i < this._positions.length; i++) {
    this._actualPosition = this._positions[i];
    this._calculatePanelPosition(panelEl, this._actualPosition);
    if (this._isOnscreen(panelEl)) {
      break;
    }
  }
};


/**
 * Switches between 'start' and 'end'.
 * @param {string} position Horizontal position of the panel
 * @returns {string} Reversed position
 * @private
 */
MdPanelPosition.prototype._reverseXPosition = function(position) {
  if (position === MdPanelPosition.xPosition.CENTER) {
    return;
  }

  var start = 'start';
  var end = 'end';

  return position.indexOf(start) > -1 ? position.replace(start, end) : position.replace(end, start);
};


/**
 * Handles horizontal positioning in rtl or ltr environments.
 * @param {string} position Horizontal position of the panel
 * @returns {string} The correct position according the page direction
 * @private
 */
MdPanelPosition.prototype._bidi = function(position) {
  return this._isRTL ? this._reverseXPosition(position) : position;
};


/**
 * Calculates the panel position based on the created panel element and the
 * provided positioning.
 * @param {!angular.JQLite} panelEl
 * @param {!{x:string, y:string}} position
 * @private
 */
MdPanelPosition.prototype._calculatePanelPosition = function(panelEl, position) {

  var panelBounds = panelEl[0].getBoundingClientRect();
  var panelWidth = panelBounds.width;
  var panelHeight = panelBounds.height;

  var targetBounds = this._relativeToEl[0].getBoundingClientRect();

  var targetLeft = targetBounds.left;
  var targetRight = targetBounds.right;
  var targetWidth = targetBounds.width;

  switch (this._bidi(position.x)) {
    case MdPanelPosition.xPosition.OFFSET_START:
      this._left = targetLeft - panelWidth + 'px';
      break;
    case MdPanelPosition.xPosition.ALIGN_END:
      this._left = targetRight - panelWidth + 'px';
      break;
    case MdPanelPosition.xPosition.CENTER:
      var left = targetLeft + (0.5 * targetWidth) - (0.5 * panelWidth);
      this._left = left + 'px';
      break;
    case MdPanelPosition.xPosition.ALIGN_START:
      this._left = targetLeft + 'px';
      break;
    case MdPanelPosition.xPosition.OFFSET_END:
      this._left = targetRight + 'px';
      break;
  }

  var targetTop = targetBounds.top;
  var targetBottom = targetBounds.bottom;
  var targetHeight = targetBounds.height;

  switch (position.y) {
    case MdPanelPosition.yPosition.ABOVE:
      this._top = targetTop - panelHeight + 'px';
      break;
    case MdPanelPosition.yPosition.ALIGN_BOTTOMS:
      this._top = targetBottom - panelHeight + 'px';
      break;
    case MdPanelPosition.yPosition.CENTER:
      var top = targetTop + (0.5 * targetHeight) - (0.5 * panelHeight);
      this._top = top + 'px';
      break;
    case MdPanelPosition.yPosition.ALIGN_TOPS:
      this._top = targetTop + 'px';
      break;
    case MdPanelPosition.yPosition.BELOW:
      this._top = targetBottom + 'px';
      break;
  }
};


/*****************************************************************************
 *                               MdPanelAnimation                            *
 *****************************************************************************/


/**
 * Animation configuration object. To use, create an MdPanelAnimation with the
 * desired properties, then pass the object as part of $mdPanel creation.
 *
 * Example:
 *
 * var panelAnimation = new MdPanelAnimation()
 *     .openFrom(myButtonEl)
 *     .closeTo('.my-button')
 *     .withAnimation($mdPanel.animation.SCALE);
 *
 * $mdPanel.create({
 *   animation: panelAnimation
 * });
 *
 * @param {!angular.$injector} $injector
 * @final @constructor
 */
function MdPanelAnimation($injector) {
  /** @private @const {!angular.$mdUtil} */
  this._$mdUtil = $injector.get('$mdUtil');

  /**
   * @private {{element: !angular.JQLite|undefined, bounds: !DOMRect}|
   *     undefined}
   */
  this._openFrom;

  /**
   * @private {{element: !angular.JQLite|undefined, bounds: !DOMRect}|
   *     undefined}
   */
  this._closeTo;

  /** @private {string|{open: string, close: string}} */
  this._animationClass = '';
}


/**
 * Possible default animations.
 * @enum {string}
 */
MdPanelAnimation.animation = {
  SLIDE: 'md-panel-animate-slide',
  SCALE: 'md-panel-animate-scale',
  FADE: 'md-panel-animate-fade'
};


/**
 * Specifies where to start the open animation. `openFrom` accepts a
 * click event object, query selector, DOM element, or a Rect object that
 * is used to determine the bounds. When passed a click event, the location
 * of the click will be used as the position to start the animation.
 * @param {string|!Element|!Event|{top: number, left: number}} openFrom
 * @returns {!MdPanelAnimation}
 */
MdPanelAnimation.prototype.openFrom = function(openFrom) {
  // Check if 'openFrom' is an Event.
  openFrom = openFrom.target ? openFrom.target : openFrom;

  this._openFrom = this._getPanelAnimationTarget(openFrom);

  if (!this._closeTo) {
    this._closeTo = this._openFrom;
  }
  return this;
};


/**
 * Specifies where to animate the panel close. `closeTo` accepts a
 * query selector, DOM element, or a Rect object that is used to determine
 * the bounds.
 * @param {string|!Element|{top: number, left: number}} closeTo
 * @returns {!MdPanelAnimation}
 */
MdPanelAnimation.prototype.closeTo = function(closeTo) {
  this._closeTo = this._getPanelAnimationTarget(closeTo);
  return this;
};


/**
 * Returns the element and bounds for the animation target.
 * @param {string|!Element|{top: number, left: number}} location
 * @returns {{element: !angular.JQLite|undefined, bounds: !DOMRect}}
 * @private
 */
MdPanelAnimation.prototype._getPanelAnimationTarget = function(location) {
  if (angular.isDefined(location.top) || angular.isDefined(location.left)) {
    return {
      element: undefined,
      bounds: {
        top: location.top || 0,
        left: location.left || 0
      }
    };
  } else {
    return this._getBoundingClientRect(getElement(location));
  }
};


/**
 * Specifies the animation class.
 *
 * There are several default animations that can be used:
 * (MdPanelAnimation.animation)
 *   SLIDE: The panel slides in and out from the specified
 *        elements.
 *   SCALE: The panel scales in and out.
 *   FADE: The panel fades in and out.
 *
 * @param {string|{open: string, close: string}} cssClass
 * @returns {!MdPanelAnimation}
 */
MdPanelAnimation.prototype.withAnimation = function(cssClass) {
  this._animationClass = cssClass;
  return this;
};


/**
 * Animate the panel open.
 * @param {!angular.JQLite} panelEl
 * @returns {!angular.$q.Promise} A promise that is resolved when the open
 *     animation is complete.
 */
MdPanelAnimation.prototype.animateOpen = function(panelEl) {
  var animator = this._$mdUtil.dom.animator;

  this._fixBounds(panelEl);
  var animationOptions = {};

  // Include the panel transformations when calculating the animations.
  var panelTransform = panelEl[0].style.transform || '';

  var openFrom = animator.toTransformCss(panelTransform);
  var openTo = animator.toTransformCss(panelTransform);

  switch (this._animationClass) {
    case MdPanelAnimation.animation.SLIDE:
      // Slide should start with opacity: 1.
      panelEl.css('opacity', '1');

      animationOptions = {
        transitionInClass: '_md-panel-animate-enter'
      };

      var openSlide = animator.calculateSlideToOrigin(
              panelEl, this._openFrom) || '';
      openFrom = animator.toTransformCss(openSlide + ' ' + panelTransform);
      break;

    case MdPanelAnimation.animation.SCALE:
      animationOptions = {
        transitionInClass: '_md-panel-animate-enter'
      };

      var openScale = animator.calculateZoomToOrigin(
              panelEl, this._openFrom) || '';
      openFrom = animator.toTransformCss(openScale + ' ' + panelTransform);
      break;

    case MdPanelAnimation.animation.FADE:
      animationOptions = {
        transitionInClass: '_md-panel-animate-enter'
      };
      break;

    default:
      if (angular.isString(this._animationClass)) {
        animationOptions = {
          transitionInClass: this._animationClass
        };
      } else {
        animationOptions = {
          transitionInClass: this._animationClass['open'],
          transitionOutClass: this._animationClass['close'],
        };
      }
  }

  return animator
      .translate3d(panelEl, openFrom, openTo, animationOptions);
};


/**
 * Animate the panel close.
 * @param {!angular.JQLite} panelEl
 * @returns {!angular.$q.Promise} A promise that resolves when the close
 *     animation is complete.
 */
MdPanelAnimation.prototype.animateClose = function(panelEl) {
  var animator = this._$mdUtil.dom.animator;
  var reverseAnimationOptions = {};

  // Include the panel transformations when calculating the animations.
  var panelTransform = panelEl[0].style.transform || '';

  var closeFrom = animator.toTransformCss(panelTransform);
  var closeTo = animator.toTransformCss(panelTransform);

  switch (this._animationClass) {
    case MdPanelAnimation.animation.SLIDE:
      // Slide should start with opacity: 1.
      panelEl.css('opacity', '1');
      reverseAnimationOptions = {
        transitionInClass: '_md-panel-animate-leave'
      };

      var closeSlide = animator.calculateSlideToOrigin(
              panelEl, this._closeTo) || '';
      closeTo = animator.toTransformCss(closeSlide + ' ' + panelTransform);
      break;

    case MdPanelAnimation.animation.SCALE:
      reverseAnimationOptions = {
        transitionInClass: '_md-panel-animate-scale-out _md-panel-animate-leave'
      };

      var closeScale = animator.calculateZoomToOrigin(
              panelEl, this._closeTo) || '';
      closeTo = animator.toTransformCss(closeScale + ' ' + panelTransform);
      break;

    case MdPanelAnimation.animation.FADE:
      reverseAnimationOptions = {
        transitionInClass: '_md-panel-animate-fade-out _md-panel-animate-leave'
      };
      break;

    default:
      if (angular.isString(this._animationClass)) {
        reverseAnimationOptions = {
          transitionOutClass: this._animationClass
        };
      } else {
        reverseAnimationOptions = {
          transitionInClass: this._animationClass['close'],
          transitionOutClass: this._animationClass['open']
        };
      }
  }

  return animator
      .translate3d(panelEl, closeFrom, closeTo, reverseAnimationOptions);
};


/**
 * Set the height and width to match the panel if not provided.
 * @param {!angular.JQLite} panelEl
 * @private
 */
MdPanelAnimation.prototype._fixBounds = function(panelEl) {
  var panelWidth = panelEl[0].offsetWidth;
  var panelHeight = panelEl[0].offsetHeight;

  if (this._openFrom && this._openFrom.bounds.height == null) {
    this._openFrom.bounds.height = panelHeight;
  }
  if (this._openFrom && this._openFrom.bounds.width == null) {
    this._openFrom.bounds.width = panelWidth;
  }
  if (this._closeTo && this._closeTo.bounds.height == null) {
    this._closeTo.bounds.height = panelHeight;
  }
  if (this._closeTo && this._closeTo.bounds.width == null) {
    this._closeTo.bounds.width = panelWidth;
  }
};


/**
 * Identify the bounding RECT for the target element.
 * @param {!angular.JQLite} element
 * @returns {{element: !angular.JQLite|undefined, bounds: !DOMRect}}
 * @private
 */
MdPanelAnimation.prototype._getBoundingClientRect = function(element) {
  if (element instanceof angular.element) {
    return {
      element: element,
      bounds: element[0].getBoundingClientRect()
    };
  }
};


/*****************************************************************************
 *                                Util Methods                               *
 *****************************************************************************/

/**
 * Returns the angular element associated with a css selector or element.
 * @param el {string|!angular.JQLite|!Element}
 * @returns {!angular.JQLite}
 */
function getElement(el) {
  var queryResult = angular.isString(el) ?
      document.querySelector(el) : el;
  return angular.element(queryResult);
}
