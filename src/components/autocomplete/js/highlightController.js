angular
    .module('material.components.autocomplete')
    .controller('MdHighlightCtrl', MdHighlightCtrl);

function MdHighlightCtrl ($scope, $element, $interpolate) {
  var ctrl = this;

  ctrl.term     = null;
  ctrl.template = null;
  ctrl.watchers = [];
  ctrl.init     = init;

  function init (term, template) {
    createWatchers(term, template);
    $element.on('$destroy', cleanup);
  }

  function createWatchers (term, template) {
    ctrl.watchers.push($scope.$watch(term, function (term) {
      ctrl.term = term;
      updateHTML(term, ctrl.template);
    }));
    ctrl.watchers.push($scope.$watch(compileTemplate, function (template) {
      ctrl.template = template;
      updateHTML(ctrl.term, template);
    }));

    function compileTemplate () { return $interpolate(template)($scope); }
  }

  function cleanup () {
    ctrl.watchers.forEach(function (watcher) { watcher(); });
  }

  function updateHTML () {
    if (ctrl.term === null || ctrl.template === null) return;
    var unsafeText = $interpolate(ctrl.template)($scope),
        text       = angular.element('<div>').text(unsafeText).html(),
        flags      = $element.attr('md-highlight-flags') || '',
        regex      = getRegExp(ctrl.term, flags),
        html       = text.replace(regex, '<span class="highlight">$&</span>');
    $element.html(html);
  }

  function sanitize (term) {
    if (!term) return term;
    return term.replace(/[\\\^\$\*\+\?\.\(\)\|\{}\[\]]/g, '\\$&');
  }

  function getRegExp (text, flags) {
    var str = '';
    if (flags.indexOf('^') >= 1) str += '^';
    str += text;
    if (flags.indexOf('$') >= 1) str += '$';
    return new RegExp(sanitize(str), flags.replace(/[\$\^]/g, ''));
  }
}
