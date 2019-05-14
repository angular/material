(function () {
  'use strict';
  angular
      .module('autocompleteRepeatModeDemo', ['ngMaterial'])
      .controller('DemoCtrl', DemoCtrl);

  function DemoCtrl ($timeout, $q, $log) {
    var self = this;

    self.simulateQuery = false;
    self.isDisabled    = false;

    self.repos         = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;

    // ******************************
    // Internal methods
    // ******************************

    /**
     * Search for repos... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? self.repos.filter(createFilterFor(query)) : self.repos,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }

    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }

    /**
     * Build `components` list of key/value pairs
     */
    function loadAll() {
      var repos = [
        {
          'name'      : 'AngularJS',
          'url'       : 'https://github.com/angular/angular.js',
          'desc'      : 'AngularJS is JavaScript MVC made easy.',
          'watchers'  : '3,623',
          'forks'     : '16,175',
        },
        {
          'name'      : 'Angular',
          'url'       : 'https://github.com/angular/angular',
          'desc'      : 'Angular is a development platform for building mobile ' +
                        'and desktop web applications using Typescript/JavaScript ' +
                        'and other languages.',
          'watchers'  : '469',
          'forks'     : '760',
        },
        {
          'name'      : 'AngularJS Material',
          'url'       : 'https://github.com/angular/material',
          'desc'      : 'An implementation of Google\'s Material Design Specification ' +
                        '(2014-2017) for AngularJS developers',
          'watchers'  : '727',
          'forks'     : '1,241',
        },
        {
          'name'      : 'Angular Material',
          'url'       : 'https://github.com/angular/components',
          'desc'      : 'Material Design (2018+) components built for and with Angular ' +
                        'and Typescript',
          'watchers'  : '727',
          'forks'     : '1,241',
        },
        {
          'name'      : 'Bower Material',
          'url'       : 'https://github.com/angular/bower-material',
          'desc'      : 'the repository used for publishing the AngularJS Material ' +
                        'v1.x library and localized installs using npm.',
          'watchers'  : '42',
          'forks'     : '84',
        },
        {
          'name'      : 'Material Start',
          'url'       : 'https://github.com/angular/material-start',
          'desc'      : 'A sample application purposed as both a learning tool and a ' +
                        'skeleton application for a typical AngularJS Material web app.',
          'watchers'  : '81',
          'forks'     : '303',
        }
      ];
      return repos.map(function (repo) {
        repo.value = repo.name.toLowerCase();
        return repo;
      });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = query.toLowerCase();

      return function filterFn(item) {
        return (item.value.indexOf(lowercaseQuery) === 0);
      };

    }
  }
})();
