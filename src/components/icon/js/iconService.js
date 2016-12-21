  angular
    .module('material.components.icon')
    .constant('$$mdSvgRegistry', {
        'mdTabsArrow':   'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwb2x5Z29uIHBvaW50cz0iMTUuNCw3LjQgMTQsNiA4LDEyIDE0LDE4IDE1LjQsMTYuNiAxMC44LDEyICIvPjwvZz48L3N2Zz4=',
        'mdClose':       'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik0xOSA2LjQxbC0xLjQxLTEuNDEtNS41OSA1LjU5LTUuNTktNS41OS0xLjQxIDEuNDEgNS41OSA1LjU5LTUuNTkgNS41OSAxLjQxIDEuNDEgNS41OS01LjU5IDUuNTkgNS41OSAxLjQxLTEuNDEtNS41OS01LjU5eiIvPjwvZz48L3N2Zz4=',
        'mdCancel':      'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik0xMiAyYy01LjUzIDAtMTAgNC40Ny0xMCAxMHM0LjQ3IDEwIDEwIDEwIDEwLTQuNDcgMTAtMTAtNC40Ny0xMC0xMC0xMHptNSAxMy41OWwtMS40MSAxLjQxLTMuNTktMy41OS0zLjU5IDMuNTktMS40MS0xLjQxIDMuNTktMy41OS0zLjU5LTMuNTkgMS40MS0xLjQxIDMuNTkgMy41OSAzLjU5LTMuNTkgMS40MSAxLjQxLTMuNTkgMy41OSAzLjU5IDMuNTl6Ii8+PC9nPjwvc3ZnPg==',
        'mdMenu':        'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik0zLDZIMjFWOEgzVjZNMywxMUgyMVYxM0gzVjExTTMsMTZIMjFWMThIM1YxNloiIC8+PC9zdmc+',
        'mdToggleArrow': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDggNDgiPjxwYXRoIGQ9Ik0yNCAxNmwtMTIgMTIgMi44MyAyLjgzIDkuMTctOS4xNyA5LjE3IDkuMTcgMi44My0yLjgzeiIvPjxwYXRoIGQ9Ik0wIDBoNDh2NDhoLTQ4eiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==',
        'mdCalendar':    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgM2gtMVYxaC0ydjJIOFYxSDZ2Mkg1Yy0xLjExIDAtMS45OS45LTEuOTkgMkwzIDE5YzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bTAgMTZINVY4aDE0djExek03IDEwaDV2NUg3eiIvPjwvc3ZnPg==',
        'mdChecked':     'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik05IDE2LjE3TDQuODMgMTJsLTEuNDIgMS40MUw5IDE5IDIxIDdsLTEuNDEtMS40MXoiLz48L2c+PC9zdmc+'
    })
    .provider('$mdIcon', MdIconProvider);

