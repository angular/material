  /**
   * Angular Mds initialization function that validates environment
   * requirements.
   */
  angular.module('material.core', [] )
    .run(function validateEnvironment() {

      if (typeof Hammer === 'undefined') {
        throw new Error(
          'ngMaterial requires HammerJS to be preloaded.'
        );
      }

    });




