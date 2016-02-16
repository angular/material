describe('$mdGesture', function() {

  beforeEach(module('material.core', function() {
    angular.element(document).triggerHandler('$$mdGestureReset');
  }));

  describe('custom gesture', function() {

    var startSpy1, moveSpy1, endSpy1;
    var startSpy2, moveSpy2, endSpy2;
    var childEl, middleEl, parentEl;
    beforeEach(function() {
      inject(function($mdGesture) {
        startSpy1 = jasmine.createSpy('start1');
        moveSpy1 = jasmine.createSpy('move1');
        endSpy1 = jasmine.createSpy('end1');
        startSpy2 = jasmine.createSpy('start2');
        moveSpy2 = jasmine.createSpy('move2');
        endSpy2 = jasmine.createSpy('end2');
        $mdGesture.handler('gesture1', {
          options: {
            defaultKey: 'defaultVal'
          },
          onStart: startSpy1,
          onMove: moveSpy1,
          onEnd: endSpy1
        });
        $mdGesture.handler('gesture2', {
          onStart: startSpy2,
          onMove: moveSpy2,
          onEnd: endSpy2
        });
        childEl = angular.element('<child>');
        middleEl = angular.element('<middle>').append(childEl);
        parentEl = angular.element('<parent>').append(middleEl);
      });
    });

    it('should pass provided options', inject(function($document, $mdGesture) {
      $mdGesture.register(childEl, 'gesture1', { optKey: 'optValue' });

      startSpy1.and.callFake(function() {
        return {
          isRunning: true,
          options: {
            optKey: 'optValue',
            defaultKey: 'defaultVal'
          },
          registeredParent: childEl[0]
        };
      });
      $document.triggerHandler({
        type: 'touchstart',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
      expect(startSpy2).toHaveBeenCalled();
    }));

    it('touch{start,move,end,cancel}', inject(function($document) {
      $document.triggerHandler({
        type: 'touchstart',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
      $document.triggerHandler('touchmove');
      expect(moveSpy1).toHaveBeenCalled();
      $document.triggerHandler('touchend');
      expect(endSpy1).toHaveBeenCalled();

      startSpy1.calls.reset();
      moveSpy1.calls.reset();
      endSpy1.calls.reset();

      $document.triggerHandler({
        type: 'touchstart',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
      $document.triggerHandler('touchmove');
      expect(moveSpy1).toHaveBeenCalled();
      $document.triggerHandler('touchcancel');
      expect(endSpy1).toHaveBeenCalled();
    }));

    it('gesture{down,move,up,cancel}', inject(function($document) {
      $document.triggerHandler({
        type: 'pointerdown',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
      $document.triggerHandler('pointermove');
      expect(moveSpy1).toHaveBeenCalled();
      $document.triggerHandler('pointerup');
      expect(endSpy1).toHaveBeenCalled();

      startSpy1.calls.reset();
      moveSpy1.calls.reset();
      endSpy1.calls.reset();

      $document.triggerHandler({
        type: 'pointerdown',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
      $document.triggerHandler('pointermove');
      expect(moveSpy1).toHaveBeenCalled();
      $document.triggerHandler('pointercancel');
      expect(endSpy1).toHaveBeenCalled();
    }));

    it('mouse{down,move,up,leave}', inject(function($document) {
      $document.triggerHandler({
        type: 'mousedown',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
      $document.triggerHandler('mousemove');
      expect(moveSpy1).toHaveBeenCalled();
      $document.triggerHandler('mouseup');
      expect(endSpy1).toHaveBeenCalled();

      startSpy1.calls.reset();
      moveSpy1.calls.reset();
      endSpy1.calls.reset();

      $document.triggerHandler({
        type: 'mousedown',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
      $document.triggerHandler('mousemove');
      expect(moveSpy1).toHaveBeenCalled();
      $document.triggerHandler('mouseleave');
      expect(endSpy1).toHaveBeenCalled();
    }));

    it('should not call start on an event with different type if <400ms have passed', inject(function($document) {
      var now = 0;
      spyOn(Date, 'now').and.callFake(function() { return now; });

      $document.triggerHandler({
        type: 'touchstart',
        target: childEl[0]
      });
      $document.triggerHandler('touchmove');
      $document.triggerHandler('touchend');

      startSpy1.calls.reset();
      $document.triggerHandler({
        type: 'mousedown',
        target: childEl[0]
      });
      expect(startSpy1).not.toHaveBeenCalled();

      now = 1500;
      $document.triggerHandler({
        type: 'mousedown',
        target: childEl[0]
      });
      expect(startSpy1).toHaveBeenCalled();
    }));

  });

  describe('click', function() {

    // Click tests should only be enabled when `$$hijackClicks == true` (for mobile)

    it('should click if distance < options.maxDistance', inject(function($document, $mdGesture) {
      if ( $mdGesture.$$hijackClicks ) {
        var spy = jasmine.createSpy('click');
        var el = angular.element('<div>');

        el.on('click', spy);

        expect(spy).not.toHaveBeenCalled();
        $document.triggerHandler({
          type: 'touchstart',
          target: el[0],
          touches: [{pageX: 100, pageY: 100 }]
        });
        expect(spy).not.toHaveBeenCalled();
        $document.triggerHandler({
          type: 'touchend',
          target: el[0],
          touches: [{pageX: 97, pageY: 102 }]
        });
        expect(spy).toHaveBeenCalled();
      }

    }));

    it('should not click if distance > options.maxDistance', inject(function($mdGesture, $document) {
      if ( $mdGesture.$$hijackClicks ) {
        var spy = jasmine.createSpy('click');
        var el = angular.element('<div>');

        el.on('click', spy);

        $document.triggerHandler({
          type: 'touchstart',
          target: el[0],
          touches: [{pageX: 100, pageY: 100 }]
        });
        expect(spy).not.toHaveBeenCalled();

        $document.triggerHandler({
          type: 'touchend',
          target: el[0],
          touches: [{pageX: 90, pageY: 110 }]
        });
        expect(spy).not.toHaveBeenCalled();
      }

    }));

  });

  describe('press', function() {

    beforeEach(function() {
      // Make sure `unexpected` prototype/inherited methods do not impact gestures
      Object.prototype.test123 = function(x) {  };
    });

    afterEach(function() {
       delete Object.prototype.test123;
    });

    it('should pressdown/up on touchstart/end', inject(function($mdGesture, $document) {
      var downSpy = jasmine.createSpy('pressdown');
      var upSpy = jasmine.createSpy('pressup');
      var el = angular.element('<div>');

      el.on('$md.pressdown', downSpy)
        .on('$md.pressup', upSpy);

      $document.triggerHandler({
        type: 'touchstart',
        target: el[0]
      });
      expect(downSpy).toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();

      downSpy.calls.reset();

      $document.triggerHandler({
        type: 'touchmove',
        target: el[0]
      });
      expect(downSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();

      $document.triggerHandler({
        type: 'touchend',
        target: el[0]
      });
      expect(downSpy).not.toHaveBeenCalled();
      expect(upSpy).toHaveBeenCalled();
    }));

  });

  describe('hold', function() {

    it('should call hold after options number of ms', inject(function($mdGesture, $document, $timeout) {
      var holdSpy = jasmine.createSpy('hold');
      var el = angular.element('<div>');
      $mdGesture.register(el, 'hold', {
        delay: 333
      });

      el.on('$md.hold', holdSpy);

      $document.triggerHandler({
        type: 'touchstart',
        target: el[0]
      });

      // Make sure the timeout was set to exactly 333
      $timeout.flush(332);
      expect(holdSpy).not.toHaveBeenCalled();
      $timeout.flush(1);
      expect(holdSpy).toHaveBeenCalled();

      $timeout.verifyNoPendingTasks();
    }));

    it('should reset timeout if moving > options.maxDistance', inject(function($mdGesture, $document, $timeout) {
      var holdSpy = jasmine.createSpy('hold');
      var el = angular.element('<div>');
      $mdGesture.register(el, 'hold', {
        delay: 333,
        maxDistance: 10
      });

      el.on('$md.hold', holdSpy);
      spyOn($timeout, 'cancel').and.callThrough();

      $document.triggerHandler({
        type: 'touchstart',
        target: el[0],
        touches: [{pageX: 100, pageY: 100}]
      });
      expect(holdSpy).not.toHaveBeenCalled();
      $timeout.cancel.calls.reset();

      $document.triggerHandler({
        type: 'touchmove',
        target: el[0],
        touches: [{pageX: 90, pageY: 90}]
      });
      expect($timeout.cancel).toHaveBeenCalled();
      expect(holdSpy).not.toHaveBeenCalled();

      $timeout.verifyNoPendingTasks();
    }));

    it('should not reset timeout if moving < options.maxDistance', inject(function($mdGesture, $document, $timeout) {
      var holdSpy = jasmine.createSpy('hold');
      var el = angular.element('<div>');
      $mdGesture.register(el, 'hold', {
        delay: 333,
        maxDistance: 10
      });

      el.on('$md.hold', holdSpy);

      $document.triggerHandler({
        type: 'touchstart',
        target: el[0],
        touches: [{pageX: 100, pageY: 100}]
      });

      spyOn($timeout, 'cancel');
      expect(holdSpy).not.toHaveBeenCalled();

      $document.triggerHandler({
        type: 'touchmove',
        target: el[0],
        touches: [{pageX: 96, pageY: 96}]
      });

      expect(holdSpy).not.toHaveBeenCalled();
      expect($timeout.cancel).not.toHaveBeenCalled();

      $timeout.flush(333);
      expect(holdSpy).toHaveBeenCalled();
      $timeout.verifyNoPendingTasks();
    }));

  });

  describe('drag', function() {

    var startDragSpy, el, dragSpy, endDragSpy, doc;

    beforeEach(function() {
      inject(function($mdGesture, $document) {
        doc = $document;
        startDragSpy = jasmine.createSpy('dragstart');
        dragSpy = jasmine.createSpy('drag');
        endDragSpy = jasmine.createSpy('dragend');
        el = angular.element('<div>');

        $mdGesture.register(el, 'drag');
        el.on('$md.dragstart', startDragSpy)
          .on('$md.drag'     , dragSpy)
          .on('$md.dragend'  , endDragSpy);
      });
    });

    it('should only start after distanceX > minDistance', inject(function($mdGesture, $document) {

      doc.triggerHandler({
        type: 'touchstart',
        target: el[0],
        touches: [{pageX: 100, pageY: 100}]
      });
      expect(startDragSpy).not.toHaveBeenCalled();
      expect(dragSpy).not.toHaveBeenCalled();
      expect(endDragSpy).not.toHaveBeenCalled();

      // Move 5 distanceX, no trigger
      doc.triggerHandler({
        type: 'touchmove',
        target: el[0],
        touches: [{pageX: 95, pageY: 100}]
      });
      expect(startDragSpy).not.toHaveBeenCalled();
      expect(dragSpy).not.toHaveBeenCalled();
      expect(endDragSpy).not.toHaveBeenCalled();

      // Move 11 distanceX, trigger
      doc.triggerHandler({
        type: 'touchmove',
        target: el[0],
        touches: [{pageX: 89, pageY: 100}]
      });
      expect(startDragSpy).toHaveBeenCalled();

      expect(startDragSpy.calls.mostRecent().args[0].pointer).toHaveFields({
        startX: 89,
        startY: 100,
        x: 89,
        y: 100,
        distanceX: 0
      });
      expect(endDragSpy).not.toHaveBeenCalled();

      startDragSpy.calls.reset();
      doc.triggerHandler({
        type: 'touchmove',
        target: el[0],
        touches: [{pageX: 90, pageY: 99}]
      });
      expect(startDragSpy).not.toHaveBeenCalled();
      expect(dragSpy).toHaveBeenCalled();
      expect(endDragSpy).not.toHaveBeenCalled();

      dragSpy.calls.reset();
      doc.triggerHandler({
        type: 'touchend',
        target: el[0],
        changedTouches: [{pageX: 200, pageY: 0}]
      });
      expect(startDragSpy).not.toHaveBeenCalled();
      expect(dragSpy).not.toHaveBeenCalled();
      expect(endDragSpy).toHaveBeenCalled();

      var pointer = endDragSpy.calls.mostRecent().args[0].pointer;
      expect(pointer).toHaveFields({
        distanceX: 111,
        distanceY: -100,
        x: 200,
        y: 0
      });
    }));

  });

  describe('swipe', function() {
    var now;
    var leftSpy;
    var rightSpy;
    var upSpy;
    var downSpy;
    var el;

    beforeEach(function () {
      now = 0;

      spyOn(Date, 'now').and.callFake(function() { return now; });

      leftSpy = jasmine.createSpy('left');
      rightSpy = jasmine.createSpy('right');
      upSpy = jasmine.createSpy('up');
      downSpy = jasmine.createSpy('down');
      el = angular.element('<div>');

      el.on('$md.swipeleft', leftSpy)
        .on('$md.swiperight', rightSpy)
        .on('$md.swipeup', upSpy)
        .on('$md.swipedown', downSpy);

    });

    it('should swipeleft if velocityX > minVelocity and distanceX > maxDistance', inject(function($mdGesture, $document) {
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      now = 1;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: -100, pageY: 0
      });
      expect(leftSpy).toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      var pointer = leftSpy.calls.mostRecent().args[0].pointer;
      expect(pointer.velocityX).toBe(-100);
      expect(pointer.distanceX).toBe(-100);
    }));

    it('should swiperight if velocityX > minVelocity and distanceX > maxDistance', inject(function($mdGesture, $document) {
      $document.triggerHandler('$$mdGestureReset');
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      now = 1;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 100, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      var pointer = rightSpy.calls.mostRecent().args[0].pointer;
      expect(pointer.velocityX).toBe(100);
      expect(pointer.distanceX).toBe(100);

    }));

    it('should swipeup if velocityY > minVelocity and distanceY > maxDistance', inject(function($mdGesture, $document) {
      $document.triggerHandler('$$mdGestureReset');
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      now = 1;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 0, pageY: -100
      });
      expect(upSpy).toHaveBeenCalled();
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      var pointer = upSpy.calls.mostRecent().args[0].pointer;
      expect(pointer.velocityY).toBe(-100);
      expect(pointer.distanceY).toBe(-100);
    }));

    it('should swipedown if velocityY > minVelocity and distanceY > maxDistance', inject(function($mdGesture, $document) {
      $document.triggerHandler('$$mdGestureReset');
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      now = 1;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 0, pageY: 100
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).toHaveBeenCalled();

      var pointer = downSpy.calls.mostRecent().args[0].pointer;
      expect(pointer.velocityY).toBe(100);
      expect(pointer.distanceY).toBe(100);

    }));

    it('should not swipeleft when velocity is too low', inject(function($document) {
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      // 100ms and 50 distance = velocity of 0.5, below the boundary. no swipe.
      now = 100;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: -50, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      // 101ms and 100 distance = velocity of 1.0001, just fast enough for a swipe.
      now = 101;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: -100, pageY: 0
      });
      expect(leftSpy).toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();
    }));

    it('should not swiperight when distance is too low', inject(function($document) {
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      now = 1;
      //10 distance = boundary. no swipe.
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 10, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      //11 distance = enough. swipe.
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 11, pageY: 0
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();
    }));

    it('should not swipeup when velocity is too low', inject(function($document) {
      $document.triggerHandler('$$mdGestureReset');
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      // 100ms and 50 distance = velocity of 0.5, below the boundary. no swipe.
      now = 100;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 0, pageY: -50
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      // 101ms and 100 distance = velocity of 1.0001, just fast enough for a swipe.
      now = 101;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 0, pageY: -100
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();
    }));

    it('should not swipedown when velocity is too low', inject(function($document) {
      $document.triggerHandler('$$mdGestureReset');
      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      // 100ms and 50 distance = velocity of 0.5, below the boundary. no swipe.
      now = 100;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 0, pageY: 50
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).not.toHaveBeenCalled();

      $document.triggerHandler({
        type: 'touchstart', target: el[0], pageX: 0, pageY: 0
      });
      // 101ms and 100 distance = velocity of 1.0001, just fast enough for a swipe.
      now = 101;
      $document.triggerHandler({
        type: 'touchend', target: el[0], pageX: 0, pageY: 100
      });
      expect(leftSpy).not.toHaveBeenCalled();
      expect(rightSpy).not.toHaveBeenCalled();
      expect(upSpy).not.toHaveBeenCalled();
      expect(downSpy).toHaveBeenCalled();
    }));

  });

});
