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

      .directive('layout'              , attributeWithValue('layout'      , true)  )
      .directive('layoutSm'            , attributeWithValue('layout-sm'   , true)  )
      .directive('layoutGtSm'          , attributeWithValue('layout-gt-sm', true)  )
      .directive('layoutMd'            , attributeWithValue('layout-md'   , true)  )
      .directive('layoutGtMd'          , attributeWithValue('layout-gt-md', true)  )
      .directive('layoutLg'            , attributeWithValue('layout-lg'   , true)  )
      .directive('layoutGtLg'          , attributeWithValue('layout-gt-lg', true)  )

      .directive('flex'                , attributeWithValue('flex'        , true)  )
      .directive('flexSm'              , attributeWithValue('flex-sm'     , true)  )
      .directive('flexGtSm'            , attributeWithValue('flex-gt-sm'  , true)  )
      .directive('flexMd'              , attributeWithValue('flex-md'     , true)  )
      .directive('flexGtMd'            , attributeWithValue('flex-gt-md'  , true)  )
      .directive('flexLg'              , attributeWithValue('flex-lg'     , true)  )
      .directive('flexGtLg'            , attributeWithValue('flex-gt-lg'  , true)  )

      // Attribute directives with optional value(s) but directiveName is NOT added as a class

      .directive('layoutAlign'         , attributeWithValue('layout-align')        )
      .directive('layoutAlignSm'       , attributeWithValue('layout-align-sm')     )
      .directive('layoutAlignGtSm'     , attributeWithValue('layout-align-gt-sm')  )
      .directive('layoutAlignMd'       , attributeWithValue('layout-align-md')     )
      .directive('layoutAlignGtMd'     , attributeWithValue('layout-align-gt-md')  )
      .directive('layoutAlignLg'       , attributeWithValue('layout-align-lg')     )
      .directive('layoutAlignGtLg'     , attributeWithValue('layout-align-gt-lg')  )

      .directive('flexOrder'           , attributeWithValue('flex-order')          )
      .directive('flexOrderSm'         , attributeWithValue('flex-order-sm')       )
      .directive('flexOrderGtSm'       , attributeWithValue('flex-order-gt-sm')    )
      .directive('flexOrderMd'         , attributeWithValue('flex-order-md')       )
      .directive('flexOrderGtMd'       , attributeWithValue('flex-order-gt-md')    )
      .directive('flexOrderLg'         , attributeWithValue('flex-order-lg')       )
      .directive('flexOrderGtLg'       , attributeWithValue('flex-order-gt-lg')    )

      .directive('offset'              , attributeWithValue('offset')              )
      .directive('offsetSm'            , attributeWithValue('offset-sm')           )
      .directive('offsetGtSm'          , attributeWithValue('offset-gt-sm')        )
      .directive('offsetMd'            , attributeWithValue('offset-md')           )
      .directive('offsetGtMd'          , attributeWithValue('offset-gt-md')        )
      .directive('offsetLg'            , attributeWithValue('offset-lg')           )
      .directive('offsetGtLg'          , attributeWithValue('offset-gt-lg')        )

      // Attribute directives with no value(s)

      .directive('layoutMargin'        , attributeWithoutValue('layout-margin')         )
      .directive('layoutPadding'       , attributeWithoutValue('layout-padding')        )
      .directive('layoutWrap'          , attributeWithoutValue('layout-wrap')           )
      .directive('layoutFill'          , attributeWithoutValue('layout-fill')           )

      .directive('hide'                , attributeWithoutValue('hide')                  )
      .directive('hideSm'              , attributeWithoutValue('hide-sm')               )
      .directive('hideGtSm'            , attributeWithoutValue('hide-gt-sm')            )
      .directive('hideMd'              , attributeWithoutValue('hide-md')               )
      .directive('hideGtMd'            , attributeWithoutValue('hide-gt-md')            )
      .directive('hideLg'              , attributeWithoutValue('hide-lg')               )
      .directive('hideGtLg'            , attributeWithoutValue('hide-gt-lg')            )
      .directive('show'                , attributeWithoutValue('show')                  )
      .directive('showSm'              , attributeWithoutValue('show-sm')               )
      .directive('showGtSm'            , attributeWithoutValue('show-gt-sm')            )
      .directive('showMd'              , attributeWithoutValue('show-md')               )
      .directive('showGtMd'            , attributeWithoutValue('show-gt-md')            )
      .directive('showLg'              , attributeWithoutValue('show-lg')               )
      .directive('showGtLg'            , attributeWithoutValue('show-gt-lg')            );

    /**
     * Creates a registration function with for ngMaterial Layout attribute directive
     *
     * Note: This provides easy translation to switch ngMaterial
     * attribute selectors to CLASS selectors and directives.
     *
     * *This is important for IE Browser performance*
     *
     * @param {string} className attribute name; eg `layout-gt-md` with value ="row"
     * @param {boolean=} addDirectiveAsClass
     */
    function attributeWithValue(className, addDirectiveAsClass) {
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

        element.removeAttr(className);
      }
    }

    /**
     * Creates a registration function with for ngMaterial Layout attribute directive
     *
     * Simple transpose of attribute usage to class usage
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
      element.removeAttr(className);
    }
  }
})();
