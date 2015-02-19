(function () {
    "use strict";

    //module global to available color pallettes
    var colorStore     = {};
    var defaultPalette = '';

/**
 * @ngdoc service
 * @name $mdColors
 * @module material.core.color
 *
 * @description
 * $mdColors makes it possible to use the colors of any palette to be available
 *  as CSS rules in the form of md-bg-[colorname] and md-fg-[colorname] (as foreground and background)
 *  If you want to activate another palette you can use the `$mdColor.loadPalette(palletteName)` method.
 *
 *  the $mdColors.palettes array lists all available palettes
 *  the $mdColors.palette property lists the current selected palette
 *  the $mdColors.colors array lists all the available colors with hex encoded color values for the current selected palette.
 *
 **/


    angular
        .module('material.core.colors',['material.core.theming'])
        .service('$mdColors', mdColors)
        .config(configColors)
        .run(loadDefaults);

     /* @ngInject */
    function configColors($mdThemingProvider) {
        // fetch the colors out of the theming provider
        Object.keys($mdThemingProvider._PALETTES).forEach(parsePalette);

        // I need access to the default 'default', hardcoded for now as I miss access to it.
        defaultPalette = $mdThemingProvider._THEMES['default'].colors.primary.name;
        return;

        // clone the palette colors to the colorStore var
        function parsePalette(paletteName) {
            var palette = $mdThemingProvider._PALETTES[paletteName];
            var colors  = [];
            colorStore[paletteName] = colors;
            Object.keys(palette).forEach(copyColors);
            return ;

            function copyColors(colorName) {
                // use an regex to look for hex colors, ignore the rest
                if (/#[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}\b/.test(palette[colorName])) {
                    colors.push({color:colorName,value:palette[colorName]});
                }
            }
        }
    }

    /* @ngInject */
    function loadDefaults($mdColors) {
        // this sets the default that is stored in the config-fase into the service!
        $mdColors.palettes = Object.keys(colorStore);
        $mdColors.loadPalette(defaultPalette);
    }

    /* @ngInject */;
    function mdColors ($interpolate, $document) {
        // wrap all of the above up in a reusable service.
        var service        = this;
        service.palette    = defaultPalette;
        service.colors     = [];
        service.palettes   = [];
        service.loadPalette = loadPalette;

        return service;

        function loadPalette(newPalette) {
            if(service.palettes.indexOf(newPalette) === -1) {
                throw new Error('$mdColors.loadPalette: Unknown palette name ' + newPalette);
            }
            service.palette = newPalette;
            service.colors  = colorStore[newPalette];
            createStyleSheet();
        }

        function createStyleSheet () {
            var colors = service.colors;
            var fg, bg;
            var customSheet = getStyleSheet();

            // clear out old rules from stylesheet
            while (customSheet.cssRules.length > 0 ) {
                customSheet.deleteRule(0);
            }

            // set up interpolation functions to build css rules.
            fg  = $interpolate('.md-fg-{{color}} { color:{{value}};}');
            bg  = $interpolate('.md-bg-{{color}} { background-color:{{value}};}');

            colors.forEach(function (color) {
                // insert foreground color rule
                customSheet.insertRule(fg(color));
                // insert background color rule
                customSheet.insertRule(bg(color));
            });
        }
        
        function getStyleSheet() {
            // function to ad an dynamic style-sheet to the document
            var style = $document.querySelector('style[title="Dynamic-Generated-by-$mdColors"]');
            if (style === null) {
                style   = $document.createElement('style');
                style.title = 'Dynamic-Generated-by-$mdColors';
                // WebKit hack... (not sure if still needed)
                style.appendChild($document.createTextNode(''));
                $document.head.appendChild(style);
            }
            return style.sheet;
        }

    }

}());
