## Understanding the Team Commit Process

The AngularJS Material team has a very specific process for change commits.

Our commit process is intentionally restrictive to (a) support the rapid evolution of AngularJS Material and (b) manage change complexity and coding standards within the framework. 

AngularJS Material uses a "Pull Request" process to allow team leaders opportunities to maintain code reviews, ensure sanity checks, encourage coding standards, and provide feedback to the developer. 

#### General Rules

* Please **do not** commit directly to master; unless explicitly authorized by the Team Leadership
* Team developers should fork the repository and work on fixes, features, or enhancements on their own fork.
  * Use the Pull Request feature to submit your changes to the 'upstream' AngularJS Material repository
* When a developer has changes ready for merging into master, those fixes or updates must be submitted via a Pull Request
* All PRs must be rebased (with master) and commits squashed prior to the final merge process
* Please **NEVER** use the *green* merge button on GitHub
  * AngularJS Material maintains a *flat*, linear change history using a specific **manual merge process**
  * Do not use Github's automated merge process
* Please include unit tests with all your source (component or core) changes
* All unit tests must have 100% passing before the PR will be accepted/merged.

> These process guidelines are especially important: our framework features and the team membership is growing rapidly.

#### Commit Authorization Rules

The development team has defined three (3) Github levels of **commit authorization** within [Angular/Material](https://github.com/angular/material/):

* General: 
  * Developers in this group includes any team members not listed under Team Leads or Caretakers below
  * For any and all changes, developers must use a feature branch from a fork of the AngularJS Material repository 
    * Please do not make or submit any changes from the master branch of your fork
  * Are not authorized to merge PRs
  * Should not reassign issue or change issue milestones
  * Should ensure their issue labels are correct
  * Should ensure their issues are tested with latest HEAD versions of AngularJS Material
  * Should ensure their issues are tested with latest releases of AngularJS (1.5.x, 1.6.x)
* Team Leads: 
  * Includes: [Michael Prentice](https://github.com/splaktar)
  * Are not authorized to merge PRs
  * Should assign issues and change issue milestones
  * Should ensure issue labels are correct
  * Should review PRs
    * Michael Prentice is the primary PR reviewer 
    * Should confirm Karma tests pass
* Google Caretakers:
  * Includes: [Jeremy Elbourn](https://github.com/jelbourn), [Andrew Seguin](https://github.com/andrewseguin), [Joey Perrott](https://github.com/josephperrott), [Tina Yuangao](https://github.com/tinayuangao), [Miles Malerba](https://github.com/mmalerba)
  * Should review PRs
    * Should confirm Karma tests pass
    * Should squash as needed
    * Should ensure the PR is closed when the merge finishes
  * Should create releases
  * Should add release assets to the Google CDN
