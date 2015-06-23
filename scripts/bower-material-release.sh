#!/bin/bash

ARG_DEFS=(
  "--version=(.*)"
)

function run {
  cd ../

  echo "-- Building release..."
  rm -rf dist
  gulp build --release --version=$VERSION
  gulp build-all-modules --release --mode=default --version=$VERSION
  gulp build-all-modules --release --mode=closure --version=$VERSION
  rm -rf dist/demos

  echo "-- Cloning bower-material..."
  rm -rf bower-material
  git clone https://angular:$GH_TOKEN@github.com/angular/bower-material \
    bower-material --depth=2

  echo "-- Copying in build files..."
  cp -Rf dist/* bower-material/

  cd bower-material

  echo "-- Committing and tagging..."
  replaceJsonProp "bower.json" "version" "$VERSION"
  replaceJsonProp "package.json" "version" "$VERSION"

  git add -A
  git commit -am "release: version $VERSION"
  git tag -f v$VERSION

  echo "-- Pushing to bower-material..."
  git push -q origin master
  git push -q origin v$VERSION

  echo "-- Version $VERSION pushed successfully to angular/bower-material!"

  cd ../
}

source $(dirname $0)/utils.inc
