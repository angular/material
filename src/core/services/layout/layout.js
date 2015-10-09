(function() {
  'use strict';

  var $mdUtil, $$mdLayout, $interpolate;

  var SUFFICES = /(-sm|-gt-sm|-md|-gt-md|-lg|-gt-lg)/g;
  var WHITESPACE = /\s+/g;

  var FLEX_OPTIONS = ['grow', 'initial', 'auto', 'none'];
  var LAYOUT_OPTIONS = ['row', 'column'];
  var ALIGNMENT_OPTIONS = [
        "start start", "start center", "start end",
        "center", "center center", "center start", "center end",
        "end", "end center", "end start", "end end",
        "space-around", "space-around center", "space-around start", "space-around end",
        "space-between", "space-between center", "space-between start", "space-between end"
      ];


  var config = {
    /**
     * Enable directive attribute-to-class conversions
     */
    enabled: true,

    /**
     * List of mediaQuery breakpoints and associated suffixes
     *
     *   [
     *    { suffix: "sm", mediaQuery: "screen and (max-width: 599px)" },
     *    { suffix: "md", mediaQuery: "screen and (min-width: 600px) and (max-width: 959px)" }
     *   ]
     */
    breakpoints: []
  };

  /**
   *   The original ngMaterial Layout solution used attribute selectors and CSS.
   *
   *  ```html
   *  <div layout="column"> My Content </div>
   *  ```
   *
   *  ```css
   *  [layout] {
     *    box-sizing: border-box;
     *    display:flex;
     *  }
   *  [layout=column] {
     *    flex-direction : column
     *  }
   *  ```
   *
   *  Use of attribute selectors creates significant performance impacts in some
   *  browsers... mainly IE.
   *
   *  This module registers directives that allow the same layout attributes to be
   *  interpreted and converted to class selectors. The directive will add equivalent classes to each element that
   *  contains a Layout directive.
   *
   * ```html
   *   <div layout="column" class="layout layout-column"> My Content </div>
   *```
   *
   *  ```css
   *  .layout {
     *    box-sizing: border-box;
     *    display:flex;
     *  }
   *  .layout-column {
     *    flex-direction : column
     *  }
   *  ```
   */
  angular.module('material.core.layout', ['ng'])

  /**
   * Model of flags used by the Layout directives
   * Allows changes while running tests or runtime app changes
   */
    .factory("$$mdLayout", function() {
      return {
        removeAttributes: true
      };
    })

    // Attribute directives with optional value(s)

    .directive('layout', attributeWithObserve('layout'))
    .directive('layoutSm', attributeWithObserve('layout-sm'))
    .directive('layoutGtSm', attributeWithObserve('layout-gt-sm'))
    .directive('layoutMd', attributeWithObserve('layout-md'))
    .directive('layoutGtMd', attributeWithObserve('layout-gt-md'))
    .directive('layoutLg', attributeWithObserve('layout-lg'))
    .directive('layoutGtLg', attributeWithObserve('layout-gt-lg'))

    .directive('flex', attributeWithObserve('flex'))
    .directive('flexSm', attributeWithObserve('flex-sm'))
    .directive('flexGtSm', attributeWithObserve('flex-gt-sm'))
    .directive('flexMd', attributeWithObserve('flex-md'))
    .directive('flexGtMd', attributeWithObserve('flex-gt-md'))
    .directive('flexLg', attributeWithObserve('flex-lg'))
    .directive('flexGtLg', attributeWithObserve('flex-gt-lg'))

    .directive('flexOrder', attributeWithObserve('flex-order'))
    .directive('flexOrderSm', attributeWithObserve('flex-order-sm'))
    .directive('flexOrderGtSm', attributeWithObserve('flex-order-gt-sm'))
    .directive('flexOrderMd', attributeWithObserve('flex-order-md'))
    .directive('flexOrderGtMd', attributeWithObserve('flex-order-gt-md'))
    .directive('flexOrderLg', attributeWithObserve('flex-order-lg'))
    .directive('flexOrderGtLg', attributeWithObserve('flex-order-gt-lg'))

    .directive('offset', attributeWithObserve('layout-offset'))
    .directive('offsetSm', attributeWithObserve('layout-offset-sm'))
    .directive('offsetGtSm', attributeWithObserve('layout-offset-gt-sm'))
    .directive('offsetMd', attributeWithObserve('layout-offset-md'))
    .directive('offsetGtMd', attributeWithObserve('layout-offset-gt-md'))
    .directive('offsetLg', attributeWithObserve('layout-offset-lg'))
    .directive('offsetGtLg', attributeWithObserve('layout-offset-gt-lg'))
    .directive('layoutOffset', attributeWithObserve('layout-offset'))
    .directive('layoutOffsetSm', attributeWithObserve('layout-offset-sm'))
    .directive('layoutOffsetGtSm', attributeWithObserve('layout-offset-gt-sm'))
    .directive('layoutOffsetMd', attributeWithObserve('layout-offset-md'))
    .directive('layoutOffsetGtMd', attributeWithObserve('layout-offset-gt-md'))
    .directive('layoutOffsetLg', attributeWithObserve('layout-offset-lg'))
    .directive('layoutOffsetGtLg', attributeWithObserve('layout-offset-gt-lg'))

    .directive('layoutAlign', attributeWithObserve('layout-align'))
    .directive('layoutAlignSm', attributeWithObserve('layout-align-sm'))
    .directive('layoutAlignGtSm', attributeWithObserve('layout-align-gt-sm'))
    .directive('layoutAlignMd', attributeWithObserve('layout-align-md'))
    .directive('layoutAlignGtMd', attributeWithObserve('layout-align-gt-md'))
    .directive('layoutAlignLg', attributeWithObserve('layout-align-lg'))
    .directive('layoutAlignGtLg', attributeWithObserve('layout-align-gt-lg'))

    // Attribute directives with no value(s)

    .directive('hide', attributeWithoutValue('hide'))
    .directive('hideSm', attributeWithoutValue('hide-sm'))
    .directive('hideGtSm', attributeWithoutValue('hide-gt-sm'))
    .directive('hideMd', attributeWithoutValue('hide-md'))
    .directive('hideGtMd', attributeWithoutValue('hide-gt-md'))
    .directive('hideLg', attributeWithoutValue('hide-lg'))
    .directive('hideGtLg', attributeWithoutValue('hide-gt-lg'))
    .directive('show', attributeWithoutValue('show'))
    .directive('showSm', attributeWithoutValue('show-sm'))
    .directive('showGtSm', attributeWithoutValue('show-gt-sm'))
    .directive('showMd', attributeWithoutValue('show-md'))
    .directive('showGtMd', attributeWithoutValue('show-gt-md'))
    .directive('showLg', attributeWithoutValue('show-lg'))
    .directive('showGtLg', attributeWithoutValue('show-gt-lg'))

    // Attribute directives with no value(s) and NO breakpoints

    .directive('layoutMargin', attributeWithoutValue('layout-margin'))
    .directive('layoutPadding', attributeWithoutValue('layout-padding'))
    .directive('layoutWrap', attributeWithoutValue('layout-wrap'))
    .directive('layoutNoWrap', attributeWithoutValue('layout-no-wrap'))
    .directive('layoutFill', attributeWithoutValue('layout-fill'))

    // !! Deprecated attributes: use the `-lt` (aka less-than) notations

    .directive('layoutLtMd', warnAttrNotSupported('layout-lt-md', true))
    .directive('layoutLtLg', warnAttrNotSupported('layout-lt-lg', true))
    .directive('flexLtMd', warnAttrNotSupported('flex-lt-md', true))
    .directive('flexLtLg', warnAttrNotSupported('flex-lt-lg', true))

    .directive('layoutAlignLtMd', warnAttrNotSupported('layout-align-lt-md'))
    .directive('layoutAlignLtLg', warnAttrNotSupported('layout-align-lt-lg'))
    .directive('flexOrderLtMd', warnAttrNotSupported('flex-order-lt-md'))
    .directive('flexOrderLtLg', warnAttrNotSupported('flex-order-lt-lg'))
    .directive('offsetLtMd', warnAttrNotSupported('layout-offset-lt-md'))
    .directive('offsetLtLg', warnAttrNotSupported('layout-offset-lt-lg'))

    .directive('hideLtMd', warnAttrNotSupported('hide-lt-md'))
    .directive('hideLtLg', warnAttrNotSupported('hide-lt-lg'))
    .directive('showLtMd', warnAttrNotSupported('show-lt-md'))
    .directive('showLtLg', warnAttrNotSupported('show-lt-lg'));

  /**
   * These functions create registration functions for ngMaterial Layout attribute directives
   * This provides easy translation to switch ngMaterial attribute selectors to
   * CLASS selectors and directives; which has huge performance implications
   * for IE Browsers
   */

  /**
   * Creates a directive registration function where a possible dynamic attribute
   * value will be observed/watched.
   * @param {string} className attribute name; eg `layout-gt-md` with value ="row"
   */
  function attributeWithObserve(className) {

    return ['$mdUtil', '$$mdLayout', '$interpolate', function(_$mdUtil_, _$$mdLayout_, _$interpolate_) {
      $mdUtil = _$mdUtil_;
      $$mdLayout = _$$mdLayout_;
      $interpolate = _$interpolate_;

      return {
        restrict: 'A',
        compile: function(element, attr) {
          var linkFn;
          if (config.enabled) {
            // immediately replace static (non-interpolated) invalid values...

            validateAttributeValue( className,
              getNormalizedAttrValue(className, attr, ""),
              buildUpdateFn(element, className, attr)
            );

            linkFn = translateWithValueToCssClass;
          }

          // Use for postLink to account for transforms after ng-transclude.
          return linkFn || angular.noop;
        }
      };
    }];

    /**
     * Add as transformed class selector(s), then
     * remove the deprecated attribute selector
     */
    function translateWithValueToCssClass(scope, element, attrs) {
      var updateFn = updateClassWithValue(element, className, attrs);
      var unwatch = attrs.$observe(attrs.$normalize(className), updateFn);

      updateFn(getNormalizedAttrValue(className, attrs, ""));
      scope.$on("$destroy", function() { unwatch() });

      if ($$mdLayout.removeAttributes) element.removeAttr(className);
    }
  }

  /**
   * Creates a registration function for ngMaterial Layout attribute directive.
   * This is a `simple` transpose of attribute usage to class usage; where we ignore
   * any attribute value
   */
  function attributeWithoutValue(className) {
    return ['$$mdLayout', '$interpolate', function(_$$mdLayout_, _$interpolate_) {
      $$mdLayout = _$$mdLayout_;
      $interpolate = _$interpolate_;

      return {
        restrict: 'A',
        compile: function(element, attr) {
          var linkFn;
          if (config.enabled) {
            // immediately replace static (non-interpolated) invalid values...

            validateAttributeValue( className,
              getNormalizedAttrValue(className, attr, ""),
              buildUpdateFn(element, className, attr)
            );

            translateToCssClass(null, element);

            // Use for postLink to account for transforms after ng-transclude.
            linkFn = translateToCssClass;
          }

          return linkFn || angular.noop;
        }
      };
    }];

    /**
     * Add as transformed class selector, then
     * remove the deprecated attribute selector
     */
    function translateToCssClass(scope, element) {
      element.addClass(className);

      if ($$mdLayout.removeAttributes) {
        // After link-phase, remove deprecated layout attribute selector
        element.removeAttr(className);
      }
    }
  }



  /**
   * After link-phase, do NOT remove deprecated layout attribute selector.
   * Instead watch the attribute so interpolated data-bindings to layout
   * selectors will continue to be supported.
   *
   * $observe() the className and update with new class (after removing the last one)
   *
   * e.g. `layout="{{layoutDemo.direction}}"` will update...
   *
   * NOTE: The value must match one of the specified styles in the CSS.
   * For example `flex-gt-md="{{size}}`  where `scope.size == 47` will NOT work since
   * only breakpoints for 0, 5, 10, 15... 100, 33, 34, 66, 67 are defined.
   *
   */
  function updateClassWithValue(element, className) {
    var lastClass;

    return function updateClassFn(newValue) {
      var value = validateAttributeValue(className, newValue || "");
      if ( angular.isDefined(value) ) {
        element.removeClass(lastClass);
        lastClass = !value ? className : className + "-" + value.replace(WHITESPACE, "-")
        element.addClass(lastClass);
      }
    };
  }

  /**
   * Provide console warning that this layout attribute has been deprecated
   *
   */
  function warnAttrNotSupported(className) {
    var parts = className.split("-");
    return ["$log", function($log) {
      $log.warn(className + "has been deprecated. Please use a `" + parts[0] + "-gt-<xxx>` variant.");
      return angular.noop;
    }];
  }

  /**
   * For the Layout attribute value, validate or replace with default
   * fallback value
   */
  function validateAttributeValue(className, value, updateFn) {
    var origValue = value;

    if (!needsInterpolation(value)) {
      switch (className.replace(SUFFICES,"")) {
        case 'layout'        :
          if ( !findIn(value, LAYOUT_OPTIONS) ) {
            value = LAYOUT_OPTIONS[0];    // 'row';
          }
          break;

        case 'flex'          :
          if (!findIn(value, FLEX_OPTIONS)) {
            if (isNaN(+value)) {
              value = '';
            }
          }
          break;

        case 'layout-offset' :
        case 'flex-order'    :
          if (!value || isNaN(+value)) {
            value = '0';
          }
          break;

        case 'layout-align'  :
          if (!findIn(value, ALIGNMENT_OPTIONS, "-")) {
            value = ALIGNMENT_OPTIONS[0];   // 'start-start';
          }
          break;

        case 'layout-padding' :
        case 'layout-margin'  :
        case 'layout-fill'    :
        case 'layout-wrap'    :
        case 'layout-no-wrap' :
          value = '';
          break;
      }

      if (value != origValue) {
        (updateFn || angular.noop)(value);
      }
    }

    return value;
  }

  /**
   * Replace current attribute value with fallback value
   */
  function buildUpdateFn(element, className, attrs) {
    return function updateAttrValue(fallback) {
      if (!needsInterpolation(fallback)) {
        element.attr(className, fallback);
        attrs[attrs.$normalize(className)] = fallback;
      }
    };
  }

  /**
   * See if the original value has interpolation symbols:
   * e.g.  flex-gt-md="{{triggerPoint}}"
   */
  function needsInterpolation(value) {
    return (value || "").indexOf($interpolate.startSymbol()) > -1;
  }

  function getNormalizedAttrValue(className, attrs, defaultVal) {
    var normalizedAttr = attrs.$normalize(className);
    return attrs[normalizedAttr] ? attrs[normalizedAttr].replace(WHITESPACE, "-") : defaultVal || null;
  }

  function findIn(item, list, replaceWith) {
    item = replaceWith && item ? item.replace(WHITESPACE, replaceWith) : item;

    var found = false;
    if (item) {
      list.forEach(function(it) {
        it = replaceWith ? it.replace(WHITESPACE, replaceWith) : it;
        found = found || (it === item);
      });
    }
    return found;
  }

})();
