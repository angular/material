angular
  .module('material.components.icon')
  .directive('mdIcon', ['$mdIcon', '$mdTheming', '$mdAria', '$sce', mdIconDirective]);

/**
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `md-icon` directive makes it easier to use vector-based icons in your app (as opposed to
 * raster-based icons types like PNG). The directive supports both icon fonts and SVG icons.
 *
 * Icons should be considered view-only elements that should not be used directly as buttons; instead nest a `<md-icon>`
 * inside a `md-button` to add hover and click features.
 *
 * ### Icon fonts
 * Icon fonts are a technique in which you use a font where the glyphs in the font are
 * your icons instead of text. Benefits include a straightforward way to bundle everything into a
 * single HTTP request, simple scaling, easy color changing, and more.
 *
 * `md-icon` lets you consume an icon font by letting you reference specific icons in that font
 * by name rather than character code.
 *
 * When using font-icons, developers must follow three (3) simple steps:
 *
 * <ol>
 * <li>Load the font library. e.g.<br/>
 *    `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`
 * </li>
 * <li>
 *   Use either (a) font-icon class names or (b) a fontset and a font ligature to render the font glyph by
 *   using its textual name _or_ numerical character reference. Note that `material-icons` is the default fontset when
 *   none is specified.
 * </li>
 * <li> Use any of the following templates: <br/>
 *   <ul>
 *     <li>`<md-icon md-font-icon="classname"></md-icon>`</li>
 *     <li>`<md-icon md-font-set="font library classname or alias">textual_name</md-icon>`</li>
 *     <li>`<md-icon> numerical_character_reference </md-icon>`</li>
 *     <li>`<md-icon ng_bind="'textual_name'"></md-icon>`</li>
 *     <li>`<md-icon ng-bind="scopeVariable"></md-icon>`</li>
 *   </ul>
 * </li>
 * </ol>
 *
 * Full details for these steps can be found in the
 * <a href="http://google.github.io/material-design-icons/#icon-font-for-the-web" target="_blank">
 * Material Design Icon font for the web docs</a>.
 *
 * You can browse and search the Material Design icon style <code>.material-icons</code>
 * in the <a href="https://material.io/tools/icons/" target="_blank">Material Design Icons tool</a>.
 *
 * ### SVG
 * For SVGs, the problem with using `<img>` or a CSS `background-image` is that you can't take
 * advantage of some SVG features, such as styling specific parts of the icon with CSS or SVG
 * animation.
 *
 * `md-icon` makes it easier to use SVG icons by *inlining* the SVG into an `<svg>` element in the
 * document. The most straightforward way of referencing an SVG icon is via URL, just like a
 * traditional `<img>`. `$mdIconProvider`, as a convenience, lets you _name_ an icon so you can
 * reference it by name instead of URL throughout your templates.
 *
 * Additionally, you may not want to make separate HTTP requests for every icon, so you can bundle
 * your SVG icons together and pre-load them with `$mdIconProvider` as an icon set. An icon set can
 * also be given a name, which acts as a namespace for individual icons, so you can reference them
 * like `"social:cake"`.
 *
 * When using SVGs, both external SVGs (via URLs) or sets of SVGs (from icon sets) can be
 * easily loaded and used.
 *
 * ### Localization
 *
 * Because an `md-icon` element's text content is not intended to be translated, it is recommended
 * to declare the text content for an `md-icon` element in its start tag. Instead of using the HTML
 * text content, consider using `ng-bind` with a scope variable or literal string.
 *
 * Examples:
 *
 * <ul>
 *   <li>`<md-icon ng-bind="myIconVariable"></md-icon>`</li>
 *   <li>`<md-icon ng-bind="'menu'"></md-icon>`
 * </ul>
 *
 * <h2 id="material_design_icons">Material Design Icons tool</h2>
 * Using the Material Design Icons tool, developers can easily and quickly search for a specific
 * open source Material Design icon. The search is in the top left. Below search, you can select
 * from the new icon themes or filter by icon category.
 *
 * <a href="https://material.io/tools/icons/" target="_blank" style="border-bottom:none;">
 * <img src="https://user-images.githubusercontent.com/3506071/41942584-ef0695d0-796d-11e8-9436-44f25023a111.png"
 *      aria-label="Material Design Icons tool" style="max-width:95%">
 * </a>
 *
 * <div class="md-caption" style="text-align: center; margin-bottom: 24px">
 *  Click on the image above to open the
 *  <a href="https://material.io/tools/icons/" target="_blank">Material Design Icons tool</a>.
 * </div>
 *
 * Click on any icon, then click on the "Selected Icon" chevron to see the slide-up
 * information panel with details regarding a SVG download and information on the font-icon's
 * textual name. This panel also allows you to select a black on transparent or white on transparent
 * icon and to change the icon size. These settings only affect the downloaded icons.
 *
 * @param {string} md-font-icon String name of CSS icon associated with the font-face will be used
 *  to render the icon. Requires the fonts and the named CSS styles to be preloaded.
 * @param {string} md-font-set CSS style name associated with the font library; which will be assigned as
 *  the class for the font-icon ligature. This value may also be an alias that is used to lookup the classname;
 *  internally use `$mdIconProvider.fontSet(<alias>)` to determine the style name.
 * @param {string} md-svg-src String URL (or expression) used to load, cache, and display an
 *  external SVG.
 * @param {string} md-svg-icon md-svg-icon String name used for lookup of the icon from the internal cache;
 *  interpolated strings or expressions may also be used. Specific set names can be used with
 *  the syntax `<set name>:<icon name>`.<br/><br/>
 *  To use icon sets, developers are required to pre-register the sets using the `$mdIconProvider` service.
 * @param {string=} aria-label Labels the icon for accessibility. If an empty string is provided,
 *  the icon will be hidden from the accessibility layer with `aria-hidden="true"`. If there is no
 *  `aria-label` attribute on the icon, we check the following, in order: the `alt` attribute, the
 *  `aria-label` from the parent element, the icon's `md-font-icon` or `md-svg-icon` string, and the
 *  text content inside `<md-icon></md-icon>`. If none of these have any text, the icon is hidden
 *  from the accessibility layer with `aria-hidden="true"`.
 * @param {string=} alt Labels the icon for accessibility. If an empty string is provided and the
 *  icon has no `aria-label`, then the icon will be hidden from accessibility layer with
 *  `aria-hidden="true"`.
 *
 * @usage
 * When using SVGs:
 * <hljs lang="html">
 *
 *<!-- Icon ID; may contain optional icon set prefix.
 *     Icons must be registered using $mdIconProvider. -->
 *<md-icon md-svg-icon="social:android"    aria-label="android " ></md-icon>
 *
 *<!-- Icon urls; may be preloaded in templateCache -->
 *<md-icon md-svg-src="/android.svg"       aria-label="android " ></md-icon>
 *<md-icon md-svg-src="{{ getAndroid() }}" aria-label="android " ></md-icon>
 *
 * </hljs>
 *
 * Use the <code>$mdIconProvider</code> to configure your application with
 * SVG icon sets.
 *
 * <hljs lang="js">
 * angular.module('appSvgIconSets', ['ngMaterial'])
 *   .controller('DemoCtrl', function($scope) {})
 *   .config(function($mdIconProvider) {
 *     $mdIconProvider
 *       .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
 *       .defaultIconSet('img/icons/sets/core-icons.svg', 24);
 *    });
 * </hljs>
 *
 *
 * When using Font Icons with classnames:
 * <hljs lang="html">
 *
 * <md-icon md-font-icon="android" aria-label="android" ></md-icon>
 * <md-icon class="icon_home" aria-label="Home"></md-icon>
 *
 * </hljs>
 *
 * When using Material Font Icons with ligatures:
 * <hljs lang="html">
 *  <!--
 *  For Material Design Icons
 *  The class '.material-icons' is auto-added if a style has NOT been specified
 *  since `material-icons` is the default fontset. So your markup:
 *  -->
 *  <md-icon> face </md-icon>
 *  <!-- becomes this at runtime: -->
 *  <md-icon md-font-set="material-icons"> face </md-icon>
 *  <!-- If the fontset does not support ligature names, then we need to use the ligature unicode.-->
 *  <md-icon> &#xE87C; </md-icon>
 *  <!-- The class '.material-icons' must be manually added if other styles are also specified-->
 *  <md-icon class="material-icons md-light md-48"> face </md-icon>
 * </hljs>
 *
 * When using other Font-Icon libraries:
 *
 * <hljs lang="js">
 *  // Specify a font-icon style alias
 *  angular.config(function($mdIconProvider) {
 *    $mdIconProvider.fontSet('md', 'material-icons');
 *  });
 * </hljs>
 *
 * <hljs lang="html">
 *  <md-icon md-font-set="md">favorite</md-icon>
 * </hljs>
 *
 */
