describe('docsDemo', function() {

  beforeEach(module('docsApp', 'ngMaterial'));

  var codepen, element, $httpBackend, demoModel;

  beforeEach(inject(function($rootScope, $compile, $q, _codepen_, _$httpBackend_) {
    codepen = _codepen_;
    $httpBackend = _$httpBackend_;

    spyOn(codepen, 'editOnCodepen');

    stubHttpRequestsForImages();

    var filePromise = $q.defer();

    filePromise.resolve('<div class="my-amazing-demo"></div>');

    $rootScope.demo = demoModel = {
      id: 'id',
      name: 'name',
      moduleName: 'moduleName',
      $files: [
        { name: 'index.html', httpPromise: filePromise.promise }
      ]
    };

    element = $compile("<docs-demo demo-id='1234' demo-title='basic-usage' demo-module='foo-module'><demo-file ng-repeat='file in demo.$files' name='index.html' contents='file.httpPromise'></demo-file></docs-demo>")($rootScope);

    $rootScope.$digest();
  }));

  describe('clicking the edit on codepen button', function() {

    beforeEach(function() {
      var codepenButton = element.find('button').eq(1);
      codepenButton.triggerHandler({type: 'click'});
    });

    it('sends codepen the demo information', function() {
      expect(codepen.editOnCodepen).toHaveBeenCalled();
    });

    describe('demo information supplied to codepen', function() {

      var demo;
      beforeEach(function() {
        demo = codepen.editOnCodepen.calls.mostRecent().args[0];
      });

      it('includes the title of the demo', function() {
        expect(demo.title).toBe('basic-usage');
      });

      it('includes the demo id', function() {
        expect(demo.id).toBe('1234');
      });

      it('includes the module name', function() {
        expect(demo.module).toBe('foo-module');
      });

      it('includes the files for the demo', function() {
        var index = demo.files.index;
        expect(index.name).toBe('HTML');
        expect(index.fileType).toBe('html');
        expect(index.contents).toBe('<div class="my-amazing-demo"></div>');
      });
    });
  });

  function stubHttpRequestsForImages() {
    $httpBackend.whenGET('img/icons/ic_visibility_24px.svg').respond('');
    $httpBackend.expectGET('img/icons/ic_visibility_24px.svg');
    $httpBackend.whenGET('img/icons/codepen-logo.svg').respond('');
    $httpBackend.expectGET('img/icons/codepen-logo.svg');
  };
});
