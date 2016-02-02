DocsApp
.directive('layoutAlign', function() { return angular.noop; })
.directive('layout', function() { return angular.noop; })
.directive('docsDemo', ['$mdUtil', function($mdUtil) {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'partials/docs-demo.tmpl.html',
    transclude: true,
    controller: ['$scope', '$element', '$attrs', '$interpolate', 'codepen', DocsDemoCtrl],
    controllerAs: 'demoCtrl',
    bindToController: true
  };

  function DocsDemoCtrl($scope, $element, $attrs, $interpolate, codepen) {
    var self = this;

    self.interpolateCode = angular.isDefined($attrs.interpolateCode);
    self.demoId = $interpolate($attrs.demoId || '')($scope.$parent);
    self.demoTitle = $interpolate($attrs.demoTitle || '')($scope.$parent);
    self.demoModule = $interpolate($attrs.demoModule || '')($scope.$parent);

    $attrs.$observe('demoTitle',  function(value) { self.demoTitle  = value || self.demoTitle; });
    $attrs.$observe('demoId',     function(value) { self.demoId     = value || self.demoId; });
    $attrs.$observe('demoModule', function(value) { self.demoModule = value || self.demoModule;  });

    self.files = {
      css: [], js: [], html: []
    };

    self.addFile = function(name, contentsPromise) {
      var file = {
        name: convertName(name),
        contentsPromise: contentsPromise,
        fileType: name.split('.').pop()
      };
      contentsPromise.then(function(contents) {
        file.contents = contents;
      });

      if (name === 'index.html') {
        self.files.index = file;
      } else if (name === 'readme.html') {
       self.demoDescription = file;
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

    self.editOnCodepen = function() {
      codepen.editOnCodepen({
        title: self.demoTitle,
        files: self.files,
        id: self.demoId,
        module: self.demoModule
      });
    };

    function convertName(name) {
      switch(name) {
        case "index.html" : return "HTML";
        case "script.js" : return "JS";
        case "style.css" : return "CSS";
        default : return name;
      }
    }

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
}])

.filter('toHtml', ['$sce', function($sce) {
  return function(str) {
    return $sce.trustAsHtml(str);
  };
}]);