function mdIconDirective($mdIcon, $mdTheming, $mdAria, $sce) {

  return {
    restrict: 'E',
    link : postLink
  };


  /**
   * Directive postLink
   * Supports embedded SVGs, font-icons, & external SVGs.
   * @param {IScope} scope
   * @param {JQLite} element
   * @param {IAttributes} attr
   */
  function postLink(scope, element, attr) {
    $mdTheming(element);
    var lastFontIcon = attr.mdFontIcon;
    var lastFontSet = $mdIcon.fontSet(attr.mdFontSet);

    prepareForFontIcon();

    attr.$observe('mdFontIcon', fontIconChanged);
    attr.$observe('mdFontSet', fontIconChanged);

    /* Provide a default accessibility role of img */
    if (!attr.role) {
      $mdAria.expect(element, 'role', 'img');
      /* manually update attr variable */
      attr.role = 'img';
    }

    // If the aria-label is explicitly set to the empty string, then hide this element from the
    // accessibility layer.
    if (element[0].hasAttribute('aria-label') && attr.ariaLabel === '') {
      element.attr('aria-hidden', true);
    }

    /* Don't process ARIA if already valid */
    if (attr.role === "img" && !attr.ariaHidden && !$mdAria.hasAriaLabel(element)) {
      // If the developer signals to hide this icon from the accessibility layer, do so.
      if (element[0].hasAttribute('alt') && attr.alt === '') {
        element.attr('aria-hidden', true);
      } else if (attr.alt) {
        /* Use the alt text for the aria-label by default, if available. */
        $mdAria.expect(element, 'aria-label', attr.alt);
      } else if ($mdAria.parentHasAriaLabel(element, 2)) {
        /* Parent has ARIA so we will assume it will describe the icon. */
        $mdAria.expect(element, 'aria-hidden', 'true');
      } else if (attr.mdFontIcon || attr.mdSvgIcon || element.text()) {
        /* Use icon name or node's text content as the aria-label */
        $mdAria.expect(element, 'aria-label', attr.mdFontIcon || attr.mdSvgIcon || element.text());
      } else {
        /* No label found, hide this icon from the accessibility layer */
        $mdAria.expect(element, 'aria-hidden', 'true');
      }
    }

    var attrName = attr.$normalize(attr.$attr.mdSvgIcon || attr.$attr.mdSvgSrc || '');
    if (attrName) {
      // Use either pre-configured SVG or URL source, respectively.
      attr.$observe(attrName, function(attrVal) {
        element.empty();
        if (attrVal) {
          $mdIcon(attrVal)
            .then(function(svg) {
            element.empty();
            element.append(svg);
          });
        }
      });
    }

    function prepareForFontIcon() {
      if (!attr.mdSvgIcon && !attr.mdSvgSrc) {
        if (attr.mdFontIcon) {
          element.addClass('md-font ' + attr.mdFontIcon);
        }

        element.addClass(lastFontSet);
      }
    }

    function fontIconChanged() {
      if (!attr.mdSvgIcon && !attr.mdSvgSrc) {
        if (attr.mdFontIcon) {
          element.removeClass(lastFontIcon);
          element.addClass(attr.mdFontIcon);

          lastFontIcon = attr.mdFontIcon;
        }

        var fontSet = $mdIcon.fontSet(attr.mdFontSet);

        if (lastFontSet !== fontSet) {
          element.removeClass(lastFontSet);
          element.addClass(fontSet);

          lastFontSet = fontSet;
        }
      }
    }
  }
}
