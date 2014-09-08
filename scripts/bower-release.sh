#!/bin/bash

ARG_DEFS=(
  "--new-version=(.*)"
)

function run {
  cd ../

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
  replaceJsonProp "bower.json" "version" "$NEW_VERSION"
  git add -A

  git commit -am "release: version $NEW_VERSION"
  git tag -f v$NEW_VERSION

  echo "-- Pushing to bower-material..."
  git push -q origin master
  git push -q origin v$NEW_VERSION
}

source $(dirname $0)/utils.inc
