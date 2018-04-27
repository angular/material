# Contributing to AngularJS Material

 - [Code of Conduct](#coc)
 - [Signing the CLA](#cla)<br/><br/>
 - [Question or Problem?](#question)
 - [Issues and Bugs](#bug)
 - [Feature Requests](#feature)
 - [Guidelines for Developer Commits and Authorizations](#pr_forks)
 - [Submission Guidelines](#submit)

## <a name="coc"></a> Code of Conduct
Please help us keep AngularJS Material open and inclusive by reading and following our
[Code of Conduct](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md).

We are care deeply about our inclusive community and diverse group of members. As part of this,
we do take time away from development to enforce this policy through interventions in heated
discussions, one on one discussions to explain the policy to violators, and bans for repeat
violators.

## <a name="question"></a> Have a Question, Problem, or Idea?

If you have questions or ideas regarding AngularJS Material, please direct these to the
[AngularJS Material Forum](https://groups.google.com/forum/#!forum/ngmaterial).

Otherwise, do you:

- [Want to report a Bug?](#bug)
- [Want to request an Enhancement?](#feature)

#### <a name="bug"></a> 1. Want to report a Bug or Issue?
If you find a bug in the source code or a mistake in the documentation, we recommend that you first
review the latest `master` version of the [Online Documentation](https://material.angularjs.org/HEAD/)
and use one of the Demos to create a CodePen that reproduces the issue.

If the issue can be reproduced in the latest `master` version, you can help us by submitting an issue
to our [GitHub Repository](https://github.com/angular/material/issues/new). After the issue is triaged
(labels are applied to it), we invite you to submit a **Pull Request** with a proposed fix.
Your custom changes can be crafted in a repository fork and submitted
to the [GitHub Repository](https://github.com/angular/material/compare) as a Pull Request.


**Important**: Please review the [Submission Guidelines](#submit) below, before contributing to the
  project.

#### <a name="feature"></a> 2. Want to request an Enhancement?
You can request an enhancement by
[submitting an issue](https://github.com/angular/material/issues/new). After an issue is submitted,
if you would like to implement an enhancement then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first on our
  [AngularJS Material Forum](https://groups.google.com/forum/#!forum/ngmaterial), so that we can better
  coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is
  successfully accepted into the project.
* **Small Changes** can be crafted and submitted to the
  [GitHub Repository](https://github.com/angular/material/compare) as a Pull Request.

## <a name="submit"></a> Issue Guidelines
Please note, this project is mature and stable with thousands of projects depending upon it.

We welcome your enhancement requests, doc improvements, and issue reports.
However, we are not accepting major feature requests at this time.
 
If you're thinking of contributing code or documentation to the
project, please review [Submitting Pull Requests](#submitpr) before beginning any work.

#### Submitting an Issue
Before you submit an issue,
**[search](https://github.com/angular/material/issues?q=is%3Aissue+is%3Aopen)** the issues archive;
maybe the issue has already been submitted or considered. If the issue appears to be a bug,
and hasn't been reported, open a [new issue](https://github.com/angular/material/issues/new).

> Please **do not report duplicate issues**; help us maximize the effort we can spend fixing
issues and adding enhancements.

Providing the following information will increase the chances of your issue being dealt with
quickly:

* **Issue Title** - provide a concise issue title prefixed with a snake-case name of the
                    associated service or component (if any): `<component>: <issue title>`.
                    Adding the `md-` prefix should be avoided.

  > e.g.
  > *  menu-bar: does not support dark mode themes [#11238](https://github.com/angular/material/issues/11238)
  > *  tooltip: memory leak on destroy [#11133](https://github.com/angular/material/issues/11133)

* **Complete the full Issue Template** - GitHub now supports issue templates and AngularJS Material
    provides one to make submitting an issue with all of the required information more straightforward.

* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit).

#### <a name="submitpr"></a>Submitting Pull Requests

**Important**: We are not accepting major feature requests or PRs that contain major new features
 or breaking changes at this time.

Please check with us via [the discussion forum](https://groups.google.com/forum/#!forum/ngmaterial)
before investing significant effort in a planned Pull Request submission; it's possible that we are
already working on a related PR or have decided that the enhancement does not belong in the core
AngularJS Material project.

* All contributions must be consistent with the AngularJS Material [Coding Conventions](../docs/guides/CODING.md).
* Submit proposed changes or additions as GitHub pull requests that follow the
  [Pull Request Guidelines](../docs/guides/PULL_REQUESTS.md).

<br/>

## <a name="commit"></a> Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more
readable messages** that are easy to follow when looking through the **project history**. 

It is important to note that we use the git commit messages to **generate** the AngularJS Material
[CHANGELOG](../../CHANGELOG.md) document. Improperly formatted commit messages may result in your
change not appearing in the CHANGELOG of the next release.

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
  This allows the message to be easier to read on GitHub as well as in various Git tools.

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
The scope could be anything that helps specifying the scope (or feature) that is changing.

Examples
- select(multiple): 
- dialog(alert): 

##### Subject
The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

##### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

##### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**, **Fixes**, or **Relates to**.

> Breaking Changes are intended to be highlighted in the ChangeLog as changes that will require
  community users to modify their code after updating to a version that contains this commit.

##### Sample Commit messages:
```text
fix(autocomplete): don't show the menu panel when readonly

this could sometimes happen when no value was selected

Fixes #11231
```
```text
feat(chips): trigger ng-change on chip addition/removal

* add test of `ng-change` for `md-chips`
* add docs regarding `ng-change` for `md-chips` and `md-contact-chips`
* add demo for ng-change on `md-chips`
* add demo for ng-change on `md-contact-chips`

Fixes #11161 Fixes #3857
```

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

Please review the [Commit Level and Authorization Guidelines](../docs/guides/COMMIT_LEVELS.md) for
details on how to implement and submit your fixes, changes, or enhancements to AngularJS Material.

This guideline provides details on creating a repository Fork of the AngularJS Material repository
and how to submit Pull Requests.

<br/>

## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code
changes to be accepted, the CLA must be signed. It's a quick process, we promise!

To learn more and sign the CLA, visit [cla.developers.google.com](http://cla.developers.google.com).
