(function () {
  'use strict';
  angular
      .module('material.components.chips')
      .controller('MdChipsCtrl', MdChipsCtrl);

  function MdChipsCtrl ($scope, $element, $q, $mdUtil, $mdConstant, $log) {
    //-- private variables
    var self = this;
    this.$mdConstant = $mdConstant;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {Array.<Object>} */
    this.items = [];

    //-- public variables
    self.scope = $scope;

    return self.init();

    // How to update the model:
    // self.ngModelCtrl.$setViewValue(new Date(Number(this.dataset.timestamp)));
    // self.ngModelCtrl.$render();

  }

  /** 
   * The model used by the input element.
   * @type {!String}
   */
  MdChipsCtrl.prototype.itemBuffer = '';

  MdChipsCtrl.prototype.workerInputKeydown = function(event) { 
    switch (event.keyCode) {
      case this.$mdConstant.KEY_CODE.DOWN_ARROW:
          break;
      case this.$mdConstant.KEY_CODE.UP_ARROW:
          break;
      case this.$mdConstant.KEY_CODE.ENTER:
          this.appendBuffer();
          break;
      case 8:
          if (this.itemBuffer == '') {
            this.removeItem(this.items.length - 1);
          }
          break;
      case this.$mdConstant.KEY_CODE.ESCAPE:
          break;
      case this.$mdConstant.KEY_CODE.TAB:
          break;
      default:
    }
  };


  MdChipsCtrl.prototype.appendBuffer = function() {
   this.ngModelCtrl.$viewValue.push(angular.copy(this.itemBuffer));
   this.resetBuffer();
  }

  MdChipsCtrl.prototype.resetBuffer = function() {
    this.itemBuffer = '';
  }

  MdChipsCtrl.prototype.removeItem = function(idx) {
    this.items.splice(idx, 1);
  }

  MdChipsCtrl.prototype.init = function() {
  }


  MdChipsCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      // model is updated. do something.
      // self.ngModelCtrl.$viewValue
      self.items = self.ngModelCtrl.$viewValue;
    }; 
    //this.items = this.ngModelCtrl.$viewValue;
  };
})();
