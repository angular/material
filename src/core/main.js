  /**
   * Angular Materials initialization function that validates environment
   * requirements.
   */
  angular.module('material.core',['ng'])
    .run(function validateEnvironment() {

      if (angular.isUndefined( window.Hammer )) {
        throw new Error(
          '$materialSwipe requires HammerJS to be preloaded.'
        );
      }

    });




