describe('MdIcon directive', function() {
  var el, $scope, $compile, $mdIconProvider, $sce;
  var wasLastSvgSrcTrusted = false;

  beforeEach(module('material.components.icon', function(_$mdIconProvider_) {
    $mdIconProvider = _$mdIconProvider_;
  }));

  afterEach(function() {
    $mdIconProvider.defaultFontSet('material-icons');
    $mdIconProvider.fontSet('fa', 'fa');
  });


  describe('for font-icons:', function () {

    beforeEach(inject(function($rootScope, _$compile_) {
      $scope = $rootScope;
      $compile = _$compile_;
    }));


    describe('using font-icons with deprecated md-font-icon=""', function() {

      it('should render correct HTML with md-font-icon value as class', function() {
        el = make( '<md-icon md-font-icon="android"></md-icon>');

        expect(el.html()).toEqual('');
        var classes = clean(el.attr('class'));
        expect(classes).toContain('md-font');
        expect(classes).toContain('android');
        expect(classes).toContain('material-icons');
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
          color: '#777',
          size: 48
        };

        el = make(
          '<md-icon ' +
              'md-font-icon="{{ font.name }}" ' +
              'aria-label="{{ font.name + font.size }}" ' +
              'class="step">' +
          '</md-icon>'
        );

        expect(el.attr('md-font-icon')).toBe($scope.font.name);
        expect(el.hasClass('step')).toBe(true);
        expect(el.hasClass('material-icons')).toBe(true);
        expect(el.attr('aria-label')).toBe($scope.font.name + $scope.font.size);
        expect(el.attr('role')).toBe('img');
      });

      it('should remove old icon class and apply the new when icon changed.',function() {
        $scope.font = 'icon-home';

        el = make('<md-icon md-font-icon="{{ font }}" ></md-icon>');

        expect(el.attr('md-font-icon')).toBe($scope.font);
        expect(el.hasClass('icon-home')).toBeTruthy();

        $scope.font = 'android';
        $scope.$apply();

        expect(el.hasClass('icon-home')).toBeFalsy();
        expect(el.attr('md-font-icon')).toBe($scope.font);
        expect(el.hasClass('android')).toBeTruthy();
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
        expect( clean(el.attr('class')) ).toEqual('fontawesome');
      });

      it('should remove old font set class and apply the new when set changed', function() {
        $scope.set = 'fontawesome';

        el = make( '<md-icon md-font-set="{{ set }}">email</md-icon>');

        expect(el.text()).toEqual('email');
        expect( clean(el.attr('class')) ).toEqual('fontawesome');

        $scope.set = 'material-icons';
        $scope.$apply();

        expect( clean(el.attr('class')) ).toEqual('material-icons');
      });

      it('should render correctly using a md-font-set alias', function() {
        el = make( '<md-icon md-font-set="fa" md-font-icon="fa-info"></md-icon>');

        var classes = clean(el.attr('class'));
        expect(classes).toContain('md-font');
        expect(classes).toContain('fa-info');
        expect(classes).toContain('fa');
      });

      it('should render correctly using md-font-set value as class', function() {

        el = make( '<md-icon md-font-set="fontawesome">email</md-icon>');

        expect(el.text()).toEqual('email');
        expect( clean(el.attr('class')) ).toEqual('fontawesome');
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
        expect( clean(el.attr('class')) ).toEqual('custom-cake');

        el = make( '<md-icon class="custom-cake">apple</md-icon>');
        expect(el.text()).toEqual('apple');
        expect( clean(el.attr('class')) ).toEqual('custom-cake');

      });

      it('should support custom default fontset', function() {
        $mdIconProvider.defaultFontSet('fa');

        el = make( '<md-icon></md-icon>');
        expect( clean(el.attr('class')) ).toEqual('fa');

        el = make( '<md-icon md-font-icon="fa-apple">apple</md-icon>');
        expect(el.text()).toEqual('apple');

        var classes = clean(el.attr('class'));
        expect(classes).toContain('md-font');
        expect(classes).toContain('fa-apple');
        expect(classes).toContain('fa');

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
                case 'android'          : fn('<svg><g id="android"></g></svg>');
                  break;
                case 'cake'             : fn('<svg><g id="cake"></g></svg>');
                  break;
                case 'android.svg'      : fn('<svg><g id="android"></g></svg>');
                  break;
                case 'cake.svg'         : fn('<svg><g id="cake"></g></svg>');
                  break;
                case 'image:android'    : fn('');
                  break;
                default                 :
                  if (/^data:/.test(id)) {
                    fn(window.atob(id.split(',')[1]));
                  }
              }
            }
          };
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
        expect(el.attr('md-svg-icon')).toEqual('android');
        $scope.iconName = 'cake';
        $scope.$digest();
        expect(el.attr('md-svg-icon')).toEqual('cake');
      });

      it('should not include a ng-transclude when using mdSvgIcon', function() {

        el = make('<md-icon md-svg-icon="image:android"></md-icon>');
        expect(el.html()).toEqual('');
      });
    });

    describe('using md-svg-src=""', function() {

      beforeEach(inject(function(_$sce_) {
        $sce = _$sce_;
      }));

      it('should update mdSvgSrc when attribute value changes', function() {
        $scope.url = 'android.svg';
        el = make('<md-icon md-svg-src="{{ url }}"></md-icon>');
        expect(el.attr('md-svg-src')).toEqual('android.svg');
        $scope.url = 'cake.svg';
        $scope.$digest();
        expect(el.attr('md-svg-src')).toEqual('cake.svg');
      });

      it('should not include a ng-transclude when using mdSvgSrc', inject(function($templateCache) {
        $templateCache.put('img/android.svg', '');

        el = make('<md-icon md-svg-src="img/android.svg"></md-icon>');
        expect(el.html()).toEqual('');
      }));

      describe('with a data URL', function() {
        it('should set mdSvgSrc from a function expression', inject(function() {
          var svgData = '<svg><g><circle cx="100" cy="100" r="50"></circle></g></svg>';
          $scope.getData = function() {
            return 'data:image/svg+xml;base64,' + window.btoa(svgData);
          };
          el = make('<md-icon md-svg-src="{{ getData() }}"></md-icon>')[0];
          $scope.$digest();

          // Notice that we only compare the tag names here.
          // Checking the innerHTML to be the same as the svgData variable is not working, because
          // some browsers (like IE) are swapping some attributes, adding an SVG namespace etc.
          expect(el.firstElementChild.tagName).toBe('svg');
          expect(el.firstElementChild.firstElementChild.tagName).toBe('g');
          expect(el.firstElementChild.firstElementChild.firstElementChild.tagName).toBe('circle');
        }));
      });
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


describe('MdIcon service', function() {

  var $mdIcon;
  var $httpBackend;
  var $scope;
  var $mdIconProvider;

  beforeEach(module('material.components.icon', function(_$mdIconProvider_) {
    $mdIconProvider = _$mdIconProvider_;
    $mdIconProvider
      .icon('android'           , 'android.svg')
      .icon('c2'                , 'c2.svg')
      .iconSet('social'         , 'social.svg' )
      .iconSet('emptyIconSet'   , 'emptyGroup.svg' )
      .defaultIconSet('core.svg');

    $mdIconProvider.icon('missingIcon', 'notfoundicon.svg');
  }));

  beforeEach(inject(function($templateCache, _$httpBackend_, _$mdIcon_, $rootScope) {
    $mdIcon = _$mdIcon_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope;

    $templateCache.put('android.svg'    , '<svg><g id="android"></g></svg>');
    $templateCache.put('social.svg'     , '<svg><g id="s1"></g><g id="s2"></g></svg>');
    $templateCache.put('core.svg'       , '<svg><g id="c1"></g><g id="c2" class="core"></g></svg>');
    $templateCache.put('c2.svg'         , '<svg><g id="c2" class="override"></g></svg>');
    $templateCache.put('emptyGroup.svg' , '<svg></svg>');

  }));

  describe('should configure fontSets', function() {

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
        });
        $scope.$digest();
      });

      describe('and the URL is a data URL', function() {
        var svgData = '<svg><g><circle r="50" cx="100" cy="100"></circle></g></svg>';

        describe('and the data is base64 encoded', function() {
          it('should return correct SVG markup', function() {
            var data = 'data:image/svg+xml;base64,' + btoa(svgData);
            $mdIcon(data).then(function(el) {
              expect(el.outerHTML).toEqual( updateDefaults(svgData) );
            });
            $scope.$digest();
          });
        });

        describe('and the data is un-encoded', function() {
          it('should return correct SVG markup', function() {
            var data = 'data:image/svg+xml,' + svgData;
            $mdIcon(data).then(function(el) {
              expect(el.outerHTML).toEqual( updateDefaults(svgData) );
            });
            $scope.$digest();
          });
        });
      });
    });

    describe('icon set URL is not found', function() {
      it('should log Error', function() {
        var msg;
        try {
          $mdIcon('notconfigured')
            .catch(function(error) {
              msg = error;
            });

          $scope.$digest();
        } finally {
          expect(msg).toEqual('icon $default:notconfigured not found');
        }
      });
    });

    describe('icon is cached', function() {

      it('should prevent duplicate ids', function() {
        var firstId;

        $mdIcon('android.svg').then(function(el) {
          // First child is in our case always the node with an id.
          firstId = el.firstChild.id;
        });

        $scope.$digest();

        $mdIcon('android.svg').then(function(el) {
          expect(el.firstChild.id).not.toBe(firstId);
        });

        $scope.$digest();

      });

      it('should suffix duplicated ids', function() {
        // Just request the icon to be stored in the cache.
        $mdIcon('android.svg');

        $scope.$digest();

        $mdIcon('android.svg').then(function(el) {
          expect(el.firstChild.id).toMatch(/.+_cache[0-9]+/g);
        });

        $scope.$digest();
      });
    });

    describe('icon in a group is not found', function() {

      it('should log Error and reject', inject(function($log, $timeout) {
        var ERROR_ICON_NOT_FOUIND_ICONSET = 'icon emptyIconSet:someIcon not found';
        var caughtRejection = false;

        $mdIcon('emptyIconSet:someIcon')
          .catch(function(error) {
            caughtRejection = true;
            expect(error).toBe( ERROR_ICON_NOT_FOUIND_ICONSET );
          });
        $timeout.flush();

        expect(caughtRejection).toBe(true);
        expect($log.warn.logs[0]).toEqual([ERROR_ICON_NOT_FOUIND_ICONSET]);
      }));
    });

    describe('icon is not found', function() {
      it('should log Error and reject', inject(function($log) {
        var ERROR_ICON_NOT_FOUND = 'Cannot GET notfoundicon.svg';
        var caughtRejection = false;

        // $mdIconProvider.icon('missingIcon', 'notfoundicon.svg');
        $httpBackend.whenGET('notfoundicon.svg').respond(404, ERROR_ICON_NOT_FOUND);

        $mdIcon('missingIcon')
          .catch(function(error) {
            expect(error.data).toBe(ERROR_ICON_NOT_FOUND);
            caughtRejection = true;
          });

        $httpBackend.flush();

        expect(caughtRejection).toBe(true);
        expect($log.warn.logs[0]).toEqual([ERROR_ICON_NOT_FOUND]);
      }));
    });
  });


  function updateDefaults(svg) {
    svg = angular.element(svg)[0];

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
