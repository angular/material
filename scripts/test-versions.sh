#!/bin/bash

# The purpose of this file is to download
# assigned AngularJS source files and test
# them against this build of AngularJS Material using Jenkins.

# This works by pulling in all of the tags
# from AngularJS, finding the highest version
# numbers for each branch (e.g. 1.5 => 1.5.X where
# X is the highest patch release). For each
# detected version it will then copy over each
# of the source files to the node_modules/angular-X
# folder and then run `gulp karma` to see if
# they pass. If there are one or more failed tests
# then this script will propagate a failed exit code.

# [INPUT]
# just run `./scripts/test-versions.sh`

# [OUTPUT]
# an exit code of "0" (passing) or "1" (failing)

# [CONFIG VALUES]

# Available Options are: 1.X, 1.X.X, 1.X.X-(beta|rc).X or snapshot
VERSIONS=(1.5 1.6 1.7 snapshot)
BROWSERS="Chrome"

#
# DO NOT EDIT PAST THIS LINE
#
FAILED=false

if [ ${#VERSIONS[@]} == 0 ]; then
  echo "Error: please specify one or more versions of AngularJS to test..."
  exit 1
fi;



for VERSION in "${VERSIONS[@]}"; do

  echo "######################################################################"
  echo "#######                     Jenkins Build                      #######"
  echo "#######   Testing AngularJS Material + AngularJS (${VERSION})  #######"
  echo "######################################################################"

  ./scripts/fetch-angular-version.sh $VERSION

  echo "\n"
  pwd
  node ./node_modules/gulp/bin/gulp.js karma --config=config/karma-jenkins.conf.js --reporters='dots' --browsers=$BROWSERS
  LAST_EXIT_CODE=$?

  echo "\n"
  echo "......................................................................"
  echo ".......  Finished:  ngM1 + AngularJS (${VERSION})        ............."
  echo "......................................................................"
  echo "\n"

  if [ $LAST_EXIT_CODE != "0" ]; then
    echo "STATUS: FAILED"
    FAILED=true
  else
    echo "STATUS: SUCCESS"
  fi

  echo "\n\n"
done

if [ $FAILED == true ]; then
  echo "Error: One or more of the karma tests have failed..."
  exit 1
else
  echo "All tests have passed successfully..."
fi
