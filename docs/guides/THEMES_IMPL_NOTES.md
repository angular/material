# Notes on ng-material's theme implementation

#### TL;DR
Themes are configured by users with `$mdThemingProvider`. The CSS is then generated at run-time by
the `$mdTheming` service and tacked into the document head.

## Actual explanation

### At build time
* All of the styles associated with **color** are defined in a separate scss file of the form
`xxx-theme.scss`.
* Instead of using hard-coded color or a SCSS variable, the colors are defined with a mini-DSL
(described deblow).
* The build process takes all of those `-theme.scss` files and globs them up into one enourmous
string.  
* The build process wraps that string with code to set it an angular module constant:
    ``` angular.module('material.core').constant('$MD_THEME_CSS', 'HUGE_THEME_STRING'); ```
* That code gets dumped at the end of `angular-material.js`

### At run time
* The user defines some themes with `$mdThemingProvider` during the module config phase.
* At module run time, the theming service takes `$MD_THEME_CSS` and, for each theme, evaluates the
mini-DSL, applies the colors for the theme, and appends the resulting CSS into the document head.


### The mini-DSL
* Each color is written in the form `'{{palette-hue-opacity}}'`, where opacity is optional. 
* For example, `'{{primary-500}}'`
* Palettes are `primary`, `accent`, `warn`, `background`, `foreground`
* The hues for each type except `foreground` use the Material Design hues.
* The `forground` palette is a number from one to four:
  * `foreground-1`: text
  * `foreground-2`: secondary text, icons
  * `foreground-3`: disabled text, hint text
  * `foreground-4`: dividers  
* There is also a special hue called `contrast` that will give a contrast color (for text). 
For example, `accent-contrast` will be a contrast color for the accent color, for use as a text 
color on an accent-colored background.
