#!/bin/bash
echo "Starting entrypoint.sh"
source /home/openiapuser/.sdkman/bin/sdkman-init.sh
# echo "JAVA PATH: $(which java)"
source /home/openiapuser/.bashrc
exec node --require ./dist/Logger.js dist/runagent.js