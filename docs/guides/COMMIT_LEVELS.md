## Understanding the Team Commit Process
The AngularJS Material team has a very specific process for change commits.

Our commit process is intentionally restrictive to 
1. Support the evolution of AngularJS Material while avoiding unexpected breaking changes
1. Manage change complexity and coding standards within the library

AngularJS Material uses a "Pull Request" process to allow team leads opportunities to maintain
code reviews, ensure sanity checks, encourage coding standards, and provide feedback to help
contributors learn and improve.

#### General Rules

* Please **do not** commit directly to master; unless explicitly authorized by a Team Lead
* Contributors should fork the repository and work on fixes or enhancements on their own fork.
  * Use the Pull Request feature to submit your changes to the 'origin' AngularJS Material repository
* When a developer has changes ready for merging into master, those fixes or updates must be submitted via a Pull Request
* All PRs should be rebased (with master) and commits squashed prior to the final merge process
* Please include unit tests with all your source (component or core) changes
* All unit tests must be 100% passing before the PR will be approved/merged.

#### Commit Authorization Rules

The development team has defined three (3) Github levels of **commit authorization** within 
[AngularJS Material](https://github.com/angular/material/):

* **Contributors**: 
  * Developers in this group includes any team members not listed under Team Leads or Caretakers below
  * For any and all changes, developers must use a feature branch from a fork of the AngularJS Material repository 
    * Please do not make or submit any changes from the master branch of your fork
  * Are not authorized to merge PRs
  * Should not reassign issues or change milestones
  * Should ensure their issue labels are correct
  * Should test their issues with the latest HEAD versions of AngularJS Material
  * Should test their issues with the latest releases of AngularJS (1.7.x, 1.8.x)
  * Should communicate with the Team Lead when their PRs are submitted or code review updates
     are complete
    * Should direct all questions about the status of presubmit testing to the Team Leads
  * Should review PRs
* **Team Leads**: 
  * Includes: [Michael Prentice](https://github.com/splaktar)
  * Are not authorized to merge PRs
  * Should assign issues and manage milestones
  * Should ensure issue labels are correct
  * Should review PRs
    * Michael Prentice is the primary PR reviewer and approver
    * Should confirm all CI tasks and CLA check passes
  * Should process approved PRs
    * Should verify that `merge safe` labels are accurate, then request Caretaker to merge
    * Should request that a Caretaker starts Google presubmit tests when PRs are labeled
      `merge ready` and do not have the `merge safe` label
  * Should decide when to package and deploy new releases
    * Should provider Caretaker with a reviewed and approved CHANGELOG
* **Google Caretakers**:
  * Includes: [Jeremy Elbourn](https://github.com/jelbourn), [Andrew Seguin](https://github.com/andrewseguin), [Miles Malerba](https://github.com/mmalerba)
  * Rotate responsibilities by the week. Each week has a primary and backup Caretaker.
  * Should review PRs
    * Should confirm all CI tasks and CLA check passes
  * Should start Google presubmit tests for `merge ready` PRs when requested by Team Leads
    * Should report the status of the presubmit tests to the Team Leads and/or in the PR within 2 days
  * Should merge PRs
    * Should merge `merge ready` and `merge safe` PRs without running presubmit tests
    * Should merge `merge ready` PRs after successful presubmit
    * Should squash and merge PRs with multiple commits
  * Should create new releases
    * Should confirm new release CHANGELOGs with Team Leads
    * Should create CLs to add release assets to the Google CDN
    * Should notify Team Leads when CDN CLs are completed
