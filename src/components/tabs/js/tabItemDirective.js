angular.module('material.components.tabs')

.directive('materialTab', [
  '$materialInkRipple', 
  '$compile',
  '$aria',
  MaterialTabDirective
]);

/**
 * @ngdoc directive
 * @name materialTab
 * @module material.components.tabs
 * @order 1
 *
 * @restrict E
 *
 * @description
 * `<material-tabItemCtrl>` is the nested directive used [within `<material-tabs>`] to specify each tabItemCtrl with a **label** and optional *view content*.
 *
 * If the `label` attribute is not specified, then an optional `<material-tabItemCtrl-label>` tag can be used to specified more
 * complex tabItemCtrl header markup. If neither the **label** nor the **material-tabItemCtrl-label** are specified, then the nested
 * markup of the `<material-tabItemCtrl>` is used as the tabItemCtrl header markup.
 *
 * If a tabItemCtrl **label** has been identified, then any **non-**`<material-tabItemCtrl-label>` markup
 * will be considered tabItemCtrl content and will be transcluded to the internal `<div class="tabs-content">` container.
 *
 * This container is used by the TabsController to show/hide the active tabItemCtrl's content view. This synchronization is
 * automatically managed by the internal TabsController whenever the tabItemCtrl selection changes. Selection changes can
 * be initiated via data binding changes, programmatic invocation, or user gestures.
 *
 * @param {string=} label Optional attribute to specify a simple string as the tabItemCtrl label
 * @param {boolean=} active Flag indicates if the tabItemCtrl is currently selected; normally the `<material-tabs selected="">`; attribute is used instead.
 * @param {boolean=} ngDisabled Flag indicates if the tabItemCtrl is disabled: not selectable with no ink effects
 * @param {expression=} deselected Expression to be evaluated after the tabItemCtrl has been de-selected.
 * @param {expression=} selected Expression to be evaluated after the tabItemCtrl has been selected.
 *
 *
 * @usage
 *
 * <hljs lang="html">
 * <material-tabItemCtrl label="" disabled="" selected="" deselected="" >
 *   <h3>My Tab content</h3>
 * </material-tabItemCtrl>
 *
 * <material-tabItemCtrl >
 *   <material-tabItemCtrl-label>
 *     <h3>My Tab content</h3>
 *   </material-tabItemCtrl-label>
 *   <p>
 *     Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
 *     totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
 *     dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
 *     sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
 *   </p>
 * </material-tabItemCtrl>
 * </hljs>
 *
 */
function MaterialTabDirective($materialInkRipple, $compile, $aria) {
  return {
    restrict: 'E',
    require: ['materialTab', '^materialTabs'],
    controller: '$materialTab',
    scope: {
      onSelect: '&',
      onDeselect: '&',
      label: '@'
    },
    compile: compile
  };

  function compile(element, attr) {
    var tabLabel = element.find('material-tab-label');

    // If a tab label element is found, remove it for later re-use.
    if (tabLabel.length) {
      tabLabel.remove();
    // Otherwise, try to use attr.label as the label
    } else if (angular.isDefined(attr.label)) {
      tabLabel = angular.element('<material-tab-label>').html(attr.label);
    // If nothing is found, use the tab's content as the label
    } else {
      tabLabel = angular.element('<material-tab-label>')
        .append(element.contents().remove());
    }

    // Everything that's left is the tab's content area.
    var tabContent = element.contents().remove();

    return function postLink(scope, element, attr, ctrls) {

      var tabItemCtrl = ctrls[0]; // Controller for THIS tabItemCtrl
      var tabsCtrl = ctrls[1]; // Controller for ALL tabs

      transcludeTabContent();

      var detachRippleFn = $materialInkRipple.attachButtonBehavior(element);
      var removeTabFn = tabsCtrl.add(tabItemCtrl);
      scope.$on('$destroy', function() {
        detachRippleFn();
        removeTabFn();
      });

      if (!angular.isDefined(attr.ngClick)) element.on('click', defaultClickListener);
      element.on('keydown', keydownListener);

      if (angular.isNumber(scope.$parent.$index)) watchNgRepeatIndex();
      if (angular.isDefined(attr.active))         watchActiveAttribute();
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
        if (ev.which == Constant.KEY_CODE.SPACE ) {
          // Fire the click handler to do normal selection if space is pressed
          element.triggerHandler('click');
          ev.preventDefault();

        } else if (ev.which === Constant.KEY_CODE.LEFT_ARROW) {
          var previous = tabsCtrl.previous(tabItemCtrl);
          previous && previous.element.focus();

        } else if (ev.which === Constant.KEY_CODE.RIGHT_ARROW) {
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
        scope.$parent.$watch('!!(' + attr.active + ')', function activeWatchAction(isActive)
        {
          var isSelected = (tabsCtrl.selected() === tabItemCtrl);

          if (isActive && !isSelected) {
            tabsCtrl.select(tabItemCtrl);

          } else if (!isActive && isSelected) {
            tabsCtrl.deselect(tabItemCtrl);
          }
        });
      }

      function watchDisabled() {
        scope.$watch(tabItemCtrl.isDisabled, function disabledWatchAction(isDisabled) {
          element.attr('aria-disabled', isDisabled);

          // Auto select `next` tab when disabled
          var isSelected = (tabsCtrl.selected() === tabItemCtrl);
          if( isSelected && isDisabled ) {
            tabsCtrl.select( tabsCtrl.next(tabItemCtrl) || tabsCtrl.previous(tabItemCtrl) );
          }

        });
      }

      function configureAria() {
        // Link together the content area and tabItemCtrl with an id
        var tabId = attr.id || Util.nextUid();
        var tabContentId = 'content_' + tabId;
        element.attr({
          id: tabId,
          role: 'tabItemCtrl',
          tabIndex: '-1', //this is also set on select/deselect in tabItemCtrl
          'aria-controls': tabContentId
        });
        tabItemCtrl.contentParent.attr({
          id: tabContentId,
          role: 'tabpanel',
          'aria-labelledby': tabId
        });

        $aria.expect(element, 'aria-label', element.text());
      }

    };

  }

}

