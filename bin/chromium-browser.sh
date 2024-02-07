#!/bin/sh

# exec /usr/lib64/chromium-browser/chromium-browser-original --disable-gpu --no-sandbox "$@"
exec /usr/bin/chromium-browser-original --disable-dev-shm-usage --disable-gpu --no-sandbox "$@"