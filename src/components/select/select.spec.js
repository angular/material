describe('<md-select>', function() {

  beforeEach(module('material.components.select', 'ngAnimateMock'));

  beforeEach(inject(function($mdUtil, $$q) {
    $mdUtil.transitionEndPromise = function() {
      return $$q.when(true);
    };
  }));

  function setupSelect(attrs, options) {
    var el;
    inject(function($compile, $rootScope) {
      var src = '<md-select ' + (attrs || '') + '>' + optTemplate(options) + '</md-select>';
      var template = angular.element(src);
      el = $compile(template)($rootScope);
      $rootScope.$digest();
      $rootScope.$digest();
    });
    return el;
  }

  function setup(attrs, options) {
    var el;
    inject(function($compile, $rootScope) {
      var optionsTpl = optTemplate(options);
      var fullTpl = '<md-select-menu ' + (attrs || '') + '>' + optionsTpl +
               '</md-select-menu>';
      el = $compile(fullTpl)($rootScope);
      $rootScope.$apply();
    });
    return el;
  }

  function setupMultiple(attrs, options) {
    attrs = (attrs || '') + ' multiple';
    return setup(attrs, options);
  }

  function optTemplate(options) {
    var optionsTpl = '';
    inject(function($rootScope) {
      if (angular.isArray(options)) {
        $rootScope.$$values = options;
        optionsTpl = '<md-option ng-repeat="value in $$values" ng-value="value">{{value}}</md-option>';
      } else if (angular.isString(options)) {
        optionsTpl = options;
      }
    });
    return optionsTpl;
  }

  function selectedOptions(el) {
    return angular.element(el[0].querySelectorAll('md-option[selected]'));
  }

  function openSelect(el) {
    try {
      el.triggerHandler('click');
      waitForSelectOpen();
      inject(function($timeout) {
        $timeout.flush();
      });
    } catch(e) { }
  }


  function pressKey(el, code) {
      el.triggerHandler({
        type: 'keydown',
        keyCode: code
      });
  }

  function waitForSelectOpen() {
    try {
      inject(function($rootScope, $animate) {
          $rootScope.$digest();
          $animate.triggerCallbacks();
      });
    } catch(e) { }
  }

  function waitForSelectClose() {
    try {
      inject(function($rootScope, $animate ) {
        $rootScope.$apply();
        $animate.triggerCallbacks();

      });
    } catch(e) { }
  }

  it('should preserve tabindex', inject(function($document) {
    var select = setupSelect('tabindex="2", ng-model="val"');
    expect(select.attr('tabindex')).toBe('2');
  }));

  it('supports non-disabled state', inject(function($document) {
    var select = setupSelect('ng-model="val"');
    expect(select.attr('aria-disabled')).toBe('false');
  }));

  it('supports disabled state', inject(function($document) {
    var select = setupSelect('disabled="disabled", ng-model="val"');
    openSelect(select);
    expect($document.find('md-select-menu').length).toBe(0);
    expect(select.attr('aria-disabled')).toBe('true');
  }));

  xit('closes the menu if the element is destroyed', inject(function($document, $rootScope) {
    var select = setupSelect('ng-model="val"');

    openSelect(select);
    expect($document.find('md-select-menu').length).toBe(1);

    select.scope().$destroy();
    waitForSelectClose();

    expect($document.find('md-select-menu').length).toBe(0);
  }));

  it('restores focus to select when the menu is closed', inject(function($document) {
    var select = setupSelect('ng-model="val"');
    openSelect(select);

    $document[0].body.appendChild(select[0]);

    var selectMenu = $document.find('md-select-menu');
    pressKey(selectMenu, 27);
    waitForSelectClose();

    expect($document[0].activeElement).toBe(select[0]);
    select.remove();
  }));

  describe('label behavior', function() {
    it('defaults to the placeholder text', function() {
      var select = setupSelect('ng-model="someVal", placeholder="Hello world"');
      var label = select.find('md-select-label');
      expect(label.text()).toBe('Hello world');
      expect(label.hasClass('md-placeholder')).toBe(true);
    });

    it('sets itself to the selected option\'s label', inject(function($rootScope, $compile) {
      $rootScope.val = 2;
      var select = $compile('<md-select ng-model="val" placeholder="Hello World">' +
                              '<md-option value="1">One</md-option>' +
                              '<md-option value="2">Two</md-option>' +
                              '<md-option value="3">Three</md-option>' +
                            '</md-select>')($rootScope);
      var label = select.find('md-select-label');
      $rootScope.$digest();

      expect(label.text()).toBe('Two');
      expect(label.hasClass('md-placeholder')).toBe(false);
    }));

    it('supports rendering multiple', inject(function($rootScope, $compile) {
      $rootScope.val = [1, 3];
      var select = $compile('<md-select multiple ng-model="val" placeholder="Hello World">' +
                              '<md-option value="1">One</md-option>' +
                              '<md-option value="2">Two</md-option>' +
                              '<md-option value="3">Three</md-option>' +
                            '</md-select>')($rootScope);
      var label = select.find('md-select-label');
      $rootScope.$digest();

      expect(label.text()).toBe('One, Three');
      expect(label.hasClass('md-placeholder')).toBe(false);
    }));
  });

  it('auto-infers a value when none specified', inject(function($rootScope) {
      $rootScope.name = "Hannah";
      var el = setup('ng-model="name"', '<md-option>Tom</md-option>' +
            '<md-option>Hannah</md-option>');
      expect(selectedOptions(el).length).toBe(1);
  }));

  it('errors for duplicate md-options, non-dynamic value', inject(function($rootScope) {
    expect(function() {
      setup('ng-model="$root.model"', '<md-option value="a">Hello</md-option>' +
            '<md-option value="a">Goodbye</md-option>');
    }).toThrow();
  }));

  it('errors for duplicate md-options, ng-value', inject(function($rootScope) {
    setup('ng-model="$root.model"', '<md-option ng-value="foo">Hello</md-option>' +
          '<md-option ng-value="bar">Goodbye</md-option>');
    $rootScope.$apply('foo = "a"');
    expect(function() {
      $rootScope.$apply('bar = "a"');
    }).toThrow();
  }));

  it('watches the collection for changes', inject(function($rootScope) {
    $rootScope.val = 1;
    var select = setupSelect('ng-model="val"', [1, 2, 3]);
    var label = select.find('md-select-label')[0];
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
        var el = setup('ng-model="$root.model"', ['a','b','c']);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
      }));

      it('renders nothing if no initial value is set', function() {
        var el = setup('ng-model="$root.model"', ['a','b','c']);
        expect(selectedOptions(el).length).toBe(0);
      });

      it('renders model change by selecting new and deselecting old', inject(function($rootScope) {
        $rootScope.$apply('model = "b"');
        var el = setup('ng-model="$root.model"', ['a','b','c']);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = "c"');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect(selectedOptions(el).length).toBe(1);
      }));

      it('renders invalid model change by deselecting old and selecting nothing', inject(function($rootScope) {
        $rootScope.$apply('model = "b"');
        var el = setup('ng-model="$root.model"', ['a','b','c']);
        
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = "d"');
        expect(selectedOptions(el).length).toBe(0);
      }));

      it('renders model change to undefined by deselecting old and selecting nothing', inject(function($rootScope) {
        $rootScope.$apply('model = "b"');
        var el = setup('ng-model="$root.model"', ['a','b','c']);
        
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = undefined');
        expect(selectedOptions(el).length).toBe(0);
      }));

      it('uses track by if given to compare objects', inject(function($rootScope) {
        $rootScope.$apply('model = {id:2}');
        var el = setup('ng-model="$root.model" ng-model-options="{trackBy: \'$value.id\'}"',
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
        var el = setup('ng-model="$root.model"', [one, two, three]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = {}');

        expect(selectedOptions(el).length).toBe(0);
      }));

    });

    describe('view->model', function() {

      it('should do nothing if clicking selected option', inject(function($rootScope) {
        $rootScope.model = 3;
        var el = setup('ng-model="$root.model"', [1,2,3]);

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
          var changeCalled = false;
          $rootScope.changed = function() {
            changeCalled = true;
          };

          var selectEl = setupSelect('ng-model="myModel", ng-change="changed()"', [1, 2, 3]);
          openSelect(selectEl);

          var menuEl = $document.find('md-select-menu');
          menuEl.triggerHandler({
            type: 'click',
            target: menuEl.find('md-option')[1]
          });
          expect(changeCalled).toBe(true);
      }));

      it('should deselect old and select new on click', inject(function($rootScope) {
        $rootScope.model = 3;
        var el = setup('ng-model="$root.model"', [1,2,3]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        
        el.triggerHandler({
          type: 'click',
          target: el.find('md-option')[1]
        });
        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
        expect($rootScope.model).toBe(2);
      }));

      it('should keep model value if selected option is removed', inject(function($rootScope) {
        $rootScope.model = 3;
        $rootScope.values = [1,2,3];
        var el = setup('ng-model="$root.model"', '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

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
        var el = setup('ng-model="$root.model"', '<md-option ng-repeat="v in values" ng-value="v">{{v}}</md-option>');

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
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4]);
        
        expect(selectedOptions(el).length).toBe(2);
        expect(el.find('md-option').eq(0).attr('selected')).toBe('selected');
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([1,3]);
      }));

      it('renders nothing if empty array is set', inject(function($rootScope) {
        $rootScope.model = [];
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      }));

      it('adding a valid value to the model selects its option', inject(function($rootScope) {
        $rootScope.model = [];
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);

        $rootScope.$apply('model.push(2)');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([2]);
      }));
      
      it('removing a valid value from the model deselects its option', inject(function($rootScope) {
        $rootScope.model = [2,3];
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([2,3]);

        $rootScope.$apply('model.shift()');

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(2).attr('selected')).toBe('selected');
        expect($rootScope.model).toEqual([3]);
      }));

      it('deselects all options when setting to an empty model', inject(function($rootScope) {
        $rootScope.model = [2,3];
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4]);

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([2,3]);

        $rootScope.$apply('model = []');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      }));

      it('adding multiple valid values to a model selects their options', inject(function($rootScope) {
        $rootScope.model = [2,3];
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4]);

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
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4,5,6]);

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
        var el = setupMultiple('ng-model="$root.model"', [1,2,3,4,5,6]);

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);

        $rootScope.$apply('model = ["bar", obj]');

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual(["bar", $rootScope.obj]);
      }));

      it('uses track by if given to compare objects', inject(function($rootScope) {
        $rootScope.$apply('model = [{id:2}]');
        var el=setupMultiple('ng-model="$root.model" ng-model-options="{trackBy: \'$value.id\'}"',
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
        var el = setupMultiple('ng-model="$root.model"', [one, two, three]);

        expect(selectedOptions(el).length).toBe(1);
        expect(el.find('md-option').eq(1).attr('selected')).toBe('selected');

        $rootScope.$apply('model = [{}]');

        expect(selectedOptions(el).length).toBe(0);
      }));

      it('errors the model if model value is truthy and not an array', inject(function($rootScope) {
        $rootScope.model = 'string';
        var el = setupMultiple('ng-model="$root.model"', [1,2,3]);
        var ngModelCtrl = el.controller('ngModel');

        expect(ngModelCtrl.$error['md-multiple']).toBe(true);

        $rootScope.$apply('model = []');
        expect(ngModelCtrl.$valid).toBe(true);
      }));

    });

    describe('view->model', function() {

      it('should deselect a selected option on click', inject(function($rootScope) {
        $rootScope.model = [1];
        var el = setupMultiple('ng-model="$root.model"', [1,2]);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);

        el.triggerHandler({
          type: 'click',
          target: el.find('md-option')[0]
        });

        expect(selectedOptions(el).length).toBe(0);
        expect($rootScope.model).toEqual([]);
      }));
      
      it('selects a deselected option on click', inject(function($rootScope) {
        $rootScope.model = [1];
        var el = setupMultiple('ng-model="$root.model"', [1,2]);

        expect(selectedOptions(el).length).toBe(1);
        expect($rootScope.model).toEqual([1]);

        el.triggerHandler({
          type: 'click',
          target: el.find('md-option')[1]
        });

        expect(selectedOptions(el).length).toBe(2);
        expect($rootScope.model).toEqual([1,2]);
      }));

      it('should keep model value if a selected option is removed', inject(function($rootScope) {
        $rootScope.model = [1];
        $rootScope.values = [1,2];
        var el = setupMultiple('ng-model="$root.model"', 
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
        var el = setupMultiple('ng-model="$root.model"', 
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
      el = setupSelect('ng-model="someModel"', [1, 2, 3]);
      var selectMenus = $document.find('md-select-menu');
      selectMenus.remove();
    }));

    it('adds an aria-label from placeholder', function() {
      var select = setupSelect('ng-model="someVal", placeholder="Hello world"');
      expect(select.attr('aria-label')).toBe('Hello world');
    });

    it('adds aria-label from label element', inject(function($rootScope, $compile) {
      var select = $compile('<md-select ng-model="val">' +
                              '<md-select-label>{{"Pick"}}</md-select-label>' +
                              '<md-option value="1">One</md-option>' +
                              '<md-option value="2">Two</md-option>' +
                              '<md-option value="3">Three</md-option>' +
                            '</md-select>')($rootScope);
      $rootScope.$digest();
      expect(select.attr('aria-label')).toBe('Pick');
    }));

    it('preserves aria-label on value change', inject(function($rootScope, $compile) {
      var select = $compile('<md-select ng-model="val">' +
                              '<md-select-label>Pick</md-select-label>' +
                              '<md-option value="1">One</md-option>' +
                              '<md-option value="2">Two</md-option>' +
                              '<md-option value="3">Three</md-option>' +
                            '</md-select>')($rootScope);
      $rootScope.$apply('model = 1');
      $rootScope.$digest();

      expect(select.attr('aria-label')).toBe('Pick');
    }));

    it('preserves existing aria-label', inject(function($rootScope) {
      var select = setupSelect('ng-model="someVal", aria-label="Hello world", placeholder="Pick"');
      expect(select.attr('aria-label')).toBe('Hello world');
    }));

    it('should expect an aria-label if none is present', inject(function($compile, $rootScope, $log) {
      spyOn($log, 'warn');
      var select = setupSelect('ng-model="someVal"');
      $rootScope.$apply();
      expect($log.warn).toHaveBeenCalled();

      $log.warn.calls.reset();
      select = setupSelect('ng-model="someVal", aria-label="Hello world"');
      $rootScope.$apply();
      expect($log.warn).not.toHaveBeenCalled();
    }));

    it('sets up the aria-expanded attribute', inject(function($document) {
      expect(el.attr('aria-expanded')).toBe('false');
      openSelect(el);
      expect(el.attr('aria-expanded')).toBe('true');

      var selectMenu = $document.find('md-select-menu');
      pressKey(selectMenu, 27);
      waitForSelectClose();
      expect(el.attr('aria-expanded')).toBe('false');
    }));
    it('sets up the aria-multiselectable attribute', inject(function($document, $rootScope) {
      $rootScope.model = [1,3];
      var el = setupMultiple('ng-model="$root.model"', [1,2,3]);

      expect(el.attr('aria-multiselectable')).toBe('true');
    }));
    it('sets up the aria-selected attribute', inject(function($rootScope) {
      var el = setup('ng-model="$root.model"', [1,2,3]);
      var options = el.find('md-option');
      expect(options.eq(2).attr('aria-selected')).toBe('false');
      el.triggerHandler({
        type: 'click',
        target: el.find('md-option')[2]
      });
      expect(options.eq(2).attr('aria-selected')).toBe('true');
    }));
  });

  describe('keyboard controls', function() {


    afterEach(inject(function($document) {
      var selectMenus = $document.find('md-select-menu');
      selectMenus.remove();
    }));

    describe('md-select', function() {
      it('can be opened with a space key', inject(function($document) {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]);
        pressKey(el, 32);
        waitForSelectOpen();
        var selectMenu = angular.element($document.find('md-select-menu'));
        expect(selectMenu.length).toBe(1);
      }));

      it('can be opened with an enter key', inject(function($document) {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]);
        pressKey(el, 13);
        waitForSelectOpen();
        var selectMenu = angular.element($document.find('md-select-menu'));
        expect(selectMenu.length).toBe(1);
      }));

      it('can be opened with the up key', inject(function($document) {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]);
        pressKey(el, 38);
        waitForSelectOpen();
        var selectMenu = angular.element($document.find('md-select-menu'));
        expect(selectMenu.length).toBe(1);
      }));

      it('can be opened with the down key', inject(function($document) {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]);
        pressKey(el, 40);
        waitForSelectOpen();
        var selectMenu = angular.element($document.find('md-select-menu'));
        expect(selectMenu.length).toBe(1);
      }));

      it('supports typing an option name', inject(function($document, $rootScope) {
        var el = setupSelect('ng-model="someModel"', [1, 2, 3]);
        pressKey(el, 50);
        expect($rootScope.someModel).toBe(2);
      }));
    });

    describe('md-select-menu', function() {
      it('can be closed with escape', inject(function($document, $rootScope, $animate) {
        var el = setupSelect('ng-model="someVal"', [1, 2, 3]);
        openSelect(el);
        var selectMenu = angular.element($document.find('md-select-menu'));
        expect(selectMenu.length).toBe(1);
        pressKey(selectMenu, 27);
        waitForSelectClose();
        expect($document.find('md-select-menu').length).toBe(0);
      }));
    });
  });
});
