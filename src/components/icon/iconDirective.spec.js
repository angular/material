describe('mdIcon directive', function() {
  var el;
  var $scope;
  var $compile;

  beforeEach(module('material.core'));
  beforeEach(module('material.components.icon'));
  beforeEach(function() {
    var $q;

    module(function($provide) {
      $provide.value('$mdIcon', function $mdIconMock(id) {

            function getIcon(id) {
              switch(id) {
                case 'android'    : return '<svg><g id="android"></g></svg>';
                case 'cake'       : return '<svg><g id="cake"></g></svg>';
                case 'android.svg': return '<svg><g id="android"></g></svg>';
                case 'cake.svg'   : return '<svg><g id="cake"></g></svg>';
              }
            }

          return $q(function(resolve){
             resolve(getIcon(id));
          });
        });
    });

    inject(function($rootScope, _$compile_, _$q_){
      $scope = $rootScope;
      $compile = _$compile_;
      $q = _$q_;
    });

  });


  describe('using font-icons with classnames: md-font-icon=""', function() {

    it('should render correct HTML with md-font-icon value as class', function() {
      el = make( '<md-icon md-font-icon="android"></md-icon>');
      expect(el.html()).toEqual('<span class="md-font  android" ng-class="fontIcon"></span>');
    });

    it('should transclude class specifiers', function() {
      el = make( '<md-icon md-font-icon="android" class="material-icons"></md-icon>');
      expect(el.html()).toEqual('<span class="md-font material-icons android" ng-class="fontIcon"></span>');
    });

    it('should not render any inner content if the md-font-icon value is empty', function() {
      el = make( '<md-icon md-font-icon=""></md-icon>' );
      expect(el.html()).toEqual('');
    });

  });

  describe('using font-icons with ligatures: md-font-library=""', function() {

    it('should render correct HTML with ligature and md-font-library value as class', function() {
      el = make( '<md-icon md-font-library="material-icons" class="md-48">face</md-icon>');

      expect(el.html()).toEqual('<span ng-transclude=""><span class="ng-scope">face</span></span>');
      expect(el.attr('class').indexOf('material-icons md-48')).toBeGreaterThan(-1);
    });

    it('should render correct HTML without aria-label', function() {
      el = make( '<md-icon md-font-library="material-icons">face</md-icon>');
      expect(el.html().indexOf('aria-label')).toEqual(-1);
    });

    it('should render correct HTML without aria-hidden', function() {
      el = make( '<md-icon md-font-library="material-icons">face</md-icon>');
      expect(el.html().indexOf('aria-hidden')).toEqual(-1);
    });

    it('should render correct HTML without role attribute', function() {
      el = make( '<md-icon md-font-library="material-icons">face</md-icon>');
      expect(el.html().indexOf('role')).toEqual(-1);
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

    it('should apply aria-hidden="true" when alt is empty string', function() {
      el = make('<md-icon md-svg-icon="android" alt=""></md-icon>');
      expect(el.attr('aria-hidden')).toEqual('true');
    });

    it('should apply alt value to aria-label when set', function() {
      el = make('<md-icon md-svg-icon="android" alt="my android icon"></md-icon>');
      expect(el.attr('aria-label')).toEqual('my android icon');
    });

    it('should apply font-icon value to aria-label when alt not set', function() {
      el = make('<md-icon md-font-icon="android"></md-icon>');
      expect(el.attr('aria-label')).toEqual('android');
    });

    it('should apply svg-icon value to aria-label when alt not set', function() {
      el = make('<md-icon md-svg-icon="android"></md-icon>');
      expect(el.attr('aria-label')).toEqual('android');
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


});
