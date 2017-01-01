/**
 * @ngdoc directive
 * @name mdMenu
 * @module material.components.menu
 * @restrict E
 * @description
 *
 * Menus are elements that open when clicked. They are useful for displaying
 * additional options within the context of an action.
 *
 * Every `md-menu` must specify exactly two child elements. The first element is what is
 * left in the DOM and is used to open the menu. This element is called the trigger element.
 * The trigger element's scope has access to `$mdMenu.open($event)`
 * which it may call to open the menu. By passing $event as argument, the
 * corresponding event is stopped from propagating up the DOM-tree. Similarly, `$mdMenu.close()`
 * can be used to close the menu.
 *
 * The second element is the `md-menu-content` element which represents the
 * contents of the menu when it is open. Typically this will contain `md-menu-item`s,
 * but you can do custom content as well.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <!-- Trigger element is a md-button with an icon -->
 *  <md-button ng-click="$mdMenu.open($event)" class="md-icon-button" aria-label="Open sample menu">
 *    <md-icon md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item><md-button ng-click="doSomething()">Do Something</md-button></md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>

 * ## Sizing Menus
 *
 * The width of the menu when it is open may be specified by specifying a `width`
 * attribute on the `md-menu-content` element.
 * See the [Material Design Spec](https://material.google.com/components/menus.html#menus-simple-menus)
 * for more information.
 *
 *
 * ## Aligning Menus
 *
 * When a menu opens, it is important that the content aligns with the trigger element.
 * Failure to align menus can result in jarring experiences for users as content
 * suddenly shifts. To help with this, `md-menu` provides serveral APIs to help
 * with alignment.
 *
 * ### Target Mode
 *
 * By default, `md-menu` will attempt to align the `md-menu-content` by aligning
 * designated child elements in both the trigger and the menu content.
 *
 * To specify the alignment element in the `trigger` you can use the `md-menu-origin`
 * attribute on a child element. If no `md-menu-origin` is specified, the `md-menu`
 * will be used as the origin element.
 *
 * Similarly, the `md-menu-content` may specify a `md-menu-align-target` for a
 * `md-menu-item` to specify the node that it should try and align with.
 *
 * In this example code, we specify an icon to be our origin element, and an
 * icon in our menu content to be our alignment target. This ensures that both
 * icons are aligned when the menu opens.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdMenu.open($event)" class="md-icon-button" aria-label="Open some menu">
 *    <md-icon md-menu-origin md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item>
 *      <md-button ng-click="doSomething()" aria-label="Do something">
 *        <md-icon md-menu-align-target md-svg-icon="call:phone"></md-icon>
 *        Do Something
 *      </md-button>
 *    </md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>
 *
 * Sometimes we want to specify alignment on the right side of an element, for example
 * if we have a menu on the right side a toolbar, we want to right align our menu content.
 *
 * We can specify the origin by using the `md-position-mode` attribute on both
 * the `x` and `y` axis. Right now only the `x-axis` has more than one option.
 * You may specify the default mode of `target target` or
 * `target-right target` to specify a right-oriented alignment target. See the
 * position section of the demos for more examples.
 *
 * ### Menu Offsets
 *
 * It is sometimes unavoidable to need to have a deeper level of control for
 * the positioning of a menu to ensure perfect alignment. `md-menu` provides
 * the `md-offset` attribute to allow pixel level specificty of adjusting the
 * exact positioning.
 *
 * This offset is provided in the format of `x y` or `n` where `n` will be used
 * in both the `x` and `y` axis.
 *
 * For example, to move a menu by `2px` down from the top, we can use:
 * <hljs lang="html">
 * <md-menu md-offset="0 2">
 *   <!-- menu-content -->
 * </md-menu>
 * </hljs>
 *
 * ### Auto Focus
 * By default, when a menu opens, `md-menu` focuses the first button in the menu content.
 *
 * But sometimes you would like to focus another specific menu item instead of the first.<br/>
 * This can be done by applying the `md-autofocus` directive on the given element.
 *
 * <hljs lang="html">
 * <md-menu-item>
 *   <md-button md-autofocus ng-click="doSomething()">
 *     Auto Focus
 *   </md-button>
 * </md-menu-item>
 * </hljs>
 *
 *
 * ### Preventing close
 *
 * Sometimes you would like to be able to click on a menu item without having the menu
 * close. To do this, ngMaterial exposes the `md-prevent-menu-close` attribute which
 * can be added to a button inside a menu to stop the menu from automatically closing.
 * You can then close the menu either by using `$mdMenu.close()` in the template,
 * or programatically by injecting `$mdMenu` and calling `$mdMenu.hide()`.
 *
 * <hljs lang="html">
 * <md-menu-content ng-mouseleave="$mdMenu.close()">
 *   <md-menu-item>
 *     <md-button ng-click="doSomething()" aria-label="Do something" md-prevent-menu-close="md-prevent-menu-close">
 *       <md-icon md-menu-align-target md-svg-icon="call:phone"></md-icon>
 *       Do Something
 *     </md-button>
 *   </md-menu-item>
 * </md-menu-content>
 * </hljs>
 *
 * @usage
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdMenu.open($event)" class="md-icon-button">
 *    <md-icon md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item><md-button ng-click="doSomething()">Do Something</md-button></md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>
 *
 * @param {string} md-position-mode The position mode in the form of
 *           `x`, `y`. Default value is `target`,`target`. Right now the `x` axis
 *           also supports `target-right`.
 * @param {string} md-offset An offset to apply to the dropdown after positioning
 *           `x`, `y`. Default value is `0`,`0`.
 *
 */

