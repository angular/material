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
    angular.module('material.layout', [ ])

      // Attribute directives with optional value(s)

      .directive('layout'              , attribute_withValue('layout'      , true)  )
      .directive('layoutSm'            , attribute_withValue('layout-sm'   , true)  )
      .directive('layoutGtSm'          , attribute_withValue('layout-gt-sm', true)  )
      .directive('layoutMd'            , attribute_withValue('layout-md'   , true)  )
      .directive('layoutGtMd'          , attribute_withValue('layout-gt-md', true)  )
      .directive('layoutLg'            , attribute_withValue('layout-lg'   , true)  )
      .directive('layoutGtLg'          , attribute_withValue('layout-gt-lg', true)  )

      .directive('flex'                , attribute_withValue('flex'        , true)  )
      .directive('flexSm'              , attribute_withValue('flex-sm'     , true)  )
      .directive('flexGtSm'            , attribute_withValue('flex-gt-sm'  , true)  )
      .directive('flexMd'              , attribute_withValue('flex-md'     , true)  )
      .directive('flexGtMd'            , attribute_withValue('flex-gt-md'  , true)  )
      .directive('flexLg'              , attribute_withValue('flex-lg'     , true)  )
      .directive('flexGtLg'            , attribute_withValue('flex-gt-lg'  , true)  )

      // Attribute directives with optional value(s) but directiveName is NOT added as a class

      .directive('layoutAlign'         , attribute_withValue('layout-align')        )
      .directive('layoutAlignSm'       , attribute_withValue('layout-align-sm')     )
      .directive('layoutAlignGtSm'     , attribute_withValue('layout-align-gt-sm')  )
      .directive('layoutAlignMd'       , attribute_withValue('layout-align-md')     )
      .directive('layoutAlignGtMd'     , attribute_withValue('layout-align-gt-md')  )
      .directive('layoutAlignLg'       , attribute_withValue('layout-align-lg')     )
      .directive('layoutAlignGtLg'     , attribute_withValue('layout-align-gt-lg')  )

      .directive('flexOrder'           , attribute_withValue('flex-order')          )
      .directive('flexOrderSm'         , attribute_withValue('flex-order-sm')       )
      .directive('flexOrderGtSm'       , attribute_withValue('flex-order-gt-sm')    )
      .directive('flexOrderMd'         , attribute_withValue('flex-order-md')       )
      .directive('flexOrderGtMd'       , attribute_withValue('flex-order-gt-md')    )
      .directive('flexOrderLg'         , attribute_withValue('flex-order-lg')       )
      .directive('flexOrderGtLg'       , attribute_withValue('flex-order-gt-lg')    )

      .directive('offset'              , attribute_withValue('offset')              )
      .directive('offsetSm'            , attribute_withValue('offset-sm')           )
      .directive('offsetGtSm'          , attribute_withValue('offset-gt-sm')        )
      .directive('offsetMd'            , attribute_withValue('offset-md')           )
      .directive('offsetGtMd'          , attribute_withValue('offset-gt-md')        )
      .directive('offsetLg'            , attribute_withValue('offset-lg')           )
      .directive('offsetGtLg'          , attribute_withValue('offset-gt-lg')        )

      // Attribute directives with no value(s )

      .directive('layoutMargin'        , attribute_noValue('layout-margin')         )
      .directive('layoutPadding'       , attribute_noValue('layout-padding')        )
      .directive('layoutWrap'          , attribute_noValue('layout-wrap')           )
      .directive('layoutFill'          , attribute_noValue('layout-fill')           )

      .directive('hide'                , attribute_noValue('hide')                  )
      .directive('hideSm'              , attribute_noValue('hide-sm')               )
      .directive('hideGtSm'            , attribute_noValue('hide-gt-sm')            )
      .directive('hideMd'              , attribute_noValue('hide-md')               )
      .directive('hideGtMd'            , attribute_noValue('hide-gt-md')            )
      .directive('hideLg'              , attribute_noValue('hide-lg')               )
      .directive('hideGtLg'            , attribute_noValue('hide-gt-lg')            )
      .directive('show'                , attribute_noValue('show')                  )
      .directive('showSm'              , attribute_noValue('show-sm')               )
      .directive('showGtSm'            , attribute_noValue('show-gt-sm')            )
      .directive('showMd'              , attribute_noValue('show-md')               )
      .directive('showGtMd'            , attribute_noValue('show-gt-md')            )
      .directive('showLg'              , attribute_noValue('show-lg')               )
      .directive('showGtLg'            , attribute_noValue('show-gt-lg')            );

    /**
     * Creates a registration function with for ngMaterial Layout attribute directive
     *
     * Note: This provides easy translation to switch ngMaterial
     * attribute selectors to CLASS selectors and directives.
     *
     * !! This is important for IE Browser performance
     *
     * @param classname String attribute name; eg `layout-gt-md` with value ="row"
     * @param addDirectiveAsClass Boolean
     */
    function attribute_withValue(className, addDirectiveAsClass) {
        return [function() {
            return {
                compile : function (element, attr) {
                  attributeValueToClass(null, element, attr);

                  // !! use for postLink to account for transforms after ng-transclude
                  return attributeValueToClass;
                }
            };
        }];

        /**
         * Add as transformed class selector(s), then
         * remove the deprecated attribute selector
         */
        function attributeValueToClass(scope, element, attr) {
          var directive = attr.$normalize(className);

          // Add transformed class selector(s)
          if (addDirectiveAsClass)  element.addClass(className);
          if (attr[directive])
              element.addClass(className + "-" + attr[directive].replace(/\s+/g, "-"));

          try {
            element.removeAttr(className);
          } catch(e) { }
        }
    }

    /**
     * Creates a registration function with for ngMaterial Layout attribute directive
     *
     * Simple transpose of attribute usage to class usage
     */
    function attribute_noValue(className) {
        return [function() {
            return {
              compile : function (element, attr) {
                  attributeToClass(null, element);

                  // !! use for postLink to account for transforms after ng-transclude
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
        try {
          element.removeAttr(className);
        } catch(e) { }
      }
    }

})();
