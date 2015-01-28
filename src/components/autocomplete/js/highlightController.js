(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .controller('MdHighlightCtrl', MdHighlightCtrl);

  function MdHighlightCtrl ($scope, $element, $interpolate) {
    var term = $element.attr('md-highlight-text'),
        text = $interpolate($element.text())($scope);
    $scope.$watch(term, function (term) {
      var regex = new RegExp('^' + sanitize(term), 'i'),
          html = text.replace(regex, '<span class="highlight">$&</span>');
      $element.html(html);
    });

    function sanitize (term) {
      if (!term) return term;
      return term.replace(/[\*\[\]\(\)\{\}\\\^\$]/g, '\\$&');
    }
  }

})();
