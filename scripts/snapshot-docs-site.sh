#!/bin/bash

ARG_DEFS=(
  "--version=(.*)"
)

function run {
  cd ../

  echo "-- Building docs site release..."
  rm -rf dist
  gulp docs --release

  echo "-- Cloning code.material.angularjs.org..."
  rm -rf code.material.angularjs.org
  git clone https://angular:$GH_TOKEN@github.com/angular/code.material.angularjs.org.git --depth=1

  echo "-- Remove previous snapshot..."
  rm -rf code.material.angularjs.org/HEAD

  echo "-- Copying docs site to snapshot..."
  sed -i "s,http://localhost:8080/angular-material,https://cdn.gitcdn.link/cdn/angular/bower-material/v$VERSION/angular-material,g" dist/docs/docs.js
  sed -i "s,http://localhost:8080/docs.css,https://material.angularjs.org/$VERSION/docs.css,g" dist/docs/docs.js
  sed -i "s,base href=\",base href=\"/HEAD,g" dist/docs/index.html


  cp -Rf dist/docs code.material.angularjs.org/HEAD

  cd code.material.angularjs.org

  echo "-- Commiting snapshot..."
  git add -A
  git commit -m "snapshot: $VERSION"

  echo "-- Pushing snapshot..."
  git push -q origin master

  cd ../

  echo "-- Cleanup..."
  rm -rf code.material.angularjs.org

  echo "-- Successfully pushed the snapshot to angular/code.material.angularjs.org!!"
}

source $(dirname $0)/utils.inc
