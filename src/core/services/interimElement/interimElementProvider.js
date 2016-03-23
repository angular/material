angular
  .module('material.core')
  .provider('$$interimElement', InterimElementProvider);

function InterimElementProvider() {
  // This generates the basic interim element service for this provider.
  InterimElementConstructor.$get = InterimElementService;

  // This returns our actual provider factory which generates the interim element.
  return InterimElementConstructor;
}

function InterimElementConstructor(interimName) {
  var provider;
  var defaultMethods = ['onHide', 'onShow', 'onRemove'];

  var providerConfig = {
    globalMethods: {},
    presets: {}
  };

  _addPreset('build', {
    methods: ['controller', 'controllerAs', 'resolve',
      'template', 'templateUrl', 'themable', 'transformTemplate', 'parent']
  });

  return provider = {
    setDefaults: _setDefaults,
    addPreset: _addPreset,
    addMethod: _addMethod,
    $get: factory
  };

  function _setDefaults(definition) {
    definition = parseDefinition(definition);

    providerConfig.optionsFactory = definition.options;
    providerConfig.methods = defaultMethods.concat(definition.methods || []);

    return provider;
  }

  function _addPreset(name, definition) {
    definition = parseDefinition(definition);

    providerConfig.presets[name] = {
      argOption: definition.argOption,
      optionsFactory: definition.options,
      methods: defaultMethods.concat(definition.methods)
    };

    return provider;
  }

  function _addMethod(name, fn) {
    providerConfig.globalMethods[name] = fn;

    return provider;
  }

  function parseDefinition(definition, name) {
    definition.methods = definition.methods || [];
    definition.options = definition.options || function() { return {}; };

    if (name) {
      if (/^cancel|hide|show$/.test(name)) {
        throw new Error("Preset '" + name + "' in " + interimName + " is reserved!");
      } else if (definition.methods.indexOf('_options') != -1) {
        throw new Error("Method '_options' in " + interimName + " is reserved!");
      }
    }

    return definition;
  }

  function factory($$interimElement, $injector) {
    // This is needed, otherwise ng-annotator can't detect this function as a factory $get.
    'ngInject';

    var defaultMethods;
    var defaultOptions;
    var interimElement = $$interimElement();

    var publicService = {
      hide: interimElement.hideInterim,
      cancel: interimElement.cancelInterim,
      destroy : interimElement.destroyInterim,
      show: showInterimElement
    };

    defaultMethods = providerConfig.methods || [];
    defaultOptions = invokeFactory(providerConfig.optionsFactory, {});

    // Copy over the simple custom methods
    angular.forEach(providerConfig.globalMethods, function(fn, name) {
      publicService[name] = fn;
    });

    // Initializes all the presets and injects them to the service.
    angular.forEach(providerConfig.presets, function(definition, name) {

      var presetDefaults = invokeFactory(definition.optionsFactory, {});
      var presetMethods = (definition.methods || []).concat(defaultMethods);

      // Every interimElement built with a preset has a field called `$type`,
      // which matches the name of the preset.
      // Example: In a preset called 'confirm', the options.$type will be 'confirm'
      angular.extend(presetDefaults, { $type: name });

      function Preset(opts) {
        this._options = angular.extend({}, presetDefaults, opts);
      }

      angular.forEach(presetMethods, function(name) {
        Preset.prototype[name] = function(value) {
          this._options[name] = value;
          return this;
        };
      });

      // Create shortcut method for one-linear methods
      if (definition.argOption) {
        var methodName = 'show' + name.charAt(0).toUpperCase() + name.slice(1);
        publicService[methodName] = function(arg) {
          var config = publicService[name](arg);
          return publicService.show(config);
        };
      }

      // Example: $mdDialog.alert() will return a new alert preset
      publicService[name] = function(arg) {
        // If argOption is supplied, eg `argOption: 'content'`, then we assume
        // if the argument is not an options object then it is the `argOption` option.
        //
        // @example `$mdToast.simple('hello')`

        if (arguments.length && definition.argOption && !angular.isObject(arg) && !angular.isArray(arg)) {
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
      opts = opts || { };

      if (opts._options) {
        opts = opts._options;
      }

      return interimElement.showInterim(
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
      locals[interimName] = publicService;
      return $injector.invoke(factory || function() { return defaultVal; }, {}, locals);
    }
  }
}

function InterimElementService($$interimElementBase, $q) {
  // This is needed, otherwise ng-annotator can't detect this function as a factory $get.
  'ngInject';

  return function() {
    var API;
    var SHOW_CANCELLED = false;
    var showQueue = [];

    return API = {
      showInterim: _showInterim,
      hideInterim: _hideInterim,
      cancelInterim: _cancelInterim,
      destroyInterim: _destroyInterim
    };

    function _showInterim(options) {
      options = options || {};
      // We inject the actual interim service into the options.
      // This is needed for hideDelay etc. because it will call the service to hide the interim.
      // This important, because otherwise the showQueue won't be cleared.
      options._service = API;

      var interimElement = new $$interimElementBase(options || {});
      var hideExisting = !options.skipHide && showQueue.length ? API.hideInterim() : $q.when(true);

      // Wait for the current existing interim to be hidden.
      hideExisting.finally(function() {

        showQueue.push(interimElement);

        interimElement.show();

      });

      // Return a promise that will be resolved when the interim
      // element is hidden or cancelled.
      return interimElement.deferred.promise;
    }

    function _hideInterim(reason, options) {
      if (!showQueue.length) return $q.when(reason);
      options = options || {};

      if (options.closeAll) {
        var promise = $q.all(showQueue.reverse().map(closeElement));
        showQueue = [];
        return promise;
      } else if (options.closeTo !== undefined) {
        return $q.all(showQueue.splice(options.closeTo).map(closeElement));
      }

      var interim = showQueue.pop();
      return closeElement(interim);

      function closeElement(interim) {

        interim.remove(reason, false, options);

        return interim.deferred.promise;
      }
    }

    function _cancelInterim(reason, options) {
      var interim = showQueue.pop();
      if (!interim) return $q.when(reason);

      interim.remove(reason, true, options || {});

      return interim.deferred.promise;
    }

    function _destroyInterim(target) {
      var interim = !target ? showQueue.shift() : null;

      var cntr = angular.element(target).length ? angular.element(target)[0].parentNode : null;

      if (cntr) {

        // Try to find the interim element in the stack which corresponds to the supplied DOM element.
        var filtered = showQueue.filter(function(entry) {
          var currNode = entry.options.element[0];
          return currNode === cntr;
        });

        // Note: this function might be called when the element already has been removed, in which
        // case we won't find any matches. That's ok.
        if (filtered.length > 0) {
          interim = filtered[0];
          showQueue.splice(showQueue.indexOf(interim), 1);
        }
      }

      return interim ? interim.remove(SHOW_CANCELLED, false, { '$destroy': true }) : $q.when(SHOW_CANCELLED);
    }

  };
}