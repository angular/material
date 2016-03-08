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
 *
 * TODO(ErinCoughlan): Add the following config options.
 *   - `groupName` - `{string=}`: Name of panel groups. This group name is
 *     used for configuring the number of open panels and identifying specific
 *     behaviors for groups. For instance, all tooltips will be identified
 *     using the same groupName.
 *   - `animation` - `{MdPanelAnimation=}`: An MdPanelAnimation object that
 *     specifies the animation of the panel. For more information, see
 *     `MdPanelAnimation`.
 *   - `hasBackdrop` - `{boolean=}`: Whether there should be an opaque backdrop
 *     behind the panel. Defaults to false.
 *   - `disableParentScroll` - `{boolean=}`: Whether the user can scroll the
 *     page behind the panel. Defaults to false.
 *   - `fullScreen` - `{boolean=}`: Whether the panel should be full screen.
 *     Applies the class `.md-panel-fullscreen` to the panel on open. Defaults
 *     to false.
 *   - `trapFocus` - `{boolean=}`: Whether focus should be trapped within the
 *     panel. If `trapFocus` is true, the user will not be able to interact
 *     with the rest of the page until the panel is dismissed. Defaults to
 *     false.
 *   - `focusOnOpen` - `{boolean=}`: An option to override focus behavior on
 *     open. Only disable if focusing some other way, as focus management is
 *     required for panels to be accessible. Defaults to true.
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
 * @name MdPanelRef#attach
 * @description
 * Create the panel elements and attach them to the DOM. The panel will be
 * shown by default.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * attached.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#detachOnly
 * @description
 * Removes the panel from the DOM. This will not hide the panel before removing it.
 * Consider calling addClass/removeClass/toggleClass to hide the panel first.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * detached.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#addClass
 * @description
 * Adds a class to the panel. This can be used to hide/show the panel.
 *
 * @param {string} newClass Class to be added.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * the new class and animations are completed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#removeClass
 * @description
 * Removes a class from the panel. This can be used to hide/show the panel.
 *
 * @param {string} oldClass Class to be removed.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * removed the old class and animations are completed.
 */

/**
 * @ngdoc method
 * @name MdPanelRef#toggleClass
 * @description
 * Toggles a class on the panel. This can be used to hide/show the panel.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * toggled the class and animations are completed.
 */


/*****************************************************************************
 *                               MdPanelPosition                            *
 *****************************************************************************/


/**
 * @ngdoc object
 * @name MdPanelPosition
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
 * @param {!angular.JQLite} element Element to position the panel with
 *     respect to.
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
 * center | align-left | align-right | align-start | align-end |
 * offset-left | offset-right | offset-start | offset-end
 *
 *    *************
 *    *           *
 *    *   PANEL   *
 *    *           *
 *    *************
 *   A B    C    D E
 *
 * A: offset-right, offset-start (for LTR displays)
 * B: align-left, align-start (for LTR displays)
 * C: center
 * D: align-right, align-end (for LTR displays)
 * E: offset-left, offset-end (for LTR displays)
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
 *                                IMPLEMENTATION                             *
 *****************************************************************************/


// Default z-index for the panel.
var defaultZIndex = 80;


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
    scope: $rootScope.$new(true),
    transformTemplate: angular.bind(this, this.wrapTemplate_),
    zIndex: defaultZIndex
  };

  /** @private {!Object} */
  this._config = this._defaultConfigOptions;

  /** @private {!angular.$injector} */
  this._$injector = $injector;
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

  /** @private */
  this._$mdConstant = $injector.get('$mdConstant')


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
  this._addClassPromise;

  /** @private {!angular.$q.Promise|undefined} */
  this._removeClassPromise;

  /** @private {!angular.JQLite|undefined} */
  this._panelContainer;

  /** @private {!angular.JQLite|undefined} */
  this._panelEl;
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
  this._openPromise = this.attach();

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
    self.addClass('_md-panel-hidden').then(function () {
      self.detachOnly().then(function() {
        // TODO(ErinCoughlan) - Add destroy. This will make the code here different
        // than just calling this.detach().
        resolve(self);
      }, reject);
    }, reject);
  });
};


/**
 * Attaches the panel. The panel will be visible afterwards.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * attached.
 */
