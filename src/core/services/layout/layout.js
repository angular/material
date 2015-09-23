(function () {
  'use strict';

  var $$mdLayout, $parse, $interpolate;

    /**
     *
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
    angular.module('material.core.layout', [ 'ng' ])

      /**
       * Model of flags used by the Layout directives
       * Allows changes while running tests or runtime app changes
       */
      .factory("$$mdLayout", function() {
        return {
          /**
           * Should we remove the original layout Attribute selectors
           * after translation injection
           */
          removeAttributes : true,

          /**
           * Special internal flag used to optimize
           * noop(s) for the directive postLinks below
           */
          disablePostLinks : undefined
        };
      })

      // Attribute directives with optional value(s)

      .directive('layout'              , attributeWithObserve('layout' , true)       )
      .directive('layoutSm'            , attributeWithObserve('layout-sm'   , true)  )
      .directive('layoutGtSm'          , attributeWithObserve('layout-gt-sm', true)  )
      .directive('layoutMd'            , attributeWithObserve('layout-md'   , true)  )
      .directive('layoutGtMd'          , attributeWithObserve('layout-gt-md', true)  )
      .directive('layoutLg'            , attributeWithObserve('layout-lg'   , true)  )
      .directive('layoutGtLg'          , attributeWithObserve('layout-gt-lg', true)  )

      .directive('flex'                , attributeWithObserve('flex'        , true)  )
      .directive('flexSm'              , attributeWithObserve('flex-sm'     , true)  )
      .directive('flexGtSm'            , attributeWithObserve('flex-gt-sm'  , true)  )
      .directive('flexMd'              , attributeWithObserve('flex-md'     , true)  )
      .directive('flexGtMd'            , attributeWithObserve('flex-gt-md'  , true)  )
      .directive('flexLg'              , attributeWithObserve('flex-lg'     , true)  )
      .directive('flexGtLg'            , attributeWithObserve('flex-gt-lg'  , true)  )

      // Attribute directives with optional value(s) but directiveName is NOT added as a class

      .directive('layoutAlign'         , attributeWithObserve('layout-align')        )
      .directive('layoutAlignSm'       , attributeWithObserve('layout-align-sm')     )
      .directive('layoutAlignGtSm'     , attributeWithObserve('layout-align-gt-sm')  )
      .directive('layoutAlignMd'       , attributeWithObserve('layout-align-md')     )
      .directive('layoutAlignGtMd'     , attributeWithObserve('layout-align-gt-md')  )
      .directive('layoutAlignLg'       , attributeWithObserve('layout-align-lg')     )
      .directive('layoutAlignGtLg'     , attributeWithObserve('layout-align-gt-lg')  )

      .directive('flexOrder'           , attributeWithObserve('flex-order')          )
      .directive('flexOrderSm'         , attributeWithObserve('flex-order-sm')       )
      .directive('flexOrderGtSm'       , attributeWithObserve('flex-order-gt-sm')    )
      .directive('flexOrderMd'         , attributeWithObserve('flex-order-md')       )
      .directive('flexOrderGtMd'       , attributeWithObserve('flex-order-gt-md')    )
      .directive('flexOrderLg'         , attributeWithObserve('flex-order-lg')       )
      .directive('flexOrderGtLg'       , attributeWithObserve('flex-order-gt-lg')    )

      .directive('offset'              , attributeWithObserve('offset')              )
      .directive('offsetSm'            , attributeWithObserve('offset-sm')           )
      .directive('offsetGtSm'          , attributeWithObserve('offset-gt-sm')        )
      .directive('offsetMd'            , attributeWithObserve('offset-md')           )
      .directive('offsetGtMd'          , attributeWithObserve('offset-gt-md')        )
      .directive('offsetLg'            , attributeWithObserve('offset-lg')           )
      .directive('offsetGtLg'          , attributeWithObserve('offset-gt-lg')        )

      // Attribute directives with no value(s)

      .directive('layoutMargin'        , attributeWithoutValue('layout-margin')      )
      .directive('layoutPadding'       , attributeWithoutValue('layout-padding')     )
      .directive('layoutWrap'          , attributeWithoutValue('layout-wrap')        )
      .directive('layoutFill'          , attributeWithoutValue('layout-fill')        )

      .directive('hide'                , attributeWithoutValue('hide')               )
      .directive('hideSm'              , attributeWithoutValue('hide-sm')            )
      .directive('hideGtSm'            , attributeWithoutValue('hide-gt-sm')         )
      .directive('hideMd'              , attributeWithoutValue('hide-md')            )
      .directive('hideGtMd'            , attributeWithoutValue('hide-gt-md')         )
      .directive('hideLg'              , attributeWithoutValue('hide-lg')            )
      .directive('hideGtLg'            , attributeWithoutValue('hide-gt-lg')         )
      .directive('show'                , attributeWithoutValue('show')               )
      .directive('showSm'              , attributeWithoutValue('show-sm')            )
      .directive('showGtSm'            , attributeWithoutValue('show-gt-sm')         )
      .directive('showMd'              , attributeWithoutValue('show-md')            )
      .directive('showGtMd'            , attributeWithoutValue('show-gt-md')         )
      .directive('showLg'              , attributeWithoutValue('show-lg')            )
      .directive('showGtLg'            , attributeWithoutValue('show-gt-lg')         )

      // !! Deprecated attributes: use the `-lt` (aka less-than) notations

      .directive('layoutLtMd'          , warnAttrNotSupported('layout-lt-md',true)   )
      .directive('layoutLtLg'          , warnAttrNotSupported('layout-lt-lg',true)   )
      .directive('flexLtMd'            , warnAttrNotSupported('flex-lt-md'  ,true)   )
      .directive('flexLtLg'            , warnAttrNotSupported('flex-lt-lg'  ,true)   )

      .directive('layoutAlignLtMd'     , warnAttrNotSupported('layout-align-lt-md')  )
      .directive('layoutAlignLtLg'     , warnAttrNotSupported('layout-align-lt-lg')  )
      .directive('flexOrderLtMd'       , warnAttrNotSupported('flex-order-lt-md')    )
      .directive('flexOrderLtLg'       , warnAttrNotSupported('flex-order-lt-lg')    )
      .directive('offsetLtMd'          , warnAttrNotSupported('offset-lt-md')        )
      .directive('offsetLtLg'          , warnAttrNotSupported('offset-lt-lg')        )

      .directive('hideLtMd'            , warnAttrNotSupported ('hide-lt-md')         )
      .directive('hideLtLg'            , warnAttrNotSupported ('hide-lt-lg')         )
      .directive('showLtMd'            , warnAttrNotSupported ('show-lt-md')         )
      .directive('showLtLg'            , warnAttrNotSupported ('show-lt-lg')         );

    /**
     * These functions create registration functions for ngMaterial Layout attribute directives
     * This provides easy translation to switch ngMaterial attribute selectors to
     * CLASS selectors and directives; which has huge performance implications
     * for IE Browsers
     */

    /**
     * Creates a directive registration function where a possbile dynamic attribute value will
     * be observed/watched.
     * @param {string} className attribute name; eg `md-layout-gt-md` with value ="row"
     * @param {boolean=} addDirectiveAsClass
     */
    function attributeWithObserve(className, addDirectiveAsClass) {

      return ['$$mdLayout', '$document', '$parse', '$interpolate', function(_$$mdLayout_, $document, _$parse_, _$interpolate_) {
        $$mdLayout = _$$mdLayout_;
        $parse = _$parse_;
        $interpolate = _$interpolate_;

        return {
            restrict : 'A',
            compile: function(element, attr) {
              if ( postLinkIsDisabled($document[0]) ) return angular.noop;

              attributeValueToClass(null, element, attr);

              // Use for postLink to account for transforms after ng-transclude.
              return attributeValueToClass;
            }
        };
      }];


      /**
       * Add as transformed class selector(s), then
       * remove the deprecated attribute selector
       */
      function attributeValueToClass(scope, element, attrs) {
        var updateClassFn = updateClassWithValue(element,className, attrs);
        var normalizedAttr = attrs.$normalize(className);
        var attrValue = attrs[normalizedAttr] ? attrs[normalizedAttr].replace(/\s+/g, "-") : null;
        var addImmediate = attrValue ? !needsInterpolation(attrValue) : false;
        var watchValue   = needsInterpolation(attrValue);

        // Add transformed class selector(s)
        if (addDirectiveAsClass) element.addClass(className);

        if ( addImmediate ) element.addClass(className + "-" + attrValue);
        if ( watchValue ) attrs.$observe( normalizedAttr, updateClassFn );
        if ( $$mdLayout.removeAttributes ) element.removeAttr(className);
      }

    }

    /**
     * See if the original value has interpolation symbols:
     * e.g.  flex-gt-md="{{triggerPoint}}"
     */
    function needsInterpolation(value) {
      return (value ||"").indexOf($interpolate.startSymbol()) > -1;
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
    function updateClassWithValue(element, className, attr) {
      var lastClass;

      return function updateClassWithValue(newValue) {
        var value = String(newValue || "").replace(/\s+/g, "-");

        element.removeClass(lastClass);
        lastClass = !value ? className : className + "-" + value;
        element.addClass(lastClass);

        // Conditionally remove the attribute selector in case the browser attempts to
        // read it and suffers a performance downgrade (IE).

        if ( $$mdLayout.removeAttributes ) element.removeAttr(className);
      };
    }

    /**
     * Creates a registration function with for ngMaterial Layout attribute directive.
     * This is a `simple` transpose of attribute usage to class usage
     */
    function attributeWithoutValue(className) {
      return ['$$mdLayout', '$document', function(_$$mdLayout_, $document) {
        $$mdLayout = _$$mdLayout_;
        return {
          restrict : 'A',
          compile: function(element, attrs) {
            if ( postLinkIsDisabled($document[0]) ) return angular.noop;

            attributeToClass(null, element);

            // Use for postLink to account for transforms after ng-transclude.
            return attributeToClass;
          }
        };
      }];

      /**
       * Add as transformed class selector, then
       * remove the deprecated attribute selector
       */
      function attributeToClass(scope, element) {
        element.addClass(className);

        if ( $$mdLayout.removeAttributes ) {
          // After link-phase, remove deprecated layout attribute selector
          element.removeAttr(className);
        }
      }
    }

    /**
     * Provide console warning that this layout attribute has been deprecated
     */
    function warnAttrNotSupported(className) {
      var parts = className.split("-");

      return ["$log", function($log) {
        $log.warn( className + "has been deprecated. Please use a `" + parts[0] + "-gt-<xxx>` variant.");
        return angular.noop;
      }];

    }

    /**
     * Scan the body element. If it has a class 'md-css-only', then do NOT
     * postLink process the directives for Attribute selectors.
     * (recall that postlink injects Class selectors based on attribute selector settings)
     *
     * Instead the Layout CSS for Attributes is used:
     * e.g
     *       .md-css-only [layout=row] {
     *          flex-direction: row;
     *          -webkit-flex-direction: row;
     *       }
     *
     * Note: this means that 'md-css-only' will not work for IE (due to performance issues)
     * In these cases, the Layout translators (directives) should be enabled and the
     * `angular-material.[min.]js` must be loaded.
     */
    function postLinkIsDisabled(document) {
      var disablePostLinks = $$mdLayout.disablePostLinks;

      // Perform a read-once (1x) check for the `md-css-only` class on the BODY

      if ( angular.isUndefined(disablePostLinks) ) {
        var body = document.body;
        if (body) disablePostLinks = body.classList.contains('md-css-only');
      }

      return $$mdLayout.disablePostLinks = disablePostLinks;
    }

})();
