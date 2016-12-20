describe('$mdLiveAnnouncer', function() {

  var $mdLiveAnnouncer, $timeout = null;
  var liveEl = null;

  beforeEach(module('material.core'));

  beforeEach(inject(function ($injector) {
    $mdLiveAnnouncer = $injector.get('$mdLiveAnnouncer');
    $timeout = $injector.get('$timeout');

    liveEl = $mdLiveAnnouncer._liveElement;
  }));

  it('should correctly update the announce text', function() {
    $mdLiveAnnouncer.announce('Hey Google');

    expect(liveEl.textContent).toBe('');

    $timeout.flush();

    expect(liveEl.textContent).toBe('Hey Google');
  });

  it('should correctly update the politeness attribute', function() {
    $mdLiveAnnouncer.announce('Hey Google', 'assertive');

    $timeout.flush();

    expect(liveEl.textContent).toBe('Hey Google');
    expect(liveEl.getAttribute('aria-live')).toBe('assertive');
  });

  it('should apply the aria-live value polite by default', function() {
    $mdLiveAnnouncer.announce('Hey Google');

    $timeout.flush();

    expect(liveEl.textContent).toBe('Hey Google');
    expect(liveEl.getAttribute('aria-live')).toBe('polite');
  });

  it('should have proper aria attributes to be detected', function() {
    expect(liveEl.getAttribute('aria-atomic')).toBe('true');
    expect(liveEl.getAttribute('role')).toBe('status');
  });

});
