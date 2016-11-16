(function() {
  angular.module('docsApp')
    .directive('docsCssApiTable', DocsCssApiTableDirective)
    .directive('docsCssSelector', DocsCssSelectorDirective);

  function DocsCssApiTableDirective() {
    return {
      restrict: 'E',
      transclude: true,

      bindToController: true,
      controller: function() {},
      controllerAs: '$ctrl',

      scope: {},

      template:
      '<table class="md-api-table md-css-table">' +
      '  <thead>' +
      '    <tr><th>Available Selectors</th></tr>' +
      '  </thead>' +
      '  <tbody ng-transclude>' +
      '  </tbody>' +
      '</table>'
    }
  }

  function DocsCssSelectorDirective() {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,

      bindToController: true,
      controller: function() {},
      controllerAs: '$ctrl',

      scope: {
        code: '@'
      },

      template:
      '<tr>' +
      '  <td>' +
      '    <code class="md-css-selector">{{$ctrl.code}}</code>' +
      '    <span ng-transclude></span>' +
      '  </td>' +
      '</tr>'
    }
  }
})();
