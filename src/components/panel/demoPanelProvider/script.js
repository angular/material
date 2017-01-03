(function() {
  'use strict';

  angular
      .module('panelProviderDemo', ['ngMaterial'])
      .config(PanelProviderConfig)
      .controller('PanelProviderCtrl', PanelProviderCtrl)
      .controller('PanelMenuCtrl', PanelMenuCtrl);

  /**
   * Configuration method that is used to define a preset for the upcoming panel
   * element. Each parameter in the preset is an available parameter in the
   * `$mdPanel.create` and `$mdPanel.open` methods. When the parameters are
   * defined here, they overwrite the default parameters for any panel that the
   * preset is requested for.
   * @param {!MdPanelProvider} $mdPanelProvider Provider method of the MdPanel
   *     API.
   */
  function PanelProviderConfig($mdPanelProvider) {
    $mdPanelProvider.definePreset('demoPreset', {
      attachTo: angular.element(document.body),
      controller: PanelMenuCtrl,
      controllerAs: 'ctrl',
      template: '' +
          '<div class="menu-panel" md-whiteframe="4">' +
          '  <div class="menu-content">' +
          '    <div class="menu-item" ng-repeat="item in ctrl.items">' +
          '      <button class="md-button">' +
          '        <span>{{item}}</span>' +
          '      </button>' +
          '    </div>' +
          '    <md-divider></md-divider>' +
          '    <div class="menu-item">' +
          '      <button class="md-button" ng-click="ctrl.closeMenu()">' +
          '        <span>Close Menu</span>' +
          '      </button>' +
          '    </div>' +
          '  </div>' +
          '</div>',
      panelClass: 'menu-panel-container',
      focusOnOpen: false,
      zIndex: 100,
      propagateContainerEvents: true,
      groupName: 'menus'
    });
  }

  function PanelProviderCtrl($mdPanel) {
    this.navigation = {
      name: 'navigation',
      items: [
        'Home',
        'About',
        'Contact'
      ]
    };
    this.favorites = {
      name: 'favorites',
      items: [
        'Add to Favorites'
      ]
    };
    this.more = {
      name: 'more',
      items: [
        'Account',
        'Sign Out'
      ]
    };

    $mdPanel.newPanelGroup('menus', {
      maxOpen: 2
    });

    this.showMenu = function($event, menu) {
      /**
       * The request to open the panel has two arguments passed into it. The
       * first is a preset name passed in as a string. This will request a
       * cached preset and apply its configuration parameters. The second is an
       * object containing parameters that can only be filled through a
       * controller. These parameters represent configuration needs associated
       * with user interaction, panel position, panel animation, and other
       * miscellaneous needs.
       */
      $mdPanel.open('demoPreset', {
        id: 'menu_' + menu.name,
        position: $mdPanel.newPanelPosition()
            .relativeTo($event.srcElement)
            .addPanelPosition(
              $mdPanel.xPosition.ALIGN_START,
              $mdPanel.yPosition.BELOW
            ),
        locals: {
          items: menu.items
        },
        openFrom: $event
      });
    };
  }

  function PanelMenuCtrl(mdPanelRef) {
    this.closeMenu = function() {
      mdPanelRef && mdPanelRef.close();
    };
  }
})();
