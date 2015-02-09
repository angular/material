describe('Text Field directives', function() {
  beforeEach(module('material.components.textField'));

  describe('- mdInputGroup', function() {
    var scope;

    beforeEach(function() {
      scope = {
        user : {
          firstName: 'Thomas',
          lastName: 'Burleson',
          email: 'ThomasBurleson@gmail.com',
          password: 'your password is incorrect'
        }
      };
    });

    it('should set input class for focus & blur', function() {
      var expressions = {label:"Firstname", model:"user.firstName"},
          el = setupInputGroup( expressions, scope),
          input = el.find('input');

      input.triggerHandler('focus');
      expect(el.hasClass('md-input-focused')).toBe(true);
      input.triggerHandler('blur');
      expect(el.hasClass('md-input-focused')).toBe(false);
    });

    it('should set input class for input event', function() {
      var expressions = {label:"email", model:"user.email", type:"email"},
          el = setupInputGroup( expressions, scope),
          input = el.find('input');

      expect(el.hasClass('md-input-has-value')).toBe(true);

      input.val('');
      input.triggerHandler('input');
      expect(el.hasClass('md-input-has-value')).toBe(false);

      input.val('ThomasBurleson@gmail.com');
      input.triggerHandler('input');
      expect(el.hasClass('md-input-has-value')).toBe(true);
    });

    it('should set input class for ngModel render', function() {
      var expressions = {label:"Firstname", model:"user.firstName"},
          el = setupInputGroup( expressions, scope),
          input = el.find('input');

      expect(el.hasClass('md-input-has-value')).toBe(true);

      input.scope().$apply('user.firstName = ""');
      expect(el.hasClass('md-input-has-value')).toBe(false);

      input.scope().$apply('user.firstName = "Thomas"');
      expect(el.hasClass('md-input-has-value')).toBe(true);
    });

  });

  describe(' - mdTextFloat', function() {
    var model;
    beforeEach(function() {
      model = {
        labels : {
          firstName: 'FirstName',
          lastName: 'LastName',
          email: 'eMail',
          password: 'Password'
        },
        user : {
          firstName: 'Andrew',
          lastName: 'Joslin',
          email: 'AndrewJoslin@drifty.com',
          password: 'public'
        }
      };
    });

    it('should set input type `password` properly', function() {
      var el = setupTextFloat( { type:"password" }, model);
      expect( el.find('input').attr('type')).toBe("password");
      expect( el.find('input').val()).toBe("");
    });
    it('should set input type `email` properly', function() {
      var el = setupTextFloat( { type:"email" }, model);
      expect( el.find('input').attr('type')).toBe("email");
      expect( el.find('input').val()).toBe("");
    });

    it('should set a static label properly', function() {
      var el = setupTextFloat( { label:"motto" }, model);
      expect( el.find('label').text() ).toBe("motto");

      expect( el.find('input').attr('type')).toBe("text");
      expect( el.find('input').val()).toBe("");
    });
    it('should update a label from model changes.', function() {
      var markup ='<md-text-float ' +
                    '  label="{{labels.firstName}}" ' +
                    '  ng-model="user.firstName" >' +
                    '</md-text-float>';
      var el = buildElement( markup, model);

      expect( el.find('input').val() ).toBe("Andrew");
      expect( el.find('label').text() ).toBe("FirstName");

      // Change model value of the `firstName` [field] label
      // then check if the dom is updated

      var val2  = "Corporate Title:";
      el.find('label').scope().$apply(function(){
        model.labels.firstName = val2;
      });
      expect( el.find('label').text() ).toBe( val2 );

    });
    it('should update an input value from model changes.', function() {
      var markup ='<md-text-float ' +
                  '  label="{{labels.firstName}}" ' +
                  '  ng-model="user.firstName" >' +
                  '</md-text-float>';
      var el = buildElement( markup, model);
      var input = el.find('input');

      expect( input.val() ).toBe("Andrew");

      var name = "AngularJS";
      input.scope().$apply(function(){
        model.user.firstName = name;
      });
      expect( input.val() ).toBe( name );

    });

    // Breaks on IE
    xit('should update a model value from input changes.', function() {
      var markup ='<md-text-float ' +
                  '  label="{{labels.firstName}}" ' +
                  '  ng-model="user.firstName" >' +
                  '</md-text-float>';
      var el = buildElement( markup, model);
      var input = el.find('input');

      expect( input.val() ).toBe( model.user.firstName );

      input.val( "AngularJS" );
      input.triggerHandler('input');
      expect( model.user.firstName ).toBe( "AngularJS" );

    });

    it('should set input class for focus & blur', function() {
      var expressions = {label:"Firstname", model:"user.firstName"},
          el = setupTextFloat( expressions, model),
          input = el.find('input');

      input.triggerHandler('focus');
      expect(el.hasClass('md-input-focused')).toBe(true);
      input.triggerHandler('blur');
      expect(el.hasClass('md-input-focused')).toBe(false);
    });
    it('should set input class for input event', function() {
      var expressions = {label:"password", model:"user.password", type:"password"},
          el = setupTextFloat( expressions, model),
          input = el.find('input');

      expect(el.hasClass('md-input-has-value')).toBe(true);

      input.val('');
      input.triggerHandler('input');
      expect(el.hasClass('md-input-has-value')).toBe(false);

      input.val('ThomasBurleson@gmail.com');
      input.triggerHandler('input');
      expect(el.hasClass('md-input-has-value')).toBe(true);
    });
    it('should set input class for ngModel changes', function() {
      var expressions = {label:"Password", model:"user.password", type:"password"},
          el = setupTextFloat( expressions, model),
          input = el.find('input');

      expect(el.hasClass('md-input-has-value')).toBe(true);

      input.scope().$apply(function(){  model.user.password = ""; });
      expect(el.hasClass('md-input-has-value')).toBe(false);

      input.scope().$apply(function() { model.user.password = "hiddenValley"; });
      expect(el.hasClass('md-input-has-value')).toBe(true);
    });

    it('should pair input and label for accessibility.', function() {
      var markup ='<md-text-float ' +
                  '  md-fid="093" ' +
                  '  label="{{labels.firstName}}" ' +
                  '  ng-model="user.firstName" >' +
                  '</md-text-float>';
      var el = buildElement( markup, model);
      var input = el.find('input');
      var label = el.find('label');

      expect( label.attr('for') ).toBe( "093" );
      expect( input.attr('id') ).toBe( label.attr('for') );
    });

    it('should auto-pair input and label for accessibility.', function() {
      var markup ='<md-text-float ' +
                  '  label="{{labels.firstName}}" ' +
                  '  ng-model="user.firstName" >' +
                  '</md-text-float>';
      var el = buildElement( markup, model);
      var input = el.find('input');
      var label = el.find('label');

      expect( label.attr('for') === "" ).toBe( false );
      expect( input.attr('id') ).toBe( label.attr('for') );
    });

    it('should add an ARIA attribute for disabled inputs', function() {
      var markup ='<md-text-float ng-disabled="true" ' +
                  '  label="{{labels.firstName}}" ' +
                  '  ng-model="user.firstName" >' +
                  '</md-text-float>';
      var el = buildElement( markup, model);
      var input = el.find('input');

      expect( input.attr('aria-disabled') ).toBe( 'true' );
    });
  });

  // ****************************************************************
  // Utility `setup` methods
  // ****************************************************************

  var templates = {
    md_text_float : '<md-text-float ' +
                '   type="{{type}}" ' +
                '   label="{{label}}" ' +
                '   ng-model="{{model}}" >' +
                '</md-text-float>',

    md_input_group: '<div class="md-input-group" tabindex="-1">' +
                ' <label>{{label}}</label>' +
                ' <md-input id="{{id}}" type="{{type}}" ng-model="{{model}}"></md-input>' +
                '</div>'
  };

  /**
   * Build a text float group using the `<md-input-group />` markup template
   */
  function setupInputGroup(expressions, values) {
    values = angular.extend({},{type:"text", id:''},values||{});

    return buildElement( templates.md_input_group, values, angular.extend({}, expressions||{}));
  }

  /**
   * Build a text float group using the `<md-text-float />` markup template
   */
  function setupTextFloat(expressions, values) {
    values = angular.extend({ modelValue:"",type:'text' }, values || {});

    var defaults = {model:"modelValue", label:""};
    var tokens = angular.extend({}, defaults, expressions||{} );

    return buildElement( templates.md_text_float, values, tokens );
  }

  /**
   * Use the specified template markup, $compile to the DOM build
   * and link both the bindings and attribute assignments.
   * @returns {*} DOM Element
   */
  function buildElement( template, scope, interpolationScope  ) {
    var el;

    inject(function($compile, $interpolate, $rootScope) {
      scope = angular.extend( $rootScope.$new(), scope || {});

      // First substitute interpolation values into the template... if any
      if ( interpolationScope ) {
        template = $interpolate( template )( interpolationScope );
      }

      // Compile the template using the scope model(s)
      el = $compile( template )( scope );
      $rootScope.$apply();

    });
    return el;
  }

});


