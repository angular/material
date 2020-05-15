angular
  .module('menuBarDemoDynamicNestedMenus', ['ngMaterial'])
  .config(function ($mdIconProvider) {
    $mdIconProvider.iconSet("call", 'img/icons/sets/communication-icons.svg', 24);
  })
  .controller('DemoDynamicNestedMenusCtrl', function DemoCtrl($log) {
    this.organizations = [
      {
        department: 'Sales',
        managers: [
          {
            name: 'Jane',
            reports: [
              {name: 'Rick'},
              {name: 'Joan'},
              {name: 'Ron'}
            ]
          },
          {
            name: 'Jim',
            reports: [
              {name: 'Bob'},
              {name: 'Sandra'},
              {name: 'Juan'}
            ]
          }
        ]
      },
      {
        department: 'Engineering',
        managers: [
          {
            name: 'Janet',
            reports: [
              {name: 'Betty'},
              {name: 'Corrie'},
              {name: 'Carlos'}
            ]
          },
          {
            name: 'Randy',
            reports: [
              {name: 'Julia'},
              {name: 'Matt'},
              {name: 'Kara'}
            ]
          }
        ]
      },
      {
        department: 'Marketing',
        managers: [
          {
            name: 'Peggy',
            reports: [
              {name: 'Dwight'},
              {name: 'Pam'},
              {name: 'Jeremy'}
            ]
          },
          {
            name: 'Andrew',
            reports: [
              {name: 'Stephen'},
              {name: 'Naomi'},
              {name: 'Erin'}
            ]
          }
        ]
      }
    ];

    this.onClick = function onClick(item) {
      $log.log(item);
    };
  });
