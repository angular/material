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
        $animateSequence().enter(parent).run(element);
        $animate.triggerReflow();
        $rootScope.$digest();

        assertAnimation(element, { event : 'enter' });
      });

      it('should render the `leave` animation', function() {
        parent.append(element);

        $animateSequence().leave().run(element);
        $animate.triggerReflow();
        $rootScope.$digest();

        assertAnimation(element, { event : 'leave' });
      });

      it('should render the `move` animation', function() {
        var move = angular.element('<div></div>');
        parent.append(move);
        parent.append(element);

        $animateSequence().move(move).run(element);
        $animate.triggerReflow();
        $rootScope.$digest();

        assertAnimation(element, { event : 'move' });
      });

      it('should render the `addClass` animation', function() {
        parent.append(element);

        $animateSequence().addClass('on').run(element);
        $animate.triggerReflow();

        assertAnimation(element, { event : 'addClass', className : 'on' });
      });

      it('should render the `removeClass` animation', function() {
        parent.append(element);
        element.addClass('off');

        $animateSequence().removeClass('off').run(element);
        $animate.triggerReflow();

        assertAnimation(element, { event : 'removeClass', className : 'off' });
      });

      it('should render the `setClass` animation', function() {
        parent.append(element);
        element.addClass('off');

        $animateSequence().setClass('on','off').run(element);
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
        }).run(element);

        $animate.triggerReflow();
        expect(capturedElement).toBe(element);
      });

      describe('chaining', function() {
        it('should chain animations together and run then between animation frames', function() {
          $animateSequence()
            .enter(parent)
            .leave()
            .run(element);

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
            .then(function(element, done) {
              completed = false;
              done();
            })
            .run(element, 1000, function() {
              completed = true;  
            });

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
            .then(function(element, done) {
              then = true;
              done();
            })
            .run(element, 1000, function() {
              completed = true; 
            });

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
        seq.run(element);

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

        seq.run(element);

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
      beforeEach(module('ngAnimateStylers'));

      it('should find a pre-defined styler when a string is provided', function() {
        var spy = jasmine.createSpy('custom styler');
        module(function($$animateStylerProvider) {
          $$animateStylerProvider.register('custom', function() {
            return spy;
          });
        });
        inject(function($animateSequence, $animate) {
          $animate.enabled(true);
          var element = jqLite('<div></div>');
          var seq = $animateSequence({ styler : 'custom' });
          seq.addClass('xyz');

          seq.run(element);

          expect(spy).toHaveBeenCalled();
        });
      });

      describe('webAnimations', function() {
        it('should render animations using element.animate', 
          inject(function($animateSequence, $animate) {

          var log = [];

          $animate.enabled(true);
          var element = jqLite('<div></div>');
          var node = element[0];

          // Some browsers don't support this yet, but it's OK
          // since we're going to mock it out anyway
          node.animate = node.animate || function() {};

          var currentAnimation = {};
          spyOn(node, 'animate').andCallFake(function(animations, values) {
            log.push(animations); 
            return currentAnimation;
          });

          var seq = $animateSequence({ styler : 'webAnimations' });

          seq.animate({ 'border-width': 0 }, { 'border-width': 10 });
          seq.animate({ height: 100 }, { height: 10 });
          seq.run(element);

          $animate.triggerReflow();
          currentAnimation.onfinish();
          $animate.triggerCallbacks();

          $animate.triggerReflow();
          currentAnimation.onfinish();
          $animate.triggerCallbacks();

          expect(log).toEqual([
            [ { borderWidth : '0px' },
              { borderWidth: '10px' } ],
            [ { height : '100px' },
              { height: '10px' } ]
          ]);
        }));

        it('should retain the animated styles once complete', 
          inject(function($animateSequence, $animate, $window, $rootElement, $document) {

          var log = [];

          $animate.enabled(true);
          var element = jqLite('<div></div>');
          var node = element[0];

          // the element may need to be injected into the body such that
          // getComputedStyle will actually return real computed style values
          $rootElement.append(element);
          jqLite($document[0].body).append($rootElement);

          // Some browsers don't support this yet, but it's OK
          // since we're going to mock it out anyway
          node.animate = angular.noop;

          var currentAnimation = {};
          spyOn(node, 'animate').andCallFake(function() {
            return currentAnimation; 
          });

          var seq = $animateSequence({ styler : 'webAnimations' });

          seq.animate({ 'font-size': '10px' }, { 'font-size': '20px' });
          seq.run(element);

          $animate.triggerReflow();
          currentAnimation.onfinish();
          $animate.triggerCallbacks();

          expect($window.getComputedStyle(node).fontSize).toEqual('20px');
        }));

        it('should compute CSS values when not provided in the sequence', 
          inject(function($animateSequence, $animate, $sniffer, $rootElement, $document) {

          var log = [];
          var prefix = $sniffer.vendorPrefix.toLowerCase() == 'webkit'
              ? '-webkit-'
              : '';

          $animate.enabled(true);
          var element = jqLite('<div></div>');
          var originalStyles = {};

          // the element may need to be injected into the body such that
          // getComputedStyle will actually return real computed style values
          $rootElement.append(element);
          jqLite($document[0].body).append($rootElement);

          originalStyles[prefix + 'transform'] = 'rotate(-30deg)';
          originalStyles.opacity = 0.5;
          element.css(originalStyles);

          var node = element[0];

          // Some browsers don't support this yet, but it's OK
          // since we're going to mock it out anyway
          node.animate = node.animate || function() {};

          var currentAnimation = {};
          spyOn(node, 'animate').andCallFake(function(animations, values) {
            var pre = animations[0];
            var post = animations[1];

            //special case for transforms since matching matrix values is
            //super finicky and will lead to alot of fine tuning 
            if (pre.transform || pre.webkitTransform || pre['-webkit-transform']) {
              pre.transform = '...';
            }
            delete pre.webkitTransform;
            delete pre['-webkit-transform'];
            delete post['-webkit-transform'];

            log.push([pre,post]); 
            return currentAnimation;
          });

          var seq = $animateSequence({ styler : 'webAnimations' });

          seq.animate({ transform: 'rotate(20deg)' });
          seq.animate({ width : 100 }, { width: 1000 });
          seq.animate({ opacity: 0 });
          seq.run(element);

          //each of the 3 animations defined in the sequence
          for(var i=0; i < 3; i++) {
            $animate.triggerReflow();
            currentAnimation.onfinish();
            $animate.triggerCallbacks();
          }

          expect(log).toEqual([
            [ { transform: '...' },
              { transform: 'rotate(20deg)' } ],
            [ { width: '100px' },
              { width: '1000px' } ],
            [ { opacity: '0.5' },
              { opacity: 0 } ]
          ]);
        }));
      });
    });

  });

});
