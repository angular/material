angular
    .module('autocompleteDemo', ['ngMaterial'])
    .controller('DemoCtrl', DemoCtrl);

function DemoCtrl ($timeout, $q) {
  var self = this;
  this.selectedItem = null;
  this.searchText = null;
  this.states = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Deleware,\
        Florida, Georgia, Hawaii, Idaho, Illanois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
        Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
        Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
        North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
        South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
        Wisconsin, Wyoming'.split(/, +/g).map(function (state) { return { value: state.toLowerCase(), display: state }; });
  this.getItems = getItems;

  function getItems (query) {
    if (!query) return [];
    var deferred = $q.defer();
    var lowercaseQuery = angular.lowercase(query);
    var results = self.states.filter(function (state) { return state.value.indexOf(lowercaseQuery) === 0; });
    $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
    return deferred.promise;
  }
}
