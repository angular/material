(function() {
'use strict';

angular.module('material.core')
  .provider('$$interimElement', InterimElementProvider);

/*
 * @ngdoc service
 * @name $$interimElement
 * @module material.core
 *
 * @description
 *
 * Factory that contructs `$$interimElement.$service` services.
 * Used internally in material design for elements that appear on screen temporarily.
 * The service provides a promise-like API for interacting with the temporary
 * elements.
 *
 * ```js
 * app.service('$mdToast', function($$interimElement) {
 *   var $mdToast = $$interimElement(toastDefaultOptions);
 *   return $mdToast;
 * });
 * ```
 * @param {object=} defaultOptions Options used by default for the `show` method on the service.
 *
 * @returns {$$interimElement.$service}
 *
 */

function InterimElementProvider() {
  createInterimElementProvider.$get = InterimElementFactory;
  return createInterimElementProvider;

  /**
   * Returns a new provider which allows configuration of a new interimElement
   * service. Allows configuration of default options & methods for options,
   * as well as configuration of 'preset' methods (eg dialog.basic(): basic is a preset method)
   */
  function createInterimElementProvider(interimFactoryName) {
    var EXPOSED_METHODS = ['onHide', 'onShow', 'onRemove'];
    var providerConfig = {
      presets: {}
    };
    var provider = {
      setDefaults: setDefaults,
      addPreset: addPreset,
      $get: factory
    };

    /**
     * all interim elements will come with the 'build' preset
     */
    provider.addPreset('build', {
      methods: ['controller', 'controllerAs', 'resolve',
        'template', 'templateUrl', 'themable', 'transformTemplate', 'parent']
    });

    return provider;

    /**
     * Save the configured defaults to be used when the factory is instantiated
     */
    function setDefaults(definition) {
      providerConfig.optionsFactory = definition.options;
      providerConfig.methods = (definition.methods || []).concat(EXPOSED_METHODS);
      return provider;
    }

    /**
     * Save the configured preset to be used when the factory is instantiated
     */
    function addPreset(name, definition) {
      definition = definition || {};
      definition.methods = definition.methods || [];
      definition.options = definition.options || function() { return {}; };

      if (/^cancel|hide|show$/.test(name)) {
        throw new Error("Preset '" + name + "' in " + interimFactoryName + " is reserved!");
      }
      if (definition.methods.indexOf('_options') > -1) {
        throw new Error("Method '_options' in " + interimFactoryName + " is reserved!");
      }
      providerConfig.presets[name] = {
        methods: definition.methods.concat(EXPOSED_METHODS),
        optionsFactory: definition.options,
        argOption: definition.argOption
      };
      return provider;
    }

    /**
     * Create a factory that has the given methods & defaults implementing interimElement
     */
    /* @ngInject */
    function factory($$interimElement, $animate, $injector) {
      var defaultMethods;
      var defaultOptions;
      var interimElementService = $$interimElement();

      /*
       * publicService is what the developer will be using.
       * It has methods hide(), cancel(), show(), build(), and any other
       * presets which were set during the config phase.
       */
      var publicService = {
        hide: interimElementService.hide,
        cancel: interimElementService.cancel,
        show: showInterimElement
      };

      defaultMethods = providerConfig.methods || [];
      // This must be invoked after the publicService is initialized
      defaultOptions = invokeFactory(providerConfig.optionsFactory, {});

      angular.forEach(providerConfig.presets, function(definition, name) {
        var presetDefaults = invokeFactory(definition.optionsFactory, {});
        var presetMethods = (definition.methods || []).concat(defaultMethods);

        // Every interimElement built with a preset has a field called `$type`,
        // which matches the name of the preset.
        // Eg in preset 'confirm', options.$type === 'confirm'
        angular.extend(presetDefaults, { $type: name });

        // This creates a preset class which has setter methods for every
        // method given in the `.addPreset()` function, as well as every
        // method given in the `.setDefaults()` function.
        //
        // @example
        // .setDefaults({
        //   methods: ['hasBackdrop', 'clickOutsideToClose', 'escapeToClose', 'targetEvent'],
        //   options: dialogDefaultOptions
        // })
        // .addPreset('alert', {
        //   methods: ['title', 'ok'],
        //   options: alertDialogOptions
        // })
        //
        // Set values will be passed to the options when interimElemnt.show() is called.
        function Preset(opts) {
          this._options = angular.extend({}, presetDefaults, opts);
        }
        angular.forEach(presetMethods, function(name) {
          Preset.prototype[name] = function(value) {
            this._options[name] = value;
            return this;
          };
        });

        // eg $mdDialog.alert() will return a new alert preset
        publicService[name] = function(arg) {
          // If argOption is supplied, eg `argOption: 'content'`, then we assume
          // if the argument is not an options object then it is the `argOption` option.
          //
          // @example `$mdToast.simple('hello')` // sets options.content to hello
          //                                     // because argOption === 'content'
          if (arguments.length && definition.argOption && !angular.isObject(arg) &&
              !angular.isArray(arg)) {
            return (new Preset())[definition.argOption](arg);
          } else {
            return new Preset(arg);
          }

        };
      });

      return publicService;

      function showInterimElement(opts) {
        // opts is either a preset which stores its options on an _options field,
        // or just an object made up of options
        if (opts && opts._options) opts = opts._options;
        return interimElementService.show(
          angular.extend({}, defaultOptions, opts)
        );
      }

      /**
       * Helper to call $injector.invoke with a local of the factory name for
       * this provider.
       * If an $mdDialog is providing options for a dialog and tries to inject
       * $mdDialog, a circular dependency error will happen.
       * We get around that by manually injecting $mdDialog as a local.
       */
      function invokeFactory(factory, defaultVal) {
        var locals = {};
        locals[interimFactoryName] = publicService;
        return $injector.invoke(factory || function() { return defaultVal; }, {}, locals);
      }

    }

  }

  /* @ngInject */
  function InterimElementFactory($document, $q, $rootScope, $timeout, $rootElement, $animate,
                                 $mdCompiler, $mdTheming, $mdUtil) {

    return function createInterimElementService() {
      /*
       * @ngdoc service
       * @name $$interimElement.$service
       *
       * @description
       * A service used to control inserting and removing an element into the DOM.
       *
       */
      var stack = [];
      var service;
      return service = {
        show: show,
        hide: hide,
        cancel: cancel
      };

      /*
       * @ngdoc method
       * @name $$interimElement.$service#show
       * @kind function
       *
       * @description
       * Adds the `$interimElement` to the DOM and returns a promise that will be resolved or rejected
       * with hide or cancel, respectively.
       *
       * @param {*} options is hashMap of settings
       * @returns a Promise
       *
       */
      function show(options) {
        if (stack.length) {
          service.cancel();
        }

        var interimElement = new InterimElement(options);

        stack.push(interimElement);
        return interimElement.show().then(function() {
          return interimElement.deferred.promise;
        });
      }

      /*
       * @ngdoc method
       * @name $$interimElement.$service#hide
       * @kind function
       *
       * @description
       * Removes the `$interimElement` from the DOM and resolves the promise returned from `show`
       *
       * @param {*} resolveParam Data to resolve the promise with
       * @returns a Promise that will be resolved after the element has been removed.
       *
       */
      function hide(response) {
        var interimElement = stack.shift();
        interimElement && interimElement.remove().then(function() {
          interimElement.deferred.resolve(response);
        });

        return interimElement ? interimElement.deferred.promise : $q.when(response);
      }

      /*
       * @ngdoc method
       * @name $$interimElement.$service#cancel
       * @kind function
       *
       * @description
       * Removes the `$interimElement` from the DOM and rejects the promise returned from `show`
       *
       * @param {*} reason Data to reject the promise with
       * @returns Promise that will be rejected after the element has been removed.
       *
       */
      function cancel(reason) {
        var interimElement = stack.shift();
        interimElement && interimElement.remove().then(function() {
          interimElement.deferred.reject(reason);
        });

        return interimElement ? interimElement.deferred.promise : $q.reject(reason);
      }


      /*
       * Internal Interim Element Object
       * Used internally to manage the DOM element and related data
       */
      function InterimElement(options) {
        var self;
        var hideTimeout, element;

        options = options || {};
        options = angular.extend({
          scope: options.scope || $rootScope.$new(options.isolateScope),
          onShow: function(scope, element, options) {
            return $animate.enter(element, options.parent);
          },
          onRemove: function(scope, element, options) {
            // Element could be undefined if a new element is shown before
            // the old one finishes compiling.
            return element && $animate.leave(element) || $q.when();
          }
        }, options);

        if (options.template) {
          options.template = $mdUtil.replaceInterpolationSymbols(options.template);
        }

        return self = {
          options: options,
          deferred: $q.defer(),
          show: function() {
            return $mdCompiler.compile(options).then(function(compileData) {
              angular.extend(compileData.locals, self.options);

              // Search for parent at insertion time, if not specified
              if (angular.isString(options.parent)) {
                options.parent = angular.element($document[0].querySelector(options.parent));
              } else if (!options.parent) {
                options.parent = $rootElement.find('body');
                if (!options.parent.length) options.parent = $rootElement;
              }

              element = compileData.link(options.scope);
              if (options.themable) $mdTheming(element);
              var ret = options.onShow(options.scope, element, options);
              return $q.when(ret)
                .then(function(){
                  // Issue onComplete callback when the `show()` finishes
                  (options.onComplete || angular.noop)(options.scope, element, options);
                  startHideTimeout();
                });

              function startHideTimeout() {
                if (options.hideDelay) {
                  hideTimeout = $timeout(service.cancel, options.hideDelay) ;
                }
              }
            });
          },
          cancelTimeout: function() {
            if (hideTimeout) {
              $timeout.cancel(hideTimeout);
              hideTimeout = undefined;
            }
          },
          remove: function() {
            self.cancelTimeout();
            var ret = options.onRemove(options.scope, element, options);
            return $q.when(ret).then(function() {
              options.scope.$destroy();
            });
          }
        };
      }
    };
  }

}

})();
