angular.module('material.services.interimElement', [
  'material.services.compiler'
])
.factory('$$interimElementFactory', [
  '$q',
  '$rootScope',
  '$timeout',
  '$rootElement',
  '$materialCompiler',
  InterimElementFactory
]);

function InterimElementFactory($q, $rootScope, $timeout, $rootElement, $materialCompiler) {

  return createInterimElement;

  function createInterimElement(defaults) {
    var InterimElement = {};

    var deferred, hideTimeout, currentEl, lastOptions;

    var parent = $rootElement.find('body');
    if(!parent.length) parent = $rootElement;

    InterimElement.defaults = angular.extend({
      parent: parent,
      onShow: function(scope, $el, options) {
        return $animate.enter($el, options.parent);
      },
      onHide: function(scope, $el, options) {
        return $animate.leave($el);
      },
    }, defaults || {});

    InterimElement.show = function(options) {
      if(deferred) {
        InterimElement.hide();
      }

      deferred = $q.defer();

      options = options || {};

      lastOptions = options = angular.extend({
        scope: options.scope || $rootScope.$new()
      }, InterimElement.defaults, options);

      $materialCompiler.compile(options).then(function(compiledData) {
        currentEl = compiledData.link(options.scope);

        var ret = options.onShow(options.scope, currentEl, options);
        $q.when(ret).then(function() {
          if(options.hideTimeout) {
            hideTimeout = $timeout(InterimElement.hide, options.hideTimeout);
          }
        });
      });
      return deferred.promise;
    };

    InterimElement.hide = function() {
      var args = [].slice.call(arguments);
      var def = deferred;
      destroy().then(function() {
        def.resolve.apply(def, args);
      });
    };

    InterimElement.cancel = function() {
      var args = [].slice.call(arguments);
      var def = deferred;
      destroy().then(function() {
        def.reject.apply(def, args);
      });
    };

    function destroy() {
      var finish = $q.defer();
      deferred = undefined;
      if(hideTimeout) {
        $timeout.cancel(hideTimeout);
        hideTimeout = undefined;
      }

      var ret = lastOptions.onHide(lastOptions.scope, currentEl, lastOptions);
      return $q.when(ret).then(function() {
        lastOptions.scope.$destroy();
        finish.resolve();
      });
    }

    return InterimElement;
  }
}

