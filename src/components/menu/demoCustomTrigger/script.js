angular
  .module('menuDemoCustomTrigger', ['ngMaterial'])
  .config(function($mdIconProvider) {
    $mdIconProvider
      .iconSet('call', 'img/icons/sets/communication-icons.svg', 24);
  });
