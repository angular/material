describe('mdIcon directive', function() {
  var el;
  var $scope;
  var $compile;
  var $q;

  beforeEach(module('material.core'));
  beforeEach(module('material.components.icon'));

  var mockIconSvc = function(id) {
    var deferred = $q.defer();

    function getIcon(id) {
      switch(id) {
        case 'android': return '<svg><g id="android"></g></svg>';
        case 'cake': return '<svg><g id="cake"></g></svg>';
        case 'android.svg': return '<svg><g id="android"></g></svg>';
        case 'cake.svg': return '<svg><g id="cake"></g></svg>';
      }
    }

    deferred.resolve(getIcon(id));
    return deferred.promise;
  }

  function make(html) {
    var el;
    el = $compile(html)($scope);
    $scope.$digest();
    return el;
  }

  beforeEach(function() {
    module(function($provide) {
      $provide.value('$mdIcon', mockIconSvc);
    });

    inject(function($rootScope, _$compile_, _$q_){
      $scope = $rootScope;
      $compile = _$compile_;
      $q = _$q_;
    });
  });


  describe('using md-font-icon=""', function() {

    it('should render correct HTML with md-font-icon value as class', function() {
      el = make( '<md-icon md-font-icon="android"></md-icon>');
      expect(el.html()).toEqual('<span class="md-font android" ng-class="fontIcon"></span>');
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

});
