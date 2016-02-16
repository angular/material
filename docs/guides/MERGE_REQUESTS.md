## Merging a Pull Request

* [Copy the PR into a local branch](#curl)
* [Squashing everything into one commit](#squash)
* [Dealing with Conflicts](#conflicts)
* [Merging With Master](#merging)

<hr/>

###<a name="curl"></a> Bringing a pull request into your local git

To bring in a pull request, first create a new branch for that pull request:

```sh
git checkout -b wip-pr-143
```

Then run the following to bring all of the commits from that pull request
in on top of your branch's local history:

```sh
curl https://github.com/angular/material/pull/143.patch | git am -3
```

If there are any conflicts, go to the [Dealing with conflicts](#conflicts) section below.

If the merge succeeds, use `git diff origin/master` to see all the new changes that will happen
post-merge.

###<a name="squash"></a> Squashing everything into one commit

Before merging a pull request into master, make sure there is only one commit
representing the changes in the pull request, so the git log stays lean.

We will use git's interactive rebase to let us manipulate, merge, and rename
commits in our local history.

To interactively rebase all of your commits that occur after the latest in master, run:

```sh
git rebase --interactive origin/master
```

This will bring up an interactive dialog in your text editor. Follow the instructions
to squash all of your commits into the top one, then rename the top one.

Once this is done, run `git log` and you will see only one commit after master, representing
everything from the pull request.

Finally, we'll pull from master with rebase to put all of our local commits on top of
the latest remote.

```sh
git pull --rebase origin master
```

This may cause conflicts, see below for how to deal with these.

###<a name="conflicts"></a> Dealing with conflicts

Run the following to see which files are conflicted:

```sh
git status
```

You can open the conflicted files and fix them manually, or if the conflict isn't relevant, run:

```sh
git checkout --theirs <file>
```

To checkout *your local* version of the file.

```sh
git checkout --ours <file>
```

To checkout *their remote* version of the file. (yes, it's backwards).

After all the conflicted files are fixed, run:

```sh
git add -A
git rebase --continue
```

Or if you're pulling from `git am` and fixing conflicts, run:

```sh
git add -A
git am --continue
```

###<a name="merging"></a> Merging with master

Finally, after you've squashed the whole pull request into one commit and made sure
it has no conflicts with the latest master and tests are run, you're ready to merge it in.

Simply go back to the master branch:

```sh
git checkout master
```

Make sure you're up to date in the master branch too:

```sh
git pull --rebase origin master
```

And finally, rebase your pull request in from your WIP pull request branch:

```sh
git rebase wip-pr-143
```

This will rebase the commits from wip-pr-143 into master.

Finally, verify that tests pass and the docs look fine, and make sure
the commit message for the pull request closes the proper issues and lists
breaking changes.

You can amend the commit to change the message:

```sh
git commit --amend
```

This will open the latest commit in your text editor and allow you to add
text. Do **not** forget to add `Close #xxx` to also close the PR; in this case you will add
`Close #143`.

For example:

> fix(constant): rename $mdConstant.SOMETHING_ELSE to $mdConstant.SOMETHING

> Close #143. Close #156.

> BREAKING CHANGE: $mdConstant.SOMETHING_ELSE has been renamed to $mdConstant.SOMETHING.

> Change your code from this:

> ```js
  $mdConstant.SOMETHING_ELSE
> ```

> To this:

> ```js
  $mdConstant.SOMETHING
> ```

For more examples of how to format commit messages, see
[the guidelines in CONTRIBUTING.md](../../CONTRIBUTING.md#-git-commit-guidelines).

```sh
git push origin master
```

Lastly, be sure to cleanup any branches that you were using for this pull request.

```sh
git branch -D wip-pr-143
```
