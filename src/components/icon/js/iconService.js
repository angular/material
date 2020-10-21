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
 * icons and icon sets to be pre-registered and associated with source URLs **before** the
 * `<md-icon />` directives are compiled.
 *
 * If using font-icons, the developer is responsible for loading the fonts.
 *
 * If using SVGs, loading of the actual svg files are deferred to on-demand requests and are loaded
 * internally by the `$mdIcon` service using the `$templateRequest` service. When an SVG is
 * requested by name/ID, the `$mdIcon` service searches its registry for the associated source URL;
 * that URL is used to on-demand load and parse the SVG dynamically.
 *
 * The `$templateRequest` service expects the icons source to be loaded over trusted URLs.<br/>
 * This means, when loading icons from an external URL, you have to trust the URL in the
 * `$sceDelegateProvider`.
 *
 * <hljs lang="js">
 *   app.config(function($sceDelegateProvider) {
 *     $sceDelegateProvider.resourceUrlWhitelist([
 *       // Adding 'self' to the allow-list, will allow requests from the current origin.
 *       'self',
 *       // Using double asterisks here, will allow all URLs to load.
 *       // However, we recommend only specifying the given domain you want to allow.
 *       '**'
 *     ]);
 *   });
 * </hljs>
 *
 * Read more about the [$sceDelegateProvider](https://docs.angularjs.org/api/ng/provider/$sceDelegateProvider).
 *
 * **Notice:** Most font-icon libraries do not support ligatures (for example `fontawesome`).<br/>
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
 *     $mdIconProvider
 *       .defaultFontSet( 'fa' )                   // This sets our default fontset className.
 *       .defaultIconSet('my/app/icons.svg')       // Register a default set of SVG icons
 *       .iconSet('social', 'my/app/social.svg')   // Register a named icon set of SVGs
 *       .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
 *       .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
 *   });
 * </hljs>
 *
 * SVG icons and icon sets can be easily pre-loaded and cached using either (a) a build process or
 * (b) a runtime **startup** process (shown below):
 *
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
 *
 *     // Register a default set of SVG icon definitions
 *     $mdIconProvider.defaultIconSet('my/app/icons.svg')
 *   })
 *   .run(function($templateRequest) {
 *
 *     // Pre-fetch icons sources by URL and cache in the $templateCache...
 *     // subsequent $templateRequest calls will look there first.
 *     var urls = [ 'imy/app/icons.svg', 'img/icons/android.svg'];
 *
 *     angular.forEach(urls, function(url) {
 *       $templateRequest(url);
 *     });
 *   });
 *
 * </hljs>
 *
 * > <b>Note:</b> The loaded SVG data is subsequently cached internally for future requests.
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#icon
 *
 * @description
 * Register a source URL for a specific icon name; the name may include optional 'icon set' name
 * prefix. These icons will later be retrieved from the cache using `$mdIcon(<icon name>)`.
 *
 * @param {string} id Icon name/id used to register the icon
 * @param {string} url specifies the external location for the data file. Used internally by
 *  `$templateRequest` to load the data or as part of the lookup in `$templateCache` if pre-loading
 *  was configured.
 * @param {number=} viewBoxSize Sets the width and height the icon's viewBox.
 *  It is ignored for icons with an existing viewBox. Default size is 24.
 *
 * @returns {obj} an `$mdIconProvider` reference; used to support method call chains for the API
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
 *
 *     // Configure URLs for icons specified by [set:]id.
 *     $mdIconProvider
 *       .icon('android', 'my/app/android.svg')    // Register a specific icon (by name)
 *       .icon('work:chair', 'my/app/chair.svg');  // Register icon in a specific set
 *   });
 * </hljs>
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
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
 *
 *     // Configure URLs for icons specified by [set:]id.
 *     $mdIconProvider
 *       .iconSet('social', 'my/app/social.svg');   // Register a named icon set
 *   });
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#defaultIconSet
 *
 * @description
 * Register a source URL for the default 'named' set of icons. Unless explicitly registered,
 * subsequent lookups of icons will fail over to search this 'default' icon set.
 * Icon can be retrieved from this cached, default set using `$mdIcon(<name>)`
 *
 * @param {string} url specifies the external location for the data file. Used internally by
 * `$templateRequest` to load the data or as part of the lookup in `$templateCache` if pre-loading
 * was configured.
 * @param {number=} viewBoxSize Sets the width and height of the viewBox of all icons in the set.
 * It is ignored for icons with an existing viewBox. All icons in the icon set should be the same
 * size. Default value is 24.
 *
 * @returns {Object} an `$mdIconProvider` reference; used to support method call chains for the API
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
 *
 *     // Configure URLs for icons specified by [set:]id.
 *     $mdIconProvider
 *       .defaultIconSet('my/app/social.svg');   // Register a default icon set
 *   });
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#defaultFontSet
 *
 * @description
 * When using Font-Icons, AngularJS Material assumes the the Material Design icons will be used and
 * automatically configures the default `font-set == 'material-icons'`. Note that the font-set
 * references the font-icon library class style that should be applied to the `<md-icon>`.
 *
 * Configuring the default means that the attributes
 * `md-font-set="material-icons"` or `class="material-icons"` do not need to be explicitly declared
 * on the `<md-icon>` markup.
 *
 * For example:<br/>
 * `<md-icon>face</md-icon>` will render as `<span class="material-icons">face</span>`,<br/>
 * and<br/>
 * `<md-icon md-font-set="fa">face</md-icon>` will render as `<span class="fa">face</span>`
 *
 * @param {string} name Name of the font-library style that should be applied to the md-icon DOM
 *  element.
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
 *     $mdIconProvider.defaultFontSet('fa');
 *   });
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#fontSet
 *
 * @description
 * When using a font-set for `<md-icon>` you must specify the correct font classname in the
 * `md-font-set` attribute. If the font-set className is really long, your markup may become
 * cluttered... an easy solution is to define an `alias` for your font-set:
 *
 * @param {string} alias Alias name of the specified font-set.
 * @param {string} className Name of the class for the font-set.
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
 *     // In this case, we set an alias for the `material-icons` font-set.
 *     $mdIconProvider.fontSet('md', 'material-icons');
 *   });
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdIconProvider#defaultViewBoxSize
 *
 * @description
 * While `<md-icon>` markup can also be styled with sizing CSS, this method configures
 * the default width **and** height used for all icons; unless overridden by specific CSS.
 * The default sizing is (`24px`, `24px`).
 * @param {number=} viewBoxSize Sets the width and height of the viewBox for an icon or an icon set.
 * All icons in a set should be the same size. The default value is 24.
 *
 * @returns {Object} an `$mdIconProvider` reference; used to support method call chains for the API
 *
 * @usage
 * <hljs lang="js">
 *   app.config(function($mdIconProvider) {
 *
 *     // Configure URLs for icons specified by [set:]id.
 *     $mdIconProvider
 *       .defaultViewBoxSize(36);   // Register a default icon size (width == height)
 *   });
 * </hljs>
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
   * Configuration item stored in the Icon registry; used for lookups
   * to load if not already cached in the `loaded` cache
   * @param {string} url
   * @param {=number} viewBoxSize
   * @constructor
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
 *   // See if the icon has already been loaded, if not then lookup the icon from the
 *   // registry cache, load and cache it for future requests.
 *   // NOTE: Non-URL queries require configuration with $mdIconProvider.
 *   $mdIcon('android').then(function(iconEl)    { element.append(iconEl); });
 *   $mdIcon('work:chair').then(function(iconEl) { element.append(iconEl); });
 *
 *   // Load and cache the external SVG using a URL.
 *   $mdIcon('img/icons/android.svg').then(function(iconEl) {
 *     element.append(iconEl);
 *   });
 * };
 * </hljs>
 *
 * > <b>Note:</b> The `<md-icon>` directive internally uses the `$mdIcon` service to query, load,
 *   and instantiate SVG DOM elements.
 */

