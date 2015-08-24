describe('$mdStickySpec', function() {
  var $document, $compile, $rootScope, $mdSticky, $mdConstant, $featureSupport, $container, $scope;

  beforeEach(function() {
    jasmine.addMatchers({
      toTranslateVerticalPositionBy: translateMatcher
    });
  });

  beforeEach(module('material.components.sticky'));
  beforeEach(function() {
    $featureSupport = jasmine.createSpyObj('featureSupport', ['sticky']);
    module(function($provide) {
      $provide.value('$featureSupport', $featureSupport);
    });
  });

  beforeEach(inject(function(_$document_, _$compile_, _$rootScope_, _$mdConstant_) {
    $document = _$document_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $mdConstant = _$mdConstant_;
  }));

  describe("when a sticky is registered outside of a md-context", function() {
    beforeEach(inject(function(_$mdSticky_) {
      $mdSticky = _$mdSticky_;
    }));

    it('throws an error to indicate inproper usage', inject(function($mdSticky, $compile, $rootScope) {
      var html = '<h2>Hello world!</h2>';
      function useWithoutMdContent() {
        $mdSticky($rootScope.$new(), angular.element(html));
      }
      expect(useWithoutMdContent).toThrow('$mdSticky used outside of md-content');
    }));

  });

  describe("using mdSticky with a browser that supports 'sticky'", function() {
    var $stickySpy;
    beforeEach(function() {
      $featureSupport.sticky.and.returnValue('sticky');
    });

    beforeEach(inject(function(_$mdSticky_) {
      $mdSticky = _$mdSticky_;
    }));

    beforeEach(function() {
      $scope = $rootScope.$new();
      $container = fixture($scope); //Does not really matter if we attach to the dom here

      $stickySpy = jasmine.createSpyObj('sticky element', ['css', 'controller']);
      $stickySpy.controller.and.returnValue($container);

      $mdSticky($scope, $stickySpy);

      $scope.$digest();
    });

    it('enables sticky on the element', function() {
      expect($stickySpy.css).toHaveBeenCalledWith({
        position: 'sticky',
        top: 0,
        'z-index': 2
      });
    });
  });

  describe("using a sticky with a browser without 'sticky' support", function() {

    beforeEach(function() {
      $featureSupport.sticky.and.returnValue(undefined);
    });

    beforeEach(inject(function(_$mdSticky_) {
      $mdSticky = _$mdSticky_;
    }));

    var $firstSticky, $secondSticky, $sticky;
    describe("when elements are registered as sticky within a md-context", function() {

      beforeEach(function() {
        $scope = $rootScope.$new();

        $firstSticky = angular.element('<h2>First Sticky</h2>');
        $secondSticky = angular.element('<h2>Second Sticky</h2>');

        var stickies = [$firstSticky, $secondSticky];

        $container = fixture($scope, stickies);

        $firstSticky.controller('mdContent').$element = $container;

        $document.find('body').html('');
        //Applying position absolute mimics exactly how this works in real life
        //Making body relative seems to be a hack, there is code to deal with repositioning that is not being flexed by doing this
        $document.find('head').append("<style>body { position: relative; } .md-sticky-clone { position: absolute; }</style>")
        $document.find('body').append($container);


        for ( var i = 0; i < stickies.length; i++) {
          $mdSticky($scope, stickies[i]);
        }

        $scope.$digest();
      });

      it('appends cloned sticky elements to the outside of the content', function() {
        expect(cloned(0).hasClass('md-sticky-clone')).toBe(true);
        expect(cloned(1).hasClass('md-sticky-clone')).toBe(true);
      });

      it('positions the sticky clone top to the starting offset of the container', function() {
        var expected = $container.prop('offsetTop') + 'px';

        expect(cloned(0).css('top')).toBe(expected);
        expect(cloned(1).css('top')).toBe(expected);
      });

      it('applies a sum of the offset left of relative elements as the left margin to the sticky clone', function() {
        //Since the spec is setup to use a relative positioned container, the margin is 0.  Without applying the css
        //there was not a reasonable way to determine the summed margin from the parent elements
        var expected = '0px';
        expect(cloned(0).css('margin-left')).toBe(expected);
        expect(cloned(1).css('margin-left')).toBe(expected);
      });

      it('leaves the original elements defined as sticky alone', function() {
        expect(original(0)).toEqual($firstSticky);
        expect(original(1)).toEqual($secondSticky);
      });

      it('sets the initial state of the registered stickies', function() {
        expect(original(0).attr('sticky-state')).toBe('next');
        expect(original(1).attr('sticky-state')).toBeUndefined();

        expect(cloned(1).attr('sticky-state')).toBe('next');
        expect(cloned(0).attr('sticky-state')).toBeUndefined();
      });

      describe('and scrolling begins', function() {

        beforeEach(function() {
          $container.triggerHandler('$scrollstart');
          scrollTo(1);
        });

        it('changes the next sticky to the active sticky', function() {
          expect(cloned(0).attr('sticky-state')).toBe('next');
          expect(cloned(1).attr('sticky-state')).toBe('active');
        });

        it('changes the next sticky to the next sticky', function() {
          expect(cloned(1).attr('sticky-prev-state')).toBe('next');
        });

        describe('while scrolling through a transition from one sticky to the next', function() {

          var nextSticky;
          beforeEach(function() {
            nextSticky = {
              offsetTop: original(1).prop('offsetTop'),
              offsetHeight: original(1).prop('offsetHeight')
            };

          });

          it('pushes the current sticky off the page with the correct offset', function() {
            for(var height = nextSticky.offsetHeight; height > 0; height--) {

              scrollTo(nextSticky.offsetTop - height);

              expect(original(1).attr('sticky-state')).toBe('next');
              expect(original(0).attr('sticky-state')).toBe('active');

              expect(cloned(0).attr('sticky-state')).toBe('next');
              expect(cloned(1).attr('sticky-state')).toBe('active');

              var expected = height - nextSticky.offsetHeight;
              expect(cloned(1).css($mdConstant.CSS.TRANSFORM)).toTranslateVerticalPositionBy(expected);
            }
          });

        });

        describe('and scrolls to the top of the next sticky', function() {

          beforeEach(function() {
            var topOfNextSticky = original(1).prop('offsetTop');

            scrollTo(topOfNextSticky);
          });

          it('changes the state of the current element to be previous', function(){
            expect(original(0).attr('sticky-state')).toBe('prev');
            expect(original(1).attr('sticky-state')).toBe('active');

            expect(cloned(1).attr('sticky-state')).toBe('prev');
            expect(cloned(0).attr('sticky-state')).toBe('active');
          });

          it('changes the previous state for the elements', function() {
            expect(original(0).attr('sticky-prev-state')).toBe('active');
            expect(original(1).attr('sticky-prev-state')).toBe('next');

            expect(cloned(1).attr('sticky-prev-state')).toBe('active');
            expect(cloned(0).attr('sticky-prev-state')).toBe('next');
          });

          it('starts pushing the current sticky', function() {
            expect(cloned(1).css($mdConstant.CSS.TRANSFORM)).toBe('');
          });

        });

        describe('and scrolls past the next sticky and back again', function() {

          var stickyHeight;
          beforeEach(function() {
            var topOfNextSticky = original(1).prop('offsetTop');
            stickyHeight = original(1).prop('offsetHeight');

            scrollTo(topOfNextSticky);
            scrollTo(topOfNextSticky - 1);
          });

          it('changes the state of the current sticky', function() {
            expect(original(0).attr('sticky-state')).toBe('active');
            expect(original(1).attr('sticky-state')).toBe('next');

            expect(cloned(1).attr('sticky-state')).toBe('active');
            expect(cloned(0).attr('sticky-state')).toBe('next');
          });

          it('changes the state of the next sticky', function() {
            expect(original(0).attr('sticky-prev-state')).toBe('prev');
            expect(original(1).attr('sticky-prev-state')).toBe('active');

            expect(cloned(1).attr('sticky-prev-state')).toBe('prev');
            expect(cloned(0).attr('sticky-prev-state')).toBe('active');
          });

          it('translates the current sticky position', function() {
            var expected = -(stickyHeight - 1);
            expect(cloned(1).css($mdConstant.CSS.TRANSFORM)).toTranslateVerticalPositionBy(-(stickyHeight - 1));
          });

        });


        describe('while scrolling through a transition from one sticky to the next', function() {

          var nextSticky;
          beforeEach(function() {
            nextSticky = {
              offsetTop: original(1).prop('offsetTop'),
              offsetHeight: original(1).prop('offsetHeight')
            };

          });

          it('pushes the current sticky off the page with the correct offset', function() {
            for(var height = 1; height < nextSticky.offsetHeight; height++) {

              scrollTo(nextSticky.offsetTop - height);

              expect(original(1).attr('sticky-state')).toBe('next');
              expect(original(0).attr('sticky-state')).toBe('active');

              expect(cloned(0).attr('sticky-state')).toBe('next');
              expect(cloned(1).attr('sticky-state')).toBe('active');

              var expected = -(nextSticky.offsetHeight - height);

              expect(cloned(1).css($mdConstant.CSS.TRANSFORM)).toTranslateVerticalPositionBy(expected);
            }
          });

        });

        describe('when the scope is destroyed', function() {

          beforeEach(function() {
            $scope.$emit('$destroy')
          });

          it('should remove the cloned stickies', function() {
            var children = $container.parent().children();
            expect(children.length).toBe(1);
            expect(children.eq(0)).not.toBe($firstSticky);
            expect(children.eq(0)).not.toBe($secondSticky);
          });
        });

        describe('and is scrolled back to the start', function() {

          beforeEach(function() {
            scrollTo(0);
          });

          it('changes the current sticky back to the next sticky', function() {
            expect(cloned(1).attr('sticky-state')).toBe('next');
          });

          it('changes the previous state for the current sticky to be active', function() {
            expect(cloned(1).attr('sticky-prev-state')).toBe('active');
          });

        });

      });

    });
  });

  function fixture(scope, stickies) {
    stickies = stickies || [];
    var container = $compile('<md-content></md-content>')(scope);

    for ( var i = 0; i < stickies.length; i++) {
      container.append(stickies[i]);
    }

    return container;
  }

  function cloned(index) {
    return $container.parent().children().eq(index);
  }

  function original(index) {
    return $container.children().eq(index);
  }

  function scrollTo(scrollTop) {
    var originalProp = $container.prop;
    $container.prop = function(prop) {
      if(prop == 'scrollTop') {
        return scrollTop;
      } else {
        originalProp.call($container, prop);
      }
    };

    $container[0].scrollTop = scrollTop;
    $container.triggerHandler('$scroll');
  }

  function translateMatcher() {
    return {
      compare: function(actual, expected) {
        var chrome = 'translate3d(0px, ' + expected + 'px, 0px)';
        var safari = 'translate3d(0px, ' + expected + 'px, 0)';
        var firefox = 'matrix(1, 0, 0, 1, 0, ' + expected + ')';

        var possibleMatches = [chrome, safari, firefox];

        for( var i = 0; i < possibleMatches.length; i++) {
          if (actual === possibleMatches[i]) {
            return { pass: true }
          }
        }

        var message = '';
        message += "Expected '";
        message += actual;
        message += "' to match one of the possible css values: ";
        message += JSON.stringify(possibleMatches);

        return {
          pass: false,
          message: message
        };
      }
    }
  }
});
