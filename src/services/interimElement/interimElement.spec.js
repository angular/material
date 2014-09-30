ddescribe('$$interimElement service', function() {
  var $compilerSpy, resolvingPromise;

  beforeEach(module('material.services.interimElement', 'ngAnimateMock', function($provide) {
    var $materialCompiler = { compile : angular.noop }
    $provide.value('$materialCompiler', $materialCompiler);

    $compilerSpy = spyOn($materialCompiler, 'compile');
  }));

  beforeEach(inject(function($q, $compile) {
    $compilerSpy.andCallFake(function(opts) {
      var link = $compile(opts.template);
      return $q.when({
        link: function() { return link(opts.scope); }
      });
    });
  }));

  describe('instance', function() {
    var Service;
    beforeEach(inject(function($$interimElement) {
      Service = $$interimElement();
    }));

    describe('show()', function() {
      it('inherits default options', inject(function($$interimElement) {
        var defaults = { templateUrl: 'testing.html' };
        Service = $$interimElement(defaults);
        Service.show();
        expect($compilerSpy.mostRecentCall.args[0].templateUrl).toBe('testing.html');
      }));

      it('forwards options to $materialCompiler', inject(function($$interimElement) {
        var options = {template: 'testing'};
        Service.show(options);
        expect($compilerSpy.mostRecentCall.args[0].template).toBe('testing');
      }));

      it('calls hide after hideDelay', inject(function($animate, $timeout, $rootScope) {

        // Cannot spy on ::hide() since that assumes internal access!
        //        var hideSpy = spyOn(Service, 'hide').andCallThrough();
        //        expect(hideSpy).toHaveBeenCalled();

        var hideCompleted = false;
        Service.show({hideDelay: 1000})
               .then(function(){
                   hideCompleted = true;
                });

        $rootScope.$digest();

        $animate.triggerCallbacks();  // $animate.enter
        $timeout.flush();             // $q deferreds
        $animate.triggerCallbacks();  // $animate.leave

        expect(hideCompleted).toBe(true);
      }));

      it('calls onShow', inject(function($animate, $rootScope) {
        var onShowCalled = false;

        Service.show({
          template: '<some-element />',
          isPassingOptions: true,
          onShow: function onShow(scope, el, options) {
            onShowCalled = true;
            expect(options.isPassingOptions).toBe(true);
            expect(el[0]).toBeTruthy();
          }
        });

        $rootScope.$digest();
        $animate.triggerCallbacks();  // $animate.enter

        expect(onShowCalled).toBe(true);

      }));

      it('returns a promise', inject(function($$interimElement) {
        var isFunc = angular.isFunction(Service.show().then);
        expect( isFunc ).toBe(true);
      }));
    });

    describe('#hide', function() {
      it('calls onHide', inject(function($rootScope) {
        var onHideCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onHide: function onHide(scope, el, options) {
            onHideCalled = true;
            expect(options.passingOptions).toBe(true);
            expect(el[0]).toBeTruthy();
          }
        });
        $rootScope.$digest();
        Service.hide();
        $rootScope.$digest();
        expect(onHideCalled).toBe(true);


      }));

      it('resolves the show promise', inject(function($animate, $rootScope) {
        var resolved = false;

        Service.show().then(function(arg) {
          expect(arg).toBe('test');
          resolved = true;
        });

        $rootScope.$digest();
        $animate.triggerCallbacks();

        Service.hide('test');

        $rootScope.$digest();
        $animate.triggerCallbacks();

        expect(resolved).toBe(true);
      }));
    });

    describe('#cancel', function() {
      it('calls onHide', inject(function($rootScope) {
        var onHideCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onHide: onHide
        });
        $rootScope.$digest();
        Service.cancel();
        $rootScope.$digest();
        expect(onHideCalled).toBe(true);

        function onHide(scope, el, options) {
          onHideCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('rejects the show promise', inject(function($animate, $rootScope) {
        var rejected = false;

        Service.show().catch(function(arg) {
          expect(arg).toBe('test');
          rejected = true;
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.cancel('test');
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(rejected).toBe(true);
      }));
    });

  });
});

