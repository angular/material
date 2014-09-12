var TestUtil = {
  /**
   * Creates a jQuery event for unit testing such that an event name and optional keyCode can be passed in.
   *
   */
  triggerEvent: function (element, eventName, eventData) {
    eventData = eventData || {};
    var e = $.extend({}, $.Event(eventName), eventData);
    if(eventData.keyCode){
      e.which = eventData.keyCode;
    }
    element.trigger(e);
  },

  /** 
   * Mocks angular.element#focus for the duration of the test
   * @example
   * it('some focus test', inject(function($document) {
   *   TestUtil.mockFocus(this); // 'this' is the test instance
   *   doSomething();
   *   expect($document.activeElement).toBe(someElement[0]);
   * }));
   */
  mockElementFocus: function(test) {
    var focus = angular.element.prototype.focus;
    inject(function($document) {
      angular.element.prototype.focus = function() {
        $document.activeElement = this[0];
      };
    });
    // Un-mock focus after the test is done
    test.after(function() {
      angular.element.prototype.focus = focus;
    });
  }

};
