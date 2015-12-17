#!/bin/bash

ARG_DEFS=(
  "--version=(.*)"
)

function run {
  cd ../

  if [[ "$GH_TOKEN" == "" ]]; then
    echo "ERROR: Environment variable GH_TOKEN needed to push a release."
    echo "Please set GH_TOKEN to a valid github push token for angular/material,"
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
