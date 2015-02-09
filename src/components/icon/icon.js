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
    if (attr.alt == '') {
      // Hide from the accessibility layer.
      $mdAria.expect(element, 'aria-hidden', 'true');
    } else {
      var ariaLabel = attr.alt || scope.fontIcon || scope.svgIcon;
      $mdAria.expect(element, 'aria-label', ariaLabel);
      $mdAria.expect(element, 'role', 'img');
    }

    if (attr.svgSrc) {
      // Using External SVGs
      $mdIcon(attr.svgSrc).then(function(svg) {
        element.append(svg);
      });
    } else if (attr.svgIcon) {
      // Use pre-configured named SVG.
      $mdIcon(attr.svgIcon).then(function(svg) {
        element.append(svg);
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
function MdIconProvider() {

  var config = {
    defaultIconSize: 24
  };

  this.iconSet = function(id, url, iconSize) {
    config[id] = new Config(url, iconSize || config.defaultIconSize);
    return this;
  };

  this.defaultIconSet = function(url, iconSize) {
    var setName = '$default';
    if (config[setName]) {
      console.warn('Default icon set already defined');
    } else {
      config[setName] = new Config(url, iconSize || config.defaultIconSize);
    }
    return this;
  };

  this.icon = function(id, url, iconSize) {
    id = id.match(/:/) ? id : '$default:' + id;
    config[id] = new Config(url, iconSize || config.defaultIconSize);
    return this;
  };

  this.defaultIconSize = function(iconSize) {
    config.defaultIconSize = iconSize;
  };

  this.$get = ['$http', '$q', '$log', '$templateCache', function($http, $q, $log, $templateCache) {
    return new MdIconService(config, $http, $q, $log, $templateCache);
  }];

  function Config(url, iconSize) {
    this.url = url;
    this.iconSize = iconSize;
  };
}


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
  var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  return function getIcon(id) {
    id = id || '';

    if (id.match(urlRegex)) {
      // Get SVG from URL
      return load(id);
    }

    id = id.match(/:/) ? id : '$default:' + id;

    if (iconCache[id]) {
      return $q.when(iconCache[id].cloneNode(true));
    }
    else {
      return loadIcon(id).catch(loadIconSet).catch(throwError).then(function(icon) {
        icon = prepareAndStyle(icon.element, icon.config.iconSize);
        iconCache[id] = icon;
        return icon;
      });
    }
  };

  function loadIcon(id) {
    var iconConfig = config[id];

    return !iconConfig ? $q.reject(id) : load(iconConfig.url).then(function(icon) {
      return new Icon(icon, iconConfig);
    });
  };

  function loadIconSet(id) {
    var setName = id.substring(0, id.lastIndexOf(':')) || '$default';
    var iconSetConfig = config[setName];

    return !iconSetConfig ? $q.reject(id) : load(iconSetConfig.url).then(extractFromSet);

    function extractFromSet(set) {
      var iconName = id.slice(id.lastIndexOf(':') + 1);
      var icon = set.querySelector('#' + iconName);
      return !icon ? $q.reject(id) : new Icon(icon, iconSetConfig);
    };
  };

  function throwError(id) {
    var msg = 'icon ' + id + ' not found';
    $log.warn(msg);
    throw new Error(msg);
  };

  function prepareAndStyle(svg, iconSize) {
    svg.setAttribute('fit', '');
    svg.setAttribute('height', '100%');
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.pointerEvents = 'none';
    svg.style.display = 'block';

    if (!svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', '0 0 ' + iconSize + ' ' + iconSize);
    }
    return svg;
  };

  function load(url) {
    return $http
      .get(url, { cache: $templateCache })
      .then(function(response) {
        return angular.element(response.data)[0];
      });
  };

  function Icon(el, config) {
    if (el.tagName != 'svg') {
      el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el)[0];
    }
    this.element = el;
    this.config = config;
  };
}
})();
