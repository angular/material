/**
 * @ngdoc module
 * @name material.core.compiler
 * @description
 * Angular Material template and element compiler.
 */
angular
  .module('material.core')
  .service('$mdCompiler', MdCompilerService);

/**
 * @ngdoc service
 * @name $mdCompiler
 * @module material.core.compiler
 * @description
 * The $mdCompiler service is an abstraction of Angular's compiler, that allows developers
 * to easily compile an element with options like in a Directive Definition Object.
 *
 * > The compiler powers a lot of components inside of Angular Material.
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
 * A method to compile a HTML template with the Angular compiler.
 * The `$mdCompiler` is wrapper around the Angular compiler and provides extra functionality
 * like controller instantiation or async resolves.
 *
 * @param {!Object} options An options object, with the following properties:
 *
 *    - `controller` - `{string|Function}` Controller fn that should be associated with
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
 *   - `element` - `{element}`: an uncompiled element matching the provided template.
 *   - `link` - `{function(scope)}`: A link function, which, when called, will compile
 *     the element and instantiate the provided controller (if given).
 *   - `locals` - `{object}`: The locals which will be passed into the controller once `link` is
 *     called. If `bindToController` is true, they will be coppied to the ctrl instead
 *
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
 * @private
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
 * @private
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
 * @private
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

      var injectLocals = angular.extend(locals, {
        $element: element
      });

      var invokeCtrl = self.$controller(options.controller, injectLocals, true, options.controllerAs);

      if (options.bindToController) {
        angular.extend(invokeCtrl.instance, locals);
      }

      var ctrl = invokeCtrl();

      // Unique identifier for Angular Route ngView controllers.
      element.data('$ngControllerController', ctrl);
      element.children().data('$ngControllerController', ctrl);

      // Expose the instantiated controller to the compile data
      compileData.controller = ctrl;
    }

    // Invoke the Angular $compile link function.
    return ngLinkFn(scope);
  }

  return compileData;

};

/**
 * Fetches an element removing it from the DOM and using it temporary for the compiler.
 * Elements which were fetched will be restored after use.
 * @param {!Object} options Options to be used for the compilation.
 * @returns {{element: !JQLite, restore: !Function}}
 * @private
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
      }
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
    }
  }
};

