describe('_md-autofocus', function() {
  var $rootScope, pageScope, element;

  beforeEach(module('material.core'));
  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  describe('add/removes the proper classes', function() {
    it('supports true', function() {
      build('<input id="test" type="text" md-autofocus="true">');

      expect(element).toHaveClass('_md-autofocus');
    });

    it('supports false', function() {
      build('<input id="test" type="text" md-autofocus="false">');

      expect(element).not.toHaveClass('_md-autofocus');
    });

    it('supports variables', function() {
      build('<input id="test" type="text" md-autofocus="shouldAutoFocus">');

      // By default, we assume an undefined value for the expression is true
      expect(element).toHaveClass('_md-autofocus');

      // Set the expression to false
      pageScope.$apply('shouldAutoFocus=false');
      expect(element).not.toHaveClass('_md-autofocus');

      // Set the expression to true
      pageScope.$apply('shouldAutoFocus=true');
      expect(element).toHaveClass('_md-autofocus');
    });

    it('supports expressions', function() {
      build('<input id="test" type="text" md-autofocus="shouldAutoFocus==1">');

      // By default, the expression should be false
      expect(element).not.toHaveClass('_md-autofocus');

      // Make the expression false
      pageScope.$apply('shouldAutoFocus=0');
      expect(element).not.toHaveClass('_md-autofocus');

      // Make the expression true
      pageScope.$apply('shouldAutoFocus=1');
      expect(element).toHaveClass('_md-autofocus');
    });
  });

  function build(template) {
    inject(function($compile) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);

      pageScope.$apply();
    });
  }
});