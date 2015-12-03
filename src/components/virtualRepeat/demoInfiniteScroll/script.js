(function () {
  'use strict';

    angular
      .module('virtualRepeatInfiniteScrollDemo', ['ngMaterial'])
      .controller('AppCtrl', function($timeout) {

        // In this example, we set up our model using a plain object.
        // Using a class works too. All that matters is that we implement
        // getItemAtIndex and getLength.
        this.infiniteItems = {
          numLoaded_: 0,
          toLoad_: 0,
          items: [],

          // This is constantly polled for the item that the directive is trying to load
          getItemAtIndex: function(index) {
            
            if (index > this.numLoaded_) {
              this.fetchMoreItems_(index);

              // The item hasn't been loaded yet return null and poll the function again later
              return null;
            }

            //Return the item that was populated in an "AJAX" call before
            return this.items[index];
          },

          // Required.
          // For infinite scroll behavior, we always return a slightly higher
          // number than the previously loaded items.
          getLength: function() {
            return this.numLoaded_ + 5;
          },

          fetchMoreItems_: function(index) {
            // For demo purposes, we simulate loading more items with a timed
            // promise. In real code, this function would likely contain an
            // $http request.

            if (this.toLoad_ < index) {
              this.toLoad_ += 20;
              $timeout(angular.noop, 500).then(angular.bind(this, function() {
                //This demonstrates filling up the items array with variables
                for(i=this.numLoaded_; i<=this.toLoad_ ; i++){
                  this.items[i] = "Item #"+i+ " loaded in fetch up to "+index;
                }                
                this.numLoaded_ = this.toLoad_;
              }));
            }
          }
        };
      });
})();
