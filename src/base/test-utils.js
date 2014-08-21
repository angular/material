var TestUtil = {
  /**
   * Creates a jQuery event for unit testing such that an event name and optional keyCode can be passed in.
   *
   */
  triggerEvent: function (element, eventName, eventData) {
    var e = $.extend({}, $.Event(eventName), eventData);
    if(eventData.keyCode){
      e.which = eventData.keyCode;
    }
    element.trigger(e);
  }
};