/* @ngInject */
function MdIconService(config, $templateRequest, $q, $log, $mdUtil, $sce) {
  var iconCache = {};
  var svgCache = {};
  var urlRegex = /[-\w@:%+.~#?&//=]{2,}\.[a-z]{2,4}\b(\/[-\w@:%+.~#?&//=]*)?/i;
  var dataUrlRegex = /^data:image\/svg\+xml[\s*;\w\-=]*?(base64)?,(.*)$/i;

  Icon.prototype = {clone: cloneSVG, prepare: prepareAndStyle};
  getIcon.fontSet = findRegisteredFontSet;

  // Publish service...
  return getIcon;

  /**
   * Actual $mdIcon service is essentially a lookup function
   * @param {*} id $sce trust wrapper over a URL string, URL, icon registry id, or icon set id
   * @returns {angular.$q.Promise}
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

    if (id.indexOf(':') === -1) {
      id = '$default:' + id;
    }

    var load = config[id] ? loadByID : loadFromIconSet;
    return load(id)
      .then(cacheIcon(id));
  }

  /**
   * Lookup a registered fontSet style using its alias.
   * @param {string} alias used to lookup the alias in the array of fontSets
   * @returns {*} matching fontSet or the defaultFontSet if that alias does not match
   */
  function findRegisteredFontSet(alias) {
    var useDefault = angular.isUndefined(alias) || !(alias && alias.length);
    if (useDefault) {
      return config.defaultFontSet;
    }

    var result = alias;
    angular.forEach(config.fontSets, function(fontSet) {
      if (fontSet.alias === alias) {
        result = fontSet.fontSet || result;
      }
    });

    return result;
  }

  /**
   * @param {!Icon} cacheElement cached icon from the iconCache
   * @returns {Icon} cloned Icon element with unique ids
   */
  function transformClone(cacheElement) {
    var clone = cacheElement.clone();
    var newUid = $mdUtil.nextUid();
    var cacheSuffix, svgUrlQuerySelector, i, xlinkHrefValue;
    // These are SVG attributes that can reference element ids.
    var svgUrlAttributes = [
      'clip-path', 'color-profile', 'cursor', 'fill', 'filter', 'href', 'marker-start',
      'marker-mid', 'marker-end', 'mask', 'stroke', 'style', 'vector-effect'
    ];
    var isIeSvg = clone.innerHTML === undefined;

    // Verify that the newUid only contains a number and not some XSS content.
    if (!isFinite(Number(newUid))) {
      throw new Error('Unsafe and unexpected non-number result from $mdUtil.nextUid().');
    }
    cacheSuffix = '_cache' + newUid;

    // For each cached icon, we need to modify the id attributes and references.
    // This is needed because SVG ids are treated as normal DOM ids and should not be duplicated on
    // the page.
    if (clone.id) {
      clone.id += cacheSuffix;
    }

    // Do as much as possible with querySelectorAll as it provides much greater performance
    // than RegEx against serialized DOM.
    angular.forEach(clone.querySelectorAll('[id]'), function(descendantElem) {
      svgUrlQuerySelector = '';
      for (i = 0; i < svgUrlAttributes.length; i++) {
        svgUrlQuerySelector += '[' + svgUrlAttributes[i] + '="url(#' + descendantElem.id + ')"]';
        if (i + 1 < svgUrlAttributes.length) {
          svgUrlQuerySelector += ', ';
        }
      }
      // Append the cacheSuffix to references of the element's id within url(#id) calls.
      angular.forEach(clone.querySelectorAll(svgUrlQuerySelector), function(refItem) {
        updateSvgIdReferences(descendantElem, refItem, isIeSvg, newUid);
      });
      // Handle usages of url(#id) in the SVG's stylesheets
      angular.forEach(clone.querySelectorAll('style'), function(refItem) {
        updateSvgIdReferences(descendantElem, refItem, isIeSvg, newUid);
      });

      // Update ids referenced by the deprecated (in SVG v2) xlink:href XML attribute. The now
      // preferred href attribute is handled above. However, this non-standard XML namespaced
      // attribute cannot be handled in the same way. Explanation of this query selector here:
      // https://stackoverflow.com/q/23034283/633107.
      angular.forEach(clone.querySelectorAll('[*|href]:not([href])'), function(refItem) {
        xlinkHrefValue = refItem.getAttribute('xlink:href');
        if (xlinkHrefValue) {
          xlinkHrefValue = xlinkHrefValue.replace("#" + descendantElem.id, "#" + descendantElem.id + cacheSuffix);
          refItem.setAttribute('xlink:href', xlinkHrefValue);
        }
      });

      descendantElem.id += cacheSuffix;
    });

    return clone;
  }

  /**
   * @param {Element} referencedElement element w/ id that needs to be updated
   * @param {Element} referencingElement element that references the original id
   * @param {boolean} isIeSvg true if we're dealing with an SVG in IE11, false otherwise
   * @param {string} newUid the cache id to add as part of the cache suffix
   */
  function updateSvgIdReferences(referencedElement, referencingElement, isIeSvg, newUid) {
    var svgElement, cacheSuffix;

    // Verify that the newUid only contains a number and not some XSS content.
    if (!isFinite(Number(newUid))) {
      throw new Error('Unsafe and unexpected non-number result for newUid.');
    }
    cacheSuffix = '_cache' + newUid;

    // outerHTML of SVG elements is not supported by IE11
    if (isIeSvg) {
      svgElement = $mdUtil.getOuterHTML(referencingElement);
      svgElement = svgElement.replace("url(#" + referencedElement.id + ")",
        "url(#" + referencedElement.id + cacheSuffix + ")");
      referencingElement.textContent = angular.element(svgElement)[0].innerHTML;
    } else {
      // This use of outerHTML should be safe from XSS attack since we are only injecting the
      // cacheSuffix with content from $mdUtil.nextUid which we verify is a finite number above.
      referencingElement.outerHTML = referencingElement.outerHTML.replace(
        "url(#" + referencedElement.id + ")",
        "url(#" + referencedElement.id + cacheSuffix + ")");
    }
  }

  /**
   * Prepare and cache the loaded icon for the specified `id`.
   * @param {string} id icon cache id
   * @returns {function(*=): *}
   */
  function cacheIcon(id) {

    return function updateCache(icon) {
      iconCache[id] = isIcon(icon) ? icon : new Icon(icon, config[id]);

      return transformClone(iconCache[id]);
    };
  }

  /**
   * Lookup the configuration in the registry, if !registered throw an error
   * otherwise load the icon [on-demand] using the registered URL.
   * @param {string} id icon registry id
   * @returns {angular.$q.Promise}
   */
  function loadByID(id) {
    var iconConfig = config[id];
    return loadByURL(iconConfig.url).then(function(icon) {
      return new Icon(icon, iconConfig);
    });
  }

  /**
   * Loads the file as XML and uses querySelector( <id> ) to find the desired node...
   * @param {string} id icon id in icon set
   * @returns {angular.$q.Promise}
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
   * @param {string} url icon URL
   * @returns {angular.$q.Promise}
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
   * @param {Icon|Element} target
   * @returns {boolean} true if the specified target is an Icon object, false otherwise.
   */
  function isIcon(target) {
    return angular.isDefined(target.element) && angular.isDefined(target.config);
  }

  /**
   * Define the Icon class
   * @param {Element} el
   * @param {=ConfigurationItem} config
   * @constructor
   */
  function Icon(el, config) {
    // If the node is a <symbol>, it won't be rendered so we have to convert it into <svg>.
    if (el && el.tagName.toLowerCase() === 'symbol') {
      var viewbox = el.getAttribute('viewBox');
      // // Check if innerHTML is supported as IE11 does not support innerHTML on SVG elements.
      if (el.innerHTML) {
        el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">')
          .html(el.innerHTML)[0];
      } else {
        el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">')
          .append($mdUtil.getInnerHTML(el))[0];
      }
      if (viewbox) el.setAttribute('viewBox', viewbox);
    }

    if (el && el.tagName.toLowerCase() !== 'svg') {
      el = angular.element(
        '<svg xmlns="http://www.w3.org/2000/svg">').append(el.cloneNode(true))[0];
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
