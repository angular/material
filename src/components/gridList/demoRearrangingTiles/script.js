
angular
  .module('gridListDemoApp', ['ngMaterial'])
  .controller('gridListDemoCtrl', function($scope) {

    this.order = undefined;

    this.tiles = buildGridModel();
    this.sortTiles = sortTiles;
    this.getTiles = getTiles;


    function getTiles() {
      return this.tiles;
    };

    function sortTiles() {
      this.tiles.sort(function(a, b) {
        return a.val - b.val;
      });

      if (this.order !== 0) {
        this.tiles.reverse();
      }
    };

    function buildGridModel() {
      var tiles = [{val: 1},{ val:4},{ val:3},{ val:7},{ val:5},{ val:2},{ val:6}];

      return tiles;
    }
  })
  .config( function( $mdIconProvider ){
    $mdIconProvider.iconSet("avatar", './icons/avatar-icons.svg', 128);
  });
