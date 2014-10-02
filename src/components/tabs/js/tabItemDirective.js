angular.module('material.components.tabs')

.directive('mdTab', [
  '$mdInkRipple',
  '$compile',
  '$mdAria',
  '$mdUtil',
  '$mdConstant',
  MdTabDirective
]);

/**
 * @ngdoc directive
 * @name mdTab
 * @module material.components.tabs
 *
 * @restrict E
 *
 * @description
 * `<md-tab>` is the nested directive used [within `<md-tabs>`] to specify each tab with a **label** and optional *view content*.
 *
 * If the `label` attribute is not specified, then an optional `<md-tab-label>` tag can be used to specified more
 * complex tab header markup. If neither the **label** nor the **md-tab-label** are specified, then the nested
 * markup of the `<md-tab>` is used as the tab header markup.
 *
 * If a tab **label** has been identified, then any **non-**`<md-tab-label>` markup
 * will be considered tab content and will be transcluded to the internal `<div class="tabs-content">` container.
 *
 * This container is used by the TabsController to show/hide the active tab's content view. This synchronization is
 * automatically managed by the internal TabsController whenever the tab selection changes. Selection changes can
 * be initiated via data binding changes, programmatic invocation, or user gestures.
 *
 * @param {string=} label Optional attribute to specify a simple string as the tab label
 * @param {boolean=} active When evaluteing to true, selects the tab.
 * @param {boolean=} disabled If present, disabled tab selection.
 * @param {expression=} deselected Expression to be evaluated after the tab has been de-selected.
 * @param {expression=} selected Expression to be evaluated after the tab has been selected.
 *
 *
 * @usage
 *
 * <hljs lang="html">
 * <md-tab label="" disabled="" selected="" deselected="" >
 *   <h3>My Tab content</h3>
 * </md-tab>
 *
 * <md-tab >
 *   <md-tab-label>
 *     <h3>My Tab content</h3>
 *   </md-tab-label>
 *   <p>
 *     Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
 *     totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
 *     dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
 *     sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
 *   </p>
 * </md-tab>
 * </hljs>
 *
 */
function MdTabDirective($mdInkRipple, $compile, $mdAria, $mdUtil, $mdConstant) {
  return {
    restrict: 'E',
    require: ['mdTab', '^mdTabs'],
    controller: '$mdTab',
    scope: {
      onSelect: '&',
      onDeselect: '&',
      label: '@'
    },
    compile: compile
  };

  function compile(element, attr) {
    var tabLabel = element.find('md-tab-label');

    if (tabLabel.length) {

      // If a tab label element is found, remove it for later re-use.
      tabLabel.remove();

    } else if (angular.isDefined(attr.label)) {

      // Otherwise, try to use attr.label as the label
      tabLabel = angular.element('<md-tab-label>').html(attr.label);

    } else {

      // If nothing is found, use the tab's content as the label
      tabLabel = angular.element('<md-tab-label>')
                        .append(element.contents().remove());
    }

    // Everything that's left as a child is the tab's content.
    var tabContent = element.contents().remove();

    return function postLink(scope, element, attr, ctrls) {

      var tabItemCtrl = ctrls[0]; // Controller for THIS tabItemCtrl
      var tabsCtrl = ctrls[1]; // Controller for ALL tabs

      transcludeTabContent();

      var detachRippleFn = $mdInkRipple.attachButtonBehavior(element);
      tabsCtrl.add(tabItemCtrl);
      scope.$on('$destroy', function() {
        detachRippleFn();
        tabsCtrl.remove(tabItemCtrl);
      });

      if (!angular.isDefined(attr.ngClick)) element.on('click', defaultClickListener);
      element.on('keydown', keydownListener);

      if (angular.isNumber(scope.$parent.$index)) watchNgRepeatIndex();
      if (angular.isDefined(attr.active)) watchActiveAttribute();
      watchDisabled();

      configureAria();

      function transcludeTabContent() {
        // Clone the label we found earlier, and $compile and append it
        var label = tabLabel.clone();
        element.append(label);
        $compile(label)(scope.$parent);

        // Clone the content we found earlier, and mark it for later placement into
        // the proper content area.
        tabItemCtrl.content = tabContent.clone();
      }

      //defaultClickListener isn't applied if the user provides an ngClick expression.
      function defaultClickListener() {
        scope.$apply(function() {
          tabsCtrl.select(tabItemCtrl);
          tabItemCtrl.element.focus();
        });
      }
      function keydownListener(ev) {
        if (ev.which == $mdConstant.KEY_CODE.SPACE ) {
          // Fire the click handler to do normal selection if space is pressed
          element.triggerHandler('click');
          ev.preventDefault();

        } else if (ev.which === $mdConstant.KEY_CODE.LEFT_ARROW) {
          var previous = tabsCtrl.previous(tabItemCtrl);
          previous && previous.element.focus();

        } else if (ev.which === $mdConstant.KEY_CODE.RIGHT_ARROW) {
          var next = tabsCtrl.next(tabItemCtrl);
          next && next.element.focus();
        }
      }

      // If tabItemCtrl is part of an ngRepeat, move the tabItemCtrl in our internal array
      // when its $index changes
      function watchNgRepeatIndex() {
        // The tabItemCtrl has an isolate scope, so we watch the $index on the parent.
        scope.$watch('$parent.$index', function $indexWatchAction(newIndex) {
          tabsCtrl.move(tabItemCtrl, newIndex);
        });
      }

      function watchActiveAttribute() {
        var unwatch = scope.$parent.$watch('!!(' + attr.active + ')', activeWatchAction);
        scope.$on('$destroy', unwatch);
        
        function activeWatchAction(isActive) {
          var isSelected = tabsCtrl.selected() === tabItemCtrl;

          if (isActive && !isSelected) {
            tabsCtrl.select(tabItemCtrl);
          } else if (!isActive && isSelected) {
            tabsCtrl.deselect(tabItemCtrl);
          }
        }
      }

      function watchDisabled() {
        scope.$watch(tabItemCtrl.isDisabled, disabledWatchAction);
        
        function disabledWatchAction(isDisabled) {
          element.attr('aria-disabled', isDisabled);

          // Auto select `next` tab when disabled
          var isSelected = (tabsCtrl.selected() === tabItemCtrl);
          if (isSelected && isDisabled) {
            tabsCtrl.select(tabsCtrl.next() || tabsCtrl.previous());
          }

        }
      }

      function configureAria() {
        // Link together the content area and tabItemCtrl with an id
        var tabId = attr.id || $mdUtil.nextUid();
        var tabContentId = 'content_' + tabId;
        element.attr({
          id: tabId,
          role: 'tabItemCtrl',
          tabIndex: '-1', //this is also set on select/deselect in tabItemCtrl
          'aria-controls': tabContentId
        });
        tabItemCtrl.contentContainer.attr({
          id: tabContentId,
          role: 'tabpanel',
          'aria-labelledby': tabId
        });

        $mdAria.expect(element, 'aria-label', true);
      }

    };

  }

}

