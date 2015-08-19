## Build Instructions

* [Introduction](#intro)<br/><br/>
* [Build Commands](#commands)
* [Building the Documentation](#livedocs)
* [Building the Library](#builds)
* [Using the Library with Bower](#bower)<br/><br/>
* [Introducing Components](#comp)
* [Building Individual Components](#comp_builds)
* [Component Debugging](#comp_debug)<br/><br/>
* [Theming](#themes)


## <a name="intro"></a> Introduction

Angular Material has a sophisticated collection of build process and commands available... to deploy
distribution files, test components, and more.

These commands are defined within two (2) **gulp** files:

* [Project Gulp](../../gulpfile.js)
* [Documentation Gulp](../gulpfile.js)


### <a name="commands"></a> Build Commands

For each milestone release, always run:

- `npm update` to update your local gulp dependencies
- `bower update` to update AngularJS dependencies

The following command line tasks are available:

- `gulp build` (alias `gulp`) to build, add `--release` flag to uglify & strip `console.log`
- `gulp docs` to build the Live Docs into dist/docs
- `gulp watch` to build & rebuild on changes

<a separator></a>

- `gulp karma` to test once
- `gulp karma-watch` to test & watch for changes

###<a name="livedocs"></a> Building the Documentation

The Angular Material **Live Docs** are generated from the source code and demos and actually use the
Angular Material components and themes.

> Our build process uses **[dgeni](https://github.com/angular/dgeni)**, the wonderful documentation
  generator built by [Pete Bacon Darwin](https://github.com/petebacondarwin).

See the [Building the Live Documentation](../README.md#docs) document for details.

###<a name="builds"></a> Building the Library

Developers can build the entire Angular Material library or individual component modules. The
library comprises:

* `angular-material.js` - components
* `angular-material.css` - styles and default theme stylesheet
* `/themes/**.css` - default theme override stylesheets

To build from the source, simply use:

```bash
# Build and deploy the library to
#
# - `dist/angular-material.js`
# - `dist/angular-material.css`
# - `dist/themes`

gulp build

# Build minified assets
#
# - `dist/angular-material.min.js`
# - `dist/angular-material.min.css`
# - `dist/themes`

gulp build --release
```

###<a name="bower"></a> Using the Library with Bower

For developers not interested in building the Angular Material library, use **bower** to install and
use the Angular Material distribution files.

Change to your project's root directory.

```bash
# To get the latest stable version, use Bower from the command line.
bower install angular-material

# To get the most recent, latest committed-to-master version use:
bower install angular-material#master
```

Visit [Bower-Material](https://github.com/angular/bower-material/blob/master/README.md) for more
details on how to install and use the Angular Material distribution files within your own local
project.

<br/>
##<a name="comp"></a> Introducing Components

Angular Material supports the construction and deployment of individual component builds. Within
Angular Material, each component is contained within its own module and specifies its own
dependencies.

> At a minimum, all components have a dependency upon the `core` module.

For example, the **slider** component is registered as a **material.components.slider** module.

###<a name="comp_builds"></a> Building Individual Components

To build and deploy assets for each component individually, run the command

```bash
gulp build-all-modules
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

###<a name="comp_debug"></a> Component Debugging

Debugging a demo in the Live Docs is complicated due the multiple demos loading and initializing. A
more practical approach is to open and debug a specific, standalone Component demo.

To open a Component demo outside of the Docs application, just build, deploy and debug that
component's demo(s).

For example, to debug the **textfield** component:

```bash
# Watch, build and deploy the 'textfield' demos
#
# NOTE: watch-demo will rebuild your component source
#       and demos upon each `save`
#
gulp watch-demo -c textfield

# launch the liveReload server on port 8080
#
# Note: livereload will reload demos after updates are
#       deployed (by watch-demo) to the dist/demos/
#
gulp server
```

The demo build process will deploy a *self-contained* Angular application that runs the specified
component's demo(s). E.g.:

* `dist/demos/textfield/**/*.*`
* `dist/demos/tabs/**/*.*`
*  etc.

After running `gulp server` to start a *LiveReload* server in your project root:

* Open browser to url `http://localhost:8080/`
* Navigate to `dist/demos/<component>/<demo>/index.html`
* Open Dev Tools and debug...


##<a name="themes"></a> Theming

https://material.angularjs.org/#/Theming/01_introduction
