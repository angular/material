angular
  .module('material.components.toolbar')
  .controller('MdToolbarController', MdToolbarController);

/**
 * @ngInject
 */
function MdToolbarController ($scope, $element, $attrs, $$rAF, $mdConstant, $mdUtil, $animate) {
  var translateY = angular.bind(null, $mdUtil.supplant, 'translate3d(0,{0}px,0)');
  var ctrl = this;

  // Public properties
  ctrl.registerContentElement = registerContentElement;
  ctrl.setScrollShrinkTarget = setScrollShrinkTarget;
  ctrl.overrideScrollHook = overrideScrollHook;
  ctrl.isScrollShrinkReady = false;

  // Private properties
  var scrollHook = defaultScrollHook;
  var contentElement;
  var scrollElement;
  var toolbarHeight;
  var prevScrollTop = 0;
  var y = 0;
  var shrinkSpeedFactor = $attrs.mdShrinkSpeedFactor || 0.5;
  var contentLoadWatcher;
  var contentScroll = 0;
  var debouncedContentScroll = $$rAF.throttle(onContentScrollEvent);
  var disableScrollShrink = angular.noop;
  var shouldScroll;
  var isHidden = false;

  if (angular.isDefined($attrs.mdScrollShrink)) {
    setupScrollShrink();

    ctrl.isScrollShrinkReady = true;
  }

  function setupScrollShrink() {
    $$rAF(determineToolbarHeight);

    // Wait for $mdContentLoaded event from mdContent directive.
    // If the mdContent element is a sibling of our toolbar, hook it up
    // to scroll events.
    contentLoadWatcher = $scope.$on('$mdContentLoaded', onMdContentFound);

    // If the toolbar is used inside an ng-if statement, we may miss the
    // $mdContentLoaded event, so we attempt to fake it if we have a
    // md-content close enough.

    $attrs.$observe('mdScrollShrink', onChangeScrollShrink);

    // If the toolbar has ngShow or ngHide we need to update height immediately as it changed
    // and not wait for $mdUtil.debounce to happen

    if ($attrs.ngShow) {
      $scope.$watch($attrs.ngShow, function (val) {
        determineToolbarHeight(!val);
      });
    }
    if ($attrs.ngHide) { $scope.$watch($attrs.ngHide, determineToolbarHeight); }

    // If the scope is destroyed (which could happen with ng-if), make sure
    // to disable scroll shrinking again
    $scope.$on('$destroy', disableScrollShrink);
  }

  function onMdContentFound($event, newContentEl) {
    // Toolbar and content must be siblings
    if (newContentEl && $element.parent()[0] === newContentEl.parent()[0]) {
      registerContentElement(newContentEl);
      registerScrollElement(newContentEl);
    }
  }

  function registerScrollElement (element) {
    // Unhook old content event listener if exists
    if (scrollElement) {
      scrollElement.off('scroll', debouncedContentScroll);
    }

    prevScrollTop = 0;
    scrollElement = element;
    disableScrollShrink = enableScrollShrink();
  }


  function onChangeScrollShrink(shrinkWithScroll) {
    var closestContent = $element.parent().find('md-content');

    // If we have a content element, fake the call; this might still fail
    // if the content element isn't a sibling of the toolbar
    if (!contentElement && closestContent.length) {
      onMdContentFound(null, closestContent);
    }

    // Evaluate the expression
    shrinkWithScroll = $scope.$eval(shrinkWithScroll);

    // Disable only if the attribute's expression evaluates to false
    if (shrinkWithScroll === false) {
      disableScrollShrink();
      onContentScrollEvent({
        target: {
          scrollTop: 0
        }
      }, true);
      shouldScroll = false;
    } else {
      shouldScroll = true;
      disableScrollShrink = enableScrollShrink();
    }
  }

  function onContentScrollEvent(e, bypass) {
    if (!shouldScroll && !bypass) return;
    var scrollTop = e ? e.target.scrollTop : prevScrollTop;
    var isScrollingDown = scrollTop >= prevScrollTop;
    var margin = toolbarHeight * shrinkSpeedFactor;

    y = Math.min(
      toolbarHeight / shrinkSpeedFactor,
      Math.max(0, y + scrollTop - prevScrollTop)
    );

    if (!isScrollingDown || (isScrollingDown && contentScroll > -margin)) {

      contentScroll = (toolbarHeight - y) * shrinkSpeedFactor;

      y = scrollTop === 0 ? 0 : y;

      $element.css($mdConstant.CSS.TRANSFORM, translateY([- y * shrinkSpeedFactor]));

      // This calls our scrollHook which is mostly moving the content upward,
      // because the toolbar and the content are silbings.
      scrollHook(y, contentScroll, margin, toolbarHeight, shrinkSpeedFactor);
    }

    prevScrollTop = scrollTop;
  }

  function enableScrollShrink() {
    if (!contentElement) return angular.noop;

    scrollElement.on('scroll', debouncedContentScroll);
    contentElement.attr('scroll-shrink', 'true');

    $$rAF(determineToolbarHeight);

    return function disableScrollShrink() {
      scrollElement.off('scroll', debouncedContentScroll);
      contentElement.attr('scroll-shrink', 'false');

      $$rAF(determineToolbarHeight);
    }
  }

  function determineToolbarHeight(watchValue) {
    // $$rAF is providing a random number that we should not take into account
    if (!angular.isNumber(watchValue)) {
      isHidden = watchValue;
    }

    toolbarHeight = isHidden ? 0 : $element.prop('offsetHeight');

    if (!toolbarHeight && !isHidden) {
      $$rAF(determineToolbarHeight);
      return;
    }

    onContentScrollEvent();
  }

  function defaultScrollHook (y, contentScroll, margin, toolbarHeight, shrinkSpeedFactor) {
    contentElement.css($mdConstant.CSS.TRANSFORM, translateY([contentScroll]));

    contentElement.css({
      'margin-top': - margin + 'px',
      'margin-bottom': ((toolbarHeight - y) * shrinkSpeedFactor) + 'px'
    });

    $mdUtil.nextTick(function () {
      var hasWhiteFrame = $element.hasClass('md-whiteframe-z1');

      if (hasWhiteFrame && !y) {
        $animate.removeClass($element, 'md-whiteframe-z1');
      } else if (!hasWhiteFrame && y) {
        $animate.addClass($element, 'md-whiteframe-z1');
      }
    });
  }

  function setScrollShrinkTarget (target) {
    // Disable the content load watcher, because we registered the scroll target ourself.
    contentLoadWatcher && contentLoadWatcher();
    registerScrollElement(angular.element(target));
  }

  function registerContentElement (element) {
    contentElement = element;
  }

  function overrideScrollHook (hook) {
    scrollHook = hook;
  }
}