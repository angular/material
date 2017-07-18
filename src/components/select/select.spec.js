describe('<md-select>', function() {
  var attachedElements = [];
  var body, $document, $rootScope, $compile, $timeout, $material;

  beforeEach(function() {
    module('material.components.select', 'material.components.input', 'ngSanitize');

    inject(function($injector) {
      $document = $injector.get('$document');
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $timeout = $injector.get('$timeout');
      $material = $injector.get('$material');
      body = $document[0].body;
    });
  });

  afterEach(function() {
    var body = $document[0].body;
    var children = body.querySelectorAll('.md-select-menu-container');
    for (var i = 0; i < children.length; i++) {
      angular.element(children[i]).remove();
    }
  });

  afterEach(function() {
    attachedElements.forEach(function(element) {
      var scope = element.scope();

      scope && scope.$destroy();
      element.remove();
    });
    attachedElements = [];

    $document.find('md-select-menu').remove();
    $document.find('md-backdrop').remove();
  });

  describe('basic functionality', function() {
    it('should have `._md` class indicator', function() {
      var element = setupSelect('ng-model="val"').find('md-select-menu');
      expect(element.hasClass('_md')).toBe(true);
    });

    it('should preserve tabindex', function() {
      var select = setupSelect('tabindex="2" ng-model="val"').find('md-select');
      expect(select.attr('tabindex')).toBe('2');
    });

    it('should set a tabindex if the element does not have one', function() {
      var select = setupSelect('ng-model="val"').find('md-select');
      expect(select.attr('tabindex')).toBeDefined();
    });

    it('supports non-disabled state', function() {
      var select = setupSelect('ng-model="val"').find('md-select');
      expect(select.attr('aria-disabled')).toBe('false');
    });

    it('supports disabled state', function() {
      var select = setupSelect('disabled ng-model="val"').find('md-select');
      openSelect(select);
      expectSelectClosed(select);
      expect($document.find('md-select-menu').length).toBe(0);
      expect(select.attr('aria-disabled')).toBe('true');
    });

    it('supports passing classes to the container', function() {
      var select = setupSelect('ng-model="val" md-container-class="test"').find('md-select');
      openSelect(select);

      var container = $document[0].querySelector('.md-select-menu-container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('test')).toBe(true);
    });

    it('supports passing classes to the container using `data-` attribute prefix', function() {
      var select = setupSelect('ng-model="val" data-md-container-class="test"').find('md-select');
      openSelect(select);

      var container = $document[0].querySelector('.md-select-menu-container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('test')).toBe(true);
    });

    it('supports passing classes to the container using `x-` attribute prefix', function() {
      var select = setupSelect('ng-model="val" x-md-container-class="test"').find('md-select');
      openSelect(select);

      var container = $document[0].querySelector('.md-select-menu-container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('test')).toBe(true);
    });

    it('does not set aria-owns on select if DOM ownership is implied', function() {
      var select = setupSelect('ng-model="val"').find('md-select');
      var ownsId = select.attr('aria-owns');
      expect(select.find('md-option')).toBeTruthy();
      expect(ownsId).toBeFalsy();
    });

    it('sets aria-owns between the select and the container if element moved outside parent', function() {
      var select = setupSelect('ng-model="val"').find('md-select');
      openSelect(select);
      var ownsId = select.attr('aria-owns');
      expect(ownsId).toBeTruthy();
      var containerId = $document[0].querySelector('.md-select-menu-container').getAttribute('id');
      expect(ownsId).toBe(containerId);
    });

    it('calls md-on-close when the select menu closes', function() {
      var called = false;
      $rootScope.onClose = function() {
        called = true;
      };
      var select = setupSelect('ng-model="val" md-on-close="onClose()"', [1, 2, 3]).find('md-select');
      openSelect(select);
      expectSelectOpen(select);

      clickOption(select, 0);

      $material.flushInterimElement();
      expectSelectClosed(select);

      expect(called).toBe(true);
    });

    it('closes on backdrop click', function() {
      var select = setupSelect('ng-model="val"', [1, 2, 3]).find('md-select');
      openSelect(select);

      // Simulate click bubble from option to select menu handler
      var backdrop = $document.find('md-backdrop');
      expect(backdrop.length).toBe(1);
      backdrop.triggerHandler('click');

      $material.flushInterimElement();

      backdrop = $document.find('md-backdrop');
      expect(backdrop.length).toBe(0);
    });

    it('removes the menu container when the select is removed', function() {
      var select = setupSelect('ng-model="val"', [1]).find('md-select');
      openSelect(select);

      select.remove();

      expect($document.find('md-select-menu').length).toBe(0);
    });

    it('should not trigger ng-change without a change when using trackBy', function() {
      var changed = false;
      $rootScope.onChange = function() { changed = true; };
      $rootScope.val = { id: 1, name: 'Bob' };

      var opts = [ { id: 1, name: 'Bob' }, { id: 2, name: 'Alice' } ];
      var select = setupSelect('ng-model="$root.val" ng-change="onChange()" ng-model-options="{trackBy: \'$value.id\'}"', opts);
      expect(changed).toBe(false);

      openSelect(select);
      clickOption(select, 1);
      $material.flushInterimElement();
      expect($rootScope.val.id).toBe(2);
      expect(changed).toBe(true);
    });

    it('should set touched only after closing', function() {
      var form = $compile('<form name="myForm">' +
                          '<md-select name="select" ng-model="val">' +
                          '<md-option>1</md-option>' +
                          '</md-select>' +
                          '</form>')($rootScope);
      var select = form.find('md-select');
      openSelect(select);
      expect($rootScope.myForm.select.$touched).toBe(false);
      closeSelect();
      expect($rootScope.myForm.select.$touched).toBe(true);
    });

    it('should remain untouched during opening', function() {
      var form = $compile('<form name="myForm">' +
                          '<md-select name="select" ng-model="val">' +
                          '<md-option>1</md-option>' +
                          '</md-select>' +
                          '</form>')($rootScope);
      var unwatch = $rootScope.$watch('myForm.select.$touched',
        function(touched) {
          expect(touched).toBe(false);
        });
      var select = form.find('md-select');
      openSelect(select);
      unwatch();
      closeSelect();
      expect($rootScope.myForm.select.$touched).toBe(true);
    });

    it('applies the md-input-focused class to the container when focused with the keyboard', function() {
      var element = setupSelect('ng-model="val"');
      var select = element.find('md-select');

      select.triggerHandler('focus');
      expect(element.hasClass('md-input-focused')).toBe(true);

      select.triggerHandler('blur');
      expect(element.hasClass('md-input-focused')).toBe(false);
    });

    it('restores focus to select when the menu is closed', function() {
      var select = setupSelect('ng-model="val"').find('md-select');
      openSelect(select);

      $document[0].body.appendChild(select[0]);

      var selectMenu = $document.find('md-select-menu');
      pressKey(selectMenu, 27);
      $material.flushInterimElement();

      // FIXME- does not work with minified, jquery
      //expect($document[0].activeElement).toBe(select[0]);

      // Clean up the DOM after the test.
      $document[0].body.removeChild(select[0]);
    });

    it('should remove the input-container focus state', function() {
      $rootScope.val = 0;
      var element = setupSelect('ng-model="val"', [1, 2, 3]);
      var select = element.find('md-select');
      var controller = element.controller('mdInputContainer');
      $timeout.flush();
      controller.setHasValue(true);

      select.triggerHandler('focus');

      expect(element.hasClass('md-input-focused')).toBe(true);

      select.triggerHandler('blur');

      expect(element.hasClass('md-input-focused')).toBe(false);

    });

    it('should remove the tabindex from a disabled element', function() {
      var select = setupSelect('ng-model="val" disabled tabindex="1"').find('md-select');
      expect(select.attr('tabindex')).toBeUndefined();
    });

    it('auto-infers a value when none specified', function() {
        $rootScope.name = "Hannah";
        var el = setupSelect('ng-model="name"', '<md-option>Tom</md-option>' +
              '<md-option>Hannah</md-option>');
        expect(selectedOptions(el).length).toBe(1);
    });

    it('errors for duplicate md-options, non-dynamic value', function() {
      expect(function() {
        setupSelect('ng-model="$root.model"', ['a', 'a']);
      }).toThrow();
    });

    it('errors for duplicate md-options, ng-value', function() {
      setupSelect('ng-model="$root.model"', '<md-option ng-value="foo">Hello</md-option>' +
            '<md-option ng-value="bar">Goodbye</md-option>');
      $rootScope.$apply('foo = "a"');
      expect(function() {
        $rootScope.$apply('bar = "a"');
      }).toThrow();
    });

    it('watches the collection for changes', function() {
      $rootScope.val = 1;
      var select = setupSelect('ng-model="val"', [1, 2, 3]).find('md-select');
      var label = select.find('md-select-value')[0];
      expect(label.textContent).toBe('1');
      $rootScope.val = 4;
      $rootScope.$$values = [4, 5, 6];
      $rootScope.$digest();
      expect(label.textContent).toBe('4');
    });

    it('it should be able to reopen if the element was destroyed while the close ' +
      'animation is running', function() {
        $rootScope.showSelect = true;

        var container = setupSelect('ng-model="val" ng-if="showSelect"', [1, 2, 3]);
        var select = container.find('md-select');

        openSelect(select);
        expectSelectOpen(select);

        clickOption(select, 0);
        $rootScope.$apply('showSelect = false');
        expectSelectClosed(select);

        $rootScope.$apply('showSelect = true');
        select = container.find('md-select');

        openSelect(select);
        expectSelectOpen(select);
      });

    describe('when required', function() {
      it('allows 0 as a valid default value', function() {
        $rootScope.model = 0;
        $rootScope.opts = [0, 1, 2];
        $compile('<form name="testForm">' +
          '<md-select ng-model="model" name="defaultSelect" required>' +
          '<md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
          '</md-select></form>')($rootScope);
        $rootScope.$digest();
        $timeout.flush();

        expect($rootScope.testForm.defaultSelect.$error).toEqual({});
      });
    });
  });

  describe('input container', function() {
    it('should set has-value class on container for non-ng-model input', function() {
      var el = setupSelect('ng-model="$root.model"', [1, 2, 3]);
      var select = el.find('md-select');

      openSelect(select);

      clickOption(select, 0);

      $material.flushInterimElement();

      expect(el).toHaveClass('md-input-has-value');
    });

    it('should set has-value class on container for ng-model input', function() {
      $rootScope.value = 'test';
      var el = setupSelect('ng-model="$root.value"', ['test', 'no-test']);
      expect(el).toHaveClass('md-input-has-value');

      $rootScope.$apply('value = null');
      expect(el).not.toHaveClass('md-input-has-value');
    });

    it('should add has-value class on container for option ng-value="undefined"', function() {
      var el = setupSelect('ng-model="$root.value"',
        '<md-option ng-value="undefined"></md-option><md-option ng-value="1">1</md-option>'
      );
      var select = el.find('md-select');

      document.body.appendChild(el[0]);

      openSelect(select);
      $material.flushInterimElement();
      clickOption(select, 0);
      closeSelect();
      $material.flushInterimElement();
      expect(el).toHaveClass('md-input-has-value');

      openSelect(select);
      $material.flushInterimElement();
      clickOption(select, 1);
      closeSelect();
      $material.flushInterimElement();
      expect(el).toHaveClass('md-input-has-value');

      el.remove();
    });

    [
      '<md-option></md-option>',
      '<md-option value></md-option>',
      '<md-option value>None</md-option>',
      '<md-option ng-value></md-option>',
      '<md-option ng-value>None</md-option>',
      '<md-option value=""></md-option>',
      '<md-option ng-value=""></md-option>'
    ].forEach(function(template) {
      it('should unset has-value class on container for empty value option (' + template + ')', function() {
        var el = setupSelect('ng-model="$root.value"',
          template + '<md-option ng-value="1">1</md-option>'
        );
        var select = el.find('md-select');

        document.body.appendChild(el[0]);

        openSelect(select);
        $material.flushInterimElement();
        clickOption(select, 1);
        closeSelect();
        $material.flushInterimElement();
        expect(el).toHaveClass('md-input-has-value');

        openSelect(select);
        $material.flushInterimElement();
        clickOption(select, 0);
        closeSelect();
        $material.flushInterimElement();
        expect(el).not.toHaveClass('md-input-has-value');

        el.remove();
      });
    });

    it('should match label to given input id', function() {
      var el = setupSelect('ng-model="$root.value" id="foo"');
      expect(el.find('label').attr('for')).toBe('foo');
      expect(el.find('md-select').attr('id')).toBe('foo');
    });

    it('should match label to automatic input id', function() {
      var el = setupSelect('ng-model="$root.value"');
      expect(el.find('md-select').attr('id')).toBeTruthy();
      expect(el.find('label').attr('for')).toBe(el.find('md-select').attr('id'));
    });
  });

  describe('label behavior', function() {
    it('defaults to the placeholder text', function() {
      var select = setupSelect('ng-model="someVal" placeholder="Hello world"', null, true).find('md-select');
      var label = select.find('md-select-value');
      expect(label.text()).toBe('Hello world');
      expect(label.hasClass('md-select-placeholder')).toBe(true);
    });

    it('sets itself to the selected option\'s label', function() {
      $rootScope.val = 2;
      var select = $compile('<md-input-container>' +
                              '<label>Label</label>' +
                              '<md-select ng-model="val" placeholder="Hello World">' +
                                '<md-option value="1">One</md-option>' +
                                '<md-option value="2">Two</md-option>' +
                                '<md-option value="3">Three</md-option>' +
                              '</md-select>' +
                            '</md-input-container>')($rootScope).find('md-select');
      var label = select.find('md-select-value');
      var options = select.find('md-option');

      $rootScope.$digest();

      expect(label.text()).toBe('Two');
      expect(label.hasClass('md-select-placeholder')).toBe(false);


      // Ensure every md-option element does not have a checkbox prepended to it.
      for (var i = 0; i < options.length; i++) {
        var checkBoxContainer = options[i].querySelector('.md-container');
        var checkBoxIcon = options[i].querySelector('.md-icon');
        expect(checkBoxContainer).toBe(null);
        expect(checkBoxIcon).toBe(null);
      }
    });

    it('displays md-selected-text when specified', function() {
      $rootScope.selectedText = 'Hello World';

      var select = setupSelect('ng-model="someVal", md-selected-text="selectedText"', null, true).find('md-select');
      var label = select.find('md-select-value');

      expect(label.text()).toBe($rootScope.selectedText);

      $rootScope.selectedText = 'Goodbye world';

      // The label update function is not called until some user action occurs.
      openSelect(select);
      closeSelect(select);
      $material.flushInterimElement();

      expect(label.text()).toBe($rootScope.selectedText);
    });

    it('should sanitize md-selected-html', function() {
      $rootScope.selectedText = '<b>Hello World</b><script>window.mdSelectXss="YES"</script>';

      var select = setupSelect(
          'ng-model="someVal", ' +
          'md-selected-html="selectedText"', null, true).find('md-select');
      var label = select.find('md-select-value');

      expect(label.text()).toBe('Hello World');

      // The label is loaded into a span that is the first child of the '<md-select-value>`.
      expect(label[0].childNodes[0].innerHTML).toBe('<b>Hello World</b>');
      expect(window.mdSelectXss).toBeUndefined();
    });

    it('should always treat md-selected-text as text, not html', function() {
      $rootScope.selectedText = '<b>Hello World</b>';

      var select = setupSelect(
          'ng-model="someVal", ' +
          'md-selected-text="selectedText"', null, true).find('md-select');
      var label = select.find('md-select-value');

      expect(label.text()).toBe('<b>Hello World</b>');
    });

    it('supports rendering multiple', function() {
      $rootScope.val = [1, 3];
      var select = $compile('<md-input-container>' +
                              '<label>Label</label>' +
                              '<md-select multiple ng-model="val" placeholder="Hello World">' +
                                '<md-option value="1">One</md-option>' +
                                '<md-option value="2">Two</md-option>' +
                                '<md-option value="3">Three</md-option>' +
                              '</md-select>' +
                            '</md-input-container>')($rootScope).find('md-select');
      var label = select.find('md-select-value');
      var options = select.find('md-option');

      $rootScope.$digest();
      $rootScope.$digest();

      expect(label.text()).toBe('One, Three');
      expect(label.hasClass('md-select-placeholder')).toBe(false);

      // Ensure every md-option element has a checkbox prepended to it.
      for (var i = 0; i < options.length; i++) {
        var checkBoxContainer = options[i].querySelector('.md-container');
        var checkBoxIcon = options[i].querySelector('.md-icon');
        expect(checkBoxContainer).not.toBe(null);
        expect(checkBoxIcon).not.toBe(null);
      }

    });

    describe('md-select-header behavior', function() {
      it('supports rendering a md-select-header', function() {
        $rootScope.val = [1];
        var select = $compile(
            '<md-input-container>' +
            '  <label>Label</label>' +
            '  <md-select multiple ng-model="val" placeholder="Hello World">' +
            '    <md-select-header class="demo-select-header">' +
            '      <span>Hello World</span>' +
            '    </md-select-header>' +
            '    <md-optgroup label="stuff">' +
            '      <md-option value="1">One</md-option>' +
            '      <md-option value="2">Two</md-option>' +
            '      <md-option value="3">Three</md-option>' +
            '    </md-optgroup>' +
            '  </md-select>' +
            '</md-input-container>')($rootScope);

        var header = select.find('md-select-header');
        var headerContent = header.find('span');

        expect(headerContent.text()).toBe('Hello World');
      });

      it('does not render the label in md-optgroup if md-select-header is present', function() {
        $rootScope.val = [1];
        var select = $compile(
            '<md-input-container>' +
            '  <label>Label</label>' +
            '  <md-select multiple ng-model="val" placeholder="Hello World">' +
            '    <md-select-header class="demo-select-header">' +
            '      <span>Hello World</span>' +
            '    </md-select-header>' +
            '    <md-optgroup label="stuff">' +
            '      <md-option value="1">One</md-option>' +
            '      <md-option value="2">Two</md-option>' +
            '      <md-option value="3">Three</md-option>' +
            '    </md-optgroup>' +
            '  </md-select>' +
            '</md-input-container>')($rootScope);

        var optgroupLabel = select[0].querySelector('.md-container-ignore');

        expect(optgroupLabel).toBe(null);
      });
    });

    it('does not allow keydown events to propagate from inside the md-select-menu', function() {
      var scope = $rootScope.$new();

      scope.val = [1];

      var select = $compile(
          '<md-input-container>' +
          '  <label>Label</label>' +
          '  <md-select multiple ng-model="val" placeholder="Hello World">' +
          '    <md-option value="1">One</md-option>' +
          '    <md-option value="2">Two</md-option>' +
          '    <md-option value="3">Three</md-option>' +
          '  </md-select>' +
          '</md-input-container>')(scope);

      var mdOption = select.find('md-option');
      var selectMenu = select.find('md-select-menu');
      var keydownEvent = {
        type: 'keydown',
        target: mdOption[0],
        preventDefault: jasmine.createSpy(),
        stopPropagation: jasmine.createSpy()
      };

      openSelect(select);
      angular.element(selectMenu).triggerHandler(keydownEvent);

      expect(keydownEvent.preventDefault).toHaveBeenCalled();
      expect(keydownEvent.stopPropagation).toHaveBeenCalled();

      scope.$destroy();
      select.remove();
    });

    it('supports raw html', inject(function($sce) {
      $rootScope.val = 0;
      $rootScope.opts = [
        { id: 0, label: '<p>Hello World</p>' },
        { id: 1, label: 'Hello World' }
      ];
      angular.forEach($rootScope.opts, function(opt) {
        opt.label = $sce.trustAs('html', opt.label);
      });
      var select = $compile('<md-input-container>' +
                              '<label>Placeholder</label>' +
                              '<md-select ng-model="val" placeholder="Placeholder">' +
                                '<md-option ng-value="opt.id" ng-repeat="opt in opts" ng-bind-html="opt.label"></md-option>' +
                              '</md-select>' +
                            '</md-input-container>')($rootScope).find('md-select');
      var label = select.find('md-select-value').children().eq(0);
      $rootScope.$digest();


      expect(label.text()).toBe('Hello World');
      expect(label.html()).toBe('<p>Hello World</p>');
    }));
  });

  describe('non-multiple', function() {

    describe('model->view', function() {

      it('renders initial model value', function() {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
      });

      it('renders nothing if no initial value is set', function() {
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);
        expect(selectedOptions(el).length).toBe(0);
      });

      it('supports circular references', function() {
        var opts = [{ id: 1 }, { id: 2 }];
        opts[0].refs = opts[1];
        opts[1].refs = opts[0];
        setupSelect('ng-model="$root.model"', opts, undefined, undefined, { renderValueAs: 'value.id' });
      });

      it('renders model change by selecting new and deselecting old', function() {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = "c"');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect(selectedOptions(el).length).toBe(1);
      });

      it('renders invalid model change by deselecting old and selecting nothing', function() {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = "d"');
        expect(selectedOptions(el).length).toBe(0);
      });

      it('renders model change to undefined by deselecting old and selecting nothing', function() {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = undefined');
        expect(selectedOptions(el).length).toBe(0);
      });

      it('uses track by if given to compare objects', function() {
        $rootScope.$apply('model = {id:2}');
        var el = setupSelect('ng-model="$root.model" ng-model-options="{trackBy: \'$value.id\'}"',
            [{id:1}, {id:2}, {id:3}]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = {id: 3}');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
      });

      it('uses uid by default to compare objects', function() {
        var one = {}, two = {}, three = {};
        $rootScope.model = two;
        var el = setupSelect('ng-model="$root.model"', [one, two, three]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = {}');

        expect(selectedOptions(el).length).toBe(0);
      });

      it('should keep the form pristine when model is predefined', function() {
        $rootScope.model = 2;
        $rootScope.opts = [1, 2, 3, 4];
        $compile('<form name="testForm">' +
          '<md-select ng-model="model" name="multiSelect">' +
            '<md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
          '</md-select></form>')($rootScope);
        $rootScope.$digest();
        $timeout.flush();

        expect($rootScope.testForm.$pristine).toBe(true);
      });

      it('should forward the model value to the hidden select', function() {
        $rootScope.opts = [1, 2, 3, 4];
        var select = $compile('<form>' +
          '<md-select ng-model="model" name="testing-select">' +
            '<md-option ng-repeat="opt in opts">{{ opt }}</md-option>' +
          '</md-select></form>')($rootScope).find('select'); // not md-select

        $rootScope.$digest();
        $timeout.flush();

        expect(select.val()).toBeFalsy();
        $rootScope.$apply('model = 3');
        expect(select.val()).toBe('3');
      });

      it('should forward the name attribute to the hidden select', function() {
        var select = $compile('<form>' +
          '<md-select ng-model="model" name="testing-select">' +
          '</md-select></form>')($rootScope).find('select');

        expect(select.attr('name')).toBe('testing-select');
      });
    });

    describe('view->model', function() {

      it('should do nothing if clicking selected option', function() {
        $rootScope.model = 3;
        var el = setupSelect('ng-model="$root.model"', [1,2,3]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');

        el.triggerHandler({
          type: 'click',
          target: el.find('md-option')[2]
        });
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toBe(3);
      });

      it('should support the ng-change event', function() {
          var changesCalled = false;
          $rootScope.onChanges = function() {
            changesCalled = true;
          };

          var selectEl = setupSelect('ng-model="myModel" ng-change="changed()"', [1, 2, 3]).find('md-select');
          openSelect(selectEl);

          var menuEl = $document.find('md-select-menu');
          menuEl.triggerHandler({
            type: 'click',
            target: menuEl.find('md-option')[1]
          });

          // FIXME- does not work with minified, jquery
          // expect(changesCalled).toBe(true);
      });

      it('should deselect old and select new on click', function() {
        $rootScope.model = 3;
        var el = setupSelect('ng-model="$root.model"', [1,2,3]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');

        openSelect(el);
        clickOption(el, 1);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toBe(2);
      });

      it('should keep model value if selected option is removed', function() {
        $rootScope.model = 3;
        $rootScope.values = [1,2,3];
        var el = setupSelect('ng-model="$root.model"', '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');

        $rootScope.$apply('values.pop()');

        expect(selectedOptions(el).length).toBe(0);
        expect(el.find('md-option').length).toBe(2);
        expect($rootScope.model).toBe(3);
      });

      it('should select an option that was just added matching the modelValue', function() {
        $rootScope.model = 4;
        $rootScope.values = [1,2,3];
        var el = setupSelect('ng-model="$root.model"', '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

        expect(selectedOptions(el).length).toBe(0);

        $rootScope.$apply('values.unshift(4)');

        expect(el.find('md-option').length).toBe(4);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toBe(4);
      });

      it('should allow switching between falsy options', inject(function($rootScope) {
        $rootScope.model = false;
        var el = setupSelect('ng-model="$root.model"', [false, 0]);

        openSelect(el);
        clickOption(el, 1);

        expect($rootScope.model).toBe(0);
      }));

      it('should not override the initial model value', inject(function($rootScope) {
        $rootScope.model = 2;

        var el = setupSelect('ng-model="$root.model"', ['1', '2', '3']);
        var selectedOption = selectedOptions(el)[0];

        expect($rootScope.model).toBe(2, 'Expected value not to have been overwritten.');
        expect(selectedOption).toBeTruthy('Expected an option to be selected.');
        expect(selectedOption.getAttribute('value')).toBe('2',
            'Expected the corresponding option to have been selected');
      }));
    });
  });

  describe('multiple', function() {

    describe('model->view', function() {

      it('renders initial model value', function() {
        $rootScope.model = [1,3];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([1,3]);
      });

      it('renders nothing if empty array is set', function() {
        $rootScope.model = [];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      });

      it('renders nothing if undefined is set', function() {
        $rootScope.model = [1, 2];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);
        expect(selectedOptions(el).length).toBe(2);
        $rootScope.$apply('model = undefined');
        $rootScope.$digest();
        expect(selectedOptions(el).length).toBe(0);
      });

      it('adding a valid value to the model selects its option', function() {
        $rootScope.model = [];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);

        $rootScope.$apply('model.push(2)');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([2]);
      });


      it('removing a valid value from the model deselects its option', function() {
        $rootScope.model = [2,3];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([2,3]);

        $rootScope.$apply('model.shift()');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([3]);
      });

      it('deselects all options when setting to an empty model', function() {
        $rootScope.model = [2,3];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([2,3]);

        $rootScope.$apply('model = []');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      });

      it('adding multiple valid values to a model selects their options', function() {
        $rootScope.model = [2,3];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([2,3]);

        $rootScope.$apply('model = model.concat([1,4])');

        expect(selectedOptions(el).length).toBe(4);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(3).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([2,3,1,4]);
      });

      it('correctly selects and deselects options for complete reassignment of model', function() {
        $rootScope.model = [2,4,5,6];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4,5,6]);

        expect(selectedOptions(el).length).toBe(4);
        expect($rootScope.model).toEqual([2,4,5,6]);

        $rootScope.$apply('model = [1,2,3]');

        expect(selectedOptions(el).length).toBe(3);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([1,2,3]);
      });

      it('does not select any options if the models value does not match an option', function() {
        $rootScope.model = [];
        $rootScope.obj = {};
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4,5,6]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);

        $rootScope.$apply('model = ["bar", obj]');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual(["bar", $rootScope.obj]);
      });

      it('uses track by if given to compare objects', function() {
        $rootScope.$apply('model = [{id:2}]');
        var el=setupSelectMultiple('ng-model="$root.model" ng-model-options="{trackBy: \'$value.id\'}"',
            [{id:1}, {id:2}, {id:3}]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model.push({id: 3}); model.push({id:1}); model.shift();');

        expect(selectedOptions(el).length).toBe(2);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
      });

      it('uses uid by default to compare objects', function() {
        var one = {}, two = {}, three = {};
        $rootScope.model = [two];
        var el = setupSelectMultiple('ng-model="$root.model"', [one, two, three]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = [{}]');

        expect(selectedOptions(el).length).toBe(0);
      });

      it('errors the model if model value is truthy and not an array', function() {
        $rootScope.model = 'string';
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3]);
        var ngModelCtrl = el.find('md-select').controller('ngModel');

        expect(ngModelCtrl.$error['md-multiple']).toBe(true);

        $rootScope.$apply('model = []');
        expect(ngModelCtrl.$valid).toBe(true);
      });

      it('does not let an empty array satisfy required', function() {
          $rootScope.model = [];
          $rootScope.opts = [1, 2, 3, 4];
          $compile('<form name="testForm">' +
            '<md-select ng-model="model" name="multiSelect" required="required" multiple="multiple">' +
              '<md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
            '</md-select></form>')($rootScope);
          $rootScope.$digest();
          expect($rootScope.testForm.$valid).toBe(false);
      });

      it('properly validates required attribute based on available options', function() {
        var template =
          '<form name="testForm">' +
          '  <md-select ng-model="model" required="required">' +
          '    <md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
          '  </md-select>' +
          '</form>';

        $rootScope.opts = [1, 2, 3, 4];

        $compile(template)($rootScope);

        // Option 0 is not available; should be false
        $rootScope.model = 0;
        $rootScope.$digest();
        expect($rootScope.testForm.$valid).toBe(false);

        // Option 1 is available; should be true
        $rootScope.model = 1;
        $rootScope.$digest();
        expect($rootScope.testForm.$valid).toBe(true);
      });

      it('properly validates required attribute with object options', function() {
        var template =
          '<form name="testForm">' +
          '  <md-select ng-model="model" ng-model-options="{ trackBy: \'$value.id\' }" required="required">' +
          '    <md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
          '  </md-select>' +
          '</form>';

        $rootScope.opts = [
          { id: 1, value: 'First'  },
          { id: 2, value: 'Second' },
          { id: 3, value: 'Third'  },
          { id: 4, value: 'Fourth' }
        ];

        $compile(template)($rootScope);

        // There is no value selected yet, so the validation should currently fail.
        $rootScope.$digest();

        expect($rootScope.testForm.$valid).toBe(false);

        // Select any valid option, to confirm that the ngModel properly detects the
        // tracked option.
        $rootScope.model = $rootScope.opts[0];
        $rootScope.$digest();

        expect($rootScope.testForm.$valid).toBe(true);
      });

      it('should keep the form pristine when model is predefined', function() {
        $rootScope.model = [1, 2];
        $rootScope.opts = [1, 2, 3, 4];
        $compile('<form name="testForm">' +
          '<md-select ng-model="model" name="multiSelect" multiple="multiple">' +
            '<md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
          '</md-select></form>')($rootScope);
        $rootScope.$digest();
        $timeout.flush();

        expect($rootScope.testForm.$pristine).toBe(true);
      });

      it('should correctly update the input containers label', function() {
        var el = setupSelect('ng-required="isRequired" ng-model="someModel"');
        var label = el.find('label');

        expect(label).not.toHaveClass('md-required');

        $rootScope.$apply('isRequired = true');

        expect(label).toHaveClass('md-required');
      });

      it('should correctly update the input containers label when asterisk is disabled', function() {
        var el = setupSelect('ng-required="isRequired" md-no-asterisk ng-model="someModel"');
        var label = el.find('label');

        expect(label).not.toHaveClass('md-required');

        $rootScope.$apply('isRequired = true');

        expect(label).not.toHaveClass('md-required');
      });

      it('correctly adds the .md-no-asterisk class if the attribute is empty', function() {
        var el = setupSelect('ng-required="isRequired" md-no-asterisk ng-model="someModel"');
        var select = el.find('md-select');

        expect(select).toHaveClass('md-no-asterisk');
      });

      it('correctly adds the .md-no-asterisk class if the attribute is true', function() {
        var el = setupSelect('ng-required="isRequired" md-no-asterisk ng-model="someModel"');
        var select = el.find('md-select');

        expect(select).toHaveClass('md-no-asterisk');
      });

      it('correctly removes the .md-no-asterisk class if the attribute is false', function() {
        var el = setupSelect('ng-required="isRequired" md-no-asterisk="false" ng-model="someModel"');
        var select = el.find('md-select');

        expect(select).not.toHaveClass('md-no-asterisk');
      });
    });

    describe('view->model', function() {

      it('should deselect a selected option on click', function() {
        $rootScope.model = [1];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2]);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);
        openSelect(el);
        clickOption(el, 0);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      });

      it('selects a deselected option on click', function() {
        $rootScope.model = [1];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2]);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);

        openSelect(el);

        clickOption(el, 1);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([1,2]);
      });

      it('should keep model value if a selected option is removed', function() {
        $rootScope.model = [1];
        $rootScope.values = [1,2];
        var el = setupSelectMultiple('ng-model="$root.model"',
            '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);

        $rootScope.$apply('values.shift()');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([1]);
      });

      it('should select an option that was just added matching the modelValue', function() {
        $rootScope.model = [1,3];
        $rootScope.values = [1,2];
        var el = setupSelectMultiple('ng-model="$root.model"',
            '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1,3]);

        $rootScope.$apply('values.push(3)');

        expect(selectedOptions(el).length).toBe(2);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([1,3]);
      });

      it('should not be multiple if attr.multiple == `false`', function() {
        var el = setupSelect('multiple="false" ng-model="$root.model"').find('md-select');
        openSelect(el);
        expectSelectOpen(el);

        var selectMenu = $document.find('md-select-menu')[0];

        expect(selectMenu.hasAttribute('multiple')).toBe(false);
      });

    });
  });

  describe('aria', function() {
    var el;
    beforeEach(function() {
      el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
      var selectMenus = $document.find('md-select-menu');
      selectMenus.remove();
    });

    it('adds an aria-label from placeholder', function() {
      var select = setupSelect('ng-model="someVal" placeholder="Hello world"', null, true).find('md-select');
      expect(select.attr('aria-label')).toBe('Hello world');
    });

    it('preserves aria-label on value change', function() {
      var select = $compile('<md-input-container>' +
                              '<label>Pick</label>' +
                              '<md-select ng-model="val">' +
                                '<md-option value="1">One</md-option>' +
                                '<md-option value="2">Two</md-option>' +
                                '<md-option value="3">Three</md-option>' +
                              '</md-select>' +
                            '</md-input-container>')($rootScope).find('md-select');
      $rootScope.$apply('model = 1');
      $rootScope.$digest();

      expect(select.attr('aria-label')).toBe('Pick');
    });

    it('preserves existing aria-label', function() {
      var select = setupSelect('ng-model="someVal" aria-label="Hello world" placeholder="Pick"').find('md-select');
      expect(select.attr('aria-label')).toBe('Hello world');
    });

    it('should expect an aria-label if none is present', inject(function($log) {
      spyOn($log, 'warn');
      setupSelect('ng-model="someVal"', null, true).find('md-select');
      $rootScope.$apply();
      expect($log.warn).toHaveBeenCalled();

      $log.warn.calls.reset();
      setupSelect('ng-model="someVal", aria-label="Hello world"').find('md-select');
      $rootScope.$apply();
      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('sets up the aria-expanded attribute', function() {

      expect(el.attr('aria-expanded')).toBe('false');
      openSelect(el);
      expect(el.attr('aria-expanded')).toBe('true');

      closeSelect(el);
      $material.flushInterimElement();

      expect(el.attr('aria-expanded')).toBe('false');
    });

    it('sets up the aria-multiselectable attribute', function() {
      $rootScope.model = [1,3];
      var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3]).find('md-select');

      expect(el.attr('aria-multiselectable')).toBe('true');
    });

    it('sets up the aria-selected attribute', function() {
      var el = setupSelect('ng-model="$root.model"', [1,2,3]);
      var options = el.find('md-option');
      openSelect(el);
      expect(options.eq(2).attr('aria-selected')).toBe('false');
      clickOption(el, 2);
      expect(options.eq(2).attr('aria-selected')).toBe('true');
    });
  });

  describe('keyboard controls', function() {


    afterEach(function() {
      var selectMenus = $document.find('md-select-menu');
      selectMenus.remove();
    });

    describe('md-select', function() {
      it('can be opened with a space key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 32);
        $material.flushInterimElement();
        expectSelectOpen(el);
      });

      it('can be opened with an enter key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 13);
        $material.flushInterimElement();
        expectSelectOpen(el);
      });

      it('can be opened with the up key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 38);
        $material.flushInterimElement();
        expectSelectOpen(el);
      });

      it('can be opened with the down key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 40);
        $material.flushInterimElement();
        expectSelectOpen(el);
      });

      it('supports typing an option name', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 50);
        expect($rootScope.someModel).toBe(2);
      });

      it('supports typing non-english option names', inject(function($document, $rootScope) {
        var words = ['algebra', 'álgebra'];
        var el = setupSelect('ng-model="someModel"', words).find('md-select');

        pressKey(el, words[1].charCodeAt(0));
        expect($rootScope.someModel).toBe(words[1]);
      }));

      it('supports typing unicode option names', inject(function($document, $rootScope) {
        var words = ['algebra', '太阳'];
        var el = setupSelect('ng-model="someModel"', words).find('md-select');

        pressKey(el, words[1].charCodeAt(0));
        expect($rootScope.someModel).toBe(words[1]);
      }));

      // Note, this test is designed to check the shouldHandleKey() method which is the default
      // method if the keypress doesn't match one of the KNOWN keys such as up/down/enter/escape/etc.
      it('does not swallow useful keys (fn, arrow, etc)', function() {
        var keyCodes = [17, 92, 113]; // ctrl, comma (`,`), and F3
        var customEvent = {
          type: 'keydown',
          preventDefault: jasmine.createSpy('preventDefault')
        };

        var words = ['algebra', 'math', 'science'];
        var el = setupSelect('ng-model="someModel"', words).find('md-select');

        keyCodes.forEach(function(code) {
          customEvent.keyCode = code;
          pressKey(el, null, customEvent);
          expect(customEvent.preventDefault).not.toHaveBeenCalled();
        });
      });

      it('does not swallow modifier keys', function() {
        var customEvent = {
          type: 'keydown',
          preventDefault: jasmine.createSpy('preventDefault')
        };

        var words = ['algebra', 'math', 'science'];
        var el = setupSelect('ng-model="someModel"', words).find('md-select');

        customEvent.keyCode = 70;
        customEvent.ctrlKey = true;
        pressKey(el, null, customEvent);
        expect(customEvent.preventDefault).not.toHaveBeenCalled();

        customEvent.keyCode = 82;
        customEvent.ctrlKey = false;
        customEvent.metaKey = true;
        pressKey(el, null, customEvent);
        expect(customEvent.preventDefault).not.toHaveBeenCalled();
      });

      it('disallows selection of disabled options', function() {
        var optsTemplate =
          '<md-option value="1">1</md-option>' +
          '<md-option value="2" ng-disabled="true">2</md-option>';
        var el = setupSelect('ng-model="someModel"', optsTemplate).find('md-select');

        pressKey(el, 50);
        expect($rootScope.someModel).toBe(undefined);
      });
    });

    describe('md-select-menu', function() {
      it('can be closed with escape', function() {
        var el = setupSelect('ng-model="someVal"', [1, 2, 3]).find('md-select');
        openSelect(el);
        expectSelectOpen(el);
        var selectMenu = $document.find('md-select-menu');
        expect(selectMenu.length).toBe(1);
        pressKey(selectMenu, 27);
        $material.flushInterimElement();
        expectSelectClosed(el);
      });
    });
  });

  function setupSelect(attrs, options, skipLabel, scope, optCompileOpts) {
    var el;
    var template = '' +
      '<md-input-container>' +
        (skipLabel ? '' : '<label>Label</label>') +
        '<md-select ' + (attrs || '') + '>' +
          optTemplate(options, optCompileOpts) +
        '</md-select>' +
      '</md-input-container>';

    el = $compile(template)(scope || $rootScope);
    $rootScope.$digest();
    attachedElements.push(el);

    return el;
  }

  function setupSelectMultiple(attrs, options, skipLabel, scope) {
    attrs = (attrs || '') + ' multiple';
    return setupSelect(attrs, options, skipLabel, scope);
  }

  function optTemplate(options, compileOpts) {
    var optionsTpl = '';

    if (angular.isArray(options)) {
      $rootScope.$$values = options;
      var renderValueAs = compileOpts ? compileOpts.renderValueAs || 'value' : 'value';
      optionsTpl = '<md-option ng-repeat="value in $$values" ng-value="value"><div class="md-text">{{' + renderValueAs + '}}</div></md-option>';
    } else if (angular.isString(options)) {
      optionsTpl = options;
    }

    return optionsTpl;
  }

  function selectedOptions(el) {
    var querySelector = 'md-option[selected]';
    var res = angular.element($document[0].querySelectorAll(querySelector));

    if (!res.length) {
      res = angular.element(el[0].querySelectorAll(querySelector));
    }

    return res;
  }

  function openSelect(el) {
    if (el[0].nodeName != 'MD-SELECT') {
      el = el.find('md-select');
    }
    try {
      el.triggerHandler('click');
      $material.flushInterimElement();
      el.triggerHandler('blur');
    } catch (e) { }
  }

  function closeSelect() {
    var backdrop = $document.find('md-backdrop');
    if (!backdrop.length) throw Error('Attempted to close select with no backdrop present');
    $document.find('md-backdrop').triggerHandler('click');
    $material.flushInterimElement();
  }


  function pressKey(el, code, customEvent) {
    var event = customEvent || {
      type: 'keydown',
      keyCode: code
    };

    el.triggerHandler(event);
  }

  function clickOption(select, index) {
    expectSelectOpen(select);

    var openMenu = $document.find('md-select-menu');
    var opt = openMenu.find('md-option')[index].querySelector('div');

    if (!opt) throw Error('Could not find option at index: ' + index);

    angular.element(openMenu).triggerHandler({
      type: 'click',
      target: angular.element(opt),
      currentTarget: openMenu[0]
    });
  }

  function expectSelectClosed() {
    var menu = angular.element($document[0].querySelector('.md-select-menu-container'));

    if (menu.length) {
      if (menu.hasClass('md-active') || menu.attr('aria-hidden') == 'false') {
        throw Error('Expected select to be closed');
      }
    }
  }

  function expectSelectOpen() {
    var menu = angular.element($document[0].querySelector('.md-select-menu-container'));

    if (!(menu.hasClass('md-active') && menu.attr('aria-hidden') == 'false')) {
      throw Error('Expected select to be open');
    }
  }

});

describe('<md-select> without ngSanitize loaded', function() {
  var $compile, pageScope;

  beforeEach(module('material.components.select', 'material.components.input'));

  beforeEach(inject(function($injector) {
    $compile = $injector.get('$compile');
    pageScope = $injector.get('$rootScope').$new();
  }));

  it('should throw an error when using md-selected-html without ngSanitize', function() {
    var template =
      '<md-select md-selected-html="myHtml" ng-model="selectedValue">' +
        '<md-option>One</md-option>' +
      '</md-select>';

    var select = $compile(template)(pageScope);

    expect(function() {
      pageScope.myHtml = '<p>Barnacle Pete</p>';
      pageScope.$apply();
    }).toThrowError(/\$sce:unsafe/);
  });


  it('should throw an error if using md-selected-text and md-selected-html', function() {
    var template =
      '<md-select md-selected-text="myText" md-selected-html="myHtml" ng-model="selectedValue">' +
        '<md-option>One</md-option>' +
      '</md-select>';

    var select = $compile(template)(pageScope);

    expect(function() {
      pageScope.$apply();
    }).toThrowError('md-select cannot have both `md-selected-text` and `md-selected-html`');
  });
});
