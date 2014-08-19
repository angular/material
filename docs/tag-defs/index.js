module.exports = [
  {
    name: 'order',
    defaultFn: function(doc) {
      return doc.name;
    }
  },
  {
    name: 'paramType',
    defaultFn: function(doc) {
      return doc.name.charAt(0).toUpperCase() + doc.name.substring(1);
    }
  }
];
