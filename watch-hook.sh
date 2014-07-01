#!/bin/bash

cd "$(dirname "$0")"

#
# spawns the hook, and restarts it if it goes down
#
# See: https://github.com/nodejitsu/forever
#
forever start -c bash start-hook.sh
