describe('ngAnimateSequenceSpec', function() {

  var $animate, body, $rootElement;
  var jqLite = function() {
    return angular.element.apply(angular.element, arguments);
  };

  beforeEach(function() {
    module('ngAnimateSequence');
    module('ngAnimateMock');
    module(function() {
      return function(_$animate_, $document, _$rootElement_) {
        body = angular.element($document[0].body);
        $animate = _$animate_;
        $rootElement = _$rootElement_;
      }
    });
  });

  function attachToBody(element) {
    $rootElement.append(element);
    body.append($rootElement);
  }

  function assertAnimation(element, expectations, not) {
    var animation = $animate.queue.shift();
    if (expectations.event) {
      expect(animation.event).toBe(expectations.event);
    }
    if (expectations.className) {
      var className = animation.args[1];
      if (animation.event == 'setClass') {
        className += ' ' + animation.args[2];
      }
      not ? expect(className).not.toBe(expectations.className)
          : expect(className).toBe(expectations.className);
    }
  }

  describe('$animateSequence', function() {

    describe('methods', function() {

      var $animateSequence, $rootScope, element, parent;
      beforeEach(inject(function(_$animateSequence_, _$rootScope_) {
        element = angular.element('<div></div>');
        parent = angular.element('<div></div>');

        $animate.enabled(true);
        $animateSequence = _$animateSequence_;
        $rootScope = _$rootScope_;
      }));

      it('should render the `enter` animation', function() {
        $animateSequence().enter(parent).start(element);
        $animate.triggerReflow();
        $rootScope.$digest();

        assertAnimation(element, { event : 'enter' });
      });

      it('should render the `leave` animation', function() {
        parent.append(element);

        $animateSequence().leave().start(element);
        $animate.triggerReflow();
        $rootScope.$digest();

        assertAnimation(element, { event : 'leave' });
      });

      it('should render the `move` animation', function() {
        var move = angular.element('<div></div>');
        parent.append(move);
        parent.append(element);

        $animateSequence().move(move).start(element);
        $animate.triggerReflow();
        $rootScope.$digest();

        assertAnimation(element, { event : 'move' });
      });

      it('should render the `addClass` animation', function() {
        parent.append(element);

        $animateSequence().addClass('on').start(element);
        $animate.triggerReflow();

        assertAnimation(element, { event : 'addClass', className : 'on' });
      });

      it('should render the `removeClass` animation', function() {
        parent.append(element);
        element.addClass('off');

        $animateSequence().removeClass('off').start(element);
        $animate.triggerReflow();

        assertAnimation(element, { event : 'removeClass', className : 'off' });
      });

      it('should render the `setClass` animation', function() {
        parent.append(element);
        element.addClass('off');

        $animateSequence().setClass('on','off').start(element);
        $animate.triggerReflow();

        assertAnimation(element, { event : 'setClass', className : 'on off' });
      });

      it('should render the `then` animation', function() {
        parent.append(element);
        element.addClass('off');

        var capturedElement;
        $animateSequence().then(function(element, done) {
          capturedElement = element; 
          done();
        }).start(element);

        $animate.triggerReflow();
        expect(capturedElement).toBe(element);
      });

      describe('chaining', function() {
        it('should chain animations together and run then between animation frames', function() {
          $animateSequence()
            .enter(parent)
            .leave()
            .start(element);

          $animate.triggerReflow();
          $rootScope.$digest();

          assertAnimation(element, { event : 'enter' });
          $animate.triggerCallbacks();

          $animate.triggerReflow();
          $rootScope.$digest();

          assertAnimation(element, { event : 'leave' });
        });

        it('should call the complete function at the very end of the animation', function() {
          var completed;
          $animateSequence()
            .addClass('one')
            .addClass('two')
            .removeClass('one')
            .removeClass('two')
            .complete(function() {
              completed = true;
            })
            .then(function(element, done) {
              completed = false;
              done();
            })
            .start(element);

          $animate.triggerReflow();
          assertAnimation(element, { event : 'addClass', className : 'one' });
          $animate.triggerCallbacks();

          $animate.triggerReflow();
          assertAnimation(element, { event : 'addClass', className : 'two' });
          $animate.triggerCallbacks();

          $animate.triggerReflow();
          assertAnimation(element, { event : 'removeClass', className : 'one' });
          $animate.triggerCallbacks();

          $animate.triggerReflow();
          assertAnimation(element, { event : 'removeClass', className : 'two' });
          $animate.triggerCallbacks();

          $animate.triggerReflow();

          expect(completed).toBe(true);
        });

        it('should skip all animations when animations are disabled', function() {
          $animate.enabled(false);
          $animateSequence()
            .addClass('1')
            .addClass('2')
            .addClass('3')

          expect($animate.queue.length).toBe(0);
          $animate.triggerReflow();
          expect($animate.queue.length).toBe(0);
        });

        it('should still call the complete function even when animations are disabled', function() {
          var completed, then = false;
          $animate.enabled(false);
          $animateSequence()
            .addClass('one')
            .addClass('two')
            .complete(function() {
              completed = true;
            })
            .then(function(element, done) {
              then = true;
              done();
            })
            .start(element);

          $animate.triggerReflow();

          expect(then).toBe(false);
          expect(completed).toBe(true);
        });
      });
    });

    describe('configurations', function() {
      var element, $animateSequence;
      beforeEach(inject(function($animate, _$animateSequence_, _$animate_) {
        element = jqLite('<div></div>');
        attachToBody(element);
        $animate.enabled(true);
        $animateSequence = _$animateSequence_;
        $animate = _$animate_;
      }));

      it('should allow the user to specify how styling is applied', function() {
        var preStyles, postStyles;
        var seq = $animateSequence({
          styler : function(element, pre) {
            preStyles = pre;
            return function(post, done) {
              postStyles = post;
              done();
            }
          }
        });

        seq.addClass('fade-in-wash', { color : 'red' }, { color : 'pink' });
        seq.start(element);

        expect(preStyles).toEqual({ color : 'red' });
        expect(postStyles).toBeUndefined();

        $animate.triggerReflow();
        expect(postStyles).toEqual({ color : 'pink' });
      });

      it('should wait for the styler to be complete before jumping to the next animation', function() {
        var doneFn;
        var seq = $animateSequence({
          styler : function(element, pre) {
            return function(post, done) {
              doneFn = done;
            }
          }
        });

        seq.addClass('a');
        seq.addClass('b');
        seq.addClass('c');

        seq.start(element);

        $animate.triggerReflow();
        assertAnimation(element, { event : 'addClass', className : 'a' });

        $animate.triggerCallbacks();
        expect($animate.queue.length).toBe(0);

        doneFn();
        $animate.triggerReflow();

        expect($animate.queue.length).toBe(1);
      });
    });

    describe('stylers', function() {
      it('should find a pre-defined styler when a string is provided', function() {
        var spy = jasmine.createSpy('custom styler');
        module(function($$animateStylerProvider) {
          $$animateStylerProvider.register('custom', function() {
            return spy;
          });
        });
        inject(function($animateSequence, $animate) {
          $animate.enabled(true);
          var element = jqLite('</div></div>');
          var seq = $animateSequence({ styler : 'custom' });
          seq.addClass('xyz');

          seq.start(element);

          expect(spy).toHaveBeenCalled();
        });
      });

    });

  });

  /*
  describe('$animateGroup', function() {

    it('should animate a list of sequences linearly', inject(function($animate, $animateSequence) {

      var element = jqLite('<div></div>');

      $animate.enabled(true);
      var seq = $animateSequence().addClass('one').removeClass('two');

      var s1 = seq.start(element);
    }));

  });
  */

});
