ddescribe('mdIcon directive', function() {
  var provider, el;

  beforeEach(module('material.components.icon',function($mdIconProvider){
    provider = $mdIconProvider;
    provider
      .icon('android'  , 'android.svg')
      .iconSet('social', 'social.svg' )
      .defaultIconSet('core.svg');
  }));

  beforeEach(inject(function($templateCache){

    $templateCache.put('android.svg', '<svg><g id="android"></g></svg>');
    $templateCache.put('social.svg' , '<svg><g id="s1"></g><g id="s2"></g></svg>');
    $templateCache.put('core.svg'   , '<svg><g id="c1"></g><g id="c2"></g></svg>');

  }));


  describe('using font-icon=""', function() {
    it('should render correct HTML with font-icon value as class', function() {
      el = make( '<md-icon font-icon="android"></md-icon>');
      expect(el.html()).toEqual('<span class="md-font android" ng-class="fontIcon"></span>');
    });
  });


  describe('using svg-icon=""', function() {

    it('should append configured SVG single icon', function() {
      el = make('<md-icon svg-icon="android"></md-icon>');
      var expected = updateDefaults('<svg><g id="android"></g></svg>');
      expect(el.html()).toEqual(expected);
    });

    it('should append configured SVG icon from named group', function() {
      el = make('<md-icon svg-icon="social:s1"></md-icon>');
      var expected = updateDefaults('<svg xmlns="http://www.w3.org/2000/svg"><g id="s1"></g></g></svg>');
      expect(el.html()).toEqual(expected);
    });

    it('should append configured SVG icon from default group', function() {
      el = make('<md-icon svg-icon="c1"></md-icon>');
      var expected = updateDefaults('<svg xmlns="http://www.w3.org/2000/svg"><g id="c1"></g></g></svg>');
      expect(el.html()).toEqual(expected);
    });

  });


  describe('using svg-src=""', function() {

    it('should append SVG from URL to md-icon', function() {
      el = make('<md-icon svg-src="android.svg"></md-icon>');
      expect(el.html()).toEqual('<svg><g id="android"></g></svg>');
    });

  });

  describe('with ARIA support', function() {

    it('should apply aria-hidden="true" when alt is empty string', function() {
      el = make('<md-icon svg-icon="android" alt=""></md-icon>');
      expect(el.attr('aria-hidden')).toEqual('true');
    });

    it('should apply alt value to aria-label when set', function() {
      el = make('<md-icon svg-icon="android" alt="my android icon"></md-icon>');
      expect(el.attr('aria-label')).toEqual('my android icon');
    });

    it('should apply font-icon value to aria-label when alt not set', function() {
      el = make('<md-icon font-icon="android"></md-icon>');
      expect(el.attr('aria-label')).toEqual('android');
    });

    it('should apply svg-icon value to aria-label when alt not set', function() {
      el = make('<md-icon svg-icon="android"></md-icon>');
      expect(el.attr('aria-label')).toEqual('android');
    });

  });


  function make(html) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile(html)($rootScope);
      $rootScope.$digest();
    });

    return el;
  }

  function updateDefaults(svg) {
    svg = angular.element(svg);

    svg.attr({
      'fit'   : '',
      'height': '100%',
      'width' : '100%',
      'preserveAspectRatio': 'xMidYMid meet',
      'viewBox' : svg.attr('viewBox') || '0 0 24 24'
    })
    .css( {
      'pointer-events' : 'none',
      'display' : 'block'
    });

    return svg[0].outerHTML;
  }

});
