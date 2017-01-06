#!/bin/bash

# Terminate the execution if anything fails in the pipeline.
set -e

# Run our check to make sure all tests will actually run
gulp ddescribe-iit
gulp build

# Initialize our Sauce Connector
./scripts/sauce/setup-tunnel.sh;

# Wait for the tunnel to be ready
./scripts/sauce/wait-tunnel.sh

# When Travis CI specifies an Angular version, try to install those for tests.
if [[ -n "$NG_VERSION" ]]; then
  npm i angular@$NG_VERSION \
        angular-{animate,aria,messages,mocks,route,sanitize,touch}@$NG_VERSION
fi

gulp karma --config=config/karma-sauce.conf.js --browsers=$BROWSER --reporters='dots'

# Shutdown the tunnel
./scripts/sauce/stop-tunnel.sh