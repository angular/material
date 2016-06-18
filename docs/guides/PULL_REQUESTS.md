### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/angular/material/pulls) for an open or closed Pull Request
  that relates to your submission. You don't want to duplicate effort.

* Please sign our [Contributor License Agreement (CLA)](../../.github/CONTRIBUTING.md#cla) before sending pull
  requests. We cannot accept code without this.

* Make your changes in a new git branch:

     ```shell
     git checkout -b wip/my-fix-branch master
     ```

* Follow our [Coding Rules](CODING.md#rules).

* **Include appropriate test cases.**

* Create your patch.

* Run the full Angular Material test suite, as described in the [developer documentation](BUILD.md),
  and ensure that all tests pass.

* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](../../.github/CONTRIBUTING.md#commit-message-format). Adherence to the [commit message conventions](../../.github/CONTRIBUTING.md#commit-message-format) is required
  because release notes are automatically generated from these messages.

     ```shell
     git commit -a
     ```
  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Build your changes locally to ensure all the tests pass:

    ```shell
    gulp karma
    ```

* Push your branch to GitHub:

    ```shell
    git push origin wip/my-fix-branch
    ```

* In GitHub, send a pull request to `angular:master`.

* If we suggest changes then:
  * Make the required updates.

  * Re-run the Angular Material test suite to ensure tests are still passing.

  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

<br/>
<hr/>

That's it... thank you for your contribution!

<hr/>

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete wip/my-fix-branch
    ```

* Check out the master branch:

    ```shell
    git checkout master -f
    ```

* Delete the local branch:

    ```shell
    git branch -D wip/my-fix-branch
    ```

* Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```
