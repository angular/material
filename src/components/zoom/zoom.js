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
        var zoomedMessage = angular.element(element[0].querySelector('.md-zoom-message'));

        thumbContainer.append('<img draggable="false" src="' + attr.thumb + '"><div class="overlay"></div>');
        zoomedContainer.html('<img draggable="false" src="' + attr.zoom + '">');

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
        .on('$md.dragend', onDragStop)
        .on('mouseenter', onDragStart)
        .on('mouseleave', onDragStop)
        .on('mousemove', onDrag);

        function onDragStop(ev) {
            zoomedContainer.css('display', 'none');
            zoomedMessage.css('display', 'block');
            thumbContainer
            .css('cursor', 'default');
            ev.stopPropagation();
        }

        function onDragStart(ev) {
            zoomedContainer
            .css('height', thumbImage[0].offsetHeight + 'px')
            .css('width',thumbImage[0].offsetWidth + 'px')
            .css('display', 'block');

            zoomedMessage
            .css('display', 'none');

            zoomedImage
            .css('width', (thumbImage[0].offsetWidth * zoomSize) + 'px')
            .css('height', (thumbImage[0].offsetHeight * zoomSize) + 'px');
            angular.element(element[0])
            .css('cursor', 'move');
            ev.stopPropagation();
        }
        function onDrag(ev) {
            var x, y, clientWidth,clientHeight;
            if (ev.type === 'mousemove') {
                var rect = ev.target.getBoundingClientRect();
                x = ev.x - rect.left;
                y = ev.y - rect.top;
                clientWidth = ev.target.clientWidth;
                clientHeight = ev.target.clientHeight;
            } else {
                if ((angular.isDefined(ev.pointer) && !ev.pointer.x) || !angular.element(ev.target).hasClass('overlay')) {
                    return false;
                }
                var rect = ev.target.getBoundingClientRect();
                if (angular.isUndefined(ev.pointer)) {
                    ev.stopPropagation();
                    return false;
                }
                x = ev.pointer.x - rect.left;
                y = ev.pointer.y - rect.top;
                clientWidth = ev.pointer.target.clientWidth;
                clientHeight = ev.pointer.target.clientHeight;
            }

            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > clientWidth) x = clientWidth;
            if (y > clientHeight) y = clientHeight;

            var posX = (x * zoomSize ) - thumbImage[0].offsetWidth;
            var posY = (y * zoomSize ) - thumbImage[0].offsetHeight;
            zoomedImage
            .css('left', '-' + posX + 'px')
            .css('top',  '-' + posY + 'px');

            ev.stopPropagation();
        }
    }
}
