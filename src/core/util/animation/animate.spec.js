describe('animate', function() {
  beforeEach(module('material.core'));

  var $material, $rootScope, $timeout, $$mdAnimate;
  beforeEach( inject(function(_$material_,_$rootScope_,_$timeout_, _$$mdAnimate_, $mdUtil) {
      $$mdAnimate = _$$mdAnimate_($mdUtil);
      $material = _$material_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
  }));

  describe('waitTransitionEnd', function(){

    describe('should reject without an in-progress animation', function(){

      it('using the default fallback timeout',inject(function() {
        var element = build('<div>');
        var expired = false;

        $$mdAnimate
          .waitTransitionEnd(element)
          .catch(function() {
            expired = true;
          });
        flush();

        expect(expired).not.toBe(true);
      }));

      it('using custom timeout duration',inject(function() {
        var element = build('<div>');
        var expired = false;

        $$mdAnimate
          .waitTransitionEnd(element, {timeout:200} )
          .catch(function() {
            expired = true;
          });
        flush();

        expect(expired).not.toBe(true);
      }));

    });

    describe('should resolve ', function(){

      it('after an animation finishes',inject(function($document, $mdConstant) {
        var expired = false;
        var response = false;
        var element = build('<div>');
        var animation = { display:'absolute;', transition : 'all 1.5s ease;' };
            animation[$mdConstant.CSS.TRANSFORM] = 'translate3d(240px, 120px, 0px);';

        // Animate move the element...
        element.css(animation);

        $$mdAnimate
          .waitTransitionEnd(element)
          .then(
            function() { response = true; },
            function() { expired = true; }
          );

        $mdConstant.CSS.TRANSITIONEND.split(" ")
               .forEach(function(eventType){
                  element.triggerHandler(eventType);
               });
        flush();

        expect(expired).toBe(false);
        expect(response).toBe(true);

      }));

    });

    function build(template) {
      var el;
      inject(function($compile, $rootScope) {
        el = angular.element(template || '<div>');
        $compile(el)($rootScope);
        $rootScope.$apply();
      });
      return el;
    }
  });

  function flush() {
    $rootScope.$digest();
    $material.flushOutstandingAnimations();
  }
});
