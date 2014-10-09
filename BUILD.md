Build Process
-------------

### Abstract

- Implicitly decide how a component is structured using well-documented rules
- Only use explicit definitions for things that cannot be implicitly discovered (for example, human-readable names & descriptions for components are explicitly defined)
- Move everything into jsdoc. Human readable name is as simple as `@label` for a module, description is `@description` on a module.

- Use gulp with simple globbing to find each component's files
- Gulp will then pass this information to the doc parser when initialising

### Component Structure

- Remove module.json, make README.md optional.
- Move human-readable name into a `@label` tag in the js file.
- Move description from README.md to a module's `@description` tag.

- Have a `_tabs.js` file which declares the component's angular module (the _ makes it first alphabetically for globbing, in case the component is split into multiple files).
- Have the component's core structure (not modifiable by themes) declared in `_tabs.scss`.
- Put the component's modifiable (themable) scss into its own file: `_default-theme.scss`.  This will have all sass variables at the top, with `!default`, and below will be defined:

  ```
  <body ng-app="myApp" material-theme="theme-default">
    <material-tabs>
      <material-slider material-theme="other-theme">
      </material-slider>
    </material-tabs>
  </body>
  ```

  ```
  material-tabs.md-theme-default {
    color: $tabs-color;
    material-tab {
      background-color: $tabs-tab-background-color;
    }
  }
  ```

**Implicit Module Rules**

- A demo is in a folder prefixed with `demoDemoName`
- `humanize(demoFolder.substring(5))` is used as the demo's display name.
- Javascript = **/*.js,!**/*.spec.js
- Scss = *.scss
- Tests = **/*.spec.js

### Distribution

### Directory Structure


```
gulp build
```

transition: transform 0.2s all;
-webkit-transition: -webkit-transform 0.2s all;

-> gulp concat-base-theme

-> gulp build-themes

themes/*

```
/src
  /components
    -tabs
      - tabs.js
      - tabs-core.scss
      - tabs-theme.scss
themes/
  light-theme.scss
    > $tabs-color: black;
    @import ...
  dark-theme.scss

/dist
  angular-material.js
  angular-material.css
  themes/
    light-theme.css
    dark-theme.css
  component-name/
    - component-name.js
    - component-core.css
    - component-default-theme.css
```

```variables.scss```
$theme-name: 'default-theme';

```tabs-theme.scss``
$tabs-background-color: white !default;

material-tabs.md-#{$theme-name} {
  color: $tabs-color;
  background: $tabs-background-color;
}

```/themes/default-light-theme.scss
$theme-name: 'pink-theme' !default;
$tabs-color: 'pink' !default;
```

```user-pink-theme.scss``
$tabs-color: 'lightpink';
```

```user-blue-theme.scss```
$tabs-color: 'blue';
```

```
angular-material build-theme my-theme.scss

$tabs-color: 'lightpink';
tabs-theme('lightpink-theme');
$tabs-color: 'blue';
tabs-theme('blue-theme');
```



```js
var gulp = require('gulp');
var materialTheme = require('angular-material-build-theme');

gulp.task('build theme', function() {
  return gulp.src('/my-themes/*')
    .pipe(buildTheme);
});
```
