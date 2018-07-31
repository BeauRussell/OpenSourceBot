# Contributing

## Code Guidelines

StreamMe's OpenSourceBot uses [happiness code style][1] in all of its files. Make sure to check
all of your changes to the code by running `happiness` in your command prompt before you commit. 
Tabs are 2 spaces, and each line ends with a semicolon.

Try to maintain similar whitespace and other formatting styles to the rest of the code.

This repo also uses [mocha][2] to test written functions. If you make any changes to expected 
input/output of functions, please rewrite the tests or inform us in the [discord][3] so we can 
change them for you. However please only do this if you do not how to use mocha.

## Committing Changes

All changes made to this code should be pushed to a remote feature branch, preferably with a name 
summarizing the change made (ex: 'Adding new command'). Then open a pull request to master, setting
user `BeauRussell` as a reviewer.

CI will make sure the code is up to `happiness` standards, and if so, you will be able to merge the
pull request once the owner has given approval.



[1]: https://www.npmjs.com/package/happiness
[2]: https://mochajs.org/
[3]: https://discord.gg/YchZTYY