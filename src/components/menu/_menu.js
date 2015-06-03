/**
 * @ngdoc module
 * @name material.components.menu
 */

angular.module('material.components.menu', [
  'material.core',
  'material.components.backdrop'
])
.directive('mdMenu', MenuDirective);

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
 * left in the DOM and is used to open the menu. This element is called the origin element.
 * The origin element's scope has access to `$mdOpenMenu()`
 * which it may call to open the menu.
 *
 * The second element is the `md-menu-content` element which represents the
 * contents of the menu when it is open. Typically this will contain `md-menu-item`s,
 * but you can do custom content as well.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <!-- Origin element is a md-button with an icon -->
 *  <md-button ng-click="$mdOpenMenu()" class="md-icon-button">
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
 * See the [Material Design Spec](http://www.google.com/design/spec/components/menus.html#menus-specs)
 * for more information.
 *
 *
 * ## Aligning Menus
 *
 * When a menu opens, it is important that the content aligns with the origin element.
 * Failure to align menus can result in jarring experiences for users as content
 * suddenly shifts. To help with this, `md-menu` provides serveral APIs to help
 * with alignment.
 *
 * ### Target Mode
 *
 * By default, `md-menu` will attempt to align the `md-menu-content` by aligning
 * designated child elements in both the origin and the menu content.
 *
 * To specify the alignment element in the `origin` you can use the `md-menu-origin`
 * attribute on a child element. If no `md-menu-origin` is specified, the `md-menu`
 * will be used as the origin element.
 *
 * Similarly, the `md-menu-content` may specify a `md-menu-align-target` for a
 * `md-menu-item` to specify the node that it should try and allign with.
 *
 * In this example code, we specify an icon to be our origin element, and an
 * icon in our menu content to be our alignment target. This ensures that both
 * icons are aligned when the menu opens.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdOpenMenu()" class="md-icon-button">
 *    <md-icon md-menu-origin md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item>
 *      <md-button ng-click="doSomething()">
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
 * For example, to move a menu by `2px` from the top, we can use:
 * <hljs lang="html">
 * <md-menu md-offset="2 0">
 *   <!-- menu-content -->
 * </md-menu>
 * </hljs>
 *
 * @usage
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdOpenMenu()" class="md-icon-button">
 *    <md-icon md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item><md-button ng-click="doSomething()">Do Something</md-button></md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>
 *
 * @param {string} md-position-mode The position mode in the form of
             `x`, `y`. Default value is `target`,`target`. Right now the `x` axis
             also suppports `target-right`.
 * @param {string} md-offset An offset to apply to the dropdown after positioning
             `x`, `y`. Default value is `0`,`0`.
 *
 */

function MenuDirective($mdMenu) {
  return {
    restrict: 'E',
    require: 'mdMenu',
    controller: function() { }, // empty function to be built by link
    scope: true,
    compile: compile
  };

  function compile(tEl) {
    tEl.addClass('md-menu');
    tEl.children().eq(0).attr('aria-haspopup', 'true');
    return link;
  }

  function link(scope, el, attrs, mdMenuCtrl) {
    // Se up mdMenuCtrl to keep our code squeaky clean
    buildCtrl();

    // Expose a open function to the child scope for their html to use
    scope.$mdOpenMenu = function() {
      mdMenuCtrl.open();
    };

    if (el.children().length != 2) {
      throw new Error('Invalid HTML for md-menu. Expected two children elements.');
    }

    // Move everything into a md-menu-container
    var menuContainer = angular.element('<div class="md-open-menu-container md-whiteframe-z2"></div>');
    var menuContents = el.children()[1];
    menuContainer.append(menuContents);

    var enabled;
    mdMenuCtrl.enable();

    function buildCtrl() {
      mdMenuCtrl.enable = function enableMenu() {
        if (!enabled) {
          //el.on('keydown', handleKeypress);
          enabled = true;
        }
      };

      mdMenuCtrl.disable = function disableMenu() {
        if (enabled) {
          //el.off('keydown', handleKeypress);
          enabled = false;
        }
      };

      mdMenuCtrl.open = function openMenu() {
        el.attr('aria-expanded', 'true');
        $mdMenu.show({
          mdMenuCtrl: mdMenuCtrl,
          element: menuContainer,
          target: el[0]
        });
      };

      mdMenuCtrl.close = function closeMenu(skipFocus) {
        el.attr('aria-expanded', 'false');
        $mdMenu.hide();
        if (!skipFocus) el.children()[0].focus();
      };

      mdMenuCtrl.positionMode = function() {
        var attachment = (attrs.mdPositionMode || 'target').split(' ');

        if (attachment.length == 1) { attachment.push(attachment[0]); }

        return {
          left: attachment[0],
          top: attachment[1]
        };

      };

      mdMenuCtrl.offsets = function() {
        var offsets = (attrs.mdOffset || '0 0').split(' ').map(function(x) { return parseFloat(x, 10); });
        if (offsets.length == 2) {
          return {
            left: offsets[0],
            top: offsets[1]
          };
        } else if (offsets.length == 1) {
          return {
            top: offsets[0],
            left: offsets[0]
          };
        } else {
          throw new Error('Invalid offsets specified. Please follow format <x, y> or <n>');
        }
      };
    }
  }
}
