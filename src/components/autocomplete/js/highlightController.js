angular
    .module('material.components.autocomplete')
    .controller('MdHighlightCtrl', MdHighlightCtrl);

function MdHighlightCtrl ($scope, $element, $attrs) {
  this.init = init;

  function init (termExpr, unsafeTextExpr) {
    var text = null,
        regex = null,
        flags = $attrs.mdHighlightFlags || '',
        watcher = $scope.$watch(function($scope) {
          return {
            term: termExpr($scope),
            unsafeText: unsafeTextExpr($scope)
          };
        }, function (state, prevState) {
          if (text === null || state.unsafeText !== prevState.unsafeText) {
            text = angular.element('<div>').text(state.unsafeText).html()
          }
          if (regex === null || state.term !== prevState.term) {
            regex = getRegExp(state.term, flags);
          }

          $element.html(text.replace(regex, '<span class="highlight">$&</span>'));
        }, true);
    $element.on('$destroy', watcher);
  }

  function sanitize (term) {
    return term && term.replace(/[\\\^\$\*\+\?\.\(\)\|\{}\[\]]/g, '\\$&');
  }

  function getRegExp (text, flags) {
    var str = '';
    if (flags.indexOf('^') >= 1) str += '^';
    str += text;
    if (flags.indexOf('$') >= 1) str += '$';
    return new RegExp(sanitize(str), flags.replace(/[\$\^]/g, ''));
  }
}
