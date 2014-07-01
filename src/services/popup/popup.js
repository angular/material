angular.module('material.services.popup', ['material.services.compiler'])

  .factory('$materialPopup', [
    '$materialCompiler',
    '$timeout',
    '$document',
    '$animate',
    '$rootScope',
    '$rootElement',
    QpPopupFactory
  ]);

function QpPopupFactory($materialCompiler, $timeout, $document, $animate, $rootScope, $rootElement) {

  return createPopup;

  function createPopup(options) {
    var appendTo = options.appendTo || $rootElement;
    var scope = (options.scope || $rootScope).$new();

    return $materialCompiler.compile(options).then(function(compileData) {
      var self;

      return self = angular.extend({
        enter: enter,
        leave: leave,
        destroy: destroy,
        scope: scope
      }, compileData);

      function enter(done) {
        if (scope.$$destroyed || self.entered) return (done || angular.noop)();

        self.entered = true;
        var after = appendTo[0].lastElementChild;
        $animate.enter(self.element, appendTo, after && angular.element(after), done);

        //On the first enter, compile the element
        if (!self.compiled) {
          compileData.link(scope);
          self.compiled = true;
        }
      }
      function leave(done) {
        self.entered = false;
        $animate.leave(self.element, done);
      }
      function destroy(done) {
        if (scope.$$destroyed) return (done || angular.noop)();
        self.leave(function() {
          scope.$destroy();
          (done || angular.noop)();
        });
      }
    });
  }
}
