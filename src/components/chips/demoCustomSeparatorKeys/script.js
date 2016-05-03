(function () {
  'use strict';
  angular
      .module('chipsCustomSeparatorDemo', ['ngMaterial'])
      .controller('CustomSeparatorCtrl', DemoCtrl);

  function DemoCtrl ($mdConstant) {
    // Use common numeric key codes found in $mdConstant.KEY_CODE or
    // length-one strings for characters
    this.keys = [$mdConstant.KEY_CODE.ENTER, ','];
    this.tags = [];

    // Any key code can be used to create a custom separator. Note
    // that key codes ignore modifiers, so this makes shift+semicolon
    // a separator, too
    var semicolon = 186;
    // Use this instead if you only want semicolon as separator
    // var semicolon = ';';
    this.customKeys = [$mdConstant.KEY_CODE.ENTER, ',', semicolon];
    this.contacts = ['test@example.com'];
  }
})();
