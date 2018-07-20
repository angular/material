# Notes on AngularJS Material's theme implementation

#### TL;DR
You configure themes with `$mdThemingProvider`. The CSS is then generated at run-time by
the `$mdTheming` service and appended to the document's `<head>`.

## Explanation

### At build time
* All the styles associated with **color** are defined in a separate SCSS file of the form
`xxx-theme.scss`.
* Instead of using a hard-coded color or a SCSS variable, you define the colors with a mini-DSL
  (described below).
* The build process takes all of those `-theme.scss` files and globs them up into one enormous
string.
* The build process wraps that string with code to set it as an AngularJS module constant:
  ```
    angular.module('material.core').constant('$MD_THEME_CSS', 'HUGE_THEME_STRING');
  ```
* That code gets dumped at the end of `angular-material.js`.

### At run time
* The user defines some themes with `$mdThemingProvider` during the module config phase.
* At module run time, the theming service takes `$MD_THEME_CSS` and, for each theme, evaluates the
mini-DSL, applies the colors for the theme, and appends the resulting CSS into the document head.

### The mini-DSL
* You write each color in the form `'{{palette-hue-contrast-opacity}}'`, where `hue`, `contrast`,
and opacity are optional.
* For example, `'{{primary-500}}'`.
* Palettes are `primary`, `accent`, `warn`, `background`.
* The hues for each type use the Material Design hues. When not specified, each palette defaults
`hue` to `500` except for `background`.
* The `opacity` value can be a decimal between 0 and 1 or one of the following values based on the
hue's contrast type (dark, light, or strongLight):
  * `icon`: icon (0.54 / 0.87 / 1.0)
  * `secondary`: secondary text (0.54 / 0.87)
  * `disabled`: disabled text or icon (0.38 / 0.54)
  * `hint`: hint text (0.38 / 0.50)
  * `divider`: divider (0.12)
* `contrast` will give a contrast color (for text) and can be mixed with `opacity`.
For example, `accent-contrast` will be a contrast color for the accent color, for use as a text
color on an accent-colored background. Adding an `opacity` value as in `accent-contrast-icon` will
apply the Material Design icon opacity. Using a decimal opacity value as in `accent-contrast-0.25`
will apply the contrast color for the accent color at 25% opacity.
