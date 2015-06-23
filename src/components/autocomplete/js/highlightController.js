angular
    .module('material.components.autocomplete')
    .controller('MdHighlightCtrl', MdHighlightCtrl);

function MdHighlightCtrl ($scope, $element, $interpolate) {
  this.init = init;

  return init();

  function init (term) {
    var unsafeText = $interpolate($element.html())($scope),
        text = angular.element('<div>').text(unsafeText).html(),
        flags = $element.attr('md-highlight-flags') || '',
        watcher = $scope.$watch(term, function (term) {
          var regex = getRegExp(term, flags),
              html = text.replace(regex, '<span class="highlight">$&</span>');
          $element.html(html);
        });
    $element.on('$destroy', function () { watcher(); });
  }

  function sanitize (term) {
    if (!term) return term;
    return term.replace(/[\\\^\$\*\+\?\.\(\)\|\{\}\[\]]/g, '\\$&');
  }

  function getRegExp (text, flags) {
    var str = '';
    if (flags.indexOf('^') >= 1) str += '^';
    str += text;
    if (flags.indexOf('$') >= 1) str += '$';
    return new RegExp(sanitize(str), flags.replace(/[\$\^]/g, ''));
  }
}
