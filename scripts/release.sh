#!/bin/bash

ARG_DEFS=(
  "--version=(.*)"
  "[--optional=([A-Za-z])]"
)

function run {
  cd ../

  if [[ "$GH_TOKEN" == "" ]]; then
    echo "ERROR: Environment variable GH_TOKEN needed to push a release."
    echo "Please set GH_TOKEN to a valid github push token for angular/material,"
    echo "then try again."
    exit 1
  fi

  echo "-- Building release..."
  gulp build --release

  echo "-- Cloning bower-material to dist..."
  rm -rf dist/bower-material
  git clone https://angular:$GH_TOKEN@github.com/angular/bower-material \
    dist/bower-material

  echo "-- Copying in build files..."
  cp dist/angular-material* dist/bower-material
  cd dist/bower-material

  echo "-- Committing and tagging..."
  replaceJsonProp "bower.json" "version" "$VERSION"
  git add -A

  git commit -am "release: version $VERSION"
  git tag -f v$VERSION

  echo "-- Pushing to bower material..."
  git push -q origin master
  git push -q origin v$VERSION

  echo "-- Version $VERSION pushed successfully to angular/bower-material!"

  echo "-- Updating package.json & bower.json in angular-material main..."
  cd ../..
  replaceJsonProp "bower.json" "version" "$VERSION"
  replaceJsonProp "package.json" "version" "$VERSION"

  echo "-- Committing, tagging and pushing bower.json and package.json..."
  git commit bower.json package.json -m "release: version $VERSION"
  git tag -f v$VERSION
  git push -q origin master
  git push -q origin v$VERSION

  echo "-- Version $VERSION pushed successfully to angular/material!"
}

source $(dirname $0)/utils.inc
