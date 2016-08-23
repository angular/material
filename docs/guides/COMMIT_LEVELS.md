## Understanding the Team Commit Process

The Angular Material team has a very specific process for change commits.

Our commit process is intentionally restrictive to (a) support the rapid evolution of Angular Material and (b) manage change complexity and coding standards within the framework. 

Angular Material uses a "Pull Request" process to allow team leaders opportunities to maintain code reviews, ensure sanity checks, encourage coding standards, and provide feedback to the developer. 

#### General Rules

* Please **do not** commit directly to master; unless explicitly authorized by the Team Leadership
* Team developers should fork the repository and work on fixes, features, or enhancements on their own fork.
  * Use the Pull Request feature to submit your changes to the 'upstream' Angular Material repository
* When a developer has changes ready for merging into master, those fixes or updates must be submitted via a Pull Request
* All PRs must be rebased (with master) and commits squashed prior to the final merge process
* Please **NEVER** use the *green* merge button on GitHub
  * Angular Material maintains a *flat*, linear change history using a specific **manual merge process**
  * Do not use Github's automated merge process
* Please include unit tests with all your source (component or core) changes
* All unit tests must have 100% passing before the PR will be accepted/merged.

> These process guidelines are especially important: our framework features and the team membership is growing rapidly.

#### Commit Authorization Rules

The development team has defined three (3) Github levels of **commit authorization** within [Angular/Material](https://github.com/angular/material/):

* General: 
  * Developers in this group includes any team members not listed under Core or Team Leads below
  * For any and all changes, developers must use a fork of the Angular Material repository 
    * Please do not make or submit any changes from the master branch. 
  * Are not authorized to merge PRs
  * Should not reassign issue or change issue milestones
  * Should ensure their issue labels are correct
  * Should ensure their issues are tested with latest HEAD versions of Angular Material
  * Should ensure their issues are tested with latest releases of Angular (1.3.x, 1.4.x, 1.5.x)
* Core: 
  * Includes: [Topher Fangio](https://github.com/topherfangio)
  * Should not merge PRs (unless explicitly requested)
  * Should use Angular Material branches for major, non-trivial changes. 
  * For minor changes, developers in this group may elect to commit direct to master.
* Team Leads:
  * Includes: [Naomi Black](https://github.com/naomiblack), [Thomas Burleson](https://github.com/ThomasBurleson), [Jeremy Elbourn](https://github.com/jelbourn)
  * May review PRs
    * ThomasBurleson is the primary PR reviewer 
    * Should confirm Karma tests pass
    * Should squash as need
    * Should ensure the PR is closed when the merge finishes.
