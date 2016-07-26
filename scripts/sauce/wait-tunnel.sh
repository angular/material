#!/bin/bash

# Wait for the tunnel to be ready.
while [ ! -e $SAUCE_READY_FILE ]; do
  sleep 1;
done

echo "Sauce Tunnel is now ready"