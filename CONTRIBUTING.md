# Contributing to Material Design Components for Angular

 - [Code of Conduct](#coc)
 - [Issues and Bugs](#issue)
 - [Submission Guidelines](#submit)
 - [Coding Rules](#rules)
 - [Commit Message Guidelines](#commit)
 - [Signing the CLA](#cla)

## <a name="coc"></a> Code of Conduct
Help us keep Angular open and inclusive. Please read and follow our [Code of Conduct][coc].

## <a name="issue"></a> Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an issue to our [GitHub Repository][github]. Even better you can submit a Pull Request
with a fix.

* **Small Changes** can be crafted and submitted to [GitHub Repository][github] as a Pull Request.

## <a name="submit"></a>Submission Guidelines

We're still in early development but we look forward to welcoming community contributions soon. 

### Component Structure

Each component is a folder of its own. Each component can have many files: javascript, tests, sass, 
a README, and demos.  

**Demos**

Demos are located in subfolders of the component. Each demo must have an index.html, and can then have
any number of additianal javascript/css/html-templates.  The index.html is an html partial:
it should represent an angular app that will be appended to another page's body.  
See `src/components/dialog/demo1/` for an example.

**The `module.json` File**

In order for the build system to know how each component is organized, a `module.json` file in the 
root of the component is expected.  It has the following structure (all file-matching patterns are
relative to the component's directory):

```js
{
  // Required. The id of the angular module this component represents.
  "id": "material.components.myAwesomeComponent",

  // Required. The 'human readable' name of this component
  "name": "My Awesome Component",

  // A pattern matching all the js files for this component. Default: ["*.js", "!*.spec.js`]
  "js": [], 

  // A pattern matching all the scss files for this component. Default: ["*.scss"]
  "scss": [], 

  // A pattern matching all the readme files for this component. Default: ["README.md"]
  "readme": [], 

  // An object matching the demos for this component. Default: no demos.
  // Structure: `demos: { "myDemo": { "name": "My Demo", files: ["myDemoFolder/*"] }
  "demos": {},
}
```

### Documentation

A component's documentation is parsed from the README, and from comments in the component's source files.

The component's general description goes in the README file. The contents of the README will then 
be displayed on the component's overview page with all of its demos.

Then, source comments will parsed to generate detailed API documentation pages.

We use the angular source-documentation conventions. Check any component's source file for examples.

### Javascript Conventions

- 2 spaces for tabs
- Each component declares its own module at the top and leaks no variables
- Use the 'revealing pattern' when possible. API at top, function definitions at bottom.  See src/components/checkbox/checkbox.js
- JSHint conventions in progress

### Testing Conventions

- For testing, use `beforeEach` loops and global variables as little as possible.
  * Each test should have its own isolated logic, to make tests easier to read and more portable.

- For an example of the desired directive testing pattern, see `src/components/checkbox/checkbox.spec.js`
  * Create a `setup(attrs)` function which takes attributes to put on the directive
  * The `setup` function should register the module for the test and return the compiled directive element.
  * Use `el.scope()` and `el.isolateScope()` to access the element's scope.


## <a name="commit"></a> Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the AngularDart change log**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. 

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

###Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.


A detailed explanation can be found in this [document][commit-message-format].

## <a name="cla"></a> Signing the CLA 

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code
changes to be accepted, the CLA must be signed. It's a quick process, we promise!

* For individuals we have a [simple click-through form][individual-cla].
* For corporations we'll need you to
  [print, sign and one of scan+email, fax or mail the form][corporate-cla].


[coc]: https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#
[communityMilestone]: https://github.com/angular/angular.dart/issues?milestone=13&state=open
[corporate-cla]: http://code.google.com/legal/corporate-cla-v1.0.html
[dart-style-guide]: https://www.dartlang.org/articles/idiomatic-dart/
[github]: https://github.com/angular/material
[individual-cla]: http://code.google.com/legal/individual-cla-v1.0.html
