/**
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [
    'material.core'
  ])
  .directive('mdIcon', mdIconDirective);

/**
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<md-icon />` directive is an markup element useful for showing an icon based on a font-icon
 * or a SVG. Icons are view-only elements that should not be used directly as buttons; instead nest a `<md-icon />`
 * inside a `md-button` to add hover and click features.
 *
 * When using SVGs, both external SVGs (via URLs) or sets of SVGs [from icon sets] can be
 * easily loaded and used.When use font-icons, developers must following three (3) simple steps:
 *
 * <ol>
 * <li>Load the font library. e.g.<br/>
 *    &lt;link href="https://fonts.googleapis.com/icon?family=Material+Icons"
 *    rel="stylesheet"&gt;
 * </li>
 * <li> Use either (a) font-icon class names or (b) font ligatures to render the font glyph by using its textual name</li>
 * <li> Use &lt;md-icon md-font-icon="classname" /&gt; or <br/>
 *     use &lt;md-icon md-font-library="library_style_name"&gt; textual_name &lt;/md-icon&gt; or <br/>
 *     use &lt;md-icon md-font-library="library_style_name"&gt; numerical_character_reference &lt;/md-icon&gt;
 * </li>
 * </ol>
 *
 * Full details for these steps can be found:
 *
 * <ul>
 * <li>http://google.github.io/material-design-icons/</li>
 * <li>http://google.github.io/material-design-icons/#icon-font-for-the-web</li>
 * </ul>
 *
 * The Material Design icon style <code>.material-icons</code> and the icon font references are published in
 * Material Design Icons:
 *
 * <ul>
 * <li>http://www.google.com/design/icons/</li>
 * <li>https://www.google.com/design/icons/#ic_accessibility</li>
 * </ul>
 *
 * <h2 id="material_design_icons">Material Design Icons</h2>
 * Using the Material Design Icon-Selector, developers can easily and quickly search for a Material Design font-icon and
 * determine its textual name and character reference code. Click on any icon to see the slide-up information
 * panel with details regarding a SVG download or information on the font-icon usage.
 *
 * <a href="https://www.google.com/design/icons/#ic_accessibility" target="_blank" style="border-bottom:none;">
 * <img src="https://cloud.githubusercontent.com/assets/210413/7902490/fe8dd14c-0780-11e5-98fb-c821cc6475e6.png"
 *      alt="Material Design Icon-Selector" style="max-width:75%;padding-left:10%">
 * </a>
 *
 * <span class="image_caption">
 *  Click on the image above to link to the
 *  <a href="https://www.google.com/design/icons/#ic_accessibility" target="_blank">Material Design Icon-Selector</a>.
 * </span>
 *
 * @param {string} md-font-icon String name of CSS icon associated with the font-face will be used
 * to render the icon. Requires the fonts and the named CSS styles to be preloaded.
 * @param {string} md-font-library String name of CSS icon associated with the font-face will be used
 * to render the icon. Requires the fonts and the named CSS styles to be preloaded.
 * @param {string} md-svg-src String URL [or expression ] used to load, cache, and display an external SVG.
 * @param {string} md-svg-icon String name used for lookup of the icon from the internal cache; interpolated strings or
 * expressions may also be used. Specific set names can be used with the syntax `<set name>:<icon name>`.<br/><br/>
 * To use icon sets, developers are required to pre-register the sets using the `$mdIconProvider` service.
 * @param {string=} alt Labels icon for accessibility. If an empty string is provided, icon
 * will be hidden from accessibility layer with `aria-hidden="true"`. If there's no alt on the icon
 * nor a label on the parent element, a warning will be logged to the console.
 *
 * @usage
 * When using SVGs:
 * <hljs lang="html">
 *
 *  <!-- Icon ID; may contain optional icon set prefix; icons must registered using $mdIconProvider -->
 *  <md-icon md-svg-icon="social:android"    alt="android " ></md-icon>
 *
 *  <!-- Icon urls; may be preloaded in templateCache -->
 *  <md-icon md-svg-src="/android.svg"       alt="android " ></md-icon>
 *  <md-icon md-svg-src="{{ getAndroid() }}" alt="android " ></md-icon>
 *
 * </hljs>
 *
 * Use the <code>$mdIconProvider</code> to configure your application with
 * svg iconsets.
 *
 * <hljs lang="js">
 *  angular.module('appSvgIconSets', ['ngMaterial'])
 *    .controller('DemoCtrl', function($scope) {})
 *    .config(function($mdIconProvider) {
 *      $mdIconProvider
 *         .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
 *         .defaultIconSet('img/icons/sets/core-icons.svg', 24);
 *     });
 * </hljs>
 *
 *
 * When using Font Icons with classnames:
 * <hljs lang="html">
 *
 *  <md-icon md-font-icon="android" alt="android" ></md-icon>
 *  <md-icon md-font-icon="fa-magic" class="fa" alt="magic wand"></md-icon>
 *
 * </hljs>
 *
 * When using Font Icons with ligatures:
 * <hljs lang="html">
 *
 *  <md-icon md-font-library="material-icons">face</md-icon>
 *  <md-icon md-font-library="material-icons">#xE87C;</md-icon>
 *  <md-icon md-font-library="material-icons" class="md-light md-48">face</md-icon>
 *
 * </hljs>
 *
 *
 */
