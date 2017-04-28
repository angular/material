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
 * @name mdZoom
 * @module material.components.zoom
 * @restrict E
 * @description
 * The `<md-zoom>` component allows the user to see an image with real zoom when drag over the thumb image
 *
 * @usage
 * <hljs lang="html">
 * <md-zoom thumb="thumb-image" zoom="zoom-image" size=zoom-scale>
 * <label>message to notify the user to start drag</label>
 * </md-zoom>
 * </hljs>
 *
 * @param {string=} thumb Thumb image.
 * @param {string=} zoom Zoomed image
 * @param {number=} size scale to zoom the background image.
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
        thumbContainer.find('label').addClass('md-zoom-message');
    }

    var thumbImage = thumbContainer.find('img');
    var zoomedImage = zoomedContainer.find('img');

    var zoomSize = attr.size || 2;

    $mdGesture.register(element, 'drag');
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
