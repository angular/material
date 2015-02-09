angular.module('md-icon.test', [])
  .config(function($mdIconProvider) {
    $mdIconProvider.iconSet('social', 'social.svg')
                   .defaultIconSet('core.svg')
                   .icon('android', 'android.svg');});

describe('mdIcon directive', function() {

  beforeEach(module('material.components.icon'));
  beforeEach(module('md-icon.test'));

  beforeEach(function() {
    inject(function($templateCache) {
      $templateCache.put('android.svg', '<svg><g id="android"></g></svg>');
      $templateCache.put('social.svg', '<svg><g id="s1"></g><g id="s2"></g></svg>');
      $templateCache.put('core.svg', '<svg><g id="c1"></g><g id="c2"></g></svg>');
    });
  });

  var el;

  function setup(options) {
    inject(function($compile, $rootScope) {
      options = options || {};
      angular.extend($rootScope, options.attrs);
      el = $compile(options.html)($rootScope);
      $rootScope.$digest();
    });
  }

  function addProps(svg) {
    svg = angular.element(svg);
    svg.attr('fit', '');
    svg.attr('height', '100%');
    svg.attr('width', '100%');
    svg.attr('preserveAspectRatio', 'xMidYMid meet');
    svg.css('pointer-events', 'none');
    svg.css('display', 'block');

    if (!svg.attr('viewBox')) {
      svg.attr('viewBox', '0 0 24 24');
    }
    return svg[0].outerHTML;
  }

  describe('font-icon', function() {
    it('should render correct HTML with font-icon value as class', function() {
      setup({
        html: '<md-icon font-icon="android"></md-icon>'
      });
      expect(el.html()).toEqual('<span class="md-font android" ng-class="fontIcon"></span>');
    });
  });


  describe('svg-icon', function() {

    it('should append configured SVG single icon', function() {
      setup({
        html: '<md-icon svg-icon="android"></md-icon>'
      });
      var expected = addProps('<svg><g id="android"></g></svg>');
      expect(el.html()).toEqual(expected);
    });

    it('should append configured SVG icon from named group', function() {
      setup({
        html: '<md-icon svg-icon="social:s1"></md-icon>'
      });
      var expected = addProps('<svg xmlns="http://www.w3.org/2000/svg"><g id="s1"></g></g></svg>');
      expect(el.html()).toEqual(expected);
    });

    it('should append configured SVG icon from default group', function() {
      setup({
        html: '<md-icon svg-icon="c1"></md-icon>'
      });
      var expected = addProps('<svg xmlns="http://www.w3.org/2000/svg"><g id="c1"></g></g></svg>');
      expect(el.html()).toEqual(expected);
    });

  });


  describe('svg-src', function() {

    it('should append SVG from URL to md-icon', function() {
      setup({
        html: '<md-icon svg-src="android.svg"></md-icon>'
      });
      expect(el.html()).toEqual('<svg><g id="android"></g></svg>');
    });

  });

  describe('accessibility', function() {

    it('should apply aria-hidden="true" when alt is empty string', function() {
      setup({
        html: '<md-icon svg-icon="android" alt=""></md-icon>'
      });
      expect(el.attr('aria-hidden')).toEqual('true');
    });

    it('should apply alt value to aria-label when set', function() {
      setup({
        html: '<md-icon svg-icon="android" alt="alt text"></md-icon>'
      });
      expect(el.attr('aria-label')).toEqual('alt text');
    });

    it('should apply font-icon value to aria-label when alt not set', function() {
      setup({
        html: '<md-icon font-icon="android"></md-icon>'
      });
      expect(el.attr('aria-label')).toEqual('android');
    });

    it('should apply svg-icon value to aria-label when alt not set', function() {
      setup({
        html: '<md-icon svg-icon="android"></md-icon>'
      });
      expect(el.attr('aria-label')).toEqual('android');
    });

  });

  // TODO(Tony): Complete unit tests for provider and service.
  /*
  describe('$mdIconProvider', function() {

    describe('Register an icon set', function() {

      it('should add the correct configuration', function() {
      });

      it('should use default size when not specified', function() {
      });

    });

    describe('Register the default icon set', function() {

      it('should use $default as the set name', function() {
      });

      it('should warn when default icon set already defined', function() {
      });

      it('should use default size when not specified', function() {
      });

    });

    describe('Register an icon', function() {

      it('should add to configuration with set name when specified', function() {
      });

      it('should use $default as the set name when not specified', function() {
      });

      it('should use default size when not specified', function() {
      });

    });

    it('should set default icon size', function() {
      
    });

    it('should $get instance of MdIconService', function() {
      
    });

  });


  describe('$mdIcon Service', function() {
  });
 */
});
