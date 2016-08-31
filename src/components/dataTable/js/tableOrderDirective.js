angular
  .module('material.components.table')
  .directive('mdOrder', MdTableOrderDirective);

function MdTableOrderDirective() {
  return {
    restrict: 'A',
    require: ['mdOrder', 'mdHead'],
    bindToController: true,
    scope: {
      value: '=mdOrder',
      onReorder: '&?mdOnReorder'
    },
    controller: MdTableOrderController,
    controllerAs: '$mdOrder'
  };
}

function MdTableOrderController($scope, $mdUtil) {
  var self = this;

  self.setSortOrder = function(order) {
    self.value = order;

    $mdUtil.nextTick(function() {
      $scope.$eval(self.onReorder);
    });
  }

}