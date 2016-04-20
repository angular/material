(function () {
  'use strict';

  // If we do not have CryptoJS defined; import it
  if (typeof CryptoJS === 'undefined') {
    var cryptoSrc = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/md5.js';
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', cryptoSrc);
    document.body.appendChild(scriptTag);
  }

  angular
      .module('contactChipsDemo', ['ngMaterial'])
      .controller('ContactChipDemoCtrl', DemoCtrl);

  function DemoCtrl ($q, $timeout, $log, $mdConstant) {
    var self = this;
    var pendingSearch, cancelSearch = angular.noop;
    var lastSearch;

    self.allContacts = loadContacts();
    self.contacts = [self.allContacts[0]];
    self.asyncContacts = [];
    self.keys = [$mdConstant.KEY_CODE.COMMA];

    self.querySearch = querySearch;
    self.delayedQuerySearch = delayedQuerySearch;
    self.onModelChange = onModelChange;

    /**
     * Search for contacts; use a random delay to simulate a remote call
     */
    function querySearch (criteria) {
      return criteria ? self.allContacts.filter(createFilterFor(criteria)) : [];
    }

    /**
     * Async search for contacts
     * Also debounce the queries; since the md-contact-chips does not support this
     */
    function delayedQuerySearch(criteria) {
      if (!pendingSearch || !debounceSearch())  {
        cancelSearch();

        return pendingSearch = $q(function(resolve, reject) {
          // Simulate async search... (after debouncing)
          cancelSearch = reject;
          $timeout(function() {

            resolve( self.querySearch(criteria) );

            refreshDebounce();
          }, Math.random() * 500, true);
        });
      }

      return pendingSearch;
    }

    function refreshDebounce() {
      lastSearch = 0;
      pendingSearch = null;
      cancelSearch = angular.noop;
    }

    /**
     * Debounce if querying faster than 300ms
     */
    function debounceSearch() {
      var now = new Date().getMilliseconds();
      lastSearch = lastSearch || now;

      return ((now - lastSearch) < 300);
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = query.toLowerCase();

      return function filterFn(contact) {
        return (contact._lowername.indexOf(lowercaseQuery) !== -1);
      };

    }

    function onModelChange(newModel) {
      $log.log('The model has changed to ' + JSON.stringify(newModel) + '.');
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
        var email = cParts[0][0].toLowerCase() + '.' + cParts[1].toLowerCase() + '@example.com';
        var hash = CryptoJS.MD5(email);

        var contact = {
          name: c,
          email: email,
          image: '//www.gravatar.com/avatar/' + hash + '?s=50&d=retro'
        };
        contact._lowername = contact.name.toLowerCase();
        return contact;
      });
    }
  }
})();
