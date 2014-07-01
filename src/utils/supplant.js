/**
 * @author      Thomas Burleson
 * @date        November, 2013
 * @description
 *
 *  String supplant global utility (similar to but more powerful than sprintf() ).
 *
 *  Usages:
 *
 *      var user = {
 *              first : "Thomas",
 *              last  : "Burleson",
 *              address : {
 *                  city : "West Des Moines",
 *                  state: "Iowa"
 *              },
 *              contact : {
 *                  email : "ThomasBurleson@Gmail.com"
 *                  url   : "http://www.solutionOptimist.com"
 *              }
 *          },
 *          message = "Hello Mr. {first} {last}. How's life in {address.city}, {address.state} ?";
 *
 *     return supplant( message, user );
 *
 */
(function( window ) {
    "use strict";
        var INVALID_DATA = "Undefined template provided";

        // supplant() method from Crockfords `Remedial Javascript`

        var supplant =  function( template, values, pattern ) {
            if(!template)
            {
              throw(new Error(INVALID_DATA));
            }

            pattern = pattern || /\{([^\{\}]*)\}/g;

            return template.replace(pattern, function(a, b) {
                var p = b.split('.'),
                    r = values;

                try {
                    for (var s in p) { r = r[p[s]];  }
                } catch(e){
                    r = a;
                }

                return (typeof r === 'string' || typeof r === 'number' || typeof r === 'boolean') ? r : a;
            });
        };


        // supplant() method from Crockfords `Remedial Javascript`
        Function.prototype.method = function (name, func) {
            this.prototype[name] = func;
            return this;
        };

        String.method("supplant", function( values, pattern ) {
            var self = this;
            return supplant(self, values, pattern);
        });


        // Publish this global function...
        window.supplant = String.supplant = supplant;

}( window ));
