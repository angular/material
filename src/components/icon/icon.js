(function() {
'use strict';

/*
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

/*
 * @ngdoc directive
 * @name mdIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<md-icon>` directive is an element useful for showing an icon
 *
 * @usage
 * <hljs lang="html">
 *  <md-icon font-icon="android" alt="android icon"></md-icon>
 *  <md-icon svg-icon="action:android" alt="android icon"></md-icon>
 *  <md-icon svg-src="/android.svg" alt="android icon"></md-icon>
 * </hljs>
 */
function mdIconDirective($mdIcon, $mdAria, $log) {
  return {
    scope: {
      fontIcon: '@',
      svgIcon: '@',
      svgSrc: '@'
    },
    restrict: 'E',
    template: getTemplate,
    link: postLink
  };

  function getTemplate(element, attr) {
    return attr.fontIcon ? '<span class="md-font" ng-class="fontIcon"></span>' : '';
  }

  /**
   * Directive postLink
   * Supports embeded SVGs, font-icons, & external SVGs
   */
  function postLink(scope, element, attr) {
    var ariaLabel = attr.alt || scope.fontIcon || scope.svgIcon;
    var attrName = attr.$normalize(attr.$attr.svgIcon || attr.$attr.svgSrc || '');

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

        element.empty(); // TODO: possible race condition with promise callback below?
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
 * `$mdIconProvider` is a factory that provides the $mdIcon service based on a
 *  given configuruation.
 *
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.config(function($mdIconProvider) {
 *   $mdIconProvider.iconSet('social', 'my/app/social.svg')
 *   $mdIconProvider.defaultIconSet('my/app/icons.svg')
 *   $mdIconProvider.icon('android', 'my/app/android.svg')
 *   $mdIconProvider.icon('work:chair', 'my/app/chair.svg')
 * });
 * </hljs>
 */
var config = {
  defaultIconSize: 24
};

function ConfigurationItem(url, iconSize) {
  this.url = url;
  this.iconSize = iconSize || config.defaultIconSize;
}

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
 * @ngdoc service
 * @name $mdIcon
 * @module material.components.icon
 *
 * @description
 * `$mdIcon` is a service used to retrieve SVG icons configured via $mdIconProvider
 *  or a URL. The service returns a promise which resolves to a DOM element.
 *
 * <hljs lang="js">
 * function SomeDirective($mdIcon) {
 *   $mdIcon('android').then(function(android) {
 *     element.append(android);
 *   });
 *   $mdIcon('work:chair').then(function(chair) {
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
    if ( urlRegex.test(id)     ) return loadByURL(id); // Get SVG from URL
    if ( id.indexOf(':') == -1 ) id = '$default:' + id;
    if ( iconCache[id]         ) return $q.when(iconCache[id].cloneNode(true));

    return loadByID(id)
        .catch(loadFromIconSet)
        .catch(announceNotFound)
        .then(function(icon) {
          icon = prepareAndStyle(icon.element, icon.config.iconSize);
          iconCache[id] = icon;
          return icon;
        });
  };

  /**
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
   *
   */
  function announceNotFound(id) {
    var msg = 'icon ' + id + ' not found';
    $log.warn(msg);
    throw new Error(msg);
  }

  /**
   *
   */
  function prepareAndStyle(svg, iconSize) {
    svg = angular.element(svg);

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
   *
   */
  function loadByURL(url) {
    return $http
      .get(url, { cache: $templateCache })
      .then(function(response) {
        return angular.element(response.data)[0];
      });
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

}
})();