angular
    .module('material.components.menu')
    .directive('mdMenu', MenuDirective);

/**
 * @ngInject
 */
function MenuDirective($mdUtil) {
  var INVALID_PREFIX = 'Invalid HTML for md-menu: ';
  return {
    restrict: 'E',
    require: ['mdMenu', '?^mdMenuBar'],
    controller: 'mdMenuCtrl', // empty function to be built by link
    scope: true,
    compile: compile
  };

  function compile(templateElement) {
    templateElement.addClass('md-menu');

    var triggerEl = templateElement.children()[0];
    var contentEl = templateElement.children()[1];

    var prefixer = $mdUtil.prefixer();

    if (!prefixer.hasAttribute(triggerEl, 'ng-click')) {
      triggerEl = triggerEl
          .querySelector(prefixer.buildSelector(['ng-click', 'ng-mouseenter'])) || triggerEl;
    }

    var isButtonTrigger = triggerEl.nodeName === 'MD-BUTTON' || triggerEl.nodeName === 'BUTTON';

    if (triggerEl && isButtonTrigger && !triggerEl.hasAttribute('type')) {
      triggerEl.setAttribute('type', 'button');
    }

    if (!triggerEl) {
      throw Error(INVALID_PREFIX + 'Expected the menu to have a trigger element.');
    }

    if (!contentEl || contentEl.nodeName !== 'MD-MENU-CONTENT') {
      throw Error(INVALID_PREFIX + 'Expected the menu to contain a `md-menu-content` element.');
    }

    // Default element for ARIA attributes has the ngClick or ngMouseenter expression
    triggerEl && triggerEl.setAttribute('aria-haspopup', 'true');

    var nestedMenus = templateElement[0].querySelectorAll('md-menu');
    var nestingDepth = parseInt(templateElement[0].getAttribute('md-nest-level'), 10) || 0;
    if (nestedMenus) {
      angular.forEach($mdUtil.nodesToArray(nestedMenus), function(menuEl) {
        if (!menuEl.hasAttribute('md-position-mode')) {
          menuEl.setAttribute('md-position-mode', 'cascade');
        }
        menuEl.classList.add('_md-nested-menu');
        menuEl.setAttribute('md-nest-level', nestingDepth + 1);
      });
    }
    return link;
  }

  function link(scope, element, attr, ctrls) {
    var mdMenuCtrl = ctrls[0];
    var isInMenuBar = !!ctrls[1];
    // Move everything into a md-menu-container and pass it to the controller
    var menuContainer = angular.element( '<div class="_md md-open-menu-container md-whiteframe-z2"></div>');
    var menuContents = element.children()[1];

    element.addClass('_md');     // private md component indicator for styling

    if (!menuContents.hasAttribute('role')) {
      menuContents.setAttribute('role', 'menu');
    }
    menuContainer.append(menuContents);

    element.on('$destroy', function() {
      menuContainer.remove();
    });

    element.append(menuContainer);
    menuContainer[0].style.display = 'none';
    mdMenuCtrl.init(menuContainer, { isInMenuBar: isInMenuBar });

  }
}
