(function() {
'use strict';

angular.module('material.components.elidable', [
  'material.core',
])
  .directive('mdElidable', mdElidableDirective)
  .service('$mdElidable', mdElidableService);

var ELLIPSIS = '…'; // Unicode horizontal ellipsis character.
var UNIQUE_ELLIPSIS = '.\u200b.\u200b.'; // Zero-width spaces between periods.

// These closure globals will be defined by the `mdElidableService` factory.
var compile, mdUtil, timeout, viewport;

/**
 * @ngdoc directive
 * @name mdElide
 * @restrict AE
 *
 * @description Manages an element whose text content should be truncated when
 * it overflows the element’s bounds and decorated with an ellipsis to stand
 * in for the truncated content.
 *
 * @element ANY
 *
 * @example
   <div md-elidable>This text will be truncated if it overflows.</div>
 */
function mdElidableDirective($mdElidable) {
  return {
    restrict: 'AE',
    link: function (scope, element, attrs) {
      var remove = $mdElidable.add(element, scope);

      scope.$on('$destroy', function () {
        remove();
      });
    }
  };
}

/**
 * @ngdoc service
 * @name $mdElidable
 * @module material.components.elidable
 *
 * @description Manages multiple elements and notifies each one when an event
 * occurs (for example, 'resize') that may require the element’s contents to
 * be truncated.
 */

/**
 * @ngdoc method
 * @name $mdElidable#add
 * @param {Element} elidable The element to manage.
 * @param {angular.Scope} scope The scope to which `element` is linked.
 *
 * @return {function} A function that will stop `element` from being managed by
 *   `$mdElidable` when called.
 *
 * @description Starts managing `element`.
 */

/**
 * @ngdoc method
 * @name $mdElidable#elide
 *
 * @description Truncates each element added with {@see $mdElidable#add}, which
 * should only be necessary if there is an elidable element whose content
 * changes outside Angular’s digest cycle (you are using `scope.$apply(...)`,
 * right?).
 */

function mdElidableService($compile, $document, $mdUtil, $timeout, $window) {
  var EVENT_DELAY_MS = 128;
  var UID_DATA = 'mdElidableUid';

  var elidables = {};
  var timer;
  var uid = 0;

  // Share injected dependencies with the closure.
  compile = $compile;
  mdUtil = $mdUtil;
  timeout = $timeout;
  viewport = {
    x: {
      min: $window.pageXOffset,
      max: $window.pageXOffset + $window.innerWidth
    },
    y: {
      min: $window.pageYOffset,
      max: $window.pageYOffset + $window.innerHeight
    }
  };

  function add(element, scope) {
    var eid = element.data(UID_DATA);
    if (eid === undefined) {
      eid = uid;
      element.data(UID_DATA, uid);
      elidables[uid] = new Elidable(element, scope);
      ++uid;
    }

    return function () {
      remove(eid);
    }
  }

  function remove(uid) {
    if (elidables[uid]) {
      elidables[uid].destroy();
      delete elidables[uid];
    }
  }

  function elide() {
    viewport.x.min = $window.pageXOffset;
    viewport.x.max = viewport.x.min + $window.innerWidth;
    viewport.y.min = $window.pageYOffset;
    viewport.y.max = viewport.y.min + $window.innerHeight;

    for (var uid in elidables) {
      elidables[uid].elide();
    }
  }

  angular.element($window).on('resize scroll', function () {
    $timeout.cancel(timer);
    timer = $timeout(elide, EVENT_DELAY_MS, false);
  });

  $document.on('visibilitychange', elide);

  return {
    add: add,
    elide: elide,
  }
}

/**
 * Manages an element whose text content should be truncated when it overflows
 * the element’s bounds.
 *
 * @param {Element} element The element whose content should be truncated.
 * @param {angular.Scope} scope The scope to which `element` is linked.
 *
 * @constructor
 */
function Elidable(element, scope) {
  this.css = {
    'display': element.css('display'),
    'overflow': element.css('overflow'),
    'white-space': element.css('white-space')
  }

  this.clone = compile('<span>' + element.html() + '</span>')(scope);
  this.element = element;
  this.unwatch = scope.$watch(onDigest.bind(this));

  element.css({
    'display': 'block',
    'overflow': 'hidden',
    'white-space': 'normal'
  });
}

/**
 * Handles completed $digest calls by truncating this elidable’s text content
 * if it or its visibility has changed since the last $digest cycle.
 *
 * @this {Elidable}
 * @private
 */
function onDigest() {
  // The digest cycle seems to be sufficient to detect model-driven visibility
  // changes (e.g., via ng-show or ng-hide) for this elidable and any of its
  // ancestor elements. We call `elide` asynchronously to give DOM dimensions
  // time to materialize.
  var self = this;
  timeout(function () {
    self.elide();
  }, 0, false);
}

/**
 * Determines if truncation should be deferred.
 *
 * @return {boolean} `true` if this elidable’s text content should be
 *     preserved as is; `false` if it should be truncated.
 */
Elidable.prototype.defer = function () {
  if (!this.element) {
    return true;
  }

  if (document.hidden) {
    // Defer. The whole page is in a background tab, is part of a minimized
    // window, or the OS screen is locked.
    return true;
  }

  var element = this.element[0];

  if (element.offsetHeight && element.offsetWidth) {
    var offset = mdUtil.clientRect(element);

    if (offset === undefined ||
        offset.top + element.offsetHeight < viewport.y.min || offset.top >= viewport.y.max ||
        offset.left + element.offsetWidth < viewport.x.min || offset.left >= viewport.x.max) {
      // Defer. The element is not visible because it is off-screen.
      return true;
    }

    // Proceed. The element is visible and on-screen.
    return false;
  }

  // Defer. The element is not visible.
  return true;
}

/**
 * Truncates this elidable’s text content if necessary and then appends an
 * ellipsis to the truncated content.
 */
Elidable.prototype.elide = function () {
  if (this.defer()) {
    return;
  }

  var element = this.element;
  var clone = this.clone.clone();

  element.empty().append(clone);

  if (element[0].scrollHeight > element[0].clientHeight) {
    var lastElementChild = clone[0].lastElementChild;
    var ellipsis = angular.element(document.createTextNode(UNIQUE_ELLIPSIS));

    clone.append(ellipsis);

    truncate(clone, function () {
      return element[0].scrollHeight <= element[0].clientHeight;
    });

    ellipsis[0].textContent = ELLIPSIS;
  }
};

/**
 * Cleans up this elidable when it is no longer needed.
 */
Elidable.prototype.destroy = function () {
  this.unwatch();
  this.element.css(this.css);

  delete this.clone;
  delete this.element;
};

/**
 * Shortens the text content of `element` until `done` returns `true` (i.e.,
 * when the content will fit without overflowing a container element). Nested
 * elements are truncated individually so that their styles are preserved.
 *
 * @param {Element} element The element to truncate.
 * @param {function} done The function that checks if the text content is
 *     sufficiently truncated.
 * @private
 */
function truncate(element, done) {
  // TODO (mikol, 2015-03-03): This seems to work for RTL in the trivial case
  // when there are no nested elements. I’m not sure how to test this with
  // nested elements (<a> or <span>, for example). Inserting ASCII characters
  // for a tag in the middle of an RTL string (Hebrew, for example) causes the
  // insertion point to jump around in ways that I do not understand. Even if I
  // manage to wrap a substring in a <span> element, when the page renders, the
  // <span> appears around a different substring – i.e., one at a different
  // character offset than what I see in the HTML source.
  var jq = element.contents();
  var contents = [];
  var nx = jq.length;

  for (var x = nx - 1; x > -1; --x) {
    contents.push(jq[x]);
  }

  for (x = 0; x < nx; ++x) {
    var node = contents[x];

    if (node.childNodes.length > 0) {
      truncate(angular.element(node), done);
    } else {
      var text = node.textContent;

      if (text === UNIQUE_ELLIPSIS) {
        continue;
      }

      // Use a binary search strategy to determine the ideal text length.
      var min = 0;
      var max = text.length;
      var mid;

      while (min < max) {
        mid = Math.ceil((min + max) / 2);
        node.textContent = text.slice(0, mid);

        if (done()) {
          // “Done” is something of a misnomer here. What we really mean is
          // that the first half of the string is short enough, but it could
          // also be too short so we start the process over in the middle.
          min = mid;
        } else {
          max = mid - 1;
        }
      }

      node.textContent = text.slice(0, min);

      if (!done()) {
        var parentNode = node.parentNode;
        var grandparentNode = parentNode.parentNode;

        if (parentNode.textContent === '' && grandparentNode) {
          grandparentNode.removeChild(parentNode);
        } else {
          parentNode.removeChild(node);
        }

        continue;
      }

      break;
    }
  }
}
})();