MdPanelRef.prototype.attach = function() {
  if (this.isAttached) {
    return this._attachPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._attachPromise = this._$q(function(resolve, reject) {
    self._createPanel().then(function() {
      self.isAttached = true;
      self._activeListeners();
      resolve(self);
    }, reject);
  });

  return this._attachPromise;
};


/**
 * Detaches the panel. Will not hide the panel first if visible.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is
 * attached.
 */
MdPanelRef.prototype.detachOnly = function() {
  if (!this.isAttached) {
    this._detachPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._detachPromise = this._$q(function(resolve) {
    self._panelContainer.remove();
    self.isAttached = false;
    resolve(self);
  });

  return this._detachPromise;
};


/**
 * Add a class to the panel. This can control the panel's visibility.
 *
 * @param {string} newClass Class to be added.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * the new class and animations finish.
 */
MdPanelRef.prototype.addClass = function(newClass) {
  if (!this._panelContainer) {
    return this._$q.reject(
        'Panel does not exist yet. Call open() or attach().');
  }

  if (this._panelContainer.hasClass(newClass) && this._addClassPromise) {
    return this._addClassPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._addClassPromise = this._$q(function(resolve, reject) {
    try {
      // TODO(KarenParker): Add show/hide animation.
      self._panelContainer.addClass(newClass);
      resolve(self);
    } catch (e) {
      reject(e.message);
    }
  });

  return this._addClassPromise;
};


/**
 * Remove a class from the panel. This can control the panel's visibility.
 *
 * @param {string} oldClass Class to be removed.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * the new class and animations finish.
 */
MdPanelRef.prototype.removeClass = function(oldClass) {
  if (!this._panelContainer) {
    return this._$q.reject(
        'Panel does not exist yet. Call open() or attach().');
  }

  if (!this._panelContainer.hasClass(oldClass) && this._removeClassPromise) {
    return this._removeClassPromise;
  }

  // TODO(ErinCoughlan) - Cancel any in-progress actions.

  var self = this;
  this._removeClassPromise = this._$q(function(resolve, reject) {
    try {
      // TODO(KarenParker): Add show/hide animation.
      self._panelContainer.removeClass(oldClass);
      resolve(self);
    } catch (e) {
      reject(e.message);
    }
  });

  return this._removeClassPromise;
};


/**
 * Toggle a class on the panel. This can control the panel's visibility.
 *
 * @param {string} toggleClass The class to toggle.
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel has
 * toggled the class and animations finish.
 */
MdPanelRef.prototype.toggleClass = function(toggleClass) {
  if (this._panelContainer.hasClass(newClass)) {
    return this.removeClass(toggleClass);
  } else {
    return this.addClass(toggleClass);
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
          self._panelContainer = compileData.link(self._config.scope);
          angular.element(self._config.attachTo).append(self._panelContainer);

          self._panelEl = angular.element(
              self._panelContainer[0].querySelector('.md-panel'));

          // Add a custom CSS class.
          if (self._config['panelClass']) {
            self._panelEl.addClass(self._config['panelClass']);
          }

          self._addStyles();
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

  var positionConfig = this._config['position'];

  if (!positionConfig) { return; }

  var isAbsolute = positionConfig.getAbsolute();
  var panelPosition = isAbsolute ? 'fixed' : 'relative';
  this._panelEl.css('position', panelPosition);

  if (isAbsolute) {
    this._panelEl.css('top', positionConfig.getTop());
    this._panelEl.css('bottom', positionConfig.getBottom());
    this._panelEl.css('left', positionConfig.getLeft());
    this._panelEl.css('right', positionConfig.getRight());
  }
};


/**
 * Listen for escape keys and outside clicks to auto close.
 * @private
 */
MdPanelRef.prototype._activeListeners = function() {
  var removeListeners = [];
  var self = this;

  if (this._config.escapeToClose) {
    var parentTarget = this._config.attachTo;
    var keyHandlerFn = function(ev) {
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
    removeListeners.push(function() {
      self._panelContainer.off('keydown', keyHandlerFn);
      parentTarget.off('keydown', keyHandlerFn);
    });
  }

  if (this._config.clickOutsideToClose) {
    var target = this._panelContainer;
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

        self.close();
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
  this._deactivateListeners = function() {
    removeListeners.forEach(function(removeFn) {
      removeFn();
    });
    self._deactivateListeners.deactivateListeners = null;
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

  /** @private {string} */
  this._top = '';

  /** @private {string} */
  this._bottom = '';

  /** @private {string} */
  this._left = '';

  /** @private {string} */
  this._right = '';
}


/**
 * Sets absolute positioning for the panel.
 * @return {!MdPanelPosition}
 */
MdPanelPosition.prototype.absolute = function() {
  this._absolute = true;
  return this;
};


/**
 * Returns whether the panel should be absolutely positioned.
 * @returns {boolean}
 */
MdPanelPosition.prototype.getAbsolute = function() {
  return this._absolute;
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
 * Gets the value of `top` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getTop = function() {
  return this._top;
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
 * Gets the value of `bottom` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getBottom = function() {
  return this._bottom;
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
 * Gets the value of `left` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getLeft = function() {
  return this._left;
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
 * Gets the value of `right` for the panel.
 * @returns {string}
 */
MdPanelPosition.prototype.getRight = function() {
  return this._right;
};
