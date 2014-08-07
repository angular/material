#!/bin/bash

ARG_DEFS=(
  "--registry-name=(.*)"
)

function prepare {
  cd ../

  NPM_DIR=$PWD/dist/npm-$REGISTRY_NAME

  rm -rf $NPM_DIR
  mkdir -p $NPM_DIR
}

function publish {
}

source $(dirname $0)/utils.inc
