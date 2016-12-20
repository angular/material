/**
 * @ngdoc module
 * @name material.core.liveannouncer
 * @description
 * Angular Material Live Announcer to provide accessibility for Voice Readers.
 */
angular
  .module('material.core')
  .service('$mdLiveAnnouncer', MdLiveAnnouncer);

/**
 * @ngdoc service
 * @name $mdLiveAnnouncer
 * @module material.core.liveannouncer
 *
 * @description
 *
 * Service to announce messages to supported screenreaders.
 *
 * > The `$mdLiveAnnouncer` service is internally used for components to provide proper accessibility.
 *
 * <hljs lang="js">
 *   module.controller('AppCtrl', function($mdLiveAnnouncer) {
 *     // Basic announcement (Polite Mode)
 *     $mdLiveAnnouncer.announce('Hey Google');
 *
 *     // Custom announcement (Assertive Mode)
 *     $mdLiveAnnouncer.announce('Hey Google', 'assertive');
 *   });
 * </hljs>
 *
 */
function MdLiveAnnouncer($timeout) {
  /** @private @const @type {!angular.$timeout} */
  this._$timeout = $timeout;

  /** @private @const @type {!HTMLElement} */
  this._liveElement = this._createLiveElement();

  /** @private @const @type {!number} */
  this._announceTimeout = 100;
}

/**
 * @ngdoc method
 * @name $mdLiveAnnouncer#announce
 * @description Announces messages to supported screenreaders.
 * @param {string} message Message to be announced to the screenreader
 * @param {'off'|'polite'|'assertive'} politeness The politeness of the announcer element.
 */
MdLiveAnnouncer.prototype.announce = function(message, politeness) {
  if (!politeness) {
    politeness = 'polite';
  }

  var self = this;

  self._liveElement.textContent = '';
  self._liveElement.setAttribute('aria-live', politeness);

  // This 100ms timeout is necessary for some browser + screen-reader combinations:
  // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
  // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
  //   second time without clearing and then using a non-zero delay.
  // (using JAWS 17 at time of this writing).
  self._$timeout(function() {
    self._liveElement.textContent = message;
  }, self._announceTimeout, false);
};

/**
 * Creates a live announcer element, which listens for DOM changes and announces them
 * to the screenreaders.
 * @returns {!HTMLElement}
 * @private
 */
MdLiveAnnouncer.prototype._createLiveElement = function() {
  var liveEl = document.createElement('div');

  liveEl.classList.add('md-visually-hidden');
  liveEl.setAttribute('role', 'status');
  liveEl.setAttribute('aria-atomic', 'true');
  liveEl.setAttribute('aria-live', 'polite');

  document.body.appendChild(liveEl);

  return liveEl;
};