function mdIconDirective($mdIcon, $mdTheming, $mdAria, $interpolate ) {

  return {
    scope: {
      fontLib: '@mdFontLibrary',
      fontIcon: '@mdFontIcon',
      svgIcon: '@mdSvgIcon',
      svgSrc: '@mdSvgSrc'
    },
    restrict: 'E',
    transclude:true,
    template: getTemplate,
    link: postLink
  };

  function getTemplate(element, attr) {
    var hasAttrValue = function(key) { return attr[key] && attr[key].length      };
    var attrValue    = function(key) { return hasAttrValue(key) ? attr[key] : '' };

    // If using font-icons, transclude the ligature or NRCs
    var tmpl = hasAttrValue('mdFontIcon')    ? '<span class="md-font {{classNames}}" ng-class="fontIcon"></span>' :
               hasAttrValue('mdFontLibrary') ? '<span ng-transclude></span>' : '';

    // Transpose the mdFontLibrary name to the list of classnames
    // For example, Material Icons expects classnames like `.material-icons.md-48` instead of `.material-icons .md-48`

    var names = (attrValue('mdFontLibrary')  + ' ' +  attrValue('class')).trim();
    element.attr('class',names);

    return $interpolate( tmpl )({ classNames: names });
  }


  /**
   * Directive postLink
   * Supports embedded SVGs, font-icons, & external SVGs
   */
  function postLink(scope, element, attr) {
    $mdTheming(element);

    // If using a font-icon, then the textual name of the icon itself
    // provides the aria-label.

    var ariaLabel = attr.alt || scope.fontIcon || scope.svgIcon;
    var attrName = attr.$normalize(attr.$attr.mdSvgIcon || attr.$attr.mdSvgSrc || '');

    if ( !attr.mdFontLibrary ) {
      if (attr.alt != '' && !parentsHaveText() ) {
        $mdAria.expect(element, 'aria-label', ariaLabel);
        $mdAria.expect(element, 'role', 'img');
      } else {
        // Hide from the accessibility layer.
        $mdAria.expect(element, 'aria-hidden', 'true');
      }
    }

    if (attrName) {
      // Use either pre-configured SVG or URL source, respectively.
      attr.$observe(attrName, function(attrVal) {

        element.empty();
        if (attrVal) {
          $mdIcon(attrVal).then(function(svg) {
            element.append(svg);
          });
        }

      });
    }
    function parentsHaveText() {
      var parent = element.parent();
      if (parent.attr('aria-label') || parent.text()) {
        return true;
      }
      else if(parent.parent().attr('aria-label') || parent.parent().text()) {
        return true;
      }
      return false;
    }
  }
}
