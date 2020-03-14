## Build Instructions

* [Introduction](#intro)<br/><br/>
* [Build Commands](#commands)
* [Building the Documentation](#livedocs)
* [Building the Library](#builds)
<br/><br/>
* [Component Modules](#comp)
* [Building Individual Components](#comp_builds)
* [Component Debugging](#comp_debug)

## <a name="intro"></a> Introduction

AngularJS Material has a collection of build processes and commands available to deploy distribution
files, test components, and more.

These commands are defined within the `package.json` and two (2) **gulp** files:

* [package.json](../../package.json)
* [Project Gulp](../../gulpfile.js)
* [Documentation Gulp](../gulpfile.js)

From the project root, install the NPM packages by running
- `npm install` or `npm i`

### <a name="commands"></a> Build Commands

The following command line tasks are available:

- `npm run build` to build
- `npm run build:prod` to uglify, strip `console.log`, and autoprefix CSS
- `npm run docs:build` to build the docs into `dist/docs`
- `npm run docs:watch` to build the library and docs, and rebuild on file changes

<a separator></a>

- `npm run lint` to run ESLint
- `npm run test:fast` to run smoke tests
- `npm run test:full` to run all of the unit tests

### <a name="livedocs"></a> Building the Documentation

The AngularJS Material Docs are generated from the source code. The documentation itself uses the
AngularJS Material layout, components, and themes.

> Our build process uses **[dgeni](https://github.com/angular/dgeni)**, the wonderful documentation
generator built by [Pete Bacon Darwin](https://github.com/petebacondarwin).

To view the Docs (locally):

1. Build the docs and serve with 'live reload' using `npm run docs:watch`
1. Open Browser to [http://localhost:8080](http://localhost:8080)

### <a name="builds"></a> Building the Library

Developers can build the entire AngularJS Material library or individual component modules. The
library comprises:

* `angular-material.js` - components, services, and theming
* `angular-material.css|scss` - styles
* `layouts/**.css|scss` - default layout stylesheets

To build from the source, simply use:
```bash
# Build the library to
#
# - `dist/angular-material.js`
# - `dist/angular-material.css|scss`
# - `dist/layouts`

npm run build

# Build minified assets
#
# - `dist/angular-material.min.js`
# - `dist/angular-material.min.css|scss`
# - `dist/layouts`

npm run build:prod
```

##<a name="comp"></a> Component Modules

AngularJS Material supports the construction and deployment of individual component builds.
Each component is contained within its own module and specifies its own dependencies.

> At a minimum, all components have a dependency upon the `core` module.

For example, the **slider** component is registered as the **material.components.slider** module.

### <a name="comp_builds"></a> Building Individual Components

To build and deploy assets for each component individually, run:
```bash
npm run build:modules
```

All component modules are compiled and distributed to:
```text
 -- dist
    -- modules
       -- js
          -- core
          -- <component folder>
```

Let's consider the Slider component with its module definition:
```js
/**
 * @ngdoc module
 * @name material.components.slider
 */
angular.module('material.components.slider', [
  'material.core'
]);
```

First build all the component modules.

To use - for example - the Slider component within your own application, simply load the stylesheets
and JS from both the **slider** and the **core** modules:
```text
 -- dist
    -- modules
       -- js
          -- core
             -- core.js
             -- core.css
          -- slider
             -- slider.js
             -- slider.css
             -- slider-default-theme.css
```

### <a name="comp_debug"></a> Component Debugging

Debugging a demo in the Docs is complicated due the multiple demos loading and initializing. A
more practical approach is to open and debug a specific, standalone Component demo.

To open a Component demo outside of the Docs application, just build, deploy and debug that
component's demo(s).

For example, to debug the **textfield** component:

```bash
# Watch and build the 'textfield' demos
#
# NOTE: watch-demo will rebuild your component source
#       and demos upon each `save`.
# Note: server will livereload demos on port 8080 after updates are
#       built (by watch-demo) to the dist/demos/ dir.
#
gulp watch-demo -c textfield server
```

The demo build process will deploy a *self-contained* AngularJS application that runs the specified
component's demo(s). E.g.:

* `dist/demos/textfield/**/*.*`
* `dist/demos/tabs/**/*.*`
*  etc.

After running the appropriate `watch-demo` and `server` tasks:

* Open browser to [http://localhost:8080/dist/demos](http://localhost:8080/dist/demos)
* Navigate to `<component>/<demo>`
* Open Dev Tools and debug...
