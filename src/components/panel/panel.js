/**
 * @ngdoc module
 * @name material.components.panel
 */
angular
    .module('material.components.panel', [
      'material.core'
    ])
    .service('$mdPanel', MdPanelService);


/***************************************************************************************
 *                              PUBLIC DOCUMENTATION                                   *
 ***************************************************************************************/

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
 *   function DialogController($MdPanelReference, toppings) {
 *     var toppings;
 *
 *     function closeDialog() {
 *       $MdPanelReference.close();
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
 * @param opt_config {Object=} Specific configuration object that may contain the
 * following properties:
 *
 *   N/A
 *
 * TODO(ErinCoughlan): Add the following config options.
 *   - `groupName` - `{string=}`: Name of panel groups. This group name is used for
 *     configuring the number of open panels and identifying specific behaviors for
 *     groups. For instance, all tooltips will be identified using the same groupName.
 *   - `template` - `{string=}`: HTML template to show in the dialog. This **must** be
 *     trusted HTML with respect to Angular’s
 *     [$sce service](https://docs.angularjs.org/api/ng/service/$sce).
 *   - `templateUrl` - `{string=}`: The URL that will be used as the content of
 *     the panel.
 *   - `controller` - `{(function|string)=}`: The controller to associate with the
 *     panel. The controller can inject a reference to the returned
 *     panelRef, which allows the panel to be closed, hidden, and shown.
 *     Any fields passed in through locals or resolve will be bound to the controller.
 *   - `controllerAs` - `{string=}`: An alias to assign the controller to on the
 *     scope.
 *   - `locals` - `{Object=}`: An object containing key/value pairs. The keys will be
 *     used as names of values to inject into the controller. For example,
 *     `locals: {three: 3}` would inject `three` into the controller, with the value
 *     3.
 *   - `resolve` - `{Object=}`: Similar to locals, except it takes promises as
 *     values. The panel will not open until all of the promises resolve.
 *   - `attachTo` - `{Element=}`: The element to attach the panel to. Defaults to
 *     appending to the root element of the application.
 *   - `position` - `{$mdPanelPosition=}`: An $mdPanelPosition object that specifies
 *     the alignment of the panel. For more information, see $mdPanelPosition.
 *   - `animation` - `{$mdPanelAnimation=}`: An $mdPanelAnimation object that specifies
 *     the animation of the panel. For more information, see $mdPanelAnimation.
 *   - `hasBackdrop` - `{boolean=}`: Whether there should be an opaque backdrop behind
 *     the panel. Defaults to false.
 *   - `escapeToClose` - `{boolean=}`: Whether the user can press escape to close the
 *     panel. Defaults to false.
 *   - `clickOutsideToClose` - `{boolean=}`: Whether the user can click outside the
 *     panel to close it. Defaults to false.
 *   - `disableParentScroll` - `{boolean=}`: Whether the user can scroll the page
 *     behind the panel. Defaults to false.
 *   - `fullScreen` - `{boolean=}`: Whether the panel should be full screen. Applies
 *     the class `.md-panel-fullscreen` to the panel on open. Defaults to false.
 *   - `trapFocus` - `{boolean=}`: Whether focus should be trapped within the panel.
 *     If `trapFocus` is true, the user will not be able to interact with the rest of
 *     the page until the panel is dismissed. Defaults to false.
 *   - `focusOnOpen` - `{boolean=}`: An option to override focus behavior on open.
 *     Only disable if focusing some other way, as focus management is required for
 *     panels to be accessible. Defaults to true.
 *
 * @returns {$MdPanelReference} panelRef
 */

/**
 * @ngdoc method
 * @name $mdPanel#setGroupMaxOpen
 * @description
 * Sets the maximum number of panels in a group that can be opened at a given time.
 *
 * @param groupName {string} The name of the group to configure.
 * @param maxOpen {number} The max number of panels that can be opened.
 */


/***************************************************************************************
 *                                   $MdPanelReference                                       *
 ***************************************************************************************/


/**
 * @ngdoc object
 * @name $MdPanelReference
 * @description
 * A reference to a created panel. This reference contains a unique id for the panel,
 * along with the following properties:
 *   - `id` - `{string}: The unique id for the panel. This id is used to track when
 *     a panel was interacted with.
 *   - `config` - `{Object=}`: The entire config object that was used in create.
 *
 * TODO(ErinCoughlan): Add the following properties.
 *   - `isOpen` - `{boolean}`: Whether the panel is attached to the DOM. Visibility
 *     to the user does not factor into isOpen.
 *   - `isHidden` - `{boolean}`: Whether the panel is attached to the DOM, but not
 *     visible to the user.
 *   - `onDomAdded` - `{function=}`: Callback function used to announce when the
 *     panel is added to the DOM.
 *   - `onOpenComplete` - `{function=}`: Callback function used to announce when the
 *     open() action is finished.
 *   - `onRemoving` - `{function=}`: Callback function used to announce the
 *     close/hide() action is starting. This allows developers to run custom
 *     animations in parallel the close animations.
 */

/**
 * @ngdoc method
 * @name $MdPanelReference#open
 * @description
 * If the panel is not visible, opens an already created and configured panel.
 *
 * @returns {angular.$q.Promise} A promise that is resolved when the panel is closed.
 */

/**
 * @ngdoc method
 * @name $MdPanelReference#close
 * @description
 * If the panel is visible, closes the panel, resolving the promise that is returned
 * from `$MdPanelReference#open`. This method destroys the reference to the panel. In order
 * to open the panel again, a new one must be created.
 */


/***************************************************************************************
 *                                 $mdPanelPosition                                    *
 ***************************************************************************************/


/**
 * @ngdoc object
 * @name $mdPanelPosition
 * @description
 * Object for configuring the position of the panel. Examples:
 *
 * Centering the panel:
 * `$mdPanelPosition.absolute().top(‘50%’).left(‘50%’);`
 *
 * Overlapping the panel with an element:
 * `$mdPanelPosition.relativeTo(someElement).top(‘0’).left(‘0’);`
 *
 * Aligning the panel with the bottom of an element:
 * `$mdPanelPosition.relativeTo(someElement);`
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#absolute
 * @description
 * Positions the panel absolutely relative to the parent element. If the parent is
 * document.body, this is equivalent to positioning the panel absolutely within the
 * viewport.
 * @returns {$mdPanelPosition}
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#relativeTo
 * @description
 * Positions the panel relative to a specific element.
 * @param {!angular.JQLite} element Element to position the panel with respect to.
 * @returns {$mdPanelPosition}
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#top
 * @description
 * Sets the value of `top` for the panel.
 * @param {string} top Value of `top`.
 * @returns {$mdPanelPosition}
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#bottom
 * @description
 * Sets the value of `bottom` for the panel.
 * @param {string} top Value of `bottom`.
 * @returns {$mdPanelPosition}
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#left
 * @description
 * Sets the value of `left` for the panel.
 * @param {string} top Value of `left`.
 * @returns {$mdPanelPosition}
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#right
 * @description
 * Sets the value of `right` for the panel.
 * @param {string} top Value of `right`.
 * @returns {$mdPanelPosition}
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#offsetX
 * @description
 * Sets the value of the offset in the x-direction.
 * @param {string} offsetX
 * @returns {$mdPanelPosition}
 */

/**
 * @ngdoc method
 * @name $mdPanelPosition#offsetY
 * @description
 * Sets the value of the offset in the y-direction.
 * @param {string} offsetY
 * @returns {$mdPanelPosition}
 */


/***************************************************************************************
 *                                   IMPLEMENTATION                                    *
 ***************************************************************************************/


/**
 * A service that is used for controlling/displaying panels on the screen.
 * @param {!angular.JQLite} $rootElement
 * @param {!angular.$injector} $injector
 * @final @constructor @ngInject
 */
function MdPanelService($rootElement, $injector) {
  // Default config options for the panel.
  this._defaultConfigOptions = {
    attachTo: $rootElement
  };

  this._config = this._defaultConfigOptions;
  this._$injector = $injector;
}


/**
 * Creates a panel with the specified options.
 * @param {!Object=} opt_config Configuration object for the panel.
 * @returns {!$MdPanelReference}
 */
MdPanelService.prototype.create = function(opt_config) {
  var configSettings = opt_config || {};

  angular.extend(this._config, configSettings);

  var instanceID     = $injector.get('$mdUtil').nextUid();
  var instanceConfig = angular.extend({ }, this._config, {id : instanceID } );

  return new MdPanelReference(instanceConfig, $injector.get('$q'));
};


/**
 * A reference to a created panel. This reference contains a unique id for the panel,
 * along with properties/functions used to control the panel.
 *
 * @param {!angular.$injector} $injector
 * @param {!Object} config
 * @final @constructor
 */
function MdPanelReference(config,$q) {
  // Injected variables.
  this._$q = $q;

  // Public variables.
  this.config = config;
  this.id     = 'panel_' + this.id;
  this.isOpen = false;

  // Private variables.
  this._openPromise;
}


/**
 * Opens an already created and configured panel. If the panel is already visible,
 * does nothing.
 *
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is opened and animations finish.
 */
MdPanelReference.prototype.open = function() {
  if ( !this.isOpen ) {

    // @Todo - is the state `isOpen` synchronous/instant or asynch.

    this.isOpen = true;
    this._openPromise = this._$q(function(resolve, reject) {
      // Open an instance and animation the instance
      // ...


    });

  }

  return this._openPromise.promise;
};


/**
 * @returns {!angular.$q.Promise} A promise that is resolved when the panel is closed and animations finish.
 */
MdPanelReference.prototype.close = function() {
  if ( this.isOpen ) {
    this.isOpen = false;
    this._openPromise.reject("closing");

    // @Todo - how to cancel an `opening` in-progress

    return this._openPromise;

  } else {

    if ( !this._closePromise ) {
      this._closePromise = this._$q(function(resolve, reject) {

        // Animate and close the instance
        // ....

      });

      this._closePromise.finally(function() {
        // Clear for next open/close pairing...
        this._closePromise = undefined;
      });
    }

  }

  return this._closePromise.promise;
};
