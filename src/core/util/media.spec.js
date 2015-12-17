describe('$mdMedia', function() {
  var matchMediaResult;
  var listeners;

  function runListeners() {
    listeners.forEach(function(cb) {
      cb.context.matches = matchMediaResult;
      cb.call(cb.context, cb.context);
    });
  }

  beforeEach(module('material.core'));

  beforeEach(inject(function($mdMedia, $window) {
    matchMediaResult = false;
    listeners = [];

    spyOn($window, 'matchMedia').and.callFake(function(media) {
      return {
        media: media,
        matches: matchMediaResult, 
        addListener: function(listener) {
          listener.context = this;
          listeners.push(listener);
        }
      };
    });
  }));

  it('should look up queries in `$mdConstant.MEDIA`', inject(
    function($mdConstant, $mdMedia, $window) {
      $mdConstant.MEDIA.somePreset = 'someQuery';

      $mdMedia('somePreset');
      expect($window.matchMedia).toHaveBeenCalledWith('someQuery');

      delete $mdConstant.MEDIA.somePreset;
    }
  ));

  it('should validate queries', inject(function($mdMedia, $window) {
    $mdMedia('something');
    expect($window.matchMedia).toHaveBeenCalledWith('(something)');
  }));

  it('should return cached results if available', inject(function($mdMedia, $window) {
    expect($window.matchMedia.calls.count()).toBe(0);

    expect($mdMedia('query')).toBe(false);
    expect($window.matchMedia.calls.count()).toBe(1);

    expect($mdMedia('query')).toBe(false);
    expect($window.matchMedia.calls.count()).toBe(1);
  }));

  it('should change result when listener is called', inject(function($mdMedia, $window, $timeout) {
    matchMediaResult = true;
    expect($mdMedia('query')).toBe(true);
    expect($window.matchMedia.calls.count()).toBe(1);

    expect($mdMedia('query')).toBe(true);
    expect($window.matchMedia.calls.count()).toBe(1);

    matchMediaResult = false;
    expect($mdMedia('query')).toBe(true);
    expect($window.matchMedia.calls.count()).toBe(1);

    runListeners();
    $timeout.flush();

    expect($mdMedia('query')).toBe(false);
  }));
});
