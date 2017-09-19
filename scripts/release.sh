#!/bin/bash

ARG_DEFS=(
  "--version=(.*)"
)

function run {
  cd ../


  # GitHub token specified as Travis environment variable
  #   e.g. echo "https://${ANGULARJS_MATERIAL_BOWER_TOKEN}:@github.com" > .git/credentials
  #
  # Both `snapshot-docs-site.sh` and `bower-material-release.sh` use
  # this ANGULARJS_MATERIAL_BOWER_TOKEN variable


  if [[ "$ANGULARJS_MATERIAL_BOWER_TOKEN" == "" ]]; then
    echo "ERROR: Environment variable ANGULARJS_MATERIAL_BOWER_TOKEN needed to push a release."
    echo "Please set ANGULARJS_MATERIAL_BOWER_TOKEN to a valid github push token for angular/material,"
    echo "then try again."
    exit 1
  fi

  ./scripts/bower-material-release.sh --version=$VERSION

  replaceJsonProp "package.json" "version" "$VERSION"

  echo "-- Committing, tagging and pushing bower.json and package.json..."
  git commit package.json -m "release: version $VERSION"
  git tag -f v$VERSION
  git push -q origin master
  git push -q origin v$VERSION

  echo "-- Version $VERSION pushed successfully to angular/material!"
}

source $(dirname $0)/utils.inc
