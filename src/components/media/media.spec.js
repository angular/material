describe('mdMedia directive', function() {

  beforeEach(module('material.components.media'));

  it('should register the directives correctly', inject(function($injector) {

    // Manually check all breakpoints, because using a dynamic test with a loop is not recommended.
    expect($injector.has('mdMediaXsDirective')).toBe(true);
    expect($injector.has('mdMediaGtXsDirective')).toBe(true);
    expect($injector.has('mdMediaSmDirective')).toBe(true);
    expect($injector.has('mdMediaGtSmDirective')).toBe(true);
    expect($injector.has('mdMediaMdDirective')).toBe(true);
    expect($injector.has('mdMediaGtMdDirective')).toBe(true);
    expect($injector.has('mdMediaLgDirective')).toBe(true);
    expect($injector.has('mdMediaGtLgDirective')).toBe(true);
    expect($injector.has('mdMediaXlDirective')).toBe(true);
    expect($injector.has('mdMediaPrintDirective')).toBe(true);

  }));

});