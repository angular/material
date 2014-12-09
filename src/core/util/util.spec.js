describe('util', function() {
  beforeEach(module('material.core'));

  describe('re-/disconectScope()', function() {
    var disconnectScope, reconnectScope;
    beforeEach(inject(function($mdUtil) {
      disconnectScope = $mdUtil.disconnectScope;
      reconnectScope = $mdUtil.reconnectScope;
    }));

    it('re-/disconnects scope to/from the event chain', inject(function($rootScope) {
      var scope1 = $rootScope.$new();

      var spy = jasmine.createSpy('eventSpy');
      scope1.$on('event', spy);

      disconnectScope(scope1);

      $rootScope.$broadcast('event');
      expect(spy).not.toHaveBeenCalled();

      reconnectScope(scope1);

      $rootScope.$broadcast('event');
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('replaceInterpolationSymbols()', function() {
    beforeEach(module(function($interpolateProvider) {
      $interpolateProvider.startSymbol('[[').endSymbol(']]');
    }));

    var replaceInterpolationSymbols;
    beforeEach(inject(function($mdUtil) {
      replaceInterpolationSymbols = $mdUtil.replaceInterpolationSymbols;
    }));

    it('replaces default interpolation symbols with actual', function() {
      var tmpl1 = 'Template 1';
      var tmpl2 = '[[ Template 2 ]]';
      var tmpl3 = '(( Template 3 ))';
      var tmpl4 = '{{ Template 4 }}';
      var tmpl5 = '{ { Template 5 } }';
      var tmpl6 = '[[ {{ Template }} {{ 6 }} ]]';
      var tmpl7 = '[[ {{ Template ]] }} {{ [[ 7 }} ]]';

      expect(replaceInterpolationSymbols(tmpl1)).toBe('Template 1');
      expect(replaceInterpolationSymbols(tmpl2)).toBe('[[ Template 2 ]]');
      expect(replaceInterpolationSymbols(tmpl3)).toBe('(( Template 3 ))');
      expect(replaceInterpolationSymbols(tmpl4)).toBe('[[ Template 4 ]]');
      expect(replaceInterpolationSymbols(tmpl5)).toBe('{ { Template 5 } }');
      expect(replaceInterpolationSymbols(tmpl6)).toBe('[[ [[ Template ]] [[ 6 ]] ]]');
      expect(replaceInterpolationSymbols(tmpl7)).toBe('[[ [[ Template ]] ]] [[ [[ 7 ]] ]]');
    });

    it('should not operate on `text` when interpolation symbols are the default', inject(
      function($interpolate, $mdConstant) {
        var originalSplit = String.prototype.split;

        var tmpl = 'Template';
        spyOn(String.prototype, 'split').andCallThrough();

        // Different startSymbol, different endSymbol
        replaceInterpolationSymbols(tmpl);

        expect(String.prototype.split).toHaveBeenCalled();
        expect(String.prototype.split.callCount).toBe(2);

        // Same startSymbol, different endSymbol
        $mdConstant.INTERPOLATION_SYMBOLS.START = $interpolate.startSymbol();
        replaceInterpolationSymbols(tmpl);

        expect(String.prototype.split.callCount).toBe(3);

        // Same startSymbol, same endSymbol
        $mdConstant.INTERPOLATION_SYMBOLS.END = $interpolate.endSymbol();
        replaceInterpolationSymbols(tmpl);

        expect(String.prototype.split.callCount).toBe(3);

        String.prototype.split = originalSplit;
      }
    ));
  });
});
