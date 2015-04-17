(function() {
  'use strict';

  angular
    .module('material.components.fabToolbar', [
      'material.core',
      'material.components.fabTrigger',
      'material.components.fabActions'
    ])
    .directive('mdFabToolbar', MdFabToolbarDirective)
    .animation('.md-is-open', MdFabToolbarOpenAnimation);

  /**
   * @ngdoc directive
   * @name mdFabToolbar
   * @module material.components.fabToolbar
   *
   * @restrict E
   *
   * @description
   *
   * The `<md-fab-toolbar>` directive is used present a toolbar of elements (usually `<md-button>`s)
   * for quick access to common actions when a floating action button is activated (via hover or
   * keyboard navigation).
   *
   * @usage
   *
   * <hljs lang="html">
   * <md-fab-toolbar>
   *   <md-fab-trigger>
   *     <md-button><md-icon icon="/img/icons/plus.svg"></md-icon></md-button>
   *   </md-fab-trigger>
   *
   *   <md-fab-actions>
   *     <md-button><md-icon icon="/img/icons/user.svg"></md-icon></md-button>
   *     <md-button><md-icon icon="/img/icons/group.svg"></md-icon></md-button>
   *   </md-fab-actions>
   * </md-fab-toolbar>
   * </hljs>
   *
   * @param {expression=} md-open Programmatically control whether or not the toolbar is visible.
   */
  function MdFabToolbarDirective() {
    return {
      restrict: 'E',
      transclude: true,
      template: [
        '<div class="md-fab-toolbar-wrapper">',
        '  <div class="md-fab-toolbar-background"></div>',
        '  <div class="md-fab-toolbar-content" ng-transclude></div>',
        '</div>'
      ].join('\n'),

      scope: {
        isOpen: '=?mdOpen'
      },

      bindToController: true,
      controller: FabToolbarController,
      controllerAs: 'vm',

      link: link
    };

    function FabToolbarController($scope, $element, $animate) {
      var vm = this;

      // Set the default to be closed
      vm.isOpen = vm.isOpen || false;

      vm.open = function() {
        vm.isOpen = true;
        $scope.$apply();
      };

      vm.close = function() {
        vm.isOpen = false;
        $scope.$apply();
      };

      // Setup some mouse events so the hover effect can be triggered
      // anywhere over the toolbar
      $element.on('mouseenter', vm.open);
      $element.on('mouseleave', vm.close);

      // Watch for changes to md-open and toggle our class
      $scope.$watch('vm.isOpen', function(isOpen) {
        var toAdd = isOpen ? 'md-is-open' : '';
        var toRemove = isOpen ? '' : 'md-is-open';

        $animate.setClass($element, toAdd, toRemove);
      });
    }

    function link(scope, element, attributes) {
      // Don't allow focus on the trigger
      element.find('md-fab-trigger').find('button').attr('tabindex', '-1');
    }
  }

  function MdFabToolbarOpenAnimation() {
    function runAnimation(element) {
      var el = element[0];

      // Grab the relevant child elements
      var backgroundElement = el.querySelector('.md-fab-toolbar-background');
      var triggerElement = angular.element(el.querySelector('md-fab-trigger')).children().eq(0)[0];

      // If we have both elements, use them to position the new background
      if (triggerElement && backgroundElement) {
        // Get our variables
        var color = window.getComputedStyle(triggerElement).getPropertyValue('background-color');
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        // Make a square
        var scaleWidth = width * 2;
        var scaleHeight = width * 2;

        var top = -width + (height / 2);
        var side = -width + (triggerElement.offsetWidth / 2) + triggerElement.offsetLeft;

        // Set all of the styles
        backgroundElement.style.backgroundColor = color;
        backgroundElement.style.borderRadius = width + 'px';
        backgroundElement.style.width = scaleWidth + 'px';
        backgroundElement.style.height = scaleHeight + 'px';
        backgroundElement.style.top = top + 'px';

        if (element.hasClass('md-left')) {
          backgroundElement.style.right = null;
          backgroundElement.style.left = side + 'px';
        }

        if (element.hasClass('md-right')) {
          backgroundElement.style.left = null;
          backgroundElement.style.right = side + 'px';
        }
      }
    }

    return {
      addClass: function(element, className, done) {
        runAnimation(element);
      },

      removeClass: function(element, className, done) {
        runAnimation(element);
      }
    }
  }
})();