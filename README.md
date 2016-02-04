# Material Design for AngularJS Apps [![Build Status](https://travis-ci.org/angular/material.svg)](https://travis-ci.org/angular/material)

[Material Design](https://www.google.com/design/spec/material-design/) is a specification for a
unified system of visual, motion, and interaction design that adapts across different devices. Our
goal is to deliver a lean, lightweight set of AngularJS-native UI elements that implement the
material design specification for use in Angular single-page applications (SPAs).

![venn diagram](https://cloud.githubusercontent.com/assets/210413/5077572/30dfc2f0-6e6a-11e4-9723-07c918128f4f.png)

For developers using AngularJS, Angular Material is the reference implementation of Google's Material Design Specification. This project implements version 1.x of Angular Material and includes a rich set of reusable, well-tested, and accessible UI components.

Quick Links:

*  [API & Demos](#demos)
*  [Contributing](#contributing)
*  [Building](#building)
*  [Installing](#installing)


Please note that using Angular Material requires the use of **Angular 1.3.x** or higher. Angular
Material is targeted for all browsers with versions n-1; where n is the current browser version.

## <a name="demos"></a> Online Documentation (and Demos)

<div style="border: 1px solid #ccc">
  <img src="https://cloud.githubusercontent.com/assets/11819543/10056006/4aee3b68-6207-11e5-8497-a0656f85902a.PNG" alt="Angular Material docs website" style="display:block;">
</div>

- Visit [Material.AngularJS.org](https://material.angularjs.org/) online to review the API, see the
  components in action with live Demos, and study the Layout system.
- Or you can build the documentation and demos locally; see
  [Build Docs & Demos](https://github.com/angular/material/tree/master/docs/README.md) for details.

## <a name="contributing"></a> Contributing

Developers interested in contributing should read the following guidelines:

- [Issue Guidelines](CONTRIBUTING.md#submit)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Coding Guidelines](docs/guides/CODING.md)
- [ChangeLog](CHANGELOG.md)

> Please do **not** ask general questions in an issue. Issues are only to report bugs, request
  enhancements, or request new features. For general questions and discussions, use the
  [Angular Material Forum](https://groups.google.com/forum/#!forum/ngmaterial).

It is important to note that for each release, the [ChangeLog](CHANGELOG.md) is a resource that will
itemize all:

- Bug Fixes
- New Features
- Breaking Changes

## <a name="building"></a> Building

Developers can easily build Angular Material using NPM and gulp.

* [Builds - Under the Hood](docs/guides/BUILD.md)

First install or update your local project's **npm** tools:

```bash
# First install all the NPM tools:
npm install

# Or update
npm update
```

Then run the **gulp** tasks:

```bash
# To build `angular-material.js/.css` and `Theme` files in the `/dist` directory
gulp build

# To build the Angular Material Docs and Demos in `/dist/docs` directory
gulp docs
```

For more details on how the build process works and additional commands (available for testing and
debugging) developers should read the [Build Instructions](docs/guides/BUILD.md).

## <a name="installing"></a> Installing Build (Distribution Files)

#### Bower

For developers not interested in building the Angular Material library... use **bower** to install
and use the Angular Material distribution files.

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

#### CDN

CDN versions of Angular Material are now available at
[Google Hosted Libraries](https://developers.google.com/speed/libraries/#angular-material).

With the Google CDN, you will not need to download local copies of the distribution files. Instead
simply reference the CDN urls to easily use those remote library files. This is especially useful
when using online tools such as [CodePen](http://codepen.io/), [Plunkr](http://plnkr.co/), or
[JSFiddle](http://jsfiddle.net/).

```html
  <head>

    <!-- Angular Material CSS now available via Google CDN; version 0.11.2 used here -->
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/0.11.2/angular-material.min.css">

  </head>
  <body>

    <!-- Angular Material Dependencies -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-aria.min.js"></script>


    <!-- Angular Material Javascript now available via Google CDN; version 0.11.2 used here -->
    <script src="https://ajax.googleapis.com/ajax/libs/angular_material/0.11.2/angular-material.min.js"></script>
  </body>
```

> Note that the above sample references the 0.10.0 CDN release. Your version will change based on the latest stable release version.

Developers seeking the latest, most-current build versions can use [GitCDN.link](//gitcdn.link) to
pull directly from the distribution GitHub
[Bower-Material](https://github.com/angular/bower-material) repository:

```html
  <head>

    <!-- Angular Material CSS using GitCDN to load directly from `bower-material/master` -->
    <link rel="stylesheet" href="https://gitcdn.link/repo/angular/bower-material/master/angular-material.css">

  </head>
  <body>

    <!-- Angular Material Dependencies -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-aria.js"></script>

    <!-- Angular Material Javascript using GitCDN to load directly from `bower-material/master` -->
    <script src="https://gitcdn.link/repo/angular/bower-material/master/angular-material.js"></script>

  </body>
```

Once you have all the necessary assets installed, add `ngMaterial` as a dependency for your app:

```javascript
angular.module('myApp', ['ngMaterial']);
```

