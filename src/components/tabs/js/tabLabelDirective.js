angular
    .module('material.components.tabs')
    .directive('mdTabLabel', MdTabLabel);

function MdTabLabel () {
  return { terminal: true };
}