/**
 * @ngdoc service
 * @name $mdIconProvider
 * @module material.components.icon
 *
 * @description
 * `$mdIconProvider` is used only to register icon IDs with URLs. These configuration features allow
 * icons and icon sets to be pre-registered and associated with source URLs **before** the `<md-icon />`
 * directives are compiled.
 *
 * If using font-icons, the developer is responsible for loading the fonts.
 *
 * If using SVGs, loading of the actual svg files are deferred to on-demand requests and are loaded
 * internally by the `$mdIcon` service using the `$templateRequest` service. When an SVG is
 * requested by name/ID, the `$mdIcon` service searches its registry for the associated source URL;
 * that URL is used to on-demand load and parse the SVG dynamically.
 *
 * The `$templateRequest` service expects the icons source to be loaded over trusted URLs.<br/>
 * This means, when loading icons from an external URL, you have to trust the URL in the `$sceDelegateProvider`.
 *
 * <hljs lang="js">
 *   app.config(function($sceDelegateProvider) {
 *     $sceDelegateProvider.resourceUrlWhitelist([
 *       // Adding 'self' to the whitelist, will allow requests from the current origin.
 *       'self',
 *       // Using double asterisks here, will allow all URLs to load.
 *       // We recommend to only specify the given domain you want to allow.
 *       '**'
 *     ]);
 *   });
 * </hljs>
 *
 * Read more about the [$sceDelegateProvider](https://docs.angularjs.org/api/ng/provider/$sceDelegateProvider).
 *
 * **Notice:** Most font-icons libraries do not support ligatures (for example `fontawesome`).<br/>
 *  In such cases you are not able to use the icon's ligature name - Like so:
 *
 *  <hljs lang="html">
 *    <md-icon md-font-set="fa">fa-bell</md-icon>
 *  </hljs>
 *
 * You should instead use the given unicode, instead of the ligature name.
 *
 * <p ng-hide="true"> ##// Notice we can't use a hljs element here, because the characters will be escaped.</p>
 *  ```html
 *    <md-icon md-font-set="fa">&#xf0f3</md-icon>
 *  ```
 *
 * All unicode ligatures are prefixed with the `&#x` string.
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .defaultFontSet( 'fa' )                   // This sets our default fontset className.
    *          .defaultIconSet('my/app/icons.svg')       // Register a default set of SVG icons
    *          .iconSet('social', 'my/app/social.svg')   // Register a named icon set of SVGs
    *          .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
    *          .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
    *   });
 * </hljs>
 *
 * SVG icons and icon sets can be easily pre-loaded and cached using either (a) a build process or (b) a runtime
 * **startup** process (shown below):
 *
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
    *
    *     // Register a default set of SVG icon definitions
    *     $mdIconProvider.defaultIconSet('my/app/icons.svg')
    *
    *   })
 *   .run(function($templateRequest){
    *
    *     // Pre-fetch icons sources by URL and cache in the $templateCache...
    *     // subsequent $templateRequest calls will look there first.
    *
    *     var urls = [ 'imy/app/icons.svg', 'img/icons/android.svg'];
    *
    *     angular.forEach(urls, function(url) {
    *       $templateRequest(url);
    *     });
    *
    *   });
 *
 * </hljs>
 *
 * > <b>Note:</b> The loaded SVG data is subsequently cached internally for future requests.
 *
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#icon
 *
 * @description
 * Register a source URL for a specific icon name; the name may include optional 'icon set' name prefix.
 * These icons  will later be retrieved from the cache using `$mdIcon( <icon name> )`
 *
 * @param {string} id Icon name/id used to register the icon
 * @param {string} url specifies the external location for the data file. Used internally by
 * `$templateRequest` to load the data or as part of the lookup in `$templateCache` if pre-loading
 * was configured.
 * @param {number=} viewBoxSize Sets the width and height the icon's viewBox.
 * It is ignored for icons with an existing viewBox. Default size is 24.
 *
 * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
    *          .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
    *   });
 * </hljs>
 *
 */
/**
 * @ngdoc method
 * @name $mdIconProvider#iconSet
 *
 * @description
 * Register a source URL for a 'named' set of icons; group of SVG definitions where each definition
 * has an icon id. Individual icons can be subsequently retrieved from this cached set using
 * `$mdIcon(<icon set name>:<icon name>)`
 *
 * @param {string} id Icon name/id used to register the iconset
 * @param {string} url specifies the external location for the data file. Used internally by
 * `$templateRequest` to load the data or as part of the lookup in `$templateCache` if pre-loading
 * was configured.
 * @param {number=} viewBoxSize Sets the width and height of the viewBox of all icons in the set.
 * It is ignored for icons with an existing viewBox. All icons in the icon set should be the same size.
 * Default value is 24.
 *
 * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
 *
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .iconSet('social', 'my/app/social.svg')   // Register a named icon set
    *   });
 * </hljs>
 *
 */
/**
 * @ngdoc method
 * @name $mdIconProvider#defaultIconSet
 *
 * @description
 * Register a source URL for the default 'named' set of icons. Unless explicitly registered,
 * subsequent lookups of icons will failover to search this 'default' icon set.
 * Icon can be retrieved from this cached, default set using `$mdIcon(<name>)`
 *
 * @param {string} url specifies the external location for the data file. Used internally by
 * `$templateRequest` to load the data or as part of the lookup in `$templateCache` if pre-loading
 * was configured.
 * @param {number=} viewBoxSize Sets the width and height of the viewBox of all icons in the set.
 * It is ignored for icons with an existing viewBox. All icons in the icon set should be the same size.
 * Default value is 24.
 *
 * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .defaultIconSet( 'my/app/social.svg' )   // Register a default icon set
    *   });
 * </hljs>
 *
 */
