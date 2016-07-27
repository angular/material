  /**
   * @ngdoc module
   * @name material.components.zoom
   */
  angular.module('material.components.zoom', [
    'material.core'
  ])
  .directive('mdZoom', ZoomDirective);

/**
 * @ngdoc directive
 * @name mdSlider
 * @module material.components.slider
 * @restrict E
 * @description
 * The `<md-slider>` component allows the user to choose from a range of
 * values.
 *
 * As per the [material design spec](http://www.google.com/design/spec/style/color.html#color-ui-color-application)
 * the slider is in the accent color by default. The primary color palette may be used with
 * the `md-primary` class.
 *
 * It has two modes: 'normal' mode, where the user slides between a wide range
 * of values, and 'discrete' mode, where the user slides between only a few
 * select values.
 *
 * To enable discrete mode, add the `md-discrete` attribute to a slider,
 * and use the `step` attribute to change the distance between
 * values the user is allowed to pick.
 *
 * @usage
 * <h4>Normal Mode</h4>
 * <hljs lang="html">
 * <md-slider ng-model="myValue" min="5" max="500">
 * </md-slider>
 * </hljs>
 * <h4>Discrete Mode</h4>
 * <hljs lang="html">
 * <md-slider md-discrete ng-model="myDiscreteValue" step="10" min="10" max="130">
 * </md-slider>
 * </hljs>
 *
 * @param {boolean=} md-discrete Whether to enable discrete mode.
 * @param {number=} step The distance between values the user is allowed to pick. Default 1.
 * @param {number=} min The minimum value the user is allowed to pick. Default 0.
 * @param {number=} max The maximum value the user is allowed to pick. Default 100.
 */
function ZoomDirective($mdGesture) {
  return {
    scope: {},
    transclude: true,
    template:
      '<div class="md-zoom-wrapper">' +
        '<div class="md-zoom-thumb-container"><div ng-transclude></div></div>' +
        '<div class="md-zoom-zoomed-container"></div>' +
      '</div>',
    compile: compile
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function compile (tElement, tAttrs) {
    tElement.attr({
      tabIndex: 0,
      role: 'zoom'
    });

    return postLink;
  }

  function postLink(scope, element, attr, ngModelCtrl) {
    ngModelCtrl = ngModelCtrl || {
      // Mock ngModelController if it doesn't exist to give us
      // the minimum functionality needed
      $setViewValue: function(val) {
        this.$viewValue = val;
        this.$viewChangeListeners.forEach(function(cb) { cb(); });
      },
      $parsers: [],
      $formatters: [],
      $viewChangeListeners: []
    };

    var thumbContainer = angular.element(element[0].querySelector('.md-zoom-thumb-container'));
    var zoomedContainer = angular.element(element[0].querySelector('.md-zoom-zoomed-container'));
    var zoomeMessage = angular.element(element[0].querySelector('.md-zoom-message'));

    thumbContainer.append('<img draggable="false" src="' + attr.thumb + '">');
    zoomedContainer.html('<img src="' + attr.zoom + '">');

    if (thumbContainer.find('label')) {
        console.log("tiene label");
        thumbContainer.find('label').addClass('md-zoom-message');
      //element.append('<label class="md-zoom-message">' + attr.label + '</label>');
    }

    var thumbImage = thumbContainer.find('img');
    var zoomedImage = zoomedContainer.find('img');

    var zoomSize = attr.size || 2;

    $mdGesture.register(element, 'drag');
    //$mdGesture.register(element, 'swipe');

    element
      .on('$md.drag', onDrag)
      .on('$md.dragstart', onDragStart)
      .on('$md.dragend', onDragStop);


    function onDragStop(ev) {
      zoomedContainer.css('display', 'none  ');
      zoomeMessage.css('display', 'block');
      thumbContainer
        .css('cursor', 'default');
    }

    function onDragStart(ev) {
      zoomedContainer
          .css('height', thumbImage[0].offsetHeight + 'px')
          .css('width',thumbImage[0].offsetWidth + 'px')
          .css('display', 'block');

        zoomeMessage
          .css('display', 'none');

        zoomedImage
          .css('width', (thumbImage[0].offsetWidth * zoomSize) + 'px')
          .css('height', (thumbImage[0].offsetHeight * zoomSize) + 'px');
        angular.element(element[0])
          .css('cursor', 'move');
    }
    function onDrag(ev) {
      if (!ev.pointer.target.x) {
        return false;
      }
      var rect = ev.target.getBoundingClientRect();

      var x = ev.pointer.x - rect.left;
      var y = ev.pointer.y - rect.top;
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > ev.pointer.target.clientWidth) x = ev.pointer.target.clientWidth;
      if (y > ev.pointer.target.clientHeight) y = ev.pointer.target.clientHeight;

      var posX = (x * zoomSize ) - thumbImage[0].offsetWidth;
      var posY = (y * zoomSize ) - thumbImage[0].offsetHeight;
      zoomedImage
        .css('left', '-' + posX + 'px')
        .css('top',  '-' + posY + 'px');

      ev.stopPropagation();
    }
  }
}
