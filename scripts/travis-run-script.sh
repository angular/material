#!/bin/bash

# Enable tracing and Terminate the execution if anything fails in the pipeline.
set -xe

# Ensure that scripts will run from project dir.
cd $(dirname $0)/..

# When Travis CI specifies an AngularJS version, try to install those for tests.
if [[ -n "$NG_VERSION" ]]; then
  ./scripts/fetch-angular-version.sh "$NG_VERSION"
fi

# Run our check to make sure all tests will actually run
gulp ddescribe-iit
gulp build

# Initialize our Sauce Connector
./scripts/sauce/setup-tunnel.sh;

# Wait for the tunnel to be ready
./scripts/sauce/wait-tunnel.sh

if [[ -n "$BROWSERS" ]]; then
    gulp karma --config=config/karma-sauce.conf.js --browsers=$BROWSERS --reporters='dots'
else
    gulp karma --config=config/karma-sauce.conf.js --reporters='dots'
fi

# Shutdown the tunnel
./scripts/sauce/stop-tunnel.sh
