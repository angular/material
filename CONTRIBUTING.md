# Contributing to Angular Material

 - [Code of Conduct](#coc)
 - [Signing the CLA](#cla)<br/><br/>
 - [Question or Problem?](#question)
 - [Issues and Bugs](#bug)
 - [Feature Requests](#feature)
 - [Guidelines for Developer Commits and Authorizations](#pr_forks)
 - [Submission Guidelines](#submit)

## <a name="coc"></a> Code of Conduct
Help us keep Angular open and inclusive.

Please read and follow our
[Code of Conduct](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md).

<br/>
## <a name="question"></a> Have a Question, Problem, or Idea?

If you have questions or ideas regarding Angular Material, please direct these to the
[Angular Material Forum](https://groups.google.com/forum/#!forum/ngmaterial).

Otherwise, do you:

- [Found a Bug ?](#bug)
- [Want a Feature ?](#feature)

#### <a name="bug"></a> 1. Found a Bug or Issue?
If you find a bug in the source code or a mistake in the documentation, we recommend that you first
review the [Online Documentation](http://material.angularjs.org/).

Otherwise you can help us improve by submitting an issue to our
[GitHub Repository](https://github.com/angular/material/issues/new). Even better you can submit a
**Pull Request** with a fix. Your custom changes can be crafted in a repository fork and submitted
to the [GitHub Repository](https://github.com/angular/material/compare) as a Pull Request.


> **Important: Please review the [Submission Guidelines](#submit) below, before contributing to the
  project**.

#### <a name="feature"></a> 2. Want a Feature?
You can request a new feature by
[submitting an issue](https://github.com/angular/material/issues/new). If you would like to
implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first on our
  [Angular Material Forum](https://groups.google.com/forum/#!forum/ngmaterial), so that we can better
  coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is
  successfully accepted into the project.
* **Small Changes** can be crafted and submitted to the
  [GitHub Repository](https://github.com/angular/material/compare) as a Pull Request.

## <a name="submit"></a> Issue Guidelines

Please note, this project is still in an early beta.

We're not actively reviewing unsolicited PRs from the community, although we welcome your feature
requests, doc corrections, and issue reports. If you're thinking of contributing code or docs to the
project, please review [Submitting Pull Requests](#submitpr) before beginning any work.

#### Submitting an Issue
Before you submit your issue,
**[search](https://github.com/angular/material/issues?q=is%3Aissue+is%3Aopen)** the issues archive;
maybe your question was already answered. If your issue appears to be a bug, and hasn't been
reported, open a new issue.

> Do not report duplicate issues; help us maximize the effort we can spend fixing issues and
adding new features.

Providing the following information will increase the chances of your issue being dealt with
quickly:

* **Issue Title** - provide a concise issue title prefixed with a lower camelCase name of the
                    associated target or component (if any): `<component>: <issue title>`.

  > e.g.
  > *  mdSideNav: Adding swipe functionality [#35](https://github.com/angular/material/issues/35)
  > *  mdTextFloat: does not set required/ng-required
       [#847](https://github.com/angular/material/issues/847)

* **Overview of the Issue** - if an error is being thrown, a non-minified stack trace helps.

* **Angular Material Version** - check the header of your `angular-material.js` file to determine
                                 your specific version #.

```js
/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.6.0-rc1-master-57f10f7
 */
 ```
* **Browsers and Operating System** - is this a problem with all browsers or only IE?
* **Reproduce the Error** - provide a live example (using [CodePen](http://codepen.io/),
  [Plunker](http://plnkr.co/), [JSFiddle](http://jsfiddle.net/)).
* **Related Issues** - has a similar issue been reported before?
* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit).<br/><br/>
Here are two examples of well-defined issues:
  - https://github.com/angular/material/issues/629
  - https://github.com/angular/material/issues/277

#### <a name="submitpr"></a>Submitting Pull Requests

**Important**: With the exception of minor bugs and doc fixes, we are not actively reviewing
unsolicited PRs to Angular Material.

Please check with us via [the discussion forum](https://groups.google.com/forum/#!forum/ngmaterial)
before investing significant effort in any pre-1.0 PR contribution; it's likely that we are already
working on a related PR.

* All contributions must be consistent with the Angular Material coding conventions. See the
  [Coding Guidelines](CODING.md)
* Submit proposed changes or additions as GitHub pull requests. See the
  [Pull Request Guidelines](PULL_REQUESTS.md)

<br/>
## <a name="commit"></a> Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more
readable messages** that are easy to follow when looking through the **project history**. It is
important to note that we use the git commit messages to **generate** the Angular Material
[Changelog](../../CHANGELOG.md) document.

> A detailed explanation of guidelines and conventions can be found in this
  [document](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#).

### <a name="commit-message-format"></a> Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**. The header has a special
format that includes a **type**, a **scope** and a **subject**:

```html
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

> Any line of the commit message cannot be longer 100 characters!<br/>
  This allows the message to be easier to read on github as well as in various git tools.

##### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

##### Scope
The scope could be anything specifying the place of the commit change.

##### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

##### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

##### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

> Breaking Changes are intended to highlight (in the ChangeLog) changes that will require community
  users to modify their code with this commit.

<br/>
##### Sample Commit message:

```text
refactor(content): prefix mdContent scroll- attributes

    BREAKING CHANGE: md-content's `scroll-` attributes are now prefixed with `md-`.

    Change your code from this:

    ```html
    <md-content scroll-x scroll-y scroll-xy>
    ```

    To this:

    ```html
    <md-content md-scroll-x md-scroll-y md-scroll-xy>
    ```
```

<br/>
## <a name="pr_forks"></a> Guidelines for Developer Commit Authorizations

Please review the [Commit Level and Authorization Guidelines](https://github.com/angular/material/blob/master/docs/guides/COMMIT_LEVELS.md) for details on how to implement and submit your fixes, changes, or enchancements to Angular Material. This guideline provides details on creating a repository Fork of the Angular Material repository and how to submit Pull Requests.



<br/>
## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code
changes to be accepted, the CLA must be signed. It's a quick process, we promise!

To learn more and sign the CLA, visit [cla.developers.google.com](http://cla.developers.google.com).
