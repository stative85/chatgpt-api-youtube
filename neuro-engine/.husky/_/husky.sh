#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  if [ "$HUSKY_DEBUG" = "1" ]; then
    set -x
  fi
  husky_skip_init=1
  . "$0" --internal "$@"
fi
