(function () {
  'use strict';
  angular
      .module('contactChipsDemo', ['ngMaterial'])
      .controller('ContactChipDemoCtrl', DemoCtrl);

  function DemoCtrl ($timeout, $q) {
    var self = this;

    self.querySearch = querySearch;
    self.delayedQuerySearch = delayedQuerySearch;
    self.allContacts = loadContacts();
    self.contacts = [self.allContacts[0]];
    self.asyncContacts = [];
    self.filterSelected = true;

    /**
     * Search for contacts.
     */
    function querySearch (query) {
      var results = query ?
          self.allContacts.filter(createFilterFor(query)) : [];
      return results;
    }

    /**
     * Search for contacts after a random delay.
     */
    function delayedQuerySearch(query) {
      return $timeout(function() {
        return self.querySearch(query);
      }, Math.random() * 1000, false);
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(contact) {
        return (contact._lowername.indexOf(lowercaseQuery) != -1);;
      };

    }

    function loadContacts() {
      var contacts = [
        'Marina Augustine',
        'Oddr Sarno',
        'Nick Giannopoulos',
        'Narayana Garner',
        'Anita Gros',
        'Megan Smith',
        'Tsvetko Metzger',
        'Hector Simek',
        'Some-guy withalongalastaname'
      ];

      return contacts.map(function (c, index) {
        var cParts = c.split(' ');
        var contact = {
          name: c,
          email: cParts[0][0].toLowerCase() + '.' + cParts[1].toLowerCase() + '@example.com',
          image: 'http://lorempixel.com/50/50/people?' + index
        };
        contact._lowername = contact.name.toLowerCase();
        return contact;
      });
    }
  }


})();
