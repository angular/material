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
- 
### File Structure

- Components belong in `src/components/{componentName}`
- Component modules must be named `material.components.{componentName}`
- Templates for directives are declared inline
- Gulp builds files to `dist` folder, which is not version controlled (read below)
- 

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more [specs][unit-testing].
* All public API methods **must be documented** with ngdoc, an extended version of jsdoc (we added
  support for markdown and templating via @ngdoc tag). To see how we document our APIs, please check
  out the existing ngdocs and see [this wiki page][ngDocs].
* With the exceptions listed below, we follow the rules contained in
  [Google's JavaScript Style Guide][js-style-guide]:
    * **Do not use namespaces**: Instead,  wrap the entire angular code base in an anonymous closure and
      export our API explicitly rather than implicitly.
    * Wrap all code at **100 characters**.
    * Instead of complex inheritance hierarchies, we **prefer simple objects**. We use prototypal
      inheritance only when absolutely necessary.
    * We **love functions and closures** and, whenever possible, prefer them over objects.
    * To write concise code that can be better minified, we **use aliases internally** that map to the
      external API. See our existing code to see what we mean.
    * We **don't go crazy with type annotations** for private internal APIs unless it's an internal API
      that is used throughout AngularJS. The best guidance is to do what makes the most sense.