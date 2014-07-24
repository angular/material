var _ = require('lodash');
var jsParser = require('esprima');
var walk = require('dgeni-packages/jsdoc/lib/walk');
var LEADING_STAR = /^[^\S\r\n]*\*[^\S\n\r]?/gm;

module.exports = {
  name: 'jsdoc',
  description: 'Read js documents',
  runAfter: ['files-read'],
  runBefore: ['parsing-tags'],
  exports: {
    //The jsdoc file reader isn't able to handle docs of non-js type,
    //so we simply put all the other docs into a placeholder array
    //until jsdoc processing is done
    otherDocs: ['value', []],
  },
  process: function(docs, config, otherDocs) {
    var jsdocDocs = [];
    docs.forEach(function(doc) {
      if (doc.docType === 'source' && doc.fileType === 'js') {
        jsdocDocs = jsdocDocs.concat(parseComments(doc));
      } else {
        otherDocs.push(doc);
      }
    });

    return jsdocDocs;
  }
};

function parseComments(doc) {
  var ast = jsParser.parse(doc.content, {
    loc: true,
    range: true,
    comment: true
  });

  // Below code is adapted from the jsdoc dgeni-package by Pete Bacon Darwin
  // https://github.com/angular/dgeni-packages
  // https://github.com/angular/dgeni-packages/blob/master/LICENSE
  return _(ast.comments)
    .filter(function(comment) {
      // To test for a jsdoc comment (i.e. starting with /** ), we need to check for 
      // a leading star since the parser strips off the first "/*"
      return comment.type === 'Block' && comment.value.charAt(0) === '*';
    })
    .map(function(comment) {
      // Strip off any leading stars
      var text = comment.value.replace(LEADING_STAR, '');

      // Trim off leading and trailing whitespace
      text = text.trim();

      // Extract the information about the code directly after this comment
      var codeNode = walk.findNodeAfter(ast, comment.range[1]);
      var codeAncestors = codeNode && walk.ancestor(ast, codeNode.node);

      // Create a doc from this comment
      return _.assign({}, doc, {
        startingLine: comment.loc.start.line,
        endingLine: comment.loc.end.line,
        content: text,
        codeNode: codeNode,
        codeAncestors: codeAncestors
      });
    })
    .value();
}
