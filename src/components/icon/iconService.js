  angular
    .module('material.components.icon' )
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
    * Loading of the actual svg files are deferred to on-demand requests and are loaded
    * internally by the `$mdIcon` service using the `$http` service. When an SVG is requested by name/ID,
    * the `$mdIcon` service searches its registry for the associated source URL;
    * that URL is used to on-demand load and parse the SVG dynamically.
    *
    * <hljs lang="js">
    *   app.config(function($mdIconProvider) {
    *
    *     // Configure URLs for icons specified by [set:]id.
    *
    *     $mdIconProvider
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
    *   .run(function($http, $templateCache){
    *
    *     // Pre-fetch icons sources by URL and cache in the $templateCache...
    *     // subsequent $http calls will look there first.
    *
    *     var urls = [ 'imy/app/icons.svg', 'img/icons/android.svg'];
    *
    *     angular.forEach(urls, function(url) {
    *       $http.get(url, {cache: $templateCache});
    *     });
    *
    *   });
    *
    * </hljs>
    *
    * NOTE: the loaded SVG data is subsequently cached internally for future requests.
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
    * @param {string} url specifies the external location for the data file. Used internally by `$http` to load the
    * data or as part of the lookup in `$templateCache` if pre-loading was configured.
    * @param {string=} iconSize Number indicating the width and height of the icons in the set. All icons
    * in the icon set must be the same size. Default size is 24.
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
    * `$mdIcon( <icon set name>:<icon name> )`
    *
    * @param {string} id Icon name/id used to register the iconset
    * @param {string} url specifies the external location for the data file. Used internally by `$http` to load the
    * data or as part of the lookup in `$templateCache` if pre-loading was configured.
    * @param {string=} iconSize Number indicating the width and height of the icons in the set. All icons
    * in the icon set must be the same size. Default size is 24.
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
    * Icon can be retrieved from this cached, default set using `$mdIcon( <icon name> )`
    *
    * @param {string} url specifies the external location for the data file. Used internally by `$http` to load the
    * data or as part of the lookup in `$templateCache` if pre-loading was configured.
    * @param {string=} iconSize Number indicating the width and height of the icons in the set. All icons
    * in the icon set must be the same size. Default size is 24.
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
    * @name $mdIconProvider#defaultIconSize
    *
    * @description
    * While `<md-icon />` markup can also be style with sizing CSS, this method configures
    * the default width **and** height used for all icons; unless overridden by specific CSS.
    * The default sizing is (24px, 24px).
    *
    * @param {string} iconSize Number indicating the width and height of the icons in the set. All icons
    * in the icon set must be the same size. Default size is 24.
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
    *          .defaultIconSize(36)   // Register a default icon size (width == height)
    *   });
    * </hljs>
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

     config[setName].iconSize = iconSize || config.defaultIconSize;

     return this;
   },

   defaultIconSize : function defaultIconSize(iconSize) {
     config.defaultIconSize = iconSize;
     return this;
   },

   preloadIcons: function ($templateCache) {
     var iconProvider = this;
     var svgRegistry = [
       {
         id : 'tabs-arrow',
         url: 'tabs-arrow.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><polygon points="15.4,7.4 14,6 8,12 14,18 15.4,16.6 10.8,12 "/></g></svg>'
       },
       {
         id : 'close',
         url: 'close.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/></g></svg>'
       },
       {
         id:  'cancel',
         url: 'cancel.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M12 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10-4.47-10-10-10zm5 13.59l-1.41 1.41-3.59-3.59-3.59 3.59-1.41-1.41 3.59-3.59-3.59-3.59 1.41-1.41 3.59 3.59 3.59-3.59 1.41 1.41-3.59 3.59 3.59 3.59z"/></g></svg>'
       },
       {
         id:  'menu',
         url: 'menu.svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><path d="M 50 0 L 100 14 L 92 80 L 50 100 L 8 80 L 0 14 Z" fill="#b2b2b2"></path><path d="M 50 5 L 6 18 L 13.5 77 L 50 94 Z" fill="#E42939"></path><path d="M 50 5 L 94 18 L 86.5 77 L 50 94 Z" fill="#B72833"></path><path d="M 50 7 L 83 75 L 72 75 L 65 59 L 50 59 L 50 50 L 61 50 L 50 26 Z" fill="#b2b2b2"></path><path d="M 50 7 L 17 75 L 28 75 L 35 59 L 50 59 L 50 50 L 39 50 L 50 26 Z" fill="#fff"></path></svg>'
       },
       {
         id:  'toggle-arrow',
         url: 'toggle-arrow-svg',
         svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 48 48"><path d="M24 16l-12 12 2.83 2.83 9.17-9.17 9.17 9.17 2.83-2.83z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>'
       }
     ];

     svgRegistry.forEach(function(asset){
       iconProvider.icon(asset.id,  asset.url);
       $templateCache.put(asset.url, asset.svg);
     });

   },

   $get : ['$http', '$q', '$log', '$templateCache', function($http, $q, $log, $templateCache) {
     this.preloadIcons($templateCache);
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
  * The `$mdIcon` service is a function used to lookup SVG icons.
  *
  * @param {string} id Query value for a unique Id or URL. If the argument is a URL, then the service will retrieve the icon element
  * from its internal cache or load the icon and cache it first. If the value is not a URL-type string, then an ID lookup is
  * performed. The Id may be a unique icon ID or may include an iconSet ID prefix.
  *
  * For the **id** query to work properly, this means that all id-to-URL mappings must have been previously configured
  * using the `$mdIconProvider`.
  *
  * @returns {obj} Clone of the initial SVG DOM element; which was created from the SVG markup in the SVG data file.
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
  * NOTE: The `md-icon` directive internally uses the `$mdIcon` service to query, loaded, and instantiate
  * SVG DOM elements.
  */
 function MdIconService(config, $http, $q, $log, $templateCache) {
   var iconCache = {};
   var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i;

   Icon.prototype = { clone : cloneSVG, prepare: prepareAndStyle };

   return function getIcon(id) {
     id = id || '';

     // If already loaded and cached, use a clone of the cached icon.
     // Otherwise either load by URL, or lookup in the registry and then load by URL, and cache.

     if ( iconCache[id]         ) return $q.when( iconCache[id].clone() );
     if ( urlRegex.test(id)     ) return loadByURL(id).then( cacheIcon(id) );
     if ( id.indexOf(':') == -1 ) id = '$default:' + id;

     return loadByID(id)
         .catch(loadFromIconSet)
         .catch(announceIdNotFound)
         .catch(announceNotFound)
         .then( cacheIcon(id) );
   };

   /**
    * Prepare and cache the loaded icon for the specified `id`
    */
   function cacheIcon( id ) {

     return function updateCache( icon ) {
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

     return !iconConfig ? $q.reject(id) : loadByURL(iconConfig.url).then(function(icon) {
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

     return !iconSetConfig ? $q.reject(id) : loadByURL(iconSetConfig.url).then(extractFromSet);

     function extractFromSet(set) {
       var iconName = id.slice(id.lastIndexOf(':') + 1);
       var icon = set.querySelector('#' + iconName);
       return !icon ? $q.reject(id) : new Icon(icon, iconSetConfig);
     }
   }

   /**
    * Load the icon by URL (may use the $templateCache).
    * Extract the data for later conversion to Icon
    */
   function loadByURL(url) {
     return $http
       .get(url, { cache: $templateCache })
       .then(function(response) {
         return angular.element('<div>').append(response.data).find('svg')[0];
       });
   }

   /**
    * User did not specify a URL and the ID has not been registered with the $mdIcon
    * registry
    */
   function announceIdNotFound(id) {
     var msg;

     if (angular.isString(id)) {
       msg = 'icon ' + id + ' not found';
       $log.warn(msg);
     }

     return $q.reject(msg || id);
   }

   /**
    * Catch HTTP or generic errors not related to incorrect icon IDs.
    */
   function announceNotFound(err) {
     var msg = angular.isString(err) ? err : (err.message || err.data || err.statusText);
     $log.warn(msg);

     return $q.reject(msg);
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
     if (el.tagName != 'svg') {
       el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el)[0];
     }

     // Inject the namespace if not available...
     if ( !el.getAttribute('xmlns') ) {
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
     var iconSize = this.config ? this.config.iconSize : config.defaultIconSize;
         angular.forEach({
           'fit'   : '',
           'height': '100%',
           'width' : '100%',
           'preserveAspectRatio': 'xMidYMid meet',
           'viewBox' : this.element.getAttribute('viewBox') || ('0 0 ' + iconSize + ' ' + iconSize)
         }, function(val, attr) {
           this.element.setAttribute(attr, val);
         }, this);

         angular.forEach({
           'pointer-events' : 'none',
           'display' : 'block'
         }, function(val, style) {
           this.element.style[style] = val;
         }, this);
   }

   /**
    * Clone the Icon DOM element.
    */
   function cloneSVG(){
     return this.element.cloneNode(true);
   }

 }
