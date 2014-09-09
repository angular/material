
    isNodeType: function (node, type) {
      return node.tagName && (
        node.hasAttribute(type) ||
        node.hasAttribute('data-' + type) ||
        node.tagName.toLowerCase() === type ||
        node.tagName.toLowerCase() === 'data-' + type
      );
    },

    isNgRepeat: function (node) {
      var COMMENT_NODE = 8;
      return node.nodeType == COMMENT_NODE && node.nodeValue.indexOf('ngRepeat') > -1;
    },

    /**
     * Is the an empty text string
     * @param node
     * @returns {boolean}
     */
    isNodeEmpty: function (node) {
      var TEXT_NODE = 3,
          COMMENT_NODE = 8;
      return (node.nodeType == COMMENT_NODE) ||
        (node.nodeType == TEXT_NODE && !(node.nodeValue || '').trim());
    }

