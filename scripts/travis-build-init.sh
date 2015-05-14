#!/bin/bash

ARG_DEFS=(
  "--sha=(.*)"
)

function init {
  # If --git-push-dryrun or --verbose are set, be sure to export them
  # so they are set in all the other scripts too
  export GIT_PUSH_DRYRUN=$GIT_PUSH_DRYRUN
  export VERBOSE=$VERBOSE
}

function run {
  if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
    echo "-- This is a pull request; not pushing out build."
    exit 0
  fi

  cd ../

  NEW_VERSION="$(readJsonProp "package.json" "version")-master-$(echo $SHA | head -c 7)"

  ./scripts/bower-material-release.sh --version=$NEW_VERSION
  ./scripts/snapshot-docs-site.sh --version=$NEW_VERSION
}

source $(dirname $0)/utils.inc
