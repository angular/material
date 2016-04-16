angular.module('material.components.table').factory('Hashmap', Hashmap);

/**
 * A simple hashmap implementation for storing selected items. A Reference to an item
 * will be stored in a hashmap when the developer assigns an id to that item.
 */
function Hashmap() {
  var map = {};

  this.length = 0;

  this.clear = function () {
    map = {};
  };

  this.delete = function (key) {
    if(this.has(key)) {
      --this.size;
    }

    delete this.map[key];

    return this;
  };

  this.get = function (key) {
    return this.map[key];
  };

  this.has = function (key) {
    return !!this.get(key);
  };

  this.set = function (key, value) {
    if(!this.has(key)) {
      ++this.size;
    }

    this.map[key] = value;

    return this;
  };

  return this.constructor;
}