/**
 * @ngdoc method
 * @name $mdIconProvider#defaultFontSet
 *
 * @description
 * When using Font-Icons, Angular Material assumes the the Material Design icons will be used and automatically
 * configures the default font-set == 'material-icons'. Note that the font-set references the font-icon library
 * class style that should be applied to the `<md-icon>`.
 *
 * Configuring the default means that the attributes
 * `md-font-set="material-icons"` or `class="material-icons"` do not need to be explicitly declared on the
 * `<md-icon>` markup. For example:
 *
 *  `<md-icon> face </md-icon>`
 *  will render as
 *  `<span class="material-icons"> face </span>`, and
 *
 *  `<md-icon md-font-set="fa"> face </md-icon>`
 *  will render as
 *  `<span class="fa"> face </span>`
 *
 * @param {string} name of the font-library style that should be applied to the md-icon DOM element
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
   *     $mdIconProvider.defaultFontSet( 'fa' );
   *   });
 * </hljs>
 *
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#fontSet
 *
 * @description
 * When using a font set for `<md-icon>` you must specify the correct font classname in the `md-font-set`
 * attribute. If the fonset className is really long, your markup may become cluttered... an easy
 * solution is to define an `alias` for your fontset:
 *
 * @param {string} alias of the specified fontset.
 * @param {string} className of the fontset.
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
   *     // In this case, we set an alias for the `material-icons` fontset.
   *     $mdIconProvider.fontSet('md', 'material-icons');
   *   });
 * </hljs>
 *
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#defaultViewBoxSize
 *
 * @description
 * While `<md-icon />` markup can also be style with sizing CSS, this method configures
 * the default width **and** height used for all icons; unless overridden by specific CSS.
 * The default sizing is (24px, 24px).
 * @param {number=} viewBoxSize Sets the width and height of the viewBox for an icon or an icon set.
 * All icons in a set should be the same size. The default value is 24.
 *
 * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
    *          .defaultViewBoxSize(36)   // Register a default icon size (width == height)
    *   });
 * </hljs>
 *
 */

var config = {
  defaultViewBoxSize: 24,
  defaultFontSet: 'material-icons',
  fontSets: []
};

function MdIconProvider() {
}

MdIconProvider.prototype = {
  icon: function(id, url, viewBoxSize) {
    if (id.indexOf(':') == -1) id = '$default:' + id;

    config[id] = new ConfigurationItem(url, viewBoxSize);
    return this;
  },

  iconSet: function(id, url, viewBoxSize) {
    config[id] = new ConfigurationItem(url, viewBoxSize);
    return this;
  },

  defaultIconSet: function(url, viewBoxSize) {
    var setName = '$default';

    if (!config[setName]) {
      config[setName] = new ConfigurationItem(url, viewBoxSize);
    }

    config[setName].viewBoxSize = viewBoxSize || config.defaultViewBoxSize;

    return this;
  },

  defaultViewBoxSize: function(viewBoxSize) {
    config.defaultViewBoxSize = viewBoxSize;
    return this;
  },

  /**
   * Register an alias name associated with a font-icon library style ;
   */
  fontSet: function fontSet(alias, className) {
    config.fontSets.push({
      alias: alias,
      fontSet: className || alias
    });
    return this;
  },

  /**
   * Specify a default style name associated with a font-icon library
   * fallback to Material Icons.
   *
   */
  defaultFontSet: function defaultFontSet(className) {
    config.defaultFontSet = !className ? '' : className;
    return this;
  },

  defaultIconSize: function defaultIconSize(iconSize) {
    config.defaultIconSize = iconSize;
    return this;
  },

  $get: ['$templateRequest', '$q', '$log', '$mdUtil', '$sce', function($templateRequest, $q, $log, $mdUtil, $sce) {
    return MdIconService(config, $templateRequest, $q, $log, $mdUtil, $sce);
  }]
};

/**
 *  Configuration item stored in the Icon registry; used for lookups
 *  to load if not already cached in the `loaded` cache
 */
function ConfigurationItem(url, viewBoxSize) {
  this.url = url;
  this.viewBoxSize = viewBoxSize || config.defaultViewBoxSize;
}

