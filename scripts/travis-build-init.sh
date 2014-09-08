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
  cd ../

  NEW_VERSION="$(readJsonProp "package.json" "version")-master-$(echo $SHA | head -c 7)"

  ./scripts/bower-release.sh --new-version=$NEW_VERSION
}

source $(dirname $0)/utils.inc
