/**
 * @ngdoc module
 * @name material.components.panel
 */
angular
    .module('material.components.panel', [
      'material.core'
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
 *     var panelPosition = $mdPanelPosition
 *         .absolute()
 *         .top('50%')
 *         .left('50%');
 *
 *     var panelAnimation = $mdPanelAnimation
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
 *       template: 'dialog-template.html',
 *       clickOutsideToClose: true,
 *       escapeToClose: true,
 *       focusOnOpen: true
 *     }
 *     panelRef = $mdPanel.create(config);
 *     panelRef.open()
 *         .finally(function() {
 *           panelRef = undefined;
 *         });
 *   }
 *
 *   function DialogController(MdPanelRef, toppings) {
 *     var toppings;
 *
 *     function closeDialog() {
 *       MdPanelRef.close();
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
 * @param opt_config {Object=} Specific configuration object that may contain
 * the following properties:
 *
 *   - `template` - `{string=}`: HTML template to show in the dialog. This
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
 *   - `locals` - `{Object=}`: An object containing key/value pairs. The keys
 *     will be used as names of values to inject into the controller. For
 *     example, `locals: {three: 3}` would inject `three` into the controller,
 *     with the value 3.
 *   - `resolve` - `{Object=}`: Similar to locals, except it takes promises as
 *     values. The panel will not open until all of the promises resolve.
 *   - `attachTo` - `{Element=}`: The element to attach the panel to. Defaults
 *     to appending to the root element of the application.
 *   - `panelClass` - `{string=}`: A css class to apply to the panel element.
 *     This class should define any borders, box-shadow, etc. for the panel.
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
 *
 * TODO(ErinCoughlan): Add the following config options.
 *   - `groupName` - `{string=}`: Name of panel groups. This group name is
 *     used for configuring the number of open panels and identifying specific
 *     behaviors for groups. For instance, all tooltips will be identified
 *     using the same groupName.
 *   - `hasBackdrop` - `{boolean=}`: Whether there should be an opaque backdrop
 *     behind the panel. Defaults to false.
 *   - `disableParentScroll` - `{boolean=}`: Whether the user can scroll the
 *     page behind the panel. Defaults to false.
 *
 * @returns {MdPanelRef} panelRef
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
 * @param {Object=} opt_config Specific configuration object that may contain
 * the properties defined in `$mdPanel.create`.
 *
 * @returns {MdPanelRef} panelRef
 */


/**
 * @ngdoc method
 * @name $mdPanel#setGroupMaxOpen
 * @description
 * Sets the maximum number of panels in a group that can be opened at a given
 * time.
 *
 * @param groupName {string} The name of the group to configure.
 * @param maxOpen {number} The max number of panels that can be opened.
 */


/**
 * @ngdoc method
 * @name $mdPanel#newPanelPosition
 * @description
 * Returns a new instance of the MdPanelPosition object. Use this to create
 * the position config object.
 *
 * @returns {MdPanelPosition} panelPosition
 */


/**
 * @ngdoc method
 * @name $mdPanel#newPanelAnimation
 * @description
 * Returns a new instance of the MdPanelAnimation object. Use this to create
 * the animation config object.
 *
 * @returns {MdPanelAnimation} panelAnimation
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
 *   - `id` - `{string}: The unique id for the panel. This id is used to track
 *     when a panel was interacted with.
 *   - `config` - `{Object=}`: The entire config object that was used in
 *     create.
 *   - `isAttached` - `{boolean}`: Whether the panel is attached to the DOM.
 *     Visibility to the user does not factor into isAttached.
 *
 * TODO(ErinCoughlan): Add the following properties.
 *   - `onDomAdded` - `{function=}`: Callback function used to announce when
 *     the panel is added to the DOM.
 *   - `onOpenComplete` - `{function=}`: Callback function used to announce
 *     when the open() action is finished.
 *   - `onRemoving` - `{function=}`: Callback function used to announce the
 *     close/hide() action is starting. This allows developers to run custom
 *     animations in parallel the close animations.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#open
 * @description
 * Attaches and shows the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * opened.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#close
 * @description
 * Hides and detaches the panel. This method destroys the reference to the panel.
 * In order to open the panel again, a new one must be created.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * closed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#attachOnly
 * @description
 * Create the panel elements and attach them to the DOM. The panel will be
 * hidden by default.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * attached.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#detach
 * @description
 * Removes the panel from the DOM. This will hide the panel before removing it.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * detached.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#show
 * @description
 * Shows the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * shown and animations are completed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#hide
 * @description
 * Hides the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * hidden and animations are completed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#addClass
 * @description
 * Adds a class to the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} newClass Class to be added.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#removeClass
 * @description
 * Removes a class from the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} oldClass Class to be removed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#toggleClass
 * @description
 * Toggles a class on the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} toggleClass Class to be toggled.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#focusOnOpen
 * @description
 * Focuses the panel content if the focusOnOpen config value is true.
 */


/*****************************************************************************
 *                               MdPanelPosition                            *
 *****************************************************************************/


/**
 * @ngdoc type
 * @name MdPanelPosition
 * @module material.components.panel
 * @description
 * Object for configuring the position of the panel. Examples:
 *
 * Centering the panel:
 * `new MdPanelPosition().absolute().center();`
 *
 * Overlapping the panel with an element:
 * `new MdPanelPosition()
 *     .relativeTo(someElement)
 *     .withPanelXPosition('align-left')
 *     .withPanelYPosition('align-tops');`
 *
 * Aligning the panel with the bottom of an element:
 * `new MdPanelPosition()
 *     .relativeTo(someElement)
 *     .withPanelXPosition('center')
 *     .withPanelYPosition('below');`
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#absolute
 * @description
 * Positions the panel absolutely relative to the parent element. If the parent
 * is document.body, this is equivalent to positioning the panel absolutely
 * within the viewport.
 * @returns {MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#relativeTo
 * @description
 * Positions the panel relative to a specific element.
 * @param {string|!Element|!angular.JQLite} element Query selector,
 *     DOM element, or angular element to position the panel with respect to.
 * @returns {MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#top
 * @description
 * Sets the value of `top` for the panel.
 * @param {string=} opt_top Value of `top`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#bottom
 * @description
 * Sets the value of `bottom` for the panel.
 * @param {string=} opt_bottom Value of `bottom`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#left
 * @description
 * Sets the value of `left` for the panel.
 * @param {string=} opt_left Value of `left`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#right
 * @description
 * Sets the value of `right` for the panel.
 * @param {string=} opt_right Value of `right`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#withPanelXPosition
 * @param {string} xPosition
 * @description
 * Sets the x position for the panel relative to another element.
 * xPosition must be one of the following values:
 *
 * center | align-start | align-end | offset-start | offset-end
 *
 *    *************
 *    *           *
 *    *   PANEL   *
 *    *           *
 *    *************
 *   A B    C    D E
 *
 * A: offset-start (for LTR displays)
 * B: align-start (for LTR displays)
 * C: center
 * D: align-end (for LTR displays)
 * E: offset-end (for LTR displays)
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#withPanelYPosition
 * @param {string} yPosition
 * @description
 * Sets the y position for the panel relative to another element.
 * yPosition must be one of the following values:
 *
 * center | align-tops | align-bottoms | above | below
 *
 *   F
 *   G *************
 *     *           *
 *   H *   PANEL   *
 *     *           *
 *   I *************
 *   J
 *
 * F: below
 * G: align-tops
 * H: center
 * I: align-bottoms
 * J: above
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#withOffsetX
 * @description
 * Sets the value of the offset in the x-direction.
 * @param {string} offsetX
 * @returns {MdPanelPosition}
 */

/**
 * @ngdoc method
 * @name MdPanelPosition#withOffsetY
 * @description
 * Sets the value of the offset in the y-direction.
 * @param {string} offsetY
 * @returns {MdPanelPosition}
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
 *     .withAnimation(MdPanelPosition.animation.SCALE);
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
 * @returns {MdPanelAnimation}
 */

/**
 * @ngdoc method
 * @name MdPanelAnimation#closeTo
 * @description
 * Specifies where to animate the dialog close. `closeTo` accepts a
 * query selector, DOM element, or a Rect object that is used to determine
 * the bounds.
 *
 * @param {string|!Element|{top: number, left: number}}
 * @returns {MdPanelAnimation}
 */

/**
 * @ngdoc method
 * @name MdPanelAnimation#withAnimation
 * @description
 * Specifies the animation class.
 *
 * There are several default animations that can be used:
 * (MdPanelPosition.animation)
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
 * @returns {MdPanelAnimation}
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
 * @final @constructor @ngInject
 */
function MdPanelService($rootElement, $rootScope, $injector) {
  /**
   * Default config options for the panel.
   * @private {!Object}
   */
  this._defaultConfigOptions = {
    attachTo: $rootElement,
    bindToController: true,
    clickOutsideToClose: false,
    escapeToClose: false,
    focusOnOpen: true,
    fullscreen: false,
    scope: $rootScope.$new(true),
    transformTemplate: angular.bind(this, this.wrapTemplate_),
    trapFocus: false,
    zIndex: defaultZIndex
  };

  /** @private {!Object} */
  this._config = this._defaultConfigOptions;

  /** @private {!angular.$injector} */
  this._$injector = $injector;

  /** @type {enum} */
  this.animation = MdPanelAnimation.animation;
}


/**
 * Creates a panel with the specified options.
 * @param {!Object=} opt_config Configuration object for the panel.
 * @returns {!MdPanelRef}
 */
MdPanelService.prototype.create = function(opt_config) {
  var configSettings = opt_config || {};

  angular.extend(this._config, configSettings);

  var instanceId = 'panel_' + this._$injector.get('$mdUtil').nextUid();
  var instanceConfig = angular.extend({id : instanceId}, this._config);

  return new MdPanelRef(instanceConfig, this._$injector);
};


/**
 * Creates and opens a panel with the specified options.
 * @param {!Object=} opt_config Configuration object for the panel.
 * @returns {!MdPanelRef} The panel created from create.
 */
MdPanelService.prototype.open = function(opt_config) {
  var panelRef = this.create(opt_config);
  panelRef.open();
  return panelRef;
};


/**
 * Wraps the users template in two elements, md-panel-container, which covers
 * the entire attachTo element, and md-panel, which contains only the
 * template. This allows the panel control over positioning, animations,
 * and similar properties.
 *
 * @param {string} origTemplate The original template.
 * @returns {string} The wrapped template.
 * @private
 */
MdPanelService.prototype.wrapTemplate_ = function(origTemplate) {
  var template = origTemplate || '';

  return '<div class="md-panel-outer-wrapper">' +
            '<div class="md-panel">' +
              template +
            '</div>' +
         '</div>';
};


/**
 * Returns a new instance of the MdPanelPosition. Use this to create the
 * positioning object.
 *
 * @returns {MdPanelPosition}
 */
MdPanelService.prototype.newPanelPosition = function() {
  return new MdPanelPosition();
};


/**
 * Returns a new instance of the MdPanelAnimation. Use this to create the
 * animation object.
 *
 * @returns {MdPanelAnimation}
 */
MdPanelService.prototype.newPanelAnimation = function() {
  return new MdPanelAnimation();
};


/*****************************************************************************
 *                                 MdPanelRef                                *
 *****************************************************************************/


/**
 * A reference to a created panel. This reference contains a unique id for the
 * panel, along with properties/functions used to control the panel.
 *
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

  /** @private @const */
  this._$mdConstant = $injector.get('$mdConstant');

  /** @private @const {!angular.$mdUtil} */
  this._$mdUtil = $injector.get('$mdUtil');

  /** @private @const {!angular.Scope} */
  this._$rootScope = $injector.get('$rootScope');


  // Public variables.
  /**
   * Unique id for the panelRef.
   * @type {string}
   */
  this.id = config.id;

  /**
   * Whether the panel is attached. This is synchronous. When attach is called,
   * isAttached is set to true. When detach is called, isAttached is set to
   * false.
   * @type {boolean}
   */
  this.isAttached = false;


  // Private variables.
  /** @private {!Object} */
  this._config = config;

  /** @private {!angular.$q.Promise|undefined} */
  this._openPromise;

  /** @private {!angular.$q.Promise|undefined} */
  this._attachPromise;

  /** @private {!angular.$q.Promise|undefined} */
  this._detachPromise;

  /** @private {!angular.$q.Promise|undefined} */
  this._showPromise;

  /** @private {!angular.$q.Promise|undefined} */
  this._hidePromise;

  /** @private {!angular.JQLite|undefined} */
  this._panelContainer;

  /** @private {!angular.JQLite|undefined} */
  this._panelEl;

  /** @private {Array<function()>} */
  this._removeListeners = [];
  
  /** @private {!angular.JQLite|undefined} */
  this._topFocusTrap;

  /** @private {!angular.JQLite|undefined} */
  this._bottomFocusTrap;

  /** @private {!angular.$q.Promise|undefined} */
  this._reverseAnimation;
}


/**
 * Opens an already created and configured panel. If the panel is already
 * visible, does nothing.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel
 * is opened and animations finish.
 */
MdPanelRef.prototype.open = function() {
  if (this._openPromise) {
    // Panel is already shown so re-use (already resolved) promise from when
    // it was shown.
    return this._openPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._openPromise = this._$q(function(resolve, reject) {
    self.attachOnly().then(function() {
      self.show().then(function() {
        resolve(self);
      }, reject);
    }, reject);
  });

  return this._openPromise;
};


/**
 * Closes the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * closed and animations finish.
 */
MdPanelRef.prototype.close = function() {
  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  return this._$q(function(resolve, reject) {
    self.hide().then(function () {
      self.detach().then(function() {
        // TODO(ErinCoughlan) - Add destroy. This will make the code here
        // different than just calling this.detach().
        resolve(self);
      }, reject);
    }, reject);
  });
};


/**
 * Attaches the panel. The panel will be hidden afterwards.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * attached.
 */
MdPanelRef.prototype.attachOnly = function() {
  if (this.isAttached) {
    return this._attachPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._attachPromise = this._$q(function(resolve, reject) {
    self._createPanel().then(function() {
      self.isAttached = true;
      self._addEventListeners();
      resolve(self);
    }, reject);
  });

  return this._attachPromise;
};


/**
 * Detaches the panel. Will hide the panel first if visible.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * detached.
 */
MdPanelRef.prototype.detach = function() {
  if (!this.isAttached) {
    this._detachPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._detachPromise = this._$q(function(resolve, reject) {
    self.hide().then(function() {
      self._removeEventListener();

      // Remove the focus traps that we added earlier for keeping focus within
      // the panel.
      if (self._topFocusTrap && self._topFocusTrap.parentNode) {
        self._topFocusTrap.parentNode.removeChild(self._topFocusTrap);
      }

      if (self._bottomFocusTrap && self._bottomFocusTrap.parentNode) {
        self._bottomFocusTrap.parentNode.removeChild(self._bottomFocusTrap);
      }

      self._panelContainer.remove();
      self.isAttached = false;
      resolve(self);
    }, reject);
  });

  return this._detachPromise;
};


/**
 * Shows the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * shown and animations finish.
 */
MdPanelRef.prototype.show = function() {
  if (!this._panelContainer) {
    return this._$q.reject(
        'Panel does not exist yet. Call open() or attach().');
  }

  if (!this._panelContainer.hasClass(MD_PANEL_HIDDEN) && this._showPromise) {
    return this._showPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._showPromise = this._$q(function(resolve, reject) {
    self.removeClass(MD_PANEL_HIDDEN);
    self._animateOpen().then(function() {
      self.focusOnOpen();
      resolve(self);
    }, reject);
  });

  return this._showPromise;
};


/**
 * Hides the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * hidden and animations finish.
 */
MdPanelRef.prototype.hide = function() {
  if (!this._panelContainer) {
    return this._$q.reject(
        'Panel does not exist yet. Call open() or attach().');
  }

  if (this._panelContainer.hasClass(MD_PANEL_HIDDEN) && this._hidePromise) {
    return this._hidePromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._hidePromise = this._$q(function(resolve, reject) {
    self._animateClose().then(function() {
      self.addClass(MD_PANEL_HIDDEN);
      resolve(self);
    }, reject);
  });

  return this._hidePromise;
};


/**
 * Add a class to the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} newClass Class to be added.
 */
MdPanelRef.prototype.addClass = function(newClass) {
  if (!this._panelContainer) {
    throw new Error('Panel does not exist yet. Call open() or attach().');
  }

  if (!this._panelContainer.hasClass(newClass)) {
    this._panelContainer.addClass(newClass);
  }
};


/**
 * Remove a class from the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} oldClass Class to be removed.
 */
MdPanelRef.prototype.removeClass = function(oldClass) {
  if (!this._panelContainer) {
    throw new Error('Panel does not exist yet. Call open() or attach().');
  }

  if (this._panelContainer.hasClass(oldClass)) {
    this._panelContainer.removeClass(oldClass);
  }
};


/**
 * Toggle a class on the panel. DO NOT use this to hide/show the panel.
 *
 * @param {string} toggleClass The class to toggle.
 */
MdPanelRef.prototype.toggleClass = function(toggleClass) {
  if (!this._panelContainer) {
    throw new Error('Panel does not exist yet. Call open() or attach().');
  }

  this._panelContainer.toggleClass(toggleClass);
};


/**
 * Focuses on the panel or the first focus target.
 */
MdPanelRef.prototype.focusOnOpen = function() {
  if (this._config['focusOnOpen']) {
    // Wait a digest to guarantee md-autofocus has finished adding the class
    // _md-autofocus, otherwise the focusable element isn't available to focus.
    var self = this;
    this._$rootScope.$applyAsync(function() {
      var target = self._$mdUtil.findFocusTarget(self._panelEl) ||
          self._panelEl;
      target.focus();
    });
  }
};


/**
 * Creates a panel and adds it to the dom.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * created.
 * @private
 */
MdPanelRef.prototype._createPanel = function() {
  var self = this;
  return this._$q(function(resolve, reject) {
    self._$mdCompiler.compile(self._config)
        .then(function(compileData) {
          self._panelContainer = compileData.link(self._config['scope']);
          angular.element(self._config['attachTo']).append(
              self._panelContainer);

          self._panelEl = angular.element(
              self._panelContainer[0].querySelector('.md-panel'));

          // Add a custom CSS class.
          if (self._config['panelClass']) {
            self._panelEl.addClass(self._config['panelClass']);
          }

          self._addStyles();
          self._configureTrapFocus();
          resolve(self);
        }, reject);
  });
};


/**
 * Adds the styles for the panel, such as positioning and z-index.
 * @private
 */
MdPanelRef.prototype._addStyles = function() {
  this._panelContainer.css('z-index', this._config['zIndex']);
  this._panelContainer.addClass(MD_PANEL_HIDDEN);

  if (this._config['fullscreen']) {
    this._panelEl.addClass('_md-panel-fullscreen');
    return; // Don't setup positioning.
  }

  this._$rootScope.$applyAsync(angular.bind(this, this._configurePosition));
};


/**
 * Configure the position of the panel.
 * @private
 */
MdPanelRef.prototype._configurePosition = function() {
  /** POSITIONING STYLES **/
  var positionConfig = this._config['position'];

  if (!positionConfig) { return; }

  this._panelEl.css('position', 'fixed');
  this._panelEl.css('top', positionConfig.getTop(this._panelEl));
  this._panelEl.css('bottom', positionConfig.getBottom(this._panelEl));
  this._panelEl.css('left', positionConfig.getLeft(this._panelEl));
  this._panelEl.css('right', positionConfig.getRight(this._panelEl));
};


/**
 * Listen for escape keys and outside clicks to auto close.
 * @private
 */
MdPanelRef.prototype._addEventListeners = function() {
  this._configureEscapeToClose();
  this._configureClickOutsideToClose();
};


/**
 * Remove event listeners added in _addEventListeners.
 * @private
 */
MdPanelRef.prototype._removeEventListener = function() {
  this._removeListeners && this._removeListeners.forEach(function(removeFn) {
    removeFn();
  });
  this._removeListeners = null;
}


/**
 * Setup the escapeToClose event listeners.
 * @private
 */
MdPanelRef.prototype._configureEscapeToClose = function() {
  if (this._config['escapeToClose']) {
    var parentTarget = this._config['attachTo'];
    var self = this;

    var keyHandlerFn = function (ev) {
      if (ev.keyCode === self._$mdConstant.KEY_CODE.ESCAPE) {
        ev.stopPropagation();
        ev.preventDefault();

        self.close();
      }
    };

    // Add keydown listeners
    this._panelContainer.on('keydown', keyHandlerFn);
    parentTarget.on('keydown', keyHandlerFn);

    // Queue remove listeners function
    this._removeListeners.push(function () {
      self._panelContainer.off('keydown', keyHandlerFn);
      parentTarget.off('keydown', keyHandlerFn);
    });
  }
};


/**
 * Setup the clickOutsideToClose event listeners.
 * @private
 */
MdPanelRef.prototype._configureClickOutsideToClose = function() {
  if (this._config['clickOutsideToClose']) {
    var target = this._panelContainer;
    var sourceElem;

    // Keep track of the element on which the mouse originally went down
    // so that we can only close the backdrop when the 'click' started on it.
    // A simple 'click' handler does not work,
    // it sets the target object as the element the mouse went down on.
    var mousedownHandler = function (ev) {
      sourceElem = ev.target;
    };

    // We check if our original element and the target is the backdrop
    // because if the original was the backdrop and the target was inside the
    // dialog we don't want to dialog to close.
    var self = this;
    var mouseupHandler = function (ev) {
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
    this._removeListeners.push(function () {
      target.off('mousedown', mousedownHandler);
      target.off('mouseup', mouseupHandler);
    });
  }
};


/**
 * Setup the focus traps. These traps will wrap focus when tabbing past the
 * panel. When shift-tabbing, the focus will stick in place.
 * @private
 */
MdPanelRef.prototype._configureTrapFocus = function() {
  // Focus doesn't remain instead of the panel without this.
  this._panelEl.attr('tabIndex', '-1');
  if (this._config['trapFocus']) {
    var element = this._panelEl;
    // Set up elements before and after the panel to capture focus and
    // redirect back into the panel.
    this._topFocusTrap = FOCUS_TRAP_TEMPLATE.clone()[0];
    this._bottomFocusTrap = FOCUS_TRAP_TEMPLATE.clone()[0];

    // When focus is about to move out of the panel, we want to intercept it
    // and redirect it back to the panel element.
    var focusHandler = function () {
      element.focus();
    };
    this._topFocusTrap.addEventListener('focus', focusHandler);
    this._bottomFocusTrap.addEventListener('focus', focusHandler);

    // The top focus trap inserted immediately before the md-panel element (as
    // a sibling). The bottom focus trap inserted immediately after the
    // md-panel element (as a sibling).
    element[0].parentNode.insertBefore(this._topFocusTrap, element[0]);
    element.after(this._bottomFocusTrap);
  }
};


/**
 * Animate the panel opening.
 * @returns {!angular.$q.Promise}
 * @private
 */
MdPanelRef.prototype._animateOpen = function() {
  this.addClass('md-panel-is-showing');
  var animationConfig = this._config['animation'];
  if (!animationConfig) {
    this.addClass('_md-panel-shown');
    return this._$q.resolve();
  }

  return animationConfig.animateOpen(this._panelEl,
      this._$mdUtil.dom.animator);
};


/**
 * Animate the panel closing.
 * @returns {!angular.$q.Promise}
 * @private
 */
MdPanelRef.prototype._animateClose = function() {
  var animationConfig = this._config['animation'];
  if (!animationConfig) {
    this.removeClass('md-panel-is-showing');
    this.removeClass('_md-panel-shown');
    return this._$q.resolve();
  }

  var self = this;
  return this._$q(function(resolve, reject) {
    animationConfig.animateClose(self._$q).then(function(){
      self.removeClass('md-panel-is-showing');
      resolve(self);
    }, reject);
  });
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
 *     .withPanelXPosition('center')
 *     .withPanelYPosition('align-tops');
 *
 * $mdPanel.create({
 *   position: panelPosition
 * });
 *
 * @final @constructor
 */
function MdPanelPosition() {
  /** @private {boolean} */
  this._absolute = false;

  /** @private {!DOMRect} */
  this._relativeToRect;

  /** @private {boolean} */
  this._panelPositionCalculated = false;

  /** @private {string} */
  this._top = '';

  /** @private {string} */
  this._bottom = '';

  /** @private {string} */
  this._left = '';

  /** @private {string} */
  this._right = '';

  /** @private {string} */
  this._xPosition = '';

  /** @private {string} */
  this._yPosition = '';
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
 * Sets absolute positioning for the panel.
 * @return {!MdPanelPosition}
 */
MdPanelPosition.prototype.absolute = function() {
  this._absolute = true;
  return this;
};


/**
 * Sets the value of `top` for the panel.
 * @param {string=} opt_top Value of `top`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */
MdPanelPosition.prototype.top = function(opt_top) {
  this._top = opt_top || '0';
  return this;
};


/**
 * Sets the value of `bottom` for the panel.
 * @param {string=} opt_bottom Value of `bottom`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */
MdPanelPosition.prototype.bottom = function(opt_bottom) {
  this._bottom = opt_bottom || '0';
  return this;
};


/**
 * Sets the value of `left` for the panel.
 * @param {string=} opt_left Value of `left`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */
MdPanelPosition.prototype.left = function(opt_left) {
  this._left = opt_left || '0';
  return this;
};


/**
 * Sets the value of `right` for the panel.
 * @param {string=} opt_right Value of `right`. Defaults to '0'.
 * @returns {MdPanelPosition}
 */
MdPanelPosition.prototype.right = function(opt_right) {
  this._right = opt_right || '0';
  return this;
};


/**
 * Sets element for relative positioning.
 * @param {string|!Element|!angular.JQLite} element Query selector,
 *     DOM element, or angular element to set the panel relative to.
 * @returns {MdPanelPosition}
 */
MdPanelPosition.prototype.relativeTo = function(element) {
  this._absolute = false;
  this._relativeToRect = getElement(element)[0].getBoundingClientRect();
  return this;
};


/**
 * Sets the x position for the panel relative to another element.
 * xPosition must be one of the MdPanelPosition.xPosition values.
 *
 * @param {string} xPosition
 * @returns {MdPanelPosition}
 */
MdPanelPosition.prototype.withPanelXPosition = function(xPosition) {
  if (!this._relativeToRect) {
    throw new Error('withPanelXPosition can only be used with relative' +
        'positioning. Set relativeTo first.');
  }

  var positionKeys = Object.keys(MdPanelPosition.xPosition);
  var positionValues = [];
  for (var key, i = 0; key = positionKeys[i]; i++) {
    var position = MdPanelPosition.xPosition[key];
    positionValues.push(position);
    if (position === xPosition) {
      this._xPosition = xPosition;
      return this;
    }
  }

  throw new Error('withPanelXPosition only accepts the following values:\n' +
      positionValues.join(' | '));
};


/**
 * Sets the y position for the panel relative to another element.
 * yPosition must be one of the MdPanelPosition.yPosition values.
 *
 * @param {string} yPosition
 * @returns {MdPanelPosition}
 */
MdPanelPosition.prototype.withPanelYPosition = function(yPosition) {
  if (!this._relativeToRect) {
    throw new Error('withPanelYPosition can only be used with relative ' +
        'positioning. Set relativeTo first.');
  }

  var positionKeys = Object.keys(MdPanelPosition.yPosition);
  var positionValues = [];
  for (var key, i = 0; key = positionKeys[i]; i++) {
    var position = MdPanelPosition.yPosition[key];
    positionValues.push(position);
    if (position === yPosition) {
      this._yPosition = yPosition;
      return this;
    }
  }

  throw new Error('withPanelYPosition only accepts the following values:\n' +
      positionValues.join(' | '));
};


/**
 * Gets the value of `top` for the panel.
 * @param {!angular.JQLite} panelEl
 * @returns {string}
 */
MdPanelPosition.prototype.getTop = function(panelEl) {
  this._calculatePanelPosition(panelEl);
  return this._top;
};


/**
 * Gets the value of `bottom` for the panel.
 * @param {!angular.JQLite} panelEl
 * @returns {string}
 */
MdPanelPosition.prototype.getBottom = function(panelEl) {
  this._calculatePanelPosition(panelEl);
  return this._bottom;
};


/**
 * Gets the value of `left` for the panel.
 * @param {!angular.JQLite} panelEl
 * @returns {string}
 */
MdPanelPosition.prototype.getLeft = function(panelEl) {
  this._calculatePanelPosition(panelEl);
  return this._left;
};


/**
 * Gets the value of `right` for the panel.
 * @param {!angular.JQLite} panelEl
 * @returns {string}
 */
MdPanelPosition.prototype.getRight = function(panelEl) {
  this._calculatePanelPosition(panelEl);
  return this._right;
};


/**
 * Calculates the panel position for relative based on the created
 * panel element.
 * @param {!angular.JQLite} panelEl
 */
MdPanelPosition.prototype._calculatePanelPosition = function(panelEl) {
  // Only calculate the position if necessary.
  if (this._absolute || this._panelPositionCalculated) {
    return;
  }

  // TODO(ErinCoughlan): Update position on scroll.
  // TODO(ErinCoughlan): Position panel intelligently to keep it on screen.

  // Indicate that the position is calculated so it can be skipped next time.
  this._panelPositionCalculated = true;

  var panelBounds = panelEl[0].getBoundingClientRect();
  var panelWidth = panelBounds.width;
  var panelHeight = panelBounds.height;

  var targetBounds = this._relativeToRect;

  var targetLeft = targetBounds.left;
  var targetRight = targetBounds.right;
  var targetWidth = targetBounds.width;

  switch (this._xPosition) {
    case MdPanelPosition.xPosition.OFFSET_START:
      // TODO(ErinCoughlan): Change OFFSET_START for rtl vs ltr.
      this._right = targetLeft + 'px';
      break;
    case MdPanelPosition.xPosition.ALIGN_END:
      // TODO(ErinCoughlan): Change ALIGN_END for rtl vs ltr.
      this._right = targetRight + 'px';
      break;
    case MdPanelPosition.xPosition.CENTER:
      var left = targetLeft + (0.5 * targetWidth) - (0.5 * panelWidth)
      this._left = left + 'px';
      break;
    case MdPanelPosition.xPosition.ALIGN_START:
      // TODO(ErinCoughlan): Change ALIGN_START for rtl vs ltr.
      this._left = targetLeft + 'px';
      break;
    case MdPanelPosition.xPosition.OFFSET_END:
      // TODO(ErinCoughlan): Change OFFSET_END for rtl vs ltr.
      this._left = targetRight + 'px';
      break;
  }

  var targetTop = targetBounds.top;
  var targetBottom = targetBounds.bottom;
  var targetHeight = targetBounds.height;

  switch (this._yPosition) {
    case MdPanelPosition.yPosition.ABOVE:
      this._bottom = targetTop + 'px';
      break;
    case MdPanelPosition.yPosition.ALIGN_BOTTOMS:
      this._bottom = targetBottom + 'px';
      break;
    case MdPanelPosition.yPosition.CENTER:
      var top = targetTop + (0.5 * targetHeight) - (0.5 * panelHeight)
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
 * @final @constructor
 */
function MdPanelAnimation() {
  /**
   * @private {{element: !angular.JQLite|undefined, bounds: !DOMRect}|
   *    undefined}
   */
  this._openFrom;

  /**
   * @private {{element: !angular.JQLite|undefined, bounds: !DOMRect}|
   *    undefined}
   */
  this._closeTo;

  /** @private {string|{open: string, close: string} */
  this._animationClass = '';

  /** @private {!angular.$q.Promise|undefined} **/
  this._reverseAnimation;
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
 *
 * @param {string|!Element|!Event|{top: number, left: number}} openFrom
 * @returns {MdPanelAnimation}
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
 * Specifies where to animate the dialog close. `closeTo` accepts a
 * query selector, DOM element, or a Rect object that is used to determine
 * the bounds.
 *
 * @param {string|!Element|{top: number, left: number}} closeTo
 * @returns {MdPanelAnimation}
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
 * @returns {MdPanelAnimation}
 */

MdPanelAnimation.prototype.withAnimation = function(cssClass) {
  this._animationClass = cssClass;
  return this;
};


/**
 * Animate the panel open.
 * @param {!angular.JQLite} panelEl
 * @param animator
 * @returns {!angular.$q.Promise}
 */
MdPanelAnimation.prototype.animateOpen = function(panelEl, animator) {
  this._fixBounds(panelEl);
  var animationOptions = {};
  var reverseAnimationOptions = {};
  var openFrom = animator.toTransformCss("");
  var openTo = animator.toTransformCss("");
  var closeFrom = animator.toTransformCss("");
  var closeTo = animator.toTransformCss("");

  switch (this._animationClass) {
    case MdPanelAnimation.animation.SLIDE:
      animationOptions = {
        transitionInClass: '_md-panel-animate-slide-in _md-panel-shown',
        transitionOutClass: '_md-panel-animate-slide-out'
      };
      reverseAnimationOptions = {
        transitionOutClass: '_md-panel-animate-slide-in _md-panel-shown',
        transitionInClass: '_md-panel-animate-slide-out'
      };
      openFrom = animator.toTransformCss(animator.calculateSlideToOrigin(
          panelEl, this._openFrom) || "");
      closeTo = animator.toTransformCss(animator.calculateSlideToOrigin(
          panelEl, this._closeTo));
      break;
    case MdPanelAnimation.animation.SCALE:
      animationOptions = {
        transitionInClass: '_md-panel-animate-scale-in _md-panel-shown',
        transitionOutClass: '_md-panel-animate-scale-out'
      };
      reverseAnimationOptions = {
        transitionOutClass: '_md-panel-animate-scale-in _md-panel-shown',
        transitionInClass: '_md-panel-animate-scale-out'
      };
      openFrom = animator.toTransformCss(animator.calculateZoomToOrigin(
          panelEl, this._openFrom) || "");
      closeTo = animator.toTransformCss(animator.calculateZoomToOrigin(
          panelEl, this._closeTo));
      break;
    case MdPanelAnimation.animation.FADE:
      animationOptions = {
        transitionInClass: '_md-panel-animate-fade-in _md-panel-shown',
        transitionOutClass: '_md-panel-animate-fade-out'
      };
      reverseAnimationOptions = {
        transitionOutClass: '_md-panel-animate-fade-in _md-panel-shown',
        transitionInClass: '_md-panel-animate-fade-out'
      };
      break;
    default:
      if (angular.isString(this._animationClass)) {
        animationOptions = {
          transitionInClass: this._animationClass + ' _md-panel-shown'
        };
      } else {
        animationOptions = {
          transitionInClass: this._animationClass['open'] + ' _md-panel-shown'
        };
        reverseAnimationOptions = {
          transitionInClass: this._animationClass['close']
        };
      }
  }

  var self = this;
  return animator
      .translate3d(panelEl, openFrom, openTo, animationOptions)
      .then(function () {
        self._reverseAnimation = function () {
          return animator
              .translate3d(panelEl, closeFrom, closeTo,
                  reverseAnimationOptions);

        };
      });
};


/**
 * Animate the panel close.
 * @param $q
 * @returns {!angular.$q.Promise}
 */
MdPanelAnimation.prototype.animateClose = function($q) {
  if (this._reverseAnimation) {
    return this._reverseAnimation();
  }
  return $q.reject('No panel close animation. ' +
      'Have you called MdPanelAnimation.animateOpen()?');
};


/**
 * Set the height and width to match the panel if not provided.
 * @param {!angular.JQLite} panelEl
 * @private
 */
MdPanelAnimation.prototype._fixBounds = function(panelEl) {
  var panelWidth = panelEl[0].offsetWidth;
  var panelHeight = panelEl[0].offsetHeight;

  if (this._openFrom.bounds.height == null) {
    this._openFrom.bounds.height = panelHeight;
  }
  if (this._openFrom.bounds.width == null) {
    this._openFrom.bounds.width = panelWidth;
  }
  if (this._closeTo.bounds.height == null) {
    this._closeTo.bounds.height = panelHeight;
  }
  if (this._closeTo.bounds.width == null) {
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
