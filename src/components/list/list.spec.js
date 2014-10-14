describe('mdList directive', function() {
  function setup(attrs) {
    module('material.components.list');
    var el;
    inject(function($compile, $rootScope) {
      el = $compile('<md-list '+(attrs || '')+'></md-list>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }
});
