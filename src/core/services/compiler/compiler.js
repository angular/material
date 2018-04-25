/**
 * @ngdoc module
 * @name material.core.compiler
 * @description
 * AngularJS Material template and element compiler.
 */
angular
  .module('material.core')
  .provider('$mdCompiler', MdCompilerProvider);

/**
 * @ngdoc service
 * @name $mdCompilerProvider
 * @module material.core.compiler
 * @description
 * The `$mdCompiler` is able to respect the AngularJS `$compileProvider.preAssignBindingsEnabled`
 * state when using AngularJS versions greater than or equal to 1.5.10 and less than 1.7.0.
 * See the [AngularJS documentation for `$compileProvider.preAssignBindingsEnabled`
 * ](https://code.angularjs.org/1.6.10/docs/api/ng/provider/$compileProvider#preAssignBindingsEnabled)
 * for more information.
 *
 * To enable/disable whether the controllers of dynamic AngularJS Material components
 * (i.e. dialog, panel, toast, bottomsheet) respect the AngularJS
 * `$compileProvider.preAssignBindingsEnabled` flag, call the AngularJS Material method:
 * `$mdCompilerProvider.respectPreAssignBindingsEnabled(boolean)`.
 *
 * This AngularJS Material *flag* doesn't affect directives/components created via regular
 * AngularJS methods. These constitute the majority of AngularJS Material and user-created
 * components. Only dynamic construction of elements such as Dialogs, Panels, Toasts, BottomSheets,
 * etc. may be affected. Invoking `$mdCompilerProvider.respectPreAssignBindingsEnabled(true)`
 * will effect **bindings** in controllers created by AngularJS Material's services like
 * `$mdDialog`, `$mdPanel`, `$mdToast`, or `$mdBottomSheet`.
 *
 * See [$mdCompilerProvider.respectPreAssignBindingsEnabled](#mdcompilerprovider-respectpreassignbindingsenabled-respected)
 * for the details of how the different versions and settings of AngularJS affect this behavior.
 *
 * @usage
 *
 * Respect the AngularJS Compiler Setting
 *
 * <hljs lang="js">
 *   app.config(function($mdCompilerProvider) {
 *     $mdCompilerProvider.respectPreAssignBindingsEnabled(true);
 *   });
 * </hljs>
 *
 * @example
 * Using the default (backwards compatible) values for AngularJS 1.6
 * - AngularJS' `$compileProvider.preAssignBindingsEnabled(false)`
 * - AngularJS Material's `$mdCompilerProvider.respectPreAssignBindingsEnabled(false)`
 * <br><br>
 *
 * <hljs lang="js">
 * $mdDialog.show({
 *   locals: {
 *     myVar: true
 *   },
 *   controller: MyController,
 *   bindToController: true
 * }
 *
 * function MyController() {
 *   // Locals from Angular Material are available. e.g myVar is true.
 * }
 *
 * MyController.prototype.$onInit = function() {
 *   // Bindings are also available in the $onInit lifecycle hook.
 * }
 * </hljs>
 *
 * Recommended Settings for AngularJS 1.6
 * - AngularJS' `$compileProvider.preAssignBindingsEnabled(false)`
 * - AngularJS Material's `$mdCompilerProvider.respectPreAssignBindingsEnabled(true)`
 * <br><br>
 *
 * <hljs lang="js">
 * $mdDialog.show({
 *   locals: {
 *     myVar: true
 *   },
 *   controller: MyController,
 *   bindToController: true
 * }
 *
 * function MyController() {
 *   // No locals from Angular Material are available. e.g myVar is undefined.
 * }
 *
 * MyController.prototype.$onInit = function() {
 *   // Bindings are now available in the $onInit lifecycle hook.
 * }
 * </hljs>
 *
 */
