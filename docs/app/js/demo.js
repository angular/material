DocsApp.directive('docsDemo', [
  '$mdUtil',
function($mdUtil) {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'partials/docs-demo.tmpl.html',
    transclude: true,
    controller: ['$scope', '$element', '$attrs', '$interpolate', DocsDemoCtrl],
    controllerAs: 'demoCtrl',
    bindToController: true
  };

  function DocsDemoCtrl($scope, $element, $attrs, $interpolate) {
    var self = this;

    self.demoId = $interpolate($attrs.demoId || '')($scope.$parent);
    self.demoTitle = $interpolate($attrs.demoTitle || '')($scope.$parent);
    self.demoModule = $interpolate($attrs.demoModule || '')($scope.$parent);
    self.files = {
      css: [], js: [], html: []
    };

    self.addFile = function(name, contentsPromise) {
      var file = {
        name: name,
        contentsPromise: contentsPromise,
        fileType: name.split('.').pop()
      };
      contentsPromise.then(function(contents) {
        file.contents = contents;
      });

      if (name === 'index.html') {
        self.files.index = file;
      } else {
        self.files[file.fileType] = self.files[file.fileType] || [];
        self.files[file.fileType].push(file);
      }

      self.orderedFiles = []
        .concat(self.files.index || [])
        .concat(self.files.js || [])
        .concat(self.files.css || [])
        .concat(self.files.html || []);
    };
  }
}])
.directive('demoFile', ['$q', '$interpolate', function($q, $interpolate) {
  return {
    restrict: 'E',
    require: '^docsDemo',
    compile: compile
  };

  function compile(element, attr) {
    var contentsAttr = attr.contents;
    var html = element.html();
    var name = attr.name;
    element.contents().remove();

    return function postLink(scope, element, attr, docsDemoCtrl) {
      docsDemoCtrl.addFile(
        $interpolate(name)(scope), 
        $q.when(scope.$eval(contentsAttr) || html)
      );
      element.remove();
    };
  }
}]);
