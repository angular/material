(function () {
  'use strict';

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
    angular.module('material.layout', [ 'ng' ])

      // Attribute directives with optional value(s)

      .directive('layout'              , attributeWithObserve('layout' , true)       )
      .directive('layoutSm'            , attributeWithObserve('layout-sm'   , true)  )
      .directive('layoutGtSm'          , attributeWithObserve('layout-gt-sm', true)  )
      .directive('layoutLtMd'          , warnAttrNotSupported('layout-lt-md',true)   )
      .directive('layoutMd'            , attributeWithObserve('layout-md'   , true)  )
      .directive('layoutGtMd'          , attributeWithObserve('layout-gt-md', true)  )
      .directive('layoutLtLg'          , warnAttrNotSupported('layout-lt-lg',true)   )
      .directive('layoutLg'            , attributeWithObserve('layout-lg'   , true)  )
      .directive('layoutGtLg'          , attributeWithObserve('layout-gt-lg', true)  )

      .directive('flex'                , attributeWithObserve('flex'        , true)  )
      .directive('flexSm'              , attributeWithObserve('flex-sm'     , true)  )
      .directive('flexGtSm'            , attributeWithObserve('flex-gt-sm'  , true)  )
      .directive('flexLtMd'            , warnAttrNotSupported('flex-lt-md'  ,true)   )
      .directive('flexMd'              , attributeWithObserve('flex-md'     , true)  )
      .directive('flexGtMd'            , attributeWithObserve('flex-gt-md'  , true)  )
      .directive('flexLtLg'            , warnAttrNotSupported('flex-lt-lg'  ,true)   )
      .directive('flexLg'              , attributeWithObserve('flex-lg'     , true)  )
      .directive('flexGtLg'            , attributeWithObserve('flex-gt-lg'  , true)  )

      // Attribute directives with optional value(s) but directiveName is NOT added as a class

      .directive('layoutAlign'         , attributeWithObserve('layout-align')        )
      .directive('layoutAlignSm'       , attributeWithObserve('layout-align-sm')     )
      .directive('layoutAlignGtSm'     , attributeWithObserve('layout-align-gt-sm')  )
      .directive('layoutAlignLtMd'     , warnAttrNotSupported('layout-align-lt-md')  )
      .directive('layoutAlignMd'       , attributeWithObserve('layout-align-md')     )
      .directive('layoutAlignGtMd'     , attributeWithObserve('layout-align-gt-md')  )
      .directive('layoutAlignLtLg'     , warnAttrNotSupported('layout-align-lt-lg')  )
      .directive('layoutAlignLg'       , attributeWithObserve('layout-align-lg')     )
      .directive('layoutAlignGtLg'     , attributeWithObserve('layout-align-gt-lg')  )

      .directive('flexOrder'           , attributeWithObserve('flex-order')          )
      .directive('flexOrderSm'         , attributeWithObserve('flex-order-sm')       )
      .directive('flexOrderGtSm'       , attributeWithObserve('flex-order-gt-sm')    )
      .directive('flexOrderLtMd'       , warnAttrNotSupported('flex-order-lt-md')    )
      .directive('flexOrderMd'         , attributeWithObserve('flex-order-md')       )
      .directive('flexOrderGtMd'       , attributeWithObserve('flex-order-gt-md')    )
      .directive('flexOrderLtLg'       , warnAttrNotSupported('flex-order-lt-lg')    )
      .directive('flexOrderLg'         , attributeWithObserve('flex-order-lg')       )
      .directive('flexOrderGtLg'       , attributeWithObserve('flex-order-gt-lg')    )

      .directive('offset'              , attributeWithObserve('offset')              )
      .directive('offsetSm'            , attributeWithObserve('offset-sm')           )
      .directive('offsetGtSm'          , attributeWithObserve('offset-gt-sm')        )
      .directive('offsetLtMd'          , warnAttrNotSupported('offset-lt-md')        )
      .directive('offsetMd'            , attributeWithObserve('offset-md')           )
      .directive('offsetGtMd'          , attributeWithObserve('offset-gt-md')        )
      .directive('offsetLtLg'          , warnAttrNotSupported('offset-lt-lg')        )
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
      .directive('hideLtMd'            , warnAttrNotSupported ('hide-lt-md')         )
      .directive('hideMd'              , attributeWithoutValue('hide-md')            )
      .directive('hideGtMd'            , attributeWithoutValue('hide-gt-md')         )
      .directive('hideLtLg'            , warnAttrNotSupported ('hide-lt-lg')         )
      .directive('hideLg'              , attributeWithoutValue('hide-lg')            )
      .directive('hideGtLg'            , attributeWithoutValue('hide-gt-lg')         )
      .directive('show'                , attributeWithoutValue('show')               )
      .directive('showSm'              , attributeWithoutValue('show-sm')            )
      .directive('showGtSm'            , attributeWithoutValue('show-gt-sm')         )
      .directive('showLtMd'            , warnAttrNotSupported ('show-lt-md')         )
      .directive('showMd'              , attributeWithoutValue('show-md')            )
      .directive('showGtMd'            , attributeWithoutValue('show-gt-md')         )
      .directive('showLtLg'            , warnAttrNotSupported ('show-lt-lg')         )
      .directive('showLg'              , attributeWithoutValue('show-lg')            )
      .directive('showGtLg'            , attributeWithoutValue('show-gt-lg')         );

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
      return function() {
        return {
            compile: function(element, attr) {
              attributeValueToClass(null, element, attr);

              // Use for postLink to account for transforms after ng-transclude.
              return attributeValueToClass;
            }
        };
      };

      /**
       * Add as transformed class selector(s), then
       * remove the deprecated attribute selector
       */
      function attributeValueToClass(scope, element, attr) {
        var directive = attr.$normalize(className);

        // Add transformed class selector(s)
        if (addDirectiveAsClass) {
          element.addClass(className);
        }

        if (attr[directive]) {
          element.addClass(className + "-" + attr[directive].replace(/\s+/g, "-"));
        }

        if ( scope ) {
          /**
           * After link-phase, do NOT remove deprecated layout attribute selector.
           * Instead watch the attribute so interpolated data-bindings to layout
           * selectors will continue to be supported.
           *
           * $observe the className and update with new class (after removing the last one)
           *
           * e.g. `layout="{{layoutDemo.direction}}"` will update...
           */
          var lastClass;

          attr.$observe(function() {

            return attr[className];

          }, function(newVal) {

            element.removeClass(lastClass);

              lastClass = className + "-" + String(newVal).replace(/\s+/g, "-");

            element.addClass(lastClass);

          });

        }

      }
    }

    /**
     * Creates a registration function with for ngMaterial Layout attribute directive.
     * This is a `simple` transpose of attribute usage to class usage
     */
    function attributeWithoutValue(className) {
      return function() {
        return {
          compile: function(element, attr) {
            attributeToClass(null, element);

            // Use for postLink to account for transforms after ng-transclude.
            return attributeToClass;
          }
        };
      };

      /**
       * Add as transformed class selector, then
       * remove the deprecated attribute selector
       */
      function attributeToClass(scope, element) {
        element.addClass(className);

        if ( scope ) {
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

})();
