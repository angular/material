
angular
  .module('gridListDemoApp', ['ngMaterial'])
  .controller('gridListDemoCtrl', function($scope) {

    this.order = 0;

    this.tiles = buildGridModel();
    this.sortTiles = sortTiles;
    this.getTiles = function() {
      return this.tiles;
    }.bind(this);

    function sortTiles() {
      console.log(this.order);
      this.tiles.sort(function(a, b) {
        return b.name - a.name;
      });

      if (this.order != 0) {
        this.tiles.reverse();
      }

      console.log(this.tiles);
    };

    function buildGridModel(){
      var tiles = [{name: 1},{ name:2},{ name:3},{ name:4},{ name:5},{ name:6},{ name:7}];

      return tiles;
    }
  })
  .config( function( $mdIconProvider ){
    $mdIconProvider.iconSet("avatar", './icons/avatar-icons.svg', 128);
  });
