@ngdoc content
@name Introduction and Terms
@description

Material Design is a visual language with specifications for innovative user experiences (UX) and user interface (UI) elements. Themes convey meaning through color, tones, and contrasts, similar to how Layouts convey meaning through keylines and alignments.

Theme [**color palettes**](https://material.io/archive/guidelines/style/color.html#color-color-palette), alphas, and shadows deliver a consistent tone to your application and a unified feel for all AngularJS Material UI components.

Theming allows changing the color of your AngularJS Material application. If you
need more custom styling (such as layout changes including padding, margins,
etc) you will need to either write CSS rules with custom selectors, or build a
custom version of the `angular-material.css` file using SASS and custom
variables.

> <b>Note:</b> The Material Theming system provides the <a ng-href="/api/service/$mdThemingProvider#mdthemingprovider-setnonce-noncevalue">
  `$mdThemingProvider.setNonce()`</a> method to meet the requirements of a CSP-policy enabled application.

<img src="https://cloud.githubusercontent.com/assets/210413/4816236/bf7783dc-5edd-11e4-88ef-1f8b6e87e1d7.png" alt="color palette" style="max-width: 100%;">

## Theming Approach

AngularJS Material makes it easy to design an app which follows the Material style
guide's suggested design patterns:

> Limit your selection of colors by choosing three color hues from the primary palette and one accent color
> from the secondary palette. The accent color may or may not need fallback options.

This concept is central to how AngularJS Material approaches theming.

## Important Terms

### Hues / Shades

A hue/shade is a single color within a palette.

### Palettes

A palette is a collection of hues. By default, AngularJS Material ships with all
palettes from the material design spec built in. Valid palettes include:

- red
- pink
- purple
- deep-purple
- indigo
- blue
- light-blue
- cyan
- teal
- green
- light-green
- lime
- yellow
- amber
- orange
- deep-orange
- brown
- grey
- blue-grey

### Color Intentions

A color intention is a mapping of a palette for a given intention within your
application.

Valid color intentions in AngularJS Material include:

- *primary* - used to represent primary interface elements for a user
- *accent* - used to represent secondary interface elements for a user
- *warn* - used to represent interface elements that the user should be careful of

### Themes

A theme is a configuration of palettes used for specific color intentions. A
theme also specifies a background color palette to be used for the application.
