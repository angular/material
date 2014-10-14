  /**
   * Angular Mds initialization function that validates environment
   * requirements.
   */
  angular.module('material.core', ['ngAria'] )
    .run(function validateEnvironment() {

      if (angular.isUndefined( window.Hammer )) {
        throw new Error(
          '$mdSwipe requires HammerJS to be preloaded.'
        );
      }

    });




