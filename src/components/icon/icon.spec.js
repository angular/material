describe('mdIcon directive', function() {
  var el;
  var $scope;
  var $compile;
  var $mdIconProvider;

  beforeEach(module('material.core'));
  beforeEach(module('material.components.icon'));
  beforeEach(module('material.components.icon',function(_$mdIconProvider_){
     $mdIconProvider = _$mdIconProvider_;
   }));
   afterEach( function() {
     $mdIconProvider.defaultFontSet('material-icons');
     $mdIconProvider.fontSet('fa', 'fa');
   });


  describe('for font-icons:', function () {

    beforeEach( inject(function($rootScope, _$compile_){
        $scope = $rootScope;
        $compile = _$compile_;
    }));


    describe('using font-icons with deprecated md-font-icon=""', function() {

      it('should render correct HTML with md-font-icon value as class', function() {
        el = make( '<md-icon md-font-icon="android"></md-icon>');

        expect(el.html()).toEqual('');
        expect( clean(el.attr('class')) ).toEqual("md-font android material-icons");

      });

      it('should transclude class specifiers', function() {
        el = make( '<md-icon md-font-icon="android" class="material-icons"></md-icon>');

        expect(el.html()).toEqual('');
        expect(el.hasClass('md-font')).toBe(true);
        expect(el.hasClass('android')).toBe(true);
        expect(el.hasClass('material-icons')).toBe(true);
      });

      it('should not render any inner content if the md-font-icon value is empty', function() {
        el = make( '<md-icon md-font-icon=""></md-icon>' );
        expect(el.html()).toEqual('');
      });

      it('should apply default fontset "material-icons" when not specified.',function() {
        $scope.font = {
          name: 'icon-home',
          color: "#777",
          size: 48
        };

        el = make('\
          <md-icon \
              md-font-icon="{{ font.name }}" \
              aria-label="{{ font.name + font.size }}" \
              class="step" > \
          </md-icon> \
        ');

        expect(el.attr('md-font-icon')).toBe($scope.font.name);
        expect(el.hasClass('step')).toBe(true);
        expect(el.hasClass('material-icons')).toBe(true);
        expect(el.attr('aria-label')).toBe($scope.font.name + $scope.font.size);
        expect(el.attr('role')).toBe('img');
      });

    });

    describe('using font-icons with ligatures: md-font-set=""', function() {

      it('should render correct HTML with ligatures', function() {
        el = make( '<md-icon class="md-48">face</md-icon>');

        expect(el.text()).toEqual('face');
        expect(el.hasClass('material-icons')).toBeTruthy();
        expect(el.hasClass('md-48')).toBeTruthy();
      });

      it('should render correctly using a md-font-set alias', function() {
        $mdIconProvider.fontSet('fa', 'fontawesome');

        el = make( '<md-icon md-font-set="fa">email</md-icon>');

        expect(el.text()).toEqual('email');
        expect( clean(el.attr('class')) ).toEqual("fontawesome");
      });


      it('should render correctly using a md-font-set alias', function() {
        el = make( '<md-icon md-font-set="fa" md-font-icon="fa-info"></md-icon>');

        expect( clean(el.attr('class')) ).toEqual("md-font fa-info fa");
      });



      it('should render correctly using md-font-set value as class', function() {

        el = make( '<md-icon md-font-set="fontawesome">email</md-icon>');

        expect(el.text()).toEqual('email');
        expect( clean(el.attr('class')) ).toEqual("fontawesome");
      });
    });

    describe('using font-icons with classnames', function() {

      it('should auto-add the material-icons style', function() {
        el = make( '<md-icon>apple</md-icon>');

        expect(el.text()).toEqual('apple');
        expect(el.hasClass('material-icons')).toBeTruthy();
      });


      it('should render with icon classname', function() {
        el = make( '<md-icon class="custom-cake"></md-icon>');

        expect(el.text()).toEqual('');
        expect(el.hasClass('material-icons')).toBeTruthy();
        expect(el.hasClass('custom-cake')).toBeTruthy();
      });

      it('should support clearing default fontset', function() {
        $mdIconProvider.defaultFontSet('');

        el = make( '<md-icon class="custom-cake"></md-icon>');
        expect( clean(el.attr('class')) ).toEqual("custom-cake");

        el = make( '<md-icon class="custom-cake">apple</md-icon>');
        expect(el.text()).toEqual('apple');
        expect( clean(el.attr('class')) ).toEqual("custom-cake");

      });

      it('should support custom default fontset', function() {
        $mdIconProvider.defaultFontSet('fa');

        el = make( '<md-icon></md-icon>');
        expect( clean(el.attr('class')) ).toEqual("fa");

        el = make( '<md-icon md-font-icon="fa-apple">apple</md-icon>');
        expect(el.text()).toEqual('apple');
        expect( clean(el.attr('class')) ).toEqual("md-font fa-apple fa");

      });

      it('should support clearing an invalid font alias', function() {

        el = make( '<md-icon md-font-set="none" class="custom-cake"></md-icon>');
        expect(el.hasClass('none')).toBeTruthy();
        expect(el.hasClass('custom-cake')).toBeTruthy();

        el = make( '<md-icon md-font-set="none" class="custom-cake">apple</md-icon>');
        expect(el.text()).toEqual('apple');
        expect(el.hasClass('none')).toBeTruthy();
        expect(el.hasClass('custom-cake')).toBeTruthy();

      });
    });


  });

  describe('for SVGs: ', function () {

    beforeEach(function() {
      var $q;

      module(function($provide) {
        var $mdIconMock = function(id) {
          return {
            then: function(fn) {
              switch(id) {
                case 'android'      : fn('<svg><g id="android"></g></svg>');
                case 'cake'         : fn('<svg><g id="cake"></g></svg>');
                case 'android.svg'  : fn('<svg><g id="android"></g></svg>');
                case 'cake.svg'     : fn('<svg><g id="cake"></g></svg>');
                case 'image:android': fn('');
              }
            }
          }
        };
        $mdIconMock.fontSet = function() {
          return 'material-icons';
        };
        $provide.value('$mdIcon', $mdIconMock);
      });

      inject(function($rootScope, _$compile_, _$q_){
        $scope = $rootScope;
        $compile = _$compile_;
        $q = _$q_;
      });

    });

    describe('using md-svg-icon=""', function() {

      it('should update mdSvgIcon when attribute value changes', function() {
        $scope.iconName = 'android';
        el = make('<md-icon md-svg-icon="{{ iconName }}"></md-icon>');
        var iScope = el.isolateScope();
        expect(iScope.svgIcon).toEqual('android');
        $scope.iconName = 'cake';
        $scope.$digest();
        expect(iScope.svgIcon).toEqual('cake');
      });

      it('should not include a ng-transclude when using mdSvgIcon', function() {

        el = make('<md-icon md-svg-icon="image:android"></md-icon>');
        expect(el.html()).toEqual('');
      });


    });

    describe('using md-svg-src=""', function() {

      it('should update mdSvgSrc when attribute value changes', function() {
        $scope.url = 'android.svg';
        el = make('<md-icon md-svg-src="{{ url }}"></md-icon>');
        var iScope = el.isolateScope();
        expect(iScope.svgSrc).toEqual('android.svg');
        $scope.url = 'cake.svg';
        $scope.$digest();
        expect(iScope.svgSrc).toEqual('cake.svg');
      });

      it('should not include a ng-transclude when using mdSvgSrc', inject(function($templateCache) {
        $templateCache.put('img/android.svg', '');

        el = make('<md-icon md-svg-src="img/android.svg"></md-icon>');
        expect(el.html()).toEqual('');
      }));

    });

    describe('with ARIA support', function() {

      it('should apply aria-hidden="true" when parent has valid label', function() {
        el = make('<button aria-label="Android"><md-icon md-svg-icon="android"></md-icon></button>');
        expect(el.find('md-icon').attr('aria-hidden')).toEqual('true');

        el = make('<md-radio-button aria-label="avatar 2" role="radio"> '+
                    '<div class="md-container"></div> '+
                      '<div class="md-label"> '+
                      '<md-icon md-svg-icon="android"></md-icon> '+
                    '</div></md-radio-button>');

        expect(el.find('md-icon').attr('aria-hidden')).toEqual('true');
      });

      it('should apply aria-hidden="true" when parent has text content', function() {
        el = make('<button>Android <md-icon md-svg-icon="android"></md-icon></button>');
        expect(el.find('md-icon').attr('aria-hidden')).toEqual('true');
      });

      it('should apply aria-hidden="true" when aria-label is empty string', function() {
        el = make('<md-icon md-svg-icon="android" ></md-icon>');
        expect(el.attr('aria-label')).toEqual('android');
        expect(el.attr('aria-hidden')).toBeUndefined();
      });

      it('should apply use the aria-label value when set', function() {
        el = make('<md-icon md-svg-icon="android" aria-label="my android icon"></md-icon>');
        expect(el.attr('aria-label')).toEqual('my android icon');
      });

      it('should apply font-icon value to aria-label when aria-label not set', function() {
        el = make('<md-icon md-font-icon="android"></md-icon>');
        expect(el.attr('aria-label')).toEqual('android');
      });

      it('should apply svg-icon value to aria-label when aria-label not set', function() {
        el = make('<md-icon md-svg-icon="android"></md-icon>');
        expect(el.attr('aria-label')).toEqual('android');
      });

    });
  });



  // ****************************************************
  // Internal utility methods
  // ****************************************************

  function make(html) {
    var el;
    el = $compile(html)($scope);
    $scope.$digest();
    return el;
  }

  /**
   * Utility to remove extra attributes to the specs are easy to compare
   */
  function clean(style) {
    return style
        .replace(/ng-scope|ng-isolate-scope|md-default-theme/gi,'')
        .replace(/\s\s+/g,' ')
        .replace(/\s+\"/g,'"')
        .trim();
  }


});


describe('mdIcon service', function() {

  var $mdIcon;
  var $httpBackend;
  var $scope;
  var $mdIconProvider;

  beforeEach(module('material.core'));
  beforeEach(module('material.components.icon',function(_$mdIconProvider_){
    $mdIconProvider = _$mdIconProvider_;
    $mdIconProvider
      .icon('android'     , 'android.svg')
      .icon('c2'          , 'c2.svg')
      .icon('notfound'    ,'notfoundicon.svg')
      .iconSet('social'   , 'social.svg' )
      .iconSet('notfound' , 'notfoundgroup.svg' )
      .defaultIconSet('core.svg');
  }));

  beforeEach(inject(function($templateCache, _$httpBackend_, _$mdIcon_, $rootScope){
    $mdIcon = _$mdIcon_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope;
    $templateCache.put('android.svg', '<svg><g id="android"></g></svg>');
    $templateCache.put('social.svg' , '<svg><g id="s1"></g><g id="s2"></g></svg>');
    $templateCache.put('core.svg'   , '<svg><g id="c1"></g><g id="c2" class="core"></g></svg>');
    $templateCache.put('c2.svg'     , '<svg><g id="c2" class="override"></g></svg>');

    $httpBackend.whenGET('notfoundgroup.svg').respond(404, 'Cannot GET notfoundgroup.svg');
    $httpBackend.whenGET('notfoundicon.svg').respond(404, 'Cannot GET notfoundicon.svg');

  }));

  describe('should configure fontSets',function() {

    it('with Material Icons by default', function () {
      expect($mdIcon.fontSet()).toBe('material-icons');
    });

    it('with register multiple font-sets', function () {

      $mdIconProvider.defaultFontSet('fontawesome');
      $mdIconProvider.fontSet('mi', 'material-icons');
      $mdIconProvider.fontSet('ic', 'icomoon');

      expect($mdIcon.fontSet()).toBe('fontawesome');
      expect($mdIcon.fontSet('mi')).toBe('material-icons');
      expect($mdIcon.fontSet('ic')).toBe('icomoon');
    });

  });

  describe('when using SVGs and ', function () {

    describe('$mdIcon() is passed an icon ID', function() {

      it('should append configured SVG single icon', function() {
        var expected = updateDefaults('<svg><g id="android"></g></svg>');
        $mdIcon('android').then(function(el) {
          expect(el.outerHTML).toEqual(expected);
        });
        $scope.$digest();
      });

      it('should append configured SVG icon from named group', function() {
        var expected = updateDefaults('<svg xmlns="http://www.w3.org/2000/svg"><g id="s1"></g></g></svg>');
        $mdIcon('social:s1').then(function(el) {
          expect(el.outerHTML).toEqual(expected);
        });
        $scope.$digest();
      });

      it('should append configured SVG icon from default group', function() {
        var expected = updateDefaults('<svg xmlns="http://www.w3.org/2000/svg"><g id="c1"></g></g></svg>');
        $mdIcon('c1').then(function(el) {
          expect(el.outerHTML).toEqual(expected);
        });
        $scope.$digest();
      });

      it('should allow single icon defs to override those defined in groups', function() {
        $mdIcon('c2').then(function(el) {
          var list = el.querySelector('g').classList;

          if ( list ) {
            // classList is a part of HTMLElement, but isn't available for SVGElement
            expect(list.contains('override')).toBe(true);
          }

        });

        $scope.$digest();
      });

    });

    describe('$mdIcon() is passed a URL', function() {

      it('should return correct SVG markup', function() {
        $mdIcon('android.svg').then(function(el) {
          expect(el.outerHTML).toEqual( updateDefaults('<svg><g id="android"></g></svg>') );
        })
        $scope.$digest();
      });

    });

    describe('icon set URL is not found', function() {
      it('should log Error', function() {
        var msg;
        try {
          $mdIcon('notconfigured')
            .catch(function(error){
              msg = error;
            });

          $scope.$digest();
        } finally {
          expect(msg).toEqual('icon $default:notconfigured not found');
        }
      });
    });

    describe('icon group is not found', function() {
      it('should log Error', function() {
        var msg;
        try {
          $mdIcon('notfound:someIcon')
            .catch(function(error){
              msg = error;
            });

          $httpBackend.flush();
        } finally {
          expect(msg).toEqual('Cannot GET notfoundgroup.svg');
        }
      });
    });

    describe('icon is not found', function() {
      it('should not throw Error', function() {
        expect(function(){
          $mdIcon('notfound');

          $httpBackend.flush();
        }).not.toThrow();
      });
    });
  });


  function updateDefaults(svg) {
    svg = angular.element(svg)[0];

    svg.removeAttribute('id');
    angular.forEach(svg.querySelectorAll('[id]'), function(item) {
      item.removeAttribute('id');
    });

    angular.forEach({
      'xmlns' : 'http://www.w3.org/2000/svg',
      'fit'   : '',
      'height': '100%',
      'width' : '100%',
      'preserveAspectRatio': 'xMidYMid meet',
      'viewBox' : svg.getAttribute('viewBox') || '0 0 24 24',
      'focusable': false
    }, function(val, attr) {
      svg.setAttribute(attr, val);
    }, this);

    return svg.outerHTML;
  }

});
