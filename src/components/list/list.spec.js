describe('materialList directive', function() {
  function setup(attrs) {
    module('material.components.list');
    var el;
    inject(function($compile, $rootScope) {
      el = $compile('<material-list '+(attrs || '')+'></material-list>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }
});
