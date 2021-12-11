# Contributing

## Branch and repository management
(1) If you want to develop or fix something, create a new branch from the `master` branch. Developers are only allowed to modify code in the branches they've created.


(2) Next, submit a Pull Request. Your feature will be tested, approved and merged by somebody responsible of merge requests. Once approved the branch you created is merged and it will be deleted.

## Versions
When a feature is approved it will alter the browser version. This is done using `npm run version:new` command. This will generate an entry in the change log and modify the version number of the browser.

To avoid every commit message from going into the changle log. Only approvers of Pull Requests will use Commit Zen:

`npx git-cz -m` instead of `git commit -m` 

This will ensure that just items using Commit Zen will go into the change log.