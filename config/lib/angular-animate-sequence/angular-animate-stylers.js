angular.module('ngAnimateStylers', ['ngAnimateSequence'])

  .config(['$$animateStylerProvider', function($$animateStylerProvider) {
    var isDefined = angular.isDefined;

    //JQUERY
    $$animateStylerProvider.register('jQuery', function() {
      return function(element, pre, duration, delay) {
        delay = delay || 0;
        element.css(pre);
        return function(post, done) {
          element.animate(post, duration, null, done);
        }
      };
    });

    //Web Animations API
    $$animateStylerProvider.register('webAnimations', ['$window', '$sniffer',   
                                               function($window,   $sniffer) {
      // TODO(matias): figure out other styles to add here
      var specialStyles = 'transform,transition,animation'.split(',');
      var webkit = $sniffer.vendorPrefix.toLowerCase() == 'webkit';

      return function(element, pre, duration, delay) {
        var node = element[0];
        if (!node.animate) {
          throw new Error("WebAnimations (element.animate) is not defined for use within $$animationStylerProvider.");
        }

        delay = delay || 0;
        duration = duration || 1000;
        var iterations = 1; // FIXME(matias): make sure this can be changed
        pre = camelCaseStyles(pre);

        return function(post, done) {
          var finalStyles = normalizeVendorPrefixes(post);

          post = camelCaseStyles(post);

          var missingProperties = [];
          angular.forEach(post, function(_, key) {
            if (!isDefined(pre[key])) {
              missingProperties.push(key);
            }
          });

          // The WebAnimations API requires that each of the to-be-animated styles
          // are provided a starting value at the 0% keyframe. Since the sequencer
          // API does not require this then let's figure out each of the styles using
          // computeStartingStyles(...) and merge that with the existing pre styles
          if (missingProperties.length) {
            pre = angular.extend(pre, computeStartingStyles(node, missingProperties));
          }

          var animation = node.animate([pre, post], {
            duration : duration,
            delay : delay,
            iterations : iterations
          });
          animation.onfinish = function() {
            element.css(finalStyles); 
            done();
          };
        }
      };

      function computeStartingStyles(node, props) {
        var computedStyles = $window.getComputedStyle(node);
        var styles = {};
        angular.forEach(props, function(prop) {
          var value = computedStyles[prop];

          // TODO(matias): figure out if webkit is the only prefix we need
          if (!isDefined(value) && webkit && specialStyles.indexOf(prop) >= 0) {
            prop = 'webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
            value = computedStyles[prop];
          }
          if (isDefined(value)) {
            styles[prop] = value;
          }
        });
        return styles;
      }

      function normalizeVendorPrefixes(styles) {
        var newStyles = {};
        angular.forEach(styles, function(value, prop) {
          if(webkit && specialStyles.indexOf(prop) >= 0) {
            newStyles['webkit' + prop.charAt(0).toUpperCase() + prop.substr(1)] = value;
          }
          newStyles[prop]=value;
        });
        return newStyles;
      }
    }]);

    // Greensock Animation Platform (GSAP)
    $$animateStylerProvider.register('gsap', function() {
      return function(element, pre, duration, delay) {
        var styler = TweenMax || TweenLite;

        if ( !styler) {
          throw new Error("GSAP TweenMax or TweenLite is not defined for use within $$animationStylerProvider.");
        }


        return function(post, done) {
          styler.fromTo(
            element,
            (duration || 0)/1000,
            pre || { },
            angular.extend( post, {onComplete:done, delay: (delay || 0)/1000} )
          );
        }
      };
    });

    function camelCaseStyles(styles) {
      var newStyles = {};
      angular.forEach(styles, function(value, prop) {
        prop = prop.toLowerCase().replace(/-(.)/g, function(match, group1) {
          return group1.toUpperCase();
        });
        newStyles[prop]=value;
      });
      return newStyles;
    }
  }]);
