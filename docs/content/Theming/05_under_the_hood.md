@ngdoc content
@name Theming under the hood
@description

### Under the Hood

Angular Material dynamically generates CSS for registered themes by injecting several
`<script>` tags into the `<head>` section of the application at runtime. Here is how
that process currently works:

1. During the Angular Material build process, a function in `gulp/util.js` called
[themeBuildStream()](https://github.com/angular/material/blob/master/gulp/util.js#L223)
compiles all `*-theme.scss` files from components into a single CSS string that is
injected into the `material.core` module as a constant called `$MD_THEME_CSS`.

1. At runtime, a function in `src/core/services/theming/theming.js` called
[generateAllThemes()](https://github.com/angular/material/blob/master/src/core/services/theming/theming.js#L917)
parses `$MD_THEME_CSS` to generate the `<style>` tags that are added to the `<head>`
section of the application. A closure variable called `GENERATED` is used to keep track
of the themes that have had their CSS generated.

1. For each of the four (4) palettes (e.g. `primary`, `accent`, `warn` and `background`)
*in each registered theme* (including the default theme), there are four (4) `<style>`
tags added to the `<head>` section (e.g. `.md-primary`, `.md-primary.md-hue-1`,
`.md-primary.md-hue-2`, `.md-primary.md-hue-3`). Each registered theme
results in 16 `<style>` tags being generated. 
