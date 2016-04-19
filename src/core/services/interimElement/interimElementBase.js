angular
  .module('material.core')
  .factory('$$interimElementBase', InterimElementBase);

function InterimElementBase($mdUtil, $rootScope, $animate, $mdCompiler, $q, $$q, $mdTheming, $rootElement, $document,
                            $timeout) {
  return function(options) {
    var API;
    var element;
    var showAction = $q.when(true);

    prepareInterimElement();

    return API = {
      show: createAndShowElement,
      remove: _runRemoveExecution,
      options: options,
      deferred: $q.defer()
    };

    function _runRemoveExecution(response, isCancelled, opts) {
      // Abort and resolve when the previous show failed.
      if (!element) {
        return $q.when(false);
      }

      options = angular.extend(options, opts);
      options.cancelAutoHide && options.cancelAutoHide();
      options.element.triggerHandler('$mdInterimElementRemove');

      // When $destroy is set to true, then we are not waiting for the show transition to finish.
      if (options.$destroy) {
        return hideElement().then(function() {
          (isCancelled && API.deferred.reject(response)) || API.deferred.resolve(response);
        });
      } else {

        $q.when(showAction).finally(function() {
          hideElement().then(function() {

            (isCancelled && API.deferred.reject(response)) || API.deferred.resolve(response);

          }, API.deferred.reject);
        });

        return API.deferred.promise;
      }
    }

    function createAndShowElement() {
      var defer = $q.defer();

      compileElement(options).then(function(compiledData) {
        element = linkElement(compiledData);

        showAction = showElement(compiledData.controller).then(defer.resolve, rejectAll);
      }, rejectAll);

      function rejectAll(error) {
        API.deferred.reject(error);
        defer.reject(error);
      }

      return defer.promise;
    }

    function showElement(controller) {
      var notifyShowing = options.onShowing || angular.noop;
      var notifyComplete = options.onComplete || angular.noop;

      // Notify the `onShowing` function before the show process starts.
      notifyShowing(options.scope, element, options, controller);

      var defer = $q.defer();

      try {
        $q.when(options.onShow(options.scope, element, options, controller))
          .then(function() {

            notifyComplete(options.scope, element, options);
            startAutoHide();

            defer.resolve(element);

          }, defer.reject)

      } catch (err) {
        defer.reject(err.message);
      }

      return defer.promise;
    }

    function hideElement() {
      var defer = $$q.defer();
      var announceRemoving = options.onRemoving || angular.noop;

      try {
        var action = $$q.when(options.onRemove(options.scope, element, options) || true);

        announceRemoving(element, action);

        if (options.$destroy) {
          defer.resolve(element);
        } else {

          action.then(function() {

            if (!options.preserveScope && options.scope) {
              options.scope.$destroy();
            }

            defer.resolve(element);

          }, defer.reject);

        }

      } catch (err) {
        defer.reject(err.message);
      }

      return defer.promise;
    }

    function prepareInterimElement() {
      if (options.template) {
        options.template = $mdUtil.processTemplate(options.template);
      }

      // Apply default options to the interim element.
      options = angular.extend({
        preserveScope: false,
        cancelAutoHide : angular.noop,
        scope: options.scope || $rootScope.$new(options.isolateScope),

        onShow: function transitionIn(scope, element, options) {
          return $animate.enter(element, options.parent);
        },

        onRemove: function transitionOut(scope, element) {
          return element && $animate.leave(element) || $q.when();
        }
      }, options);
    }


    function compileElement(options) {
      return options.skipCompile ? mockCompile() : $mdCompiler.compile(options);

      function mockCompile() {
        return $q.when({
          locals: {},
          link: function () {
            return options.element;
          }
        });
      }
    }

    function linkElement(compiledData) {
      angular.extend(compiledData.locals, options);

      element = compiledData.link(options.scope);

      options.element = element;
      options.parent = findParent(element, options);

      if (options.themable) $mdTheming(element);

      return element;

    }

    function findParent(element, options) {
      var parent = options.parent;

      if (angular.isFunction(parent)) {
        parent = parent(options.scope, element, options);
      } else if (angular.isString(parent)) {
        parent = angular.element($document[0].querySelector(parent));
      } else {
        parent = angular.element(parent);
      }

      if (!parent || !parent.length) {
        var possibleParent;
        if ($rootElement[0].querySelector) {
          // We search for any body element, which is not inside of an SVG.
          possibleParent = $rootElement[0].querySelector(':not(svg) > body');
        }
        if (!possibleParent) possibleParent = $rootElement[0];
        if (possibleParent.nodeName == '#comment') possibleParent = $document[0].body;

        return angular.element(possibleParent);
      }

      return parent;
    }

    function startAutoHide() {
      var autoHideTimer;
      var cancelAutoHide = angular.noop;

      if (options.hideDelay) {
        autoHideTimer = $timeout(options._service.hideInterim, options.hideDelay) ;
        cancelAutoHide = function() {
          $timeout.cancel(autoHideTimer);
        }
      }

      options.cancelAutoHide = function() {
        cancelAutoHide();
        options.cancelAutoHide = undefined;
      }
    }

  }
}