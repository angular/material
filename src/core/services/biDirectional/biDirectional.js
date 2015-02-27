(function () {
  'use strict';

  angular.module('material.core')
    .provider('$mdBiDirectional', BiDirectionalProvider);

  /**
   * Returns a new provider which allows configuration of a new BiDirectional
   * service. Allows configuration of direction.
   */
  function BiDirectionalProvider() {
    var provider = {
      rtlMode: rtlMode,
      $get: factory
    };

    var direction = 'ltr';

    /**
     * Enables rtl mode if true is passed
     *
     * @param {Boolean} mode
     */
    function rtlMode(mode) {
      if (mode) {
        direction = 'rtl';
      }
    }

    /**
     * Creates an instance of BiDirectional
     */
    function factory() {
      return new BiDirectional(direction);
    }

    return provider;
  }

  /**
   * BiDirectional function service to declare direction mode
   *
   * @param direction
   * @constructor
   */
  function BiDirectional(direction) {
    this.direction = direction;
  }

  /**
   * Check if direction is set to rtl
   *
   * @returns {boolean}
   */
  BiDirectional.prototype.isRTL = function () {
    return this.direction === 'rtl';
  };

  /**
   * Check if direction is set to ltr
   *
   * @returns {boolean}
   */
  BiDirectional.prototype.isLTR = function () {
    return this.direction === 'ltr';
  };

})();