/**
 * @ngdoc service
 * @name $mdIcon
 * @module material.components.icon
 *
 * @description
 * The `$mdIcon` service is a function used to lookup SVG icons.
 *
 * @param {string} id Query value for a unique Id or URL. If the argument is a URL, then the service will retrieve the icon element
 * from its internal cache or load the icon and cache it first. If the value is not a URL-type string, then an ID lookup is
 * performed. The Id may be a unique icon ID or may include an iconSet ID prefix.
 *
 * For the **id** query to work properly, this means that all id-to-URL mappings must have been previously configured
 * using the `$mdIconProvider`.
 *
 * @returns {angular.$q.Promise} A promise that gets resolved to a clone of the initial SVG DOM element; which was
 * created from the SVG markup in the SVG data file. If an error occurs (e.g. the icon cannot be found) the promise
 * will get rejected.
 *
 * @usage
 * <hljs lang="js">
 * function SomeDirective($mdIcon) {
  *
  *   // See if the icon has already been loaded, if not
  *   // then lookup the icon from the registry cache, load and cache
  *   // it for future requests.
  *   // NOTE: ID queries require configuration with $mdIconProvider
  *
  *   $mdIcon('android').then(function(iconEl)    { element.append(iconEl); });
  *   $mdIcon('work:chair').then(function(iconEl) { element.append(iconEl); });
  *
  *   // Load and cache the external SVG using a URL
  *
  *   $mdIcon('img/icons/android.svg').then(function(iconEl) {
  *     element.append(iconEl);
  *   });
  * };
 * </hljs>
 *
 * > <b>Note:</b> The `<md-icon>` directive internally uses the `$mdIcon` service to query, loaded,
 *   and instantiate SVG DOM elements.
 */

