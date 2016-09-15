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
Material is targeted for all browsers with browser versions shown below with green boxes:

![ngm1_browser_support](https://cloud.githubusercontent.com/assets/210413/18553899/f3fbfbca-7b27-11e6-81c9-2937950c808e.png)

## <a name="news"></a> GitHub Universe

Based on the number of unique contributors and repository forks, GitHub Octoverse recently announced that Angular Material is one of the top 10 most-loved active projects on GitHub:

![angularongithubuniverse](https://cloud.githubusercontent.com/assets/210413/18553990/53cf2e32-7b28-11e6-8e08-29548fd3d786.jpg)
 
## <a name="demos"></a> Online Documentation (and Demos)

<div style="border: 1px solid #ccc">
  <img src="https://cloud.githubusercontent.com/assets/11819543/10056006/4aee3b68-6207-11e5-8497-a0656f85902a.PNG" alt="Angular Material docs website" style="display:block;">
</div>

- Visit [Material.AngularJS.org](https://material.angularjs.org/) online to review the API, see the
  components in action with live Demos, and study the Layout system.
- Or you can build the documentation and demos locally; see
  [Build Docs & Demos](https://github.com/angular/material/tree/master/docs/README.md) for details.


## <a name="releasing"></a> Our Release Processes

Angular Material has revised/improved its build processes. To preserve stability with applications currently using Angular Material, we will have three (3) types of releases:

*  `major` :  this type of release will be the Angular 2.x efforts maintained in a separate repository called [Material2](https://github.com/angular/material2). This type of release will not be used within Angular Material 1.x.
*  `minor`:  aka `master` contains patch release changes AND breaking changes and new features
*  `patch`:  non-breaking changes (no API, CSS, UX changes that will cause breaks in existing ngMaterial applications)

##### Patch Releases

The patch builds (1.0.4, 1.0.5, 1.0.6) are prepared based on commits in the `patch` branch; which contains only non-breaking changes (eg bug fix, some API additions, minimal non-breaking CSS changes ).  We will be building `patch` releases every week.

##### Minor Releases

The minor build (1.1.0, 1.2.0, 1.3.0,...) are prepared based on commits in the `master` branch; which will remain the daily development branch AND will be the source for the `minor` releases.

Our formal release of `minor` builds is much less frequent; probably 1x / Quarter. Developers can easily obtain the latest, full change-set from bower or npm using references to `@master`.

##### Changelog

The Changelog may contain releases for `patch` or `minor`. If you do not see a fix listed in the Changelog but the issue has been resolved or the PR merged, then those changes will be `master` available in the next *minor* release.

> for the purposes of Angular Material 1.x, you *could* think of the patch releases as being *minor* changes and the 'minor' releases as being *major* changes.


## <a name="contributing"></a> Contributing

Developers interested in contributing should read the following guidelines:

- [Issue Guidelines](.github/CONTRIBUTING.md#submit)
- [Contributing Guidelines](.github/CONTRIBUTING.md)
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

    <!-- Angular Material CSS now available via Google CDN; version 1.0.7 used here -->
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/0.11.2/angular-material.min.css">

  </head>
  <body>

    <!-- Angular Material Dependencies -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-aria.min.js"></script>


    <!-- Angular Material Javascript now available via Google CDN; version 1.0.7 used here -->
    <script src="https://ajax.googleapis.com/ajax/libs/angular_material/1.0.7/angular-material.min.js"></script>
  </body>
```

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

