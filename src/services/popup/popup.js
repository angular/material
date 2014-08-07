angular.module('material.services.popup', [
  'material.services.compiler'
])
  .factory('$materialPopup', [
    '$materialCompiler',
    '$animate',
    '$rootScope',
    '$rootElement',
    PopupFactory
  ]);

function PopupFactory($materialCompiler, $animate, $rootScope, $rootElement) {

  return createPopup;

  function createPopup(options) {
    var appendTo = options.appendTo || $rootElement;
    var scope = (options.scope || $rootScope).$new(true);

    return $materialCompiler.compile(options).then(function(compileData) {
      var self;

      return self = angular.extend({
        enter: enter,
        destroy: destroy,
        scope: scope
      }, compileData);

      function enter(done) {
        var after = appendTo[0].lastElementChild;
        $animate.enter(self.element, appendTo, after && angular.element(after), done);

        //On the first enter, compile the element
        if (!self.compiled) {
          compileData.link(scope);
          self.compiled = true;
        }
      }
      function destroy(done) {
        $animate.leave(self.element, function() {
          scope.$destroy();
          (done || angular.noop)();
        });
      }
    });
  }
}
