describe('$$mdMeta', function() {
  var $$mdMeta;

  beforeEach(module('material.core'));

  beforeEach(function() {
    inject(function(_$$mdMeta_) {
      $$mdMeta = _$$mdMeta_;
    });
  });

  describe('set meta', function () {
    beforeEach(function () {
      angular.element(document.getElementsByTagName('meta')).remove();
    });

    it('should create the element and append it to the body', function() {
      var name = 'test';
      var content = 'value';

      expect(document.getElementsByName(name).length).toEqual(0);

      $$mdMeta.setMeta(name, content);

      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content);
    });

    it('should update the existing meta tag', function() {
      var name = 'test';
      var content = 'value';

      $$mdMeta.setMeta(name, content);

      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content);

      $$mdMeta.setMeta(name, content + '2');

      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content + '2');
    });

    it('should map existing meta tag', function() {
      var name = 'test';
      var content = 'value';

      var element = angular.element('<meta name="' + name + '" content="' + content + '"/>');
      angular.element(document.head).append(element);

      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content);

      $$mdMeta.setMeta(name, content + '2');

      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content + '2');
    });

    it('should return a remove function', function() {
      var name = 'test';
      var content = 'value';

      var remove = $$mdMeta.setMeta(name, content);

      expect(document.getElementsByName(name).length).toBe(1);

      remove();

      expect(document.getElementsByName(name).length).toBe(0);

    });
  });

  describe('get meta', function () {
    beforeEach(function () {
      angular.element(document.getElementsByTagName('meta')).remove();
    });

    it('should return the meta content', function() {
      var name = 'test';
      var content = 'value';

      $$mdMeta.setMeta(name, content);

      expect($$mdMeta.getMeta(name)).toBe(content);
    });

    it('should reject unavailable meta tags', function() {
      var name = 'test';

      expect(function () {
        $$mdMeta.getMeta(name);
      }).toThrowError('$$mdMeta: could not find a meta tag with the name \'' + name + '\'');
    });

    it('should add not mapped meta tag to the hashmap', function() {
      var name = 'test';
      var content = 'value';

      var element = angular.element('<meta name="' + name + '" content="' + content + '"/>');
      angular.element(document.head).append(element);

      expect($$mdMeta.getMeta(name)).toBe(content);
    });
  });
});