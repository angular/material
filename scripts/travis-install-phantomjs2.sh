#!/bin/bash

PHANTOMSJS2_PACKAGE="phantomjs-2.1.1-linux-x86_64.tar.bz2"
PHANTOMJS2_OUTPUT="phantomjs-2.1.1-linux-x86_64"

mkdir -p $HOME/travis-phantomjs

if [ ! -d $HOME/travis-phantomjs/${PHANTOMJS2_OUTPUT} ]; then
  wget https://bitbucket.org/ariya/phantomjs/downloads/${PHANTOMSJS2_PACKAGE} -O $HOME/travis-phantomjs/${PHANTOMSJS2_PACKAGE}

  tar -xvf ~/travis-phantomjs/${PHANTOMSJS2_PACKAGE} -C $HOME/travis-phantomjs
fi

export PHANTOMJS_BIN=$HOME/travis-phantomjs/${PHANTOMJS2_OUTPUT}/bin/phantomjs