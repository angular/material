# Coding Conventions and Guidelines

 - [Project Structure](#structure)
 - [Coding Rules](#rules)


## <a name="structure"></a> Project Structure

All component modules are defined in:

```text
 -- /src
    -- /components
       -- /<component folder>

          -- <component>.js
          -- <component>.spec.js
          -- <component>.scss
          -- <component>-theme.scss

          -- /demo<name>

             -- index.html
             -- style.css
             -- script.js
```

All component modules are compiled and distributed individually to:

```text
 -- /dist
    -- /modules
       -- /js
          -- /core
          -- /<component folder>
```

Additionally, all component modules are compiled and deployed as a library to:

```text
 -- /dist
    -- angular.material.js
    -- angular.material.css
```

> NOTE: the `dist` directory is **not** version controlled.

<br/>
## <a name="rules"></a> Coding Rules

#### Coding conventions:

The best guidance is a coding approach that implements both code and comments in a clear,
understandable, concise, and DRY fashion.

Below is a sample code that demonstrates some of our rules and conventions:

```js
/**
 * @ngdoc module
 * @name material.components.slider
 */
angular.module('material.components.slider', [
  'material.core'
])
  .directive('mdSlider', SliderDirective);

/**
 * @ngdoc directive
 * @name mdSlider
 * @module material.components.slider
 * @restrict E
 * @description
 * The `<md-slider>` component allows the user to choose from a range of values.
 *
 * It has two modes: 'normal' mode, where the user slides between a wide range of values, and
 * 'discrete' mode, where the user slides between only a few select values.
 *
 * To enable discrete mode, add the `md-discrete` attribute to a slider, and use the `step`
 * attribute to change the distance between values the user is allowed to pick.
 *
 * @usage
 * <h4>Normal Mode</h4>
 * <hljs lang="html">
 *   <md-slider ng-model="myValue"
 *              min="5"
 *              max="500">
 *   </md-slider>
 * </hljs>
 *
 * <h4>Discrete Mode</h4>
 * <hljs lang="html">
 *   <md-slider md-discrete
 *              ng-model="myDiscreteValue"
 *              step="10"
 *              min="10"
 *              max="130">
 *   </md-slider>
 * </hljs>
 *
 * @param {boolean=} mdDiscrete Whether to enable discrete mode.
 * @param {number=} step The distance between values the user is allowed to pick. Default 1.
 * @param {number=} min The minimum value the user is allowed to pick. Default 0.
 * @param {number=} max The maximum value the user is allowed to pick. Default 100.
 */
function SliderDirective($mdTheming) {
  //...
}

```

*  With the exceptions listed in this document, follow the rules contained in
   [Google's JavaScript Style Guide](https://google.github.io/styleguide/javascriptguide.xml).
*  All components must have unique, understandable module names; prefixed with
   'material.components.'.
*  All components must depend upon the 'material.core' module.
*  Do not use `$inject` to annotate arguments.<br/>
   ngAnnotate is used as part of the build process to automatically create the annotations.
*  All public API methods **must** be documented with ngdoc, an extended version of jsdoc (we added
   support for markdown and templating via @ngdoc tag). To see how we document our APIs, please
   check out the existing ngdocs and see
   [this wiki page](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation).
*  All directives must use the `md-` prefix for both the directive name and any directive
   attributes.<br/>
   Directive **templates** should be defined inline.


#### Testing

* All components must have valid, **passing** unit tests.
* All features or bug fixes **must be tested** by one or more
  [specs](https://docs.angularjs.org/guide/unit-testing).

#### Coding

* Wrap all code at **100 characters**.
* Do not use tabs. Use two (2) spaces to represent a tab or indent.
* Constructors are PascalCase, closures and variables are lowerCamelCase.
* When enhancing or fixing existing code
  * Do not reformat the author's code
  * Conform to standards and practices used within that code; unless overridden by best practices or patterns.
  * Provide jsDocs for functions and single-line comments for code blocks
  * Be careful of regression errors introduce by your changes
  * **Always** test your changes with unit tests and manual user testing.

#### Patterns

* All source files will be automatically wrapped inside an anonymous closure using the Module Pattern.
* Use the **Revealing Pattern** as a coding style.
* Do **not** use the global variable namespace, export our API explicitly via Angular DI.
* Instead of complex inheritance hierarchies, use **simple** objects.
* Avoid prototypal inheritance unless warranted by performance or other considerations.
* We **love** functions and closures and, whenever possible, prefer them over objects.<br/>

    > Do not use anonymous functions. All closures should be named.

#### Documentation

* All non-trivial functions should have a jsdoc description.
* To write concise code that can be better minified, we **use aliases internally** that map to the
  external API.
* Use of argument **type annotations** for private internal APIs is not encouraged, unless it's an
  internal API that is used throughout Angular Material.
