describe('$animateCss', function() {

  var jqLite = angular.element;
  var forEach = angular.forEach;

  var fromStyles, toStyles, addClassVal = 'to-add', removeClassVal = 'to-remove';
  var element, ss, doneSpy;
  var triggerAnimationStartFrame, moveAnimationClock;

  beforeEach(module('material.core.animate'));

  beforeEach(module(function() {
    return function($window, $document, $$rAF, $timeout, $rootElement, $animate, $injector, $rootScope) {
      $animate.enabled(true);

      ss = createMockStyleSheet($document, $window);
      element = jqLite('<div></div>');
      $rootElement.append(element);
      jqLite($document[0].body).append($rootElement);

      ss.addRule('.to-add', 'transition:0.5s linear all; font-size:100px;');
      ss.addRule('.to-remove', 'transition:0.5s linear all; border:10px solid black;');

      var asyncRun = angular.noop;
      if ($injector.has('$$animateAsyncRun')) {
        var asyncFlush = $injector.get('$$animateAsyncRun');
        asyncRun = function() {
          asyncFlush.flush();
        };
      }

      triggerAnimationStartFrame = function() {
        $$rAF.flush();
        asyncRun();
        $rootScope.$digest();
      };

      doneSpy = jasmine.createSpy();
      fromStyles = { backgroundColor: 'red' };
      toStyles = { backgroundColor: 'blue' };

      moveAnimationClock = function(duration, delay) {
        var time = (delay || 0) + duration * 1.5;
        $timeout.flush(time * 1000);
        asyncRun();
        $$rAF.flush();
      }
    };
  }));

  afterEach(function() {
    ss.destroy();
    element.remove();
  });


  describe('[addClass]', function() {
    it('should not trigger an animation if the class doesn\'t exist',
      inject(function($animateCss) {

      $animateCss(element, { addClass: 'something-fake' }).start().done(doneSpy);
      triggerAnimationStartFrame();

      assertHasClass(element, 'something-fake');
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should not trigger an animation if the class doesn\'t contain a transition value or a keyframe value',
      inject(function($animateCss) {

      ss.addRule('.something-real', 'background-color:orange');

      $animateCss(element, { addClass: 'something-real' }).start().done(doneSpy);
      triggerAnimationStartFrame();

      assertHasClass(element, 'something-real');
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if a transition is detected on the class that is being added',
      inject(function($animateCss) {

      ss.addRule('.something-shiny', 'transition:0.5s linear all; background-color: gold;');

      $animateCss(element, { addClass: 'something-shiny' }).start().done(doneSpy);
      triggerAnimationStartFrame();

      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(1);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if a keyframe is detected on the class that is being added',
      inject(function($animateCss) {

      ss.addRule('.something-spinny', '-webkit-animation: 0.5s rotate linear; animation: 0.5s rotate linear;');

      $animateCss(element, { addClass: 'something-spinny' }).start().done(doneSpy);
      triggerAnimationStartFrame();

      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(1);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if both a transition and keyframe is detected on the class that is being added and choose the max duration value',
      inject(function($animateCss) {

      ss.addRule('.something-shiny', 'transition:1.5s linear all; background-color: gold;');
      ss.addRule('.something-spinny', '-webkit-animation: 0.5s rotate linear; animation: 0.5s rotate linear;');

      $animateCss(element, { addClass: 'something-spinny something-shiny' }).start().done(doneSpy);
      triggerAnimationStartFrame();

      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(1.5);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if a non-animatable class is added with a duration property',
      inject(function($animateCss) {

      ss.addRule('.something-boring', 'border:20px solid red;');

      $animateCss(element, {
        addClass: 'something-boring',
        duration: 2
      }).start().done(doneSpy);
      triggerAnimationStartFrame();

      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(2);
      expect(doneSpy).toHaveBeenCalled();
    }));
  });

  describe('[removeClass]', function() {
    it('should not trigger an animation if the animatable className is removed',
      inject(function($animateCss) {

      element.addClass(removeClassVal);

      $animateCss(element, {
        removeClass: removeClassVal
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      assertHasClass(element, removeClassVal, true);
    }));

    it('should trigger an animation if the element contains a transition already when the class is removed',
      inject(function($animateCss) {

      element.addClass(removeClassVal);
      element.addClass('something-to-remove');

      $animateCss(element, {
        removeClass: 'something-to-remove'
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(0.5);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if the element contains a keyframe already when the class is removed',
      inject(function($animateCss) {

      ss.addRule('.something-that-spins', '-webkit-animation: 0.5s rotate linear; animation: 0.5s rotate linear;');

      element.addClass('something-that-spins');
      element.addClass('something-to-remove');

      $animateCss(element, {
        removeClass: 'something-to-remove'
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(0.5);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should still perform an animation if an animatable class is removed, but a [duration] property is used',
      inject(function($animateCss) {

      ss.addRule('.something-that-is-hidden', 'transition:0.5s linear all; opacity:0;');
      element.addClass('something-that-spins');

      $animateCss(element, {
        removeClass: 'something-that-is-hidden',
        duration: 0.5
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(0.5);
      expect(doneSpy).toHaveBeenCalled();
    }));
  });

  describe('[transitionStyle]', function() {
    it('should not trigger an animation if the property is the only thing property',
      inject(function($animateCss) {

      $animateCss(element, {
        transitionStyle: '3s linear all'
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should apply the provided porperty to the animation if there are [toStyles] used',
      inject(function($animateCss) {

      $animateCss(element, {
        transitionStyle: '3s linear all',
        to: toStyles
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(3);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should apply the provided porperty to the animation if there are [addClass] used',
      inject(function($animateCss) {

      ss.addRule('.boring-class', 'border:20px solid red;');

      $animateCss(element, {
        transitionStyle: '3s linear all',
        addClass: 'boring-class'
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(3);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should apply the provided porperty to the animation if there are [removeClass] used',
      inject(function($animateCss) {

      ss.addRule('.boring-class', 'border:20px solid red;');
      element.addClass('boring-class');

      $animateCss(element, {
        transitionStyle: '3s linear all',
        removeClass: 'boring-class'
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(3);
      expect(doneSpy).toHaveBeenCalled();
    }));
  });

  describe('[from]', function() {
    it('should not trigger an animation to run when only a [from] property is passed in',
      inject(function($animateCss) {

      $animateCss(element, {
        from: fromStyles
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should not trigger an animation to run when a [from] and a [duration] property are passed in',
      inject(function($animateCss) {

      $animateCss(element, {
        from: fromStyles,
        duration: 1
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should apply the styles as soon as the animation is called',
      inject(function($animateCss) {

      var animator = $animateCss(element, {
        from: fromStyles
      });

      assertStyle(element, fromStyles);
    }));
  });

  describe('[to]', function() {
    it('should not trigger an animation to run when only a [to] property is passed in',
      inject(function($animateCss) {

      $animateCss(element, {
        to: toStyles
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation to run when both a [to] and a [duration] property are passed in',
      inject(function($animateCss) {

      $animateCss(element, {
        to: toStyles,
        duration: 1
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(1);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should apply the styles right after the next frame',
      inject(function($animateCss) {

      $animateCss(element, {
        to: toStyles
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      assertStyle(element, toStyles);
    }));
  });

  describe('[from] and [to]', function() {
    it('should not trigger an animation if [duration] is not passed in',
      inject(function($animateCss) {

      $animateCss(element, {
        from: fromStyles,
        to: toStyles
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if [duration] is passed in',
      inject(function($animateCss) {

      $animateCss(element, {
        from: fromStyles,
        to: toStyles,
        duration: 1
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(1);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if detected from the provided [addClass] class value',
      inject(function($animateCss) {

      $animateCss(element, {
        from: fromStyles,
        to: toStyles,
        addClass: addClassVal
      }).start().done(doneSpy);

      assertStyle(element, fromStyles);
      triggerAnimationStartFrame();

      assertStyle(element, toStyles);
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(1);
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should trigger an animation if detected from the provided [removeClass] class value',
      inject(function($animateCss) {

      element.addClass(removeClassVal + ' something-else-to-remove');

      $animateCss(element, {
        from: fromStyles,
        to: toStyles,
        removeClass: 'something-else-to-remove'
      }).start().done(doneSpy);

      assertStyle(element, fromStyles);
      triggerAnimationStartFrame();

      assertStyle(element, toStyles);
      expect(doneSpy).not.toHaveBeenCalled();
      moveAnimationClock(1);
      expect(doneSpy).toHaveBeenCalled();
    }));
  });

  describe('[duration]', function() {
    it('should not apply a duration if it is the only property used',
      inject(function($animateCss) {

      element.addClass(removeClassVal + ' something-else-to-remove');

      $animateCss(element, {
        duration: 2
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      expect(doneSpy).toHaveBeenCalled();
    }));

    it('should apply a duration as an inline transition-duration style',
      inject(function($animateCss) {

      element.addClass(removeClassVal + ' something-else-to-remove');

      $animateCss(element, {
        duration: 2,
        to: toStyles
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      assertStyle(element, 'transition-duration', '2s');
    }));

    it('should apply a duration as an inline animation-duration style if only keyframes are used',
      inject(function($animateCss) {

      element.addClass(removeClassVal + ' something-else-to-remove');

      $animateCss(element, {
        keyframeStyle: '1s rotate linear',
        duration: 2
      }).start().done(doneSpy);

      triggerAnimationStartFrame();
      assertStyle(element, 'animation-duration', '2s');
    }));
  });

  function assertHasClass(element, className, not) {
    expect(element.hasClass(className)).toBe(!not);
  }

  function assertStyle(element, prop, val, not) {
    var node = element[0];
    var webKit = '-webkit-';
    if (typeof prop === 'string') {
      var assertion = expect(node.style[camelCase(prop)] || node.style[camelCase(webKit+prop)]);
      not ? assertion.not.toBe(val) : assertion.toBe(val);
    } else {
      for (var key in prop) {
        var val = prop[key];
        var assertion = expect(node.style[camelCase(key)] || node.style[camelCase(webKit+key)]);
        not ? assertion.not.toBe(val) : assertion.toBe(val);
      }
    }
  }

  function camelCase(str) {
    return str.replace(/-[a-z]/g, function(str) {
      return str.charAt(1).toUpperCase();
    });
  }

});
