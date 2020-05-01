#!/bin/bash

# Enable tracing and Terminate the execution if anything fails in the pipeline.
set -xe

# Ensure that scripts will run from project dir.
cd $(dirname ${0})/../..

# When Travis CI specifies an AngularJS version, try to install those for tests.
if [[ -n "$NG_VERSION" ]]; then
  ./scripts/fetch-angular-version.sh "$NG_VERSION"
fi

# Run our check to make sure all tests will actually run
npm run ddescribe-iit

npm run test:ci
