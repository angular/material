#!/bin/bash

# Run our check to make sure all tests will actually run
gulp ddescribe-iit

# Run our actual build
gulp build
gulp karma --config=config/karma-sauce.conf.js --browsers=$BROWSER --reporters='dots'
