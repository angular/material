#!/bin/bash

if [[ "$MODE" == "Sauce" ]]; then
  # Before running the sauce build, we have to manually build our distribution files
  # We don't want to have `build` as dependency of the karma-sauce task.
  gulp build
  gulp karma-sauce
else
  # We define all our browsers for the karma runner inside of our `.travis.yml`, because we don't want
  # to run the tests against Chrome on the Continuous Integration.
  gulp karma --browsers="$KARMA_TEST_BROWSERS" --reporters='dots'
fi