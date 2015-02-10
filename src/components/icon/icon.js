(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [
    'material.core'
  ])
  .directive('mdIcon', mdIconDirective)
  .provider('$mdIcon', MdIconProvider);

/**
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<md-icon>` directive is an element useful for showing an icon based on a font-face
 * or a SVG. Both external SVGs (via URLs) or cached SVG from icon sets (using $mdIcon service) can be
 * easily used.
 *
 * @param {string} md-svg-src String URL [or expression ] used to load, cache, and display an external SVG.
 * @param {string} md-svg-icon String name [or expression ] used for lookup of the icon from the internal cache; can be an expression.
 * inside the cached icon sets. Specific set names can be used with the syntax `<set name>:<icon name>`.
 * Requires the iconset to be pre-registered using `$mdIconProvider`
 * @param {string} md-font-icon String name of CSS icon associated with the font-face will be used
 * to render the icon. Requires the fonts and the named CSS styles to be preloaded.
 *
 * @usage
 * <hljs lang="html">
 *  <md-icon md-font-icon="android" alt="android icon"></md-icon>
 *  <md-icon md-svg-icon="action:android" alt="android icon"></md-icon>
 *  <md-icon md-svg-src="/android.svg" alt="android icon"></md-icon>
 * </hljs>
 */
function mdIconDirective($mdIcon, $mdAria, $log) {
  return {
    scope: {
      fontIcon: '@mdFontIcon',
      svgIcon: '@mdSvgIcon',
      svgSrc: '@mdSvgSrc'
    },
    restrict: 'E',
    template: getTemplate,
    link: postLink
  };

  function getTemplate(element, attr) {
    return attr.mdFontIcon ? '<span class="md-font" ng-class="fontIcon"></span>' : '';
  }

  /**
   * Directive postLink
   * Supports embedded SVGs, font-icons, & external SVGs
   */
  function postLink(scope, element, attr) {
    var ariaLabel = attr.alt || scope.fontIcon || scope.svgIcon;
    var attrName = attr.$normalize(attr.$attr.mdSvgIcon || attr.$attr.mdSvgSrc || '');
    if (attr.alt == '') {
      // Hide from the accessibility layer.
      $mdAria.expect(element, 'aria-hidden', 'true');
    } else {
      $mdAria.expect(element, 'aria-label', ariaLabel);
      $mdAria.expect(element, 'role', 'img');
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
  }
}

  /**
   * @ngdoc service
   * @name $mdIconProvider
   * @module material.components.icon
   *
   * @description
   * `$mdIconProvider` allows icons and icon sets to be pre-registered and associated with source URLs.
   * The requested svg is loaded [by URL] on-demand and cached for future queries.
   *
   * <hljs lang="js">
   * angular
   *   .module('app', ['ngMaterial'])
   *   .config(function($mdIconProvider) {
   *
   *     // Configure URLs for icons specified by [set:]id.
   *
   *     $mdIconProvider
   *          .defaultIconSet('my/app/icons.svg')       // Register a default set of icons
   *          .iconSet('social', 'my/app/social.svg')   // Register a named icon set
   *          .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
   *          .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
   *   });
   * </hljs>
   */

  /**
   * @ngdoc method
   * @name $mdIconProvider#icon
   *
   * @description
   * Register a source URL for a specific icon name; name may include optional 'icon set' name prefix.
   * These icons can be retrieved from the cache using `$mdIcon( <icon name> )`
   *
   * <hljs lang="js">
   * angular
   *   .module('app', ['ngMaterial'])
   *   .config(function($mdIconProvider) {
   *
   *     // Configure URLs for icons specified by [set:]id.
   *
   *     $mdIconProvider
   *          .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
   *          .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
   *   });
   * </hljs>
   *
   * @returns {obj} an `$mdIconProvider` reference with the chainable configuration API:
   *
   */
  /**
   * @ngdoc method
   * @name $mdIconProvider#iconSet
   *
   * @description
   * Register a source URL for a 'named' set of icons. Individual icons
   * can be retrieved from this cached set using `$mdIcon( <icon set name>:<icon name> )`
   *
   * <hljs lang="js">
   * angular
   *   .module('app', ['ngMaterial'])
   *   .config(function($mdIconProvider) {
   *
   *     // Configure URLs for icons specified by [set:]id.
   *
   *     $mdIconProvider
   *          .iconSet('social', 'my/app/social.svg')   // Register a named icon set
   *   });
   * </hljs>
   *
   * @returns {obj} an `$mdIconProvider` reference with the chainable configuration API:
   *
   */
  /**
   * @ngdoc method
   * @name $mdIconProvider#defaultIconSet
   *
   * @description
   * Register a source URL for the default 'named' set of icons. Unless explicitly registered
   * subsequent lookups of icons will fall back to search this 'default' icon set.
   * Icon can be retrieved from this cached, default set using `$mdIcon( <icon name> )`
   *
   * <hljs lang="js">
   * angular
   *   .module('app', ['ngMaterial'])
   *   .config(function($mdIconProvider) {
   *
   *     // Configure URLs for icons specified by [set:]id.
   *
   *     $mdIconProvider
   *          .defaultIconSet('social', 'my/app/social.svg')   // Register a default icon set
   *   });
   * </hljs>
   *
   * @returns {obj} an `$mdIconProvider` reference with the chainable configuration API:
   *
   */
  /**
   * @ngdoc method
   * @name $mdIconProvider#defaultIconSize
   *
   * @description
   * While mdIcon markup can also be style with sizing CSS, this method configures
   * the default icon size used for all icons; unless overridden by specific CSS.
   * NOTE: the default sizing is (24px, 24px).
   *
   * <hljs lang="js">
   * angular
   *   .module('app', ['ngMaterial'])
   *   .config(function($mdIconProvider) {
   *
   *     // Configure URLs for icons specified by [set:]id.
   *
   *     $mdIconProvider
   *          .defaultIconSize(36)   // Register a default icon size (width == height)
   *   });
   * </hljs>
   *
   * @returns {obj} an `$mdIconProvider` reference with the chainable configuration API:
   *
   */

var config = {
  defaultIconSize: 24
};

function MdIconProvider() { }

MdIconProvider.prototype = {
  icon : function icon(id, url, iconSize) {
    if ( id.indexOf(':') == -1 ) id = '$default:' + id;

    config[id] = new ConfigurationItem(url, iconSize );
    return this;
  },

  iconSet : function iconSet(id, url, iconSize) {
    config[id] = new ConfigurationItem(url, iconSize );
    return this;
  },

  defaultIconSet : function defaultIconSet(url, iconSize) {
    var setName = '$default';

    if ( !config[setName] ) {
      config[setName] = new ConfigurationItem(url, iconSize );
    }
    return this;
  },

  defaultIconSize : function defaultIconSize(iconSize) {
    config.defaultIconSize = iconSize;
    return this;
  },

  $get : ['$http', '$q', '$log', '$templateCache', function($http, $q, $log, $templateCache) {
    return new MdIconService(config, $http, $q, $log, $templateCache);
  }]
};

  /**
   *  Configuration item stored in the Icon registry; used for lookups
   *  to load if not already cached in the `loaded` cache
   */
  function ConfigurationItem(url, iconSize) {
    this.url = url;
    this.iconSize = iconSize || config.defaultIconSize;
  }

/**
 * @ngdoc service
 * @name $mdIcon
 * @module material.components.icon
 *
 * @description
 * `$mdIcon` is a service used to lookup SVG icons configured via $mdIconProvider using
 *  and ID or uses a URL used to load and cache a currently external SVG (that is not currently cached).
 *
 * @param {string} ID or URL value
 *
 * @returns {obj} DOM element clone
 *
 * @usage
 *
 * <hljs lang="js">
 * function SomeDirective($mdIcon) {
 *
 *   // See if the icon has already been loaded, if not
 *   // then lookup the icon from the registry cache, load and cache
 *   // it for future requests.
 *
 *   $mdIcon('android').then(function(android) {
 *     element.append(android);
 *   });
 *
 *   $mdIcon('work:chair').then(function(chair) {
 *     element.append(chair);
 *   });
 *
 *   // Load and cache the external SVG using a URL
 *
 *   $mdIcon('img/icons/android.svg').then(function(chair) {
 *     element.append(chair);
 *   });
 * };
 * </hljs>
 */
function MdIconService(config, $http, $q, $log, $templateCache) {
  var iconCache = {};
  var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i;

  return function getIcon(id) {
    id = id || '';

    // If already loaded and cached, use a clone of the cached icon.
    // Otherwise either load by URL, or lookup in the registry and then load by URL, and cache.

    if ( iconCache[id]         ) return $q.when( iconCache[id].clone() );
    if ( urlRegex.test(id)     ) return loadByURL(id).then( cacheIcon(id) );
    if ( id.indexOf(':') == -1 ) id = '$default:' + id;

    return loadByID(id)
        .catch(loadFromIconSet)
        .catch(announceNotFound)
        .then( cacheIcon(id) );
  };

  /**
   * Prepare and cache the loaded icon for the specified `id`
   */
  function cacheIcon( id ) {

    return function updateCache( icon ) {
      var iconConfig = config[id];

      icon = !isIcon(icon) ? new Icon(icon, iconConfig) : icon;
      icon = prepareAndStyle(icon);

      iconCache[id] = icon;

      return icon.clone();
    };
  }

  /**
   * Lookup the configuration in the registry, if !registered throw an error
   * otherwise load the icon [on-demand] using the registered URL.
   *
   */
  function loadByID(id) {
    var iconConfig = config[id];

    return !iconConfig ? $q.reject(id) : loadByURL(iconConfig.url).then(function(icon) {
      return new Icon(icon, iconConfig);
    });
  }

  /**
   *
   */
  function loadFromIconSet(id) {
    var setName = id.substring(0, id.lastIndexOf(':')) || '$default';
    var iconSetConfig = config[setName];

    return !iconSetConfig ? $q.reject(id) : loadByURL(iconSetConfig.url).then(extractFromSet);

    function extractFromSet(set) {
      var iconName = id.slice(id.lastIndexOf(':') + 1);
      var icon = set.querySelector('#' + iconName);
      return !icon ? $q.reject(id) : new Icon(icon, iconSetConfig);
    }
  }

  /**
   *  Prepare the DOM element that will be cached in the
   *  loaded iconCache store.
   */
  function prepareAndStyle(icon) {
    var iconSize = icon.config ? icon.config.iconSize : config.defaultIconSize;
    var svg = angular.element(icon.element);

    return svg.attr({
      'fit'   : '',
      'height': '100%',
      'width' : '100%',
      'preserveAspectRatio': 'xMidYMid meet',
      'viewBox' : svg.attr('viewBox') || ('0 0 ' + iconSize + ' ' + iconSize)
    })
    .css( {
      'pointer-events' : 'none',
      'display' : 'block'
    });
  }

  /**
   * Load the icon by URL (may use the $templateCache).
   * Extract the data for later conversion to Icon
   */
  function loadByURL(url) {
    return $http
      .get(url, { cache: $templateCache })
      .then(function(response) {
        var els = angular.element(response.data);
        // Iterate to find first svg node, allowing for comments in loaded SVG (common with auto-generated SVGs)
        for (var i = 0; i < els.length; ++i) {
          if (els[i].nodeName == 'svg') {
            return els[i];
          }
        }
      });
  }

  /**
   * User did not specify a URL and the ID has not been registered with the $mdIcon
   * registry
   */
  function announceNotFound(id) {
    var msg = 'icon ' + id + ' not found';
    $log.warn(msg);
    throw new Error(msg);
  }


  /**
   * Check target signature to see if it is an Icon instance.
   */
  function isIcon(target) {
    return angular.isDefined(target.element) && angular.isDefined(target.config);
  }


  /**
   *
   */
  function Icon(el, config) {
    if (el.tagName != 'svg') {
      el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el)[0];
    }

    this.element = el;
    this.config = config;
  }

  /**
    * Clone the Icon DOM element; which is stored as an angular.element()
    */
  Icon.prototype.clone = function (){
   return this.element.cloneNode(true)[0];
  };
}


})();
