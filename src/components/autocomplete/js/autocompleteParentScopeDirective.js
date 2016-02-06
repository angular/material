angular
  .module('material.components.autocomplete')
  .directive('mdAutocompleteParentScope', MdAutocompleteItemScopeDirective);

function MdAutocompleteItemScopeDirective($compile, $mdUtil) {
  return {
    restrict: 'AE',
    compile: compile,
    terminal: true,
    transclude: 'element'
  };

  function compile(tElement, tAttr, transclude) {
    return function postLink(scope, element, attr) {
      var ctrl = scope.$mdAutocompleteCtrl;
      var newScope = ctrl.parent.$new();
      var itemName = ctrl.itemName;

      // Watch for changes to our scope's variables and copy them to the new scope
      watchVariable('$index', '$index');
      watchVariable('item', itemName);

      // Ensure that $digest calls on our scope trigger $digest on newScope.
      connectScopes();

      // Link the element against newScope.
      transclude(newScope, function(clone) {
        element.after(clone);
      });

      /**
       * Creates a watcher for variables that are copied from the parent scope
       * @param variable
       * @param alias
       */
      function watchVariable(variable, alias) {
        newScope[alias] = scope[variable];

        scope.$watch(variable, function(value) {
          $mdUtil.nextTick(function() {
            newScope[alias] = value;
          });
        });
      }

      /**
       * Creates watchers on scope and newScope that ensure that for any
       * $digest of scope, newScope is also $digested.
       */
      function connectScopes() {
        var scopeDigesting = false;
        var newScopeDigesting = false;

        scope.$watch(function() {
          if (newScopeDigesting || scopeDigesting) {
            return;
          }

          scopeDigesting = true;
          scope.$$postDigest(function() {
            if (!newScopeDigesting) {
              newScope.$digest();
            }

            scopeDigesting = newScopeDigesting = false;
          });
        });

        newScope.$watch(function() {
          newScopeDigesting = true;
        });
      }
    };
  }
}