describe('<md-select>', function() {
  var attachedElements = [],
      body;

  beforeEach(module('material.components.input'));
  beforeEach(module('material.components.select'));

  beforeEach(inject(function($document) {
    body = $document[0].body;
  }));

  afterEach(inject(function ($document) {
    var body = $document[0].body;
    var children = body.querySelectorAll('.md-select-menu-container');
    for (var i = 0; i < children.length; i++) {
      angular.element(children[i]).remove();
    }
  }));

  afterEach(inject(function($document) {
    attachedElements.forEach(function(element) {
      element.remove();
    });
    attachedElements = [];

    var selectMenus = $document.find('md-select-menu');
    selectMenus.remove();

    var backdrops = $document.find('md-backdrop');
    backdrops.remove();
  }));

  it('should preserve tabindex', function() {
    var select = setupSelect('tabindex="2", ng-model="val"').find('md-select');
    expect(select.attr('tabindex')).toBe('2');
  });

  it('supports non-disabled state', function() {
    var select = setupSelect('ng-model="val"').find('md-select');
    expect(select.attr('aria-disabled')).toBe('false');
  });

  it('supports disabled state', inject(function($document) {
    var select = setupSelect('disabled="disabled", ng-model="val"').find('md-select');
    openSelect(select);
    expectSelectClosed(select);
    expect($document.find('md-select-menu').length).toBe(0);
    expect(select.attr('aria-disabled')).toBe('true');
  }));

  it('supports passing classes to the container', inject(function($document) {
    var select = setupSelect('ng-model="val", md-container-class="test"').find('md-select');
    openSelect(select);

    var container = $document[0].querySelector('.md-select-menu-container');
    expect(container).toBeTruthy();
    expect(container.classList.contains('test')).toBe(true);
  }));

  it('supports passing classes to the container using `data-` attribute prefix', inject(function($document) {
    var select = setupSelect('ng-model="val", data-md-container-class="test"').find('md-select');
    openSelect(select);

    var container = $document[0].querySelector('.md-select-menu-container');
    expect(container).toBeTruthy();
    expect(container.classList.contains('test')).toBe(true);
  }));

  it('supports passing classes to the container using `x-` attribute prefix', inject(function($document) {
    var select = setupSelect('ng-model="val", x-md-container-class="test"').find('md-select');
    openSelect(select);

    var container = $document[0].querySelector('.md-select-menu-container');
    expect(container).toBeTruthy();
    expect(container.classList.contains('test')).toBe(true);
  }));

  it('sets aria-owns between the select and the container', function() {
    var select = setupSelect('ng-model="val"').find('md-select');
    var ownsId = select.attr('aria-owns'); 
    expect(ownsId).toBeTruthy();
    var containerId = select[0].querySelector('.md-select-menu-container').getAttribute('id');
    expect(ownsId).toBe(containerId);
  });

  it('calls md-on-close when the select menu closes', inject(function($document, $rootScope) {
    var called = false;
    $rootScope.onClose = function() {
      called = true;
    };
    var select = setupSelect('ng-model="val", md-on-close="onClose()"', [1, 2, 3]).find('md-select');
    openSelect(select);
    expectSelectOpen(select);

    clickOption(select, 0);

    waitForSelectClose();
    expectSelectClosed(select);

    expect(called).toBe(true);
  }));

  it('closes on backdrop click', inject(function($document) {
    var select = setupSelect('ng-model="val"', [1, 2, 3]).find('md-select');
    openSelect(select);

    // Simulate click bubble from option to select menu handler
    var backdrop = $document.find('md-backdrop');
    expect(backdrop.length).toBe(1);
    backdrop.triggerHandler('click');

    waitForSelectClose();

    backdrop = $document.find('md-backdrop');
    expect(backdrop.length).toBe(0);
  }));

  it('removes the menu container when the select is removed', inject(function($document) {
    var select = setupSelect('ng-model="val"', [1]).find('md-select');
    openSelect(select);

    select.remove();

    expect($document.find('md-select-menu').length).toBe(0);
  }));

  it('should not trigger ng-change without a change when using trackBy', inject(function($rootScope) {
    var changed = false;
    $rootScope.onChange = function() { changed = true; };
    $rootScope.val = { id: 1, name: 'Bob' };

    var opts = [ { id: 1, name: 'Bob' }, { id: 2, name: 'Alice' } ];
    var select = setupSelect('ng-model="$root.val" ng-change="onChange()" ng-model-options="{trackBy: \'$value.id\'}"', opts);
    expect(changed).toBe(false);
    
    openSelect(select);
    clickOption(select, 1);
    waitForSelectClose();
    expect($rootScope.val.id).toBe(2);
    expect(changed).toBe(true);
  }));

  it('should set touched only after closing', inject(function($compile, $rootScope) {
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
  }));


  it('restores focus to select when the menu is closed', inject(function($document) {
    var select = setupSelect('ng-model="val"').find('md-select');
    openSelect(select);

    $document[0].body.appendChild(select[0]);

    var selectMenu = $document.find('md-select-menu');
    pressKey(selectMenu, 27);
    waitForSelectClose();

    // FIXME- does not work with minified, jquery
    //expect($document[0].activeElement).toBe(select[0]);
  }));

  it('should remove the input-container focus state', inject(function($rootScope, $timeout) {
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

  }));

  describe('input container', function() {
    it('should set has-value class on container for non-ng-model input', inject(function($rootScope) {
      var el = setupSelect('ng-model="$root.model"', [1, 2, 3]);
      var select = el.find('md-select');

      openSelect(select);

      clickOption(select, 0);

      waitForSelectClose();

      expect(el).toHaveClass('md-input-has-value');
    }));

    it('should set has-value class on container for ng-model input', inject(function($rootScope) {
      $rootScope.value = 'test';
      var el = setupSelect('ng-model="$root.value"', ['test', 'no-test']);
      expect(el).toHaveClass('md-input-has-value');

      $rootScope.$apply('value = null');
      expect(el).not.toHaveClass('md-input-has-value');
    }));

    it('should match label to given input id', function() {
      var el = setupSelect('ng-model="$root.value", id="foo"');
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
      var select = setupSelect('ng-model="someVal", placeholder="Hello world"', null, true).find('md-select');
      var label = select.find('md-select-value');
      expect(label.text()).toBe('Hello world');
      expect(label.hasClass('md-select-placeholder')).toBe(true);
    });

    it('sets itself to the selected option\'s label', inject(function($rootScope, $compile) {
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
      $rootScope.$digest();

      expect(label.text()).toBe('Two');
      expect(label.hasClass('md-select-placeholder')).toBe(false);
    }));

    it('supports rendering multiple', inject(function($rootScope, $compile) {
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
      $rootScope.$digest();
      $rootScope.$digest();

      expect(label.text()).toBe('One, Three');
      expect(label.hasClass('md-select-placeholder')).toBe(false);
    }));

    it('supports raw html', inject(function($rootScope, $compile, $sce) {
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

  it('auto-infers a value when none specified', inject(function($rootScope) {
      $rootScope.name = "Hannah";
      var el = setupSelect('ng-model="name"', '<md-option>Tom</md-option>' +
            '<md-option>Hannah</md-option>');
      expect(selectedOptions(el).length).toBe(1);
  }));

  it('errors for duplicate md-options, non-dynamic value', inject(function() {
    expect(function() {
      setupSelect('ng-model="$root.model"', ['a', 'a']);
    }).toThrow();
  }));

  it('errors for duplicate md-options, ng-value', inject(function($rootScope) {
    setupSelect('ng-model="$root.model"', '<md-option ng-value="foo">Hello</md-option>' +
          '<md-option ng-value="bar">Goodbye</md-option>');
    $rootScope.$apply('foo = "a"');
    expect(function() {
      $rootScope.$apply('bar = "a"');
    }).toThrow();
  }));

  it('watches the collection for changes', inject(function($rootScope) {
    $rootScope.val = 1;
    var select = setupSelect('ng-model="val"', [1, 2, 3]).find('md-select');
    var label = select.find('md-select-value')[0];
    expect(label.textContent).toBe('1');
    $rootScope.val = 4;
    $rootScope.$$values = [4, 5, 6];
    $rootScope.$digest();
    expect(label.textContent).toBe('4');
  }));

  describe('non-multiple', function() {

    describe('model->view', function() {

      it('renders initial model value', inject(function($rootScope) {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
      }));

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

      it('renders model change by selecting new and deselecting old', inject(function($rootScope) {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = "c"');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect(selectedOptions(el).length).toBe(1);
      }));

      it('renders invalid model change by deselecting old and selecting nothing', inject(function($rootScope) {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = "d"');
        expect(selectedOptions(el).length).toBe(0);
      }));

      it('renders model change to undefined by deselecting old and selecting nothing', inject(function($rootScope) {
        $rootScope.$apply('model = "b"');
        var el = setupSelect('ng-model="$root.model"', ['a','b','c']);
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = undefined');
        expect(selectedOptions(el).length).toBe(0);
      }));

      it('uses track by if given to compare objects', inject(function($rootScope) {
        $rootScope.$apply('model = {id:2}');
        var el = setupSelect('ng-model="$root.model" ng-model-options="{trackBy: \'$value.id\'}"',
            [{id:1}, {id:2}, {id:3}]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = {id: 3}');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
      }));

      it('uses uid by default to compare objects', inject(function($rootScope) {
        var one = {}, two = {}, three = {};
        $rootScope.model = two;
        var el = setupSelect('ng-model="$root.model"', [one, two, three]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = {}');

        expect(selectedOptions(el).length).toBe(0);
      }));

      it('should keep the form pristine when model is predefined', inject(function($rootScope, $timeout, $compile) {
        $rootScope.model = 2;
        $rootScope.opts = [1, 2, 3, 4];
        $compile('<form name="testForm">' +
          '<md-select ng-model="model" name="multiSelect">' +
            '<md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
          '</md-select></form>')($rootScope);
        $rootScope.$digest();
        $timeout.flush();

        expect($rootScope.testForm.$pristine).toBe(true);
      }));

    });

    describe('view->model', function() {

      it('should do nothing if clicking selected option', inject(function($rootScope) {
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
      }));

      it('should support the ng-change event', inject(function($rootScope, $document) {
          var changesCalled = false;
          $rootScope.onChanges = function() {
            changesCalled = true;
          };

          var selectEl = setupSelect('ng-model="myModel", ng-change="changed()"', [1, 2, 3]).find('md-select');
          openSelect(selectEl);

          var menuEl = $document.find('md-select-menu');
          menuEl.triggerHandler({
            type: 'click',
            target: menuEl.find('md-option')[1]
          });

          // FIXME- does not work with minified, jquery
          // expect(changesCalled).toBe(true);
      }));

      it('should deselect old and select new on click', inject(function($rootScope) {
        $rootScope.model = 3;
        var el = setupSelect('ng-model="$root.model"', [1,2,3]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');

        openSelect(el);
        clickOption(el, 1);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toBe(2);
      }));

      it('should keep model value if selected option is removed', inject(function($rootScope) {
        $rootScope.model = 3;
        $rootScope.values = [1,2,3];
        var el = setupSelect('ng-model="$root.model"', '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');

        $rootScope.$apply('values.pop()');

        expect(selectedOptions(el).length).toBe(0);
        expect(el.find('md-option').length).toBe(2);
        expect($rootScope.model).toBe(3);
      }));

      it('should select an option that was just added matching the modelValue', inject(function($rootScope) {
        $rootScope.model = 4;
        $rootScope.values = [1,2,3];
        var el = setupSelect('ng-model="$root.model"', '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

        expect(selectedOptions(el).length).toBe(0);

        $rootScope.$apply('values.unshift(4)');

        expect(el.find('md-option').length).toBe(4);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toBe(4);
      }));

    });
  });

  describe('multiple', function() {


    describe('model->view', function() {

      it('renders initial model value', inject(function($rootScope) {
        $rootScope.model = [1,3];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([1,3]);
      }));

      it('renders nothing if empty array is set', inject(function($rootScope) {
        $rootScope.model = [];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      }));

      it('renders nothing if undefined is set', inject(function($rootScope) {
        $rootScope.model = [1, 2];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);
        expect(selectedOptions(el).length).toBe(2);
        $rootScope.$apply('model = undefined');
        $rootScope.$digest();
        expect(selectedOptions(el).length).toBe(0);
      }));

      it('adding a valid value to the model selects its option', inject(function($rootScope) {
        $rootScope.model = [];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);

        $rootScope.$apply('model.push(2)');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([2]);
      }));


      it('removing a valid value from the model deselects its option', inject(function($rootScope) {
        $rootScope.model = [2,3];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([2,3]);

        $rootScope.$apply('model.shift()');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([3]);
      }));

      it('deselects all options when setting to an empty model', inject(function($rootScope) {
        $rootScope.model = [2,3];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([2,3]);

        $rootScope.$apply('model = []');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      }));

      it('adding multiple valid values to a model selects their options', inject(function($rootScope) {
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
      }));

      it('correctly selects and deselects options for complete reassignment of model', inject(function($rootScope) {
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
      }));

      it('does not select any options if the models value does not match an option', inject(function($rootScope) {
        $rootScope.model = [];
        $rootScope.obj = {};
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3,4,5,6]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);

        $rootScope.$apply('model = ["bar", obj]');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual(["bar", $rootScope.obj]);
      }));

      it('uses track by if given to compare objects', inject(function($rootScope) {
        $rootScope.$apply('model = [{id:2}]');
        var el=setupSelectMultiple('ng-model="$root.model" ng-model-options="{trackBy: \'$value.id\'}"',
            [{id:1}, {id:2}, {id:3}]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model.push({id: 3}); model.push({id:1}); model.shift();');

        expect(selectedOptions(el).length).toBe(2);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
      }));

      it('uses uid by default to compare objects', inject(function($rootScope) {
        var one = {}, two = {}, three = {};
        $rootScope.model = [two];
        var el = setupSelectMultiple('ng-model="$root.model"', [one, two, three]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = [{}]');

        expect(selectedOptions(el).length).toBe(0);
      }));

      it('errors the model if model value is truthy and not an array', inject(function($rootScope) {
        $rootScope.model = 'string';
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3]);
        var ngModelCtrl = el.find('md-select').controller('ngModel');

        expect(ngModelCtrl.$error['md-multiple']).toBe(true);

        $rootScope.$apply('model = []');
        expect(ngModelCtrl.$valid).toBe(true);
      }));

      it('does not let an empty array satisfy required', inject(function($rootScope, $compile) {
          $rootScope.model = [];
          $rootScope.opts = [1, 2, 3, 4];
          $compile('<form name="testForm">' +
            '<md-select ng-model="model" name="multiSelect" required="required" multiple="multiple">' +
              '<md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
            '</md-select></form>')($rootScope);
          $rootScope.$digest();
          expect($rootScope.testForm.$valid).toBe(false);
      }));

      it('should keep the form pristine when model is predefined', inject(function($rootScope, $timeout, $compile) {
        $rootScope.model = [1, 2];
        $rootScope.opts = [1, 2, 3, 4];
        $compile('<form name="testForm">' +
          '<md-select ng-model="model" name="multiSelect" multiple="multiple">' +
            '<md-option ng-repeat="opt in opts" ng-value="opt"></md-option>' +
          '</md-select></form>')($rootScope);
        $rootScope.$digest();
        $timeout.flush();

        expect($rootScope.testForm.$pristine).toBe(true);
      }));
    });

    describe('view->model', function() {

      it('should deselect a selected option on click', inject(function($rootScope) {
        $rootScope.model = [1];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2]);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);
        openSelect(el);
        clickOption(el, 0);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      }));

      it('selects a deselected option on click', inject(function($rootScope) {
        $rootScope.model = [1];
        var el = setupSelectMultiple('ng-model="$root.model"', [1,2]);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);

        openSelect(el);

        clickOption(el, 1);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([1,2]);
      }));

      it('should keep model value if a selected option is removed', inject(function($rootScope) {
        $rootScope.model = [1];
        $rootScope.values = [1,2];
        var el = setupSelectMultiple('ng-model="$root.model"',
            '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);

        $rootScope.$apply('values.shift()');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([1]);
      }));

      it('should select an option that was just added matching the modelValue', inject(function($rootScope) {
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
      }));

    });
  });

  describe('aria', function() {
    var el;
    beforeEach(inject(function($q, $document) {
      el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
      var selectMenus = $document.find('md-select-menu');
      selectMenus.remove();
    }));

    it('adds an aria-label from placeholder', function() {
      var select = setupSelect('ng-model="someVal", placeholder="Hello world"', null, true).find('md-select');
      expect(select.attr('aria-label')).toBe('Hello world');
    });

    it('preserves aria-label on value change', inject(function($rootScope, $compile) {
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
    }));

    it('preserves existing aria-label', function() {
      var select = setupSelect('ng-model="someVal", aria-label="Hello world", placeholder="Pick"').find('md-select');
      expect(select.attr('aria-label')).toBe('Hello world');
    });

    it('should expect an aria-label if none is present', inject(function($compile, $rootScope, $log) {
      spyOn($log, 'warn');
      setupSelect('ng-model="someVal"', null, true).find('md-select');
      $rootScope.$apply();
      expect($log.warn).toHaveBeenCalled();

      $log.warn.calls.reset();
      setupSelect('ng-model="someVal", aria-label="Hello world"').find('md-select');
      $rootScope.$apply();
      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('sets up the aria-expanded attribute', inject(function($document) {

      expect(el.attr('aria-expanded')).toBe('false');
      openSelect(el);
      expect(el.attr('aria-expanded')).toBe('true');

      closeSelect(el);
      waitForSelectClose();

      expect(el.attr('aria-expanded')).toBe('false');
    }));
    it('sets up the aria-multiselectable attribute', inject(function($document, $rootScope) {
      $rootScope.model = [1,3];
      var el = setupSelectMultiple('ng-model="$root.model"', [1,2,3]).find('md-select');

      expect(el.attr('aria-multiselectable')).toBe('true');
    }));
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


    afterEach(inject(function($document) {
      var selectMenus = $document.find('md-select-menu');
      selectMenus.remove();
    }));

    describe('md-select', function() {
      it('can be opened with a space key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 32);
        waitForSelectOpen();
        expectSelectOpen(el);
      });

      it('can be opened with an enter key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 13);
        waitForSelectOpen();
        expectSelectOpen(el);
      });

      it('can be opened with the up key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 38);
        waitForSelectOpen();
        expectSelectOpen(el);
      });

      it('can be opened with the down key', function() {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 40);
        waitForSelectOpen();
        expectSelectOpen(el);
      });

      it('supports typing an option name', inject(function($document, $rootScope) {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]).find('md-select');
        pressKey(el, 50);
        expect($rootScope.someModel).toBe(2);
      }));
    });

    describe('md-select-menu', function() {
      it('can be closed with escape', inject(function($document) {
        var el = setupSelect('ng-model="someVal"', [1, 2, 3]).find('md-select');
        openSelect(el);
        expectSelectOpen(el);
        var selectMenu = $document.find('md-select-menu');
        expect(selectMenu.length).toBe(1);
        pressKey(selectMenu, 27);
        waitForSelectClose();
        expectSelectClosed(el);
      }));
    });
  });

  function setupSelect(attrs, options, skipLabel, scope, optCompileOpts) {
    var el;

    inject(function($compile, $rootScope) {
      var src = '<md-input-container>';
      if (!skipLabel) {
        src += '<label>Label</label>';
      }
      src += '<md-select ' + (attrs || '') + '>' + optTemplate(options, optCompileOpts) + '</md-select></md-input-container>';
      var template = angular.element(src);
      el = $compile(template)(scope || $rootScope);
      $rootScope.$digest();
    });
    attachedElements.push(el);

    return el;
  }

  function setupSelectMultiple(attrs, options, skipLabel, scope) {
    attrs = (attrs || '') + ' multiple';
    return setupSelect(attrs, options, skipLabel, scope);
  }

  function optTemplate(options, compileOpts) {
    var optionsTpl = '';
    inject(function($rootScope) {
      if (angular.isArray(options)) {
        $rootScope.$$values = options;
        var renderValueAs = compileOpts ? compileOpts.renderValueAs || 'value' : 'value';
        optionsTpl = '<md-option ng-repeat="value in $$values" ng-value="value"><div class="md-text">{{' + renderValueAs + '}}</div></md-option>';
      } else if (angular.isString(options)) {
        optionsTpl = options;
      }
    });
    return optionsTpl;
  }

  function selectedOptions(el) {
    var res;
    var querySelector = 'md-option[selected]';
    inject(function($document) {
      res = angular.element($document[0].querySelectorAll(querySelector));
      if (!res.length) {
        res = angular.element(el[0].querySelectorAll(querySelector));
      }
    });
    return res;
  }

  function openSelect(el) {
    if (el[0].nodeName != 'MD-SELECT') {
      el = el.find('md-select');
    }
    try {
      el.triggerHandler('click');
      waitForSelectOpen();
      el.triggerHandler('blur');
    } catch (e) { }
  }

  function closeSelect() {
    inject(function($document) {
      var backdrop = $document.find('md-backdrop');
      if (!backdrop.length) throw Error('Attempted to close select with no backdrop present');
      $document.find('md-backdrop').triggerHandler('click');
    });
    waitForSelectClose();
  }


  function pressKey(el, code) {
      el.triggerHandler({
        type: 'keydown',
        keyCode: code
      });
  }

  function waitForSelectOpen() {
    inject(function($material) {
      $material.flushInterimElement();
    });
  }

  function waitForSelectClose() {
    inject(function($material) {
      $material.flushInterimElement();
    });
  }

  function clickOption(select, index) {
    inject(function($rootScope, $document) {
      expectSelectOpen(select);
      var openMenu = $document.find('md-select-menu');
      var opt = angular.element(openMenu.find('md-option')[index]).find('div')[0];

      if (!opt) throw Error('Could not find option at index: ' + index);
      var target = angular.element(opt);
      angular.element(openMenu).triggerHandler({
        type: 'click',
        target: target,
        currentTarget: openMenu[0]
      });
    });
  }

  function expectSelectClosed(element) {
    inject(function($document) {
      var menu = angular.element($document[0].querySelector('.md-select-menu-container'));
      if (menu.length) {
        if (menu.hasClass('md-active') || menu.attr('aria-hidden') == 'false') {
          throw Error('Expected select to be closed');
        }
      }
    });
  }

  function expectSelectOpen(element) {
    inject(function($document) {
      var menu = angular.element($document[0].querySelector('.md-select-menu-container'));
      if (!(menu.hasClass('md-active') && menu.attr('aria-hidden') == 'false')) {
        throw Error('Expected select to be open');
      }
    });
  }

});
