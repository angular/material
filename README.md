# Material Design for AngularJS Apps [![Build Status](https://travis-ci.org/angular/material.svg)](https://travis-ci.org/angular/material)

[Material Design](http://www.google.com/design/spec/material-design/) is a specification for a unified system of visual, motion, and interaction design that adapts across different devices. Our goal is to deliver a lean, lightweight set of AngularJS-native UI elements that implement the material design specification for use in Angular single-page applications (SPAs).

![venn](https://cloud.githubusercontent.com/assets/210413/5077572/30dfc2f0-6e6a-11e4-9723-07c918128f4f.png)

This project is in early pre-release. Angular Material is both a reference implementation of Material Design and a complementary effort to the [Polymer](http://www.polymer-project.org/) project's [Paper Elements](http://www.polymer-project.org/docs/elements/paper-elements.html) collection.

Quick Links:

*  [API & Demos](#demos)
*  [Contributing](#contributing)
*  [Building](#building)
*  [Installing](#installing)


Please note that using Angular Material requires the use of **Angular 1.3.x** or higher. Angular Material is targeted for all browsers with versions n-1; where n is the current browser version.

## <a name="demos"></a> Online Documentation (and Demos)

![angularmaterial](https://cloud.githubusercontent.com/assets/210413/5148790/fb9ecf52-7187-11e4-9adc-fc5ef263b4ce.png)

- Visit [Material.AngularJS.org](https://material.angularjs.org/) online to review the API, see the components in action with live Demos, and study the Layout system.
- Or you can build the documentation and demos locally; see the [Build Docs & Demos](https://github.com/angular/material/tree/master/docs) for details.

## <a name="contributing"></a> Contributing

Developers interested in contributing should read the following guidelines

- [Contributing Guidelines](docs/guides/CONTRIBUTING.md)
- [Coding Guidelines](docs/guides/CODING.md)
- [CHANGELOG](CHANGELOG.md)

It is important to note that for each release, the [ChangeLog](CHANGELOG.md) is a resource that will itemize all

- Bug Fixes,
- New Features,
- Breaking Changes

## <a name="building"></a> Building

Developers can easily build Angular Material using NPM and gulp.

*  [Builds - Under the Hood](docs/guides/BUILD.md)

First install or update your local project's **npm** tools:

```bash
# First install all the NPM tools:
npm install

# Or update
npm update
```

The run the **gulp** tasks:

```bash
# To build `angular-material.js/.css` and `Theme` files in the `/dist` directory
gulp build

# To build the Angular Material Docs and Demos in `/dist/docs` directory
gulp docs
```

For more details on how the build process works and additional commands (available for testing and debugging) developers should read [Build Instructions](docs/guides/BUILD.md).

## <a name="installing"></a>  Installing

For developers not interested in building the Angular Material library... use **bower** to install and use the Angular Material distribution files.

Change to your project's root directory.

```bash
# To get the latest stable version, use Bower from the command line.
bower install angular-material

# To get the most recent, latest committed-to-master version use:
bower install angular-material#master
```

Visit [Bower-Material](https://github.com/angular/bower-material/blob/master/README.md) for more details on how to install and use the Angular Material distribution files within your own local project.

CDN versions of Angular Material will be available in the near future.

>With a CDN, you will not need to download local copies of the distribution files. Instead reference the CDN urls to easily use those remote library files... this is especially useful when using online tools such as CodePen, Plunkr, or jsFiddle.


<br/>

