angular.module('material.core')
    .factory('$mdInkRipple', InkRippleService)
    .directive('mdInkRipple', InkRippleDirective)
    .directive('mdNoInk', attrNoDirective)
    .directive('mdNoBar', attrNoDirective)
    .directive('mdNoStretch', attrNoDirective);

var DURATION = 450;

/**
 * Directive used to add ripples to any element
 * @ngInject
 */
function InkRippleDirective ($mdButtonInkRipple, $mdCheckboxInkRipple) {
  return {
    controller: angular.noop,
    link:       function (scope, element, attr) {
      attr.hasOwnProperty('mdInkRippleCheckbox')
          ? $mdCheckboxInkRipple.attach(scope, element)
          : $mdButtonInkRipple.attach(scope, element);
    }
  };
}

/**
 * Service for adding ripples to any element
 * @ngInject
 */
function InkRippleService ($injector) {
  return { attach: attach };
  function attach (scope, element, options) {
    if (element.controller('mdNoInk')) return angular.noop;
    return $injector.instantiate(InkRippleCtrl, {
      $scope:        scope,
      $element:      element,
      rippleOptions: options
    });
  }
}

/**
 * Controller used by the ripple service in order to apply ripples
 * @ngInject
 */
function InkRippleCtrl ($scope, $element, rippleOptions, $window, $timeout, $mdUtil) {
  this.$window    = $window;
  this.$timeout   = $timeout;
  this.$mdUtil    = $mdUtil;
  this.$scope     = $scope;
  this.$element   = $element;
  this.options    = rippleOptions;
  this.mousedown  = false;
  this.ripples    = [];
  this.timeout    = null; // Stores a reference to the most-recent ripple timeout
  this.lastRipple = null;

  $mdUtil.valueOnUse(this, 'container', this.createContainer);
  $mdUtil.valueOnUse(this, 'color', this.getColor, 1);
  $mdUtil.valueOnUse(this, 'background', this.getColor, 0.5);

  // attach method for unit tests
  ($element.controller('mdInkRipple') || {}).createRipple = angular.bind(this, this.createRipple);

  this.bindEvents();
}

/**
 * Returns the color that the ripple should be (either based on CSS or hard-coded)
 * @returns {string}
 */
InkRippleCtrl.prototype.getColor = function (multiplier) {
  multiplier = multiplier || 1;
  return parseColor(this.$element.attr('md-ink-ripple'))
      || parseColor(getElementColor.call(this));

  /**
   * Finds the color element and returns its text color for use as default ripple color
   * @returns {string}
   */
  function getElementColor () {
    var colorElement = this.options.colorElement && this.options.colorElement[ 0 ];
    colorElement     = colorElement || this.$element[ 0 ];
    return colorElement ? this.$window.getComputedStyle(colorElement).color : 'rgb(0,0,0)';
  }

  /**
   * Takes a string color and converts it to RGBA format
   * @param color {string}
   * @returns {string}
   */
  function parseColor (color) {
    if (!color) return;
    if (color.indexOf('rgba') === 0) return color.replace(/\d?\.?\d*\s*\)\s*$/, (0.1 * multiplier).toString() + ')');
    if (color.indexOf('rgb') === 0) return rgbToRGBA(color);
    if (color.indexOf('#') === 0) return hexToRGBA(color);

    /**
     * Converts hex value to RGBA string
     * @param color {string}
     * @returns {string}
     */
    function hexToRGBA (color) {
      var hex   = color[ 0 ] === '#' ? color.substr(1) : color,
          dig   = hex.length / 3,
          red   = hex.substr(0, dig),
          green = hex.substr(dig, dig),
          blue  = hex.substr(dig * 2);
      if (dig === 1) {
        red += red;
        green += green;
        blue += blue;
      }
      return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) + ',0.1)';
    }

    /**
     * Converts an RGB color to RGBA
     * @param color {string}
     * @returns {string}
     */
    function rgbToRGBA (color) {
      return color.replace(')', ', 0.1)').replace('(', 'a(');
    }

  }

};

/**
 * Binds events to the root element for
 */
InkRippleCtrl.prototype.bindEvents = function () {
  this.$element.on('mousedown', angular.bind(this, this.handleMousedown));
  this.$element.on('mouseup', angular.bind(this, this.handleMouseup));
  this.$element.on('mouseleave', angular.bind(this, this.handleMouseup));
};

/**
 * Create a new ripple on every mousedown event from the root element
 * @param event {MouseEvent}
 */
