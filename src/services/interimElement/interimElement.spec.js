describe('$$interimElementFactory service', function() {
  var $compilerSpy, resolvingPromise;
  beforeEach(module('material.services.interimElement', function($provide) {
    var $materialCompiler = {
      compile: function() { }
    };
    $compilerSpy = spyOn($materialCompiler, 'compile');

    $provide.value('$materialCompiler', $materialCompiler);
  }));

  beforeEach(inject(function($q) {
    $compilerSpy.andCallFake(function() {
      var deferred = $q.defer();
      deferred.resolve(true);
      return deferred.promise;
    });
  }));

  describe('construction', function() {
    it('sets defaults options', inject(function($$interimElementFactory) {
      var defaults = { templateUrl: 'testing.html' };
      var Service = $$interimElementFactory(defaults);
      Service.show();
      expect($compilerSpy.mostRecentCall.args[0].templateUrl).toBe('testing.html');
    }));
  });

  describe('instance', function() {
    describe('#show', function() {
      it('forwards options to $materialCompiler', inject(function($$interimElementFactory) {
        var options = {template: 'testing'};
        var Service = $$interimElementFactory();
        Service.show(options);
        expect($compilerSpy.mostRecentCall.args[0].template).toBe('testing');
      }));
    });
  });
});

