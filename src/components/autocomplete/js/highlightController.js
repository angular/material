angular
    .module('material.components.autocomplete')
    .controller('MdHighlightCtrl', MdHighlightCtrl);

function MdHighlightCtrl ($scope, $element, $attrs) {
  this.$scope = $scope;
  this.$element = $element;
  this.$attrs = $attrs;

  // Cache the Regex to avoid rebuilding each time.
  this.regex = null;
}

MdHighlightCtrl.prototype.init = function(unsafeTermFn, unsafeContentFn) {

  this.flags = this.$attrs.mdHighlightFlags || '';

  this.unregisterFn = this.$scope.$watch(function($scope) {
    return {
      term: unsafeTermFn($scope),
      contentText: unsafeContentFn($scope)
    };
  }.bind(this), this.onRender.bind(this), true);

  this.$element.on('$destroy', this.unregisterFn);
};

/**
 * Triggered once a new change has been recognized and the highlighted
 * text needs to be updated.
 */
MdHighlightCtrl.prototype.onRender = function(state, prevState) {

  var contentText = state.contentText;

  /* Update the regex if it's outdated, because we don't want to rebuilt it constantly. */
  if (this.regex === null || state.term !== prevState.term) {
    this.regex = this.createRegex(state.term, this.flags);
  }

  /* If a term is available apply the regex to the content */
  if (state.term) {
    this.applyRegex(contentText);
  } else {
    this.$element.text(contentText);
  }

};

/**
 * Decomposes the specified text into different tokens (whether match or not).
 * Breaking down the string guarantees proper XSS protection due to the native browser
 * escaping of unsafe text.
 */
MdHighlightCtrl.prototype.applyRegex = function(text) {
  var tokens = this.resolveTokens(text);

  this.$element.empty();

  tokens.forEach(function (token) {

    if (token.isMatch) {
      var tokenEl = angular.element('<span class="highlight">').text(token.text);

      this.$element.append(tokenEl);
    } else {
      this.$element.append(document.createTextNode(token));
    }

  }.bind(this));

};

  /**
 * Decomposes the specified text into different tokens by running the regex against the text.
 */
MdHighlightCtrl.prototype.resolveTokens = function(string) {
  var tokens = [];
  var lastIndex = 0;

  // Use replace here, because it supports global and single regular expressions at same time.
  string.replace(this.regex, function(match, index) {
    appendToken(lastIndex, index);

    tokens.push({
      text: match,
      isMatch: true
    });

    lastIndex = index + match.length;
  });

  // Append the missing text as a token.
  appendToken(lastIndex);

  return tokens;

  function appendToken(from, to) {
    var targetText = string.slice(from, to);
    targetText && tokens.push(targetText);
  }
};

/** Creates a regex for the specified text with the given flags. */
MdHighlightCtrl.prototype.createRegex = function(term, flags) {
  var startFlag = '', endFlag = '';
  var regexTerm = this.sanitizeRegex(term);

  if (flags.indexOf('^') >= 0) startFlag = '^';
  if (flags.indexOf('$') >= 0) endFlag = '$';

  return new RegExp(startFlag + regexTerm + endFlag, flags.replace(/[$\^]/g, ''));
};

/** Sanitizes a regex by removing all common RegExp identifiers */
MdHighlightCtrl.prototype.sanitizeRegex = function(term) {
  return term && term.toString().replace(/[\\\^\$\*\+\?\.\(\)\|\{}\[\]]/g, '\\$&');
};