/* @ngInject */
function MdIconService(config, $templateRequest, $q, $log, $mdUtil, $sce) {
  var iconCache = {};
  var svgCache = {};
  var urlRegex = /[-\w@:%\+.~#?&//=]{2,}\.[a-z]{2,4}\b(\/[-\w@:%\+.~#?&//=]*)?/i;
  var dataUrlRegex = /^data:image\/svg\+xml[\s*;\w\-\=]*?(base64)?,(.*)$/i;

  Icon.prototype = {clone: cloneSVG, prepare: prepareAndStyle};
  getIcon.fontSet = findRegisteredFontSet;

  // Publish service...
  return getIcon;

  /**
   * Actual $mdIcon service is essentially a lookup function
   */
  function getIcon(id) {
    id = id || '';

    // If the "id" provided is not a string, the only other valid value is a $sce trust wrapper
    // over a URL string. If the value is not trusted, this will intentionally throw an error
    // because the user is attempted to use an unsafe URL, potentially opening themselves up
    // to an XSS attack.
    if (!angular.isString(id)) {
      id = $sce.getTrustedUrl(id);
    }

    // If already loaded and cached, use a clone of the cached icon.
    // Otherwise either load by URL, or lookup in the registry and then load by URL, and cache.

    if (iconCache[id]) {
      return $q.when(transformClone(iconCache[id]));
    }

    if (urlRegex.test(id) || dataUrlRegex.test(id)) {
      return loadByURL(id).then(cacheIcon(id));
    }

    if (id.indexOf(':') == -1) {
      id = '$default:' + id;
    }

    var load = config[id] ? loadByID : loadFromIconSet;
    return load(id)
      .then(cacheIcon(id));
  }

  /**
   * Lookup registered fontSet style using its alias...
   * If not found,
   */
  function findRegisteredFontSet(alias) {
    var useDefault = angular.isUndefined(alias) || !(alias && alias.length);
    if (useDefault) return config.defaultFontSet;

    var result = alias;
    angular.forEach(config.fontSets, function(it) {
      if (it.alias == alias) result = it.fontSet || result;
    });

    return result;
  }

  function transformClone(cacheElement) {
    var clone = cacheElement.clone();
    var cacheSuffix = '_cache' + $mdUtil.nextUid();

    // We need to modify for each cached icon the id attributes.
    // This is needed because SVG id's are treated as normal DOM ids
    // and should not have a duplicated id.
    if (clone.id) clone.id += cacheSuffix;
    angular.forEach(clone.querySelectorAll('[id]'), function(item) {
      item.id += cacheSuffix;
    });

    return clone;
  }

  /**
   * Prepare and cache the loaded icon for the specified `id`
   */
  function cacheIcon(id) {

    return function updateCache(icon) {
      iconCache[id] = isIcon(icon) ? icon : new Icon(icon, config[id]);

      return iconCache[id].clone();
    };
  }

  /**
   * Lookup the configuration in the registry, if !registered throw an error
   * otherwise load the icon [on-demand] using the registered URL.
   *
   */
  function loadByID(id) {
    var iconConfig = config[id];
    return loadByURL(iconConfig.url).then(function(icon) {
      return new Icon(icon, iconConfig);
    });
  }

  /**
   *    Loads the file as XML and uses querySelector( <id> ) to find
   *    the desired node...
   */
  function loadFromIconSet(id) {
    var setName = id.substring(0, id.lastIndexOf(':')) || '$default';
    var iconSetConfig = config[setName];

    return !iconSetConfig ? announceIdNotFound(id) : loadByURL(iconSetConfig.url).then(extractFromSet);

    function extractFromSet(set) {
      var iconName = id.slice(id.lastIndexOf(':') + 1);
      var icon = set.querySelector('#' + iconName);
      return icon ? new Icon(icon, iconSetConfig) : announceIdNotFound(id);
    }

    function announceIdNotFound(id) {
      var msg = 'icon ' + id + ' not found';
      $log.warn(msg);

      return $q.reject(msg || id);
    }
  }

  /**
   * Load the icon by URL (may use the $templateCache).
   * Extract the data for later conversion to Icon
   */
  function loadByURL(url) {
    /* Load the icon from embedded data URL. */
    function loadByDataUrl(url) {
      var results = dataUrlRegex.exec(url);
      var isBase64 = /base64/i.test(url);
      var data = isBase64 ? window.atob(results[2]) : results[2];

      return $q.when(angular.element(data)[0]);
    }

    /* Load the icon by URL using HTTP. */
    function loadByHttpUrl(url) {
      return $q(function(resolve, reject) {
        // Catch HTTP or generic errors not related to incorrect icon IDs.
        var announceAndReject = function(err) {
            var msg = angular.isString(err) ? err : (err.message || err.data || err.statusText);
            $log.warn(msg);
            reject(err);
          },
          extractSvg = function(response) {
            if (!svgCache[url]) {
              svgCache[url] = angular.element('<div>').append(response)[0].querySelector('svg');
            }
            resolve(svgCache[url]);
          };

        $templateRequest(url, true).then(extractSvg, announceAndReject);
      });
    }

    return dataUrlRegex.test(url)
      ? loadByDataUrl(url)
      : loadByHttpUrl(url);
  }

  /**
   * Check target signature to see if it is an Icon instance.
   */
  function isIcon(target) {
    return angular.isDefined(target.element) && angular.isDefined(target.config);
  }

  /**
   *  Define the Icon class
   */
  function Icon(el, config) {
    if (el && el.tagName != 'svg') {
      el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el.cloneNode(true))[0];
    }

    // Inject the namespace if not available...
    if (!el.getAttribute('xmlns')) {
      el.setAttribute('xmlns', "http://www.w3.org/2000/svg");
    }

    this.element = el;
    this.config = config;
    this.prepare();
  }

  /**
   *  Prepare the DOM element that will be cached in the
   *  loaded iconCache store.
   */
  function prepareAndStyle() {
    var viewBoxSize = this.config ? this.config.viewBoxSize : config.defaultViewBoxSize;
    angular.forEach({
      'fit': '',
      'height': '100%',
      'width': '100%',
      'preserveAspectRatio': 'xMidYMid meet',
      'viewBox': this.element.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize),
      'focusable': false // Disable IE11s default behavior to make SVGs focusable
    }, function(val, attr) {
      this.element.setAttribute(attr, val);
    }, this);
  }

  /**
   * Clone the Icon DOM element.
   */
  function cloneSVG() {
    // If the element or any of its children have a style attribute, then a CSP policy without
    // 'unsafe-inline' in the style-src directive, will result in a violation.
    return this.element.cloneNode(true);
  }

}
