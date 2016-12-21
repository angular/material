describe('md-autofocus', function() {
  var $rootScope, pageScope, element;

  beforeEach(module('material.core'));
  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  describe('add/removes the proper classes', function() {

    it('supports true', function() {
      build('<input id="test" type="text" md-autofocus="true">');

      expect(element).toHaveClass('md-autofocus');
    });

    it('supports false', function() {
      build('<input id="test" type="text" md-autofocus="false">');

      expect(element).not.toHaveClass('md-autofocus');
    });

    it('supports variables', function() {
      build('<input id="test" type="text" md-autofocus="shouldAutoFocus">');

      // By default, we assume an undefined value for the expression is true
      expect(element).toHaveClass('md-autofocus');

      // Set the expression to false
      pageScope.$apply('shouldAutoFocus=false');
      expect(element).not.toHaveClass('md-autofocus');

      // Set the expression to true
      pageScope.$apply('shouldAutoFocus=true');
      expect(element).toHaveClass('md-autofocus');
    });

    it('should properly set the class at initialization', inject(function($compile, $rootScope) {
      pageScope = $rootScope.$new();
      element = $compile('<input md-autofocus>')(pageScope);

      expect(element).toHaveClass('md-autofocus');
    }));

    it('does not accidentally toggle the class', function() {
      build('<input md-autofocus="autofocus">');

      // By default, we assume an empty value for the expression is true
      expect(element).toHaveClass('md-autofocus');

      // Trigger a second digest, to be able to set the scope binding to undefined later again.
      pageScope.$apply('autofocus = true');

      expect(element).toHaveClass('md-autofocus');

      // Set the scope binding to undefined again, which can accidentally toggle the class due to
      // the jqLite toggleClass function, which just toggles the class if the value is undefined.
      pageScope.$apply('autofocus = undefined');

      expect(element).toHaveClass('md-autofocus');
    });

    it('supports expressions', function() {
      build('<input id="test" type="text" md-autofocus="shouldAutoFocus==1">');

      // By default, the expression should be false
      expect(element).not.toHaveClass('md-autofocus');

      // Make the expression false
      pageScope.$apply('shouldAutoFocus=0');
      expect(element).not.toHaveClass('md-autofocus');

      // Make the expression true
      pageScope.$apply('shouldAutoFocus=1');
      expect(element).toHaveClass('md-autofocus');
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