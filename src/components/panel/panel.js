/**
 * @ngdoc module
 * @name material.components.panel
 */
angular
    .module('material.components.panel', [
      'material.core'
    ])
    .service('$mdPanel', MdPanelService);

/**
 * @ngdoc service
 * @name $mdPanel
 * @module material.components.panel
 *
 * @description
 * `$mdPanel` is a general component that can be used for any panels on the screen,
 * such as a tooltip, dialog, or custom popup.
 *
 * @usage
 * <hljs lang="js">
 * (function(angular, undefined) {
 *   ‘use strict’;
 *
 *   angular
 *       .module('demoApp', ['ngMaterial'])
 *       .controller('PizzaBuilderController', PizzaBuilderController)
 *       .controller('PizzaDialogController', DialogController);
 *
 *   function PizzaBuilderController($element, $mdPanel) {
 *     var panelRef;
 *     var toppings = [
 *       'pepperoni',
 *       'sausage',
 *       'ham',
 *       'peppers',
 *       'onions',
 *       'pineapple'
 *     ];
 *
 *     function showPizzaPanel($event) {
 *       var config = {
 *         parent: angular.element(document.body),
 *         controller: DialogController,
 *         controllerAs: 'ctrl',
 *         position: $element,
 *         targetEvent: $event,
 *         template:
 *           '<div class="pizza-panel">' +
 *           '  <h2>Choose your favorite topping.</h2>' +
 *           '  <md-list>' +
 *           '    <md-list-item ng-repeat="topping in ctrl.toppings">' +
 *           '      <md-button ng-click="ctrl.favoriteTopping = topping">' +
 *           '        {{ topping }}' +
 *           '      </md-button>' +
 *           '    </md-list-item>' +
 *           '  </md-list>' +
 *           '  <div class="actions">' +
 *           '    <md-button ng-click="ctrl.closeDialog()">CANCEL</md-button>' +
 *           '  </div>' +
 *           '</div>',
 *         clickOutsideToClose: true,
 *         escapeToClose: true,
 *         focusOnOpen: true
 *       }
 *       panelRef = $mdPanel.create(config);
 *       panelRef.open()
 *           .finally(function() {
 *             panelRef = undefined;
 *           });
 *     }
 *   }
 *
 *   function DialogController($mdPanelRef, toppings) {
 *     var toppings;
 *     var favoriteTopping;
 *
 *     function closeDialog() {
 *       $mdPanelRef.close();
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
 *   - `maxOpen` - `{number=}` : Maximum number of panel in a specific group that
 *     can be opened at a given time. If multiple panels have the same groupName, but
 *     different values of maxOpen, only the first one will be considered. A warning
 *     will be logged in the console.
 *   - `template` - `{string=}`: HTML template to show in the dialog. This **must** be
 *     trusted HTML with respect to Angular’s
 *     [$sce service](https://docs.angularjs.org/api/ng/service/$sce).
 *   - `templateUrl` - `{string=}`: The URL that will be used as the content of
 *     the panel.
 *   - `controller` - `{(function|string)=}`: The controller to associate with the
 *     panel. The controller will be injected with a reference to the returned
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
 *   - `parent` - `{Element=}`: The element to append the dialog to. Defaults to
 *     appending to the root element of the application.
 *   - `position` - `{(string|Element|Object)=}`: The query selector, DOM element,
 *     or the Rect object that is used to determine the position (top, left, height,
 *     width) of the panel. By default, the panel will originate exactly from the
 *     source.
 *   - `alignX` - `{string=}`: What point of origin to use on the x-axis. There are 4
 *     possible values: start, center, end, justify. This is only necessary if you do
 *     not want the panel to intelligently determine location based on screen edges.
 *       - `start`:
 *         The panel is aligned to the start of the originating element in the
 *         x-direction. This value is the left of the element if the direction is
 *         left-to-right and the right of the element if the direction is
 *         right-to-left.
 *       - `end`:
 *         The panel is aligned to the end of the originating element in the
 *         x-direction. This value is the right of the element if the direction is
 *         left-to-right and the left of the element if the direction is
 *         right-to-left.
 *   - `alignY` - `{string=}`: What point of origin to use on the y-axis. There are 4
 *     possible values: start, center, end, justify. This is only necessary if you do
 *     not want the panel to intelligently determine location based on screen edges.
 *       - `top`:
 *         The panel is aligned to the top of the originating element.
 *       - `bottom`:
 *         The panel is aligned to the bottom of the originating element.
 *   - `overlap` - `{boolean=}`: Whether the panel should overlap the originating
 *     element. This value is true by default.
 *   - `center` - `{boolean=}`: If true, centers the panel in the viewport, both
 *     horizontally and vertically. If this option is set, `alignX` and `alignY` will
 *     be ignored.
 *   - `animation` - `{string=}`: The classname for the type of animation. There are
 *     several built-in animations that you can use:
 *       `md-animate-fly`: The panel flies in and out from the specified elements.
 *       `md-animate-scale`: The panels scales in and out.
 *       `md-animate-none`: No animations.
 *   - `targetEvent` - `{DOMClickEvent=}`: A click's event object. When passed in as
 *     an option, the location of the click will be used as the starting point for the
 *     opening animation of the panel.
 *   - `openFrom` - `{(string|Element|Object)=}`: The query selector, DOM element,
 *     or the Rect object that is used to determine the bounds (top, left, height,
 *     width) from which the panel will originate.
 *   - `closeTo` - `{(string|Element|Object)=}`: The query selector, DOM element, or
 *     the Rect object that is used to determine the bounds (top, left, height, width)
 *     from which the panel will close to.
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
 * @returns {$mdPanelRef} panelRef
 */



/**
 * A service that is used for controlling/displaying panels on the screen.
 *
 * @param $rootElement
 * @param $injector
 * @final
 * @constructor
 * @ngInject
 */
function MdPanelService($rootElement, $injector) {
  // Default config options for the panel.
  this.defaultConfigOptions_ = {
    parent: $rootElement
  };

  this.config_ = this.defaultConfigOptions_;
  this.injector_ = $injector;
}


MdPanelService.prototype.create = function(opt_config) {
  var configSettings = opt_config || {};
  for (var key in configSettings) {
    if (configSettings.hasOwnProperty(key)) {
      this.config_[key] = configSettings[key];
    }
  }

  return new $mdPanelRef(this.injector_, this.config_);
}


/**
 * @ngdoc object
 * @name $mdPanelRef
 *
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
 *
 * @param $injector
 * @param config
 *
 */
function $mdPanelRef($injector, config) {
  this.mdUtil_ = $injector.get('$mdUtil');
  this.q_ = $injector.get('$q');

  this.config = config;
  this.id = 'panel_' + this.mdUtil_.nextUid();

  this.openPromise_;
}


/**
 * @ngdoc method
 * @name $mdPanelRef#open
 * @description
 * If the panel is not visible, opens an already created and configured panel.
 *
 * @returns {promise} A promise that is resolved when the panel is closed.
 */
$mdPanelRef.prototype.open = function() {
  this.openPromise_ = this.q_.defer();
  return this.openPromise_.promise;
};


/**
 * @ngdoc method
 * @name $mdPanelRef#close
 * @description
 * If the panel is visible, closes the panel, resolving the promise that is returned
 * from `$mdPanelRef#open`. This method destroys the reference to the panel. In order
 * to open the panel again, a new one must be created.
 */
$mdPanelRef.prototype.close = function() {
  this.openPromise_.resolve(true);
};
