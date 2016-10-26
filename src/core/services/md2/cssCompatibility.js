(function() {
  'use strict';

  /**
   * Map of element names and the class that should be added to its DOM element.
   * Items commented out can be replaced, but it is not necessary since they
   * do not conflict with MD2 CSS.
   */
  var classMap = {
    // "md-autocomplete" : "md-autocomplete",
    // "md-autocomplete-wrap": "md-autocomplete-wrap",
    // "md-backdrop" : "md-backdrop",
    // "md-bottom-sheet": "md-bottom-sheet",
    // "md-calendar" : "md-calendar-element",
    // "md-calendar-month": "md-calendar-month",
    "md-card" : "md-card",
    "md-card-actions": "md-card-actions",
    // "md-card-avatar": "md-card-avatar",
    "md-card-content": "md-card-content",
    "md-card-footer": "md-card-footer",
    "md-card-header": "md-card-header",
    // "md-card-header-text" : "md-card-header-text",
    // "md-card-icon-actions" : "md-card-icon-actions",
    "md-card-title": "md-card-title",
    // "md-card-title-media" : "md-card-title-media",
    // "md-card-title-text" : "md-card-title-text",

    /*
     * Due to the way mdSwitch hooks into mdCheckbox, mdCheckbox cannot have more than one directive
     */
    // "md-checkbox" : "md-checkbox",

    // "md-chip" : "md-chip",
    // "md-chip-remove": "md-chip-remove-element",
    // "md-chips" : "md-chips-element",
    // "md-content" : "md-content",
    // "md-datepicker" : "md-datepicker",
    // "md-dialog" : "md-dialog-element",
    // "md-dialog-actions": "md-dialog-actions",
    // "md-dialog-content": "md-dialog-content-element",
    "md-divider" : "md-divider",
    // "md-fab-actions": "md-fab-actions",
    // "md-fab-speed-dial" : "md-fab-speed-dial",
    // "md-fab-toolbar": "md-fab-toolbar",
    // "md-fab-trigger": "md-fab-trigger",
    "md-grid-list": "md-grid-list",
    "md-grid-tile": "md-grid-tile",
    "md-grid-tile-footer" : "md-grid-tile-footer",
    "md-grid-tile-header" : "md-grid-tile-header",
    "md-icon" : "md-icon-element",
    "md-ink-bar": "md-ink-bar",
    // "md-inline-icon": "md-inline-icon",
    // "md-input-container": "md-input-container",
    "md-list" : "md-list",
    "md-list-item": "md-list-item",
    "md-menu" : "md-menu-element",
    // "md-menu-bar": "md-menu-bar",
    // "md-menu-content": "md-menu-content",
    // "md-menu-divider": "md-menu-divider",
    // "md-menu-item": "md-menu-item",
    // "md-nav-bar": "md-nav-bar-element",
    // "md-nav-extra-content" : "md-nav-extra-content",
    // "md-nav-ink-bar" : "md-nav-ink-bar",
    // "md-next-button": "md-next-button",
    // "md-optgroup" : "md-optgroup",
    "md-option" : "md-option",
    // "md-pagination-wrapper": "md-pagination-wrapper",
    // "md-prev-button": "md-prev-button",
    // "md-progress-circular": "md-progress-circular",
    // "md-progress-linear": "md-progress-linear",
    "md-radio-button": "md-radio-button",
    "md-radio-group": "md-radio-group",
    "md-select" : "md-select",
    // "md-select-label" : "md-select-label",
    // "md-select-menu": "md-select-menu",
    "md-sidenav" : "md-sidenav",
    "md-slider" : "md-slider",
    // "md-slider-container": "md-slider-container",
    // "md-switch" : "md-switch",
    // "md-tab" : "md-tab-element",
    // "md-tab-content": "md-tab-content",
    // "md-tab-data": "md-tab-data",
    // "md-tab-item": "md-tab-item",
    // "md-tab-label": "md-tab-label",
    // "md-tabs" : "md-tabs",
    // "md-tabs-canvas": "md-tabs-canvas",
    // "md-tabs-content-wrapper" : "md-tabs-content-wrapper",
    // "md-tabs-wrapper": "md-tabs-wrapper",
    // "md-toast" : "md-toast",
    "md-toolbar" : "md-toolbar",
    // "md-toolbar-filler": "md-toolbar-filler",
    // "md-tooltip" : "md-tooltip",
    // "md-whiteframe" : "md-whiteframe"
  };

  var PREFIX_REGEXP = /^((?:x|data)[:\-_])/i;
  var SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;

  /**
   * Converts all accepted directives format into proper directive name.
   * @param name Name to normalize
   */
  function directiveNormalize(name) {
    return name
      .replace(PREFIX_REGEXP, '')
      .replace(SPECIAL_CHARS_REGEXP, fnCamelCaseReplace);
  }

  function fnCamelCaseReplace(all, letter) {
    return letter.toUpperCase();
  }

  registerClasses( angular.module('material.core') );

  function registerClasses(module) {
    angular.forEach(classMap, function(value, key) {
      module.directive(directiveNormalize(key), cssDirective);
    });

    function cssDirective() {
      return {
        restrict: 'E',
        link: function(scope, element) {
          var className = classMap[element[0].tagName.toLowerCase()];
          className && element.addClass(className);
        }
      };
    }
  }

})();
