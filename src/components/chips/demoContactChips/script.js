(function () {
  'use strict';

  // If we do not have CryptoJS defined; import it
  function cryptoJsLoader() {
    var prom;
    var src = '//cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/md5.js';
    function loadCryptoJSInner($document, $q, $window) {
      var document = $document[0];

      function resolveCrypto() {
        if (typeof $window.CryptoJS !== 'undefined') {
          return $q.resolve($window.CryptoJS);
        }

        return $q.reject(new Error("Can't resolve CryptoJS"));
      }

      function loadCrypto() {
        return $q(function (resolve, reject) {
          var s;
          s = document.createElement('script');
          s.src = src;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      return $q.resolve(undefined)
        .then(resolveCrypto)
        .catch(loadCrypto)
        .then(resolveCrypto);
    }

    return function($document, $q, $window) {
      if (prom) {
        return prom;
      }

      prom = loadCryptoJSInner($document, $q, $window);
    };
  }

  var loader = cryptoJsLoader();

  angular
      .module('contactChipsDemo', ['ngMaterial'])
      .controller('ContactChipDemoCtrl', DemoCtrl);

  function DemoCtrl ($q, $timeout, $document, $window) {
    var self = this;
    var pendingSearch, cancelSearch = angular.noop;
    var lastSearch;

    loader($document, $q).then(function (CryptoJS) {
      self.allContacts = loadContacts(CryptoJS);
    });
 
    self.contacts = [self.allContacts[0]];
    self.asyncContacts = [];
    self.filterSelected = true;

    self.querySearch = querySearch;
    self.delayedQuerySearch = delayedQuerySearch;

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
      if ( !pendingSearch || !debounceSearch() )  {
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
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(contact) {
        return (contact._lowername.indexOf(lowercaseQuery) != -1);
      };

    }

    function loadContacts(CryptoJS) {
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