MdCompilerProvider.$inject = ['$compileProvider'];
function MdCompilerProvider($compileProvider) {

  var provider = this;

  /**
   * @ngdoc method
   * @name $mdCompilerProvider#respectPreAssignBindingsEnabled
   *
   * @param {boolean=} respected update the `respectPreAssignBindingsEnabled` state if provided,
   * otherwise just return the current Material `respectPreAssignBindingsEnabled` state.
   * @returns {boolean|MdCompilerProvider} current value if used as getter or itself (chaining)
   *  if used as setter
   *
   * @description
   * Call this method to enable/disable whether Material-specific (dialog/panel/toast/bottomsheet)
   * controllers respect the AngularJS `$compileProvider.preAssignBindingsEnabled` flag. Note that
   * this doesn't affect directives/components created via regular AngularJS methods which
   * constitute most Material and user-created components.
   *
   * If disabled (`false`), the compiler assigns the value of each of the bindings to the
   * properties of the controller object before the constructor of this object is called.
   *
   * If enabled (`true`) the behavior depends on the AngularJS version used:
   *
   * - `<1.5.10` - bindings are pre-assigned.
   * - `>=1.5.10 <1.7` - behaves like set to whatever `$compileProvider.preAssignBindingsEnabled()` reports.
   *    If the `preAssignBindingsEnabled` flag wasn't set manually, it defaults to pre-assigning bindings
   *    with AngularJS `1.5.x` and to calling the constructor first with AngularJS `1.6.x`.
   * - `>=1.7` - the compiler calls the constructor first before assigning bindings and
   *    `$compileProvider.preAssignBindingsEnabled()` no longer exists.
   *
   * The default value is `false` but will change to `true` in AngularJS Material 1.2.
   *
   * It is recommended to set this flag to `true` in AngularJS Material 1.1.x. The only reason
   * it's not set that way by default is backwards compatibility. Not setting the flag to `true`
   * when AngularJS' `$compileProvider.preAssignBindingsEnabled()` is set to `false`
   * (i.e. default behavior in AngularJS 1.6 or newer) makes it hard to unit test
   * Material Dialog/Panel/Toast/BottomSheet controllers using the `$controller` helper
   * as it always follows the `$compileProvider.preAssignBindingsEnabled()` value.
   */
  // TODO change it to `true` in Material 1.2.
  var respectPreAssignBindingsEnabled = false;
  this.respectPreAssignBindingsEnabled = function(respected) {
    if (angular.isDefined(respected)) {
      respectPreAssignBindingsEnabled = respected;
      return this;
    }

    return respectPreAssignBindingsEnabled;
  };

  /**
   * @private
   * @description
   * This function returns `true` if AngularJS Material-specific (dialog/panel/toast/bottomsheet) controllers have
   * bindings pre-assigned in controller constructors and `false` otherwise.
   *
   * Note that this doesn't affect directives/components created via regular AngularJS methods which constitute most
   * Material and user-created components; their behavior can be checked via
   * `$compileProvider.preAssignBindingsEnabled()` in AngularJS `>=1.5.10 <1.7.0`.
   *
   * @returns {*} current preAssignBindingsEnabled state
   */
  function getPreAssignBindingsEnabled() {
    if (!respectPreAssignBindingsEnabled) {
      // respectPreAssignBindingsEnabled === false
      // We're ignoring the AngularJS `$compileProvider.preAssignBindingsEnabled()` value in this case.
      return true;
    }

    // respectPreAssignBindingsEnabled === true

    // This check is needed because $compileProvider.preAssignBindingsEnabled does not exist prior
    // to AngularJS 1.5.10, is deprecated in AngularJS 1.6.x, and removed in AngularJS 1.7.x.
    if (typeof $compileProvider.preAssignBindingsEnabled === 'function') {
      return $compileProvider.preAssignBindingsEnabled();
    }

    // Flag respected but not present => apply logic based on AngularJS version used.
    if (angular.version.major === 1 && angular.version.minor < 6) {
      // AngularJS <1.5.10
      return true;
    }

    // AngularJS >=1.7.0
    return false;
  }

  this.$get = ["$q", "$templateRequest", "$injector", "$compile", "$controller",
    function($q, $templateRequest, $injector, $compile, $controller) {
      return new MdCompilerService($q, $templateRequest, $injector, $compile, $controller);
    }];

  /**
   * @ngdoc service
   * @name $mdCompiler
   * @module material.core.compiler
   * @description
   * The $mdCompiler service is an abstraction of AngularJS's compiler, that allows developers
   * to easily compile an element with options like in a Directive Definition Object.
   *
   * > The compiler powers a lot of components inside of AngularJS Material.
   * > Like the `$mdPanel` or `$mdDialog`.
   *
   * @usage
   *
   * Basic Usage with a template
   *
   * <hljs lang="js">
   *   $mdCompiler.compile({
   *     templateUrl: 'modal.html',
   *     controller: 'ModalCtrl',
   *     locals: {
   *       modal: myModalInstance;
   *     }
   *   }).then(function (compileData) {
   *     compileData.element; // Compiled DOM element
   *     compileData.link(myScope); // Instantiate controller and link element to scope.
   *   });
   * </hljs>
   *
   * Example with a content element
   *
   * <hljs lang="js">
   *
   *   // Create a virtual element and link it manually.
   *   // The compiler doesn't need to recompile the element each time.
   *   var myElement = $compile('<span>Test</span>')(myScope);
   *
   *   $mdCompiler.compile({
   *     contentElement: myElement
   *   }).then(function (compileData) {
   *     compileData.element // Content Element (same as above)
   *     compileData.link // This does nothing when using a contentElement.
   *   });
   * </hljs>
   *
   * > Content Element is a significant performance improvement when the developer already knows that the
   * > compiled element will be always the same and the scope will not change either.
   *
   * The `contentElement` option also supports DOM elements which will be temporary removed and restored
   * at its old position.
   *
   * <hljs lang="js">
   *   var domElement = document.querySelector('#myElement');
   *
   *   $mdCompiler.compile({
   *     contentElement: myElement
   *   }).then(function (compileData) {
   *     compileData.element // Content Element (same as above)
   *     compileData.link // This does nothing when using a contentElement.
   *   });
   * </hljs>
   *
   * The `$mdCompiler` can also query for the element in the DOM itself.
   *
   * <hljs lang="js">
   *   $mdCompiler.compile({
   *     contentElement: '#myElement'
   *   }).then(function (compileData) {
   *     compileData.element // Content Element (same as above)
   *     compileData.link // This does nothing when using a contentElement.
   *   });
   * </hljs>
   *
   */
  function MdCompilerService($q, $templateRequest, $injector, $compile, $controller) {

    /** @private @const {!angular.$q} */
    this.$q = $q;

    /** @private @const {!angular.$templateRequest} */
    this.$templateRequest = $templateRequest;

    /** @private @const {!angular.$injector} */
    this.$injector = $injector;

    /** @private @const {!angular.$compile} */
    this.$compile = $compile;

    /** @private @const {!angular.$controller} */
    this.$controller = $controller;
  }

  /**
   * @ngdoc method
   * @name $mdCompiler#compile
   * @description
   *
   * A method to compile a HTML template with the AngularJS compiler.
   * The `$mdCompiler` is wrapper around the AngularJS compiler and provides extra functionality
   * like controller instantiation or async resolves.
   *
   * @param {!Object} options An options object, with the following properties:
   *
   *    - `controller` - `{string|function}` Controller fn that should be associated with
   *         newly created scope or the name of a registered controller if passed as a string.
   *    - `controllerAs` - `{string=}` A controller alias name. If present the controller will be
   *         published to scope under the `controllerAs` name.
   *    - `contentElement` - `{string|Element}`: Instead of using a template, which will be
   *         compiled each time, you can also use a DOM element.<br/>
   *    - `template` - `{string=}` An html template as a string.
   *    - `templateUrl` - `{string=}` A path to an html template.
   *    - `transformTemplate` - `{function(template)=}` A function which transforms the template after
   *        it is loaded. It will be given the template string as a parameter, and should
   *        return a a new string representing the transformed template.
   *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
   *        be injected into the controller. If any of these dependencies are promises, the compiler
   *        will wait for them all to be resolved, or if one is rejected before the controller is
   *        instantiated `compile()` will fail..
   *      * `key` - `{string}`: a name of a dependency to be injected into the controller.
   *      * `factory` - `{string|function}`: If `string` then it is an alias for a service.
   *        Otherwise if function, then it is injected and the return value is treated as the
   *        dependency. If the result is a promise, it is resolved before its value is
   *        injected into the controller.
   *
   * @returns {Object} promise A promise, which will be resolved with a `compileData` object.
   * `compileData` has the following properties:
   *
   *   - `element` - `{Element}`: an uncompiled element matching the provided template.
   *   - `link` - `{function(scope)}`: A link function, which, when called, will compile
   *     the element and instantiate the provided controller (if given).
   *   - `locals` - `{Object}`: The locals which will be passed into the controller once `link` is
   *     called. If `bindToController` is true, they will be copied to the ctrl instead
   */
  MdCompilerService.prototype.compile = function(options) {

    if (options.contentElement) {
      return this._prepareContentElement(options);
    } else {
      return this._compileTemplate(options);
    }

  };

  /**
   * Instead of compiling any template, the compiler just fetches an existing HTML element from the DOM and
   * provides a restore function to put the element back it old DOM position.
   * @param {!Object} options Options to be used for the compiler.
   */
  MdCompilerService.prototype._prepareContentElement = function(options) {

    var contentElement = this._fetchContentElement(options);

    return this.$q.resolve({
      element: contentElement.element,
      cleanup: contentElement.restore,
      locals: {},
      link: function() {
        return contentElement.element;
      }
    });

  };

  /**
   * Compiles a template by considering all options and waiting for all resolves to be ready.
   * @param {!Object} options Compile options
   * @returns {!Object} Compile data with link function.
   */
  MdCompilerService.prototype._compileTemplate = function(options) {

    var self = this;
    var templateUrl = options.templateUrl;
    var template = options.template || '';
    var resolve = angular.extend({}, options.resolve);
    var locals = angular.extend({}, options.locals);
    var transformTemplate = options.transformTemplate || angular.identity;

    // Take resolve values and invoke them.
    // Resolves can either be a string (value: 'MyRegisteredAngularConst'),
    // or an invokable 'factory' of sorts: (value: function ValueGetter($dependency) {})
    angular.forEach(resolve, function(value, key) {
      if (angular.isString(value)) {
        resolve[key] = self.$injector.get(value);
      } else {
        resolve[key] = self.$injector.invoke(value);
      }
    });

    // Add the locals, which are just straight values to inject
    // eg locals: { three: 3 }, will inject three into the controller
    angular.extend(resolve, locals);

    if (templateUrl) {
      resolve.$$ngTemplate = this.$templateRequest(templateUrl);
    } else {
      resolve.$$ngTemplate = this.$q.when(template);
    }


    // Wait for all the resolves to finish if they are promises
    return this.$q.all(resolve).then(function(locals) {

      var template = transformTemplate(locals.$$ngTemplate, options);
      var element = options.element || angular.element('<div>').html(template.trim()).contents();

      return self._compileElement(locals, element, options);
    });

  };

  /**
   * Method to compile an element with the given options.
   * @param {!Object} locals Locals to be injected to the controller if present
   * @param {!JQLite} element Element to be compiled and linked
   * @param {!Object} options Options to be used for linking.
   * @returns {!Object} Compile data with link function.
   */
  MdCompilerService.prototype._compileElement = function(locals, element, options) {
    var self = this;
    var ngLinkFn = this.$compile(element);

    var compileData = {
      element: element,
      cleanup: element.remove.bind(element),
      locals: locals,
      link: linkFn
    };

    function linkFn(scope) {
      locals.$scope = scope;

      // Instantiate controller if the developer provided one.
      if (options.controller) {

        var injectLocals = angular.extend({}, locals, {
          $element: element
        });

        // Create the specified controller instance.
        var ctrl = self._createController(options, injectLocals, locals);

        // Unique identifier for AngularJS Route ngView controllers.
        element.data('$ngControllerController', ctrl);
        element.children().data('$ngControllerController', ctrl);

        // Expose the instantiated controller to the compile data
        compileData.controller = ctrl;
      }

      // Invoke the AngularJS $compile link function.
      return ngLinkFn(scope);
    }

    return compileData;

  };

  /**
   * Creates and instantiates a new controller with the specified options.
   * @param {!Object} options Options that include the controller
   * @param {!Object} injectLocals Locals to to be provided in the controller DI.
   * @param {!Object} locals Locals to be injected to the controller.
   * @returns {!Object} Created controller instance.
   */
  MdCompilerService.prototype._createController = function(options, injectLocals, locals) {
    // The third and fourth arguments to $controller are considered private and are undocumented:
    // https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L86
    // Passing `true` as the third argument causes `$controller` to return a function that
    // gets the controller instance instead returning of the instance directly. When the
    // controller is defined as a function, `invokeCtrl.instance` is the *same instance* as
    // `invokeCtrl()`. However, then the controller is an ES6 class, `invokeCtrl.instance` is a
    // *different instance* from `invokeCtrl()`.
    var invokeCtrl = this.$controller(options.controller, injectLocals, true, options.controllerAs);

    if (getPreAssignBindingsEnabled() && options.bindToController) {
      angular.extend(invokeCtrl.instance, locals);
    }

    // Instantiate and initialize the specified controller.
    var ctrl = invokeCtrl();

    if (!getPreAssignBindingsEnabled() && options.bindToController) {
      angular.extend(ctrl, locals);
    }

    // Call the $onInit hook if it's present on the controller.
    angular.isFunction(ctrl.$onInit) && ctrl.$onInit();

    return ctrl;
  };

  /**
   * Fetches an element removing it from the DOM and using it temporary for the compiler.
   * Elements which were fetched will be restored after use.
   * @param {!Object} options Options to be used for the compilation.
   * @returns {{element: !JQLite, restore: !function}}
   */
  MdCompilerService.prototype._fetchContentElement = function(options) {

    var contentEl = options.contentElement;
    var restoreFn = null;

    if (angular.isString(contentEl)) {
      contentEl = document.querySelector(contentEl);
      restoreFn = createRestoreFn(contentEl);
    } else {
      contentEl = contentEl[0] || contentEl;

      // When the element is visible in the DOM, then we restore it at close of the dialog.
      // Otherwise it will be removed from the DOM after close.
      if (document.contains(contentEl)) {
        restoreFn = createRestoreFn(contentEl);
      } else {
        restoreFn = function() {
          if (contentEl.parentNode) {
            contentEl.parentNode.removeChild(contentEl);
          }
        };
      }
    }

    return {
      element: angular.element(contentEl),
      restore: restoreFn
    };

    function createRestoreFn(element) {
      var parent = element.parentNode;
      var nextSibling = element.nextElementSibling;

      return function() {
        if (!nextSibling) {
          // When the element didn't had any sibling, then it can be simply appended to the
          // parent, because it plays no role, which index it had before.
          parent.appendChild(element);
        } else {
          // When the element had a sibling, which marks the previous position of the element
          // in the DOM, we insert it correctly before the sibling, to have the same index as
          // before.
          parent.insertBefore(element, nextSibling);
        }
      };
    }
  };
}