InkRippleCtrl.prototype.handleMousedown = function (event) {
  // When jQuery is loaded, we have to get the original event
  if (event.hasOwnProperty('originalEvent')) event = event.originalEvent;
  this.mousedown = true;
  if (this.options.center) {
    this.createRipple(this.container.prop('clientWidth') / 2, this.container.prop('clientWidth') / 2);
  } else {
    this.createRipple(event.layerX, event.layerY);
  }

};

/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (either by
 * mouseup or mouseleave event)
 */
InkRippleCtrl.prototype.handleMouseup = function () {
  var ctrl       = this;
  this.mousedown = false;
  this.$mdUtil.nextTick(function () { ctrl.clearRipples(); }, false);
};

/**
 * Cycles through all ripples and attempts to remove them.
 * Depending on logic within `fadeInComplete`, some removals will be postponed.
 */
InkRippleCtrl.prototype.clearRipples = function () {
  for (var i = 0; i < this.ripples.length; i++) this.fadeInComplete(this.ripples[ i ]);
};

/**
 * Creates the ripple container element
 * @returns {*}
 */
InkRippleCtrl.prototype.createContainer = function () {
  var container = angular.element('<div class="md-ripple-container"></div>');
  this.$element.append(container);
  return container;
};

InkRippleCtrl.prototype.clearTimeout = function () {
  if (this.timeout) {
    this.$timeout.cancel(this.timeout);
    this.timeout = null;
  }
};

/**
 * Creates a new ripple and adds it to the container.  Also tracks ripple in `this.ripples`.
 * @param left
 * @param top
 */
InkRippleCtrl.prototype.createRipple = function (left, top) {
  var ctrl        = this;
  var ripple      = angular.element('<div class="md-ripple"></div>');
  var width       = this.$element.prop('clientWidth');
  var height      = this.$element.prop('clientHeight');
  var x           = Math.max(Math.abs(width - left), left) * 2;
  var y           = Math.max(Math.abs(height - top), top) * 2;
  var size        = getSize(this.options.fitRipple, x, y);

  ripple.css({
    left:            left + 'px',
    top:             top + 'px',
    background:      'black',
    width:           size + 'px',
    height:          size + 'px',
    backgroundColor: rgbaToRGB(this.color),
    borderColor:     rgbaToRGB(this.color)
  });
  this.lastRipple = ripple;

  // we only want one timeout to be running at a time
  this.clearTimeout();
  this.timeout    = this.$timeout(function () {
    ctrl.clearTimeout();
    if (!ctrl.mousedown) ctrl.fadeInComplete(ripple);
  }, DURATION * 0.35, false);

  if (this.options.dimBackground) this.container.css({ backgroundColor: this.background });
  this.container.append(ripple);
  this.ripples.push(ripple);
  ripple.addClass('md-ripple-placed');
  this.$mdUtil.nextTick(function () {
    ripple.addClass('md-ripple-scaled md-ripple-active');
    ctrl.$timeout(function () { ctrl.clearRipples(); }, DURATION, false);
  }, false);

  function rgbaToRGB (color) {
    return color
        ? color.replace('rgba', 'rgb').replace(/,[^\),]+\)/, ')')
        : 'rgb(0,0,0)';
  }

  function getSize (fit, x, y) {
    return fit
        ? Math.max(x, y)
        : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }
};

/**
 * Either kicks off the fade-out animation or queues the element for removal on mouseup
 * @param ripple
 */
InkRippleCtrl.prototype.fadeInComplete = function (ripple) {
  if (this.lastRipple === ripple) {
    if (!this.timeout && !this.mousedown) this.removeRipple(ripple);
  } else {
    this.removeRipple(ripple);
  }
};

/**
 * Kicks off the animation for removing a ripple
 * @param ripple {Element}
 */
InkRippleCtrl.prototype.removeRipple = function (ripple) {
  var ctrl  = this;
  var index = this.ripples.indexOf(ripple);
  if (index < 0) return;
  this.ripples.splice(this.ripples.indexOf(ripple), 1);
  ripple.removeClass('md-ripple-active');
  if (this.ripples.length === 0) this.container.css({ backgroundColor: '' });
  // use a 2-second timeout in order to allow for the animation to finish
  // we don't actually care how long the animation takes
  this.$timeout(function () { ctrl.fadeOutComplete(ripple); }, DURATION, false);
};

/**
 * Removes the provided ripple from the DOM
 * @param ripple
 */
InkRippleCtrl.prototype.fadeOutComplete = function (ripple) { ripple.remove(); };

/**
 * Used to create an empty directive.  This is used to track flag-directives whose children may have
 * functionality based on them.
 *
 * Example: `md-no-ink` will potentially be used by all child directives.
 */
function attrNoDirective () {
  return { controller: angular.noop };
}
