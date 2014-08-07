#!/bin/bash

ARG_DEFS=(
  "--name=(.*)"
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
