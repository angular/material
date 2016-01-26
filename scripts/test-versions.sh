# the purpose of this file is to download
# assigned AngularJS source files and test
# them against this build of AngularMaterial.

# This works by pulling in all of the tags
# form angular.js, finding the highest version
# numbers for each branch (e.g. 1.3 => 1.3.X where
# X is the highest patch release). For each
# detected version it will then copy over each
# of the source files to the node_modules/angular-X
# folder and then run `gulp karma` to see if
# they pass. If there are one or more failed tests
# then this script will propagate a failed exit code

# [INPUT]
# just run `./scripts/test-versions.sh`

# [OUTPUT]
# an exit code of "0" (passing) or "1" (failing)

# [CONFIG VALUES]

# Available Options are: 1.X, 1.X.X, 1.X.X-(beta|rc).X or snapshot
VERSIONS=(1.3 1.4 1.5 snapshot)
BROWSERS="Firefox,Chrome,Safari"

#
# DO NOT EDIT PASSED THIS LINE 
#
CDN="https://code.angularjs.org"
FAILED=false
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

if [ ${#VERSIONS[@]} == 0 ]; then
  echo "Error: please specify one or more versions of AngularJS to test..."
  exit 1
fi;

if [ ! -e ./tmp ]; then
  mkdir -p ./tmp
fi

if [ ! -e ./tmp/angular.js ]; then
  git clone https://github.com/angular/angular.js ./tmp/angular.js
fi

# this will gaurantee that we have the latest versions
# of AngularJS when testing material incase the HEAD
# of ./tmp/angular.js is outdated.
git --git-dir ./tmp/angular.js/.git fetch

for VERSION in "${VERSIONS[@]}"; do
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

  BASE_DIR="./tmp/angular-$VERSION"

  if [ ! -d $BASE_DIR ]; then
    ZIP_FILE="angular-$VERSION.zip"
    ZIP_FILE_PATH="./tmp/$ZIP_FILE"

    curl $ZIP_URL > $ZIP_FILE_PATH
    unzip -d $BASE_DIR $ZIP_FILE_PATH
    mv "$BASE_DIR/angular-$ZIP_FILE_SHA" "$BASE_DIR/files"
  fi

  echo "\n\n--- Testing AngularMaterial against AngularJS (${VERSION}) ---\n"

  for ANGULAR_FILE in "${ANGULAR_FILES[@]}"; do
    REPLACEMENT_FILE="$BASE_DIR/files/$ANGULAR_FILE.js"
    MIN_REPLACEMENT_FILE="$BASE_DIR/files/$ANGULAR_FILE.min.js"

    NODE_LIB_FILE="./node_modules/$ANGULAR_FILE/$ANGULAR_FILE.js"
    MIN_NODE_LIB_FILE="./node_modules/$ANGULAR_FILE/$ANGULAR_FILE.min.js"

    rm $NODE_LIB_FILE
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

  echo "\n"
  node ./node_modules/gulp/bin/gulp.js karma --reporters='dots' --browsers=$BROWSERS
  LAST_EXIT_CODE=$?

  echo "\n\n--- Finished Testing AngularMaterial against AngularJS (${VERSION}) ---"

  if [ $LAST_EXIT_CODE == "1" ]; then
    echo "STATUS: FAILED"
    FAILED=true
  else
    echo "STATUS: SUCCESS"
  fi

  echo "\n\n"
done

if [ $FAILED == true ]; then
  echo "Error: One or more of the karma tests have failed..."
  exit 1
else 
  echo "All tests have passed successfully..."
fi
