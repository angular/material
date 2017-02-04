#!/bin/bash

# Bash Script to replace the current Angular version in the node modules.
# Accepts a version as an argument. The resolved version will be downloaded, extracted and replaced.

CDN="https://code.angularjs.org"
ANGULAR_FILES=(
  angular
  angular-animate
  angular-route
  angular-aria
  angular-messages
  angular-mocks
  angular-sanitize
  angular-touch
)

# The version will be specified from the first argument.
VERSION=$1

# Download the Angular repository for `find-max-versions` if not present.
if [ ! -e ./tmp/angular.js/.git ]; then
  # Cleanup potential broken repository files.
  rm -rf ./tmp/angular.js/
  git clone https://github.com/angular/angular.js ./tmp/angular.js
fi

# this will guarantee that we have the latest versions
# of AngularJS when testing material in case the HEAD
# of ./tmp/angular.js is outdated.
git --git-dir ./tmp/angular.js/.git fetch

# Determines the exact version name and the download URL.
if [ $VERSION == "snapshot" ]; then
  ZIP_FILE_SHA=$(curl "$CDN/snapshot/version.txt")
  ZIP_URL="$CDN/snapshot/angular-$ZIP_FILE_SHA.zip"
else
  LATEST_VERSION=$(node ./scripts/find-max-version.js $VERSION)
  if [ ! $LATEST_VERSION ]; then
    echo "Error: version "$VERSION" of angular does not exist..."
    exit 1
  fi

  VERSION=$LATEST_VERSION
  ZIP_FILE_SHA=$VERSION
  ZIP_URL="$CDN/$VERSION/angular-$VERSION.zip"
fi

ZIP_FILE="angular-$VERSION.zip"
ZIP_FILE_PATH="./tmp/$ZIP_FILE"
BASE_DIR="./tmp/angular-$VERSION"

# Downloads and extracts the resolved Angular version.
rm -rf $BASE_DIR
curl $ZIP_URL > $ZIP_FILE_PATH
unzip -q -d $BASE_DIR $ZIP_FILE_PATH
mv "$BASE_DIR/angular-$ZIP_FILE_SHA" "$BASE_DIR/files"

# Copies over all Angular files into the node modules.
for ANGULAR_FILE in "${ANGULAR_FILES[@]}"; do
  REPLACEMENT_FILE="$BASE_DIR/files/$ANGULAR_FILE.js"
  MIN_REPLACEMENT_FILE="$BASE_DIR/files/$ANGULAR_FILE.min.js"

  NODE_LIB_FILE="./node_modules/$ANGULAR_FILE/$ANGULAR_FILE.js"
  MIN_NODE_LIB_FILE="./node_modules/$ANGULAR_FILE/$ANGULAR_FILE.min.js"

  rm -f $NODE_LIB_FILE
  cp $REPLACEMENT_FILE $NODE_LIB_FILE
  echo "[copy] copied over $REPLACEMENT_FILE to $NODE_LIB_FILE"

  if [ -e $MIN_NODE_LIB_FILE ]; then
    rm $MIN_NODE_LIB_FILE
  fi

  if [ -e $MIN_REPLACEMENT_FILE ]; then
    cp $MIN_REPLACEMENT_FILE $MIN_NODE_LIB_FILE
  fi
  echo "[copy] copied over $MIN_REPLACEMENT_FILE to $MIN_NODE_LIB_FILE"
done